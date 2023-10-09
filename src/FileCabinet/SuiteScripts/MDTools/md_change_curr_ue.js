/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/https', 'N/url', 'N/ui/message'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{https} https
     * @param{url} url
     * @param{message} message
     */
    (record, search, https, url, message) => {

        /* MDIMKOV 12.05.2023: this UE script, deployed on any transaction type needed, firing on [afterSubmit] and [beforeLoad], does the following:
        *
        *   - on [afterSubmit]:
        *      - on the transaction, for which it's being run, checks for a custom field [custbody_md_switch_currency]
        *      - if the field has value in it, [afterSubmit] fires and tries to change the transaction currency to the one chosen
        *      - the result (success / failure + error message) is being written into a hidden field called [custbody_md_switch_curr_msg]
        *
        *   - on [beforeLoad]
        *      - if standard currency field and new currency field have the same value, raises preLoad success message
        *      - if not, reads text in [custbody_md_curr_error] raises warning to tell the user why it has not been changed
        *      - finally, calls a background suitelet [md_change_curr_sl.js] to clear both fields (as [beforeLoad] events cannot save the record
        * */


        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} context
         * @param {Record} context.newRecord - New record
         * @param {string} context.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} context.form - Current form
         * @param {ServletRequest} context.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (context) => {
            try {
                log.audit('MDIMKOV', '');
                log.audit('MDIMKOV', '--- beforeLoad START ---');


                // MDIMKOV 12.05.2023: finally, clear both fields
                const rec = record.load({
                    type: context.newRecord.type,
                    id: context.newRecord.id,
                    defaultValues: {
                        disabletriggers: true
                    }
                });

                // MDIMKOV 12.05.2023: check if either the [Switch Currency] or the [... message] fields have a value, if not, exit the script
                const newCurrencyId = rec.getValue('custbody_md_switch_currency');
                const messageText = rec.getValue('custbody_md_switch_curr_msg');
                const oldCurrencyId = rec.getValue('currency');

                if (!newCurrencyId && !messageText) {
                    log.debug('MDIMKOV', 'no new currency and no error message, exiting script...');
                    return;
                }


                // MDIMKOV 12.05.2023: if there is a value in the message field, read it and display it as a warning message:
                if (messageText) {
                    context.form.addPageInitMessage({
                        title: 'Warning: Currency has not been switched.',
                        message: messageText,
                        type: message.Type.WARNING,
                        duration: 10000
                    });
                }


                // MDIMKOV 12.05.2023: if there is a value in the message field, read it and display it as a warning message:
                if (newCurrencyId && newCurrencyId === oldCurrencyId) {
                    context.form.addPageInitMessage({
                        title: 'Currency successfully switched.',
                        message: '',
                        type: message.Type.INFORMATION,
                        duration: 10000
                    });
                }


                // MDIMKOV 12.05.2023: finally, call the suitelet that will clear the values in both fields (as beforeLoad cannot do that)
                log.debug('MDIMKOV', 'call suitelet to clear both fields');

                const arrParams = {
                    transType: context.newRecord.type,
                    transId: context.newRecord.id
                };

                const suiteletURL = url.resolveScript({
                    scriptId: 'customscript_md_change_curr_sl',
                    deploymentId: 'customdeploy_md_change_curr_sl',
                    returnExternalUrl: true,
                    params: arrParams
                });

                log.debug('getSuiteletData.suiteletURL', suiteletURL);
                return https.get({url: suiteletURL});


                log.audit('MDIMKOV', '--- beforeLoad END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} context
         * @param {Record} context.newRecord - New record
         * @param {Record} context.oldRecord - Old record
         * @param {string} context.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (context) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} context
         * @param {Record} context.newRecord - New record
         * @param {Record} context.oldRecord - Old record
         * @param {string} context.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (context) => {
            try {

                // MDIMKOV 12.05.2023: when the record is being deleted, exit the script
                if (context.type === context.UserEventType.DELETE) {
                    return;
                }


                // MDIMKOV 12.05.2023: start script execution
                log.audit('MDIMKOV', '');
                log.audit('MDIMKOV', '--- beforeLoad START ---');


                // MDIMKOV 12.05.2023: load record
                log.debug('MDIMKOV', 'check if there is any value in the [Switch Currency] field');
                const rec = record.load({
                    type: context.newRecord.type,
                    id: context.newRecord.id
                });

                if (!rec) {
                    log.debug('MDIMKOV', 'could not load record, exiting script...');
                    return;
                }


                // MDIMKOV 12.05.2023: check if the [Switch Currency] field has value, if not, exit the script
                const newCurrencyId = rec.getValue('custbody_md_switch_currency');

                if (!newCurrencyId) {
                    log.debug('MDIMKOV', 'the Switch Currency field has no value, exiting script...');
                    return;
                }


                // MDIMKOV 12.05.2023: try to set [Switch Currency] value into main currency field, if not, update the error message field respectively
                try {
                    rec.setValue('currency', newCurrencyId);
                    rec.save({'disableTriggers': true});
                    log.debug('MDIMKOV', 'SUCCESS: the currency has been changed');
                } catch (e) {
                    log.debug('MDIMKOV', 'FAILURE: the currency has not been changed: ' + e.message + ' --- ' + e.stack);
                    log.debug('MDIMKOV', 'update the [Switch Currency Message] field');

                    const newRec = record.load({
                        type: context.newRecord.type,
                        id: context.newRecord.id
                    });

                    newRec.setValue('custbody_md_switch_curr_msg', e.message);

                    newRec.save();
                }


                log.audit('MDIMKOV', '--- beforeLoad END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
