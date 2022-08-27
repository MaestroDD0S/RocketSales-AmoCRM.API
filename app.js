/* --------------------------------------------------------------------- */
/*                                                                       */
/**/                    global.__rootdir = __dirname;                  /**/     
/*                                                                       */
/* --------------------------------------------------------------------- */

const path     = require( 'path' );
const AutoLoad = require( '@fastify/autoload' );

const env = require( '$/extensions/dotenv' );

module.exports = async ( fastify, options ) => 
{
    const folders = [ 'plugins', 'modules', 'routes' ];

    for( let i = 0; i < folders.length; i++ )
    {
        await fastify.register( AutoLoad, 
            {
                dir    : path.join( __dirname, folders[ i ] ),
                options: { ...options },
                routeParams: true
            }
        );
    }

    fastify.ready( async ( error_msg ) => 
        {
            console.log( '-----------------------------------------\n' );

                console.log( fastify.printRoutes() );

            console.log( '-----------------------------------------' );
        }
    );
}

