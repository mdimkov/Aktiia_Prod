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

        /* MDIMKOV 06.12.2022: this client script, triggering on [pageInit], [fieldChanged], deployed on [return authorization]
            is used as follows:
             - on [pageInit] sets the right quarantine locations on the Return Authorization
             - on [fieldChanged] sets the item on the line, as support staff only has access to a select number
                    of items via the [Item (Support)] field, so the value needs to be populated correct on the item field
             - on both [pageInit] and [fieldChanged] checks the header warehouse location and sets the locations on the lines to match it
        * */


        // MDIMKOV 06.03.2023: this function sets the line locations to match the header location; it's called from pageInit and fieldChanged
        function setLineLocations(rec, headerLocationId) {
            const iLineCount = rec.getLineCount({sublistId: 'item'});
            for (let i = 0; i < iLineCount; i++) {
                try {
                    rec.selectLine({
                        sublistId: 'item',
                        line: i
                    });

                    rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'inventorylocation',
                        value: headerLocationId
                    });

                    rec.commitLine({
                        sublistId: 'item'
                    });
                } catch (e) {
                }
            }
        }

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

                // MDIMKOV 06.12.2022: get the underlying sales order id
                const rec = currentRecord.get();
                const createdFromId = rec.getValue('createdfrom');

                if (!createdFromId) {
                    return;
                }


                // MDIMKOV 06.12.2022: get the location from the underlying transaction
                const soWareHouseId = _lib.getFieldValue('location', 'transaction', createdFromId, null, 'value');

                if (!soWareHouseId) {
                    return;
                }


                // MDIMKOV 06.12.2022: set the location on the Return Authorization;
                // NOTE: each Quarantine location's ID is the main location ID + 1 (may change in future)
                const quarantineWhId = +soWareHouseId + 1
                rec.setValue('location', quarantineWhId);


                // MDIMKOV 06.03.2023: set the line locations to match the header location:
                setLineLocations(rec, quarantineWhId);


                _lib.logGovernanceUsageRemaining('script end');
                log.audit('MDIMKOV', '--- pageInit END ---');
                log.audit('MDIMKOV', '');
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
            try {
                var currentRecord = context.currentRecord;
                var sublistName = context.sublistId;
                var fieldName = context.fieldId;

                if (sublistName === 'item' && fieldName === 'custcol_akt_item_support') {

                    log.debug('MDIMKOV', '[fieldChanged] item was selected, proceed');

                    const supportItemId = currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_akt_item_support'
                    });

                    if (supportItemId) {
                        // MDIMKOV 06.12.2022: find the original item id
                        const itemId = _lib.getFieldValue('custrecord_akt_itemid', 'customrecord_akt_item_support', supportItemId);

                        if (itemId) {
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: itemId
                            });
                        }
                    }
                }

                if (fieldName === 'location') {

                    // MDIMKOV 06.03.2023: set the line locations to match the header location:
                    const bodyLocationId = currentRecord.getValue('location');
                    if (bodyLocationId) {
                        setLineLocations(currentRecord, bodyLocationId);
                    }
                }


            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
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
            fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord
        };

    }
)
;
