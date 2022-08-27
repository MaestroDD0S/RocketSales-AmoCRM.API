const path        = require( 'path' );
const dotenv      = require( 'dotenv-extended'        );
const dotenv_vars = require( 'dotenv-parse-variables' );

const env = dotenv_vars( dotenv.load( 
    {
        path: path.join( __rootdir, '.env' )
    } 
) );

module.exports = ( global.env = env );