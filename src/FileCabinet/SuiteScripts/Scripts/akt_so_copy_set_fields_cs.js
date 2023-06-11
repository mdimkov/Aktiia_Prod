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

        /* MDIMKOV 03.02.2023: This CS script, deployed on [sales order] performs the following:
             - checks if the sales order is created as a copy of a previous one
             - when this is true, then it sets some values:
             - sets the inventory locations on the line to be in-line with the header inventory location (also triggers on saveRecord if SO is in CREATE mode)
             - unchecks some checkboxes on the [3PL Integration] subtab
             - sets all line rates to equal zero
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

                // MDIMKOV 03.02.2023: on load, if the URL contains 'memdoc', then this is a copy of a sales order
                if (context.mode == 'copy' && window.location.href.indexOf('memdoc') !== -1) {

                    log.debug('MDIMKOV', 'This sales order is a copy of an existing transaction. Proceed...');

                    const rec = context.currentRecord;
                    const iLineCount = rec.getLineCount({sublistId: 'item'});
                    const headerLocationId = rec.getValue('location');
                    log.debug('MDIMKOV', 'headerLocationId: ' + headerLocationId);


                    // MDIMKOV 03.02.2023: set the rates on the lines on the newly-created sales order to zero; set the WH to equal the header WH
                    for (let i = 0; i < iLineCount; i++) {
                        rec.selectLine({
                            sublistId: 'item',
                            line: i
                        });

                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: 0,
                            forceSyncSourcing: true
                        });

                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'inventorylocation',
                            value: +headerLocationId,
                            forceSyncSourcing: true
                        });

                        rec.commitLine({sublistId: 'item'});
                    }


                    // MDIMKOV 03.02.2023: uncheck some of the checkboxes on the [3PL Integration] subtab, so that the SO is again subject to integration
                    rec.setValue('custbody_akt_ogl_sent_to_3pl', false);
                    rec.setValue('custbody_akt_flg_sent_to_3pl', false);
                    rec.setValue('custbody_akt_kin_sent_to_3pl', false);
                    rec.setValue('custbody_akt_ogl_webhook_sent', false);
                    rec.setValue('custbody_akt_ok_for_3pl', false);
                    rec.setValue('custbody_akt_3plfulfilled', false);
                    rec.setValue('custbody_akt_ogl_3pl_order_id', null);

                }


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

            try {
                if (context.mode != 'create') {
                    log.audit('MDIMKOV', '--- saveRecord START ---');

                    const rec = context.currentRecord;
                    const iLineCount = rec.getLineCount({sublistId: 'item'});
                    const headerLocationId = rec.getValue('location');
                    log.debug('MDIMKOV', 'headerLocationId: ' + headerLocationId);


                    // MDIMKOV 10.04.2023: set the WH to equal the header WH
                    for (let i = 0; i < iLineCount; i++) {
                        rec.selectLine({
                            sublistId: 'item',
                            line: i
                        });

                        const lineWhLocation = rec.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'inventorylocation'
                        });

                        if (!lineWhLocation) {
                            rec.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'inventorylocation',
                                value: +headerLocationId,
                                forceSyncSourcing: true
                            });
                        }

                        rec.commitLine({sublistId: 'item'});
                    }

                    log.audit('MDIMKOV', '--- saveRecord END ---');
                }
                return true;
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
                return true;
            }
        }

        return {
            pageInit: pageInit,
            //		fieldChanged: fieldChanged,
            //		postSourcing: postSourcing,
            //		sublistChanged: sublistChanged,
            //		lineInit: lineInit,
            //		validateField: validateField,
            //		validateLine: validateLine,
            //		validateInsert: validateInsert,
            //		validateDelete: validateDelete,
            saveRecord: saveRecord
        };

    });
