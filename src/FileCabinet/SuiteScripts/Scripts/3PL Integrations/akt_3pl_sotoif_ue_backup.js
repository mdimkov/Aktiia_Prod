/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/https', 'SuiteScripts/_Libraries/_lib'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{https} https
     * @param{_lib} _lib
     */
    (record, search, https, _lib) => {


        /* MDIMKOV 04.10.2022: this UE script, deployed on [AKT Integr SO to IF], firing on [beforeSubmit], does the following:
             - general note: anything [Mintsoft] related pertains to [OGL]; anything [Fastlog] related pertains to [Fastlog / Microsoft BC]
             - defines if call is coming from Mintsoft/OGL or from Fastlog, by checking the [custrecord_sotoif_3pl_provider] field
             - captures the respective sales order, before the custom record has been created
             - sends a web call to Mintsoft to get a list of items to be fulfilled along with their serial numbers
             - groups/reduces the JSON that describes the items and serial numbers to be grouped by SKU (see next blocks with raw and grouped data)
             - tries to create an item fulfillment with JSON information about the items (for OGL makes second call to retreive item information)
             - because of many limiations, for OGL only kit items with up to 2 components will be fulfilled at this stage
             - if the script fails, the whole creation of the record fails, which signals back to Celigo and raises an error message
			 - once the item fulfillment is created, it's stamped into the respective field on the custom record type
			 - trying to create a record for an integration id that already exists on another record results in an error
         */


        // MDIMKOV 21.10.2022: remove the block itself from the final items data array, so it will for sure never be re-used
        // this is because serial numbers are unique; this way we avoid a situation where the same item appears more than once on the SO
        function removeSerialNumber(arrayObject, itemName) {
            const currentIndex = arrayObject.findIndex(x => x.name === itemName);
            arrayObject.splice(currentIndex, 1);
            return arrayObject;
        }


        // MDIMKOV 22.02.2023: this function converts an array into a string, with the array members listed and separated by comma; used for tracking numbers
        // since the maximum number of characters for the field is 64, the string is finally truncated
        function arrayToString(array) {
            let result = '';
            for (let i = 0; i < array.length; i++) {
                if (i !== 0) {
                    result += ', ';
                }
                result += array[i];
            }
            return result.substring(0, 62);
        }


        // MDIMKOV 18.10.2022: this function finds all serial numbers for a given component item within a kit, by extracting them from the respective current block
        function getFlgComponentSerialNumbers(currentBlock, itemName) {
            let returnSerialNumber = null;

            /* MDIMKOV 18.10.2022: currentBlock expected:
            {
                "SKU": "KITNS",
                "Quantity": 2,
                "bundles": [
                    {
                        "bundleNo": "",
                        "items": [
                            {
                                "SKU": "G1",
                                "Quantity": 2,
                                "SerialNumbers": [
                                    "21D1974BE19F", "218ED4AD9E88"
                                ]
                            },
                            {
                                "SKU": "I1",
                                "Quantity": 2,
                                "SerialNumbers": [
                                    "21BA88302203002003", "21BA88302203001747"
                                ]
                            }
                        ]
                    }
                ]
            }*/

            if (!currentBlock || !currentBlock.bundles) {
                return null;
            }

            for (const bundle of currentBlock.bundles) {
                for (const item of bundle.items) {
                    if (item.SKU === itemName) {
                        return item.SerialNumbers;
                    }
                }
            }

            return null;
        }


        // MDIMKOV 16.10.2022: this function adds the tracking number on all lines in on the [Packages] sublist
        function addTrackingNumber(ifId, trackingNumber) {

            const recIf = record.load({
                type: record.Type.ITEM_FULFILLMENT,
                id: ifId,
                isDynamic: true
            });

            const iPackageCount = recIf.getLineCount({sublistId: 'package'});
            for (let p = 0; p < iPackageCount; p++) {

                recIf.selectLine({
                    sublistId: 'package',
                    line: p
                });

                recIf.setCurrentSublistValue({
                    sublistId: 'package',
                    fieldId: 'packagetrackingnumber',
                    value: trackingNumber
                });

                recIf.commitLine({
                    sublistId: 'package'
                });
            }

            recIf.save();
        }


        // MDIMKOV 16.10.2022: this function adds the tracking number on all lines in on the [Packages] sublist; if no lines exist, it adds a line
        function addTrackingNumberKin(ifId, trackingNumber) {

            const recIf = record.load({
                type: record.Type.ITEM_FULFILLMENT,
                id: ifId,
                isDynamic: true
            });

            const iPackageCount = recIf.getLineCount({sublistId: 'package'});

            if (iPackageCount > 0) {
                for (let p = 0; p < iPackageCount; p++) {

                    recIf.selectLine({
                        sublistId: 'package',
                        line: p
                    });

                    recIf.setCurrentSublistValue({
                        sublistId: 'package',
                        fieldId: 'packagetrackingnumber',
                        value: trackingNumber
                    });

                    recIf.commitLine({
                        sublistId: 'package'
                    });
                }
            } else {

                // MDIMKOV 14.03.2023: this adds a line to the Package sublist
                recIf.selectNewLine({
                    sublistId: 'package'
                });

                recIf.setCurrentSublistValue({
                    sublistId: 'package',
                    fieldId: 'packageweight',
                    value: 0.005
                });
                recIf.setCurrentSublistValue({
                    sublistId: 'package',
                    fieldId: 'packagetrackingnumber',
                    value: trackingNumber
                });

                recIf.commitLine({
                    sublistId: 'package'
                });
            }

            recIf.save();
        }


        // MDIMKOV 14.10.2022: this function converts some of the common error messages into a friendly error message depending on the case
        function getFriendlyMessage(errorMessage) {

            let returnMessage = '';

            // MDIMKOV 14.10.2022: message that tells you that the serial number used is not valid;
            // the inventory number ID needs to be transformed into the real serial number
            // error message sample: 'You have entered an Invalid Field Value 430 for the following field: issueinventorynumber'
            if (errorMessage.startsWith('You have entered an Invalid Field Value') && errorMessage.endsWith('issueinventorynumber')) {
                const serialNumberId = errorMessage.replace(/(^.+)(\w\d+\w)(.+$)/i, '$2'); // extracts the number from the string
                if (serialNumberId) {
                    const serialNumber = _lib.getFieldValue('inventorynumber', 'inventorynumber', serialNumberId);
                    if (serialNumber) {
                        returnMessage = 'Wrong serial number (' + serialNumber + ') was used';
                    }
                }
            }

            return returnMessage ? returnMessage + ' --- ' : '';
        }


        // MDIMKOV 09.10.2022: this function gets Mintsoft API Key, as there is no way to get it from Celigo
        function getMintsoftApiKey() {
            let apiKey = '';

            // MDIMKOV 09.10.2022: get the username and password to connect from the script parameters
            const mintsoftUsername = _lib.getScriptParameter('custscript_akt_mintsoft_username');
            const mintsoftPassword = _lib.getScriptParameter('custscript_akt_mintsoft_password');

            const headerObj = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            const response = https.get({
                url: 'https://api.mintsoft.co.uk/api/Auth?UserName=AKTIIA.TEST&Password=Test20220830',
                headers: headerObj
            });

            // MDIMKOV 10.10.2022: get the API key and remove the double quotes around it
            apiKey = response.body;
            apiKey = apiKey.replace(/["']/g, "");

            return apiKey;
        }


        // MDIMKOV 09.10.2022: this function gets the item data (serial numbers) etc. from Mintsoft for the respective order
        function getMintSoftOrderItems(mintSoftOrderId, apiKey) {
            let itemsJSON = '';

            const headerObj = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            const url = 'https://api.mintsoft.co.uk/api/Order/' + mintSoftOrderId + '/BarcodeVerifiedOrderItems?APIKey=' + apiKey;
            log.debug('MDIMKOV', 'get items URL: ' + url);

            const response = https.get({
                url: url,
                headers: headerObj
            });

            const bodyObj = JSON.parse(response.body);

            itemsJSON = bodyObj;

            return itemsJSON;
        }


        // MDIMKOV 17.03.2023: since for Fastlog the array of tracking numbers is being serialized, this function converts them into an array
        function convertStringToArray(inputString) {

            // input array expected: [, &, q, u, o, t, ;, 1, 2, 3, &, q, u, o, t, ;, ,, &, q, u, o, t, ;, 4, 5, 6, &, q, u, o, t, ;, ,, &, q, u, o, t, ;, 7, 8, 9, &, q, u, o, t, ;, ]
            // output would be: ["123", "456", "789"]

            const quoteChar = '&quot;';
            const cleanedString = inputString.replace(/,/g, '').replace(/ /g, '');
            const splitString = cleanedString.split(quoteChar + ';');
            const resultArray = [];

            for (const item of splitString) {
                if (item !== '') {
                    resultArray.push(item);
                }
            }

            return resultArray;
        }


        // MDIMKOV 10.10.2022: this function check if a record in the custom record type already exists for this integration id; if yes, the script exists
        function checkIfRecExists(integrationId) {
            const internalId = _lib.singleRecordSearch('customrecord_akt_sotoif',
                ['custrecord_sotoif_integrationid', 'is', integrationId],
                'internalid')

            if (internalId) {
                throw new Error('There is already a record for Integration Id ' + integrationId + '; ' +
                    'to re-create the item fulfillment, ' +
                    'delete the staging integration record and the respective item fulfillment first');
            }
        }


        // MDIMKOV 17.03.2023: this function summarizes bundles for Fastlog, so that governance usage can be optimized; look in the code itself for samples
        function summarizeBundlesForFlg(inputArray) {
            const resultArray = [];

            for (const input of inputArray) {
                if (input.SKU.includes("KITNS") && input.bundles) {
                    const summary = {
                        SKU: input.SKU,
                        Quantity: input.Quantity,
                        bundles: [
                            {
                                bundleNo: "",
                                items: [],
                            },
                        ],
                    };

                    const itemMap = new Map();

                    for (const bundle of input.bundles) {
                        for (const item of bundle.items) {
                            if (itemMap.has(item.SKU)) {
                                const existingItem = itemMap.get(item.SKU);
                                existingItem.Quantity += item.Quantity;
                                existingItem.SerialNumbers.push(...item.SerialNumbers);
                            } else {
                                const newItem = {
                                    SKU: item.SKU,
                                    Quantity: item.Quantity,
                                    SerialNumbers: [...item.SerialNumbers],
                                };
                                itemMap.set(item.SKU, newItem);
                                summary.bundles[0].items.push(newItem);
                            }
                        }
                    }

                    resultArray.push(summary);
                } else {
                    resultArray.push(input);
                }
            }

            return resultArray;
        }


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
        const beforeSubmit = (context) => { // ##
            try {
                log.audit('MDIMKOV', '');
                log.audit('MDIMKOV', '--- SCRIPT START ---');
                if (context.type === context.UserEventType.CREATE) {
                    log.debug('MDIMKOV', 'Record in create mode, proceed...');

                    // MDIMKOV 04.10.2022: declare variables, extract the items JSON from the respective field
                    const rec = context.newRecord;
                    const integrationId = rec.getValue('custrecord_sotoif_integrationid');
                    const providerName = rec.getValue('custrecord_sotoif_3pl_provider');


                    // MDIMKOV 04.10.2022: check if a record with this integration id already exists and if so, throw error message (fed back to Celigo)
                    checkIfRecExists(integrationId);


                    // MDIMKOV 13.10.2022: based on which 3PL provider is sending the call, redirect to a different block of code
                    if (providerName === 'OGL') {

                        // ========================= OGL / MINTSOFT [KIT ITEM WITH SERIAL NUMBERS] START ========================= //

                        /* MDIMKOV 12.10.2022: Mintsoft raw data expected:
                        *	    [
                        *           {
                        *               "Barcode": "KITNS (S)",
                        *               "BatchNo": "abc110011",
                        *               "SerialNo": "SN-0011",
                        *               "....": "..."
                        *           },
                        *           {
                        *               "Barcode": "KITNS (S)",
                        *               "BatchNo": "abc110012",
                        *               "SerialNo": "SN-0012",
                        *               "....": "..."
                        *           },
                        *           {
                        *               "Barcode": "KITNS (S)",
                        *               "BatchNo": "abc110013",
                        *               "SerialNo": "SN-0013",
                        *               "....": "..."
                        *           }
                        *        ]
                        *
                        **/


                        const mintSoftOrderId = parseInt(rec.getValue('custrecord_sotoif_order_id'));
                        const soId = rec.getValue('custrecord_sotoif_solink');
                        const trackingNumber = rec.getValue('custrecord_sotoif_tracking_number');
                        const trackingUrlRaw = rec.getValue('custrecord_sotoif_tracking_url');
                        const trackingUrl = trackingUrlRaw.replaceAll(' ', '%20'); // remove empty spaces in URL
                        const invLocation = _lib.getFieldValue('location', 'salesorder', soId, null, 'value');
                        log.debug('MDIMKOV', 'NetSuite Sales Order ID -- soId: ' + soId);
                        log.debug('MDIMKOV', 'Mintsoft Order ID -- mintSoftOrderId: ' + mintSoftOrderId);


                        // MDIMKOV 09.10.2022: call Mintsoft to get the current API Key
                        const apiKey = getMintsoftApiKey();
                        log.debug('MDIMKOV', 'apiKey: ' + apiKey);


                        // MDIMKOV 09.10.2022: call Mintsoft to get information about items, serial numbers etc.
                        let itemsJSON = getMintSoftOrderItems(mintSoftOrderId, apiKey);


                        log.debug('MDIMKOV', 'initial itemsJSON (before reduce): ' + JSON.stringify(itemsJSON));


                        // MDIMKOV 14.10.2022: check if any of the main items in the kit (main level) was not scanned;
                        // this would result in "Barcode" property being empty; throw an error message in this case
                        let isBarcodeEmpty = false;
                        itemsJSON.forEach(function (element) {
                            if (element.Barcode === '') {
                                isBarcodeEmpty = true;
                            }
                        });
                        if (isBarcodeEmpty) {
                            throw new Error('For at least one of the items the barcode is missing. In case this is a kit item,' +
                                'You need to ask OGL to scan the respective main kit item and not only the sub-items; ' +
                                'Check the [itemsJSON (before reduce)] log entry in NetSuite for more details.');
                        }


                        // MDIMKOV 14.10.2022: if no information about the items has been received, throw an error message
                        if (itemsJSON.length === 0) {
                            throw new Error('Could not get information about the items dispatched. The JSON returned is empty. Check the [getMintSoftOrderItems] function');
                        }


                        // log.debug('MDIMKOV', 'itemsJSON: ' + itemsJSON);
                        itemsJSON = JSON.stringify(itemsJSON);
                        itemsJSON.replace(/&quot;/g, '\"');
                        itemsJSON = JSON.parse(itemsJSON);
                        /* MDIMKOV 17.10.2022: Mintsoft itemsJSON expected:
                        [{      ------ kit item (KITNS) => both batchNo/SerialNo populated for the component items serial numbers
                            "OrderItemId": 87210,
                            "ProductInLocationId": 0,
                            "OrderId": 59307,
                            "Quantity": 1,
                            "ManuallyConfirmed": false,
                            "Barcode": "KITNS (S)",
                            "BatchNo": "Test-20230427-2",
                            "SerialNo": "Test-20230427-1",
                            "MobileApp": false,
                            "BoxNumber": 1,
                            "SSCCNumber": null,
                            "ID": 10391,
                            "LastUpdated": "2023-04-27T22:45:01.1012608",
                            "LastUpdatedByUser": "Jason.Wang"
                        }, {      ------ stand-alone serialized item (Bracelet) => no SerialNo only
                            "OrderItemId": 87207,
                            "ProductInLocationId": 0,
                            "OrderId": 59307,
                            "Quantity": 1,
                            "ManuallyConfirmed": false,
                            "Barcode": "Bracelet",
                            "BatchNo": null,
                            "SerialNo": "TEST-BRACELET-03",
                            "MobileApp": false,
                            "BoxNumber": 1,
                            "SSCCNumber": null,
                            "ID": 10392,
                            "LastUpdated": "2023-04-27T22:46:36.616162",
                            "LastUpdatedByUser": "Jason.Wang"
                        }, {        ------ stand-alone NON-serialized item (SomeItem) => no batchNo/SerialNo
                            "OrderItemId": 87208,
                            "ProductInLocationId": 0,
                            "OrderId": 59307,
                            "Quantity": 12,
                            "ManuallyConfirmed": true,
                            "Barcode": "SomeItem",
                            "BatchNo": null,
                            "SerialNo": null,
                            "MobileApp": false,
                            "BoxNumber": 0,
                            "SSCCNumber": null,
                            "ID": 10393,
                            "LastUpdated": "2023-04-27T22:47:07.3621141",
                            "LastUpdatedByUser": "Jason.Wang"
                        }, {        ------ the same: stand-alone NON-serialized item (SomeItem) => no batchNo/SerialNo
                            "OrderItemId": 87209,
                            "ProductInLocationId": 0,
                            "OrderId": 59307,
                            "Quantity": 1,
                            "ManuallyConfirmed": true,
                            "Barcode": "SomeItem",
                            "BatchNo": null,
                            "SerialNo": null,
                            "MobileApp": false,
                            "BoxNumber": 0,
                            "SSCCNumber": null,
                            "ID": 10394,
                            "LastUpdated": "2023-04-27T22:47:12.0678735",
                            "LastUpdatedByUser": "Jason.Wang"
                        }]
                    */


                        // MDIMKOV 04.10.2022: start transforming the sales order into an item fulfillment
                        log.debug('MDIMKOV', 'Proceed with transforming the sales order into an item fulfillment');


                        // MDIMKOV 10.10.2022: create a new JSON that will group the serial / batch number by kit item SKU; due to many technical limitations,
                        // the serial number will be the serial number for the bracelet and the batch number will be the *serial* number for cuff
                        let finalItemsData = _lib.groupReduceJsonWithChildren(itemsJSON, 'Barcode');
                        log.debug('MDIMKOV', 'finalItemsData (after reduce): ' + JSON.stringify(finalItemsData));
                        /* MDIMKOV 12.10.2022: Mintsoft final data (finalItemsData) expected after executing _lib.groupReduceJsonWithChildren...
                        [{
                            "name": "KITNS (S)",
                            "children": [{
                                "OrderItemId": 87210,
                                "ProductInLocationId": 0,
                                "OrderId": 59307,
                                "Quantity": 1,
                                "ManuallyConfirmed": false,
                                "BatchNo": "Test-20230427-2",
                                "SerialNo": "Test-20230427-1",
                                "MobileApp": false,
                                "BoxNumber": 1,
                                "SSCCNumber": null,
                                "ID": 10391,
                                "LastUpdated": "2023-04-27T22:45:01.1012608",
                                "LastUpdatedByUser": "Jason.Wang"
                            }]
                        }, {
                            "name": "Bracelet",
                            "children": [{
                                "OrderItemId": 87207,
                                "ProductInLocationId": 0,
                                "OrderId": 59307,
                                "Quantity": 1,
                                "ManuallyConfirmed": false,
                                "BatchNo": null,
                                "SerialNo": "TEST-BRACELET-03",
                                "MobileApp": false,
                                "BoxNumber": 1,
                                "SSCCNumber": null,
                                "ID": 10392,
                                "LastUpdated": "2023-04-27T22:46:36.616162",
                                "LastUpdatedByUser": "Jason.Wang"
                            }]
                        }, {
                            "name": "SomeItem",
                            "children": [{
                                "OrderItemId": 87208,
                                "ProductInLocationId": 0,
                                "OrderId": 59307,
                                "Quantity": 12,
                                "ManuallyConfirmed": true,
                                "BatchNo": null,
                                "SerialNo": null,
                                "MobileApp": false,
                                "BoxNumber": 0,
                                "SSCCNumber": null,
                                "ID": 10393,
                                "LastUpdated": "2023-04-27T22:47:07.3621141",
                                "LastUpdatedByUser": "Jason.Wang"
                            }, {
                                "OrderItemId": 87209,
                                "ProductInLocationId": 0,
                                "OrderId": 59307,
                                "Quantity": 1,
                                "ManuallyConfirmed": true,
                                "BatchNo": null,
                                "SerialNo": null,
                                "MobileApp": false,
                                "BoxNumber": 0,
                                "SSCCNumber": null,
                                "ID": 10394,
                                "LastUpdated": "2023-04-27T22:47:12.0678735",
                                "LastUpdatedByUser": "Jason.Wang"
                            }]
                        }]
                        * */


                        // MDIMKOV 30.01.2023: since in some cases the record needs to be transformed with an [inventorylocation] parameter, try to
                        // transform it without it and, if needed, catch the error and try to transform it with the parameter
                        let recIf = null;
                        try {
                            recIf = record.transform({
                                fromType: record.Type.SALES_ORDER,
                                fromId: soId,
                                toType: record.Type.ITEM_FULFILLMENT,
                                isDynamic: true
                            });
                        } catch (e) {
                            recIf = record.transform({
                                fromType: record.Type.SALES_ORDER,
                                fromId: soId,
                                toType: record.Type.ITEM_FULFILLMENT,
                                isDynamic: true,
                                defaultValues: {
                                    inventorylocation: invLocation
                                }
                            });
                        }

                        const lineCount = recIf.getLineCount({
                            sublistId: 'item'
                        });
                        log.debug('MDIMKOV', '');
                        log.debug('MDIMKOV', 'Start iterating through item fulfillment line items...');
                        log.debug('MDIMKOV', 'lineCount: ' + lineCount);

                        // MDIMKOV 11.10.2022: this will be the JSON block that is for a given item
                        // it will be used 3 times (in a total of 3 iterations) - for the main line and the 2 components
                        let currentBlock = [];

                        // MDIMKOV 11.10.2022: introduce line types: A = main kit item; B = first component item; C = second component item
                        let lineType = 'A';

                        for (let i = 0; i < lineCount; i++) {

                            log.debug('MDIMKOV', '');
                            log.debug('MDIMKOV', '... now processing line ' + i);

                            // MDIMKOV 11.10.2022: clear the current block if we hit again a kit item (main item) line
                            if (lineType === 'A') {
                                currentBlock = [];
                            }

                            recIf.selectLine({
                                sublistId: 'item',
                                line: i
                            });

                            const invDetailRequired = recIf.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'inventorydetailreq',
                                line: i
                            });

                            // MDIMKOV 11.10.2022: if this is the main item in the kit item, get the name, exctract the JSON block, get the quantity etc.
                            // note that the same JSON block will be used for the next 2 lines as well
                            if (invDetailRequired === 'F') {
                                log.debug('MDIMKOV', '... this is a kit (main) item line');

                                // MDIMKOV 11.10.2022: find the item name (it's held in a custom field on the item record), then search for it in the incoming (already reduced) JSON
                                const itemId = recIf.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    line: i
                                });
                                const itemName = _lib.getFieldValue('custitem_akt_ogl_3pl_item_sku', 'item', itemId);
                                log.debug('MDIMKOV', 'itemName: ' + itemName);

                                currentBlock = finalItemsData.find(x => x.name === itemName);
                                log.debug('MDIMKOV', '... itemName: ' + itemName);
                                log.debug('MDIMKOV', '... currentBlock1: ' + JSON.stringify(currentBlock));

                                if (currentBlock) {

                                    // MDIMKOV 11.10.2022: this will be the quantity supplied by the external JSON file
                                    const quantityFromJSON = currentBlock.children.length;

                                    // MDIMKOV 21.10.2022: this will be the quantity currently suggested by the Item Fulfillment
                                    const quantityFromIF = recIf.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity'
                                    });

                                    // MDIMKOV 21.10.2022: this will be the quantity to be finally set on the line
                                    let quantity = 0;
                                    if (!quantityFromIF) {
                                        quantity = quantityFromJSON;
                                    } else {
                                        quantity = (quantityFromJSON < quantityFromIF) ? quantityFromJSON : quantityFromIF;
                                    }
                                    log.debug('MDIMKOV', '... quantityFromJSON: ' + quantityFromJSON);
                                    log.debug('MDIMKOV', '... quantityFromIF: ' + quantityFromIF);
                                    log.debug('MDIMKOV', '... quantity: ' + quantity);

                                    recIf.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: quantity    // this would be the quantity of items you want to fulfill for this kit SKU
                                    });

                                }

                                lineType = 'B'; // as the next line should be the first component line in the kit

                            } else { // this is a component item in the kit item, we need to set the inventory details for it
                                log.debug('MDIMKOV', '... this is a component line');

                                const invDetail = recIf.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                    line: i,
                                    isDynamic: true
                                });

                                // MDIMKOV 11.10.2022: add as many serial numbers as there is quantity on this component line;
                                // this component line quantity is automatically set by NetSuite, we need to get it and use it
                                const compQty = recIf.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity'
                                });

                                for (let j = 0; j < compQty; j++) {
                                    log.debug('MDIMKOV', '... ... now adding inventory assignment line with j=' + j);

                                    invDetail.selectNewLine({
                                        sublistId: 'inventoryassignment'
                                    });

                                    invDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: 1    // always 1 in case of serial numbers -- control how many items will be fulfilled with the same lot number
                                    });


                                    // MDIMKOV 11.10.2022: set either the SerialNo (1st component serial number) or the BatchNo (2nd component serial number)
                                    if (lineType === 'B') {
                                        log.debug('MDIMKOV', '... ... this is the first component line');
                                        invDetail.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'issueinventorynumber',
                                            value: _lib.getLotSerialNumIDs(currentBlock.children[j].SerialNo)
                                        });
                                    } else if (lineType === 'C') {
                                        log.debug('MDIMKOV', '... ... this is the second component line');
                                        invDetail.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'issueinventorynumber',
                                            value: _lib.getLotSerialNumIDs(currentBlock.children[j].BatchNo)
                                        });
                                    }

                                    invDetail.commitLine({
                                        sublistId: 'inventoryassignment'
                                    });
                                }


                                // MDIMKOV 11.10.2022: adjust the lineType for the next iteration and remove children, if needed
                                if (lineType === 'B') {
                                    lineType = 'C';
                                } else if (lineType === 'C') {
                                    lineType = 'A';

                                    // MDIMKOV 21.10.2022: now remove the [children] in the JSON that have been used so far; this way, on next iterations,
                                    // the next [children], i.e. SerialNo / BatchNo will be used
                                    currentBlock.children.splice(0, compQty);
                                }
                            }

                            recIf.commitLine({
                                sublistId: 'item'
                            });

                        }

                        // MDIMKOV 17.10.2022: set the tracking URL on the item fulfillment header
                        recIf.setValue('custbody_akt_3pl_tracking_url', trackingUrl);

                        const ifId = recIf.save();

                        if (ifId) {
                            // MDIMKOV 16.10.2022: log the newly-created item fulfillment
                            log.audit('MDIMKOV', '');
                            log.audit('MDIMKOV', 'created item fulfillment with id=' + ifId);

                            // MDIMKOV 15.10.2022: set the [Fulfilled by 3PL] checkbox on the sales order
                            _lib.setFieldValue('custbody_akt_3plfulfilled', 'salesorder', soId, true, false, false);

                            // MDIMKOV 16.10.2022: add the tracking number to each (actually just one) package line on the IF
                            addTrackingNumber(ifId, trackingNumber);

                            // MDIMKOV 18.10.2022: add the item fulfillment and sales order link to the staging area (custom) record type
                            rec.setValue('custrecord_sotoif_itemfulf', ifId);
                            rec.setValue('custrecord_sotoif_solink', soId);
                        }

                        // ========================= OGL / MINTSOFT [KIT ITEM WITH SERIAL NUMBERS] END ========================= //


                        // ========================= OGL / MINTSOFT [STAND-ALONE ITEM WITH SERIAL NUMBERS] START ========================= //


                        // ========================= OGL / MINTSOFT [STAND-ALONE ITEM WITH SERIAL NUMBERS] END ========================= //

                    } else if (providerName === 'Fastlog') {

                        // ========================= FASTLOG [KIT ITEM WITH SERIAL NUMBERS] START ========================= //


                        const fastlogOrderId = parseInt(rec.getValue('custrecord_sotoif_order_id'));
                        const soId = fastlogOrderId;

                        const trackingNumberArrayRaw = rec.getValue('custrecord_sotoif_tracking_number');
                        const trackingNumberArray = _lib.jsonparse(trackingNumberArrayRaw);

                        const trackingNumber = arrayToString(trackingNumberArray); // Fastlog sends an array, so this function makes a string of its members
                        const trackingUrlRaw = rec.getValue('custrecord_sotoif_tracking_url');
                        const trackingUrl = trackingUrlRaw.replaceAll(' ', '%20'); // remove empty spaces in URL
                        const invLocation = _lib.getFieldValue('location', 'salesorder', soId, null, 'value');

                        log.audit('MDIMKOV', 'Integration Provider: ' + 'Fastlog');
                        log.audit('MDIMKOV', 'NetSuite Sales Order ID -- soId: ' + soId);
                        log.audit('MDIMKOV', 'Fastlog Order ID -- fastlogOrderId: ' + fastlogOrderId);
                        log.debug('MDIMKOV', 'trackingNumberArray: ' + trackingNumberArray);


                        // MDIMKOV 17.10.2022: get the data about items shipped, which was directly exposed as a JSON in the custom record type
                        let itemsJSON = rec.getValue('custrecord_sotoif_items_json');
                        log.debug('initial itemsJSON', itemsJSON);
                        /* MDIMKOV 17.10.2022: Fastlog raw data expected
                        {
                            "OrderNumber": "24161",
                            "TrackingNumber": "996014447000000081",
                            "TrackingURL": "",
                            "Message": "Testauftrag 10046515",
                            "OrderItems": [
                            {
                                "SKU": "KITNS",
                                "Quantity": 2,
                                "bundles": [
                                    {
                                        "bundleNo": "21D247595E75",
                                        "items": [
                                            {
                                                "SKU": "G1",
                                                "Quantity": 1,
                                                "SerialNumbers": [
                                                    "21D247595E75"
                                                ]
                                            },
                                            {
                                                "SKU": "I1",
                                                "Quantity": 1,
                                                "SerialNumbers": [
                                                    "21BA88302203002373"
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "bundleNo": "21DC6DFBB51A",
                                        "items": [
                                            {
                                                "SKU": "G1",
                                                "Quantity": 1,
                                                "SerialNumbers": [
                                                    "21DC6DFBB51A"
                                                ]
                                            },
                                            {
                                                "SKU": "I1",
                                                "Quantity": 1,
                                                "SerialNumbers": [
                                                    "21BA88302203001708"
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                        }*/

                        itemsJSON.substring(1, itemsJSON.length - 1);
                        let nonSummarizedItemsJSON = itemsJSON.replaceAll(/&quot;/g, '\"');
                        nonSummarizedItemsJSON = JSON.parse(nonSummarizedItemsJSON);
                        /* MDIMKOV 17.10.2022: Fastlog itemsJSON expected:
                        [
                            {
                                "SKU": "I1",
                                "Quantity": 2,
                                "SerialNumbers": [
                                    "21BA88302203001729",
                                    "21BA88302203001341"
                                ]
                            },
                            {
                                "SKU": "KITNS",
                                "Quantity": 2,
                                "bundles": [
                                    {
                                        "bundleNo": "21D1974BE19F",
                                        "items": [
                                            {
                                                "SKU": "G1",
                                                "Quantity": 1,
                                                "SerialNumbers": [
                                                    "21D1974BE19F"
                                                ]
                                            },
                                            {
                                                "SKU": "I1",
                                                "Quantity": 1,
                                                "SerialNumbers": [
                                                    "21BA88302203002003"
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "bundleNo": "218ED4AD9E88",
                                        "items": [
                                            {
                                                "SKU": "G1",
                                                "Quantity": 1,
                                                "SerialNumbers": [
                                                    "218ED4AD9E88"
                                                ]
                                            },
                                            {
                                                "SKU": "I1",
                                                "Quantity": 1,
                                                "SerialNumbers": [
                                                    "21BA88302203001747"
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "SKU": "G1",
                                "Quantity": 2,
                                "SerialNumbers": [
                                    "212918A3338A",
                                    "21570659C7F9"
                                ]
                            }
                        ]*/


                        // MDIMKOV 17.03.2023: summarize the bundles, so they can be processed in bulk
                        const finalItemsJSON = summarizeBundlesForFlg(nonSummarizedItemsJSON);
                        /* after the previous JSON is processed, here's the output expected:
                        [
                            {
                                "SKU": "I1",
                                "Quantity": 2,
                                "SerialNumbers": [
                                    "21BA88302203001729",
                                    "21BA88302203001341"
                                ]
                            },
                            {
                                "SKU": "KITNS",
                                "Quantity": 2,
                                "bundles": [
                                    {
                                        "bundleNo": "",
                                        "items": [
                                            {
                                                "SKU": "G1",
                                                "Quantity": 2,
                                                "SerialNumbers": [
                                                    "21D1974BE19F", "218ED4AD9E88"
                                                ]
                                            },
                                            {
                                                "SKU": "I1",
                                                "Quantity": 2,
                                                "SerialNumbers": [
                                                    "21BA88302203002003", "21BA88302203001747"
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "SKU": "G1",
                                "Quantity": 2,
                                "SerialNumbers": [
                                    "212918A3338A",
                                    "21570659C7F9"
                                ]
                            }
                        ]*/


                        // MDIMKOV 17.10.2022: if no information about the items has been received, throw an error message
                        if (finalItemsJSON.length === 0) {
                            throw new Error('Could not get information about the items dispatched. The JSON returned is empty. Check the [getFastlogOrderItems] function');
                        }

                        // MDIMKOV 17.10.2022: start transforming the sales order into an item fulfillment
                        log.debug('MDIMKOV', 'Proceed with transforming the sales order into an item fulfillment');


                        // MDIMKOV 30.01.2023: since in some cases the record needs to be transformed with an [inventorylocation] parameter, try to
                        // transform it without it and, if needed, catch the error and try to transform it with the parameter
                        let recIf = null;
                        try {
                            recIf = record.transform({
                                fromType: record.Type.SALES_ORDER,
                                fromId: soId,
                                toType: record.Type.ITEM_FULFILLMENT,
                                isDynamic: true
                            });
                        } catch (e) {
                            recIf = record.transform({
                                fromType: record.Type.SALES_ORDER,
                                fromId: soId,
                                toType: record.Type.ITEM_FULFILLMENT,
                                isDynamic: true,
                                defaultValues: {
                                    inventorylocation: invLocation
                                }
                            });
                        }

                        const lineCount = recIf.getLineCount({
                            sublistId: 'item'
                        });
                        log.debug('MDIMKOV', '');
                        log.debug('MDIMKOV', 'Start iterating through item fulfillment line items...');
                        log.debug('MDIMKOV', 'lineCount: ' + lineCount);

                        // MDIMKOV 17.10.2022: this will be the JSON block that is for a given item
                        // it may either contain a stand-alone item with serial numbers, or kit items, with the component items and their serial numbers
                        let currentBlock = [];

                        for (let i = 0; i < lineCount; i++) {

                            log.debug('MDIMKOV', '');
                            log.debug('MDIMKOV', '... now processing line ' + i);

                            // MDIMKOV 17.10.2022: this will be the quantity that will be fulfilled on the line (i.e. the kit item main item quantity)
                            let quantity = 0; // this will be supplied externally by the JSON later

                            recIf.selectLine({
                                sublistId: 'item',
                                line: i
                            });


                            // MDIMKOV 17.10.2022: get item type, inventory detail line yes/no, as well as kit level -- where "1" means that the item is in a kit
                            const kitLevel = recIf.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'kitlevel',
                                line: i
                            }) || 0;

                            const itemType = recIf.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'itemtype',
                                line: i
                            });

                            const invDetailRequired = recIf.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'inventorydetailreq',
                                line: i
                            });

                            // MDIMKOV 17.10.2022: find the item name (it's held in a custom field on the item record), then use it to iterate through the JSON
                            const itemId = recIf.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: i
                            });
                            const itemName = _lib.getFieldValue('custitem_akt_flg_3pl_item_sku', 'item', itemId);
                            log.debug('MDIMKOV', '... itemName: ' + itemName);

                            if (invDetailRequired === 'F' && itemType === 'Kit') {

                                // MDIMKOV 17.10.2022: CASE A -- this is the main item in the kit item
                                log.debug('MDIMKOV', '... this is a kit (main) item line');

                                currentBlock = finalItemsJSON.find(x => x.SKU === itemName);
                                log.debug('MDIMKOV', '... currentBlock: ' + JSON.stringify(currentBlock));

                                // MDIMKOV 04.11.2022: remove this block from the finalItemsJSON (external JSON structure), so it is not re-used
                                const currentIndex = finalItemsJSON.findIndex(x => x.SKU === itemName);
                                finalItemsJSON.splice(currentIndex, 1);

                                // MDIMKOV 18.10.2022: get the quantity from the JSON and set it on the line
                                const compQty = currentBlock.Quantity || 0;
                                recIf.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: compQty
                                });

                            } else if (invDetailRequired === 'T' && itemType === 'InvtPart' && kitLevel) {

                                // MDIMKOV 17.10.2022: CASE B -- this a component line within the kit
                                log.debug('MDIMKOV', '... this is a component line within the kit');

                                const compQty = currentBlock.Quantity || 0;

                                // MDIMKOV 18.10.2022: make sure the JSON structure corresponds to kit item structure, meaning has the [bundles] object
                                if (!currentBlock.hasOwnProperty('bundles')) {
                                    throw new Error('The response seems to have information about stand-alone item, whereas ' +
                                        'currently a kit item is being processed');
                                }

                                // MDIMKOV 18.10.2022: in this section (component items in kit), we are working with the [currentBlock] provided in the previous section
                                const invDetail = recIf.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                    line: i,
                                    isDynamic: true
                                });

                                const serialNumbersToAdd = getFlgComponentSerialNumbers(currentBlock, itemName);

                                const serialNumberIDsArray = _lib.getLotSerialNumIDs(serialNumbersToAdd);

                                serialNumberIDsArray.forEach(function (element) {

                                    invDetail.selectNewLine({
                                        sublistId: 'inventoryassignment'
                                    });

                                    invDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: 1    // always 1 in case of serial numbers -- control how many items will be fulfilled with the same lot number
                                    });

                                    // MDIMKOV 17.10.2022: set the serial numbers
                                    invDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber',
                                        value: element
                                    });

                                    invDetail.commitLine({
                                        sublistId: 'inventoryassignment'
                                    });

                                });

                                /*for (let j = 0; j < compQty; j++) {

                                    const serialNumberToAdd = getFlgComponentSerialNumbers(currentBlock, j, itemName);
                                    const serialNumberIdToAdd = _lib.getLotSerialNumIDs(serialNumberToAdd);

                                    log.debug('MDIMKOV', '... ... now adding inventory assignment line with j=' + j);
                                    log.debug('MDIMKOV', '... .... serial number to add: ' + serialNumberToAdd + '; with id: ' + serialNumberIdToAdd);


                                    // MDIMKOV 17.10.2022: handle a case when the serial number cannot be found
                                    if (!serialNumberIdToAdd) {
                                        throw new Error('Serial number ' + serialNumberToAdd + ' does not exist in NetSuite for this item.')
                                    }


                                    invDetail.selectNewLine({
                                        sublistId: 'inventoryassignment'
                                    });

                                    invDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: 1    // always 1 in case of serial numbers -- control how many items will be fulfilled with the same lot number
                                    });

                                    // MDIMKOV 17.10.2022: set the serial numbers
                                    invDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber',
                                        value: serialNumberIdToAdd
                                    });

                                    invDetail.commitLine({
                                        sublistId: 'inventoryassignment'
                                    });
                                }*/


                            } else if (invDetailRequired === 'T' && itemType === 'InvtPart' && !kitLevel) {

                                // MDIMKOV 17.10.2022: CASE C -- this a stand-alone inventory item
                                log.debug('MDIMKOV', '... this a stand-alone inventory item');


                                // currentBlock = findFastlogCurrentBlock(itemsJSON, itemName);
                                currentBlock = finalItemsJSON.find(x => x.SKU === itemName);
                                log.debug('MDIMKOV', '... currentBlock: ' + JSON.stringify(currentBlock));

                                // MDIMKOV 04.11.2022: remove this block from the finalItemsJSON (external JSON structure), so it is not re-used
                                const currentIndex = finalItemsJSON.findIndex(x => x.SKU === itemName);
                                finalItemsJSON.splice(currentIndex, 1);

                                // MDIMKOV 17.10.2022: get the quantity from the JSON and set it on the line
                                const compQty = currentBlock.Quantity || 0;
                                recIf.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: compQty
                                });

                                const invDetail = recIf.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                    line: i,
                                    isDynamic: true
                                });

                                for (let j = 0; j < compQty; j++) {

                                    const serialNumberToAdd = currentBlock.SerialNumbers[j];
                                    const serialNumberIdToAdd = _lib.getLotSerialNumIDs(serialNumberToAdd);

                                    log.debug('MDIMKOV', '... ... now adding inventory assignment line with j=' + j);
                                    log.debug('MDIMKOV', '... .... serial number to add: ' + serialNumberToAdd + '; with id: ' + serialNumberIdToAdd);


                                    // MDIMKOV 17.10.2022: handle a case when the serial number cannot be found
                                    if (!serialNumberIdToAdd) {
                                        throw new Error('Serial number ' + serialNumberToAdd + ' does not exist in NetSuite for this item.')
                                    }


                                    invDetail.selectNewLine({
                                        sublistId: 'inventoryassignment'
                                    });

                                    invDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: 1    // always 1 in case of serial numbers -- control how many items will be fulfilled with the same lot number
                                    });

                                    // MDIMKOV 17.10.2022: set the serial numbers
                                    invDetail.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'issueinventorynumber',
                                        value: serialNumberIdToAdd
                                    });

                                    invDetail.commitLine({
                                        sublistId: 'inventoryassignment'
                                    });
                                }


                            }

                            recIf.commitLine({
                                sublistId: 'item'
                            });

                        }

                        // MDIMKOV 28.11.2022: set the tracking URL on the item fulfillment header
                        recIf.setValue('custbody_akt_3pl_tracking_url', trackingUrl);


                        const ifId = recIf.save();

                        if (ifId) {
                            // MDIMKOV 17.10.2022: log the newly-created item fulfillment
                            log.audit('MDIMKOV', 'Created item fulfillment with id=' + ifId);

                            // MDIMKOV 17.10.2022: set the [Fulfilled by 3PL] checkbox on the sales order
                            _lib.setFieldValue('custbody_akt_3plfulfilled', 'salesorder', soId, true, false, false);

                            // MDIMKOV 16.10.2022: add the tracking number to each (actually just one) package line on the IF
                            log.debug('MDIMKOV', 'trackingNumber: ' + trackingNumber);
                            addTrackingNumber(ifId, trackingNumber);

                            // MDIMKOV 18.10.2022: add the item fulfillment and sales order link to the staging area (custom) record type
                            rec.setValue('custrecord_sotoif_itemfulf', ifId);
                            rec.setValue('custrecord_sotoif_solink', soId);
                        }


                        // ========================= FASTLOG [KIT ITEM WITH SERIAL NUMBERS] END ========================= //

                    } else if (providerName === 'Kinesis') {

                        // ========================= KINESIS [KIT ITEM WITHOUT SERIAL NUMBERS] START ========================= //


                        // MDIMKOV 27.02.2023: get some of the main parameters
                        const kinesisOrderId = parseInt(rec.getValue('custrecord_sotoif_solink'));
                        const soId = kinesisOrderId;
                        const trackingNumber = rec.getValue('custrecord_sotoif_tracking_number');
                        const trackingUrlRaw = rec.getValue('custrecord_sotoif_tracking_url');
                        const trackingUrl = trackingUrlRaw.replaceAll(/\s|\t/g, ''); // remove empty spaces and tabs in URL
                        const invLocation = _lib.getFieldValue('location', 'salesorder', soId, null, 'value');
                        log.audit('MDIMKOV', 'Integration Provider: ' + 'Kinesis');
                        log.audit('MDIMKOV', 'NetSuite Sales Order ID -- soId: ' + soId);
                        log.audit('MDIMKOV', 'Kinesis Order ID -- kinesisOrderId: ' + kinesisOrderId);


                        // MDIMKOV 27.02.2023: transofrm fully the record, irrespective of the items
                        recIf = record.transform({
                            fromType: record.Type.SALES_ORDER,
                            fromId: soId,
                            toType: record.Type.ITEM_FULFILLMENT,
                            isDynamic: true,
                            defaultValues: {
                                inventorylocation: invLocation
                            }
                        });

                        const lineCount = recIf.getLineCount({sublistId: 'item'});

                        for (let i = 0; i < lineCount; i++) {
                            recIf.selectLine({
                                sublistId: 'item',
                                line: i
                            });

                            const remainingQuantity = recIf.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantityremaining'
                            });

                            if (remainingQuantity > 0) {
                                recIf.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    value: remainingQuantity
                                });
                            }

                            // MDIMKOV 28.11.2022: set the tracking URL on the item fulfillment header
                            recIf.setValue('custbody_akt_3pl_tracking_url', trackingUrl);

                            recIf.commitLine({
                                sublistId: 'item'
                            });
                        }

                        const ifId = recIf.save();

                        // MDIMKOV 27.02.2023: set the sales order as fulfilled (checkbox ticked), and attach the new record to the staging area record
                        if (ifId) {
                            // MDIMKOV 27.02.2023: log the newly-created item fulfillment
                            log.audit('MDIMKOV', 'Created item fulfillment with id=' + ifId);

                            // MDIMKOV 27.02.2023: set the [Fulfilled by 3PL] checkbox on the sales order
                            _lib.setFieldValue('custbody_akt_3plfulfilled', 'salesorder', soId, true, false, false);

                            // MDIMKOV 27.02.2023: add the tracking number to each (actually just one) package line on the IF
                            addTrackingNumberKin(ifId, trackingNumber);

                            // MDIMKOV 27.02.2023: add the item fulfillment and sales order link to the staging area (custom) record type
                            rec.setValue('custrecord_sotoif_itemfulf', ifId);
                            rec.setValue('custrecord_sotoif_solink', soId);
                        }

                        // throw new Error('Stop Execution');

                        // ========================= KINESIS [KIT ITEM WITHOUT SERIAL NUMBERS] END ========================= //

                    }

                }

                _lib.logGovernanceUsageRemaining('script end');
                log.audit('MDIMKOV', '--- SCRIPT END ---');
            } catch (e) {
                // MDIMKOV 14.10.2022: for some of the common error messages, the error message is being translated into a more friendly message
                log.error('ERROR', getFriendlyMessage(e.message) + e.message + ' --- ' + e.stack);
                throw (getFriendlyMessage(e.message) + e.message);
            }
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

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
