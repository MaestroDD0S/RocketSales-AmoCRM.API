const fp = require( 'fastify-plugin' );

const fs   = require( 'fs-extra' );
const path = require( 'path' );
const Knex = require( 'knex' );

const { Model, knexSnakeCaseMappers } = require( 'objection' );

module.exports = fp( 

    async function( fastify, opts ) 
    {
        const knex = Knex(
            {
                client: env.DB_CONNECTION,
                debug : env.FASTIFY_DEBUG,

                connection: 
                {
                    host: env.DB_HOST,
                    port: env.DB_PORT,

                    user: env.DB_USERNAME,
                    password: env.DB_PASSWORD,

                    database: env.DB_DATABASE,
                    charset: 'utf8'
                },

                pool: 
                { 
                    min: 0, 
                    max: env.DB_POOL_CONNECTIONS 
                },

                migrations: 
                {
                    directory: path.join( __rootdir, '/database/migrations' )
                },

                seeds: 
                {
                    directory: path.join( __rootdir, '/database/seeds' )
                },

                ...knexSnakeCaseMappers()
            }
        );

        Model.knex( knex );

        fs.readdirSync( `${__rootdir}/models` ).forEach( ( file ) =>
            {
                require( `$/models/${file}` ).initialize();
            } 
        );

        fastify.decorate( 'knex', knex );

        fastify.addHook( 'onClose', async () => 
            {
                knex.destroy();
            }
        );
    }
);

