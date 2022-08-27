const fp = require( 'fastify-plugin' );

module.exports = fp( 

    async function( fastify, opts ) 
    {
        await fastify.register( require( '@fastify/sensible' ), 
            {
                errorHandler: false
            }
        );
    }
);