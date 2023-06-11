/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/search'],
    /**
     * @param{currentRecord} currentRecord
     * @param{record} record
     * @param{search} search
     */

    /*
    * MDIMKOV 11.04.2023: This client script, deployed on [Vendor Bill] and [Expense Report], triggering on [saveRecord], performs the following:
     - checks if the [Entity Bank (Vendor) / (Employee)] is empty
     - if yes, script executes
     - finds the primary bank details for this vendor / employee
     - sets the value in the field
    * */

    function (currentRecord, record, search) {

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
                log.audit('MDIMKOV', '--- saveRecord START ---');

                const rec = currentRecord.get();

                // MDIMKOV 10.04.2023: find the parent vendor
                const entityId = rec.getValue('entity');


                // MDIMKOV 03.05.2023: check if the value in the EFT field is empty; if not, do not execute the script
                const currentBillEftId = rec.getValue('custbody_15529_vendor_entity_bank');
                const currentExpRepEftId = rec.getValue('custbody_15529_emp_entity_bank');

                log.debug('MDIMKOV', 'currentBillEftId: ' + currentBillEftId);
                log.debug('MDIMKOV', 'currentExpRepEftId: ' + currentExpRepEftId);

                if (currentBillEftId || currentExpRepEftId) {
                    log.debug('MDIMKOV', 'There is a value in the EFT field. Exit the script...');
                    return true;
                }


                // MDIMKOV 11.04.2023: build the filters based on whether this is a vendor bill or an expense report
                let filters = [];

                if (rec.type === 'expensereport') {
                    filters = [
                        ['custrecord_2663_parent_employee', 'anyof', entityId],
                        'AND',
                        ['custrecord_2663_entity_bank_type', 'anyof', '1'] // primary type
                    ]
                } else if (rec.type === 'vendorbill') {
                    filters = [
                        ['custrecord_2663_parent_vendor', 'anyof', entityId],
                        'AND',
                        ['custrecord_2663_entity_bank_type', 'anyof', '1'] // primary type
                    ]
                }

                log.debug('MDIMKOV', 'entityId: ' + entityId);


                // MDIMKOV 10.04.2023: check if this vendor has a bank details record registered for them
                if (entityId) {
                    let vendorBankDetailId = 0;
                    const customrecord_2663_entity_bank_detailsSearchObj = search.create({
                        type: 'customrecord_2663_entity_bank_details',
                        filters: filters,
                        columns:
                            [
                                search.createColumn({
                                    name: 'internalid'
                                })
                            ]
                    });
                    customrecord_2663_entity_bank_detailsSearchObj.run().each(function (result) {
                        vendorBankDetailId = result.getValue(result.columns[0]);
                        return false; // ideally, only one result
                    });
                    log.debug('MDIMKOV', 'vendorBankDetailId: ' + vendorBankDetailId);


                    // MDIMKOV 10.04.2023: if bank details found, try to select them on the bill record
                    if (vendorBankDetailId) {
                        log.debug('MDIMKOV', 'rec type: ' + rec.type);
                        if (rec.type === 'vendorbill') {
                            rec.setValue('custbody_15529_vendor_entity_bank', vendorBankDetailId);
                        } else if (rec.type === 'expensereport') {
                            rec.setValue('custbody_15529_emp_entity_bank', vendorBankDetailId);
                        }
                    }
                }


                log.audit('MDIMKOV', '--- saveRecord END ---');
                return true;
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
