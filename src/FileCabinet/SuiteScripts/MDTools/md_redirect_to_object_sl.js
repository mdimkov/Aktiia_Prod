/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/redirect', './_lib'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{redirect} redirect
     * @param{_lib} _lib
     */
    (record, search, redirect, _lib) => {

        /* MDIMKOV 02.04.2022: this suitelet, used as an internal tool, performs the following:
        *   - is being called from the WIP file or any other reference to a NetSuite object
        *   - the calling link contains an object ID, such as 'customrecord_pdg_pmtintegr'
        *   - based on the object ID, the internal ID is being found
        *   - finally, the user is being redirected to the object definition itself, e.g. to the custom record in this example
        *   - if no ID is found, the user will be redirected to the respective object type list (e.g. list of UE scripts)
        *   - additionally, the user may be providing directly the 'internalid=' parameter, so that redirect is being directly performed
        *   - the following URL parameters are being passed from the external application (e.g. from bookmark manager):
        *       > objecttype -- can be anything like 'customscript_', 'custbody_' etc.; defines the right search to be performed and URL to be built
        *       > id -- this is the object ID for which the internal ID needs to be found, e.g. 'customrecord_pdg_pmtintegr'
        *       > internalid -- if the internal ID is already known, it's passed here; in this case, a direct redirect is perfomed (no searching)
        * */

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} context
         * @param {ServerRequest} context.request - Incoming request
         * @param {ServerResponse} context.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (context) => {
            try {
                log.debug('MDIMKOV', '--- SCRIPT START ---');

                // MDIMKOV 04.04.2022: get the parameters from the URL
                const paramsJson = context.request.parameters;
                const paramsString = JSON.stringify(paramsJson);

                const objecttype = paramsJson['objecttype'];
                const id = paramsJson['id'];
                const internalid = paramsJson['internalid'];

                // MDIMKOV 03.04.2022: this is the internal ID of the object that needs to be found, in order to redirect to the object
                let objectInternalId = internalid ? +internalid : 0;


                // MDIMKOV 03.04.2022: dictionary to hold the base URLs to redirect to object, based on 'objecttype' parameter
                const objectTypeUrlDict = {
                    'custevent_': 'common/custom/eventcustfield.nl?e=T&id=',
                    'custentity_': 'common/custom/entitycustfield.nl?e=T&id=',
                    'custitem_': 'common/custom/itemcustfield.nl?e=T&id=',
                    'custrecord_': 'common/custom/othercustfield.nl?e=T&id=',
                    'custbody_': 'common/custom/bodycustfield.nl?e=T&id=',
                    'custcol_': 'common/custom/columncustfield.nl?e=T&id=',
                    'customlist_': 'common/custom/custlist.nl?e=T&id=',
                    'customrecord_': 'common/custom/custrecord.nl?e=T&id=',
                    'customsearch_': 'common/search/searchresults.nl?searchid=',
                    'customscript_': 'common/scripting/script.nl?selectedtab=scriptdeployments&id=',
                    'customworkflow_': 'common/workflow/setup/nextgen/workflowdesktop.nl?e=T&id='
                };


                // MDIMKOV 03.04.2022: dictionary holds the base URLs to redirect to lists (if ID not found), based on 'objecttype' parameter
                const listTypeUrlDict = {
                    'custevent_': 'common/custom/eventcustfields.nl',
                    'custentity_': 'common/custom/entitycustfields.nl',
                    'custitem_': 'common/custom/itemcustfields.nl',
                    'custrecord_': 'common/custom/othercustfields.nl',
                    'custbody_': 'common/custom/bodycustfields.nl',
                    'custcol_': 'common/custom/columncustfields.nl',
                    'customlist_': 'common/custom/custlists.nl',
                    'customrecord_': 'common/custom/custrecords.nl',
                    'customsearch_': 'common/search/savedsearchlist.nl',
                    'customscript_': 'common/scripting/scriptlist.nl',
                    'customworkflow_': 'common/workflow/setup/workflowlist.nl'
                };


                // MDIMKOV 03.04.2022: dictionary holds input-param-to-record-type pairs (only record type, search and scripts are valid)
                const recTypeDict = {
                    'customrecord_': 'customrecordtype',
                    'customsearch_': 'savedsearch',
                    'customscript_': 'script',
                    'customlist_': 'customlist'
                };
                const recType = recTypeDict[objecttype];

                // MDIMKOV 03.04.2022: in case the internal id was not passed, search the record type and find it
                if (!objectInternalId) {
                    var recordSearch = search.create({
                        type: recType,
                        filters: [
                            [(recType == 'savedsearch') ? 'id' : 'scriptid', 'is', id]
                        ],
                        columns: [
                            search.createColumn({name: 'internalid'})
                        ]
                    });
                    recordSearch.run().each(function (result) {
                        objectInternalId = result.id;
                        return false; // should only be one record
                    });
                }

                // MDIMKOV 03.04.2022: if an object internal id is found, redirect the user respectively
                if (objectInternalId) {
                    redirect.redirect({
                        url: _lib.constructURL(objectTypeUrlDict[objecttype], objectInternalId)
                    });
                } else {
                    // MDIMKOV 03.04.2022: if the internal id is not found (or passed), redirect user to the list of the resp. object type
                    redirect.redirect({
                        url: _lib.constructURL(listTypeUrlDict[objecttype])
                    });
                }

                log.debug('MDIMKOV', '--- SCRIPT END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        return {onRequest}

    });
