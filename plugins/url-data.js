const fp = require( 'fastify-plugin' );

module.exports = fp( 

    async function( fastify, opts ) 
    {
        await fastify.register( require( '@fastify/url-data' ), 
            {
                /* --- */
            }
        );
    }
);

