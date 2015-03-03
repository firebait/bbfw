'use strict';

/**
  * Helper functions for general use.
  */

Suit.Helpers = {
    /** Revert the camelcasing to underscored in order to fullfil api conventions
    @params {Object} attributes
    */
    toUnderscoredObject: function (attributes) {
        var self = this;
        if (_.isArray(attributes) && _.isObject(attributes) && attributes.length > 0 && _.isObject(attributes[0])) {
            _.each(attributes, function (object, index) {
                attributes[index] = self.toJSON.apply(self, [object]);
            });
        } else if (_.isObject(attributes) && !_.isArray(attributes)) {
            _.each(_.keys(attributes), function (key) {
                var value = attributes[key];
                var newKey = _.str.underscored(key);
                if (attributes[key]) {
                    delete attributes[key];
                }
                // We need to parse all objects recursive.
                if (_.isObject(value)) {
                    attributes[newKey] = self.toJSON.apply(self, [value]);
                } else {
                    attributes[newKey] = value;
                }
            });
        }
        return attributes;
    },
    /** Alias for toUnderscoredObject
    @params {Object} attributes
    */
    toJSON: function (attributes) {
        return this.toUnderscoredObject(attributes);
    },
    /** Parse server attributes to camelcase in order to fullfil conventions
    @params {object} response - server response
     */
    toCamelCaseObject: function (attributes) {
        var self = this;
        if (_.isArray(attributes) && _.isObject(attributes) && attributes.length > 0 && _.isObject(attributes[0])) {
            _.each(attributes, function (object, index) {
                attributes[index] = self.toCamelCaseObject.apply(self, [object]);
            });
        } else if (_.isObject(attributes) && !_.isArray(attributes)) {
            _.each(_.keys(attributes), function (key) {
                var value = attributes[key];
                var newKey = _.str.camelize(key);
                delete attributes[key];
                // We need to parse all objects recursive.
                if (_.isObject(value)) {
                    attributes[newKey] = self.toCamelCaseObject.apply(self, [value]);
                } else {
                    attributes[newKey] = value;
                }
            });
        }
        return attributes;
    },
    /** Replaces commonly-used Windows 1252 encoded chars that do not exist in ASCII or ISO-8859-1 with ISO-8859-1 cognates.*/
    convertToUtf8: function (text) {
        var s = text;
        if (!_.isString(s)) {
            return s;
        }
        // smart single quotes and apostrophe
        s = s.replace(/[\u2018]/g, '\'');
        s = s.replace(/[\u2019]/g, '\'');
        s = s.replace(/[\u201A]/g, '\'');
        // smart double quotes
        s = s.replace(/[\u201C]/g, '\"');
        s = s.replace(/[\u201D]/g, '\"');
        s = s.replace(/[\u201E]/g, '\"');
        // ellipsis
        s = s.replace(/\u2026/g, '...');
        // dashes
        s = s.replace(/[\u2013]/g, '-');
        s = s.replace(/[\u2014]/g, '-');
        // circumflex
        s = s.replace(/\u02C6/g, '^');
        // open angle bracket
        s = s.replace(/\u2039/g, '<');
        // close angle bracket
        s = s.replace(/\u203A/g, '>');
        // spaces
        s = s.replace(/[\u02DC]/g, ' ');
        s = s.replace(/[\u00A0]/g, ' ');

        return s;
    }
};

