/**
 * _lib.js
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define(['N/record', 'N/search', 'N/runtime', 'N/url', 'N/currency'],

    function (record, search, runtime, url, currency) {
        /**
         * @param {record} record
         * @param {search} search
         * @param {runtime} runtime
         * @param {url} url
         * @param {currency} currency
         */


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
     * USAGE: recCustomer.setValue('custentity_oro_21_book_brand', tvz.findListValue('IN PROGRESS', 'customlist_oro_21_saletype'));
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
     * USAGE: var jsonCsv = _lib.csvFileToJSON(downloadedFile.getContents());
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
     * USAGE: getCurrentUserRole();
     *
     * */

        function getCurrentUserRole() {
            var userObj = runtime.getCurrentUser();
            return userObj.roleId;
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
     *   - =4= the cart discount on the transaction (the main discount) is being adjusted proportionally using the same logic when [adjustCartDiscount] is set to true
     *   - =5= for line discounts: just make sure the [CALCULATE TAX BEFORE DISCOUNT IS APPLIED] is ticked in NetSuite; the line discount itself is always gross amount
     *   - =6= since sometimes the resulting gross amount has 0.01 cent difference, compare it to either the original gross amount or to the additional gross amount (custom columns) and fix rounding through tax details override
     *   - =7- since sometimes despite line roundings the total transaction gross amount has a rounding difference, compare the transaction gross total to a given (from outside) total and fix overall rounding by adjusting the tax base for the first tax detail line
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
            adjustCartDiscount,                 // true / false -- defining if cart discount will be subject to GTNA
            processedCartDiscFieldId,           // body checkbox field id, marking the cart discount as processed, so it doesn't reiterate (normally 'custbody_st_processeddisc')
            adjustLineDiscounts,                // true / false -- defining if line discounts will be subject to GTNA
            applyRoundingWithTaxDetailOverride, // true / false -- defining if roundings will be adjusted; in this case, the [Tax Details Override] will be auto-enabled, if needed; this also works in conjunction with the next 2 fields
            originalAmountFieldId,              // line field id -- used mainly for rounding; this field will hold the initial amount entered (the initial gross amount that the whole calculation is based to), so that the resulting gross amount can be compared with this one, normally 'custcol_st_originalamount'
            additionalAmountFieldId,            // line field id -- used mainly for rounding, to works around issues with line discounts; if the third-party system can provide the gross amount after discount, make it enter it in this column; this way a comparison for line-discounted items can be achieved, which is impossible with the previous field, normally 'custcol_st_additionalamount'
            applyGlobalRounding,                // true / false -- for final, global transaction rounding, defines if the transaction total should be checked agaist the amount in the [globalAmountFieldId] and, if any slight difference exists, it will be applied to the first line of the tax details, to offset the final full amount, so everything matches perfectly
            globalAmountFieldId                 // body field id -- used to stamp the final gross total from the third-party system; if the [applyGlobalRounding] is set to true, the amount stamped here is being compared to the final gross transaction total and, if any slight difference exists, it will be applied to the first line of the tax details, to offset the final full amount; normally 'custbody_st_totalgrossamt'
        ) {

            // MDIMKOV 26.11.2021: this function returns the net cart discount amount by iterating through tax details and calculating a weighted average tax amount
            function calcNetCartDiscount(cartDiscountAmount, rec) {

                // THIS PART NEEDS FULL REVISION AND TAX DETAIL LINES MERGING (FOR CASES LIKE QUEBEC WHERE THEY HAVE MORE THAN ONE TAX LINE PER ITEM LINE)

                // log.debug('cartDiscountAmount', cartDiscountAmount);
                // var netAmountTotal = 0;
                // var runningTotal = 0;
                //
                // // MDIMKOV 19.12.2021: iterate through tax details subtab and get amounts and tax rates to calculate the weigted average
                // var tdLineCount = rec.getLineCount({sublistId: 'taxdetails'});
                // for (var k = 0; k < tdLineCount; k++) {
                //     var netAmount = rec.getSublistValue({
                //         sublistId: 'taxdetails',
                //         fieldId: 'netamount',
                //         line: k
                //     });
                //     var taxRate = rec.getSublistValue({
                //         sublistId: 'taxdetails',
                //         fieldId: 'taxrate',
                //         line: k
                //     });
                //     var lineType = rec.getSublistValue({
                //         sublistId: 'taxdetails',
                //         fieldId: 'linetype',
                //         line: k
                //     });
                //     log.debug('MDIMKOV', 'for line ' + k + ' -- netAmount=' + netAmount + '; tax rate=' + taxRate + '; lineType=' + lineType);
                //     if (lineType === 'Item') { // avoid special tax details such as for shipping etc.
                //         netAmountTotal += netAmount;
                //         runningTotal += netAmount * (1 + taxRate / 100);
                //     }
                // }
                // log.debug('netAmountTotal', netAmountTotal);
                // log.debug('runningTotal', runningTotal);
                // return netAmountTotal ? cartDiscountAmount / (runningTotal / netAmountTotal) : 0;
            }

            // MDIMKOV 19.12.2021: this is executed afterSubmit => do not execute if the user event type is DELETE
            if (context.type === context.UserEventType.DELETE) {
                return;
            }

            var newRec = context.newRecord;
            var transId = newRec.id;

            log.debug('transId', transId);

            if (transId && sublistId && processedLineFieldId) {

                // MDIMKOV 22.10.2021: go through the transaction lines and set the net amounts based on the amount already there and the tax code
                var recTrans = record.load({
                    type: newRec.type,
                    id: transId,
                    isDynamic: false
                });
                var tranNum = recTrans.getValue('otherrefnum') ? recTrans.getValue('otherrefnum') : recTrans.getValue('tranid');
                var sumGrossAmount = recTrans.getValue('subtotal');
                log.audit('MDIMKOV', '');
                log.audit('MDIMKOV', '=1= Proceed with script (transaction ' + tranNum + ')');

                // MDIMKOV 31.12.2021: iterate through lines, check if the record was already processed or not and find the tax details reference
                var iLineCount = recTrans.getLineCount({sublistId: sublistId});
                var previousTdRef = ''; // used later for discount lines
                for (var i = 0; i < iLineCount; i++) {
                    var isProcessed = recTrans.getSublistValue({
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
                        var initialNetAmount = recTrans.getSublistValue({ // get the tax details reference from the line
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
                            var targetTdRef = recTrans.getSublistValue({
                                sublistId: 'taxdetails',
                                fieldId: 'taxdetailsreference',
                                line: j
                            });
                            // MDIMKOV 01.04.2022: iterate through tax details and find all references, keeping in mind more than one tax detail line may exist for each item line => tax rate will have to be accumulated
                            if (targetTdRef === tdRef) {
                                log.debug('targetTdRef', 'targetTdRef found (line #' + i + ')');
                                var taxPartialRate = recTrans.getSublistValue({
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
                            var grossAmount = initialNetAmount;
                            log.debug('grossAmount', grossAmount);

                            var netAmount = 100 * grossAmount / (100 + taxRate);
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
                                var quantity = recTrans.getSublistValue({
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
                    var isShippingProcessed = recTrans.getValue(processedShippingFieldId);
                    if (!isShippingProcessed) {
                        log.audit('MDIMKOV', '');
                        log.audit('MDIMKOV', '=3= Proceed with shipping value adjustment...');

                        // MDIMKOV 22.10.2021: get the shipping tax rate from the tax details subtabng rate, which will be used in subsequent cases (not directly here)
                        var shippingTaxRate = '';
                        var taxLineCount = recTrans.getLineCount({sublistId: 'taxdetails'});
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
                        var shippingGrossRate = recTrans.getValue('shippingcost');
                        var shippingNetRate = 0;
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

            // MDIMKOV 25.11.2021: =4= if the [adjustCartDiscount] is set to true, proceed with discount adjustment (cart discount net will be calculated and set)
            if (adjustCartDiscount && processedCartDiscFieldId && recTrans) {

                // MDIMKOV 19.12.2021: check if the cart discount was not already processed
                var cartDiscountProcessed = recTrans.getValue(processedCartDiscFieldId);
                if (!cartDiscountProcessed) {

                    // MDIMKOV 25.11.2021: get the cart discount amount (to validate it was not zero)
                    var cartDiscountAmount = recTrans.getValue('discountrate');
                    if (cartDiscountAmount) {
                        log.audit('MDIMKOV', '');
                        log.audit('MDIMKOV', '=4= Proceed with calculating and applying cart discount on the header');

                        // MDIMKOV 26.11.2021: execute the main cart discount function
                        netCartDiscountAmount = calcNetCartDiscount(cartDiscountAmount, recTrans);
                        log.audit('netCartDiscountAmount', netCartDiscountAmount);
                        if (netCartDiscountAmount) {
                            recTrans.setValue('discountrate', netCartDiscountAmount);
                            recTrans.setValue(processedCartDiscFieldId, true);
                        }
                    }
                }
            }

            // MDIMKOV 19.12.2021: finally, save the transaction
            recTrans.save();


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
        *
        * RETURNS: string
        *
        * INPUT: strings (for the optional parameters that will be appended
        *
        * USAGE: const url = _lib.constructURL('common/custom/custrecord.nl?id=', objectInternalId, '&e=T')  // => https://5115672-sb1.app.netsuite.com/app/common/custom/custrecord.nl?id=574&whence=
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
        * USAGE: const newAmount = _lib.getCurrencyExchangeRate('EUR', 'BGN', new Date()); => 1.95583
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


        /* =============== Create a new class, based on name, parent class (id or name), subsidiary (id or name) =============== */

        /*
        * MDIMKOV 25.04.2022: this function creates a new class if it doesn't exist
        *                     the function accepts the parent class (either class ID or class name)
        *                     it also accepts the parent subsidiary (either subsidiary ID or subsidiary name)
        *                     if parent class or parent subsidiary are passed by name, the name needs to follow the 'Parent Name : Name' structure
        *
        * RETURNS: integer (the ID of the newly-created class, or 0 of class already existed)
        *
        * INPUT: string
        *
        * USAGE: newClassId = createClass('New Class', 'EAST : Test1', 'Parent Company', true);
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
     *
     * RETURNS: array
     *
     * USAGE: const headerOptionsArray = convertTransHeaderOptionsToArray(headerOptions); // -> [{field: "xxx", value: "yyy"}, {...}]
     *
     * */

        function convertTransHeaderOptionsToArray(headerOptions) {

            let newOptionsArray = [];

            const headerOptionsArray = headerOptions.split('');
            log.audit('headerOptionsArray', headerOptionsArray);

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

            // MDIMKOV 15.05.2022: loop up to the parent records; if the top one is found ([createdfrom] empty), then exit the loop
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
                    parentId = createdFrom.createdfrom[0].value;
                    oldCreatedFrom = createdFrom;
                }
            }
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
                    log.audit('MDIMKOV', '^^^^ parent id: ' + parent);
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


        return {
            loadItemRec: loadItemRec,
            getPostingPeriod: getPostingPeriod,
            longLog: longLog,
            countryByText: countryByText,
            countryById: countryById,
            countryByCode: countryByCode,
            findAccountByNumber: findAccountByNumber,
            findListValue: findListValue,
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
            createClass: createClass
        }
    });
