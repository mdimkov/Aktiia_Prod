/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{runtime} runtime
     */
    (record, search, runtime) => {

        /* MDIMKOV 25.03.2022: this map reduce script does the following:
        *   - searches for a saved search to process (search id suffix is given by a script parameter)
        *   - processes all the records in the saved search and attempts to delete them
        *  to run the script, proceed as follows:
        *   - create a saved search with ID such as "customsearch_massdel_mysuffix"
        *   - in the [Saved Search Suffix] script parameter enter your suffix, such as "_suffix"
        *   - this way you can toggle between different saved searches (e.g. one for journal entries and one for a custom record etc.)
        */


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

        const getInputData = (inputContext) => {
            try {
                log.audit('MDIMKOV', '--- SCRIPT START ---');

                // MDIMKOV 25.03.2022: get the respective script parameter that gives the saved search suffix
                const scriptObj = runtime.getCurrentScript();
                const ssSuffix = scriptObj.getParameter('custscript_md_ss_suffix');

                const searchId = 'customsearch_massdel' + ssSuffix;

                let mySearch = '';

                try {
                    mySearch = search.load({
                        id: searchId
                    });
                } catch (e) {
                    log.error('Saved Search Warning', 'Could not load saved search with id ' + searchId);
                }

                // MDIMKOV 25.03.2022: used for logging the number of results to be processed
                var searchResults = mySearch.run().getRange({
                    start: 0,
                    end: 1000
                });

                const recNum = searchResults.length >= 1000 ? 'more than 1000' : searchResults.length;

                log.audit('MDIMKOV', 'Number of records to process: ' + recNum);

                return mySearch;

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
                log.debug('MDIMKOV', '--- MAP START ---');

                log.debug('mapContext', mapContext);

                const recId = JSON.parse(mapContext.key);
                const recObj = JSON.parse(mapContext.value);
                const recType = recObj.recordType;
                log.debug('MDIMKOV', 'recType: ' + recType);

                try {
                    record.delete({
                        type: recType,
                        id: recId
                    });
                } catch (e) {
                    log.debug('Delete Warning', 'Could not delete record: ' + e.message);
                }

                log.debug('MDIMKOV', '--- MAP END ---');
            } catch
                (e) {
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

            // MDIMKOV 25.03.2022: finally, clear the script parameter (set it to _xxx), so the user doesn't run the script in error next time
            setScriptParameter('custscript_md_ss_suffix', '_xxx');

            log.audit('MDIMKOV', '--- SCRIPT END ---');
        }

        // MDIMKOV 25.03.2022: this function sets a script parameter to a given value or clears it
        function setScriptParameter(param, value) {
            var me = runtime.getCurrentScript();
            var mySearch = search.create({
                type: search.Type.SCRIPT_DEPLOYMENT,
                filters: [
                    search.createFilter({
                        name: 'scriptid',
                        operator: search.Operator.IS,
                        values: me.deploymentId
                    })
                ]
            });

            var searchResults = mySearch.run().getRange({
                start: 0,
                end: 1
            });

            for (var i = 0; i < searchResults.length; i++) {
                var recDeployment = record.load({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    id: searchResults[i].id
                });
                recDeployment.setValue(param, value);
                recDeployment.save();
            }
        }

        return {getInputData, map, reduce, summarize}

    });



