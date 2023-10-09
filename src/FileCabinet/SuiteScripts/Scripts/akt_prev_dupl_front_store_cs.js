/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'SuiteScripts/_Libraries/_lib.js', 'N/ui/dialog', 'N/currentRecord'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{_lib} _lib
     * @param{dialog} dialog
     * @param{currentRecord} currentRecord
     */
    (record, search, _lib, dialog, currentRecord) => {

        /* MDIMKOV 25.09.2023: This script, deployed on [Sales Order], firing on [saveRecord], does the following:
             - checks if there is an existing sales order, for which the same store front number has already been given
             - uses the library file to call the preventDuplicateValue() function
             - raises an error message in case this is the fact
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
                log.audit('MDIMKOV', '--- SCRIPT START ---');

                const rec = currentRecord.get();
                const internalId = rec.id;
                const storeFrontNumber = rec.getValue('custbody_nbs702_storefront_order');
                log.audit('MDIMKOV', 'storeFrontNumber: ' + storeFrontNumber);

                if (storeFrontNumber && _lib.preventDuplicateValue('salesorder', storeFrontNumber, 'custbody_nbs702_storefront_order', internalId)) {
                    dialog.alert({
                        title: 'Duplicate Detected',
                        message: 'This store front number was already used, please use a different one.'
                    });

                    return false;
                } else {
                    return true;
                }

                _lib.logGovernanceUsageRemaining('script end');
                log.audit('MDIMKOV', '--- SCRIPT END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
                return true;
            }
        }

        return {
            // pageInit: pageInit,
            // fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            saveRecord: saveRecord
        };

    });