/** Formatting helpers for the Suit Framework. This includes the _.str elements */
Suit.Helpers.Formatters = _.extend(_.str, {
    /** Formats a date on MM/DD/YYYY way */
    formatDate: function (date) {
        if (_.isUndefined(date) || date === '') {
            return '';
        } else {
            return moment(date).format('MM/DD/YYYY');
        }
    },
    /** Formats a number to be separated by commas. */
    formatNumber: function (num) {
        if (!_.isUndefined(num) && num !== null && !_.isNaN(num)) {
            if (num % 1 !== 0) {
                num = (parseFloat(num)).toPrecision(3);

                if (String(num).indexOf('0.') === 0) {
                    num = (parseFloat(num)).toFixed(2);
                }
            }
            return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
            return String(0);
        }
    },
    /** Formats a number and add % symbol at the end */
    formatNumberPercentage: function (num) {
        num = num > 100 ? 100 : num;
        return Suit.Helpers.Formatters.formatNumber(num) + '%';
    },
    /** Formats a number into one decimal place */
    formatNumberOneDecimal: function (num) {
        if (!_.isUndefined(num) && num !== null) {
            if (num % 1 !== 0) {
                num = (parseFloat(num)).toPrecision(3);
                num = (parseFloat(num)).toFixed(1);
            }
            return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        } else {
            return String(0);
        }
    },
    /** Abbreviates a number using K, MM, and B depending on the quantity,
      * without decimal places */
    abbreviateNumberNoDecimal: function (num) {
        if (_.isNull(num) || isNaN(num)) {
            return '0';
        } else {
            var notNegative = true;
            if (num < 0) {
                num = num * -1;
                notNegative = false;
            }
            if (num >= 1000000000) {
                num = num / 1000000000;
                return notNegative ? Math.round(num) + 'B' : Math.round(num) * -1 + 'B';
            } else if (num >= 1000000) {
                num = num / 1000000;
                return notNegative ? Math.round(num) + 'MM' : Math.round(num) * -1 +  'MM';
            } else if (num >= 1000) {
                num = num / 1000;
                return notNegative ? Math.round(num) + 'K' : Math.round(num) * -1 + 'K';
            } else {
                return notNegative ? String(Math.round(num)) : String(Math.round(num) * -1);
            }
        }
    },

    //* Abbreviates a number using K, MM, and B depending on the quantity
    abbreviateNumber: function (num) {
        if (_.isNull(num) || isNaN(num)) {
            return '0';
        } else {
            if (num >= 1000000000) {
                num = num / 1000000000;
                return Suit.Helpers.Formatters.formatNumber(num) + 'B';
            } else if (num >= 1000000) {
                num = num / 1000000;
                return Suit.Helpers.Formatters.formatNumber(num) + 'MM';
            } else if (num >= 1000) {
                num = num / 1000;
                return Suit.Helpers.Formatters.formatNumber(num) + 'K';
            } else {
                return Suit.Helpers.Formatters.formatNumber(num);
            }
        }
    },
    /*
    Extract all symbols and characters from a string and only leave numbers.
    @param{String} str - example: $1000 -> 1000
    */
    extractNumbersFromString: function (str) {
        if (str && str.match(/\d+\.?\d*/g)) {
            return str.match(/\d+\.?\d*/g).join('');
        }
        return NaN;
    },
    /**Capitalize first letter of a string
    @params {String} str
    */
    capitalize: function (str) {
        return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    },
    secondsToString: function (secs) {
        var d = moment.duration(secs, 'seconds');
        var formattedString = '';
        var hours = d.hours();
        var minutes = ('0' + d.minutes()).slice(-2);
        var seconds = ('0' + d.seconds()).slice(-2);
        if (hours > 0) {
            hours = ('0' + hours).slice(-2);
            formattedString += hours + ':';
        }
        formattedString += minutes + ':';
        formattedString += seconds;
        return formattedString;
    },

    /** Prepends a string to a sentence (good for prepending a class) */
    prepend: function () {
        var args = Array.prototype.slice.call(arguments);
        var value = args.shift();
        return value + ' ' + args.join(' ');
    },

    /** Append a string to a sentence (good for apending a class) */
    append: function () {
        var args = Array.prototype.slice.call(arguments);
        var value = args.shift();
        return args.join(' ') + ' ' + value;
    },

    replace: function (value, search, replace) {
        return String(value).replace(search, replace);
    },

    remove: function (value, search) {
        return String(value).replace(search, '');
    },

    convertApiURL: function (value) {
        value = String(value).split('/api/');
        value = value.length > 1 ? value[value.length - 1] : false;
        if (value === false) {
            throw ('Not a valid API url');
        }
        return '#' + value.replace('_advertiser', 'advertiser');
    },

    lowercase: function (value) {
        return String(value).toLowerCase();
    },

    uppercase: function (value) {
        return String(value).toUpperCase();
    },

    pluralize: function () {
        return _.pluralize.apply(_, arguments);
    },

    singularize: function () {
        return _.singularize.apply(_, arguments);
    },

    gsub: function () {
        return _.gsub.apply(_, arguments);
    },

    ordinalize: function () {
        return _.ordinalize.apply(_, arguments);
    },

    absolute: function (value) {
        value = Math.abs(value);
        if (_.isNaN(value)) { return 0; }
        return value;
    }

});
