/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/currentRecord', 'SuiteScripts/_Libraries/_lib.js'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{currentRecord} currentRecord
     * @param{_lib} _lib
     */
    (record, search, currentRecord, _lib) => {

        /* MDIMKOV 16.12.2022: This script, deployed on Cash Refund, triggering on pageInit, does the following:
         - checks if an underlying (calling) transaction exists and if it is a Return Authorization
         - if so, searches for Return Authorization's underlying transaction and checks if it is a Sales Order
         - if so, pre-populates the shipping method the underlying Sales Order
        * */

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(context) {
            try {
                log.audit('MDIMKOV', '--- pageInit START ---');
                log.debug('MDIMKOV', 'context.mode: ' + context.mode);

                if (context.mode === 'create' || context.mode === 'copy') {
                    log.debug('MDIMKOV', 'record in create/copy mode, proceed... ');

                    // MDIMKOV 19.12.2022: find the underlying transaction (should be a return authorization)
                    const rec = currentRecord.get();
                    const createdFromRmaId = rec.getValue('createdfrom');
                    log.debug('MDIMKOV', '... createdFromRmaId: ' + createdFromRmaId);


                    // MDIMKOV 19.12.2022: find the return authorization's underlying transaction (should be a sales order)
                    if (createdFromRmaId) {
                        const createdFromSoId = _lib.getFieldValue('createdfrom', 'transaction', createdFromRmaId, null, 'value');
                        log.debug('MDIMKOV', '... createdFromSoId: ' + createdFromSoId);

                        if (createdFromSoId) {
                            const shippingMethodId = _lib.getFieldValue('shipmethod', 'transaction', createdFromSoId, null, 'value');
                            const shippingCost = _lib.getFieldValue('shippingcost', 'transaction', createdFromSoId);
                            const accountId = _lib.getFieldValue('custbody_akt_dep_acct', 'transaction', createdFromSoId, null, 'value');
                            log.debug('MDIMKOV', '... shippingMethodId: ' + shippingMethodId);
                            log.debug('MDIMKOV', '... shippingCost: ' + shippingCost);
                            log.debug('MDIMKOV', '... accountId: ' + accountId);

                            if (shippingMethodId) {
                                rec.setValue('shipmethod', shippingMethodId);
                            }

                            if (shippingMethodId) {
                                rec.setValue('shippingcost', shippingCost);
                            }

                            if (accountId) {
                                rec.setValue('account', accountId);
                            }
                        }
                    }
                }

                log.audit('MDIMKOV', '--- pageInit END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.sublistId - Sublist name
         * @param {string} context.fieldId - Field name
         * @param {number} context.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(context) {

        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.sublistId - Sublist name
         * @param {string} context.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(context) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(context) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(context) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.sublistId - Sublist name
         * @param {string} context.fieldId - Field name
         * @param {number} context.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} context.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(context) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(context) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(context) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @param {string} context.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(context) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} context
         * @param {Record} context.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(context) {

        }

        return {
            pageInit: pageInit,
            // fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord
        };

    });
