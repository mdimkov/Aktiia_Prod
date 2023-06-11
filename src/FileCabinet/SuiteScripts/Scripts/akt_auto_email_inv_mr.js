/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/render', 'N/email', 'SuiteScripts/_Libraries/_lib.js'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{render} render
     * @param{email} email
     * @param{_lib} _lib
     */
    (record, search, render, email, _lib) => {

        /* MDIMKOV 01.11.2022: this map reduce script performs the following:
        *   - iterates through invoices that have not been sent yet to the customers ([custbody_akt_sent_to_customer] is FALSE)
        *   - also checks if the respective invoice is B2B or B2C - only processes B2C invoices
        *   - renders the respective template based on the form used, which is saved on the respective invoice record
        *   - sends out the email to the customer
        *   - marks the invoice as processed ([custbody_akt_sent_to_customer] is set to TRUE), so it's not being used anymore
        * */

        // MDIMKOV 01.11.2022: this function renders the invoice before it's sent to the customer
        function renderInvoice(form, tranId, folderId) {

            let transactionFile = render.transaction({
                entityId: parseInt(tranId),
                printMode: render.PrintMode.PDF,
                formId: parseInt(form)
            });

            const invoiceNumber = _lib.getFieldValue('tranid', 'invoice', tranId);

            transactionFile.name = 'invoice_' + invoiceNumber + '.pdf';
            transactionFile.folder = folderId;
            transactionFile.save();

            return transactionFile;
        }


        // MDIMKOV 16.11.2022: this function returns the language (e.g. 'en', 'fr', 'it', 'de') for a given form (given invoice)
        function getLanguage(form) {
            let language = 'en'; // this is the default

            const formId = parseInt(form);

            // MDIMKOV 16.11.2022: create a dictionary that has the language for each form ID
            const languageDict = {
                129: 'en',
                130: 'en',
                131: 'fr',
                132: 'it',
                133: 'de'
            };

            language = languageDict[formId];

            return language;
        }


        // MDIMKOV 16.11.2022: construct the email body based on language (transaction form)
        function getEmailBody(language, name, orderNumber) {

            let emailBody = '';

            switch (language) {
                case 'fr':
                    emailBody = 'Bonjour ' + name + ',\n' +
                        '<br><br>Veuillez trouver ci-joint la facture relative à votre commande n° ' + orderNumber + '. \n' +
                        '<br><br>Merci de ne pas répondre à cet e-mail, veuillez contacter support@aktiia.com en indiquant la référence de votre commande. \n' +
                        '<br><br>Nous vous remercions de votre confiance, \n' +
                        '<br><br>Bien à vous, \n' +
                        '<br><br>L\'équipe Aktiia\n';
                    break;

                case 'it':
                    emailBody = 'Buongiorno ' + name + ',\n' +
                        '<br><br>Voglia trovare in copia la fattura relativa al suo ordine n° ' + orderNumber + '.\n' +
                        '<br><br>Non rispondere a questa e-mail, ma contattare support@aktiia.com indicando il riferimento dell\'ordine. \n' +
                        '<br><br>Ringraziandola per la sua fiducia, le porgiamo cordiali saluti.\n' +
                        '<br><br>Il team Aktiia\n';
                    break;

                case 'de':
                    emailBody = 'Guten Tag ' + name + '\n' +
                        '<br><br>In der Beilage finden Sie die Rechnung zu Ihrer Bestellung Nr. ' + orderNumber + '.\n' +
                        '<br><br>Bitte antworten Sie nicht auf diese E-Mail. Wenden Sie sich an support@aktiia.com und erwähnen Sie die Referenznummer Ihrer Bestellung. \n' +
                        '<br><br>Vielen Dank für Ihr Vertrauen.\n' +
                        '<br><br>Freundliche Grüsse\n' +
                        '<br><br>Ihr Aktiia-Team\n';
                    break;

                default: // = case 'en':
                    emailBody = 'Dear ' + name + ',\n' +
                        '<br><br>Please find attached the invoice related to your order n° ' + orderNumber + '. \n' +
                        '<br><br>Please do not reply to this email, contact support@aktiia.com with your order reference. \n' +
                        '<br><br>Thank you for your confidence, \n' +
                        '<br><br>Kind regards, \n' +
                        '<br><br>Aktiia team\n';
            }

            return emailBody;
        }


        // MDIMKOV 16.11.2022: construct the email body based on language (transaction form)
        function getEmailSubject(language) {

            let emailSubject = '';

            switch (language) {
                case 'fr':
                    emailSubject = 'Votre facture Aktiia';
                    break;

                case 'it':
                    emailSubject = 'La vostra fattura Aktiia';
                    break;

                case 'de':
                    emailSubject = 'Ihre Aktiia-Rechnung';
                    break;

                default: // = case 'en':
                    emailSubject = 'Your Aktiia Invoice';
            }

            return emailSubject;
        }


        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => { // ##
            try {
                log.audit('MDIMKOV', '[ - getInputData START - ]');

                const searchObj = search.load({
                    id : 'customsearch_akt_auto_email_inv'
            });

                _lib.logSearchResultCount(searchObj, 'getInputData stage');

                return searchObj;

            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            try {
                log.debug('MDIMKOV', '');
                log.debug('MDIMKOV', '[ - map START - ]');

                // MDIMKOV 02.11.2022: get the invoice ID for the currenly processed invoice
                let value = JSON.parse(mapContext.value);
                const tranId = value.id;
                log.debug('MDIMKOV', 'processing invoice with id: ' + tranId);


                // MDIMKOV 02.11.2022: get some additional variables
                const recInv = record.load({
                    type: 'invoice',
                    id: tranId
                });

                const formId = recInv.getValue('custbody_akt_custom_form');
                const firstName = recInv.getValue('custbodynbs702_first_name_shipp');
                const lastName = recInv.getValue('custbodynbs702_last_name_shipp');
                let fullName = (firstName + lastName) ? firstName + ' ' + lastName : 'Customer';
                const createdFromId = recInv.getValue('createdfrom');
                const orderNumber = recInv.getValue('custbody_nbs702_storefront_order');

                // MDIMKOV 30.11.2022: work around a problem where the last name is suffixed with a dash for some reason
                if (fullName.endsWith("-")) {
                    fullName = fullName.substring(0, fullName.length - 1);
                }

                log.debug('MDIMKOV', 'formId: ' + formId);
                log.debug('MDIMKOV', 'firstName: ' + firstName);
                log.debug('MDIMKOV', 'lastName: ' + lastName);
                log.debug('MDIMKOV', 'fullName: ' + fullName);
                log.debug('MDIMKOV', 'createdFromId: ' + createdFromId);
                log.debug('MDIMKOV', 'orderNumber: ' + orderNumber);


                // MDIMKOV 02.11.2022: render the PDF template for the invoice
                const pdfFile = renderInvoice(formId, tranId, 1966); // folder = Finance > Customer Invoices


                // MDIMKOV 16.11.2022: get the language (based on the form ID) and define the body text
                const language = getLanguage(formId);
                const emailBody = getEmailBody(language, fullName, orderNumber);
                const emailSubject = getEmailSubject(language);


                // MDIMKOV 02.11.2022: send out the email message
                const recipient = _lib.getFieldValue('custbodynbs702_email_billing', 'invoice', tranId);
                const author = 1335; // Employee = Billing Bot

                if (recipient) {
                    email.send({
                        author: author,
                        recipients: recipient,
                        subject: emailSubject,
                        body: emailBody,
                        attachments: [pdfFile],
                        relatedRecords: {
                            transactionId: tranId
                        }
                    });
                    log.audit('MDIMKOV', 'email sent to : ' + recipient + ' for invoice with id=' + tranId);

                    // MDIMKOV 02.11.2022: finally, mark the invoice as processed
                    _lib.setFieldValue('custbody_akt_sent_to_customer', 'invoice', tranId, true);
                } else {
                    log.audit('MDIMKOV', 'could NOT send email for invoice with id=' + tranId + ', as there was no email address provided');
                }

                _lib.logGovernanceUsageRemaining('map end');
                log.debug('MDIMKOV', '[ - map END - ]');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
            log.audit('MDIMKOV', '');
            log.audit('MDIMKOV', '[ - summarize START - ]');

            _lib.logGovernanceUsageRemaining('map end');
            log.audit('MDIMKOV', '[ - summarize END - ]');
            log.audit('MDIMKOV', '');
        }

        return {getInputData, map, reduce, summarize}

    });
