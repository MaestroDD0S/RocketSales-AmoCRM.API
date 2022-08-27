const fp = require( 'fastify-plugin' );

module.exports = fp( 

    async function( fastify, opts, next ) 
    {
        const redis = require( '$/extensions/redis' );

        fastify.decorate( 'redis', redis );

        fastify.addHook( 'onClose', () =>
            {
                redis?.quit();
            }
        );
    }
);