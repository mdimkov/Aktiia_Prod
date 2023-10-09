/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record'],
    /**
     * @param{record} record
     */
    (record) => {

        /* MDIMKOV 12.05.2023: this suitelet is being called by the [md_change_curr_ue.js] script
        *   - consult the [md_change_curr_ue.js] for information on why it is being called and what it is doing
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
                log.audit('MDIMKOV', '--- SCRIPT START ---');

                if (context.request.method === 'GET') {
                    const transType = context.request.parameters.transType;
                    const transId = context.request.parameters.transId;

                    const rec = record.load({
                        type: transType,
                        id: transId
                    });

                    rec.setValue('custbody_md_switch_currency', '');
                    rec.setValue('custbody_md_switch_curr_msg', '');

                    rec.save();
                }

                log.audit('MDIMKOV', '--- SCRIPT END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        return {onRequest}

    });
