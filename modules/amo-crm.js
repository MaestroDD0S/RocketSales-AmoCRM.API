const fp    = require( 'fastify-plugin' );
const axios = require( 'axios' ).default;

const { serializeQuery, delay } = require( '$/extensions/utils' );
const redis                     = require( '$/extensions/redis' );

const baseURL = env.AMOCRM_HOST;

const oauth2Params =
{
    client_id    : env.AMOCRM_CLIENT_ID,
    client_secret: env.AMOCRM_CLIENT_SECRET,
    grant_type   : "refresh_token",
    redirect_uri : env.AMOCRM_REDIRECT_URI
};

class AmoCRM
{
    redis_prefix = 'amo-crm';

    constructor()
    {
        this.axios = axios.create(
            {
                baseURL,
                timeout: 15000,

                headers: 
                {
                    "Content-Type": "application/json",
                }
            }
        );

        this.createAxiosResponseInterceptor();
        this.createAxiosRequestInterceptor();
    }

    async syncTokens()
    {
        const [ access_token, refresh_token ] = await Promise.all( 
            [ 
                redis.get( `${this.redis_prefix}.access-token`  ), 
                redis.get( `${this.redis_prefix}.refresh-token` ) 
            ] 
        );

        this.AccessToken  = access_token  || env.AMOCRM_ACCESS_TOKEN;
        this.RefreshToken = refresh_token || env.AMOCRM_REFRESH_TOKEN;
    }

    get AccessToken()
    {
        return  this._access_token;
    }

    get RefreshToken()
    {
        return  this._refresh_token;
    }

    set AccessToken( token )
    {
        redis.set( `${this.redis_prefix}.access-token`, ( this._access_token = token ) );
    }

    set RefreshToken( token )
    {
        const new_token = ( this._refresh_token = token );

            redis.set( `${this.redis_prefix}.refresh-token`, new_token );

        oauth2Params.refresh_token = new_token;
    }

    createAxiosRequestInterceptor() 
    {
        this.axios.interceptors.request.use( ( config ) =>
            {
                const token = this._access_token;

                    config.headers.Authorization =  token ? `Bearer ${token}` : '';

                return config;
            }
        );
    }

    createAxiosResponseInterceptor() 
    {
        const interceptor = this.axios.interceptors.response.use(

            ( response ) => 
            {
                return  response;
            },

            ( error ) => 
            {
                console.log( error );

                if( error.response.status !== 401 ) 
                {
                    return  Promise.reject( error );
                }

                this.axios.interceptors.response.eject( interceptor ); //attach to avoid infinity loop

                return  this.axios.post( '/oauth2/access_token', oauth2Params )

                .then( ( response ) => 
                    {
                        this.AccessToken  = response.data.access_token;
                        this.RefreshToken = response.data.refresh_token;
                        
                            error.response.config.headers[ 'Authorization' ] = 'Bearer ' + this.AccessToken;
                            error.response.config.method = 'post';

                        return  this.axios( error.response.config );
                    }
                )
                .catch( ( error ) => 
                    {
                        return Promise.reject( error );
                    }
                )
                .finally( () => 
                    {
                        this.createAxiosResponseInterceptor();
                    } 
                );
            }
        );
    }

    async get( url, params = {}, cache_uuid = '', callback = null, ttl = 600 )
    {
        let real_cache_uuid = `${this.redis_prefix}.${cache_uuid}`;
        let result          = null;

        if( cache_uuid )
        {
            const cached_result = await redis.get( real_cache_uuid );

            if( cached_result )
            {
                result = JSON.parse( cached_result );
            }
        }

        if( !result )
        {
            const query_params = serializeQuery( params );
            const response     = await this.axios.get( `/api/v4/${url}?${query_params}` );

            result = callback ? callback( response.data ) : response.data;

            if( cache_uuid )
            {
                await redis.set( real_cache_uuid, JSON.stringify( result ), 'ex', ttl );
            }
        }

        return  result;
    }
}

module.exports = fp( 

    async function( fastify, opts ) 
    {
        fastify.decorate( 'amoCRM', new AmoCRM() );

        fastify.ready( async ( error_msg ) => 
            {
                await fastify.amoCRM.syncTokens();
            }
        );
    }
);

