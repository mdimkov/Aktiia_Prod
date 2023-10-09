/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/search', 'N/url', 'SuiteScripts/_Libraries/_lib'],
    /**
     * @param{record} record
     * @param{redirect} redirect
     * @param{search} search
     * @param{url} url
     * @param{_lib} _lib
     */
    (record, redirect, search, url, _lib) => {

        /* MDIMKOV 09.04.2022: this suitelet is used for testing purposes in any NetSuite account
        *   - can be generated as part of the MDTools package
        *   - can be run any time to test a piece of code
        * */

        const onRequest = (context) => {
            const referer = context.request.headers.referer;
            try {
                log.audit('MDIMKOV', '--- SCRIPT START ---');
                log.audit('', '');
                log.audit('', '');

                // ---------------------------------------------------------------------------------------------------- //
                // enter your code here.....


                // MDIMKOV 06.07.2023: this local function returns the bank info (IBAN etc.) based on the setup screen
                function locGetBankInfo(formId, subsidiaryId, currencyId, countryId) {

                    // MDIMKOV 06.07.2023: initialize variables with default values
                    let returnObj = {"iban": "CH820029029013042360G", "bic": "UBSWCHZH80A", "vat": "CHE-149.232.500", "bankname": "UBS Switzerland AG"};
                    let isContinue = true;


                    // MDIMKOV 06.07.2023: log the input variable values
                    log.debug('MDIMKOV', 'formId: ' + formId + '; subsidiaryId: ' + subsidiaryId + '; currencyId: ' + currencyId + '; countryId: ' + countryId);


                    // MDIMKOV 06.07.2023: search the setup screen
                    const setupScreenSearchObj = search.create({
                        type: 'customrecord_akt_auto_email_inv',
                        filters:
                            [
                                ['custrecord_akt_aeis_inv_form', 'anyof', formId],
                                'AND',
                                ['custrecord_akt_aeis_subsidiary', 'anyof', subsidiaryId],
                                'AND',
                                ['custrecord_akt_aeis_currency', 'anyof', currencyId]
                            ],
                        columns:
                            [
                                'custrecord_akt_aeis_country',
                                'custrecord_akt_aeis_iban',
                                'custrecord_akt_aeis_bic',
                                'custrecord_akt_aeis_vatno',
                                'custrecord_akt_aeis_bankname'
                            ]
                    });
                    _lib.logSearchResultCount(setupScreenSearchObj, null, 'number of setup records found ')
                    let index = 0;
                    setupScreenSearchObj.run().each(function (result) {
                        const countryArray = result.getValue(result.columns[0]);
                        const iban = result.getValue(result.columns[1]);
                        const bic = result.getValue(result.columns[2]);
                        const vat = result.getValue(result.columns[3]);
                        const bankname = result.getValue(result.columns[4]);


                        // MDIMKOV 06.07.2023: since one setup record has multiple country codes, check if respective country exists
                        if (countryArray.includes(countryId)) {
                            log.debug('MDIMKOV', 'country ID was found on iteration number ' + index + '; record ID found is: ' + result.id);

                            isContinue = false;
                        }

                        returnObj = {"iban": iban, "bic": bic, "vat": vat, "bankname": bankname};

                        index += 1;
                        return isContinue;
                    });
                    return returnObj;
                }

                const bankInfoObj = locGetBankInfo(1, 1, 2, 1);

                log.debug('MDIMKOV', 'bankInfoObj: ' + JSON.stringify(bankInfoObj));


                // ---------------------------------------------------------------------------------------------------- //

                redirectToDeployment(referer);
                log.audit('', '');
                log.audit('', '');
                log.audit('MDIMKOV', '--- SCRIPT END ---');
            } catch (e) {
                log.error('ERROR', e.message + ' --- ' + e.stack);
                redirectToDeployment(referer);
            }
        }

        function redirectToDeployment(referer) {
            redirect.redirect({
                url: referer
            });
        }

        return {onRequest}

    });
