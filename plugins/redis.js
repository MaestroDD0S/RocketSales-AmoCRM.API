const fp = require( 'fastify-plugin' );

module.exports = fp( 

    async function( fastify, opts ) 
    {
        // await fastify.register( require( '@fastify/redis' ), 
        //     {
        //         host    : env.REDIS_HOST, 
        //         password: env.REDIS_PASSWORD,
        //         port    : env.REDIS_PORT,
        //     }
        // );
    }
);