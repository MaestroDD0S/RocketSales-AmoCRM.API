const { findByID } = require( '$/extensions/utils' );

const computeRawPipelineStatus = ( statuses, raw_status ) =>
{
    statuses[ raw_status.id ] =
    {
        id   : raw_status.id, 
        name : raw_status.name,
        color: raw_status.color,
    };

    return  statuses;
}

const computeRawUser = ( users, raw_user ) =>
{
    users[ raw_user.id ] =
    {
        id  : raw_user.id,
        name: raw_user.name
    };

    return  users;
}

const computeRawPipeline = ( pipelines, raw_pipeline ) => 
{
    pipelines[ raw_pipeline.id ] = 
    {
        id      : raw_pipeline.id,
        name    : raw_pipeline.name,
        statuses: raw_pipeline._embedded?.statuses?.reduce( computeRawPipelineStatus, {} )
    }

    return  pipelines;
}

const computeRawLead = ( raw_lead, users, pipelines ) =>
(
    {
        id  : raw_lead.id,
        name: raw_lead.name,
        price: raw_lead.price,
        created_at: raw_lead.created_at,

        tags: raw_lead._embedded?.tags,

        //status: findByID( findByID( pipelines, raw_lead.pipeline_id )?.statuses, raw_lead.status_id ) || {},  -----> oh no, x2 find, change to object[key]

        status          : ( pipelines[ `${raw_lead.pipeline_id}` ]?.statuses?.[ `${raw_lead.status_id}` ] || {} ),
        responsible_user: ( users[ `${raw_lead.responsible_user_id}` ] || {} ),

        contacts: raw_lead._embedded?.contacts?.map( ( contact ) => contact.id )
    }
);

const mergeLeadsWithRawContacts = ( leads, raw_contacts ) =>
{
    const contacts = raw_contacts._embedded?.contacts;

    leads.forEach( ( lead ) => 
        {
            lead.contacts = lead.contacts?.map( ( contact_id ) => 
                {
                    const raw_contact = findByID( contacts, contact_id );
                    
                    const contact = 
                    {
                        id  : contact_id,
                        name: raw_contact.name,

                        //TODO change this to normal array with multiple values

                        phone: raw_contact.custom_fields_values.find( ( item ) => item.field_code.toLowerCase() == 'phone' )?.values?.[ 0 ]?.value, 
                        email: raw_contact.custom_fields_values.find( ( item ) => item.field_code.toLowerCase() == 'email' )?.values?.[ 0 ]?.value,
                    };

                    return  contact;
                } 
            );
        }
    );
}

module.exports = async ( fastify, opts ) =>
{
    fastify.get( '', async ( request, reply ) => 
        {
            const { query: { query = '', page = 0x1, limit = 25 } } = request;

                const raw_leads = await fastify.amoCRM.get( 'leads', { page, limit, with: 'contacts' } );

                const users = await fastify.amoCRM.get( 'users', { limit: 250 }, 'users', ( data ) =>
                    {
                        return  data._embedded?.users?.reduce( computeRawUser, {} );
                    } 
                );

                const pipelines = await fastify.amoCRM.get( 'leads/pipelines', {}, 'pipelines', ( data ) =>
                    {
                        return  data._embedded?.pipelines?.reduce( computeRawPipeline, {} ); 
                    } 
                );

                const leads       = raw_leads._embedded?.leads?.map( ( raw_lead ) => computeRawLead( raw_lead, users, pipelines ) ) || [];
                const contact_ids = leads.reduce( ( ids, lead ) => lead.contacts.reduce( ( ids, id ) => ids.add( id ), ids ), new Set() );

                const raw_contacts = await fastify.amoCRM.get( 'contacts', { filter: { id: Array.from( contact_ids ) } } );

                mergeLeadsWithRawContacts( leads, raw_contacts );

            return { raw_contacts, rows: leads, pagination: { page: raw_leads._page, limit } };
        }
    );
}
