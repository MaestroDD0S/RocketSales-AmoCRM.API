const Redis = require( 'ioredis' );

const redis_config = 
{
    host    : env.REDIS_HOST, 
    password: env.REDIS_PASSWORD,
    port    : env.REDIS_PORT,
};

const redis = new Redis( redis_config );

module.exports = redis;