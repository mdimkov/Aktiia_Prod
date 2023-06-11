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


        /* MDIMKOV 20.11.2022: this UE script, deployed on [AKT Integr RMA to IR], firing on [beforeSubmit], does the following:
             - general note: anything [Mintsoft] related pertains to [OGL]
             - defines if call is coming from Mintsoft/OGL or from Fastlog, by checking the [custrecord_rmatoir_3pl_provider] field (set in Celigo import mapping)
             - captures the respective return authorization, before the custom record has been created
             - groups/reduces the JSON that describes the items and serial numbers to be grouped by SKU (see next blocks with raw and grouped data)
             - tries to create an item receipt with JSON information about the items and their serial numbers
             - because of many limiations, for OGL only kit items with up to 2 components will be fulfilled at this stage
             - if the script fails, the whole creation of the record fails, which signals back to Celigo and raises an error message
			 - once the item receipt is created, it's stamped into the respective field on the custom record type
			 - trying to create a record for an integration id that already exists on another record results in an error
			 - for Kinesis: gets the information from the webhook, gets the NetSuite [return authorization], by using the Kinesis [returnId]
         */


        // MDIMKOV 20.11.2022: this function converts some of the common error messages into a friendly error message depending on the case
        function getFriendlyMessage(errorMessage) {

            let returnMessage = '';

            // MDIMKOV 20.11.2022: message that tells you that the serial number used is not valid;
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


        // MDIMKOV 20.11.2022: this function check if a record in the custom record type already exists for this integration id; if yes, the script exists
        function checkIfRecExists(integrationId) {
            const internalId = _lib.singleRecordSearch('customrecord_akt_rmatoir',
                ['custrecord_rmatoir_integrationid', 'is', integrationId],
                'internalid')

            if (internalId) {
                throw new Error('There is already a record for Integration Id ' + integrationId + '; ' +
                    'to re-create the item receipt, ' +
                    'delete the staging integration record and the respective item receipt first');
            }
        }


        // MDIMKOV 24.03.2023: this function finds the respective NetSuite [Return Authorization] based on the external return Id (the 3PL return Id)
        function findReturnBy3PlId(return3PlId) {
            let returnValue = null;

            const mySearch = search.create({
                type: 'returnauthorization',
                filters: [
                    ['type', 'anyof', 'RtnAuth'],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['custbody_akt_ogl_3pl_return_id', 'is', return3PlId]
                ],
                columns: ['internalid']
            });

            mySearch.run().each(function (result) {
                returnValue = result.getValue(result.columns[0]);
                return false; // only the single (or first) record needs to be returned
            });

            return returnValue;
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

                    // MDIMKOV 20.11.2022: declare variables, extract the items JSON from the respective field
                    const rec = context.newRecord;
                    const integrationId = rec.getValue('custrecord_rmatoir_integrationid');
                    const providerName = rec.getValue('custrecord_rmatoir_3pl_provider');


                    // MDIMKOV 20.11.2022: check if a record with this integration id already exists and if so, throw error message (fed back to Celigo)
                    checkIfRecExists(integrationId);


                    // MDIMKOV 20.11.2022: based on which 3PL provider is sending the call, redirect to a different block of code
                    if (providerName === 'OGL') {

                        // ========================= OGL / MINTSOFT START ========================= //


                        const mintSoftReturnId = parseInt(rec.getValue('custrecord_rmatoir_return_id'));
                        const raId = rec.getValue('custrecord_rmatoir_rmalink');
                        log.debug('MDIMKOV', 'NetSuite Return Authorization ID -- raId: ' + raId);
                        log.debug('MDIMKOV', 'Mintsoft Return ID -- mintSoftReturnId: ' + mintSoftReturnId);


                        // MDIMKOV 20.11.2022: get the information about items to be processed
                        let itemsJSON = rec.getValue('custrecord_rmatoir_items_json');


                        // MDIMKOV 20.11.2022: raw itemsJSON expected (except, it will have '&quot;' instead of '"':
                        // NOTE: it can have parent/kit items (in case of refund) or just components (in case of replacement); quantity is always 1;
                        /*
                            [
                                {
                                   ReturnItems: [
                                      {
                                         OrderItemId: 50054,
                                         ProductId: 15850,
                                         Quantity: 1,
                                         ReturnReasonId: 1,
                                         Action: "NONE",
                                         Comments: "",
                                         ExpiryDate: "9999-12-31T23:59:59.9999999",
                                         BatchNo: "TEST-CUFF-01",
                                         SerialNo: "TEST-BRACELET-01",
                                         ReturnedToStock: true,
                                         StockAction: "DoNothing",
                                         ReturnId: 80,
                                         SKU: "KITNS (S)",
                                         ReturnReasonName: "Unwanted - Good Stock",
                                         NAME: "202206A1",
                                         LeftToPutAway: 0,
                                         ID: 68,
                                         LastUpdated: "2022-11-17T15:08:03.9634907",
                                         LastUpdatedByUser: "Jason.Wang"
                                      },
                                      {
                                         OrderItemId: 50054,
                                         ProductId: 15850,
                                         Quantity: 1,
                                         ReturnReasonId: 1,
                                         Action: "NONE",
                                         Comments: "",
                                         ExpiryDate: "9999-12-31T23:59:59.9999999",
                                         BatchNo: "TEST-CUFF-02",
                                         SerialNo: "TEST-BRACELET-02",
                                         ReturnedToStock: true,
                                         StockAction: "DoNothing",
                                         ReturnId: 80,
                                         SKU: "KITNS (S)",
                                         ReturnReasonName: "Unwanted - Good Stock",
                                         NAME: "202206A1",
                                         LeftToPutAway: 0,
                                         ID: 69,
                                         LastUpdated: "2022-11-17T15:08:04.0416161",
                                         LastUpdatedByUser: "Jason.Wang"
                                      }
                                   ],
                                   OrderId: 34368,
                                   AdvancedExternalReturn: false,
                                   Confirmed: true,
                                   Exchanged: false,
                                   Refunded: true,
                                   ExchangedOrderId: 0,
                                   Invoiced: true,
                                   Reference: null,
                                   OrderNumber: "196075",
                                   ClientId: 33,
                                   ID: 80,
                                   LastUpdated: "2022-11-17T15:08:04.0416161",
                                   LastUpdatedByUser: "Jason.Wang"
                                }
                            ]
                         */


                        // MDIMKOV 21.11.2022: convert the string into valid JSON, by replacing all '&quote;' with '"'
                        itemsJSON = _lib.jsonparse(itemsJSON);
                        log.debug('MDIMKOV', 'itemsJSON to start with: ' + JSON.stringify(itemsJSON));


                        // MDIMKOV 21.11.2022: take just the "items" part of the object
                        itemsJSON = itemsJSON[0].ReturnItems;


                        // MDIMKOV 21.11.2022: itemsJSON expected so far:
                        /* [
                                {
                                    "OrderItemId": 50054,
                                    "ProductId": 15850,
                                    "Quantity": 1,
                                    "ReturnReasonId": 1,
                                    "Action": "NONE",
                                    "Comments": "",
                                    "ExpiryDate": "9999-12-31T23:59:59.9999999",
                                    "BatchNo": "TEST-CUFF-01",
                                    "SerialNo": "TEST-BRACELET-01",
                                    "ReturnedToStock": true,
                                    "StockAction": "DoNothing",
                                    "ReturnId": 80,
                                    "SKU": "KITNS (S)",
                                    "ReturnReasonName": "Unwanted - Good Stock",
                                    "NAME": "202206A1",
                                    "LeftToPutAway": 0,
                                    "ID": 68,
                                    "LastUpdated": "2022-11-17T15:08:03.9634907",
                                    "LastUpdatedByUser": "Jason.Wang"
                                },
                                {
                                    "OrderItemId": 50054,
                                    "ProductId": 15850,
                                    "Quantity": 1,
                                    "ReturnReasonId": 1,
                                    "Action": "NONE",
                                    "Comments": "",
                                    "ExpiryDate": "9999-12-31T23:59:59.9999999",
                                    "BatchNo": "TEST-CUFF-02",
                                    "SerialNo": "TEST-BRACELET-02",
                                    "ReturnedToStock": true,
                                    "StockAction": "DoNothing",
                                    "ReturnId": 80,
                                    "SKU": "KITNS (S)",
                                    "ReturnReasonName": "Unwanted - Good Stock",
                                    "NAME": "202206A1",
                                    "LeftToPutAway": 0,
                                    "ID": 69,
                                    "LastUpdated": "2022-11-17T15:08:04.0416161",
                                    "LastUpdatedByUser": "Jason.Wang"
                                }
                            ]
                        * */


                        log.debug('MDIMKOV', 'itemsJSON (before reduce): ' + JSON.stringify(itemsJSON));

                        // MDIMKOV 20.11.2022: create a new JSON that will group the serial / batch number by kit item SKU; due to many technical limitations,
                        // the serial number will be the serial number for the bracelet and the batch number will be the *serial* number for cuff
                        let finalItemsData = _lib.groupReduceJsonWithChildren(itemsJSON, 'SKU');
                        log.debug('MDIMKOV', 'finalItemsData (after reduce): ' + JSON.stringify(finalItemsData));


                        // MDIMKOV 21.11.2022: simplify the final JSON by removing all unnecessary keys
                        finalItemsData.forEach(function (element) {
                            element.children.forEach(function (child) {
                                delete child.Action;
                                delete child.Comments;
                                delete child.ExpiryDate;
                                delete child.ID;
                                delete child.LastUpdated;
                                delete child.LastUpdatedByUser;
                                delete child.LeftToPutAway;
                                delete child.NAME;
                                delete child.OrderItemId;
                                delete child.Quantity;
                                delete child.ReturnReasonId;
                                delete child.ReturnedToStock;
                                delete child.StockAction;
                                delete child.ProductId;
                                delete child.ReturnId;
                            });
                        });
                        log.debug('MDIMKOV', 'finalItemsData (really final): ' + JSON.stringify(finalItemsData));

                        // MDIMKOV 21.11.2022: the very final data to work with should look like the following:
                        /*
                         {
                           name: "KITNS (S)",
                           children: [
                              {
                                 BatchNo: "TEST-CUFF-01",
                                 SerialNo: "TEST-BRACELET-01",
                                 ReturnReasonName: "Unwanted - Good Stock"
                              },
                              {
                                 BatchNo: "TEST-CUFF-02",
                                 SerialNo: "TEST-BRACELET-02",
                                 ReturnReasonName: "Unwanted - Good Stock"
                              }
                           ]
                        }
                        * */


                        // MDIMKOV 20.11.2022: start transforming the Return Authorization into an item receipt
                        log.debug('MDIMKOV', 'Proceed with transforming the Return Authorization into an item receipt');

                        const recIr = record.transform({
                            fromType: record.Type.RETURN_AUTHORIZATION,
                            fromId: raId,
                            toType: record.Type.ITEM_RECEIPT,
                            isDynamic: true,
                        });


                        // MDIMKOV 05.06.2023: copy all field values from the fields in the [Returns and Refunds] subtab to the item receipt
                        const recRA = record.load({
                            type: record.Type.RETURN_AUTHORIZATION,
                            id: raId
                        });

                        const return_type = recRA.getValue('custbody_akt_return_type');
                        const repl_comments = recRA.getValue('custbody_akt_repl_comments');
                        const refund_type = recRA.getValue('custbody_akt_refund_type');
                        const refund_amount = recRA.getValue('custbody_akt_refund_amount');
                        const refund_reason = recRA.getValue('custbody_akt_refund_reason');
                        const hq_inspection = recRA.getValue('custbody_akt_hq_inspection');
                        const return_comment = recRA.getValue('custbody_akt_3pl_return_comment');
                        const return_to_akt = recRA.getValue('custbody_akt_return_to_akt');

                        recIr.setValue('custbody_akt_return_type', return_type);
                        recIr.setValue('custbody_akt_repl_comments', repl_comments);
                        recIr.setValue('custbody_akt_refund_type', refund_type);
                        recIr.setValue('custbody_akt_refund_amount', refund_amount);
                        recIr.setValue('custbody_akt_refund_reason', refund_reason);
                        recIr.setValue('custbody_akt_hq_inspection', hq_inspection);
                        recIr.setValue('custbody_akt_3pl_return_comment', return_comment);
                        recIr.setValue('custbody_akt_return_to_akt', return_to_akt);


                        const lineCount = recIr.getLineCount({
                            sublistId: 'item'
                        });
                        log.debug('MDIMKOV', '');
                        log.debug('MDIMKOV', 'Start iterating through item receipt line items...');
                        log.debug('MDIMKOV', 'lineCount: ' + lineCount);

                        // MDIMKOV 20.11.2022: this will be the JSON block that is for a given item
                        // it will be used 3 times (in a total of 3 iterations) - for the main line and the 2 components
                        let currentBlock = [];

                        // MDIMKOV 20.11.2022: introduce line types: A = main kit item; B = first component item; C = second component item
                        let lineType = 'A';

                        for (let i = 0; i < lineCount; i++) {

                            log.debug('MDIMKOV', '');
                            log.debug('MDIMKOV', '... now processing line ' + i);

                            // MDIMKOV 20.11.2022: clear the current block if we hit again a kit item (main item) line
                            if (lineType === 'A') {
                                currentBlock = [];
                            }

                            recIr.selectLine({
                                sublistId: 'item',
                                line: i
                            });

                            const invDetailRequired = recIr.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'inventorydetailreq',
                                line: i
                            });

                            const itemType = recIr.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'itemtype',
                                line: i
                            });

                            const kitMemberOf = recIr.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'kitmemberof',
                                line: i
                            });

                            // MDIMKOV 20.11.2022: if this is the main item in the kit item, get the name, exctract the JSON block, get the quantity etc.
                            // note that the same JSON block will be used for the next 2 lines as well
                            if (invDetailRequired === 'F' && itemType === 'Kit') {
                                log.debug('MDIMKOV', '... this is a kit (main) item line');

                                // MDIMKOV 20.11.2022: find the item name (it's held in a custom field on the item record), then search for it in the incoming (already reduced) JSON
                                const itemId = recIr.getSublistValue({
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

                                    // MDIMKOV 20.11.2022: this will be the quantity supplied by the external JSON file
                                    const quantityFromJSON = currentBlock.children.length;

                                    // MDIMKOV 20.11.2022: this will be the quantity currently suggested by the item receipt
                                    const quantityFromIF = recIr.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity'
                                    });

                                    // MDIMKOV 20.11.2022: this will be the quantity to be finally set on the line
                                    const quantity = (quantityFromJSON < quantityFromIF) ? quantityFromJSON : quantityFromIF;
                                    log.debug('MDIMKOV', '... quantityFromJSON: ' + quantityFromJSON);
                                    log.debug('MDIMKOV', '... quantityFromIF: ' + quantityFromIF);
                                    log.debug('MDIMKOV', '... quantity: ' + quantity);

                                    recIr.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: quantity    // this would be the quantity of items you want to fulfill for this kit SKU
                                    });

                                }

                                lineType = 'B'; // as the next line should be the first component line in the kit

                            } else if (invDetailRequired === 'T' && itemType !== 'Kit' && kitMemberOf) { // this is a component item in the kit item, we need to set the inventory details for it
                                log.debug('MDIMKOV', '... this is a component line');

                                const invDetail = recIr.getCurrentSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                    line: i,
                                    isDynamic: true
                                });

                                // MDIMKOV 20.11.2022: add as many serial numbers as there is quantity on this component line;
                                // this component line quantity is automatically set by NetSuite, we need to get it and use it
                                const compQty = recIr.getCurrentSublistValue({
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


                                    // MDIMKOV 20.11.2022: set either the SerialNo (1st component serial number) or the BatchNo (2nd component serial number)
                                    if (lineType === 'B') {
                                        log.debug('MDIMKOV', '... ... this is the first component line');

                                        const serialNo = currentBlock.children[j].SerialNo;
                                        log.debug('MDIMKOV', '... ... ... serialNo (for bracelet): ' + serialNo);

                                        invDetail.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'receiptinventorynumber',
                                            value: serialNo
                                        });
                                    } else if (lineType === 'C') {
                                        log.debug('MDIMKOV', '... ... this is the second component line');

                                        const batchNo = currentBlock.children[j].BatchNo;
                                        log.debug('MDIMKOV', '... ... ... batchNo (for cuff): ' + batchNo);

                                        invDetail.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'receiptinventorynumber',
                                            value: batchNo
                                        });
                                    }

                                    invDetail.commitLine({
                                        sublistId: 'inventoryassignment'
                                    });
                                }


                                // MDIMKOV 20.11.2022: adjust the lineType for the next iteration and remove children, if needed
                                if (lineType === 'B') {
                                    lineType = 'C';
                                } else if (lineType === 'C') {
                                    lineType = 'A';

                                    // MDIMKOV 20.11.2022: now remove the [children] in the JSON that have been used so far; this way, on next iterations,
                                    // the next [children], i.e. SerialNo / BatchNo will be used
                                    currentBlock.children.splice(0, compQty);
                                }
                            } else if (invDetailRequired === 'T' && itemType !== 'Kit' && !kitMemberOf) { // this is stand-alone line item
                                log.debug('MDIMKOV', '... this is a stand-alone line item');

                                // MDIMKOV 20.11.2022: find the item name (it's held in a custom field on the item record), then search for it in the incoming (already reduced) JSON
                                const itemId = recIr.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    line: i
                                });
                                let itemName = _lib.getFieldValue('custitem_akt_ogl_3pl_item_sku', 'item', itemId);
                                currentBlock = finalItemsData.find(x => x.name === itemName);
                                log.debug('MDIMKOV', '... itemName: ' + itemName);
                                log.debug('MDIMKOV', '... currentBlock1: ' + JSON.stringify(currentBlock));

                                // MDIMKOV 28.03.2023: if current block not found, this is probably stand-alone kit *component*, rather than stand-alone item
                                // so, check this by testing with the main "KITNS (S)" item, for which the item ID is 258
                                if (!currentBlock) {
                                    log.debug('MDIMKOV', '... current block is not defined, so this item does not exist in JSON; testing to see if this is not a component in a kit item instead');

                                    itemName = _lib.getFieldValue('custitem_akt_ogl_3pl_item_sku', 'item', 258); // find the name for KIT (item id = 258)
                                    currentBlock = finalItemsData.find(x => x.name === itemName);
                                    log.debug('MDIMKOV', '... itemName: ' + itemName);
                                    log.debug('MDIMKOV', '... currentBlock1: ' + JSON.stringify(currentBlock));
                                }


                                if (currentBlock) {

                                    // MDIMKOV 20.11.2022: this will be the quantity supplied by the external JSON file
                                    const quantityFromJSON = currentBlock.children.length;

                                    // MDIMKOV 20.11.2022: this will be the quantity currently suggested by the item receipt
                                    const quantityFromIF = recIr.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity'
                                    });

                                    // MDIMKOV 20.11.2022: this will be the quantity to be finally set on the line
                                    const quantity = (quantityFromJSON < quantityFromIF) ? quantityFromJSON : quantityFromIF;
                                    log.debug('MDIMKOV', '... quantityFromJSON: ' + quantityFromJSON);
                                    log.debug('MDIMKOV', '... quantityFromIF: ' + quantityFromIF);
                                    log.debug('MDIMKOV', '... quantity: ' + quantity);

                                    recIr.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: quantity    // this would be the quantity of items you want to fulfill for this kit SKU
                                    });

                                    const invDetail = recIr.getCurrentSublistSubrecord({
                                        sublistId: 'item',
                                        fieldId: 'inventorydetail',
                                        line: i,
                                        isDynamic: true
                                    });

                                    // MDIMKOV 20.11.2022: add as many serial numbers as there is quantity on this component line;
                                    // this component line quantity is automatically set by NetSuite, we need to get it and use it
                                    const compQty = recIr.getCurrentSublistValue({
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


                                        // MDIMKOV 20.11.2022: set either the SerialNo or the BatchNo (whatever was populated) as the serial number
                                        const serialNo = currentBlock.children[j].SerialNo;
                                        const batchNo = currentBlock.children[j].BatchNo;
                                        const finalSerialNo = serialNo ? serialNo : batchNo;
                                        log.debug('MDIMKOV', '... ... ... finalSerialNo: ' + finalSerialNo);

                                        invDetail.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'receiptinventorynumber',
                                            value: finalSerialNo
                                        });


                                        invDetail.commitLine({
                                            sublistId: 'inventoryassignment'
                                        });
                                    }

                                }


                            }

                            recIr.commitLine({
                                sublistId: 'item'
                            });

                        }

                        const ifId = recIr.save();

                        if (ifId) {
                            // MDIMKOV 20.11.2022: log the newly-created item receipt
                            log.audit('MDIMKOV', '');
                            log.audit('MDIMKOV', 'created item receipt with id=' + ifId);

                            // MDIMKOV 20.11.2022: set the [Fulfilled by 3PL] checkbox on the Return Authorization
                            _lib.setFieldValue('custbody_akt_3pl_return_complete', 'returnauthorization', raId, true, false, false);

                            // MDIMKOV 20.11.2022: add the item receipt and Return Authorization link to the staging area (custom) record type
                            rec.setValue('custrecord_rmatoir_itemfulf', ifId);
                            rec.setValue('custrecord_rmatoir_rmalink', raId);
                        }

                        // ========================= OGL / MINTSOFT END ========================= //

                    } else if (providerName === 'FLG') {

                        // ========================= FASTLOG START ========================= //


                        // ... at this point Fastlog will not be implemented and will be handled manually


                        // ========================= FASTLOG END ========================= //

                    } else if (providerName === 'KIN') {

                        // ========================= KINESIS START ========================= //

                        const kinesisReturnId = rec.getValue('custrecord_rmatoir_return_id');
                        log.debug('MDIMKOV', 'Kinesis Return ID -- kinesisReturnId: ' + kinesisReturnId);


                        // MDIMKOV 24.03.2023: find the [return authorization] in NetSuite, to start converting it
                        const raId = findReturnBy3PlId(kinesisReturnId);
                        log.debug('MDIMKOV', 'NetSuite Return Authorization internal id: ' + raId);


                        // MDIMKOV 24.03.2023: if the NetSuite [return authorization] is not found, raise a friendly message
                        if (!raId) {
                            throw new Error('Could not find a NetSuite Return Authorization for Kinesis returnId ' + kinesisReturnId);
                        }


                        // MDIMKOV 24.03.2023: stamp the NetSuite [return authorization] internal id into the custom record type:
                        rec.setValue('custrecord_rmatoir_rmalink', raId);


                        // MDIMKOV 24.03.2023: get the information about items to be processed
                        let itemsJSON = rec.getValue('custrecord_rmatoir_items_json');


                        // MDIMKOV 21.11.2022: convert the string into valid JSON, by replacing all '&quote;' with '"'
                        itemsJSON = _lib.jsonparse(itemsJSON);
                        log.debug('MDIMKOV', 'itemsJSON to start with: ' + JSON.stringify(itemsJSON));


                        // MDIMKOV 24.03.2023: start transforming the Return Authorization into an item receipt
                        log.debug('MDIMKOV', 'Proceed with transforming the Return Authorization into an item receipt');

                        const recIr = record.transform({
                            fromType: record.Type.RETURN_AUTHORIZATION,
                            fromId: raId,
                            toType: record.Type.ITEM_RECEIPT,
                            isDynamic: true,
                        });


                        // MDIMKOV 05.06.2023: copy all field values from the fields in the [Returns and Refunds] subtab to the item receipt
                        const recRA = record.load({
                            type: record.Type.RETURN_AUTHORIZATION,
                            id: raId
                        });

                        const return_type = recRA.getValue('custbody_akt_return_type');
                        const repl_comments = recRA.getValue('custbody_akt_repl_comments');
                        const refund_type = recRA.getValue('custbody_akt_refund_type');
                        const refund_amount = recRA.getValue('custbody_akt_refund_amount');
                        const refund_reason = recRA.getValue('custbody_akt_refund_reason');
                        const hq_inspection = recRA.getValue('custbody_akt_hq_inspection');
                        const return_comment = recRA.getValue('custbody_akt_3pl_return_comment');
                        const return_to_akt = recRA.getValue('custbody_akt_return_to_akt');

                        recIr.setValue('custbody_akt_return_type', return_type);
                        recIr.setValue('custbody_akt_repl_comments', repl_comments);
                        recIr.setValue('custbody_akt_refund_type', refund_type);
                        recIr.setValue('custbody_akt_refund_amount', refund_amount);
                        recIr.setValue('custbody_akt_refund_reason', refund_reason);
                        recIr.setValue('custbody_akt_hq_inspection', hq_inspection);
                        recIr.setValue('custbody_akt_3pl_return_comment', return_comment);
                        recIr.setValue('custbody_akt_return_to_akt', return_to_akt);

                        // MDIMKOV 24.03.2023: directly save the transormed record
                        recIr.save();

                        const ifId = recIr.save();

                        if (ifId) {
                            // MDIMKOV 29.03.2023: log the newly-created item receipt
                            log.audit('MDIMKOV', '');
                            log.audit('MDIMKOV', 'created item receipt with id=' + ifId);

                            // MDIMKOV 29.03.2023: set the [Fulfilled by 3PL] checkbox on the Return Authorization
                            _lib.setFieldValue('custbody_akt_3pl_return_complete', 'returnauthorization', raId, true, false, false);

                            // MDIMKOV 29.03.2023: add the item receipt and Return Authorization link to the staging area (custom) record type
                            rec.setValue('custrecord_rmatoir_itemfulf', ifId);
                            rec.setValue('custrecord_rmatoir_rmalink', raId);
                        }


                        // ========================= KINESIS END ========================= //

                    }

                }

                _lib.logGovernanceUsageRemaining('script end');
                log.audit('MDIMKOV', '--- SCRIPT END ---');
            } catch (e) {
                // MDIMKOV 20.11.2022: for some of the common error messages, the error message is being translated into a more friendly message
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
