/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/dialog', 'N/search', 'N/currency'],

    /* MDIMKOV 13.09.2022: this client script, deployed on [Journal Entry], [Expense Report], [Vendor Bill], does the following:
    *   - if the transaction is [Journal Entry] or [Vendor Bill], fires on [validateField]
    *   - if the transaction is [Expense Report], fires on [validateLine]
    *   - the script prevents the user from proceeding if the exchange rate set has a difference of more than 5% from the official exchange rate
    * */


    /**
     * @param {record} record
     * @param {dialog} dialog
     * @param {search} search
     * @param {currency} currency
     */
    function (record, dialog, search, currency) {

        function roundAmount(amt) {
            amt = Number(amt);
            amt = Math.round((amt + 0.00001) * 1000) / 1000;
            return amt;
        }


        function displayMessage(sourceCurrency, targetCurrency, transDate, newRate) {

            /*
            alert('targetCurrency: ' + targetCurrency);
            alert('newRate: ' + newRate);
            alert('transSubsidiaryId: ' + transSubsidiaryId);
            alert('sourceCurrency: ' + sourceCurrency);
            */


            // MDIMKOV 01.09.2022: find the default currency rate
            let defaultRate = currency.exchangeRate({
                source: sourceCurrency,
                target: targetCurrency,
                date: new Date(transDate)
            });

            log.debug('defaultRate', defaultRate);


            if (defaultRate) {

                defaultRate = 1 / defaultRate;

                deviationPercent = (defaultRate - newRate) / defaultRate;

                log.debug('deviationPercent', deviationPercent);

                const message = 'The currency exchange rate may not deviate with more than 0.5% from the default exchange rate.'
                    + '<br><br>-----------------' + '<br>'
                    + 'current exchange rate: ' + newRate + '<br>'
                    + 'default exchange rate: ' + defaultRate + '<br>'
                    + 'current deviation is: ' + roundAmount(Math.abs(deviationPercent)) * 10 + '%'


                //MDIMKOV 01.09.2022: raise an error message in case there is a deviation of more than 2.5% between default and new currency rate
                if (deviationPercent > 0.05 || deviationPercent < -0.05) {

                    dialog.alert({
                        title: 'Currency Exchange Rate Warning',
                        message: message
                    });

                    return false;

                } else {
                    return true;

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

            const currentRecord = context.currentRecord;
            const sublistName = context.sublistId;

            try {
                log.debug('MDIMKOV', '--- validateLine START ---');

                log.debug('MDIMKOV', 'current record type: ' + currentRecord.type);

                // MDIMKOV 13.09.2022: only proceed if the transaction is [Expense Report]
                if (currentRecord.type !== 'expensereport') {
                    log.debug('MDIMKOV', 'exiting the script, as the transaction is not expense report');
                    return true;
                } else {
                    log.debug('MDIMKOV', 'proceed with script for this record type...');
                }

                log.debug('MDIMKOV', 'sublistName: ' + sublistName);

                if (sublistName === 'expense') {

                    log.debug('MDIMKOV', 'proceed with script for this sublist...');

                    //MDIMKOV 01.09.2022: get the currency and exchange rate from the line item
                    const targetCurrency = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'currency'
                    });

                    const newRate = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'exchangerate'
                    });


                    // MDIMKOV 01.09.2022: define the main variables that will be used to calculate the default currency rate
                    const transSubsidiaryId = currentRecord.getValue('subsidiary');
                    const transDate = currentRecord.getValue('trandate');
                    let deviationPercent = 0;
                    const sourceCurrency = currentRecord.getValue('expensereportcurrency');


                    // MDIMKOV 13.09.2022: this main function will return either true or false to allow / disallow the change
                    return displayMessage(sourceCurrency, targetCurrency, transDate, newRate);


                } else {
                    log.debug('MDIMKOV', 'this is not the expense sublist; exiting the script...');
                }

                return true;


                log.debug('MDIMKOV', '--- validateLine END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }

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
                log.debug('MDIMKOV', '--- validateField START ---');

                const currentRecord = context.currentRecord;
                const fieldId = context.fieldId;

                // MDIMKOV 13.09.2022: only proceed if the transaction is [Journal Entry] or [Vendor Bill]
                if (currentRecord.type !== 'journalentry' && currentRecord.type !== 'vendorbill') {
                    log.debug('MDIMKOV', 'exiting the script, as the transaction is not journal entry, nor vendor bill');
                    return true;
                } else {
                    log.debug('MDIMKOV', 'proceed with script for this record type...');
                }

                const transSubsidiaryId = currentRecord.getValue('subsidiary');
                const targetCurrency = currentRecord.getValue('currency');
                const transDate = currentRecord.getValue('trandate');
                const newRate = currentRecord.getValue('exchangerate');


                // MDIMKOV 13.09.2022: find source currency; subsidiary level cannot be loaded (employee permissions), a dictionary will be used
                const currencyDict = {
                    '1': 1, // Aktiia SA => CHF
                    '8': 4, // Aktiia BV => EUR
                    '6': 1  // x Elimination => CHF
                };

                const sourceCurrency = currencyDict[transSubsidiaryId];


                // MDIMKOV 13.09.2022: this main function will return either true or false to allow / disallow the change
                return displayMessage(sourceCurrency, targetCurrency, transDate, newRate);

                log.debug('MDIMKOV', '--- validateField END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        return {
            //pageInit: pageInit,
            //fieldChanged: fieldChanged,
            //postSourcing: postSourcing,
            //sublistChanged: sublistChanged,
            //lineInit: lineInit,
            // validateField: validateField,
            validateLine: validateLine,
            //validateInsert: validateInsert,
            //validateDelete: validateDelete,
            saveRecord: saveRecord
        };

    });
