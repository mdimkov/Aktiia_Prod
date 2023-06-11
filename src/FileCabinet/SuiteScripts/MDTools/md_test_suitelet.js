/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/search', 'N/url', './_lib'],
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
            try {
                log.audit('MDIMKOV', '--- SCRIPT START ---');
                log.audit('', '');
                log.audit('', '');
                const referer = context.request.headers.referer;

                // ---------------------------------------------------------------------------------------------------- //
                // enter your code here.....

                const newAmount = _lib.getCurrencyExchangeRate('EUR', 'CHF', new Date()); // => 1.95583
                log.audit('MDIMKOV', 'newAmount: ' + newAmount);


















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
