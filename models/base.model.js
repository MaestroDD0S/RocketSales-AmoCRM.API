const Knex      = require( 'knex' );
const pluralize = require( 'pluralize' );

const { Model } = require( 'objection' );

class BaseModel extends Model
{
    static initialize()
    {
        this.table_name = pluralize( this.toString().split( '(' || /s+/ )[ 0 ].split( ' ' || /s+/ )[ 1 ].toLowerCase() );
    }

    static get tableName() 
    {
        return  this.table_name;
    }

    static get useLimitInFirst() 
    {
        return  true;
    }
}

module.exports = BaseModel;