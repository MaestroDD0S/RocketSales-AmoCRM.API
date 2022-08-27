module.exports.date = () =>
(
    {
        type  : 'string',
        format: 'date'
    }
);

module.exports.daterange = () =>
(
    { 
        type: 'array',

        minItems: 2,
        maxItems: 2,

        items: 
        { 
            type  : 'string',
            format: 'date'
        }
    }
);

module.exports.email = () =>
(
    {
        type  : 'string',
        allOf: 
        [
            { transform: [ 'trim' ] },
            { format   : 'email'    },
            { maxLength: 128        },
        ]
    }
);

module.exports.password = () =>
(
    {
        type: 'string',
        allOf: 
        [
            { transform: [ 'trim' ]           },
            { minLength: env.PASSWORD_MIN_LEN },
            { maxLength: env.PASSWORD_MAX_LEN },
        ]
    }
);

module.exports.integer = ( min, max ) =>
(
    {
        type   : 'integer', 
        minimum: min, 
        maximum: max, 
    }
);

module.exports.string = ( min_len = 0, max_len = 128 ) =>
(
    {
        type: 'string',
        allOf: 
        [
            { transform: [ 'trim' ] },
            { minLength: min_len    },
            { maxLength: max_len    },
        ]
    }
);

module.exports.age = () =>
(
    {
        type   : 'integer', 
        minimum: 18, 
        maximum: 99, 
    }
);
