function serializeQuery( params, prefix ) 
{
    const query = Object.keys( params ).map( ( key ) => 
    {
        const value = params[key];

        if( params.constructor === Array )
        {
            key = `${prefix}[]`;
        }
        else if( params.constructor === Object )
        {
            key = (prefix ? `${prefix}[${key}]` : key);
        }

        if (typeof value === 'object')
        {
            return serializeQuery( value, key );
        }
        else
        {
            return `${key}=${encodeURIComponent(value)}`;
        }
    } 
    );

    return [].concat.apply( [], query ).join( '&' );
}

module.exports.isobject = function( val )
{
    return  typeof val === 'object' && val !== null;
}

module.exports.isstring = function( val )
{
    return  typeof val === 'string';
}

module.exports.isnumber = function( val )
{
    return  !isNaN( val ) && val != null;
}

module.exports.inrange = function( val, min, max )
{
    return  min <= val && val <= max;
}

module.exports.clone = function( object )
{
    return  JSON.parse( JSON.stringify( object ) );
}

module.exports.randint = function( min, max )
{
    return  Math.round( min - 0.5 + Math.random() * ( max - min + 1 ) );
}

module.exports.capitalizeFirstLetter = function( string )
{
    return  string.charAt( 0 ).toUpperCase() + string.slice( 1 );
}

module.exports.debounce = function( callback, delay = 500 )
{
    let timer_id;

    return function()
    {
        let args = arguments;

        clearTimeout( timer_id );

        timer_id = setTimeout( () =>
            {
                callback.apply( this, args );
            },
            delay
        );
    }
}

module.exports.delay = function( ms )
{
    return  new Promise( res => setTimeout( res, ms ) );
}

module.exports.defaultDateFormat = function( date )
{
    return  date?.toISOString().split( 'T' )[ 0 ];
}

module.exports.findByID = function( arr, id )
{
    return  arr?.find( ( el ) => el.id == id );
}

module.exports.mapID = function( arr )
{
    return  arr?.map( ( el ) => el.id );
}

module.exports.serializeQuery = serializeQuery;