/**
 * _lib.js
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define(['N/record', 'N/search', 'N/runtime', 'N/url', 'N/currency', 'N/format'],

    function (record, search, runtime, url, currency, format) {
        /**
         * @param {record} record
         * @param {search} search
         * @param {runtime} runtime
         * @param {url} url
         * @param {currency} currency
         * @param {format} format
         */

        // MDIMKOV 23.06.2022: this function is used in several other functions to add an indent level in logging, such as '... ... xxxx'
        function addIndents(indentLevel) {
            let indent = '';
            if (indentLevel) {
                for (let i = 0; i < indentLevel; i++) {
                    indent += '... '
                }
            }
            return indent;
        }


        /* =============== LOAD ITEM IRRESPECTIVE OF ITEM TYPE =============== */

        /*
     * MDIMKOV 28.03.2020: this function loads an item record, irrespective of each type, as otherwise the type needs to be known and set respectively
     *
     * RETURNS: item record instance
     *
     * USAGE:
     *
     * var recItem = loadItemRec(itemId);
     *
     * */

        function loadItemRec(theId) {

            var itemTypes = [record.Type.SERVICE_ITEM,
                record.Type.INVENTORY_ITEM, record.Type.NON_INVENTORY_ITEM, record.Type.OTHER_CHARGE_ITEM, record.Type.ASSEMBLY_ITEM,
                record.Type.DESCRIPTION_ITEM, record.Type.DISCOUNT_ITEM, record.Type.DOWNLOAD_ITEM, record.Type.GIFT_CERTIFICATE_ITEM,
                record.Type.KIT_ITEM, record.Type.LOT_NUMBERED_ASSEMBLY_ITEM, record.Type.LOT_NUMBERED_INVENTORY_ITEM, record.Type.MARKUP_ITEM,
                record.Type.PAYMENT_ITEM, record.Type.PAYROLL_ITEM, record.Type.REALLOCATE_ITEM, record.Type.SALES_TAX_ITEM,
                record.Type.SERIALIZED_ASSEMBLY_ITEM, record.Type.SERIALIZED_INVENTORY_ITEM, record.Type.SHIP_ITEM, record.Type.SUBTOTAL_ITEM];

            for (var n = 0; n < itemTypes.length; n++) {

                try {

                    var recItem = record.load({
                        type: itemTypes[n],
                        id: theId
                    });

                    return recItem;

                } catch (e) {
                }

            }

        }


        /* =============== GET POSTING PERIOD FOR A GIVEN DATE =============== */

        /*
     * MDIMKOV 02.01.2018: this function gets the posting period for a given date (e.g. 'Mar 2020')
     *
     * RETURNS: string containing the posting period, such as 'Mar 2020'
     *
     * USAGE:
     *
     * var postPeriod = getPostingPeriod(new Date);
     *
     * to set the posting peiod on a transaction, use the following:
     * var today = new Date;
     * recJE.setText('postingperiod', getPostingPeriod(today))
     *
     * */


        function getPostingPeriod(dtDate) {

            var sAcctPeriod = '';

            var iYear = dtDate.getFullYear();

            var months = new Array(12);
            months[0] = 'Jan';
            months[1] = 'Feb';
            months[2] = 'Mar';
            months[3] = 'Apr';
            months[4] = 'May';
            months[5] = 'Jun';
            months[6] = 'Jul';
            months[7] = 'Aug';
            months[8] = 'Sep';
            months[9] = 'Oct';
            months[10] = 'Nov';
            months[11] = 'Dec';

            var current_date = new Date();

            month_value = current_date.getMonth();

            sAcctPeriod = months[month_value] + ' ' + iYear;

            return sAcctPeriod;
        }


        /* =============== CHECK IF AN ARRAY CONTAINS A GIVEN OBJECT =============== */

        /*
     * MDIMKOV 01.12.2018: this function checks if an element (obj) is included in an array (arr)
     *
     * RETURNS: boolean
     *
     * USAGE:
     *
     * var myArray = ['a', 'b', 'c'];
     *
     * var isInArray = arrayContains(myArray 'b');
     *
     * */


        function arrayContains(arr, obj) {
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == obj) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        }


        /* =============== LOG A VERY LONG STRING, SUCH AS A JSON / REQUEST BODY ETC. =============== */

        /*
     * MDIMKOV 13.06.2020: this function logs very long strings
     *
     * RETURNS: void
     *
     * USAGE:
     *
     * longLog('audit', 'myTitle', varToLog);
     *
     * */


        function longLog(sType, sTitle, varToLog) {

            var logSteps = varToLog.length / 4000;

            if (sType == 'audit') {

                for (var i = 0; i < logSteps; i++) {

                    switch (sType) {

                        case 'debug':
                            log.debug(sTitle + '-' + parseInt(i + 1), varToLog.substr(i * 3999, (i + 1) * 3999));
                            break;

                        case 'audit':
                            log.audit(sTitle + '-' + parseInt(i + 1), varToLog.substr(i * 3999, (i + 1) * 3999));
                            break;

                        case 'error':
                            log.error(sTitle + '-' + parseInt(i + 1), varToLog.substr(i * 3999, (i + 1) * 3999));
                            break;

                    }

                }

            }

        }


        /* =============== Get the ID and the code of a country by looking for its name/text =============== */

        /*
     * MDIMKOV 13.06.2021: this function finds the id and code of a country by looking for its name/tex
     *
     * RETURNS: array
     *
     * USAGE:
     *
     * countryByText('United Kingdom');	// expected result: [{text:"United Kingdom",code:"GB",id:"77"}]
     *
     * */


        function countryByText(inputVar) {

            var returnObject = [];

            var returnObject = [];

            var country_list =
                [
                    {"text": "Afghanistan", "code": "AF", "id": "3"},
                    {"text": "Aland Islands", "code": "AX", "id": "247"},
                    {"text": "Albania", "code": "AL", "id": "6"},
                    {"text": "Algeria", "code": "DZ", "id": "62"},
                    {"text": "American Samoa", "code": "AS", "id": "12"},
                    {"text": "Andorra", "code": "AD", "id": "1"},
                    {"text": "Angola", "code": "AO", "id": "9"},
                    {"text": "Anguilla", "code": "AI", "id": "5"},
                    {"text": "Antarctica", "code": "AQ", "id": "10"},
                    {"text": "Antigua and Barbuda", "code": "AG", "id": "4"},
                    {"text": "Argentina", "code": "AR", "id": "11"},
                    {"text": "Armenia", "code": "AM", "id": "7"},
                    {"text": "Aruba", "code": "AW", "id": "15"},
                    {"text": "Australia", "code": "AU", "id": "14"},
                    {"text": "Austria", "code": "AT", "id": "13"},
                    {"text": "Azerbaijan", "code": "AZ", "id": "16"},
                    {"text": "Bahamas", "code": "BS", "id": "31"},
                    {"text": "Bahrain", "code": "BH", "id": "23"},
                    {"text": "Bangladesh", "code": "BD", "id": "19"},
                    {"text": "Barbados", "code": "BB", "id": "18"},
                    {"text": "Belarus", "code": "BY", "id": "35"},
                    {"text": "Belgium", "code": "BE", "id": "20"},
                    {"text": "Belize", "code": "BZ", "id": "36"},
                    {"text": "Benin", "code": "BJ", "id": "25"},
                    {"text": "Bermuda", "code": "BM", "id": "27"},
                    {"text": "Bhutan", "code": "BT", "id": "32"},
                    {"text": "Bolivia", "code": "BO", "id": "29"},
                    {"text": "Bonaire, Saint Eustatius and Saba", "code": "BQ", "id": "250"},
                    {"text": "Bosnia and Herzegovina", "code": "BA", "id": "17"},
                    {"text": "Botswana", "code": "BW", "id": "34"},
                    {"text": "Bouvet Island", "code": "BV", "id": "33"},
                    {"text": "Brazil", "code": "BR", "id": "30"},
                    {"text": "British Indian Ocean Territory", "code": "IO", "id": "106"},
                    {"text": "Brunei Darussalam", "code": "BN", "id": "28"},
                    {"text": "Bulgaria", "code": "BG", "id": "22"},
                    {"text": "Burkina Faso", "code": "BF", "id": "21"},
                    {"text": "Burundi", "code": "BI", "id": "24"},
                    {"text": "Cambodia", "code": "KH", "id": "117"},
                    {"text": "Cameroon", "code": "CM", "id": "46"},
                    {"text": "Canada", "code": "CA", "id": "37"},
                    {"text": "Canary Islands", "code": "IC", "id": "249"},
                    {"text": "Cape Verde", "code": "CV", "id": "53"},
                    {"text": "Cayman Islands", "code": "KY", "id": "124"},
                    {"text": "Central African Republic", "code": "CF", "id": "40"},
                    {"text": "Ceuta and Melilla", "code": "EA", "id": "248"},
                    {"text": "Chad", "code": "TD", "id": "212"},
                    {"text": "Chile", "code": "CL", "id": "45"},
                    {"text": "China", "code": "CN", "id": "47"},
                    {"text": "Christmas Island", "code": "CX", "id": "54"},
                    {"text": "Cocos (Keeling) Islands", "code": "CC", "id": "38"},
                    {"text": "Colombia", "code": "CO", "id": "48"},
                    {"text": "Comoros", "code": "KM", "id": "119"},
                    {"text": "Congo, Democratic Republic of", "code": "CD", "id": "39"},
                    {"text": "Congo, Republic of", "code": "CG", "id": "41"},
                    {"text": "Cook Islands", "code": "CK", "id": "44"},
                    {"text": "Costa Rica", "code": "CR", "id": "49"},
                    {"text": "Cote d\u0027Ivoire", "code": "CI", "id": "43"},
                    {"text": "Croatia/Hrvatska", "code": "HR", "id": "98"},
                    {"text": "Cuba", "code": "CU", "id": "52"},
                    {"text": "Curaçao", "code": "CW", "id": "251"},
                    {"text": "Cyprus", "code": "CY", "id": "55"},
                    {"text": "Czech Republic", "code": "CZ", "id": "56"},
                    {"text": "Denmark", "code": "DK", "id": "59"},
                    {"text": "Djibouti", "code": "DJ", "id": "58"},
                    {"text": "Dominica", "code": "DM", "id": "60"},
                    {"text": "Dominican Republic", "code": "DO", "id": "61"},
                    {"text": "East Timor", "code": "TL", "id": "221"},
                    {"text": "Ecuador", "code": "EC", "id": "63"},
                    {"text": "Egypt", "code": "EG", "id": "65"},
                    {"text": "El Salvador", "code": "SV", "id": "208"},
                    {"text": "Equatorial Guinea", "code": "GQ", "id": "88"},
                    {"text": "Eritrea", "code": "ER", "id": "67"},
                    {"text": "Estonia", "code": "EE", "id": "64"},
                    {"text": "Ethiopia", "code": "ET", "id": "69"},
                    {"text": "Falkland Islands", "code": "FK", "id": "72"},
                    {"text": "Faroe Islands", "code": "FO", "id": "74"},
                    {"text": "Fiji", "code": "FJ", "id": "71"},
                    {"text": "Finland", "code": "FI", "id": "70"},
                    {"text": "France", "code": "FR", "id": "75"},
                    {"text": "French Guiana", "code": "GF", "id": "80"},
                    {"text": "French Polynesia", "code": "PF", "id": "175"},
                    {"text": "French Southern Territories", "code": "TF", "id": "213"},
                    {"text": "Gabon", "code": "GA", "id": "76"},
                    {"text": "Gambia", "code": "GM", "id": "85"},
                    {"text": "Georgia", "code": "GE", "id": "79"},
                    {"text": "Germany", "code": "DE", "id": "57"},
                    {"text": "Ghana", "code": "GH", "id": "82"},
                    {"text": "Gibraltar", "code": "GI", "id": "83"},
                    {"text": "Greece", "code": "GR", "id": "89"},
                    {"text": "Greenland", "code": "GL", "id": "84"},
                    {"text": "Grenada", "code": "GD", "id": "78"},
                    {"text": "Guadeloupe", "code": "GP", "id": "87"},
                    {"text": "Guam", "code": "GU", "id": "92"},
                    {"text": "Guatemala", "code": "GT", "id": "91"},
                    {"text": "Guernsey", "code": "GG", "id": "81"},
                    {"text": "Guinea", "code": "GN", "id": "86"},
                    {"text": "Guinea-Bissau", "code": "GW", "id": "93"},
                    {"text": "Guyana", "code": "GY", "id": "94"},
                    {"text": "Haiti", "code": "HT", "id": "99"},
                    {"text": "Heard and McDonald Islands", "code": "HM", "id": "96"},
                    {"text": "Holy See (City Vatican State)", "code": "VA", "id": "233"},
                    {"text": "Honduras", "code": "HN", "id": "97"},
                    {"text": "Hong Kong", "code": "HK", "id": "95"},
                    {"text": "Hungary", "code": "HU", "id": "100"},
                    {"text": "Iceland", "code": "IS", "id": "109"},
                    {"text": "India", "code": "IN", "id": "105"},
                    {"text": "Indonesia", "code": "ID", "id": "101"},
                    {"text": "Iran (Islamic Republic of)", "code": "IR", "id": "108"},
                    {"text": "Iraq", "code": "IQ", "id": "107"},
                    {"text": "Ireland", "code": "IE", "id": "102"},
                    {"text": "Isle of Man", "code": "IM", "id": "104"},
                    {"text": "Israel", "code": "IL", "id": "103"},
                    {"text": "Italy", "code": "IT", "id": "110"},
                    {"text": "Jamaica", "code": "JM", "id": "112"},
                    {"text": "Japan", "code": "JP", "id": "114"},
                    {"text": "Jersey", "code": "JE", "id": "111"},
                    {"text": "Jordan", "code": "JO", "id": "113"},
                    {"text": "Kazakhstan", "code": "KZ", "id": "125"},
                    {"text": "Kenya", "code": "KE", "id": "115"},
                    {"text": "Kiribati", "code": "KI", "id": "118"},
                    {"text": "Korea, Democratic People\u0027s Republic", "code": "KP", "id": "121"},
                    {"text": "Korea, Republic of", "code": "KR", "id": "122"},
                    {"text": "Kosovo", "code": "XK", "id": "254"},
                    {"text": "Kuwait", "code": "KW", "id": "123"},
                    {"text": "Kyrgyzstan", "code": "KG", "id": "116"},
                    {"text": "Lao People\u0027s Democratic Republic", "code": "LA", "id": "126"},
                    {"text": "Latvia", "code": "LV", "id": "135"},
                    {"text": "Lebanon", "code": "LB", "id": "127"},
                    {"text": "Lesotho", "code": "LS", "id": "132"},
                    {"text": "Liberia", "code": "LR", "id": "131"},
                    {"text": "Libya", "code": "LY", "id": "136"},
                    {"text": "Liechtenstein", "code": "LI", "id": "129"},
                    {"text": "Lithuania", "code": "LT", "id": "133"},
                    {"text": "Luxembourg", "code": "LU", "id": "134"},
                    {"text": "Macau", "code": "MO", "id": "148"},
                    {"text": "Macedonia", "code": "MK", "id": "144"},
                    {"text": "Madagascar", "code": "MG", "id": "142"},
                    {"text": "Malawi", "code": "MW", "id": "156"},
                    {"text": "Malaysia", "code": "MY", "id": "158"},
                    {"text": "Maldives", "code": "MV", "id": "155"},
                    {"text": "Mali", "code": "ML", "id": "145"},
                    {"text": "Malta", "code": "MT", "id": "153"},
                    {"text": "Marshall Islands", "code": "MH", "id": "143"},
                    {"text": "Martinique", "code": "MQ", "id": "150"},
                    {"text": "Mauritania", "code": "MR", "id": "151"},
                    {"text": "Mauritius", "code": "MU", "id": "154"},
                    {"text": "Mayotte", "code": "YT", "id": "243"},
                    {"text": "Mexico", "code": "MX", "id": "157"},
                    {"text": "Micronesia, Federal State of", "code": "FM", "id": "73"},
                    {"text": "Moldova, Republic of", "code": "MD", "id": "139"},
                    {"text": "Monaco", "code": "MC", "id": "138"},
                    {"text": "Mongolia", "code": "MN", "id": "147"},
                    {"text": "Montenegro", "code": "ME", "id": "140"},
                    {"text": "Montserrat", "code": "MS", "id": "152"},
                    {"text": "Morocco", "code": "MA", "id": "137"},
                    {"text": "Mozambique", "code": "MZ", "id": "159"},
                    {"text": "Myanmar (Burma)", "code": "MM", "id": "146"},
                    {"text": "Namibia", "code": "NA", "id": "160"},
                    {"text": "Nauru", "code": "NR", "id": "169"},
                    {"text": "Nepal", "code": "NP", "id": "168"},
                    {"text": "Netherlands", "code": "NL", "id": "166"},
                    {"text": "New Caledonia", "code": "NC", "id": "161"},
                    {"text": "New Zealand", "code": "NZ", "id": "171"},
                    {"text": "Nicaragua", "code": "NI", "id": "165"},
                    {"text": "Niger", "code": "NE", "id": "162"},
                    {"text": "Nigeria", "code": "NG", "id": "164"},
                    {"text": "Niue", "code": "NU", "id": "170"},
                    {"text": "Norfolk Island", "code": "NF", "id": "163"},
                    {"text": "Northern Mariana Islands", "code": "MP", "id": "149"},
                    {"text": "Norway", "code": "NO", "id": "167"},
                    {"text": "Oman", "code": "OM", "id": "172"},
                    {"text": "Pakistan", "code": "PK", "id": "178"},
                    {"text": "Palau", "code": "PW", "id": "185"},
                    {"text": "Panama", "code": "PA", "id": "173"},
                    {"text": "Papua New Guinea", "code": "PG", "id": "176"},
                    {"text": "Paraguay", "code": "PY", "id": "186"},
                    {"text": "Peru", "code": "PE", "id": "174"},
                    {"text": "Philippines", "code": "PH", "id": "177"},
                    {"text": "Pitcairn Island", "code": "PN", "id": "181"},
                    {"text": "Poland", "code": "PL", "id": "179"},
                    {"text": "Portugal", "code": "PT", "id": "184"},
                    {"text": "Puerto Rico", "code": "PR", "id": "182"},
                    {"text": "Qatar", "code": "QA", "id": "187"},
                    {"text": "Reunion Island", "code": "RE", "id": "188"},
                    {"text": "Romania", "code": "RO", "id": "189"},
                    {"text": "Russian Federation", "code": "RU", "id": "190"},
                    {"text": "Rwanda", "code": "RW", "id": "191"},
                    {"text": "Saint Barthélemy", "code": "BL", "id": "26"},
                    {"text": "Saint Helena", "code": "SH", "id": "198"},
                    {"text": "Saint Kitts and Nevis", "code": "KN", "id": "120"},
                    {"text": "Saint Lucia", "code": "LC", "id": "128"},
                    {"text": "Saint Martin", "code": "MF", "id": "141"},
                    {"text": "Saint Vincent and the Grenadines", "code": "VC", "id": "234"},
                    {"text": "Samoa", "code": "WS", "id": "241"},
                    {"text": "San Marino", "code": "SM", "id": "203"},
                    {"text": "Sao Tome and Principe", "code": "ST", "id": "207"},
                    {"text": "Saudi Arabia", "code": "SA", "id": "192"},
                    {"text": "Senegal", "code": "SN", "id": "204"},
                    {"text": "Serbia", "code": "RS", "id": "50"},
                    {"text": "Seychelles", "code": "SC", "id": "194"},
                    {"text": "Sierra Leone", "code": "SL", "id": "202"},
                    {"text": "Singapore", "code": "SG", "id": "197"},
                    {"text": "Sint Maarten", "code": "SX", "id": "252"},
                    {"text": "Slovak Republic", "code": "SK", "id": "201"},
                    {"text": "Slovenia", "code": "SI", "id": "199"},
                    {"text": "Solomon Islands", "code": "SB", "id": "193"},
                    {"text": "Somalia", "code": "SO", "id": "205"},
                    {"text": "South Africa", "code": "ZA", "id": "244"},
                    {"text": "South Georgia", "code": "GS", "id": "90"},
                    {"text": "South Sudan", "code": "SS", "id": "253"},
                    {"text": "Spain", "code": "ES", "id": "68"},
                    {"text": "Sri Lanka", "code": "LK", "id": "130"},
                    {"text": "St. Pierre and Miquelon", "code": "PM", "id": "180"},
                    {"text": "State of Palestine", "code": "PS", "id": "183"},
                    {"text": "Sudan", "code": "SD", "id": "195"},
                    {"text": "Suriname", "code": "SR", "id": "206"},
                    {"text": "Svalbard and Jan Mayen Islands", "code": "SJ", "id": "200"},
                    {"text": "Swaziland", "code": "SZ", "id": "210"},
                    {"text": "Sweden", "code": "SE", "id": "196"},
                    {"text": "Switzerland", "code": "CH", "id": "42"},
                    {"text": "Syrian Arab Republic", "code": "SY", "id": "209"},
                    {"text": "Taiwan", "code": "TW", "id": "225"},
                    {"text": "Tajikistan", "code": "TJ", "id": "216"},
                    {"text": "Tanzania", "code": "TZ", "id": "226"},
                    {"text": "Thailand", "code": "TH", "id": "215"},
                    {"text": "Togo", "code": "TG", "id": "214"},
                    {"text": "Tokelau", "code": "TK", "id": "217"},
                    {"text": "Tonga", "code": "TO", "id": "220"},
                    {"text": "Trinidad and Tobago", "code": "TT", "id": "223"},
                    {"text": "Tunisia", "code": "TN", "id": "219"},
                    {"text": "Turkey", "code": "TR", "id": "222"},
                    {"text": "Turkmenistan", "code": "TM", "id": "218"},
                    {"text": "Turks and Caicos Islands", "code": "TC", "id": "211"},
                    {"text": "Tuvalu", "code": "TV", "id": "224"},
                    {"text": "Uganda", "code": "UG", "id": "228"},
                    {"text": "Ukraine", "code": "UA", "id": "227"},
                    {"text": "United Arab Emirates", "code": "AE", "id": "2"},
                    {"text": "United Kingdom", "code": "GB", "id": "77"},
                    {"text": "United States", "code": "US", "id": "230"},
                    {"text": "Uruguay", "code": "UY", "id": "231"},
                    {"text": "US Minor Outlying Islands", "code": "UM", "id": "229"},
                    {"text": "Uzbekistan", "code": "UZ", "id": "232"},
                    {"text": "Vanuatu", "code": "VU", "id": "239"},
                    {"text": "Venezuela", "code": "VE", "id": "235"},
                    {"text": "Vietnam", "code": "VN", "id": "238"},
                    {"text": "Virgin Islands (British)", "code": "VG", "id": "236"},
                    {"text": "Virgin Islands (USA)", "code": "VI", "id": "237"},
                    {"text": "Wallis and Futuna", "code": "WF", "id": "240"},
                    {"text": "Western Sahara", "code": "EH", "id": "66"},
                    {"text": "Yemen", "code": "YE", "id": "242"},
                    {"text": "Zambia", "code": "ZM", "id": "245"},
                    {"text": "Zimbabwe", "code": "ZW", "id": "246"}
                ];

            returnObject = country_list.filter(function (x) {
                return x.text == inputVar;
            });

            return returnObject;

        }


        /* =============== Get the name/text and the code of a country by looking for its ID =============== */

        /*
     * MDIMKOV 13.06.2021: this function finds the name/text and the code of a country by looking for its ID
     *
     * RETURNS: array
     *
     * USAGE:
     *
     * countryById('77');	// expected result: [{text:"United Kingdom",code:"GB",id:"77"}]
     *
     * */


        function countryById(inputVar) {

            var returnObject = [];

            var country_list =
                [
                    {"text": "Afghanistan", "code": "AF", "id": "3"},
                    {"text": "Aland Islands", "code": "AX", "id": "247"},
                    {"text": "Albania", "code": "AL", "id": "6"},
                    {"text": "Algeria", "code": "DZ", "id": "62"},
                    {"text": "American Samoa", "code": "AS", "id": "12"},
                    {"text": "Andorra", "code": "AD", "id": "1"},
                    {"text": "Angola", "code": "AO", "id": "9"},
                    {"text": "Anguilla", "code": "AI", "id": "5"},
                    {"text": "Antarctica", "code": "AQ", "id": "10"},
                    {"text": "Antigua and Barbuda", "code": "AG", "id": "4"},
                    {"text": "Argentina", "code": "AR", "id": "11"},
                    {"text": "Armenia", "code": "AM", "id": "7"},
                    {"text": "Aruba", "code": "AW", "id": "15"},
                    {"text": "Australia", "code": "AU", "id": "14"},
                    {"text": "Austria", "code": "AT", "id": "13"},
                    {"text": "Azerbaijan", "code": "AZ", "id": "16"},
                    {"text": "Bahamas", "code": "BS", "id": "31"},
                    {"text": "Bahrain", "code": "BH", "id": "23"},
                    {"text": "Bangladesh", "code": "BD", "id": "19"},
                    {"text": "Barbados", "code": "BB", "id": "18"},
                    {"text": "Belarus", "code": "BY", "id": "35"},
                    {"text": "Belgium", "code": "BE", "id": "20"},
                    {"text": "Belize", "code": "BZ", "id": "36"},
                    {"text": "Benin", "code": "BJ", "id": "25"},
                    {"text": "Bermuda", "code": "BM", "id": "27"},
                    {"text": "Bhutan", "code": "BT", "id": "32"},
                    {"text": "Bolivia", "code": "BO", "id": "29"},
                    {"text": "Bonaire, Saint Eustatius and Saba", "code": "BQ", "id": "250"},
                    {"text": "Bosnia and Herzegovina", "code": "BA", "id": "17"},
                    {"text": "Botswana", "code": "BW", "id": "34"},
                    {"text": "Bouvet Island", "code": "BV", "id": "33"},
                    {"text": "Brazil", "code": "BR", "id": "30"},
                    {"text": "British Indian Ocean Territory", "code": "IO", "id": "106"},
                    {"text": "Brunei Darussalam", "code": "BN", "id": "28"},
                    {"text": "Bulgaria", "code": "BG", "id": "22"},
                    {"text": "Burkina Faso", "code": "BF", "id": "21"},
                    {"text": "Burundi", "code": "BI", "id": "24"},
                    {"text": "Cambodia", "code": "KH", "id": "117"},
                    {"text": "Cameroon", "code": "CM", "id": "46"},
                    {"text": "Canada", "code": "CA", "id": "37"},
                    {"text": "Canary Islands", "code": "IC", "id": "249"},
                    {"text": "Cape Verde", "code": "CV", "id": "53"},
                    {"text": "Cayman Islands", "code": "KY", "id": "124"},
                    {"text": "Central African Republic", "code": "CF", "id": "40"},
                    {"text": "Ceuta and Melilla", "code": "EA", "id": "248"},
                    {"text": "Chad", "code": "TD", "id": "212"},
                    {"text": "Chile", "code": "CL", "id": "45"},
                    {"text": "China", "code": "CN", "id": "47"},
                    {"text": "Christmas Island", "code": "CX", "id": "54"},
                    {"text": "Cocos (Keeling) Islands", "code": "CC", "id": "38"},
                    {"text": "Colombia", "code": "CO", "id": "48"},
                    {"text": "Comoros", "code": "KM", "id": "119"},
                    {"text": "Congo, Democratic Republic of", "code": "CD", "id": "39"},
                    {"text": "Congo, Republic of", "code": "CG", "id": "41"},
                    {"text": "Cook Islands", "code": "CK", "id": "44"},
                    {"text": "Costa Rica", "code": "CR", "id": "49"},
                    {"text": "Cote d\u0027Ivoire", "code": "CI", "id": "43"},
                    {"text": "Croatia/Hrvatska", "code": "HR", "id": "98"},
                    {"text": "Cuba", "code": "CU", "id": "52"},
                    {"text": "Curaçao", "code": "CW", "id": "251"},
                    {"text": "Cyprus", "code": "CY", "id": "55"},
                    {"text": "Czech Republic", "code": "CZ", "id": "56"},
                    {"text": "Denmark", "code": "DK", "id": "59"},
                    {"text": "Djibouti", "code": "DJ", "id": "58"},
                    {"text": "Dominica", "code": "DM", "id": "60"},
                    {"text": "Dominican Republic", "code": "DO", "id": "61"},
                    {"text": "East Timor", "code": "TL", "id": "221"},
                    {"text": "Ecuador", "code": "EC", "id": "63"},
                    {"text": "Egypt", "code": "EG", "id": "65"},
                    {"text": "El Salvador", "code": "SV", "id": "208"},
                    {"text": "Equatorial Guinea", "code": "GQ", "id": "88"},
                    {"text": "Eritrea", "code": "ER", "id": "67"},
                    {"text": "Estonia", "code": "EE", "id": "64"},
                    {"text": "Ethiopia", "code": "ET", "id": "69"},
                    {"text": "Falkland Islands", "code": "FK", "id": "72"},
                    {"text": "Faroe Islands", "code": "FO", "id": "74"},
                    {"text": "Fiji", "code": "FJ", "id": "71"},
                    {"text": "Finland", "code": "FI", "id": "70"},
                    {"text": "France", "code": "FR", "id": "75"},
                    {"text": "French Guiana", "code": "GF", "id": "80"},
                    {"text": "French Polynesia", "code": "PF", "id": "175"},
                    {"text": "French Southern Territories", "code": "TF", "id": "213"},
                    {"text": "Gabon", "code": "GA", "id": "76"},
                    {"text": "Gambia", "code": "GM", "id": "85"},
                    {"text": "Georgia", "code": "GE", "id": "79"},
                    {"text": "Germany", "code": "DE", "id": "57"},
                    {"text": "Ghana", "code": "GH", "id": "82"},
                    {"text": "Gibraltar", "code": "GI", "id": "83"},
                    {"text": "Greece", "code": "GR", "id": "89"},
                    {"text": "Greenland", "code": "GL", "id": "84"},
                    {"text": "Grenada", "code": "GD", "id": "78"},
                    {"text": "Guadeloupe", "code": "GP", "id": "87"},
                    {"text": "Guam", "code": "GU", "id": "92"},
                    {"text": "Guatemala", "code": "GT", "id": "91"},
                    {"text": "Guernsey", "code": "GG", "id": "81"},
                    {"text": "Guinea", "code": "GN", "id": "86"},
                    {"text": "Guinea-Bissau", "code": "GW", "id": "93"},
                    {"text": "Guyana", "code": "GY", "id": "94"},
                    {"text": "Haiti", "code": "HT", "id": "99"},
                    {"text": "Heard and McDonald Islands", "code": "HM", "id": "96"},
                    {"text": "Holy See (City Vatican State)", "code": "VA", "id": "233"},
                    {"text": "Honduras", "code": "HN", "id": "97"},
                    {"text": "Hong Kong", "code": "HK", "id": "95"},
                    {"text": "Hungary", "code": "HU", "id": "100"},
                    {"text": "Iceland", "code": "IS", "id": "109"},
                    {"text": "India", "code": "IN", "id": "105"},
                    {"text": "Indonesia", "code": "ID", "id": "101"},
                    {"text": "Iran (Islamic Republic of)", "code": "IR", "id": "108"},
                    {"text": "Iraq", "code": "IQ", "id": "107"},
                    {"text": "Ireland", "code": "IE", "id": "102"},
                    {"text": "Isle of Man", "code": "IM", "id": "104"},
                    {"text": "Israel", "code": "IL", "id": "103"},
                    {"text": "Italy", "code": "IT", "id": "110"},
                    {"text": "Jamaica", "code": "JM", "id": "112"},
                    {"text": "Japan", "code": "JP", "id": "114"},
                    {"text": "Jersey", "code": "JE", "id": "111"},
                    {"text": "Jordan", "code": "JO", "id": "113"},
                    {"text": "Kazakhstan", "code": "KZ", "id": "125"},
                    {"text": "Kenya", "code": "KE", "id": "115"},
                    {"text": "Kiribati", "code": "KI", "id": "118"},
                    {"text": "Korea, Democratic People\u0027s Republic", "code": "KP", "id": "121"},
                    {"text": "Korea, Republic of", "code": "KR", "id": "122"},
                    {"text": "Kosovo", "code": "XK", "id": "254"},
                    {"text": "Kuwait", "code": "KW", "id": "123"},
                    {"text": "Kyrgyzstan", "code": "KG", "id": "116"},
                    {"text": "Lao People\u0027s Democratic Republic", "code": "LA", "id": "126"},
                    {"text": "Latvia", "code": "LV", "id": "135"},
                    {"text": "Lebanon", "code": "LB", "id": "127"},
                    {"text": "Lesotho", "code": "LS", "id": "132"},
                    {"text": "Liberia", "code": "LR", "id": "131"},
                    {"text": "Libya", "code": "LY", "id": "136"},
                    {"text": "Liechtenstein", "code": "LI", "id": "129"},
                    {"text": "Lithuania", "code": "LT", "id": "133"},
                    {"text": "Luxembourg", "code": "LU", "id": "134"},
                    {"text": "Macau", "code": "MO", "id": "148"},
                    {"text": "Macedonia", "code": "MK", "id": "144"},
                    {"text": "Madagascar", "code": "MG", "id": "142"},
                    {"text": "Malawi", "code": "MW", "id": "156"},
                    {"text": "Malaysia", "code": "MY", "id": "158"},
                    {"text": "Maldives", "code": "MV", "id": "155"},
                    {"text": "Mali", "code": "ML", "id": "145"},
                    {"text": "Malta", "code": "MT", "id": "153"},
                    {"text": "Marshall Islands", "code": "MH", "id": "143"},
                    {"text": "Martinique", "code": "MQ", "id": "150"},
                    {"text": "Mauritania", "code": "MR", "id": "151"},
                    {"text": "Mauritius", "code": "MU", "id": "154"},
                    {"text": "Mayotte", "code": "YT", "id": "243"},
                    {"text": "Mexico", "code": "MX", "id": "157"},
                    {"text": "Micronesia, Federal State of", "code": "FM", "id": "73"},
                    {"text": "Moldova, Republic of", "code": "MD", "id": "139"},
                    {"text": "Monaco", "code": "MC", "id": "138"},
                    {"text": "Mongolia", "code": "MN", "id": "147"},
                    {"text": "Montenegro", "code": "ME", "id": "140"},
                    {"text": "Montserrat", "code": "MS", "id": "152"},
                    {"text": "Morocco", "code": "MA", "id": "137"},
                    {"text": "Mozambique", "code": "MZ", "id": "159"},
                    {"text": "Myanmar (Burma)", "code": "MM", "id": "146"},
                    {"text": "Namibia", "code": "NA", "id": "160"},
                    {"text": "Nauru", "code": "NR", "id": "169"},
                    {"text": "Nepal", "code": "NP", "id": "168"},
                    {"text": "Netherlands", "code": "NL", "id": "166"},
                    {"text": "New Caledonia", "code": "NC", "id": "161"},
                    {"text": "New Zealand", "code": "NZ", "id": "171"},
                    {"text": "Nicaragua", "code": "NI", "id": "165"},
                    {"text": "Niger", "code": "NE", "id": "162"},
                    {"text": "Nigeria", "code": "NG", "id": "164"},
                    {"text": "Niue", "code": "NU", "id": "170"},
                    {"text": "Norfolk Island", "code": "NF", "id": "163"},
                    {"text": "Northern Mariana Islands", "code": "MP", "id": "149"},
                    {"text": "Norway", "code": "NO", "id": "167"},
                    {"text": "Oman", "code": "OM", "id": "172"},
                    {"text": "Pakistan", "code": "PK", "id": "178"},
                    {"text": "Palau", "code": "PW", "id": "185"},
                    {"text": "Panama", "code": "PA", "id": "173"},
                    {"text": "Papua New Guinea", "code": "PG", "id": "176"},
                    {"text": "Paraguay", "code": "PY", "id": "186"},
                    {"text": "Peru", "code": "PE", "id": "174"},
                    {"text": "Philippines", "code": "PH", "id": "177"},
                    {"text": "Pitcairn Island", "code": "PN", "id": "181"},
                    {"text": "Poland", "code": "PL", "id": "179"},
                    {"text": "Portugal", "code": "PT", "id": "184"},
                    {"text": "Puerto Rico", "code": "PR", "id": "182"},
                    {"text": "Qatar", "code": "QA", "id": "187"},
                    {"text": "Reunion Island", "code": "RE", "id": "188"},
                    {"text": "Romania", "code": "RO", "id": "189"},
                    {"text": "Russian Federation", "code": "RU", "id": "190"},
                    {"text": "Rwanda", "code": "RW", "id": "191"},
                    {"text": "Saint Barthélemy", "code": "BL", "id": "26"},
                    {"text": "Saint Helena", "code": "SH", "id": "198"},
                    {"text": "Saint Kitts and Nevis", "code": "KN", "id": "120"},
                    {"text": "Saint Lucia", "code": "LC", "id": "128"},
                    {"text": "Saint Martin", "code": "MF", "id": "141"},
                    {"text": "Saint Vincent and the Grenadines", "code": "VC", "id": "234"},
                    {"text": "Samoa", "code": "WS", "id": "241"},
                    {"text": "San Marino", "code": "SM", "id": "203"},
                    {"text": "Sao Tome and Principe", "code": "ST", "id": "207"},
                    {"text": "Saudi Arabia", "code": "SA", "id": "192"},
                    {"text": "Senegal", "code": "SN", "id": "204"},
                    {"text": "Serbia", "code": "RS", "id": "50"},
                    {"text": "Seychelles", "code": "SC", "id": "194"},
                    {"text": "Sierra Leone", "code": "SL", "id": "202"},
                    {"text": "Singapore", "code": "SG", "id": "197"},
                    {"text": "Sint Maarten", "code": "SX", "id": "252"},
                    {"text": "Slovak Republic", "code": "SK", "id": "201"},
                    {"text": "Slovenia", "code": "SI", "id": "199"},
                    {"text": "Solomon Islands", "code": "SB", "id": "193"},
                    {"text": "Somalia", "code": "SO", "id": "205"},
                    {"text": "South Africa", "code": "ZA", "id": "244"},
                    {"text": "South Georgia", "code": "GS", "id": "90"},
                    {"text": "South Sudan", "code": "SS", "id": "253"},
                    {"text": "Spain", "code": "ES", "id": "68"},
                    {"text": "Sri Lanka", "code": "LK", "id": "130"},
                    {"text": "St. Pierre and Miquelon", "code": "PM", "id": "180"},
                    {"text": "State of Palestine", "code": "PS", "id": "183"},
                    {"text": "Sudan", "code": "SD", "id": "195"},
                    {"text": "Suriname", "code": "SR", "id": "206"},
                    {"text": "Svalbard and Jan Mayen Islands", "code": "SJ", "id": "200"},
                    {"text": "Swaziland", "code": "SZ", "id": "210"},
                    {"text": "Sweden", "code": "SE", "id": "196"},
                    {"text": "Switzerland", "code": "CH", "id": "42"},
                    {"text": "Syrian Arab Republic", "code": "SY", "id": "209"},
                    {"text": "Taiwan", "code": "TW", "id": "225"},
                    {"text": "Tajikistan", "code": "TJ", "id": "216"},
                    {"text": "Tanzania", "code": "TZ", "id": "226"},
                    {"text": "Thailand", "code": "TH", "id": "215"},
                    {"text": "Togo", "code": "TG", "id": "214"},
                    {"text": "Tokelau", "code": "TK", "id": "217"},
                    {"text": "Tonga", "code": "TO", "id": "220"},
                    {"text": "Trinidad and Tobago", "code": "TT", "id": "223"},
                    {"text": "Tunisia", "code": "TN", "id": "219"},
                    {"text": "Turkey", "code": "TR", "id": "222"},
                    {"text": "Turkmenistan", "code": "TM", "id": "218"},
                    {"text": "Turks and Caicos Islands", "code": "TC", "id": "211"},
                    {"text": "Tuvalu", "code": "TV", "id": "224"},
                    {"text": "Uganda", "code": "UG", "id": "228"},
                    {"text": "Ukraine", "code": "UA", "id": "227"},
                    {"text": "United Arab Emirates", "code": "AE", "id": "2"},
                    {"text": "United Kingdom", "code": "GB", "id": "77"},
                    {"text": "United States", "code": "US", "id": "230"},
                    {"text": "Uruguay", "code": "UY", "id": "231"},
                    {"text": "US Minor Outlying Islands", "code": "UM", "id": "229"},
                    {"text": "Uzbekistan", "code": "UZ", "id": "232"},
                    {"text": "Vanuatu", "code": "VU", "id": "239"},
                    {"text": "Venezuela", "code": "VE", "id": "235"},
                    {"text": "Vietnam", "code": "VN", "id": "238"},
                    {"text": "Virgin Islands (British)", "code": "VG", "id": "236"},
                    {"text": "Virgin Islands (USA)", "code": "VI", "id": "237"},
                    {"text": "Wallis and Futuna", "code": "WF", "id": "240"},
                    {"text": "Western Sahara", "code": "EH", "id": "66"},
                    {"text": "Yemen", "code": "YE", "id": "242"},
                    {"text": "Zambia", "code": "ZM", "id": "245"},
                    {"text": "Zimbabwe", "code": "ZW", "id": "246"}
                ];

            returnObject = country_list.filter(function (x) {
                return x.id == inputVar;
            });

            return returnObject;

        }


        /* =============== Get the ID and the name(text) of a country by looking for its code =============== */

        /*
     * MDIMKOV 13.06.2021: this function finds the ID and the name(text) of a country by looking for its code
     *
     * RETURNS: array
     *
     * USAGE:
     *
     * countryByCode('GB');	// expected result: [{text:"United Kingdom",code:"GB",id:"77"}]
     *
     * */


        function countryByCode(inputVar) {

            var returnObject = [];

            var country_list =
                [
                    {"text": "Afghanistan", "code": "AF", "id": "3"},
                    {"text": "Aland Islands", "code": "AX", "id": "247"},
                    {"text": "Albania", "code": "AL", "id": "6"},
                    {"text": "Algeria", "code": "DZ", "id": "62"},
                    {"text": "American Samoa", "code": "AS", "id": "12"},
                    {"text": "Andorra", "code": "AD", "id": "1"},
                    {"text": "Angola", "code": "AO", "id": "9"},
                    {"text": "Anguilla", "code": "AI", "id": "5"},
                    {"text": "Antarctica", "code": "AQ", "id": "10"},
                    {"text": "Antigua and Barbuda", "code": "AG", "id": "4"},
                    {"text": "Argentina", "code": "AR", "id": "11"},
                    {"text": "Armenia", "code": "AM", "id": "7"},
                    {"text": "Aruba", "code": "AW", "id": "15"},
                    {"text": "Australia", "code": "AU", "id": "14"},
                    {"text": "Austria", "code": "AT", "id": "13"},
                    {"text": "Azerbaijan", "code": "AZ", "id": "16"},
                    {"text": "Bahamas", "code": "BS", "id": "31"},
                    {"text": "Bahrain", "code": "BH", "id": "23"},
                    {"text": "Bangladesh", "code": "BD", "id": "19"},
                    {"text": "Barbados", "code": "BB", "id": "18"},
                    {"text": "Belarus", "code": "BY", "id": "35"},
                    {"text": "Belgium", "code": "BE", "id": "20"},
                    {"text": "Belize", "code": "BZ", "id": "36"},
                    {"text": "Benin", "code": "BJ", "id": "25"},
                    {"text": "Bermuda", "code": "BM", "id": "27"},
                    {"text": "Bhutan", "code": "BT", "id": "32"},
                    {"text": "Bolivia", "code": "BO", "id": "29"},
                    {"text": "Bonaire, Saint Eustatius and Saba", "code": "BQ", "id": "250"},
                    {"text": "Bosnia and Herzegovina", "code": "BA", "id": "17"},
                    {"text": "Botswana", "code": "BW", "id": "34"},
                    {"text": "Bouvet Island", "code": "BV", "id": "33"},
                    {"text": "Brazil", "code": "BR", "id": "30"},
                    {"text": "British Indian Ocean Territory", "code": "IO", "id": "106"},
                    {"text": "Brunei Darussalam", "code": "BN", "id": "28"},
                    {"text": "Bulgaria", "code": "BG", "id": "22"},
                    {"text": "Burkina Faso", "code": "BF", "id": "21"},
                    {"text": "Burundi", "code": "BI", "id": "24"},
                    {"text": "Cambodia", "code": "KH", "id": "117"},
                    {"text": "Cameroon", "code": "CM", "id": "46"},
                    {"text": "Canada", "code": "CA", "id": "37"},
                    {"text": "Canary Islands", "code": "IC", "id": "249"},
                    {"text": "Cape Verde", "code": "CV", "id": "53"},
                    {"text": "Cayman Islands", "code": "KY", "id": "124"},
                    {"text": "Central African Republic", "code": "CF", "id": "40"},
                    {"text": "Ceuta and Melilla", "code": "EA", "id": "248"},
                    {"text": "Chad", "code": "TD", "id": "212"},
                    {"text": "Chile", "code": "CL", "id": "45"},
                    {"text": "China", "code": "CN", "id": "47"},
                    {"text": "Christmas Island", "code": "CX", "id": "54"},
                    {"text": "Cocos (Keeling) Islands", "code": "CC", "id": "38"},
                    {"text": "Colombia", "code": "CO", "id": "48"},
                    {"text": "Comoros", "code": "KM", "id": "119"},
                    {"text": "Congo, Democratic Republic of", "code": "CD", "id": "39"},
                    {"text": "Congo, Republic of", "code": "CG", "id": "41"},
                    {"text": "Cook Islands", "code": "CK", "id": "44"},
                    {"text": "Costa Rica", "code": "CR", "id": "49"},
                    {"text": "Cote d\u0027Ivoire", "code": "CI", "id": "43"},
                    {"text": "Croatia/Hrvatska", "code": "HR", "id": "98"},
                    {"text": "Cuba", "code": "CU", "id": "52"},
                    {"text": "Curaçao", "code": "CW", "id": "251"},
                    {"text": "Cyprus", "code": "CY", "id": "55"},
                    {"text": "Czech Republic", "code": "CZ", "id": "56"},
                    {"text": "Denmark", "code": "DK", "id": "59"},
                    {"text": "Djibouti", "code": "DJ", "id": "58"},
                    {"text": "Dominica", "code": "DM", "id": "60"},
                    {"text": "Dominican Republic", "code": "DO", "id": "61"},
                    {"text": "East Timor", "code": "TL", "id": "221"},
                    {"text": "Ecuador", "code": "EC", "id": "63"},
                    {"text": "Egypt", "code": "EG", "id": "65"},
                    {"text": "El Salvador", "code": "SV", "id": "208"},
                    {"text": "Equatorial Guinea", "code": "GQ", "id": "88"},
                    {"text": "Eritrea", "code": "ER", "id": "67"},
                    {"text": "Estonia", "code": "EE", "id": "64"},
                    {"text": "Ethiopia", "code": "ET", "id": "69"},
                    {"text": "Falkland Islands", "code": "FK", "id": "72"},
                    {"text": "Faroe Islands", "code": "FO", "id": "74"},
                    {"text": "Fiji", "code": "FJ", "id": "71"},
                    {"text": "Finland", "code": "FI", "id": "70"},
                    {"text": "France", "code": "FR", "id": "75"},
                    {"text": "French Guiana", "code": "GF", "id": "80"},
                    {"text": "French Polynesia", "code": "PF", "id": "175"},
                    {"text": "French Southern Territories", "code": "TF", "id": "213"},
                    {"text": "Gabon", "code": "GA", "id": "76"},
                    {"text": "Gambia", "code": "GM", "id": "85"},
                    {"text": "Georgia", "code": "GE", "id": "79"},
                    {"text": "Germany", "code": "DE", "id": "57"},
                    {"text": "Ghana", "code": "GH", "id": "82"},
                    {"text": "Gibraltar", "code": "GI", "id": "83"},
                    {"text": "Greece", "code": "GR", "id": "89"},
                    {"text": "Greenland", "code": "GL", "id": "84"},
                    {"text": "Grenada", "code": "GD", "id": "78"},
                    {"text": "Guadeloupe", "code": "GP", "id": "87"},
                    {"text": "Guam", "code": "GU", "id": "92"},
                    {"text": "Guatemala", "code": "GT", "id": "91"},
                    {"text": "Guernsey", "code": "GG", "id": "81"},
                    {"text": "Guinea", "code": "GN", "id": "86"},
                    {"text": "Guinea-Bissau", "code": "GW", "id": "93"},
                    {"text": "Guyana", "code": "GY", "id": "94"},
                    {"text": "Haiti", "code": "HT", "id": "99"},
                    {"text": "Heard and McDonald Islands", "code": "HM", "id": "96"},
                    {"text": "Holy See (City Vatican State)", "code": "VA", "id": "233"},
                    {"text": "Honduras", "code": "HN", "id": "97"},
                    {"text": "Hong Kong", "code": "HK", "id": "95"},
                    {"text": "Hungary", "code": "HU", "id": "100"},
                    {"text": "Iceland", "code": "IS", "id": "109"},
                    {"text": "India", "code": "IN", "id": "105"},
                    {"text": "Indonesia", "code": "ID", "id": "101"},
                    {"text": "Iran (Islamic Republic of)", "code": "IR", "id": "108"},
                    {"text": "Iraq", "code": "IQ", "id": "107"},
                    {"text": "Ireland", "code": "IE", "id": "102"},
                    {"text": "Isle of Man", "code": "IM", "id": "104"},
                    {"text": "Israel", "code": "IL", "id": "103"},
                    {"text": "Italy", "code": "IT", "id": "110"},
                    {"text": "Jamaica", "code": "JM", "id": "112"},
                    {"text": "Japan", "code": "JP", "id": "114"},
                    {"text": "Jersey", "code": "JE", "id": "111"},
                    {"text": "Jordan", "code": "JO", "id": "113"},
                    {"text": "Kazakhstan", "code": "KZ", "id": "125"},
                    {"text": "Kenya", "code": "KE", "id": "115"},
                    {"text": "Kiribati", "code": "KI", "id": "118"},
                    {"text": "Korea, Democratic People\u0027s Republic", "code": "KP", "id": "121"},
                    {"text": "Korea, Republic of", "code": "KR", "id": "122"},
                    {"text": "Kosovo", "code": "XK", "id": "254"},
                    {"text": "Kuwait", "code": "KW", "id": "123"},
                    {"text": "Kyrgyzstan", "code": "KG", "id": "116"},
                    {"text": "Lao People\u0027s Democratic Republic", "code": "LA", "id": "126"},
                    {"text": "Latvia", "code": "LV", "id": "135"},
                    {"text": "Lebanon", "code": "LB", "id": "127"},
                    {"text": "Lesotho", "code": "LS", "id": "132"},
                    {"text": "Liberia", "code": "LR", "id": "131"},
                    {"text": "Libya", "code": "LY", "id": "136"},
                    {"text": "Liechtenstein", "code": "LI", "id": "129"},
                    {"text": "Lithuania", "code": "LT", "id": "133"},
                    {"text": "Luxembourg", "code": "LU", "id": "134"},
                    {"text": "Macau", "code": "MO", "id": "148"},
                    {"text": "Macedonia", "code": "MK", "id": "144"},
                    {"text": "Madagascar", "code": "MG", "id": "142"},
                    {"text": "Malawi", "code": "MW", "id": "156"},
                    {"text": "Malaysia", "code": "MY", "id": "158"},
                    {"text": "Maldives", "code": "MV", "id": "155"},
                    {"text": "Mali", "code": "ML", "id": "145"},
                    {"text": "Malta", "code": "MT", "id": "153"},
                    {"text": "Marshall Islands", "code": "MH", "id": "143"},
                    {"text": "Martinique", "code": "MQ", "id": "150"},
                    {"text": "Mauritania", "code": "MR", "id": "151"},
                    {"text": "Mauritius", "code": "MU", "id": "154"},
                    {"text": "Mayotte", "code": "YT", "id": "243"},
                    {"text": "Mexico", "code": "MX", "id": "157"},
                    {"text": "Micronesia, Federal State of", "code": "FM", "id": "73"},
                    {"text": "Moldova, Republic of", "code": "MD", "id": "139"},
                    {"text": "Monaco", "code": "MC", "id": "138"},
                    {"text": "Mongolia", "code": "MN", "id": "147"},
                    {"text": "Montenegro", "code": "ME", "id": "140"},
                    {"text": "Montserrat", "code": "MS", "id": "152"},
                    {"text": "Morocco", "code": "MA", "id": "137"},
                    {"text": "Mozambique", "code": "MZ", "id": "159"},
                    {"text": "Myanmar (Burma)", "code": "MM", "id": "146"},
                    {"text": "Namibia", "code": "NA", "id": "160"},
                    {"text": "Nauru", "code": "NR", "id": "169"},
                    {"text": "Nepal", "code": "NP", "id": "168"},
                    {"text": "Netherlands", "code": "NL", "id": "166"},
                    {"text": "New Caledonia", "code": "NC", "id": "161"},
                    {"text": "New Zealand", "code": "NZ", "id": "171"},
                    {"text": "Nicaragua", "code": "NI", "id": "165"},
                    {"text": "Niger", "code": "NE", "id": "162"},
                    {"text": "Nigeria", "code": "NG", "id": "164"},
                    {"text": "Niue", "code": "NU", "id": "170"},
                    {"text": "Norfolk Island", "code": "NF", "id": "163"},
                    {"text": "Northern Mariana Islands", "code": "MP", "id": "149"},
                    {"text": "Norway", "code": "NO", "id": "167"},
                    {"text": "Oman", "code": "OM", "id": "172"},
                    {"text": "Pakistan", "code": "PK", "id": "178"},
                    {"text": "Palau", "code": "PW", "id": "185"},
                    {"text": "Panama", "code": "PA", "id": "173"},
                    {"text": "Papua New Guinea", "code": "PG", "id": "176"},
                    {"text": "Paraguay", "code": "PY", "id": "186"},
                    {"text": "Peru", "code": "PE", "id": "174"},
                    {"text": "Philippines", "code": "PH", "id": "177"},
                    {"text": "Pitcairn Island", "code": "PN", "id": "181"},
                    {"text": "Poland", "code": "PL", "id": "179"},
                    {"text": "Portugal", "code": "PT", "id": "184"},
                    {"text": "Puerto Rico", "code": "PR", "id": "182"},
                    {"text": "Qatar", "code": "QA", "id": "187"},
                    {"text": "Reunion Island", "code": "RE", "id": "188"},
                    {"text": "Romania", "code": "RO", "id": "189"},
                    {"text": "Russian Federation", "code": "RU", "id": "190"},
                    {"text": "Rwanda", "code": "RW", "id": "191"},
                    {"text": "Saint Barthélemy", "code": "BL", "id": "26"},
                    {"text": "Saint Helena", "code": "SH", "id": "198"},
                    {"text": "Saint Kitts and Nevis", "code": "KN", "id": "120"},
                    {"text": "Saint Lucia", "code": "LC", "id": "128"},
                    {"text": "Saint Martin", "code": "MF", "id": "141"},
                    {"text": "Saint Vincent and the Grenadines", "code": "VC", "id": "234"},
                    {"text": "Samoa", "code": "WS", "id": "241"},
                    {"text": "San Marino", "code": "SM", "id": "203"},
                    {"text": "Sao Tome and Principe", "code": "ST", "id": "207"},
                    {"text": "Saudi Arabia", "code": "SA", "id": "192"},
                    {"text": "Senegal", "code": "SN", "id": "204"},
                    {"text": "Serbia", "code": "RS", "id": "50"},
                    {"text": "Seychelles", "code": "SC", "id": "194"},
                    {"text": "Sierra Leone", "code": "SL", "id": "202"},
                    {"text": "Singapore", "code": "SG", "id": "197"},
                    {"text": "Sint Maarten", "code": "SX", "id": "252"},
                    {"text": "Slovak Republic", "code": "SK", "id": "201"},
                    {"text": "Slovenia", "code": "SI", "id": "199"},
                    {"text": "Solomon Islands", "code": "SB", "id": "193"},
                    {"text": "Somalia", "code": "SO", "id": "205"},
                    {"text": "South Africa", "code": "ZA", "id": "244"},
                    {"text": "South Georgia", "code": "GS", "id": "90"},
                    {"text": "South Sudan", "code": "SS", "id": "253"},
                    {"text": "Spain", "code": "ES", "id": "68"},
                    {"text": "Sri Lanka", "code": "LK", "id": "130"},
                    {"text": "St. Pierre and Miquelon", "code": "PM", "id": "180"},
                    {"text": "State of Palestine", "code": "PS", "id": "183"},
                    {"text": "Sudan", "code": "SD", "id": "195"},
                    {"text": "Suriname", "code": "SR", "id": "206"},
                    {"text": "Svalbard and Jan Mayen Islands", "code": "SJ", "id": "200"},
                    {"text": "Swaziland", "code": "SZ", "id": "210"},
                    {"text": "Sweden", "code": "SE", "id": "196"},
                    {"text": "Switzerland", "code": "CH", "id": "42"},
                    {"text": "Syrian Arab Republic", "code": "SY", "id": "209"},
                    {"text": "Taiwan", "code": "TW", "id": "225"},
                    {"text": "Tajikistan", "code": "TJ", "id": "216"},
                    {"text": "Tanzania", "code": "TZ", "id": "226"},
                    {"text": "Thailand", "code": "TH", "id": "215"},
                    {"text": "Togo", "code": "TG", "id": "214"},
                    {"text": "Tokelau", "code": "TK", "id": "217"},
                    {"text": "Tonga", "code": "TO", "id": "220"},
                    {"text": "Trinidad and Tobago", "code": "TT", "id": "223"},
                    {"text": "Tunisia", "code": "TN", "id": "219"},
                    {"text": "Turkey", "code": "TR", "id": "222"},
                    {"text": "Turkmenistan", "code": "TM", "id": "218"},
                    {"text": "Turks and Caicos Islands", "code": "TC", "id": "211"},
                    {"text": "Tuvalu", "code": "TV", "id": "224"},
                    {"text": "Uganda", "code": "UG", "id": "228"},
                    {"text": "Ukraine", "code": "UA", "id": "227"},
                    {"text": "United Arab Emirates", "code": "AE", "id": "2"},
                    {"text": "United Kingdom", "code": "GB", "id": "77"},
                    {"text": "United States", "code": "US", "id": "230"},
                    {"text": "Uruguay", "code": "UY", "id": "231"},
                    {"text": "US Minor Outlying Islands", "code": "UM", "id": "229"},
                    {"text": "Uzbekistan", "code": "UZ", "id": "232"},
                    {"text": "Vanuatu", "code": "VU", "id": "239"},
                    {"text": "Venezuela", "code": "VE", "id": "235"},
                    {"text": "Vietnam", "code": "VN", "id": "238"},
                    {"text": "Virgin Islands (British)", "code": "VG", "id": "236"},
                    {"text": "Virgin Islands (USA)", "code": "VI", "id": "237"},
                    {"text": "Wallis and Futuna", "code": "WF", "id": "240"},
                    {"text": "Western Sahara", "code": "EH", "id": "66"},
                    {"text": "Yemen", "code": "YE", "id": "242"},
                    {"text": "Zambia", "code": "ZM", "id": "245"},
                    {"text": "Zimbabwe", "code": "ZW", "id": "246"}
                ];

            returnObject = country_list.filter(function (x) {
                return x.code == inputVar;
            });

            return returnObject;

        }


        /* =============== Find account ID by a given account number =============== */

        /*
     * MDIMKOV 15.06.2021: this function finds the account ID of a given G/L account by looking for its account number
     *
     * RETURNS: integer (the G/L account ID)
     *
     * USAGE: var recItem = findAccountByNumber(acctNum);
     *
     * */

        function findAccountByNumber(acctNum) {

            var returnId = 0;

            var accountSearchObj = search.create({
                type: 'account',
                filters:
                    [
                        ['number', 'is', acctNum]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: 'internalid',
                            sort: search.Sort.ASC
                        })
                    ]
            });

            var accountSearchResults = accountSearchObj.run().getRange({
                start: 0,
                end: 1
            });

            try {
                if (accountSearchResults) {
                    returnId = accountSearchResults[0].getValue(accountSearchResults[0].columns[0]);
                }
            } catch (е) {
            }

            return returnId;

        }


        /* =============== Find list value (Id) by passing the text value and create a new list member, if it doesn't exist =============== */

        /*
     * MDIMKOV 20.06.2021:  this function gets a text value that potentially exists in a List/Record;
     * 						if the text value if found, the id is returned (usefull in integrations)
     * 						if the text value is not found, the List/Record is being extended to include the new text value
     *
     * NOTE: this funcion works no matter of the drop-down is based on a custom list, a custom record or a custom segment
     *       if custom record is used, it needs to be one with INCLUDE NAME FIELD and the value need to be stored in the NAME field
     *
     * RETURNS: integer (the respective ID)
     *
     * INPUT: the text value to search for and the List/Record id (e.g. customlist_abc or customrecord_abc)
     *
     * USAGE: recCustomer.setValue('custentity_oro_21_book_brand', findListValue('IN PROGRESS', 'customlist_oro_21_saletype'));
     *
     * */

        function findListValue(value, listRecType) {

            var returnId = 0;

            var brandSearchObj = search.create({
                type: listRecType,
                filters:
                    [
                        ['name', 'is', value]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: 'internalid',
                            sort: search.Sort.ASC
                        })
                    ]
            });

            var brandSearchResults = brandSearchObj.run().getRange({
                start: 0,
                end: 1
            });

            // MDIMKOV 20.06.2021: if result found, directly return it; otherwise, it needs to be created
            if (brandSearchResults[0]) {
                returnId = brandSearchResults[0].getValue(brandSearchResults[0].columns[0]);
            } else {
                var newListRec = record.create({
                    type: listRecType
                });

                newListRec.setValue('name', value);
                returnId = newListRec.save();
            }

            return returnId;

        }


        /* =============== Find list value (Id) by passing the text value and create a new list member, if it doesn't exist using Cache module =============== */

        /*
     * MDIMKOV 20.06.2021:  this function gets a text value that potentially exists in a List/Record;
     * 						if the text value if found, the id is returned (usefull in integrations)
     * 						if the text value is not found, the List/Record is being extended to include the new text value
     *                      the function makes use of the N/Cache module to save governance usage points
     *                      if the cache doesn't exist, it's being created (it has the same name as the listRecType value
     *                      the cache is being dropped every hour (ttl=60*60), to account for major list changes (record removed etc.)
     *                      if the text value is not found, it is also being added to the cache
     *                      if the [createIfMissing] is set to TRUE, the function will:
     *                          * add a new value to the record type
     *                          * get it's newly-created internal ID, add it to the Cache and pass it
     *
     * NOTE: this funcion works no matter of the drop-down is based on a custom list, a custom record or a custom segment
     *       if custom record is used, it needs to be one with INCLUDE NAME FIELD and the value need to be stored in the NAME field
     *
     * RETURNS: integer (the respective ID); 0 if no value was found in case you decide to not add it (createIfMissing=false)
     *
     * INPUT: the text value to search for and the List/Record id (e.g. customlist_abc or customrecord_abc); createIfMissing -- true/false
     *
     * USAGE: recCustomer.setValue('custentity_oro_21_book_brand', tvz.findListValue('IN PROGRESS', 'customlist_oro_21_saletype', true));
     *
     * */

        function findListValueCached(value, listRecType, createIfMissing) {

            var returnId = 0;

            // MDIMKOV 07.07.2021: initiate a CACHE with the name of the record/list/segment to be searched (prefixed with CACHE_)
            var listRecCache = cache.getCache({
                name: 'CACHE_' + listRecType.toUpperCase(),
                scope: cache.Scope.PUBLIC
            });

            log.debug('MDIMKOV', 'Cache loaded.');

            // MDIMKOV 08.07.2021: search for the value in question (e.g. 'Pending') -- note that the value is actually the key to search on
            returnId = listRecCache.get({
                key: value.toUpperCase() + '_KEY'
            }) || 0;

            log.debug('returnId-1', returnId);

            // MDIMKOV 08.07.2021: there is no entry in the Cache for this value -- we need to search the record for it
            if (!returnId) {


                log.debug('MDIMKOV', 'no entry found in cache');

                var recSearchObj = search.create({
                    type: listRecType,
                    filters:
                        [
                            ['name', 'is', value]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: 'internalid',
                                sort: search.Sort.ASC
                            })
                        ]
                });

                var recSearchResults = recSearchObj.run().getRange({
                    start: 0,
                    end: 1
                });

                log.audit('recSearchResults[0]', recSearchResults[0]);

                // MDIMKOV 20.06.2021: if result found, add it to the Cache and directly return it
                if (recSearchResults[0]) {

                    log.debug('MDIMKOV', 'Search result found...');

                    returnId = recSearchResults[0].getValue(recSearchResults[0].columns[0]) || 0;

                    log.debug('returnId-2', returnId);

                    if (returnId) {
                        listRecCache.put({
                            key: value.toUpperCase() + '_KEY',
                            value: returnId,
                            ttl: 60 * 60 // one hour
                        });
                    }
                } else if (createIfMissing) { // otherwise, it needs to be created in the record and the Cache to be updated

                    log.debug('MDIMKOV', 'Add the value to the record and to the cache');

                    var newListRec = record.create({
                        type: listRecType
                    });

                    newListRec.setValue('name', value);
                    returnId = newListRec.save() || 0;

                    if (returnId) {
                        listRecCache.put({
                            key: value.toUpperCase() + '_KEY',
                            value: returnId,
                            ttl: 60 * 60 // one hour
                        });
                    }
                }

            }

            return returnId;

        }


        /* =============== Find the internal ID of a record by searching for its external ID =============== */

        /*
     * MDIMKOV 20.06.2021:  this function resolves a NetSuite internal ID from an external ID; in case record is not found, internalId=0 is being returned
     *
     * RETURNS: integer (the respective internal ID; 0 if not found)
     *
     * INPUT: the record type and the external ID
     *
     * USAGE: getRecIdbyExtId('customer', 123);
     *
     * */

        function getRecIdbyExtId(recordType, externalId) {

            var internalId = 0;

            var recordSearchObj = search.create({
                type: recordType,
                filters:
                    [
                        ['externalid', 'anyof', externalId]
                    ],
                columns:
                    [
                        'internalid'
                    ]
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });

            return internalId;

        }


        /* =============== Find the currency internal ID by passing the currency ISO code =============== */

        /*
     * MDIMKOV 20.06.2021:  this function resolves the currency internal ID by passing the currency ISO code
     *
     * RETURNS: integer (the respective internal ID; 0 if not found)
     *
     * INPUT: the currency ISO code such as 'EUR' or 'USD'
     *
     * USAGE: currencyISOtoID('USD');
     *
     * */

        function currencyISOtoID(isoCode) {

            var theID = 0; //the internal ID that will be returned
            var mySearch = search.create({
                type: search.Type.CURRENCY,
                filters: [
                    search.createFilter({
                        name: 'symbol',
                        operator: search.Operator.IS,
                        values: isoCode
                    })
                ],
                columns: [
                    search.createColumn({name: 'name'})
                ]
            });

            var searchResults = mySearch.run().getRange({
                start: 0,
                end: 1
            });

            for (var i = 0; i < searchResults.length; i++) {
                theID = searchResults[i].id;
            }

            return theID;

        }


        /* =============== Convert a CSV file into a JSON content, so it can be used in a map/reduce script =============== */

        /*
     * MDIMKOV 20.06.2021:  this function converts a CSV file into a JSON content, so it can be used in a map/reduce script
     *
     * RETURNS: JSON object, uses the values in the first line (header values) as object keys! (e.g. myHeaderName : "123")
     *
     * INPUT: the file object with getContents()
     *
     * USAGE: var jsonCsv = csvFileToJSON(downloadedFile.getContents());
     *
     * */
        function csvFileToJSON(csv) {

            RegExp.escape = function (s) {
                return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            };


            function toArrays(csv) {
                var options = {};
                var config = {};
                config.separator = ',';
                config.delimiter = '"';

                var data = [];
                var options = {
                    delimiter: config.delimiter,
                    separator: config.separator,
                    start: options.start,
                    end: options.end,
                    state: {rowNum: 1, colNum: 1}
                };

                data = parse(csv, options);

                return data;

            }


            function parse(csv, options) {
                var separator = options.separator;
                var delimiter = options.delimiter;

                if (!options.state.rowNum) {
                    options.state.rowNum = 1;
                }
                if (!options.state.colNum) {
                    options.state.colNum = 1;
                }

                var data = [];
                var entry = [];
                var state = 0;
                var value = '';
                var exit = false;

                function endOfEntry() {
                    // reset the state
                    state = 0;
                    value = '';

                    // if 'start' hasn't been met, don't output
                    if (options.start && options.state.rowNum < options.start) {
                        // update global state
                        entry = [];
                        options.state.rowNum++;
                        options.state.colNum = 1;
                        return;
                    }


                    data.push(entry);

                    //console.log('entry:' + entry);

                    // cleanup
                    entry = [];

                    // if 'end' is met, stop parsing
                    if (options.end && options.state.rowNum >= options.end) {
                        exit = true;
                    }

                    // update global state
                    options.state.rowNum++;
                    options.state.colNum = 1;
                }

                function endOfValue() {

                    entry.push(value);

                    //console.log('value:' + value);
                    // reset the state
                    value = '';
                    state = 0;
                    // update global state
                    options.state.colNum++;
                }

                // escape regex-specific control chars
                var escSeparator = RegExp.escape(separator);
                var escDelimiter = RegExp.escape(delimiter);

                // compile the regEx str using the custom delimiter/separator
                var match = /(D|S|\n|\r|[^DS\r\n]+)/;
                var matchSrc = match.source;
                matchSrc = matchSrc.replace(/S/g, escSeparator);
                matchSrc = matchSrc.replace(/D/g, escDelimiter);
                match = RegExp(matchSrc, 'gm');

                // put on your fancy pants...
                // process control chars individually, use look-ahead on non-control chars
                csv.replace(match, function (m0) {
                    if (exit) {
                        return;
                    }
                    switch (state) {
                        // the start of a value
                        case 0:
                            // null last value
                            if (m0 === separator) {
                                value += '';
                                endOfValue();
                                break;
                            }
                            // opening delimiter
                            if (m0 === delimiter) {
                                state = 1;
                                break;
                            }
                            // null last value
                            if (m0 === '\n') {
                                endOfValue();
                                endOfEntry();
                                break;
                            }
                            // phantom carriage return
                            if (/^\r$/.test(m0)) {
                                break;
                            }
                            // un-delimited value
                            value += m0;
                            state = 3;
                            break;

                        // delimited input
                        case 1:
                            // second delimiter? check further
                            if (m0 === delimiter) {
                                state = 2;
                                break;
                            }
                            // delimited data
                            value += m0;
                            state = 1;
                            break;

                        // delimiter found in delimited input
                        case 2:
                            // escaped delimiter?
                            if (m0 === delimiter) {
                                value += m0;
                                state = 1;
                                break;
                            }
                            // null value
                            if (m0 === separator) {
                                endOfValue();
                                break;
                            }
                            // end of entry
                            if (m0 === '\n') {
                                endOfValue();
                                endOfEntry();
                                break;
                            }
                            // phantom carriage return
                            if (/^\r$/.test(m0)) {
                                break;
                            }
                            // broken paser?
                            throw new Error('CSVDataError: Illegal State [Row:' + options.state.rowNum + '][Col:' + options.state.colNum + ']');

                        // un-delimited input
                        case 3:
                            // null last value
                            if (m0 === separator) {
                                endOfValue();
                                break;
                            }
                            // end of entry
                            if (m0 === '\n') {
                                endOfValue();
                                endOfEntry();
                                break;
                            }
                            // phantom carriage return
                            if (/^\r$/.test(m0)) {
                                break;
                            }
                            if (m0 === delimiter) {
                                // non-compliant data
                                throw new Error('CSVDataError: Illegal Quote [Row:' + options.state.rowNum + '][Col:' + options.state.colNum + ']');
                            }
                            // broken parser?
                            throw new Error('CSVDataError: Illegal Data [Row:' + options.state.rowNum + '][Col:' + options.state.colNum + ']');
                        default:
                            // shenanigans
                            throw new Error('CSVDataError: Unknown State [Row:' + options.state.rowNum + '][Col:' + options.state.colNum + ']');
                    }
                    //console.log('val:' + m0 + ' state:' + state);
                });

                // submit the last entry
                // ignore null last line
                if (entry.length !== 0) {
                    endOfValue();
                    endOfEntry();
                }

                return data;
            }

            var lines = [];
            var linesArray = csv.split('\r\n');
            if (linesArray.length === 1) { // if it couldn't split with the \r\n ending, so it's still 1 line, so it's probably the \r ending only
                linesArray = csv.split('\r');
            }
            if (linesArray.length === 1) { // if it couldn't split with the \r ending, so it's still 1 line, so it's probably the \n ending only
                linesArray = csv.split('\n');
            }

            // fix broken cells: some lines were broken although they were part of a cell (were within double quotes) -- glue them back together
            var linesArrayFinal = [];
            var finalLine = '';
            for (var t = 0; t < linesArray.length; t++) {
                finalLine += linesArray[t];
                var quoteCount = (finalLine.match(/"/g) || []).length; // check how many double quotes exist in the current line
                if (quoteCount % 2 === 0) { // even number of quotes => line is OK => push it
                    linesArrayFinal.push(finalLine);
                    finalLine = '';
                } else { // odd number of quotes, do not push the line but concatenate it with the next one and add a new line between them
                    finalLine += '\n';
                }
            }

            // for trimming and deleting extra space
            for (var m = 0; m < linesArrayFinal.length; m++) {
                var row = linesArrayFinal[m].replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();
                if (row) { // prevents adding an empty / blank line
                    lines.push(row);
                }
            }

            log.debug('linesArrayFinal', linesArrayFinal);
            log.debug('lines', lines);

            var result = [];
            var headers = toArrays(lines[0])[0];

            for (var i = 1; i < lines.length; i++) {

                var obj = {};
                var currentline = toArrays(lines[i])[0];
                log.debug('currentline', currentline);

                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j];
                }
                result.push(obj);
            }

            log.audit('result', result);
            return result;
        }


        /* =============== Find the document number (tranid) for a transaction by passing its internal id =============== */

        /*
     * MDIMKOV 20.07.2021: this function returns the document number (tranid) on a transaction by passing the transaction internal id to it
     *
     * RETURNS: string (such as 'ORD55839')
     *
     * INPUT: the transaction internal ID
     *
     * USAGE: transIntIdToDocNum(23564);
     *
     * */

        function transIntIdToDocNum(internalId) {

            var docNum = '';

            if (internalId) {

                var lookUpTransaction = search.lookupFields({
                    type: search.Type.TRANSACTION,
                    id: internalId,
                    columns: ['tranid']
                });

            }

            if (lookUpTransaction) {
                docNum = lookUpTransaction.tranid;
            }

            return docNum;

        }


        /* =============== Find the unit of measure ID by passing item ID and unit of measure code =============== */

        /*
     * MDIMKOV 04.08.2021: this function returns the unit of measure ID by passing item ID and unit of measure code
     *                     the item ID needed, as unit codes may not be unique among base unit types
     *
     * RETURNS: the unit of measure ID, integer, such as 3365
     *
     * INPUT: the item ID and the unit of measure code
     *
     * USAGE: getUnitIdByItemIdAndCode(5594, 'pack');
     *
     * */

        function getUnitIdByItemIdAndCode(itemId, unitCode) {

            var returnId = 0;

            if (itemId && unitCode) {

                // MDIMKOV 04.08.2021: get the primary units type
                var lookUpItem = search.lookupFields({
                    type: search.Type.ITEM,
                    id: itemId,
                    columns: ['unitstype']
                });

            }

            if (lookUpItem) {

                var primaryUnitTypeId = 0;

                try {
                    primaryUnitTypeId = lookUpItem.unitstype[0].value;
                } catch (e) {
                }

                if (primaryUnitTypeId) {
                    // MDIMKOV 04.08.2021: load the primary unit type with its unit types and search for the matching code
                    var recUOM = record.load({
                        type: record.Type.UNITS_TYPE,
                        id: primaryUnitTypeId,
                        isDynamic: true
                    });

                    var iLineCount = recUOM.getLineCount({sublistId: 'uom'});

                    for (var i = 0; i < iLineCount; i++) {

                        recUOM.selectLine({
                            sublistId: 'uom',
                            line: i
                        });

                        var uomAbbreviation = recUOM.getSublistValue({
                            sublistId: 'uom',
                            fieldId: 'abbreviation',
                            line: i
                        });

                        if (uomAbbreviation === unitCode) {

                            var uomId = recUOM.getSublistValue({
                                sublistId: 'uom',
                                fieldId: 'internalid',
                                line: i
                            });

                            if (uomId) {
                                returnId = uomId;
                            }

                            break;

                        }
                    }
                }
            }

            return returnId;

        }


        /* =============== Find the document number (tranid) for a transaction by passing its internal id =============== */

        /*
     * MDIMKOV 09.08.2021: this function returns a string with the date and time stamp -- to be used as a suffix for file names
     *
     * RETURNS: string such as '20210807134334' (to be used as file name suffix)
     *
     * INPUT: none
     *
     * USAGE: var fileName = 'SO_' + dateTimeStampForFileName() + '.csv';
     *
     * */

        function dateTimeStampForFileName() {

            function formatTimes() {

                var today = new Date()
                var now = new Date(today.getTime() + (today.getTimezoneOffset() * 60 * 1000));

                var day = now.getDate();
                if (day < 10) day = '0' + day;

                var month = now.getMonth() + 1;
                if (month < 10) month = '0' + month;

                year = now.getFullYear();

                var hours = now.getHours();
                if (hours < 10) hours = '0' + hours;

                var minutes = now.getMinutes();
                if (minutes < 10) minutes = '0' + minutes;

                var seconds = now.getSeconds();
                if (seconds < 10) seconds = '0' + seconds;

                return {
                    'year': year,
                    'month': month,
                    'day': day,
                    'hours': hours,
                    'minutes': minutes,
                    'seconds': seconds
                };
            }

            var dateAndTimeData = formatTimes();
            return dateAndTimeData.year + dateAndTimeData.month + dateAndTimeData.day + dateAndTimeData.hours + dateAndTimeData.minutes + dateAndTimeData.seconds;

        }


        /* =============== Find the shipping method id by passing its full name =============== */

        /*
     * MDIMKOV 17.08.2021:  this function resolves a NetSuite internal ID from an external ID for a shipping method; zero is returned if not found
     *
     * RETURNS: integer (the respective internal ID; 0 if not found)
     *
     * INPUT: the shipping method name (string)
     *
     * USAGE: findShippingMethodId('truck');
     *
     * */

        function findShippingMethodId(shipMethodName) {

            var internalId = 0;

            var recordSearchObj = search.create({
                type: 'shipitem',
                filters:
                    [
                        ['itemid', 'is', shipMethodName]
                    ],
                columns:
                    [
                        'internalid'
                    ]
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });

            return internalId;

        }


        /* =============== Return the names (e.g. John Smith) of the currently logged-in user =============== */

        /*
     * MDIMKOV 28.09.2021:  this function returns the names of the currently logged-in user (e.g. John Smith)
     *
     * RETURNS: string
     *
     * INPUT: none
     *
     * USAGE: getCurrentUserNames();
     *
     * */

        function getCurrentUserNames() {
            var userObj = runtime.getCurrentUser();
            return userObj.name;
        }


        /* =============== Return the id (e.g. 113) of the currently logged-in user =============== */

        /*
     * MDIMKOV 28.09.2021:  this function returns the id of the currently logged-in user (e.g. 113)
     *
     * RETURNS: integer
     *
     * INPUT: none
     *
     * USAGE: getCurrentUserId();
     *
     * */

        function getCurrentUserId() {
            var userObj = runtime.getCurrentUser();
            return userObj.id;
        }


        /* =============== Return the role name (e.g. administrator) of the currently logged-in user =============== */

        /*
     * MDIMKOV 28.09.2021:  this function returns the role name of the currently logged-in user (e.g. administrator)
     *
     * RETURNS: string
     *
     * INPUT: none
     *
     * USAGE: getCurrentUserRole(); // -> Administrator
     *
     * */

        function getCurrentUserRole() {
            var userObj = runtime.getCurrentUser();
            return userObj.roleId;
        }


        /* =============== Return the role id (e.g. 3) of the currently logged-in user =============== */

        /*
     * MDIMKOV 28.09.2021:  this function returns the role id of the currently logged-in user (e.g. 3)
     *
     * RETURNS: integer
     *
     * INPUT: none
     *
     * USAGE: getCurrentUserRoleId(); // -> 3
     *
     * */

        function getCurrentUserRoleId() {
            var userObj = runtime.getCurrentUser();
            return userObj.role;
        }


        /* =============== For SuiteTax transactions: go through the transaction lines and re-calculate net amounts from gross amounts =============== */

        /*
     * MDIMKOV 22.10.2021: since SuiteTax cannot calculate net amounts from gross amounts, this function iterates through trans lines and does that
     *  what this function does is the following:
     *   - expects the gross amount to be entered into the transaction's net amount field
     *   - once the transaction is saved, the amount is being used in combination with the already assigned tax percentage to reverse-calculate the net amount
     *   - =1= the gross amount that was initially saved in the net amount field is being replaced with the calculated net amount
     *   - =2= the rate field is being adjusted respectively, when the [adjustRate] parameter is being set to true
     *   - =3= the shipping surcharge is also being re-calculated with the respective net amount on the Shipping tab if the [adjustShippingValue] is set to true
     *   - =4= the cart discount on the transaction (the main discount) is implemented as follows: the native cart discount will be removed and it will be split through the lines by adding line discounts; also, this is fully based on the [additionalAmountFieldId] and the [originalAmountFieldId], as the discount amount added to each line will be the difference between the respectie line amount and the amount in the [additionalAmountFieldId]; note that cart discount cannot be used in conjunction with line discounts; if a line discount is detected, the cart discount functionality will not be triggered
     *   - =5= for line discounts: just make sure the [CALCULATE TAX BEFORE DISCOUNT IS APPLIED] is ticked in NetSuite; the line discount itself is always gross amount
     *   - =6= since sometimes the resulting gross amount has 0.01 cent difference, compare it to either the original gross amount or to the additional gross amount (custom columns) and fix rounding through tax details override
     *   - =7- since sometimes despite line roundings the total transaction gross amount has a rounding difference, compare the transaction gross total to a given (from outside) total and fix overall rounding by adjusting the tax base for the first tax detail line
     *   - =8= call the main function a second time in case cart discount is being used (as it creates new discount lines that need to be re-iterated)
     *
     * RETURNS: void
     *
     * INPUT: the record context; this function needs to be executed in a UE afterSubmit event
     *
     * USAGE: lib.suiteTaxGrossToNetAmounts(...) // for more information see the parameters descriptions below
     *
     * */

        function suiteTaxGrossToNetAmounts(
            context,                            // this is the context that is passed in the afterSubmit of the UE script
            sublistId,                          // the sublist id, for which the adjustments will be performed, normally 'item'
            processedLineFieldId,               // line checkbox field id, marking the line as already processed, so it doesn't reiterate next time; normally 'custcol_st_processed'
            processedShippingFieldId,           // body checkbox field id, marking the shipping amount as already processed, so it doesn't reiterate, normally 'custbody_st_processedship'
            adjustRate,                         // true / false -- defining if the rate on the line needs to be adjusted as well, as otherwise the amount on the line will not be quantity * rate (normally set to true)
            adjustShippingValue,                // true / false -- defining if shipping value will be subject to GTNA
            adjustCartDiscount,                 // true / false -- defining if cart discount will be processed; if yes, the native cart discount will be removed and it will be split through the lines by adding line discounts; also, this is fully based on the [additionalAmountFieldId], as the discount amount added to each line will be the difference between the respective line amount in the [originalAmountFieldId] and the amount in the [additionalAmountFieldId]; note that cart discount cannot be used in conjunction with line discounts; if a line discount is detected, the cart discount functionality will not be triggered
            adjustLineDiscounts,                // true / false -- defining if line discounts will be subject to GTNA
            applyRoundingWithTaxDetailOverride, // true / false -- defining if roundings will be adjusted; in this case, the [Tax Details Override] will be auto-enabled, if needed; this also works in conjunction with the next 2 fields
            originalAmountFieldId,              // line field id -- used mainly for rounding; this field will hold the initial amount entered (the initial gross amount that the whole calculation is based to), so that the resulting gross amount can be compared with this one, normally 'custcol_st_originalamount'
            additionalAmountFieldId,            // line field id -- used mainly for rounding, to works around issues with line discounts; if the third-party system can provide the gross amount after discount, make it enter it in this column; this way a comparison for line-discounted items can be achieved, which is impossible with the previous field, normally 'custcol_st_additionalamount'
            applyGlobalRounding,                // true / false -- for final, global transaction rounding, defines if the transaction total should be checked agaist the amount in the [globalAmountFieldId] and, if any slight difference exists, it will be applied to the first line of the tax details, to offset the final full amount, so everything matches perfectly
            globalAmountFieldId                 // body field id -- used to stamp the final gross total from the third-party system; if the [applyGlobalRounding] is set to true, the amount stamped here is being compared to the final gross transaction total and, if any slight difference exists, it will be applied to the first line of the tax details, to offset the final full amount; normally 'custbody_st_totalgrossamt'
        ) {

            // MDIMKOV 22.04.2022: this is the very main function that does the main line processing and adjust the shipping; it's fractored in an own function, as it also needs to be called a second time in case cart discount is being used (as it creates new discount lines that need to be re-iterated)
            function mainLineProcessingAndShippingAdjustment(context, adjustLineDiscounts, sublistId, processedLineFieldId, originalAmountFieldId, adjustShippingValue, processedShippingFieldId) {

                const newRec = context.newRecord;
                const transId = newRec.id;

                if (transId && sublistId && processedLineFieldId) {

                    // MDIMKOV 22.10.2021: go through the transaction lines and set the net amounts based on the amount already there and the tax code
                    var recTrans = record.load({
                        type: newRec.type,
                        id: transId,
                        isDynamic: false
                    });
                    const tranNum = recTrans.getValue('otherrefnum') ? recTrans.getValue('otherrefnum') : recTrans.getValue('tranid');
                    log.audit('MDIMKOV', 'processing transaction: ' + tranNum);

                    // MDIMKOV 31.12.2021: iterate through lines, check if the record was already processed or not and find the tax details reference
                    const iLineCount = recTrans.getLineCount({sublistId: sublistId});
                    var previousTdRef = ''; // used later for discount lines
                    for (let i = 0; i < iLineCount; i++) {
                        let isProcessed = recTrans.getSublistValue({
                            sublistId: sublistId,
                            fieldId: processedLineFieldId,
                            line: i
                        });
                        log.debug('isProcessed', 'line is processed: ' + isProcessed + ' (line #' + i + ') -------------------');
                        let tdRef = recTrans.getSublistValue({ // get the tax details reference from the line
                            sublistId: sublistId,
                            fieldId: 'taxdetailsreference',
                            line: i
                        });
                        if (!isProcessed) {
                            log.debug('tdRef', 'tdRef is: ' + tdRef);
                        }

                        // MDIMKOV 31.12.2021: find the line type, as general lines and discount lines are handled in a different way
                        const lineType = recTrans.getSublistValue({ // get the tax details reference from the line
                            sublistId: sublistId,
                            fieldId: 'itemtype',
                            line: i
                        });

                        // MDIMKOV 31.12.2021: in case the current line is a discount line, the tdRef (tax reference id) needs to be set to the tdRef from previous line
                        if (lineType == 'Discount') {
                            tdRef = previousTdRef;
                            lineDiscountExists = true; // used later in cart discounts; if a line discount exists, cart discounts are not processed
                            if (!isProcessed) {
                                log.debug('tdRef', 'this is a discount line, so the tdRef is now set to the previous line tdRef: ' + tdRef);
                            }

                            // MDIMKOV 31.12.2021: in case the line discounts should not be processed at all (adjustLineDiscounts=false), fully skip this line
                            if (!adjustLineDiscounts) {
                                continue;
                            }
                        }

                        // MDIMKOV 18.12.2021: only process transaction lines that were not processed so far
                        if (!isProcessed) {
                            log.audit('MDIMKOV', '... proceed with general-line calculations (line #' + i + ')');
                            let initialNetAmount = recTrans.getSublistValue({ // get the tax details reference from the line
                                sublistId: sublistId,
                                fieldId: 'amount',
                                line: i
                            });

                            // MDIMKOV 17.03.2022: stamp the original amount in the resp. custom field; will be potentially used later for fixing rounding discrepancies
                            if (originalAmountFieldId && initialNetAmount) {
                                recTrans.setSublistValue({
                                    sublistId: sublistId,
                                    fieldId: originalAmountFieldId,
                                    line: i,
                                    value: initialNetAmount
                                });
                            }

                            // MDIMKOV 22.10.2021: now that the tax details reference is known, get the tax rate from the tax details subtab
                            let taxRate = 0; // the tax rate that will be accumulated while iterating through tax details for the respective item line
                            const tdLineCount = recTrans.getLineCount({sublistId: 'taxdetails'});
                            for (var j = 0; j < tdLineCount; j++) {
                                let targetTdRef = recTrans.getSublistValue({
                                    sublistId: 'taxdetails',
                                    fieldId: 'taxdetailsreference',
                                    line: j
                                });
                                // MDIMKOV 01.04.2022: iterate through tax details and find all references, keeping in mind more than one tax detail line may exist for each item line => tax rate will have to be accumulated
                                if (targetTdRef === tdRef) {
                                    log.debug('targetTdRef', 'targetTdRef found (line #' + i + ')');
                                    let taxPartialRate = recTrans.getSublistValue({
                                        sublistId: 'taxdetails',
                                        fieldId: 'taxrate',
                                        line: j
                                    });
                                    log.debug('taxPartialRate', 'taxPartialRate: ' + taxPartialRate + ' (line #' + i + ')');

                                    taxRate = taxRate + parseFloat(taxPartialRate);
                                    log.audit('taxRate', 'taxRate accumulated so far: ' + taxRate + ' (line #' + i + ')');
                                }
                            } // end of looping through tax detail lines

                            // MDIMKOV 01.04.2022: now that the total tax rate needed was accumulated through the Tax Details lines, proceed with adjusting the item amounts
                            if (taxRate && initialNetAmount) { // the initial net amount is actually the gross amount

                                // MDIMKOV 22.10.2021: =1= re-calculate the net amount, set it and set the record as processed
                                log.debug('MDIMKOV', 'Proceed with case =1= (line #' + i + ')');
                                let grossAmount = initialNetAmount;
                                log.debug('grossAmount', grossAmount);

                                let netAmount = 100 * grossAmount / (100 + taxRate);
                                log.debug('netAmount', 'netAmount' + netAmount);

                                // MDIMKOV 25.11.2021: adjust the net amount by replacing the gross value with the net value (for discount lines this needs to be the rate, not the amount)
                                if (lineType != 'Discount') {
                                    recTrans.setSublistValue({
                                        sublistId: sublistId,
                                        fieldId: 'amount',
                                        line: i,
                                        value: netAmount
                                    });
                                } else {
                                    recTrans.setSublistValue({
                                        sublistId: sublistId,
                                        fieldId: 'rate',
                                        line: i,
                                        value: netAmount
                                    });
                                }

                                // MDIMKOV 25.11.2021: =2= if requested, adjust the rate amount by dividing the net amount by the quantity (ignore discount lines)
                                if (adjustRate && lineType != 'Discount') {
                                    let quantity = recTrans.getSublistValue({
                                        sublistId: sublistId,
                                        fieldId: 'quantity',
                                        line: i
                                    });
                                    if (quantity) {
                                        recTrans.setSublistValue({
                                            sublistId: sublistId,
                                            fieldId: 'rate',
                                            line: i,
                                            value: netAmount / quantity
                                        });
                                    }
                                }

                                // MDIMKOV 25.11.2021: set the line as processed
                                recTrans.setSublistValue({
                                    sublistId: sublistId,
                                    fieldId: processedLineFieldId,
                                    line: i,
                                    value: true
                                });

                            } else if (taxRate === 0 && initialNetAmount) {

                                // MDIMKOV 23.12.2021: in some cases we have a valid tax of 0%
                                log.debug('MDIMKOV', 'tax rate is 0%, so just set the line as processed (line #' + i + ')');
                                recTrans.setSublistValue({
                                    sublistId: sublistId,
                                    fieldId: processedLineFieldId,
                                    line: i,
                                    value: true
                                });
                            }
                        }
                        // MDIMKOV 31.12.2021: before navigating to the next line, save the tax details reference; will be used if next line is a discount line
                        previousTdRef = tdRef;
                    }

                    // MDIMKOV 25.11.2021: =3= if the [adjustShippingValue] is set to true, proceed with adjusting the shipping rate (replace gross with net)
                    if (adjustShippingValue && processedShippingFieldId && recTrans) {
                        let isShippingProcessed = recTrans.getValue(processedShippingFieldId);
                        if (!isShippingProcessed) {
                            log.audit('MDIMKOV', '');
                            log.audit('MDIMKOV', '=3= Proceed with shipping value adjustment...');

                            // MDIMKOV 22.10.2021: get the shipping tax rate from the tax details subtabng rate, which will be used in subsequent cases (not directly here)
                            let shippingTaxRate = '';
                            let taxLineCount = recTrans.getLineCount({sublistId: 'taxdetails'});
                            for (var k = 0; k < taxLineCount; k++) {

                                // MDIMKOV 25.11.2021: if the line type is [Shipping], this is the shipping rate; note it for later (used in next cases, not here)
                                var lineType = recTrans.getSublistValue({
                                    sublistId: 'taxdetails',
                                    fieldId: 'linetype',
                                    line: k
                                });
                                if (lineType == 'Shipping') {
                                    shippingTaxRate = recTrans.getSublistValue({
                                        sublistId: 'taxdetails',
                                        fieldId: 'taxrate',
                                        line: k
                                    });
                                }
                            }
                            log.debug('shippingTaxRate', shippingTaxRate);

                            // MDIMKOV 25.11.2021: get the currently stamped shipping tax rate and calculate the net amount of it by using the shipping rate just found
                            let shippingGrossRate = recTrans.getValue('shippingcost');
                            let shippingNetRate = 0;
                            if (shippingGrossRate) {
                                shippingNetRate = 100 * shippingGrossRate / (100 + shippingTaxRate);
                            }

                            // MDIMKOV 25.11.2021: if the net shipping rate was calculated, replace the current value with the newly-calculated one
                            if (shippingNetRate) {
                                recTrans.setValue('shippingcost', shippingNetRate);
                            }

                            // MDIMKOV 25.11.2021: declare the shipping conversion as done (tick the checkbox)
                            recTrans.setValue(processedShippingFieldId, true);
                        }
                    }
                }

                // MDIMKOV 19.12.2021: finally, save the transaction
                recTrans.save();
            }

            // MDIMKOV 19.12.2021: this is executed afterSubmit => do not execute if the user event type is DELETE
            if (context.type === context.UserEventType.DELETE) {
                return;
            }

            const newRec = context.newRecord;
            const transId = newRec.id;
            let lineDiscountExists = false;


            // MDIMKOV 22.04.2022: proceed with main line processing and, potentially, shipping rate adjustment:
            log.audit('MDIMKOV', '');
            log.audit('MDIMKOV', '=1= Proceed with script');
            mainLineProcessingAndShippingAdjustment(context, adjustLineDiscounts, sublistId, processedLineFieldId, originalAmountFieldId, adjustShippingValue, processedShippingFieldId);


            // MDIMKOV 17.03.2022: if fixing rounding differences is enabled, check the lines again and apply the differences
            // this is done by enabling [Tax Details Override] on the [Tax Details] subtab and adding tax rates for each tax reference line
            if (applyRoundingWithTaxDetailOverride && (originalAmountFieldId || additionalAmountFieldId)) {
                log.audit('MDIMKOV', '');
                log.audit('MDIMKOV', '=6= Proceed with fixing line roundings / tax details override');

                // MDIMKOV 17.03.2022: check if rounding needed on any of the lines; if not, leave the function
                let isTaxDetailsOverrideEnabled = false;
                const recRoundTrans = record.load({
                    type: newRec.type,
                    id: transId,
                    isDynamic: true
                });

                const iLineCount = recRoundTrans.getLineCount({sublistId: sublistId});

                for (let k = 0; k < iLineCount; k++) {
                    const originalGrossAmount = recRoundTrans.getSublistValue({
                        sublistId: sublistId,
                        fieldId: originalAmountFieldId ? additionalAmountFieldId : originalAmountFieldId,
                        line: k
                    });

                    // MDIMKOV 31.12.2021: find the line type, as discount lines need to be ignored here
                    const lineType = recRoundTrans.getSublistValue({
                        sublistId: sublistId,
                        fieldId: 'itemtype',
                        line: k
                    });

                    if (lineType != 'Discount') {

                        // MDIMKOV 17.03.2022: get the tax details reference from the line
                        let tdRef = recRoundTrans.getSublistValue({
                            sublistId: sublistId,
                            fieldId: 'taxdetailsreference',
                            line: k
                        });

                        // MDIMKOV 17.03.2022: iterate through tax details lines until you find the respective one and adjust the tax amount by the rounding difference
                        const tdLineCount = recRoundTrans.getLineCount({sublistId: 'taxdetails'});
                        for (let m = 0; m < tdLineCount; m++) {

                            recRoundTrans.selectLine({
                                sublistId: 'taxdetails',
                                line: m
                            });

                            const targetTdRef = recRoundTrans.getCurrentSublistValue({
                                sublistId: 'taxdetails',
                                fieldId: 'taxdetailsreference'
                            });

                            if (targetTdRef === tdRef) { // iterate tax details until reference found

                                // MDIMKOV 17.03.2022: get the original tax amount that used to be set by SuiteTax (in the next step it will be adjusted by the rounding difference)
                                const taxAmount = recRoundTrans.getCurrentSublistValue({
                                    sublistId: 'taxdetails',
                                    fieldId: 'taxamount'
                                });

                                const taxBasis = recRoundTrans.getCurrentSublistValue({
                                    sublistId: 'taxdetails',
                                    fieldId: 'taxbasis'
                                });

                                const calculatedGrossAmount = taxBasis + taxAmount;

                                const lineRoundingDifference = originalGrossAmount - calculatedGrossAmount;
                                log.audit('MDIMKOV', ' ... lineRoundingDifference: ' + lineRoundingDifference);

                                if (lineRoundingDifference > -0.05 && lineRoundingDifference < 0.05 && lineRoundingDifference != 0) { // check for discrepancies of up to +/- 5 cents

                                    // MDIMKOV 17.03.2022: enable the [Tax Details Override] field on [Tax Details] subtab, if not already enabled
                                    if (!isTaxDetailsOverrideEnabled) {
                                        log.audit('MDIMKOV', ' ... enable tax details override');
                                        recRoundTrans.setValue('taxdetailsoverride', true);
                                        isTaxDetailsOverrideEnabled = true;
                                    }

                                    // MDIMKOV 17.03.2022: adjust the tax amount by the rounding difference
                                    recRoundTrans.setCurrentSublistValue({
                                        sublistId: 'taxdetails',
                                        fieldId: 'taxamount',
                                        value: taxAmount + lineRoundingDifference
                                    });

                                }

                                recRoundTrans.commitLine({
                                    sublistId: 'taxdetails'
                                });
                            }
                        }
                    }
                }
                recRoundTrans.save();
            }


            // MDIMKOV 21.04.2022: =4= if the [adjustCartDiscount] is set to true, the native cart discount will be removed and it will be split through the lines by adding line discounts; also, this is fully based on the [additionalAmountFieldId], as the discount amount added to each line will be the difference between the respectie line amount and the amount in the [additionalAmountFieldId]
            if (adjustCartDiscount && !lineDiscountExists && originalAmountFieldId && additionalAmountFieldId) { // only proceed if no line discount exists so far; also prevents from re-triggering
                log.audit('MDIMKOV', '');
                log.audit('MDIMKOV', '=4= Proceed with applying the cart discount');

                // MDIMKOV 21.04.2022: load the transaction again, remove the cart disount and save it again (as we need to start off with a non-cart-discounted transaction)
                log.audit('MDIMKOV', ' ... remove the cart discount fully');
                const recRemoveCartDiscountTrans = record.load({
                    type: newRec.type,
                    id: transId,
                    isDynamic: true
                });

                if (recRemoveCartDiscountTrans.getValue('discountrate')) { // only proceed if there's a discount rate set

                    recRemoveCartDiscountTrans.setValue('discountitem', '');
                    recRemoveCartDiscountTrans.setValue('discountrate', '');
                    recRemoveCartDiscountTrans.save();


                    // MDIMKOV 21.04.2022: add line discount items accounting for the difference between actual amount and discounted amount in the [additionalAmountFieldId] field
                    log.audit('MDIMKOV', ' ... proceed with adding discount lines for each line item');
                    const recCartDiscountTrans = record.load({
                        type: newRec.type,
                        id: transId,
                        isDynamic: true
                    });

                    const iLineCount = recCartDiscountTrans.getLineCount({sublistId: sublistId});
                    for (let i = iLineCount; i >= 1; i--) {
                        log.audit('MDIMKOV', ' ... ... check if discount needs to be inserted for line ' + i);

                        // MDIMKOV 22.04.2022: make sure that the [original amount] and [additional amount] fields were populated, as the discount amount will be the difference between them
                        const originalAmount = recCartDiscountTrans.getSublistValue({
                            sublistId: sublistId,
                            fieldId: originalAmountFieldId,
                            line: i - 1 // checks the line before the the discount line, i.e. the real item line
                        });

                        const additionalAmount = recCartDiscountTrans.getSublistValue({
                            sublistId: sublistId,
                            fieldId: additionalAmountFieldId,
                            line: i - 1 // checks the line before the the discount line, i.e. the real item line
                        });

                        // MDIMKOV 22.04.2022: ignore the iteration (do not insert a discount line) if there is no proper difference to add
                        if (additionalAmount - originalAmount == 0) {
                            log.audit('MDIMKOV', ' ... ... ... no, continue iteration');
                            continue;
                        }
                        log.audit('MDIMKOV', ' ... ... ... yes, proceed with inserting discount line for line ' + i);

                        // MDIMKOV 07.06.2022: the next block checks the amount to be added on the discount line. It also works around a scenario where the gross amount to be discounted is more than the net original price
                        // for example: item line has gross amount of EUR 1.00, which was earlier calculated to 0.93 (9% tax); trying to fully discount it with 1 EUR (stamping 1 EUR on the discount line before it is converted to net amount
                        // will lead to a negative total amount, should this be the only item line on the transaction; as such, the following trick is implemented:
                        // 1) calculate the amount to be discounted 2) calculate the absolute value of it (as if it's a mark-up, instead of a discount) 3) add the discount line (with the positive amount) 4) finally, all discounts need to be set as negative
                        const amountToDiscount = Math.abs(additionalAmount - originalAmount);

                        recCartDiscountTrans.insertLine({
                            sublistId: sublistId,
                            line: i,
                        });

                        recCartDiscountTrans.setCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: 'item',
                            value: getItemIdByName('Discount')
                        });
                        recCartDiscountTrans.setCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: 'rate',
                            value: amountToDiscount
                        });

                        recCartDiscountTrans.commitLine({
                            sublistId: sublistId
                        });
                    }
                    recCartDiscountTrans.save();


                    // MDIMKOV 22.04.2022: proceed with main line processing again, as the newly-added discount lines need to be re-iterated for GTNA processing
                    log.audit('MDIMKOV', '');
                    log.audit('MDIMKOV', '=8= Proceed with script re-iterating the lines, so that newly-created Discount lines can be adjusted');
                    mainLineProcessingAndShippingAdjustment(context, adjustLineDiscounts, sublistId, processedLineFieldId, originalAmountFieldId, adjustShippingValue, processedShippingFieldId);


                    // MDIMKOV 07.06.2022: iterate once again through discount lines and set them as negative (see comment [4)] from [07.06.2022] above
                    log.audit('MDIMKOV', '');
                    log.audit('MDIMKOV', '=9= Proceed with script re-iterating the disount lines, to make them negative');
                    const recDisountToNegative = record.load({
                        type: newRec.type,
                        id: transId,
                        isDynamic: true
                    });

                    const iLineDiscToNegativeCount = recDisountToNegative.getLineCount({sublistId: sublistId});
                    for (let i = 0; i < iLineDiscToNegativeCount; i++) {
                        log.audit('MDIMKOV', ' ... check if line is a discount for line ' + i);

                        recDisountToNegative.selectLine({
                            sublistId: sublistId,
                            line: i
                        });

                        const newLineType = recDisountToNegative.getCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: 'itemtype'
                        });

                        if (newLineType == 'Discount') {
                            log.audit('MDIMKOV', ' ... ... yes, proceed with setting negative value ');
                            let discAmtToSet = recDisountToNegative.getCurrentSublistValue({
                                sublistId: sublistId,
                                fieldId: 'amount'
                            });
                            discAmtToSet = -Math.abs(discAmtToSet); // make sure it's negative -- this will be the ultimate negative net amount to discount
                            log.audit('MDIMKOV', ' ... ... final negative net discount amount to set will be ' + discAmtToSet);
                            recDisountToNegative.setCurrentSublistValue({ // set custom price level
                                sublistId: sublistId,
                                fieldId: 'price',
                                value: -1
                            });
                            recDisountToNegative.setCurrentSublistValue({
                                sublistId: sublistId,
                                fieldId: 'amount',
                                value: discAmtToSet
                            });

                            recDisountToNegative.commitLine({
                                sublistId: sublistId
                            });
                        } else {
                            log.audit('MDIMKOV', ' ... ... no, continue iteration ');
                        }
                    }
                    recDisountToNegative.save();
                }
            }


            // MDIMKOV 27.03.2022: apply total gross rounding adjustment (global difference applied to the first tax details line)
            if (applyGlobalRounding && globalAmountFieldId) {
                log.audit('MDIMKOV', '');
                log.audit('MDIMKOV', '=7= Proceed with fixing global rounding / tax details override');

                // MDIMKOV 27.03.2022: load the record again and check the total so far
                let isTaxDetailsOverrideEnabled = false;
                const recGlobalRoundTrans = record.load({
                    type: newRec.type,
                    id: transId,
                    isDynamic: true
                });

                const transTotal = recGlobalRoundTrans.getValue('total') ? recGlobalRoundTrans.getValue('total') : 0;
                const transGivenTotal = recGlobalRoundTrans.getValue(globalAmountFieldId) ? recGlobalRoundTrans.getValue(globalAmountFieldId) : 0;
                const globalRoundingDifference = transGivenTotal - transTotal;

                if (transTotal && transGivenTotal) { // make sure these are some meaningful values
                    log.audit('MDIMKOV', ' ... globalRoundingDifference: ' + globalRoundingDifference);

                    if (globalRoundingDifference > -0.05 && globalRoundingDifference < 0.05 && globalRoundingDifference != 0) {

                        // MDIMKOV 17.03.2022: enable the [Tax Details Override] field on [Tax Details] subtab, if not already enabled
                        if (!isTaxDetailsOverrideEnabled) {
                            log.audit('MDIMKOV', ' ... enable tax details override');
                            recGlobalRoundTrans.setValue('taxdetailsoverride', true);
                        }

                        recGlobalRoundTrans.selectLine({
                            sublistId: 'taxdetails',
                            line: 0
                        });

                        // MDIMKOV 27.03.2022: apply the difference to the [Tax Amount] field on the first [Tax Details] line
                        const firstLineTaxAmount = recGlobalRoundTrans.getCurrentSublistValue({
                            sublistId: 'taxdetails',
                            fieldId: 'taxamount'
                        });

                        recGlobalRoundTrans.setCurrentSublistValue({
                            sublistId: 'taxdetails',
                            fieldId: 'taxamount',
                            value: firstLineTaxAmount + globalRoundingDifference
                        });

                        recGlobalRoundTrans.commitLine({
                            sublistId: 'taxdetails'
                        });
                    }
                }
                recGlobalRoundTrans.save();
            }
        }


        /* =============== Return a new URL based on the old URL and added parameters =============== */

        /*
     * MDIMKOV 28.09.2021:  this function returns a URL by passing a URL and additional parameters; it updates the ones existing and adds new ones; also accounts for existin ? sign
     *
     * RETURNS: string
     *
     * INPUT: old URL, parameter name, parameter value
     *
     * USAGE: var newUrl = replaceUrlParam("https://www.google.com", "test", "123")
     *
     * */

        function replaceUrlParam(url, paramName, paramValue) {
            if (paramValue == null) {
                paramValue = '';
            }
            var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
            if (url.search(pattern) >= 0) {
                return url.replace(pattern, '$1' + paramValue + '$2');
            }
            url = url.replace(/[?#]$/, '');
            return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
        }


        /* =============== Return a date in any chosen date format by passing a date object and a mask =============== */

        /*
     * MDIMKOV 31.10.2021:  this function returns date string of any date format, based on input date object and a mask that defines the format
     *
     * NOTES: you can use a variety of masks, short and long day/month names or numbers, month numbers with(out) leading zero etc.
     *          scroll down 40-50 lines to see what the abbreviations are used for, e.g. d, D, m, y, H etc.
     *          for more information, visit: https://blog.stevenlevithan.com/archives/date-time-format
     *
     * RETURNS: string
     *
     * INPUT: date object and mask (as string)
     *
     * USAGE: var myDate = convertDateToFormat(date, 'dddd, mmmm dS, yyyy, h:MM:ss TT');
     *        var myDate = convertDateToFormat(date, '');
     *
     * */

        var convertDateToFormat = function () {
            var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                timezoneClip = /[^-+\dA-Z]/g,
                pad = function (val, len) {
                    val = String(val);
                    len = len || 2;
                    while (val.length < len) val = "0" + val;
                    return val;
                };

            // Regexes and supporting functions are cached through closure
            return function (date, mask, utc) {
                var dF = convertDateToFormat;

                // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
                if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                    mask = date;
                    date = undefined;
                }

                // Passing date through Date applies Date.parse, if necessary
                date = date ? new Date(date) : new Date;
                if (isNaN(date)) throw SyntaxError("invalid date");

                mask = String(dF.masks[mask] || mask || dF.masks["default"]);

                // Allow setting the utc argument via the mask
                if (mask.slice(0, 4) == "UTC:") {
                    mask = mask.slice(4);
                    utc = true;
                }

                var _ = utc ? "getUTC" : "get",
                    d = date[_ + "Date"](),
                    D = date[_ + "Day"](),
                    m = date[_ + "Month"](),
                    y = date[_ + "FullYear"](),
                    H = date[_ + "Hours"](),
                    M = date[_ + "Minutes"](),
                    s = date[_ + "Seconds"](),
                    L = date[_ + "Milliseconds"](),
                    o = utc ? 0 : date.getTimezoneOffset(),
                    flags = {
                        d: d,
                        dd: pad(d),
                        ddd: dF.i18n.dayNames[D],
                        dddd: dF.i18n.dayNames[D + 7],
                        m: m + 1,
                        mm: pad(m + 1),
                        mmm: dF.i18n.monthNames[m],
                        mmmm: dF.i18n.monthNames[m + 12],
                        yy: String(y).slice(2),
                        yyyy: y,
                        h: H % 12 || 12,
                        hh: pad(H % 12 || 12),
                        H: H,
                        HH: pad(H),
                        M: M,
                        MM: pad(M),
                        s: s,
                        ss: pad(s),
                        l: pad(L, 3),
                        L: pad(L > 99 ? Math.round(L / 10) : L),
                        t: H < 12 ? "a" : "p",
                        tt: H < 12 ? "am" : "pm",
                        T: H < 12 ? "A" : "P",
                        TT: H < 12 ? "AM" : "PM",
                        Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                        o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                        S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                    };

                return mask.replace(token, function ($0) {
                    return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                });
            };
        }();

        // Some common format strings
        convertDateToFormat.masks = {
            "default": "ddd mmm dd yyyy HH:MM:ss",
            shortDate: "m/d/yy",
            mediumDate: "mmm d, yyyy",
            longDate: "mmmm d, yyyy",
            fullDate: "dddd, mmmm d, yyyy",
            shortTime: "h:MM TT",
            mediumTime: "h:MM:ss TT",
            longTime: "h:MM:ss TT Z",
            isoDate: "yyyy-mm-dd",
            isoTime: "HH:MM:ss",
            isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        };

        // Internationalization strings
        convertDateToFormat.i18n = {
            dayNames: [
                "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            ],
            monthNames: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ]
        };

        // For convenience...
        Date.prototype.format = function (mask, utc) {
            return dateFormat(this, mask, utc);
        };


        /* =============== Remove duplicate members in an array and return a new array without duplicates =============== */

        /*
     * MDIMKOV 01.11.2021: this function takes an input array, removes its duplicate members and returns the array without duplicates
     *
     * RETURNS: array
     *
     * INPUT: array
     *
     * USAGE: const newArray = arrayRemoveDuplicateMembers(myArray)
     *
     * */

        function arrayRemoveDuplicateMembers(array) {
            var seen = {};
            var out = [];
            var len = array.length;
            var j = 0;
            for (var i = 0; i < len; i++) {
                var item = array[i];
                if (seen[item] !== 1) {
                    seen[item] = 1;
                    out[j++] = item;
                }
            }
            return out;
        }


        /* =============== MD5 hash an input string and returned the MD5-hashed string =============== */

        /*
     * MDIMKOV 28.09.2021:  this function returns the MD5-hashed string based on an input string (useful in integrations)
     *
     * RETURNS: string (the hashed string)
     *
     * INPUT: string (the string to be hashed)
     *
     * USAGE: md5hash('helloworld');
     *
     * */

        function md5hash(inputString) {
            const md5factory = function ($) {
                'use strict'

                /**
                 * Add integers, wrapping at 2^32.
                 * This uses 16-bit operations internally to work around bugs in interpreters.
                 *
                 * @param {number} x First integer
                 * @param {number} y Second integer
                 * @returns {number} Sum
                 */
                function safeAdd(x, y) {
                    var lsw = (x & 0xffff) + (y & 0xffff)
                    var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
                    return (msw << 16) | (lsw & 0xffff)
                }

                /**
                 * Bitwise rotate a 32-bit number to the left.
                 *
                 * @param {number} num 32-bit number
                 * @param {number} cnt Rotation count
                 * @returns {number} Rotated number
                 */
                function bitRotateLeft(num, cnt) {
                    return (num << cnt) | (num >>> (32 - cnt))
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} q q
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5cmn(q, a, b, x, s, t) {
                    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} c c
                 * @param {number} d d
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5ff(a, b, c, d, x, s, t) {
                    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} c c
                 * @param {number} d d
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5gg(a, b, c, d, x, s, t) {
                    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} c c
                 * @param {number} d d
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5hh(a, b, c, d, x, s, t) {
                    return md5cmn(b ^ c ^ d, a, b, x, s, t)
                }

                /**
                 * Basic operation the algorithm uses.
                 *
                 * @param {number} a a
                 * @param {number} b b
                 * @param {number} c c
                 * @param {number} d d
                 * @param {number} x x
                 * @param {number} s s
                 * @param {number} t t
                 * @returns {number} Result
                 */
                function md5ii(a, b, c, d, x, s, t) {
                    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
                }

                /**
                 * Calculate the MD5 of an array of little-endian words, and a bit length.
                 *
                 * @param {Array} x Array of little-endian words
                 * @param {number} len Bit length
                 * @returns {Array<number>} MD5 Array
                 */
                function binlMD5(x, len) {
                    /* append padding */
                    x[len >> 5] |= 0x80 << len % 32
                    x[(((len + 64) >>> 9) << 4) + 14] = len

                    var i
                    var olda
                    var oldb
                    var oldc
                    var oldd
                    var a = 1732584193
                    var b = -271733879
                    var c = -1732584194
                    var d = 271733878

                    for (i = 0; i < x.length; i += 16) {
                        olda = a
                        oldb = b
                        oldc = c
                        oldd = d

                        a = md5ff(a, b, c, d, x[i], 7, -680876936)
                        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
                        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
                        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
                        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
                        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
                        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
                        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
                        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
                        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
                        c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
                        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
                        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
                        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
                        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
                        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

                        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
                        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
                        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
                        b = md5gg(b, c, d, a, x[i], 20, -373897302)
                        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
                        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
                        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
                        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
                        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
                        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
                        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
                        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
                        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
                        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
                        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
                        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

                        a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
                        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
                        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
                        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
                        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
                        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
                        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
                        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
                        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
                        d = md5hh(d, a, b, c, x[i], 11, -358537222)
                        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
                        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
                        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
                        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
                        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
                        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

                        a = md5ii(a, b, c, d, x[i], 6, -198630844)
                        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
                        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
                        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
                        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
                        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
                        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
                        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
                        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
                        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
                        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
                        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
                        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
                        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
                        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
                        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)

                        a = safeAdd(a, olda)
                        b = safeAdd(b, oldb)
                        c = safeAdd(c, oldc)
                        d = safeAdd(d, oldd)
                    }
                    return [a, b, c, d]
                }

                /**
                 * Convert an array of little-endian words to a string
                 *
                 * @param {Array<number>} input MD5 Array
                 * @returns {string} MD5 string
                 */
                function binl2rstr(input) {
                    var i
                    var output = ''
                    var length32 = input.length * 32
                    for (i = 0; i < length32; i += 8) {
                        output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff)
                    }
                    return output
                }

                /**
                 * Convert a raw string to an array of little-endian words
                 * Characters >255 have their high-byte silently ignored.
                 *
                 * @param {string} input Raw input string
                 * @returns {Array<number>} Array of little-endian words
                 */
                function rstr2binl(input) {
                    var i
                    var output = []
                    output[(input.length >> 2) - 1] = undefined
                    for (i = 0; i < output.length; i += 1) {
                        output[i] = 0
                    }
                    var length8 = input.length * 8
                    for (i = 0; i < length8; i += 8) {
                        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32
                    }
                    return output
                }

                /**
                 * Calculate the MD5 of a raw string
                 *
                 * @param {string} s Input string
                 * @returns {string} Raw MD5 string
                 */
                function rstrMD5(s) {
                    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
                }

                /**
                 * Calculates the HMAC-MD5 of a key and some data (raw strings)
                 *
                 * @param {string} key HMAC key
                 * @param {string} data Raw input string
                 * @returns {string} Raw MD5 string
                 */
                function rstrHMACMD5(key, data) {
                    var i
                    var bkey = rstr2binl(key)
                    var ipad = []
                    var opad = []
                    var hash
                    ipad[15] = opad[15] = undefined
                    if (bkey.length > 16) {
                        bkey = binlMD5(bkey, key.length * 8)
                    }
                    for (i = 0; i < 16; i += 1) {
                        ipad[i] = bkey[i] ^ 0x36363636
                        opad[i] = bkey[i] ^ 0x5c5c5c5c
                    }
                    hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
                    return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
                }

                /**
                 * Convert a raw string to a hex string
                 *
                 * @param {string} input Raw input string
                 * @returns {string} Hex encoded string
                 */
                function rstr2hex(input) {
                    var hexTab = '0123456789abcdef'
                    var output = ''
                    var x
                    var i
                    for (i = 0; i < input.length; i += 1) {
                        x = input.charCodeAt(i)
                        output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f)
                    }
                    return output
                }

                /**
                 * Encode a string as UTF-8
                 *
                 * @param {string} input Input string
                 * @returns {string} UTF8 string
                 */
                function str2rstrUTF8(input) {
                    return unescape(encodeURIComponent(input))
                }

                /**
                 * Encodes input string as raw MD5 string
                 *
                 * @param {string} s Input string
                 * @returns {string} Raw MD5 string
                 */
                function rawMD5(s) {
                    return rstrMD5(str2rstrUTF8(s))
                }

                /**
                 * Encodes input string as Hex encoded string
                 *
                 * @param {string} s Input string
                 * @returns {string} Hex encoded string
                 */
                function hexMD5(s) {
                    return rstr2hex(rawMD5(s))
                }

                /**
                 * Calculates the raw HMAC-MD5 for the given key and data
                 *
                 * @param {string} k HMAC key
                 * @param {string} d Input string
                 * @returns {string} Raw MD5 string
                 */
                function rawHMACMD5(k, d) {
                    return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
                }

                /**
                 * Calculates the Hex encoded HMAC-MD5 for the given key and data
                 *
                 * @param {string} k HMAC key
                 * @param {string} d Input string
                 * @returns {string} Raw MD5 string
                 */
                function hexHMACMD5(k, d) {
                    return rstr2hex(rawHMACMD5(k, d))
                }

                /**
                 * Calculates MD5 value for a given string.
                 * If a key is provided, calculates the HMAC-MD5 value.
                 * Returns a Hex encoded string unless the raw argument is given.
                 *
                 * @param {string} string Input string
                 * @param {string} [key] HMAC key
                 * @param {boolean} [raw] Raw output switch
                 * @returns {string} MD5 output
                 */
                function md5(string, key, raw) {
                    if (!key) {
                        if (!raw) {
                            return hexMD5(string)
                        }
                        return rawMD5(string)
                    }
                    if (!raw) {
                        return hexHMACMD5(key, string)
                    }
                    return rawHMACMD5(key, string)
                }

                // if (typeof define === 'function' && define.amd) {
                //     define(function () {
                //         return md5
                //     })
                // } else if (typeof module === 'object' && module.exports) {
                //     module.exports = md5
                // } else {
                $.md5 = md5
                // }
            }

            const toBeHashed = {}
            md5factory(toBeHashed)

            const hashedResult = toBeHashed.md5(inputString);
            return hashedResult;
        }


        /* =============== Convert a number into a string with thousands separators added =============== */

        /*
     * MDIMKOV 24.11.2021:  this function returns the string representation of a float number with thousands separators added
     *
     * RETURNS: string
     *
     * INPUT: float / string
     *
     * USAGE: addThousandsSeparator(50000000.12);
     *
     * */

        function addThousandsSeparator(nStr) {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }


        /* =============== Convert Umlaute into ae, oe, ue etc. =============== */

        /*
     * MDIMKOV 02.03.2022:  this function returns a string such as oa, oe, ue based on an Umplaut that is given as parameter
     *
     * RETURNS: string
     *
     * INPUT: string
     *
     * USAGE: replaceUmlaute('das schöne Mädchen');  // => 'das schoene Maedchen'
     *
     * */

        function replaceUmlaute(str) {
            const umlautMap = {
                '\u00dc': 'UE',
                '\u00c4': 'AE',
                '\u00d6': 'OE',
                '\u00fc': 'ue',
                '\u00e4': 'ae',
                '\u00f6': 'oe',
                '\u00df': 'ss',
            }

            return str
                .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
                    const big = umlautMap[a.slice(0, 1)];
                    return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
                })
                .replace(new RegExp('[' + Object.keys(umlautMap).join('|') + ']', "g"),
                    (a) => umlautMap[a]
                );
        }


        /* =============== Convert a date string, such as '22.03.2022' into a Date Object =============== */

        /*
        * MDIMKOV 31.03.2022: this function converts a date string, such as '22.03.2022' into a Date Object
        *
        * RETURNS: date Object
        *
        * INPUT: string
        *
        * USAGE: const myDate = createDateObjectFromString('22.03.2022') // -> Mon Mar 27 2023 00:00:00 GMT+0300
        *
        * */

        function createDateObjectFromString(strDate) {
            const dateArray = strDate.split('.');
            const newDate = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
            return newDate;
        }


        /* =============== Get the revenue recognition end date by passing a start date and number of months =============== */

        /*
        * MDIMKOV 02.04.2022: this function gets the revenue recognition end date by passing a start date and number of months
        *   it will increase the number of months based on the number of months passed and will subtract a day
        *
        * Some sample results delivered by the function:
        *
        *       Start Date	    Months	        End Date
        *       15-Jan	        1	            14-Feb
        *       30-Jan	        1	            27-Feb
        *       29-Jan	        1	            27-Feb
        *       28-Jan	        1	            27-Feb
        *       27-Jan	        1	            26-Feb
        *       2-Feb	        1	            1-Mar
        *       1-Jan	        1	            31-Jan
        *       1-Apr-22	    12	            31-Mar-23
        *
        * RETURNS: date Object (start date); integer (number of months)
        *
        * INPUT: date Object
        *
        * USAGE: const revRecEndDate = getRevRecEndDate('2022-01-15', 1); // -> Mon Feb 14 2022 02:00:00 GMT+0200
        *
        * */

        function getRevRecEndDate(date, months) {
            date = new Date(date);
            var d = date.getDate();
            date.setMonth(date.getMonth() + +months); // add the months
            if (date.getDate() != d) {
                date.setDate(0);
            }
            date.setDate(date.getDate() - 1); // go back one day
            return date;
        }


        /* =============== Contruct a NetSuite URL, automatically find the domain / account ID in the URL =============== */

        /*
        * MDIMKOV 31.03.2022: this function constructs a URL that refers to the current NetSuite account / URL (e.g. 123456-sb1.app...)
        *       optionally, additional parameters, such as '&e=T' can be appended
        *       returns a URL such as [https://5115672-sb1.app.netsuite.com/app/] + the 2 parameters appended
        *
        * RETURNS: string
        *
        * INPUT: strings (for the optional parameters that will be appended
        *
        * USAGE: const url = constructURL('common/custom/custrecord.nl?id=', objectInternalId, '&e=T')  // => https://5115672-sb1.app.netsuite.com/app/common/custom/custrecord.nl?id=574&whence=
        *
        * */

        function constructURL(append1, append2) {
            let urlString = '';
            const host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });

            urlString += 'https://';
            urlString += host;
            urlString += '/app/';
            urlString += append1 ? append1 : '';
            urlString += append2 ? append2 : '';

            return urlString;
        }


        /* =============== Get the currency exchange rate for a given date =============== */

        /*
        * MDIMKOV 18.04.2022: this function returns the currency exchange rate (e.g. 1.95583) for a target currency based on source currency and date
        *
        * RETURNS: decimal
        *
        * INPUT: strings for the currencies, date for the date
        *
        * USAGE: const newAmount = getCurrencyExchangeRate('EUR', 'BGN', new Date()); => 1.95583
        *
        * */

        function getCurrencyExchangeRate(sourceCurrency, targetCurrency, date) {
            let rate = 0;

            rate = currency.exchangeRate({
                source: sourceCurrency,
                target: targetCurrency,
                date: new Date(date)
            });

            return rate;
        }


        /* =============== Get the subsidiary ID by passing the subsidiary name =============== */

        /*
        * MDIMKOV 25.04.2022: this function returns the subsidiary ID for a given subsidiary name;
        *                     Note: the name needs to follow the 'Parent Name : Child Name' structure
        *
        * RETURNS: integer
        *
        * INPUT: string
        *
        * USAGE: const subsidiaryId = getSubsidiaryIdByName('Parent Company : Munich'); // -> 12
        *
        * */

        function getSubsidiaryIdByName(name) {

            let internalId = 0;

            const recordSearchObj = search.create({
                type: record.Type.SUBSIDIARY,
                filters:
                    [['name', 'is', name]],
                columns:
                    ['internalid']
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });

            return internalId;

        }


        /* =============== Get the class ID by passing the class name =============== */

        /*
        * MDIMKOV 25.04.2022: this function returns the class ID for a given class name;
        *                     Note: the name needs to follow the 'Parent Name : Child Name' structure
        *
        * RETURNS: integer
        *
        * INPUT: string
        *
        * USAGE: const classId = getClassIdByName('Parent Class : Bern'); // -> 15
        *
        * */

        function getClassIdByName(name) {

            let internalId = 0;

            const recordSearchObj = search.create({
                type: record.Type.CLASSIFICATION,
                filters:
                    [['name', 'is', name]],
                columns:
                    ['internalid']
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });

            return internalId;

        }


        /* =============== Get the department ID by passing the department name =============== */

        /*
        * MDIMKOV 25.04.2022: this function returns the department ID for a given department name;
        *                     Note: the name needs to follow the 'Parent Name : Child Name' structure
        *
        * RETURNS: integer
        *
        * INPUT: string
        *
        * USAGE: const departmentId = getDepartmentIdByName('Parent Department : Finance'); // -> 17
        *
        * */

        function getDepartmentIdByName(name) {

            let internalId = 0;

            const recordSearchObj = search.create({
                type: record.Type.DEPARTMENT,
                filters:
                    [['name', 'is', name]],
                columns:
                    ['internalid']
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });

            return internalId;

        }


        /* =============== Find account ID by a given account name =============== */

        /*
     * MDIMKOV 29.04.2022: this function finds the account ID of a given G/L account by looking for its account name
     *
     * RETURNS: integer (the G/L account ID)
     *
     * USAGE: const acctId = getAccountByName('PayPal EUR'); // -> 113
     *
     * */

        function getAccountByName(acctName) {
            let returnId = 0;
            const accountSearchObj = search.create({
                type: 'account',
                filters:
                    [
                        ['name', 'is', acctName]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: 'internalid',
                            sort: search.Sort.ASC
                        })
                    ]
            });

            const accountSearchResults = accountSearchObj.run().getRange({
                start: 0,
                end: 1
            });

            try {
                if (accountSearchResults) {
                    returnId = accountSearchResults[0].id;
                }
            } catch (е) {
            }

            return returnId;

        }


        /* =============== Convert the string from the Options field on a transaction header into an array of field-value pairs =============== */

        /*
             * MDIMKOV 12.05.2022: Convert the string from the Options field on a transaction header into an array of field-value pairs
             *          Check the note about "previous version" - earlier [i + 3] was used -- this may be needed in future implementations again
             *
             * RETURNS: array
             *
             * USAGE: const headerOptionsArray = convertTransHeaderOptionsToArray(headerOptions); // -> [{field: "xxx", value: "yyy"}, {...}]
             *
             * */

        function convertTransHeaderOptionsToArray(headerOptions) {

            let newOptionsArray = [];

            const headerOptionsArray = headerOptions.split('');
            log.debug('headerOptionsArray - raw', headerOptionsArray);

            for (let i = 0; i < headerOptionsArray.length - 3; i++) {
                if (i % 3 == 0) {
                    newOptionsArray.push({
                        "field": (i == 0) ? headerOptionsArray[i] : headerOptionsArray[i].split('\u0004')[1],
                        "value": headerOptionsArray[i + 3]
                    });
                }
            }

            for (let i = 0; i < newOptionsArray.length; i++) {
                newOptionsArray[i].value = newOptionsArray[i].value.split('\u0004')[0];
            }

            return newOptionsArray;

        }


        /* =============== Find the top parent transaction id or number =============== */

        /*
        * MDIMKOV 15.05.2022: this function takes a transaction id and returns the [Created From] id or number from the top most parent transaction it was created from
        *  - if isReturnId is set to [true], the function will return the top-most parent transaction id, such as 66494
        *  - if isReturnId is set to [false], the function will return the top-most parent transaction name/number, like 'Sales Order #SO-J-147'
        *  - the function will iterate through parent transactions (e.g. a WO created from a WO that was created from a SO) until the top one is found
        *
        * RETURNS: string -- either an id of top-most parent transaction or its number (e.g. either 66494 or 'Sales Order #SO-J-147')
        *
        * INPUT: transId - integer (the current transaction id)
        *        isReturnId - boolean (if true, returns the transaction id, otherwise, the transaction type/name/number)
        *
        * USAGE: const topParentRecordName = findTopParentTransaction(23454, false); // -> 'Sales Order #SO-J-147'
        *
        * */

        function findTopParentTransaction(transId, isReturnId) {

            // MDIMKOV 15.05.2022: initialize main variables
            let returnValue = '';
            let parentId = transId;
            let oldCreatedFrom = '';
            const tranId = search.lookupFields({
                type: 'transaction',
                id: parentId,
                columns: ['tranid']
            }).tranid;


            // MDIMKOV 19.08.2022: enable logging
            // log.debug('MDIMKOV', '');
            // log.debug('MDIMKOV', 'start with function [findTopParentTransaction]');
            // log.debug('MDIMKOV', '... proceed with transaction ' + tranId + ' (id=' + transId + ')');


            // MDIMKOV 19.08.2022: check if transaction has at least one parent trasaction; if not, return null
            const firstCreatedFrom = search.lookupFields({
                type: 'transaction',
                id: parentId,
                columns: ['createdfrom']
            });

            if (!firstCreatedFrom || firstCreatedFrom['createdfrom'].length === 0) {
                returnValue = null;
                // log.debug('MDIMKOV', '... there is no parent transaction, return NULL and exit');
            } else {

                // MDIMKOV 15.05.2022: loop up to the parent records; if the top one is found ([createdfrom] empty), then exit the loop
                // log.debug('MDIMKOV', '... there is at least one parent transaction, proceed with the loop');
                for (let i = 0; i < 100; i++) {
                    const createdFrom = search.lookupFields({
                        type: 'transaction',
                        id: parentId,
                        columns: ['createdfrom']
                    });


                    // MDIMKOV 15.05.2022: on the last iteration, set the return value and exit the loop
                    if (!createdFrom || !createdFrom.createdfrom[0]) {
                        returnValue = isReturnId ? JSON.stringify(oldCreatedFrom.createdfrom[0].value) : JSON.stringify(oldCreatedFrom.createdfrom[0].text);
                        return returnValue;
                    } else {
                        // MDIMKOV 19.08.2022: parent transaction exists, so continue with the iterations
                        parentId = createdFrom.createdfrom[0].value;
                        oldCreatedFrom = createdFrom;
                    }
                }
            }

            // log.debug('MDIMKOV', 'value to be returned: ' + returnValue);
            // log.debug('MDIMKOV', '');
            return returnValue;
        }


        /* =============== Create a new class =============== */

        /*
        * MDIMKOV 15.05.2022: this function creates a new class (if it doesn't exist)
        *  - if the [parent] parameter is integer, it takes the parent class id, otherwise, the parent class name (full hierarchy), e.g. 'Class1 : Class2'
        *  - if the [subsidiary] parameter is integer, it takes the subsidiary id, otherwise, the subsidiary name (full hierarchy), e.g. 'Parent Org : Next Org1 : Next Org2'
        *
        * RETURNS: integer -- the id of the newly-created class
        *
        * INPUT:        - name - the name of the new class
        *               - parent - the parent class id or full hierarchy name (optional);
        *               - subsidiary - the subsidiary id or full hierarchy name (required for one-world implementations)
        *
        * USAGE: const newClassId = createClass('Test1', 'EAST : Test1', 'Parent Company', true); // -> 8755
        *
        * */

        function createClass(name, parent, subsidiary, includechildren) {
            try {
                // MDIMKOV 26.04.2022: if [parent] is an integer, this is the parent class id; if it is string, this is the parent class name and needs to be resolved:
                if (typeof parent === 'string') {
                    parent = getClassIdByName(parent);
                }

                // MDIMKOV 26.04.2022: if [subsidiary] is an integer, this is the subsidiary id; if it is string, this is the subsidiary name and needs to be resolved:
                if (typeof subsidiary === 'string') {
                    subsidiary = getSubsidiaryIdByName(subsidiary);
                }

                // MDIMKOV 26.04.2022: try to create the new record
                var rec = record.create({
                    type: record.Type.CLASSIFICATION,
                    isDynamic: false
                });

                rec.setValue('name', name);
                if (parent) {
                    rec.setValue('parent', parent);
                }
                if (subsidiary) {
                    rec.setValue('subsidiary', subsidiary);
                }
                rec.setValue('includechildren', includechildren);

                const newRecId = rec.save();

                return newRecId;
            } catch (e) {
                if (e.message !== 'This record already exists') {
                    log.error('ERROR', e.message + ' --- ' + e.stack);
                }
                return 0;
            }
        }


        /* =============== Get the item ID by passing the item code (name/number) =============== */

        /*
        * MDIMKOV 25.05.2022: this function returns the item ID for a given item code (called also NAME/NUMBER -- [itemid])
        *       NOTE! if the item has parent items, you can pass the name in any of the following way (both options are valid):
        *               > 'Item Name C'
        *               > 'Item Name A : Item Name B : Item Name C'
        *
        * RETURNS: integer
        *
        * INPUT: string
        *
        * USAGE: const itemId = getItemIdByCode('AMN7887'); // -> 17
        *
        * */

        function getItemIdByCode(code) {

            let internalId = 0;

            const recordSearchObj = search.create({
                type: 'item',
                filters:
                    [['itemid', 'is', code]],
                columns:
                    ['internalid']
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });
            return internalId;
        }


        /* =============== Get the location ID by passing the location name =============== */

        /*
        * MDIMKOV 25.05.2022: this function returns the location ID for a given location name;
        *                     Note: the name needs to follow the 'Parent Name : Child Name' structure
        *
        * RETURNS: integer
        *
        * INPUT: string
        *
        * USAGE: const locationId = getLocationIdByName('Parent Location : Sofia'); // -> 17
        *
        * */

        function getLocationIdByName(name) {

            let internalId = 0;

            const recordSearchObj = search.create({
                type: record.Type.LOCATION,
                filters:
                    [['name', 'is', name]],
                columns:
                    ['internalid']
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });
            return internalId;
        }


        /* =============== Add a number of days to a given date =============== */

        /*
        * MDIMKOV 01.06.2022: this function adds a number of days to a given date
        *
        * RETURNS: date
        *
        * INPUT: date, integer (number of days)
        *
        * USAGE: const dateTomorrow = addDaysToDate(new Date(), 1); // -> Wed Jun 08 2022 01:22:25 GMT-0700 (PDT)
        *
        * */

        function addDaysToDate(date, days) {

            Date.prototype.addDays = function (days) {
                let date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            }

            let dateToProcess = new Date(date); // avoid assignment of variable used

            return dateToProcess.addDays(days);
        }


        /* =============== Get a value from a body field =============== */

        /*
        * MDIMKOV 01.06.2022: this function gets a value from a body field; you can also define 'value' or 'text' for drop-down fields
        *       * returnType can be 'date', 'float', 'integer', 'datetime' or any other listed in the format.Type enumerator (string is default)
        *       * note that this function will return an empty string when the return value is null, undefined etc. - this is to be used with drop-downs
        *
        * RETURNS: any (important: see note above about returnType)
        *
        * INPUT: strings
        *
        * USAGE: const myMemo = getFieldValue('memo', 'transaction', 3543, ''); // -> 'my memo'
        *        const customerId = getFieldValue('entity', 'transaction', 764, 'integer', 'value'); // -> 123
        *        const customerName = getFieldValue('entity', 'transaction', 764, null, 'text'); // -> 'John Smith'
        *
        * */

        function getFieldValue(fieldName, recordType, internalId, returnType, valueOrText) {
            let returnValue = '';
            const fieldLookUp = search.lookupFields({
                type: recordType,
                id: internalId,
                columns: [fieldName]
            });

            if (valueOrText === 'value' && fieldLookUp[fieldName][0]) {
                returnValue = fieldLookUp[fieldName][0].value;
            } else if (valueOrText === 'text' && fieldLookUp[fieldName][0]) {
                returnValue = fieldLookUp[fieldName][0].text;
            } else {
                returnValue = fieldLookUp[fieldName];
            }

            if (returnType && returnValue) {
                returnValue = format.parse({
                    type: returnType,
                    value: returnValue
                });
            }

            // MDIMKOV 03.06.2022: don't ask me what this is. Just keep it or prepare for the worst
            if ('|' + returnValue + '|' === '||') {
                returnValue = '';
            }

            return returnValue;
        }


        /* =============== Set a value to a body field =============== */

        /*
        * MDIMKOV 01.06.2022: this function sets a value to a body or entity field
        *       * optionally, specify withLoad=true: set the value by loading the record; this is, for example for inoubnd shipments date fields (newer rec type with date)
        *       * optionally, use [disableTriggers] = true to disable triggers
        *
        * RETURNS: integer (the ID of the updated record)
        *
        * INPUT: strings
        *
        * USAGE: const updatedRecordId = setFieldValue('memo', 'customer', 5548, 'test memo'); // -> 4372
        *
        * */

        function setFieldValue(fieldName, recordType, internalId, value, withLoad, disableTriggers) {

            // MDIMKOV 03.06.2022: set the value using submit (in most cases)
            if (!withLoad) {
                return record.submitFields({
                    type: recordType,
                    id: internalId,
                    values: {
                        [fieldName]: value
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true,
                        disableTriggers: !!disableTriggers
                    }
                });
            } else {

                // MDIMKOV 03.06.2022: set the value by loading the record; this is, for example for inoubnd shipments date fields (newer rec type with date)
                const rec = record.load({
                    type: recordType,
                    id: internalId
                });
                rec.setValue(fieldName, value);
                rec.save({'disableTriggers': !!disableTriggers});
            }
        }


        /* =============== Count the transaction lines that meet certain criteria  =============== */

        /*
        * MDIMKOV 01.06.2022: this function will count the transaction lines that meet certain criteria
        *       * common requirement: if any of the SO lines has field [closed] set to TRUE, do ....
        *       * this function will return an integer value of the number of lines meeting the criteria
        *       * it can also be used to check if any line has a certain field value (e.g. returning either 0 or more than 0)
        *       * since newer record types, such as inbound shipments, cannot be called the general way, use the recordType parameter
        *          - recordType = 'transaction' -- in most cases
        *          - recordType = 'inboundshipment' -- an example for the exceptions
        *
        * RETURNS: integer
        *
        * INPUT: various
        *
        * USAGE: const doesItHave = countTransLines('transaction', 5584, ['myColumnDate', 'is', 'today']); // -> 0
        *        const doesItHave = countTransLines('inboundshipment', 5584, []); // -> 3
        *
        * */

        function countTransLines(recordType, transId, filterArray) {

            // MDIMKOV 04.06.2022: initialize variables;
            let returnVal = 0;
            let finalFilterArray = [];

            // MDIMKOV 05.06.2022: structure the filter by adding main criteria and optional [filterArray] criteria
            if ((Object.prototype.toString.call(filterArray) === '[object Array]') && filterArray.length > 0) {
                finalFilterArray.push('AND');
                finalFilterArray.push(filterArray);
            }

            // MDIMKOV 04.06.2022: this is the main case, when a transaction is being used (SO, PO, etc. in this case recordType is just 'transaction')
            if (recordType === 'transaction') {

                // MDIMKOV 05.06.2022: construct the main filter
                finalFilterArray = [
                    [
                        ['internalid', 'anyof', '110'], 'AND',
                        ['shipping', 'is', 'F'], 'AND',
                        ['taxline', 'is', 'F'], 'AND',
                        ['mainline', 'is', 'F']
                    ]
                ]

                // MDIMKOV 03.06.2022: create a saved search that will return the lines on the transaction to check
                const mySearch = search.create({
                    type: 'transaction',
                    filters: finalFilterArray,
                    columns: [
                        search.createColumn({
                            name: 'line',
                            summary: 'COUNT'
                        })
                    ]
                });
                mySearch.run().each(function (result) {
                    returnVal = result.getValue(result.columns[0]);
                    return false; // there would only be one summary record
                });
            } else if (recordType === 'inboundshipment') {

                // MDIMKOV 05.06.2022: this part will be for inbound shipments, as they follow a different way of extracting lines

                // MDIMKOV 05.06.2022: construct the main filter
                finalFilterArray = [
                    [
                        ['internalidnumber', 'equalto', transId]
                    ]
                ]

                // MDIMKOV 05.06.2022: structure the filter by adding main criteria and optional [filterArray] criteria
                if ((Object.prototype.toString.call(filterArray) === '[object Array]') && filterArray.length > 0) {
                    finalFilterArray.push('AND');
                    finalFilterArray.push(filterArray);
                }

                const inboundshipmentSearchObj = search.create({
                    type: 'inboundshipment',
                    filters: finalFilterArray,
                    columns:
                        [
                            search.createColumn({
                                name: 'inboundshipmentitemid',
                                summary: 'COUNT'
                            })
                        ]
                });
                inboundshipmentSearchObj.run().each(function (result) {
                    returnVal = result.getValue(result.columns[0]);
                    return false; // there would only be one summary record
                });
            }

            return returnVal;
        }


        /*
        * MDIMKOV 01.06.2022: this function will sum the values from a certain line field for a given transaction
        *       * common requirement: sum up the values in the CBM line field for a sales order
        *       * this function will return the summation of all values in the (e.g.) CBM field
        *       * optionally, add a filter parameter to narrow down the search results (e.g. only check lines where a=b)
        *       * since newer record types, such as inbound shipments, cannot be called the general way, use the recordType parameter
        *          - recordType = 'transaction' -- in most cases
        *          - recordType = 'inboundshipment' -- an example for the exceptions
        *
        * RETURNS: decimal
        *
        * INPUT: various
        *
        * USAGE: const a = transactionSumLines('transaction', 5584, ['myColumnDate', 'is', 'today'], 'custcol_cbm'); // -> 150
        *        const b = transactionSumLines('inboundshipment', 5584, [], 'quantity'); // -> 250
        *        const c = transactionSumLines('my_custom_record', null, ['myColumnDate', 'is', 'today'], 'quantity'); // -> 250
        *
        * */

        function transactionSumLines(recordType, transId, filterArray, fieldName) {

            // MDIMKOV 04.06.2022: initialize variables;
            let returnVal = 0;
            let finalFilterArray = [];

            // MDIMKOV 05.06.2022: structure the filter by adding main criteria and optional [filterArray] criteria
            if ((Object.prototype.toString.call(filterArray) === '[object Array]') && filterArray.length > 0) {
                finalFilterArray.push('AND');
                finalFilterArray.push(filterArray);
            }

            // MDIMKOV 04.06.2022: this is the main case, when a transaction is being used (SO, PO, etc. in this case recordType is just 'transaction')
            if (recordType === 'transaction') {

                // MDIMKOV 05.06.2022: construct the main filter
                if (transId) {
                    finalFilterArray = [
                        [
                            ['internalid', 'noneof', '@NONE@'], 'AND',
                            ['shipping', 'is', 'F'], 'AND',
                            ['taxline', 'is', 'F'], 'AND',
                            ['mainline', 'is', 'F']
                        ]
                    ]
                } else {
                    finalFilterArray = [
                        [
                            ['internalid', 'anyof', transId], 'AND',
                            ['shipping', 'is', 'F'], 'AND',
                            ['taxline', 'is', 'F'], 'AND',
                            ['mainline', 'is', 'F']
                        ]
                    ]
                }

                // MDIMKOV 03.06.2022: create a saved search that will return the lines on the transaction to check
                const mySearch = search.create({
                    type: 'transaction',
                    filters: finalFilterArray,
                    columns: [
                        search.createColumn({
                            name: fieldName,
                            summary: 'SUM'
                        })
                    ]
                });
                mySearch.run().each(function (result) {
                    returnVal = result.getValue(result.columns[0]);
                    return false; // there would only be one summary record
                });
            } else if (recordType === 'inboundshipment') {

                // MDIMKOV 05.06.2022: this part will be for inbound shipments, as they follow a different way of extracting lines

                // MDIMKOV 05.06.2022: construct the main filter
                finalFilterArray = [
                    [
                        ['internalidnumber', 'equalto', transId]
                    ]
                ]

                // MDIMKOV 05.06.2022: structure the filter by adding main criteria and optional [filterArray] criteria
                if ((Object.prototype.toString.call(filterArray) === '[object Array]') && filterArray.length > 0) {
                    finalFilterArray.push('AND');
                    finalFilterArray.push(filterArray);
                }

                // MDIMKOV 05.06.2022: custom line fields need a join, whereas standard fields don't; build this exception
                let columns = [];
                if (fieldName.startsWith('custrecord_')) {
                    columns = [
                        search.createColumn({
                            name: fieldName,
                            summary: 'SUM',
                            join: 'inboundShipmentItem',
                            sort: search.Sort.ASC,
                        })
                    ]
                } else {
                    columns = [
                        search.createColumn({
                            name: fieldName,
                            summary: 'SUM',
                            sort: search.Sort.ASC
                        })
                    ]
                }

                const inboundshipmentSearchObj = search.create({
                    type: 'inboundshipment',
                    filters: finalFilterArray,
                    columns: columns
                });
                inboundshipmentSearchObj.run().each(function (result) {
                    returnVal = result.getValue(result.columns[0]);
                    return false; // there would only be one summary record
                });
            }

            return returnVal;
        }


        /* =============== Retrieve one (the first) record from a saved search - field name and get its value on the resulting record =============== */

        /*
        * MDIMKOV 07.06.2022: this function will construct a saved search to retrieve the first (or single) record of it
        *                        - a field name will be passed and its value or text will be returned
        *                        - if [isGetText] is set to TRUE, the getText function will be called instead of getValue
        *                        - this can only be used for header values from transactions, custom record types etc.; no line values
        *                        - [orderByFieldName] optional parameter, so that the results can be sorted
        *                        - [isDescending] optional boolean parameter, to define results being ordered in descending order
        *
        * RETURNS: array
        *
        * INPUT: various
        *
        * USAGE: const getSomeValues = singleRecordSearch('transaction', ['myBodyDate', 'is', 'today'], 'entity', true); // -> ['John Smith']
        *
        * */

        function singleRecordSearch(recordType, filterArray, fieldName, isGetText, orderByFieldName, isDescending) {

            // MDIMKOV 07.06.2022: initialize the variables
            let returnValue = null;
            let columns = [];
            columns.push(fieldName);

            // MDIMKOV 07.06.2022: if the optional orderByFieldName is used, add it to the columns, so that the results can be ordered
            if (orderByFieldName) {
                columns.push(search.createColumn({
                    name: orderByFieldName,
                    sort: isDescending ? search.Sort.DESC : search.Sort.ASC
                }))
            }

            // MDIMKOV 07.06.2022: construct the search itself
            const mySearch = search.create({
                type: recordType,
                filters: filterArray,
                columns: columns
            });
            mySearch.run().each(function (result) {
                returnValue = isGetText ? result.getText(result.columns[0]) : result.getValue(result.columns[0]);
                return false; // only the single (or first) record needs to be returned
            });

            return returnValue;
        }


        /*
        * MDIMKOV 15.06.2022: this function logs the remaining governance usage points in a script
        *       - the optional logLevel parameter can be set to 'a' for audit; default is debug
        *       - the optional titleAddition parameter adds a string in parantheses for easier tracking
        *
        * RETURNS: log record
        *
        * INPUT: string
        *
        * USAGE: logGovernanceUsageRemaining('a', 'POINT10', 1); // -> log record created: '.... Remaining governance units (POINT10) --- 150'
        *
        * */

        function logGovernanceUsageRemaining(logLevel, titleAddition, indentLevel) {
            const scriptObj = runtime.getCurrentScript();
            const title = titleAddition ? 'remaining governance units (' + titleAddition + ') --- ' : 'remaining governance units --- ';

            if (logLevel && logLevel == 'a') {
                log.audit('MDIMKOV', addIndents(indentLevel) + title + scriptObj.getRemainingUsage());
            } else {
                log.debug('MDIMKOV', addIndents(indentLevel) + title + scriptObj.getRemainingUsage());
            }
        }


        /* =============== Group (reduce) a JSON (array of objects) --- VERSION 1, without children =============== */

        /*
        * MDIMKOV 20.06.2022: this function takes an array of objects (JSON) and returns a grouped (reduced) representation of it
        *       - parameter [data] has the respective data in it (see example below)
        *       - parameter [groupByObjectsArray] has an array of the elements to group by (e.g. ['sku', 'lot']
        *       - parameter [summarizeObjectsArray] has an array of the elements to summarize by (e.g. ['quantity', 'length']
        *
        * RETURNS: array of objects
        *
        * INPUT: various
        *
        * USAGE: let initialData = [
        *           {"sku" : "A01", "lot" : "LOT-01", "quantity" : 10, "length" : 13},
        *           {"sku" : "A01", "lot" : "LOT-02", "quantity" : 20, "length" : 14},
        *           {"sku" : "A02", "lot" : "LOT-03", "quantity" : 35, "length" : 12},
        *           {"sku" : "A02", "lot" : "LOT-03", "quantity" : 45, "length" : 11}
        *       ]
        *
        *       const reducedData = groupReduceJson(initialData, ['sku', 'lot'], ['quantity', 'length']);
        *
        * */

        function groupReduceJson(data, groupByObjectsArray, summarizeObjectsArray) {
            let helper = {};
            let result = data.reduce(function (r, o, a) {

                // MDIMKOV 20.06.2022: construct the key, based on the input array (e.g. group by sku and lot)
                let key = '';
                groupByObjectsArray.forEach(function (element) {
                    key += o[element];
                    key += '-';
                });
                key = key.slice(0, -1); // remove the last '-' from the key, which is not needed

                if (!helper[key]) {
                    helper[key] = Object.assign({}, o);
                    helper[key].key = key;
                    r.push(helper[key]);
                } else {

                    // MDIMKOV 20.06.2022: add as many lines as needed for the elements that will be summarized (e.g. summarize quantity and length)
                    summarizeObjectsArray.forEach(function (element) {
                        helper[key][element] += o[element];
                    });
                }
                return r;
            }, []);

            return result
        }


        /* =============== Group (reduce) a JSON (array of objects) --- VERSION 2, with children =============== */

        /*
        * MDIMKOV 20.06.2022: this function takes an array of objects (JSON) and returns a grouped (reduced) representation of it
        *       - parameter [data] has the respective data in it (see example below)
        *       - parameter [groupByObjectsArray] has an array of the elements to group by (e.g. ['sku', 'lot']
        *       - parameter [summarizeObjectsArray] has an array of the elements to summarize by (e.g. ['quantity', 'length']
        *
        * RETURNS: array of objects
        *
        * INPUT: various
        *
        * USAGE: let initialData = [
        *           {"sku" : "A01", "lot" : "LOT-01", "quantity" : 10, "length" : 13},
        *           {"sku" : "A01", "lot" : "LOT-02", "quantity" : 20, "length" : 14},
        *           {"sku" : "A02", "lot" : "LOT-03", "quantity" : 35, "length" : 12},
        *           {"sku" : "A02", "lot" : "LOT-03", "quantity" : 45, "length" : 11}
        *       ]
        *
        *
        *       let finalData = _lib.groupReduceJsonWithChildren(initialData, 'lot');
        *
        *
        *       finalData: [{
        *                    "name": "LOT-01",
        *                    "children": [{
        *                        "sku": "A01",
        *                        "quantity": 10,
        *                        "length": 13
        *                    }]
        *                }, {
        *                    "name": "LOT-02",
        *                    "children": [{
        *                        "sku": "A01",
        *                        "quantity": 20,
        *                        "length": 14
        *                    }]
        *                }, {
        *                    "name": "LOT-03",
        *                    "children": [{
        *                        "sku": "A02",
        *                        "quantity": 35,
        *                        "length": 12
        *                    }, {
        *                        "sku": "A02",
        *                        "quantity": 45,
        *                        "length": 11
        *                    }]
        *                }]
        *
        * */

        function groupReduceJsonWithChildren(data, groupByProperty) {

            const result = data.reduce((r, {[groupByProperty]: name, ...object}) => {
                var temp = r.find(o => o.name === name);
                if (!temp) r.push(temp = {name, children: []});
                temp.children.push(object);
                return r;
            }, []);

            return result
        }


        /* =============== Log the number of search results in a search object (mainly used for map reduce scripts) =============== */

        /*
        * MDIMKOV 01.06.2022: this function logs the number of search results in a search object
        *               the following parameters are being used:
        *                - [searchObj] - mandatory - the search object, for which the length will be logged
        *                - [logLevel] - optional - can be set to 'a' for audit; default is debug
        *                - [titleAddition] - optional - additional note that will be added
        *                - [indentLevel] - optional, integer - this one will add an indent such as [... ], [... ... ]
        *
        * RETURNS: integer
        *
        * INPUT: the search object, e.g. [searchObj], an optional title addition (string), an optional ident level (integer)
        *
        * USAGE: logSearchResultCount(searchObj, 'a', 'taskSearch', 2); // -> a log record, such as [... ... number of records to process (taskSearch) --- 15]
        *
        * */

        function logSearchResultCount(searchObj, logLevel, titleAddition, indentLevel) {

            const searchResults = searchObj.run().getRange({
                start: 0,
                end: 1000
            });

            const recNum = searchResults.length >= 1000 ? 'more than 1000' : searchResults.length;
            const title = titleAddition ? 'number of records to process (' + titleAddition + ') --- ' : 'number of records to process --- ';

            if (logLevel && logLevel == 'a') {
                log.audit('MDIMKOV', addIndents(indentLevel) + title + recNum);
            } else {
                log.debug('MDIMKOV', addIndents(indentLevel) + title + recNum);
            }
        }


        /*
        * MDIMKOV 08.07.2022: this function returns the transaction ID for a given [tranid], aka [Document Number] and the respective transaction type
        *
        * RETURNS: integer
        *
        * INPUT: string
        *
        * USAGE: const id = getTransactionIdByTranid('SO113', 'salesorder'); // -> 17
        *
        * */

        function getTransactionIdByTranid(tranid, type) {

            let internalId = 0;
            const shortType = translateTractionTypeName(type);
            log.audit('MDIMKOV', '>>> TYPE: ' + type);
            log.audit('MDIMKOV', '>>> SHORT TYPE: ' + shortType);

            const recordSearchObj = search.create({
                type: 'transaction',
                filters:
                    [
                        ['tranid', 'is', tranid],
                        'AND',
                        ['mainline', 'is', 'T'],
                        'AND',
                        ['type', 'anyof', shortType]
                    ],
                columns:
                    ['internalid']
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });
            return internalId;
        }


        /*
        * MDIMKOV 08.07.2022: this function returns the transaction ID for a given [shipmentnumber], aka [Document Number], aka [Shipment Number]
        *
        * RETURNS: integer
        *
        * INPUT: string
        *
        * USAGE: const id = getInboundShipmentIdByDocNum('INBSHIP1'); // -> 17
        *
        * */

        function getInboundShipmentIdByDocNum(docNum) {

            let internalId = 0;

            const recordSearchObj = search.create({
                type: 'inboundshipment',
                filters:
                    [['shipmentnumber', 'anyof', docNum]],
                columns:
                    ['internalid']
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    internalId = result.id;
                }
                return false; // ideally it's just one record;
            });
            return internalId;
        }


        /*
        * MDIMKOV 08.07.2022: this function returns the net amount without tax from a sales order (as field is not available on record)
        *
        * RETURNS: float
        *
        * INPUT: integer - sales order ID
        *
        * USAGE: const netAmountNoTax = getNetAmountNoTax(4434); // -> 3,4456.12
        *
        * */

        function getNetAmountNoTax(id) {

            let amount = 0;

            const recordSearchObj = search.create({
                type: 'transaction',
                filters: [
                    ['type', 'anyof', 'SalesOrd'],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['internalid', 'anyof', id]
                ],
                columns:
                    ['netamountnotax']
            });
            recordSearchObj.run().each(function (result) {
                if (result.id) {
                    amount = result.getValue(result.columns[0]);
                }
                return false; // ideally it's just one record;
            });
            return amount;
        }


        /*
        * MDIMKOV 08.07.2022: this function returns the summation of all lines returned by a saved search for a given field
        *
        * RETURNS: float
        *
        * INPUT: various
        *
        * USAGE: const myTotal = getSumOfSavedSearch('customrecord_abc', ['custrecord_nbwbh_salesorder','anyof','39903'], 'custrecord_nbwbh_netdepositamount'); // -> 3,4456.12
        *
        * */

        function getSumOfSavedSearch(recordType, filterArray, fieldName) {
            let amount = 0;

            const recordSearchObj = search.create({
                type: recordType,
                filters: filterArray,
                columns:
                    [
                        search.createColumn({
                            name: fieldName,
                            summary: 'SUM'
                        })
                    ]
            });
            recordSearchObj.run().each(function (result) {
                amount = result.getValue(result.columns[0]);
                return false; // ideally it's just one record;
            });

            return amount;
        }


        /*
        * MDIMKOV 22.07.2022: this function translates transaction type name, e.g. 'returnauthorization' into the short version, e.g. 'RtnAuth'
        *
        * RETURNS: string
        *
        * INPUT: string
        *
        * USAGE: const shortTransName = translateTractionTypeName('returnauthorization'); // -> 'RtnAuth'
        *
        * */

        function translateTractionTypeName(type) {
            let newTransName = '';

            const transTypeDict = {
                'cashsale': 'CashSale',
                'check': 'Check',
                'commission': 'Commissn',
                'statementcharge': 'CustChrg',
                'creditmemo': 'CustCred',
                'customerdeposit': 'CustDep',
                'invoice': 'CustInvc',
                'payment': 'CustPymt',
                'customerrefund': 'CustRfnd',
                'quote': 'Estimate',
                'expensereport': 'ExpRept',
                'fulfillmentrequest': 'FftReq',
                'inventorycount': 'InvCount',
                'itemfulfillment': 'ItemShip',
                'journal': 'Journal',
                'payrollliabilitycheck': 'LiabPymt',
                'opportunity': 'Opprtnty',
                'paycheck': 'Paycheck',
                'purchaseorder': 'PurchOrd',
                'returnauthorization': 'RtnAuth',
                'salesorder': 'SalesOrd',
                'taxliabilitycheque': 'TaxLiab',
                'salestaxpayment': 'TaxPymt',
                'tegatapayable': 'TegPybl',
                'tegatareceivables': 'TegRcvbl',
                'transferorder': 'TrnfrOrd',
                'vendorreturnauthorization': 'VendAuth',
                'bill': 'VendBill',
                'cashpayment': 'VendPymt',
                'workorder': 'WorkOrd'
            };

            newTransName = transTypeDict[type];

            return newTransName;
        }


        /* =============== Create and save a CSV file generated from a saved search and return the file ID =============== */

        /*
        * MDIMKOV 29.07.2022: this function creates and saves a CSV file generated from a saved search and returns the file ID
        *
        * RETURNS: integer (the saved file ID)
        *
        * INPUT: saved search id, file name (including file extension), folder id
        *
        * USAGE: savedFileId = createCsvFileFromSavedSearch('customsearch_my_ss', 'my_report.csv', 113); // -> 55849
        *
        * */


        function createCsvFileFromSavedSearch(ssId, fileName, folderId) {

            // MDIMKOV 29.07.2022: run the search and prepare the file contents
            let fileContets = '';

            const savedSearchObj = search.load({
                id: ssId
            });

            // MDIMKOV 29.07.2022: get the column names to be used as column headings
            savedSearchObj.columns.forEach(function (col) {
                fileContets += col.label.replace(',', '-') + ',';
            });
            fileContets += '\n';


            // MDIMKOV 29.07.2022: iterate through results and write them to the file contents
            savedSearchObj.run().each(function (result) {

                for (let i = 0; i < savedSearchObj.columns.length; i++) {

                    let valueToAppend = result.getText(result.columns[i]) ? result.getText(result.columns[i]) : result.getValue(result.columns[i]);
                    valueToAppend = valueToAppend.toString().replace(',', '-');

                    fileContets += valueToAppend;
                    fileContets += ',';
                }

                fileContets += '\n'; // add a new line

                return true;
            });
            log.debug('fileContets', fileContets);


            // MDIMKOV 29.07.2022: create the file object and save it
            const fileObj = file.create({
                name: fileName,
                fileType: file.Type.CSV,
                contents: fileContets,
                encoding: file.Encoding.UTF8,
                folder: folderId,
            });

            const fileId = fileObj.save();
            log.debug('fileId', fileId);

            return fileId;
        }


        /* =============== Gets a script parameter value for the deployment, which is currently running =============== */

        /*
        * MDIMKOV 26.07.2022: this function gets a script parameter for the deployment, which is currently running
        *
        * RETURNS: any (the script parameter value)
        *
        * INPUT: parameter name (string)
        *
        * USAGE: getScriptParameter('custscript_minamountowed'); // -> 123
        *
        * */

        function getScriptParameter(param) {
            const scriptObj = runtime.getCurrentScript();
            return scriptObj.getParameter(param);
        }


        /* =============== Sets a script parameter for the deployment, which is currently running =============== */

        /*
        * MDIMKOV 26.07.2022: this function sets a script parameter for the deployment, which is currently running
        *
        * RETURNS: void
        *
        * INPUT: parameter name (string), value (any)
        *
        * USAGE: setScriptParameter('custscript_minamountowed', 123);
        *
        * */

        function setScriptParameter(param, value) {
            let me = runtime.getCurrentScript();
            const mySearch = search.create({
                type: search.Type.SCRIPT_DEPLOYMENT,
                filters: [
                    search.createFilter({
                        name: 'scriptid',
                        operator: search.Operator.IS,
                        values: me.deploymentId
                    })
                ]
            });

            const searchResults = mySearch.run().getRange({
                start: 0,
                end: 1
            });

            for (var i = 0; i < searchResults.length; i++) {
                const recDeployment = record.load({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    id: searchResults[i].id
                });
                recDeployment.setValue(param, value);
                recDeployment.save();
            }
        }


        /* =============== Generate a new unique id / number / code by using a record type that generates such =============== */

        /*
        * MDIMKOV 26.07.2022: this function generates a new unique id / number / code by using a record type that generates suc
        *               for this to work, you need a new custom record type, for which SHOW ID is ticked and numbering is enabled
        *               the field that will generate the new id / number / code is called 'name'
        *               no fields need to be added to the custom record type, although it's optionally possible
        *
        * RETURNS: any (the new id / number / code)
        *
        * INPUT: string (the custom record type id)
        *
        * USAGE: const newNum = generateUniqueNumber('customrecord_bb1_production_batch'); // -> 123
        *
        * */

        function generateUniqueNumber(recordType) {

            let newNumber = 0;

            const rec = record.create({
                type: recordType,
                isDynamic: false
            });

            const recId = rec.save();

            if (recId) {
                newNumber = getFieldValue('name', recordType, recId);
            }

            return newNumber;
        }


        /* =============== Set the value for a deployment parameter (mainly for M/R scripts)  =============== */

        /*
        * MDIMKOV 01.08.2022: this function sets a deployment variable, using the following logic:
        *                       - a custom record type (see below) will be used where each parameter will have its own field; these fields will be set/get based on deployment id
        *                       - make sure the respective deployment cannot be simultaneously called by different instances (e.g. for M/R scripts)
        *                       - expects a custom record type 'customrecord_deployment_variables', which has a field called 'custrecord_deployment_id', and NO 'name' field
        *                       - for each other parameter you want to store, create a new field (this will be the parameter / variable name itself)
        *                       - set the parameter / variable anywhere in the M/R script and later read it with [getDeploymentVariable]
        *
        * RETURNS: boolean (true / false for success or failure)
        *
        * INPUT: various
        *
        * USAGE: setDeploymentVariable('custrecord_bb1_priorityid', 3); // -> true; variable has been set in the respective field
        *
        * */

        function setDeploymentVariable(fieldId, value) {

            // MDIMKOV 01.08.2022: initiate a return variable - false if nothing done, otherwise return true
            let returnVar = false;


            // MDIMKOV 01.08.2022: find current deployment and check if it has a record in the record type; if not, create it
            const deploymentId = runtime.getCurrentScript().deploymentId
            const recId = singleRecordSearch('customrecord_deployment_variables', ['custrecord_deployment_id', 'is', deploymentId], 'internalid');


            // MDIMKOV 01.08.2022: record for this deployment doesn't exist, create it and update value
            if (!recId) {
                const recDeploymentVars = record.create({
                    type: 'customrecord_deployment_variables'
                });
                recDeploymentVars.setValue('custrecord_deployment_id', deploymentId);
                recDeploymentVars.setValue(fieldId, value)
                recDeploymentVars.save();
                return returnVar;
            } else {

                // MDIMKOV 01.08.2022: record exists, update value only
                setFieldValue(fieldId, 'customrecord_deployment_variables', recId, value);
                returnVar = true;
            }

            return returnVar;
        }


        /* =============== Get the value for a deployment parameter (mainly for M/R scripts)  =============== */

        /*
        * MDIMKOV 01.08.2022: this function gets a deployment variable that was previously set with [setDeploymentVariable]
        *                       - check the notes under [setDeploymentVariable] to see details
        *
        * RETURNS: the respective variable (field) value
        *
        * INPUT: string (the respective parameter, i.e. field id)
        *
        * USAGE: getDeploymentVariable('custrecord_bb1_priorityid'); // -> 3
        *
        * */

        function getDeploymentVariable(fieldId) {

            // MDIMKOV 01.08.2022: initiate a return variable
            let returnVar = null;


            // MDIMKOV 01.08.2022: find current deployment and check if it has a record in the record type
            const deploymentId = runtime.getCurrentScript().deploymentId;
            const recId = singleRecordSearch('customrecord_deployment_variables', ['custrecord_deployment_id', 'is', deploymentId], 'internalid');

            if (recId) {
                returnVar = getFieldValue(fieldId, 'customrecord_deployment_variables', recId);
            }

            return returnVar;
        }


        /* =============== Round a number up to 2 digits after the decimal point  =============== */

        /*
        * MDIMKOV 01.08.2022: this function rounds a number up to 2 digits after the decimal point
        *
        * RETURNS: decimal, rounded
        *
        * INPUT: decimal
        *
        * USAGE: const roundedNumber = roundAmount(1.2334); // -> 1.23
        *
        * */

        function roundAmount(amt) {
            amt = Number(amt);
            amt = Math.round((amt + 0.00001) * 100) / 100;
            return amt;
        }


        /* =============== Retrieve the inventory number id(s) (serial number(s), lot number id(s)), so they can be used while assigning inventory details =============== */

        /*
        * // MDIMKOV 11.10.2022: this function gets the inventory number id(s) (serial number(s), lot number id(s)), so it can be used while assigning inventory details
        *               - using the location id is optional
        *
        *        - if the input is a simple string, this is one lot/serial number and the output is its ID
        *        - if the input is an array of strings, these are several lot/serial numbers and the output is an array of their IDs
        *
        * RETURNS: integer (or an array of integers)
        *
        * INPUT: - string / array - the serial/lot number string or an array of serial/lot number strings
        *        - integer -- optional warehouse (location) id
        *
        * USAGE: const serialNumId = getLotSerialNumId('abc110013', 15); // -> 228
        *        const serialNumIds = getLotSerialNumId(['abc110013', 'xyz110999'], 15); // -> [228, 615]
        *
        * */

        function getLotSerialNumIDs(serialNumbers, locationId) {

            let returnValue = null; // used when working with one serial number
            let returnValues = []; // used when working with several serial numbers

            let filters = []


            // MDIMKOV 19.03.2023: define if the input is a string (one serial number) or an array (several serial numbers)
            if (typeof serialNumbers === 'string') { // only one serial number was passed
                filters = [
                    ['inventorynumber', 'is', serialNumbers]
                ]
            } else if (typeof serialNumbers === 'object') { // several serial numbers were passed (variable serialNumbers is actually an array)
                filters = [
                    [
                        ['inventorynumber', 'is', 'xxxxxx'] // dummy serial/lot number to begin with, as next one is prefixed with 'OR'
                    ]
                ];
                serialNumbers.forEach(function (element) {
                    filters[0].push('OR');
                    filters[0].push(['inventorynumber', 'is', element]);
                });
            }


            // MDIMKOV 19.03.2023: if a location has been given, it's being added next to the outside filters (not within the serial numbers, as they are joined with 'OR')
            if (locationId) {
                filters.push('AND');
                filters.push(['location', 'anyof', locationId]);
            }


            // MDIMKOV 19.03.2023: construct the search itself
            const mySearch = search.create({
                type: 'inventorynumber',
                filters: filters,
                columns: ['internalid']
            });


            // MDIMKOV 19.03.2023: define if the input is a string (one serial number) or an array (several serial numbers)
            if (typeof serialNumbers === 'string') { // only one serial number was passed
                mySearch.run().each(function (result) {
                    returnValue = result.getValue(result.columns[0]);
                    return false; // only the single (or first) record needs to be returned
                });
                return returnValue;

            } else if (typeof serialNumbers === 'object') { // several serial numbers were passed (variable serialNumbers is actually an array)
                mySearch.run().each(function (result) {
                    returnValue = result.getValue(result.columns[0]);
                    returnValues.push(returnValue);
                    return true; // several results returned
                });

                return returnValues;

            }
        }


        /* =============== Execute JSON.parse by first cleaning the string from unwanted characters =============== */

        /*
        * MDIMKOV 19.10.2022: this function will perform JSON.parse on a given string by first cleaning the string as follows:
        *       - remove leading and trailing double quotes -- mainly when using Celigo and other platforms that supply the string with quotes
        *       - remove the occurrence of &quot; -- also in Celigo and other platforms that encode the double quotes, invisible for the NetSuite logging
        *
        * RETURNS: object (JSON object)
        *
        * INPUT: string
        *
        * USAGE: const parsedContent = jsonparse('Hello World'); // -> [object]
        *
        * */

        function jsonparse(str) {
            let returnVar = null;
            let newStr = str;

            // MDIMKOV 18.10.2022: remove potential double quotes ["] from the beginning and the end of the string
            if (str.startsWith("\"") && str.endsWith("\"")) {
                newStr = str.substring(1, str.length - 1);
            }

            // MDIMKOV 18.10.2022: replace any potential occurrences of [&quot;] and replace them with double quotes ["]
            let finalStr = newStr.replace(/&quot;/g, '\"');

            // MDIMKOV 18.10.2022: execute JSON parse
            returnVar = JSON.parse(finalStr);

            return returnVar;
        }


        /* =============== Test a JSON string, print each character between '~' characters, to see real contents =============== */

        /*
        * MDIMKOV 21.11.2022: this function will take a string as an input and will then print it out following the example:
        *        - input: MILCHO
        *        - output: M~I~L~C~H~O
        *       then, the output can be pasted into Notepad and all '~' characters replaced by empty string to see the REAL content
        *       this works around a problem that a string containing '&quot;' among other letters will be displayed as '"' if logging is presented via HTML (e.g. NetSuite logging)
        *
        * RETURNS: string
        *
        * INPUT: string
        *
        * USAGE: testJsonString('MILCHO', 'log results...') // -> the system will log M~I~L~C~H~O (with the respective log title); use this to find/replace later
        *
        * */

        function testJsonString(str, logTitle) {
            let fullString = '';
            for (let i = 0; i < str.length; i++) {
                fullString += str[i] + '~';
            }
            log.debug(logTitle, fullString);
        }


        // MDIMKOV 06.07.2023: this local function returns the bank info (IBAN etc.) based on the setup screen
        function locGetBankInfo(formId, subsidiaryId, currencyId, countryId) {

            // MDIMKOV 06.07.2023: initialize variables with default values
            let returnObj = {
                "iban": "CH820029029013042360G",
                "bic": "UBSWCHZH80A",
                "vat": "CHE-149.232.500",
                "bankname": "UBS Switzerland AG"
            };
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
                        ['custrecord_akt_aeis_currency', currencyId ? 'anyof' : 'noneof', currencyId ? currencyId : '@none@']
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
            logSearchResultCount(setupScreenSearchObj, null, 'number of setup records found ')
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


        // MDIMKOV 06.07.2023: this local function returns the country ID based
        function locGetCountryIdByCode(countryCode) {

            // initialize & pre-fill
            const countryDict = {
                'AT': 6,
                'CA': 12,
                'FR': 4,
                'DE': 8,
                'IE': 7,
                'IT': 5,
                'LU': 10,
                'OTHER': 9,
                'ES': 11,
                'CH': 3,
                'GB': 2,
                'US': 1
            };


            // call a value
            return countryDict[countryCode];
        }


        /* =============== Find the transaction NetSuite ID based on a given document number =============== */

        /*
     * MDIMKOV 18.09.2023: this function returns the internal id on a transaction by passing the document number (tranid)
     *
     * RETURNS: integer (the NetSuite internal ID)
     *
     * INPUT: string (the transaction tranid)
     *
     * USAGE: docNumToTransIntId(SO843292); //=> 23564
     *
     * */

        function docNumToTransIntId(docNumber) {

            return singleRecordSearch('transaction', [['numbertext', 'is', docNumber], 'AND', ['mainline', 'is', 'T']], 'internalid');

        }


        /* =============== Prevent entering a record that has a value in a certain field that is already used on another record =============== */

        /*
        * MDIMKOV 25.09.2023: this function would raise an error in a client script (mainly on [save]) if in a given field the user enters a value,
        *       which is already used in the same field in another record (e.g., suitable for transaction ID etc.)
        *
        * RETURNS:      boolean        if [true] is returned, use it to raise message, as shown in the USAGE below
        *
        * INPUT:        recordType     the record type, such as 'salesorder' or 'employee'
        *               currentValue   the value that is currently being added into the field (could be any type)
        *               fieldId        the fieldId for which this is checked, e.g., custbody_my_field
        *               internalId     the internal id of the current record (if existing)
        *
        * NOTE:         The internalId parameter is supplied, so that it is being excluded from the saved search, to avoid counting the current record
        *                       if this is a new record, the internal id doesn't exist anyways
        *                       if the user is editing and existing record, supplying the internal id guarantees that the current record is excluded from the saved search
        *
        * USAGE:        1. Import the ['N/ui/dialog'] module
        *
        *               2. Potentially, script the [saveRecord] entry point on a client script
        *
        *               3. Use the following:
        *
        *               if (preventDuplicateValue('salesorder', 43425, 'memo')) {
        * 	                    dialog.alert({
        *                         title: 'Duplicate Detected',
        *                         message: 'This store front number was already used, please use a different one.'
        *                       });
        *
        *    		            return false;
        *               }
        *
        * */

        function preventDuplicateValue(recordType, currentValue, fieldId, internalId) {

            let returnValue = false;

            foundRecId = singleRecordSearch(recordType, [
                [fieldId, 'is', currentValue],
                'AND',
                ['internalid', 'noneof', internalId ? internalId : 0]
            ], 'internalid');

            if (foundRecId) {
                returnValue = true;
            }

            return returnValue;
        }


        return {
            loadItemRec: loadItemRec,
            getPostingPeriod: getPostingPeriod,
            arrayContains: arrayContains,
            longLog: longLog,
            countryByText: countryByText,
            countryById: countryById,
            countryByCode: countryByCode,
            findAccountByNumber: findAccountByNumber,
            findListValue: findListValue,
            findListValueCached: findListValueCached,
            getRecIdbyExtId: getRecIdbyExtId,
            currencyISOtoID: currencyISOtoID,
            csvFileToJSON: csvFileToJSON,
            transIntIdToDocNum: transIntIdToDocNum,
            getUnitIdByItemIdAndCode: getUnitIdByItemIdAndCode,
            dateTimeStampForFileName: dateTimeStampForFileName,
            findShippingMethodId: findShippingMethodId,
            getCurrentUserNames: getCurrentUserNames,
            getCurrentUserId: getCurrentUserId,
            getCurrentUserRole: getCurrentUserRole,
            getCurrentUserRoleId: getCurrentUserRoleId,
            suiteTaxGrossToNetAmounts: suiteTaxGrossToNetAmounts,
            replaceUrlParam: replaceUrlParam,
            convertDateToFormat: convertDateToFormat,
            arrayRemoveDuplicateMembers: arrayRemoveDuplicateMembers,
            md5hash: md5hash,
            addThousandsSeparator: addThousandsSeparator,
            replaceUmlaute: replaceUmlaute,
            createDateObjectFromString: createDateObjectFromString,
            getRevRecEndDate: getRevRecEndDate,
            constructURL: constructURL,
            getCurrencyExchangeRate: getCurrencyExchangeRate,
            getSubsidiaryIdByName: getSubsidiaryIdByName,
            getClassIdByName: getClassIdByName,
            getDepartmentIdByName: getDepartmentIdByName,
            getAccountByName: getAccountByName,
            convertTransHeaderOptionsToArray: convertTransHeaderOptionsToArray,
            findTopParentTransaction: findTopParentTransaction,
            createClass: createClass,
            getItemIdByCode: getItemIdByCode,
            getLocationIdByName: getLocationIdByName,
            addDaysToDate: addDaysToDate,
            getFieldValue: getFieldValue,
            setFieldValue: setFieldValue,
            countTransLines: countTransLines,
            transactionSumLines: transactionSumLines,
            singleRecordSearch: singleRecordSearch,
            logGovernanceUsageRemaining: logGovernanceUsageRemaining,
            groupReduceJson: groupReduceJson,
            groupReduceJsonWithChildren: groupReduceJsonWithChildren,
            logSearchResultCount: logSearchResultCount,
            getTransactionIdByTranid: getTransactionIdByTranid,
            getInboundShipmentIdByDocNum: getInboundShipmentIdByDocNum,
            getNetAmountNoTax: getNetAmountNoTax,
            getSumOfSavedSearch: getSumOfSavedSearch,
            translateTractionTypeName: translateTractionTypeName,
            createCsvFileFromSavedSearch: createCsvFileFromSavedSearch,
            getScriptParameter: getScriptParameter,
            setScriptParameter: setScriptParameter,
            generateUniqueNumber: generateUniqueNumber,
            setDeploymentVariable: setDeploymentVariable,
            getDeploymentVariable: getDeploymentVariable,
            roundAmount: roundAmount,
            getLotSerialNumIDs: getLotSerialNumIDs,
            jsonparse: jsonparse,
            testJsonString: testJsonString,
            locGetBankInfo: locGetBankInfo,
            locGetCountryIdByCode: locGetCountryIdByCode,
            docNumToTransIntId: docNumToTransIntId,
            preventDuplicateValue: preventDuplicateValue
        }
    });
