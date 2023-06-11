/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'SuiteScripts/_Libraries/_lib'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{_lib} _libаааа
     */
    (record, search, _lib) => {

        /** MDIMKOV 01.11.2022: this UE script, deployed on [invoice], [quote], firing on [afterSubmit], does the following:
         *  - for quote, just writes the right item name on the line in the [] field and sets the discount name
         *  - evaluates information from several invoice/SO fields
         *  - changes the form used on the invoice/SO depending on these fields, to match the respective language
         *  - changes a few more fields related to IBAN, VAT Number etc.
         *  - goes through invoice/SO items and sets the respective language title in a set of predefined fields
         *  - if a discount item is found, stamps the right language term (e.g. 'Sconto') into the language fields (since no custom fields for discounts exist)
         *
         *  The logic to be implemented is the following:
         *
         *  --- B2B Template ---    (customer [entity] contains 'WooCommerce')
         *
         *        [billcountry] = 'CH'
         *         => [IBAN] = 'CH050029029013042301R'
         *         => [BIC] = 'UBSWCHZH80A'
         *         => [VAT No] = 'CHE-149.232.500'
         *         => [Bank Name] = 'UBS Switzerland AG'
         *
         *        [billcountry] = 'GB'
         *         => [IBAN] = 'CH490029029013042361P'
         *         => [BIC] = 'UBSWCHZH80A'
         *         => [VAT No] = 'GB379786416'
         *         => [Bank Name] = 'UBS Switzerland AG'
         *
         *        [shipcountry] = FR, IE, DE, AT, IT
         *         => [IBAN] = 'DE40502200853422070017'
         *         => [BIC] = 'SMHBDEFF'
         *         => [VAT No] = 'NL862305688B01'
         *         => [Bank Name] = 'UBS Europe SE'
         *
         *        [shipcountry] = none of the above
         *         => [IBAN] = 'CH820029029013042360G'
         *         => [BIC] = 'UBSWCHZH80A'
         *         => [VAT No] = 'CHE-149.232.500'
         *         => [Bank Name] = 'UBS Switzerland AG'
         *
         *
         * --- B2C Template ---    (customer [entity] does not contain 'WooCommerce')
         *
         *        [shipcountry] = FR, IE, DE, AT, IT
         *         => [VAT No] = 'NL862305688B01'
         *
         *        [shipcountry] = 'GB'
         *         => [VAT No] = 'NL862305688B01'
         *
         *        [shipcountry] = 'CH'
         *         => [VAT No] = 'CHE-149.232.500'
         *
         *        [customer.language] = en_EN / fr_FR / it_IT / de_DE
         *         => [customform] will be changed to reflect the correct language
         *
         *         if [shipcountry] = 'CH', then the language will be sourced from the [custbody_akt_invlang] field
         *         => this field has values such as en, fr, it, de, etc.
         */


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
                log.audit('MDIMKOV', '');
                log.audit('MDIMKOV', '--- SCRIPT START ---');

                const type = context.newRecord.type;
                log.debug('MDIMKOV', 'type: ' + type);

                // MDIMKOV 01.11.2022: load the record and initialize base variables
                const rec = record.load({
                    type: type,
                    id: context.newRecord.id,
                    isDynamic: true
                });

                if (type === 'invoice' || type === 'salesorder') { // only when type is invoice/SO; ignore for estimates (quotes)

                    log.debug('MDIMKOV', 'initialize variables...');

                    const invFields = search.lookupFields({
                        type: type,
                        id: rec.id,
                        columns: ['billcountry', 'shipcountry']
                    });

                    const billCountry = invFields.billcountry[0].value;
                    const shipCountry = invFields.shipcountry[0].value;

                    const customerName = rec.getText('entity');
                    const customerId = rec.getValue('entity');
                    const templateType = customerName.toLowerCase().includes('woocommerce') ? 'B2C' : 'B2B';
                    log.debug('MDIMKOV', '... billCountry: ' + JSON.stringify(billCountry));
                    log.debug('MDIMKOV', '... shipCountry: ' + JSON.stringify(shipCountry));
                    log.debug('MDIMKOV', '... customerName: ' + customerName);
                    log.debug('MDIMKOV', '... templateType: ' + templateType);

                    // MDIMKOV 10.11.2022: for B2C Swiss invoices, the language is sourced from the invoice, otherwise: from the customer preferences
                    const languageCH = rec.getValue('custbody_akt_invlang');
                    let languageFromCustomer = _lib.getFieldValue('language', 'customer', customerId, 'text', 'value');
                    languageFromCustomer = languageFromCustomer.substring(0, 2); // convert e.g. 'fr_FR' into just 'fr'
                    const language = (shipCountry === 'CH') ? languageCH : languageFromCustomer;

                    log.debug('MDIMKOV', '... languageCH: ' + languageCH);
                    log.debug('MDIMKOV', '... languageFromCustomer: ' + languageFromCustomer);
                    log.debug('MDIMKOV', '... language (final): ' + language);
                    log.audit('MDIMKOV', '');


                    if (templateType == 'B2B') {
                        // MDIMKOV 01.11.2022: this is a *** B2B *** invoice
                        log.debug('MDIMKOV', 'proceed with B2B...');


                        // MDIMKOV 01.11.2022: set the correct invoice/SO form (B2B, English)
                        if (type === 'invoice') {
                            rec.setValue('customform', 129); // Aktiia Product Invoice - BTB - EN
                            rec.setValue('custbody_akt_custom_form', 129);
                            log.debug('MDIMKOV', 'set form to 129 (invoice)');
                        } else if (type === 'salesorder') {
                            rec.setValue('customform', 127); // Aktiia - Sales Order B2B
                            rec.setValue('custbody_akt_custom_form', 127);
                            log.debug('MDIMKOV', 'set form to 127 (sales order)');
                        }


                        // MDIMKOV 01.11.2022: set the payment IBAN and the VAT Reg Num
                        if (billCountry === 'CH') {
                            log.debug('MDIMKOV', '... case is CH');
                            rec.setValue('custbody_akt_pmt_iban', 'CH050029029013042301R');
                            rec.setValue('custbody_akt_pmt_bic', 'UBSWCHZH80A');
                            rec.setValue('custbody_akt_vat_reg_num', 'CHE-149.232.500');
                            rec.setValue('custbody_akt_pmt_bankname', 'UBS Switzerland AG');

                        } else if (billCountry === 'GB') {
                            log.debug('MDIMKOV', '... case is GB');
                            rec.setValue('custbody_akt_pmt_iban', 'CH490029029013042361P');
                            rec.setValue('custbody_akt_pmt_bic', 'UBSWCHZH80A');
                            rec.setValue('custbody_akt_vat_reg_num', 'GB379786416');
                            rec.setValue('custbody_akt_pmt_bankname', 'UBS Switzerland AG');

                        } else if (billCountry === 'FR' || billCountry === 'IE' || billCountry === 'DE' || billCountry === 'AT' || billCountry === 'IT') {
                            log.debug('MDIMKOV', '... case is FR, IE, DE, AT, IT');
                            rec.setValue('custbody_akt_pmt_iban', 'DE40502200853422070017');
                            rec.setValue('custbody_akt_pmt_bic', 'SMHBDEFF');
                            rec.setValue('custbody_akt_vat_reg_num', 'NL862305688B01');
                            rec.setValue('custbody_akt_pmt_bankname', 'UBS Europe SE');

                        } else { // all others
                            log.debug('MDIMKOV', '... case is DEFAULT');
                            rec.setValue('custbody_akt_pmt_iban', 'CH820029029013042360G');
                            rec.setValue('custbody_akt_pmt_bic', 'UBSWCHZH80A');
                            rec.setValue('custbody_akt_vat_reg_num', 'CHE-149.232.500');
                            rec.setValue('custbody_akt_pmt_bankname', 'UBS Switzerland AG');
                        }

                    } else if (type === 'invoice' && templateType == 'B2C') {
                        // MDIMKOV 01.11.2022: this is a *** B2C *** invoice
                        log.debug('MDIMKOV', 'proceed with B2C...');

                        // MDIMKOV 01.11.2022: set the correct invoice form (B2C, specific language)
                        switch (language) {
                            case 'fr':
                                log.debug('MDIMKOV', '... language is fr');
                                rec.setValue('customform', 131); // Aktiia Product Invoice - BTC - FR
                                rec.setValue('custbody_akt_custom_form', 131);
                                break;

                            case 'it':
                                log.debug('MDIMKOV', '... language is it');
                                rec.setValue('customform', 132); // Aktiia Product Invoice - BTC - IT
                                rec.setValue('custbody_akt_custom_form', 132);
                                break;

                            case 'de':
                                log.debug('MDIMKOV', '... language is de');
                                rec.setValue('customform', 133); // Aktiia Product Invoice - BTC - DE
                                rec.setValue('custbody_akt_custom_form', 133);
                                break;

                            default:
                                log.debug('MDIMKOV', '... language is en or OTHER');
                                rec.setValue('customform', 130); // Aktiia Product Invoice - BTC - EN
                                rec.setValue('custbody_akt_custom_form', 130);
                        }

                        // MDIMKOV 01.11.2022: set the VAT Reg Num
                        switch (shipCountry) {
                            case 'CH':
                                log.debug('MDIMKOV', '... case is CH');
                                rec.setValue('custbody_akt_vat_reg_num', 'CHE-149.232.500');
                                break;

                            case 'GB':
                                log.debug('MDIMKOV', '... case is GB');
                                rec.setValue('custbody_akt_vat_reg_num', 'GB379786416');
                                break;

                            default: // FR, IE, DE, AT, IT
                                log.debug('MDIMKOV', '... case is DEFAULT');
                                rec.setValue('custbody_akt_vat_reg_num', 'NL862305688B01');
                        }

                    }

                } // end processing for invoices / SOs only

                // MDIMKOV 25.11.2022: go through the lines and for each of them add the respective language term
                // since discount lines have no custom fields, they are being handled in an additional code block
                log.debug('MDIMKOV', '');
                log.debug('MDIMKOV', 'proceed with setting language titles for discount item lines');
                const iLineCount = rec.getLineCount({sublistId: 'item'});
                for (let i = 0; i < iLineCount; i++) {

                    rec.selectLine({
                        sublistId: 'item',
                        line: i
                    });

                    const itemId = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item'
                    });

                    const itemType = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype'
                    });

                    const itemName = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item_display'
                    });

                    // MDIMKOV 25.11.2022: find the language titles on the item record
                    const itemLookup = search.lookupFields({
                        type: search.Type.ITEM,
                        id: itemId,
                        columns: ['custitem_akt_nameoninvoice_en',
                            'custitem_akt_nameoninvoice_fr',
                            'custitem_akt_nameoninvoice_it',
                            'custitem_akt_nameoninvoice_de']
                    });

                    if (itemType !== 'Discount' && !itemName.toUpperCase().includes('DISCOUNT')) {
                        log.debug('MDIMKOV', 'line ' + i + ' is an item line, proceed with setting the respective label');
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_akt_nameoninvoice_en',
                            value: itemLookup.custitem_akt_nameoninvoice_en
                        });
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_akt_nameoninvoice_fr',
                            value: itemLookup.custitem_akt_nameoninvoice_fr
                        });
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_akt_nameoninvoice_it',
                            value: itemLookup.custitem_akt_nameoninvoice_it
                        });
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_akt_nameoninvoice_de',
                            value: itemLookup.custitem_akt_nameoninvoice_de
                        });
                    } else if (itemType === 'Discount' || itemName.toUpperCase().includes('DISCOUNT')) {
                        log.debug('MDIMKOV', 'line ' + i + ' is a discount line, proceed with setting the discount label');
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_akt_nameoninvoice_en',
                            value: 'Discount'
                        });
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_akt_nameoninvoice_fr',
                            value: 'Remise'
                        });
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_akt_nameoninvoice_it',
                            value: 'Sconto'
                        });
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_akt_nameoninvoice_de',
                            value: 'Ermäßigung'
                        });
                    }

                    rec.commitLine({
                        sublistId: 'item'
                    });
                }

                // MDIMKOV 01.11.2022: save the record
                rec.save();

                log.audit('MDIMKOV', '');
                _lib.logGovernanceUsageRemaining('script end');
                log.audit('MDIMKOV', '--- SCRIPT END ---');
            } catch
                (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    }
)
;
