const path        = require( 'path' );
const dotenv      = require( 'dotenv-extended'        );
const dotenv_vars = require( 'dotenv-parse-variables' );

const env = dotenv_vars( dotenv.load( 
    {
        path: path.join( __dirname, '.env' )
    } 
) );

module.exports = 
{
    development: 
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
            directory: path.join( __dirname, '/database/migrations' )
        },

        seeds: 
        {
            directory: path.join(__dirname, '/database/seeds' )
        }
    }
};
