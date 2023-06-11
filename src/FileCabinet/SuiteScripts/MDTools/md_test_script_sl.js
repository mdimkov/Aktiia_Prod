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




                const lotNumberArray =  ['21BA13702208001338', '2137EC665BFA', '212BE46793C2', '21BA13702208001338', '2137EC665BFA', '210113B04DD', '210113B05DD', '210113B06DD', '210113B07DD', '210113B08DD', '210113B09DD', '210113B10DD', '210113B11DD', '210113B12DD', '210113B13DD', '210113B14DD', '210113B86DD', '210113B87DD', '210113B88DD', '210113B89DD', '210113B90DD', '210113B91DD', '210113B92DD', '210113B93DD', '210113B94DD', '210113B95DD', '210113B96DD', '210113B97DD', '210113B98DD', '210113B99DD', '210113B100DD']

                const myIDs = _lib.getLotSerialNumIDs(lotNumberArray, 15);
                log.audit('MDIMKOV', myIDs);




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
