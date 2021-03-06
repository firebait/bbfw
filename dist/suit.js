/** @namespace */
Suit = {
    /** @namespace */
    Components: {}
};
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
                if (_.has(attributes, key)) {
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
    /** Formats a datetime on MM/DD/YYYY hh:mm A way
        @params {string}-datetime-string containing a string with datatime on iso-8601
    */
    formatDateTime: function (datetime) {
        if (_.isUndefined(datetime) || _.isNull(datetime) || _.str.isBlank(datetime)) {
            return '';
        } else {
            return moment(datetime).parseZone().format('MM/DD/YYYY hh:mm A');
        }
    },
    /** Formats a date on MM/DD/YYYY way */
    formatDate: function (date) {
        if (_.isUndefined(date) || _.isNull(date) || date === '') {
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

'use strict';

/**
  * Helper function that generates restful urls for views to use in anchors
  */

Suit.RestfulUrls = {
    /** Url used to generate links for this resource.
        You can override this methods to generate custom functionality.
    **/
    _restfulBase: function () {
        // We need to find a way to extract this into a configuration, so we can pass a regex that will format the url with the proper format per application.
        var url = _.result(this, 'urlRoot');
        if (_.isUndefined(url)) {
            url = _.result(this, 'url');
            url = url.substr(0, url.lastIndexOf('/'));
        }
        return '#' + url.replace('/api/', '').replace('_advertiser', 'advertiser');
    },
    /** Show link url helper method. **/
    showUrl: function () {
        return this._restfulBase.apply(this) + '/' + this.id;
    },
    /** New link url helper method. **/
    newUrl: function () {
        return this._restfulBase.apply(this) + '/new';
    },
    /** Edit link url helper method. **/
    editUrl: function () {
        return this._restfulBase.apply(this) + '/' + this.id + '/edit';
    },
    /** Delete link url helper method. **/
    deleteUrl: function () {
        return this._restfulBase.apply(this) + '/' + this.id;
    }
};

'use strict';

/**
  * Overwrite to default Backbone.sync function. Our implementation executes
  * some custom events based on Backbone.sync.methodMap (created, update, delete,
  * patch).
  */
var backBoneSync = Backbone.sync;
Backbone.sync = function (method, model, options) {
    options = options || {};
    var success = options.success;

    // Check if the event is coming from Rivets
    var evt = options.originalEvent;
    if (evt && evt.type === 'submit') {
        var el = $(evt.srcElement);
        if (el && el.is('form')) {
            options.type = evt.type = el.attr('method') ? el.attr('method') : 'GET';
        }
    }

    var eventName = method;
    switch (method) {
        case 'read':
            eventName = method;
            break;
        case 'patch':
            eventName = 'patched';
            break;
        default:
            eventName = method + 'd';
    }
    options.success = function (resp, status, xhr) {

        if (success) {
            success(resp, status, xhr);
            model.trigger(eventName, model, resp, options);
        }
    };

    if (_.contains(_.functions(model), 'saveToLocalStorage')) {
        model.saveToLocalStorage(eventName);
    }

    if (_.isUndefined(model.remoteStorage) || model.remoteStorage === true) {
        return backBoneSync(method, model, options);
    }

};

'use strict';
/**
  * @class Suit.LocalStorage:
  *
  * Its a extention to save suit model information on localStorage.
  *
  * Usage:
  * Initialize a parameter in the model with the name localStorage: true.
  * If you want the model to save on local cache and the model has no url to save
  * then pass in the parameter remoteStorage: false.
  */
Suit.LocalStorage = {
    saveToLocalStorage: function (eventName) {
        if (!this._getStore() || _.isUndefined(this.className)) {
            return;
        }
        var key = this.className + this.id;
        if (eventName !== 'deleted') {
            var currentAttr = JSON.parse(this._getStore().getItem(key));
            if (!_.isObject(currentAttr)) {
                currentAttr = {};
            }
            var attributes = this.attributes;
            _.each(attributes, function (value, k) {
                currentAttr[k] = value;
            });
            this._getStore().setItem(key, JSON.stringify(currentAttr));
        } else {
            this._getStore().removeItem(key);
        }
    },
    loadFromLocalStorage: function (force) {
        if (!this._getStore() || _.isUndefined(this.className)) {
            return;
        }
        var key = this.className + this.id;
        var allAttrs = this._getStore().getItem(key);

        // Load if you are forcing it or if it has only the id attribute.
        if (this._getStore() && (force || ((this.id && _.size(this.attributes) === 1) && !_.isNull(allAttrs)))) {
            var self = this;
            this.attributes = JSON.parse(allAttrs);
            // We need to trigger the change events on the model for each attribute that was set.
            this.trigger('change');
            _.each(allAttrs, function (attr) {
                self.trigger('change:' + attr);
            });
        }
    },
    _getStore: function () {
        try {
            window.localStorage.getItem('test');
            return window.localStorage;
        } catch (e) {
            return window.sessionStorage;
        }
    },
    setItem: function (key, value) {
        if (!key || !value) {
            return null;
        }
        this._getStore().setItem(key, value);
    },
    getItem: function (key) {
        var value = this._getStore().getItem(key);
        if (!value) {
            return null;
        }
        return value;
    },
    removeItem: function (key) {
        if (!this._getStore().getItem(key)) {
            return null;
        }
        this._getStore().removeItem(key);
    },
    clearStorage: function () {
        this._getStore().clear();
    }
};

'use strict';
/**
  * @class Suit.Validation:
  *
  * This is a helper class that is meant to be used for handling the Model validation
  * directly on our models. This will allow us to execute validations easily and mantain
  * all validation logic in one single place.
  *
  * @author SET Media, Inc.
  */
Suit.Validation = {
    /** Default patterns */
    patterns: {
        // Valid E-mail Address
        email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i
    },
    /** Default Message Errors */
    validatorMessages: {
        required: '{attr} is required.',
        email: '{attr} is not an e-mail address.',
        minLengthPass: '{attr} needs to be at least 6 characters long.',
        min: '{attr} needs to be at least {min} characters long.',
        max: '{attr} needs to be less than {max} characters long.',
        range: '{attr} needs to be between {min} and {max}.',
        dateTime: 'The date and time you introduced was not valid. We like format YYYY/MM/DD HH:MM.',
        inclusion: '{attr} value in not included in the list of values.',
        confirmation: '{attr} and it\'s confirmation field do not match.',
        numeric: '{attr} value must be numeric.'
    },
    /** Validator functions */
    validators: {
        // Required validation
        required: function (attr, val) {
            if (_.isNull(val) ||
                _.isUndefined(val) ||
                (_.isString(val) && val.trim() === '') ||
                (_.isArray(val) && _.isEmpty(val))) {
                return this.validatorMessages.required.replace('{attr}', _.str.capitalize(attr));
            }
        },
        // E-mail pattern validation
        email: function (attr, val) {
            if (!_.str.isBlank(val) && (!_.isString(val) || !val.match(this.patterns.email))) {
                return this.validatorMessages.email.replace('{attr}', _.str.capitalize(attr));
            }
        },
        // Min length validation
        min: function (attr, val, min) {
            if (!_.isString(val) || val.length < min) {
                return this.validatorMessages.min.replace('{attr}', _.str.capitalize(attr))
                    .replace('{min}', min.toString());
            }
        },
        // Max length validation.
        max: function (attr, val, max) {
            if (!_.isString(val) || val.length > max) {
                return this.validatorMessages.max.replace('{attr}', _.str.capitalize(attr))
                    .replace('{max}', max.toString());
            }
        },
        // Range length validation. Range is an array that describes the min and the
        // max range values.
        range: function (attr, val, range) {
            if (!_.isString(val) || val.length < range[0] || val.length > range[1]) {
                return this.validatorMessages.range.replace('{attr}', _.str.capitalize(attr))
                    .replace('{min}', range[0].toString())
                    .replace('{max}', range[1].toString());
            }
        },
        // Password length checker atleast 6 characters long
        minLengthPass: function (attr, val) {
            if (!_.isUndefined(val) && val.length < 6) {
                return this.validatorMessages.minLengthPass.replace('{attr}', _.str.capitalize(attr));
            }
        },
        // Verfies the value in contained in a list.
        inclusion: function (attr, val, values) {
            if (!_.isUndefined(val) && !_.contains(values, val)) {
                return this.validatorMessages.inclusion
                    .replace('{attr}', _.str.capitalize(attr));
            }
        },
        // Verifies if the field has a confirmation attribute.
        // Ex. password == passwordConfirmation
        confirmation: function (attr, val) {
            var confirmationAttr = this.get(attr + 'Confirmation');
            if (val && (confirmationAttr !== val)) {
                return this.validatorMessages.confirmation
                    .replace('{attr}', _.str.capitalize(attr));
            }
        },
        /** Validates if the value introduced is actually a numeric value
        @param {Model.attr} attr - model attribute to validate
        @param {Numeric} val - numeric number to validate against.
        @param {Object} options. The following options are valid
                        options.range[] - array with min and max value for the range.
                        options.rangeInclusive - boolean indicating if range should be inclusive or not.
                        options.gt - numeric for greater than comparison.
                        options.gte - numeric for greater than or equal comparison.
                        options.lt - numeric for less than comparison.
                        options.lte - numeric for less than or equal comparison.

        */
        numeric: function (attr, val, options) {
            // Only validates if value is present
            if (val || val === 0) {
                if (_.isNaN(+val)) {
                    return this.validatorMessages.numeric
                        .replace('{attr}', _.str.capitalize(attr));
                } else if (!_.isUndefined(options)) {
                    val = parseFloat(val);
                    if (!_.isUndefined(options.range)) {
                        if (options.rangeInclusive && (val < options.range[0] || val > options.range[1])) {
                            return 'The ' + attr + ' is not in the range of ' + options.range[0] + ' and ' + options.range[1] + ' inclusive.';
                        } else if (options.rangeInclusive === false && (val <= options.range[0] || val >= options.range[1])) {
                            return 'The ' + attr + ' is not in the range of ' + options.range[0] + ' and ' + options.range[1] + ' not inclusive.';
                        }
                    }
                    if (!_.isUndefined(options.gt)) {
                        if (val <= options.gt) {
                            return 'The ' + attr + ' has to be greater than ' + options.gt;
                        }
                    }
                    if (!_.isUndefined(options.gte)) {
                        if (val < options.gte) {
                            return 'The ' + attr + ' has to be greater than or equal to ' + options.gte;
                        }
                    }
                    if (!_.isUndefined(options.lt)) {
                        if (val >= options.lt) {
                            return 'The ' + attr + ' has to be less than ' + options.lt;
                        }
                    }
                    if (!_.isUndefined(options.lte)) {
                        if (val > options.lte) {
                            return 'The ' + attr + ' has to be less than or equal to ' + options.lte;
                        }
                    }
                }
            }
        },
    },
    /** Bootstrap for the validation method, used by the .validate() and .isValid()
      * methods. This will return an object if the validation didn't pass, or will
      * not return any value if it passed (according to the Backbone docs) */
    validate: function (attrs) {
        var model = this,
            allAttrs = _.extend({}, model.attributes, attrs),
            result = this.validateModel(allAttrs);

        // When a validation is executed, we should fire a `validated` event, that
        // would be handy on the view for showing the errors (if any).
        _.defer(function () {
            model.trigger('validated', result.isValid, model, result.invalidAttrs);
        });

        // We only need to return a value once the validation fails
        if (!result.isValid) {
            return result.invalidAttrs;
        }
    },
    /** Validates the entire model, after provided with a list of attributes.
      * If the validation does not pass, a model containing the `invalidAttrs` will
      * be provided with a list of attributes that didn't pass the validation.
      * The object will contain a `isValid` attribute, that describes if the validation
      * passed or not. */
    validateModel: function (attrs) {
        var model = this,
            invalidAttrs = {},
            isValid = true;

        // Iterate over each rule and validate every attribute individually
        _.each(model.validates, function (value, key) {
            var result = model.validateAttr(key, attrs[key]);
            if (result && !_.isEmpty(result)) {
                isValid = false;
                invalidAttrs[key] = result;
            }
        });

        return {
            invalidAttrs: invalidAttrs,
            isValid: isValid
        };
    },
    /** Validates a single attribute against a provided value. If the validation
      * does not pass, then the error message will be returned */
    validateAttr: function (attr, val) {
        var model = this,
            rules = this.validates[attr].rules,
            error = [];

        // Iterate every rule and validate every rule individually. If more than
        // one fails, only the last error message will be returned.
        _.each(rules, function (rule) {
            var result = false;
            var args = [attr, val];

            // If our validation needs any extra parameter, then we pass it to
            // the validator message
            if (model.validates[attr][rule]) {
                args.push(model.validates[attr][rule]);
            }

            // We need to check if this is a default validation or a custom validation
            // function. Custom validation functions are specified at Model level.
            if (model.validators[rule]) {
                result = model.validators[rule].apply(model, args);
            } else if (_.isFunction(model[rule])) {
                result = model[rule].apply(model, args);
            }

            if (result && result.trim() !== '') {
                error.push(result);
            }
        });

        return error;
    }
};

'use strict';

Suit.Model = Backbone.RelationalModel.extend(/** @lends Suit.Model.prototype */{
    /**
    * @class Suit.Model
    * @classdesc Suit framework model class, it's use to map a row in the remote database or to represent an object that stores properties in the front end.
    *
    * <h4>Extending</h4>
    *
    * <p><b>var MyModel = Suit.Model.extend({});</b></p>
    *
    * <p>This will create a model object with all of the features that Suit.Model has to offer.</p>
    *
    * <h4>Usage:</h4>
    *
    * <p>When you decide to create a Model you should create it with the command line using the following command:<br />
    * <br />
    * <b>yo suit:model [name] [attributeName]:[attributeType] [attributeName]:[attributeType]  ...</b></p>
    *
    * <p>This will create two files:<br />
    * <br />
    * <b>app/models/[name].js</b><br />
    * <b>spec/model/[name]_spec.js</b><br />
    * <br />
    * These will be a template for testing and basic model defaults.<br />
    * <br />
    * Instantiation:<br />
    * <br />
    * <b>var model = new Suit.Model()</b></p>
    *
    * @augments Backbone.Model
    * @constructs Suit.Model
    */
    initialize: function () {
        this._clonedModelAttributes();
        this._addSyncListener();
        this._addChangeListener();
    },
    /** Checks and triggers the dirtyModel event */
    _checkAndTriggerDirtyModel: function () {
        var isDirty = this._dirtyCheck();
        this._setAndTriggerDirtyModel(isDirty);
    },
    /** Sets and triggers the dirtyModel event */
    _setAndTriggerDirtyModel: function (isDirty) {
        this.isDirty = isDirty;
        this.trigger('dirtyModel', this, this.isDirty);
    },
    /** Add sync listener so that the _clonedModelAttributes gets called */
    _addSyncListener: function () {
        this.listenTo(this, 'sync', this._clonedModelAttributes);
    },
    /** Add a change listener so that the _checkAndTriggerDirtyModel gets called */
    _addChangeListener: function () {
        this.listenTo(this, 'change', this._checkAndTriggerDirtyModel);
    },
    /** Clones the model attributes */
    _clonedModelAttributes: function (model) {
        this.clonedModel = this._getFilteredAttributes(model);
        this._setAndTriggerDirtyModel(false);
    },
    /** Gets the attributes except the ones inherited through a relation */
    _getFilteredAttributes: function (model) {
        model = model || this;
        var filteredAttributes = { cid: model.cid, attributes: {}},
        modelRelations = model.getRelations();
        _.each(model.attributes, function (attributeValue, attributeName) {
            var attributeDoesNotBelongToARelation = _.isUndefined(_.findWhere(modelRelations, {key: attributeName}));
            if (attributeDoesNotBelongToARelation) {
                filteredAttributes.attributes[attributeName] = attributeValue;
            }
        });
        return filteredAttributes;
    },
    /** Performs dirty checking of the model */
    _dirtyCheck: function () {
        var isDirty = !this._isMatchingModel(this.clonedModel.attributes, this);
        return isDirty;
    },
    /** Determines if the candidate model matches the known model */
    _isMatchingModel: function (knownModel, candidateModelIns) {
        var isMatchingModel = false,
            candidateModel,
            candidateModelInheritedAttributes;

        if (!_.isUndefined(knownModel) && !_.isUndefined(candidateModelIns)) {
            candidateModel = candidateModelIns.attributes;
            candidateModelInheritedAttributes = _.pluck(candidateModelIns.getRelations(), 'key');

            //Compare the attributes from the known model with the candidate model
            for (var attributeName in knownModel) {
                if (_.isUndefined(candidateModel[attributeName])) {
                    isMatchingModel = false;
                } else if (_.isNull(knownModel[attributeName]) || _.isNull(candidateModel[attributeName])) {
                    isMatchingModel = knownModel[attributeName] === candidateModel[attributeName];
                } else {
                    isMatchingModel = knownModel[attributeName].toString() === candidateModel[attributeName].toString();
                }

                if (!isMatchingModel) {
                    break;
                }
            }
            //Compare the attributes, except the inherited ones, from the candidate model with the known model, if necessary
            if (isMatchingModel) {
                var candidateModelPlainAttributes = _.difference(_.keys(candidateModel), candidateModelInheritedAttributes);
                isMatchingModel = _.every(candidateModelPlainAttributes, function (attributeName) {
                    return !_.isUndefined(knownModel[attributeName]);
                });
            }
        }
        return isMatchingModel;
    },
    /** Revert the model to its original attributes and values */
    revert: function () {
        var originalModel = this.clonedModel.attributes,
            currentModel = this,
            inheritedAttributes = {},
            modelRelations = this.getRelations(),
            changedAttributes = [],
            isDirty;

        //Copy inherited attributes
        _.each(modelRelations, function (modelRelation) {
            inheritedAttributes[modelRelation.key] = currentModel.attributes[modelRelation.key];
        });

        //Get a list of the names of the changed attributes
        _.each(currentModel.attributes, function (attributeValue, attributeName) {
            if (_.has(originalModel, attributeName)) {
                if (attributeValue !== originalModel[attributeName]) {
                    changedAttributes.push(attributeName);
                }
            }
        });

        //Set the original attributes and add the original inherited attributes
        this.attributes = _.clone(originalModel);
        _.extend(this.attributes, inheritedAttributes);

        //Trigger specific changed attribute event and the general change event
        _.each(changedAttributes, function (changedAttribute) {
            currentModel.trigger('change:' + changedAttribute, currentModel);
        });
        if (!_.isEmpty(changedAttributes)) {
            this.trigger('change', this);
        }

        //Set isDirty to false and call the trigger dirty model event
        isDirty = false;
        this._setAndTriggerDirtyModel(isDirty);

    },
    /** Add attribute to initial state and set it to the current model
    */
    addAttrToInitialState: function (key, val, options) {
        if (_.isNull(key) || _.isUndefined(key) || _.isEmpty(_.str.trim(key))) {
            return;
        }
        this.clonedModel.attributes[key] = val;
        this.set(key, val, options);
    },
    /** Values to override with date/time values */
    dateAttrs: [],
    /** Moment formatting for out date/time values during a get */
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    /** Parse server attributes to camelcase in order to fullfil conventions */
    parse: function (response) {
        response = Suit.Helpers.toCamelCaseObject.apply(Suit.Helpers, [response]);
        return response;
    },
    /** Revert the camelcasing to underscored in order to fullfil api conventions */
    toJSON: function () {
        var attributes = Backbone.RelationalModel.prototype.toJSON.call(this);
        attributes = Suit.Helpers.toJSON.apply(Suit.Helpers, [attributes]);
        return attributes;
    },
    get: function (attr) {
        this.loadFromLocalStorage();
        var value = Backbone.RelationalModel.prototype.get.call(this, attr);
        if (_.contains(this.dateAttrs, attr) && !_.isUndefined(value) && !_.isEmpty(value)) {
            return moment(value);
        } else {
            return value;
        }
    },
    convertToMoment: function (value, attributeName) {
        if (!_.isEmpty(this.dateAttrs) && _.contains(this.dateAttrs, attributeName)) {
            if (_.isUndefined(value) || _.isNull(value) || value === '') {
                value = '';
            } else {
                if (_.isString(value)) {
                    value = new Date(value);
                }
                value = moment(value).format(this.dateFormat);
            }
        }
        return value;
    },
    set: function () {
        var self = this;
        var attributes = arguments[0],
        value, options;

        if (_.isObject(attributes)) {
            options = arguments[1];
            _.each(attributes, function (value, key) {
                value = Suit.Helpers.convertToUtf8(value);
                value = self.convertToMoment(value, key);
                attributes[key] = value;
            });
            return Backbone.RelationalModel.prototype.set.call(this, attributes, options);
        } else {
            value = arguments[1];
            options = arguments[2];
            value = Suit.Helpers.convertToUtf8(value);
            value = this.convertToMoment(value, attributes);
            return Backbone.RelationalModel.prototype.set.call(this, attributes, value, options);
        }
    }
});

// Extend the Backbone Moment Library.
_.extend(Suit.Model.prototype, Suit.LocalStorage, Suit.Validation, Suit.RestfulUrls);

'use strict';

Suit.Collection = Backbone.Collection.extend(/** @lends Suit.Collection.prototype */{
    /**
    * @class Suit.Collection
    * @classdesc Suit framework collection class, it is used for storing multiple models.
    *
    * <h4>Extending</h4>
    *
    * <p><b>var MyCollection = Suit.Collection.extend({});</b></p>
    *
    * <p>This will create a collection object with all of the features that Suit.Collection has to offer.</p>
    *
    * <h4>Usage:</h4>
    *
    * <p>When you decide to create a Collection you should create it with the command line using the following command:<br />
    * <br />
    * <b>yo suit:collection [name] [modelName] ...</b></p>
    *
    * <p>This will create two files:<br />
    * <br />
    * <b>app/collectionss/[name].js</b><br />
    * <b>spec/collections/[name]_spec.js</b><br />
    * <br />
    * These will be a template for testing and basic collection defaults.<br />
    * <br />
    * Instantiation:<br />
    * <br />
    * <b>var collection = new Suit.Collection()</b></p>
    *
    * @augments Backbone.Collection
    * @constructs Suit.Collection
    */
    initialize: function () {
        this._dirtyModels = [];
        this._isFetching = false;
        this._addModificationListeners();
    },
    /** Adds the add, remove and change event listener so that the _checkAndTriggerDirtyCollection gets called */
    _addModificationListeners: function () {
        this._modificationHandler('add');
        this._modificationHandler('remove');
        this._modificationHandler('change');
        this.listenTo(this, 'sync', this.resetDirtyStatus);
    },
    isFetching: function (fetchStatus) {
        if (_.isUndefined(fetchStatus)) {
            return this._isFetching;
        }
        this._isFetching = fetchStatus;
    },
    resetDirtyStatus: function () {
        if (!this.isFetching()) {
            this._dirtyModels = [];
            this._setAndTriggerDirtyCollection(false);
        }
    },
    _modificationHandler: function (action) {
        var self = this;
        this.listenTo(this, action, function (model) {
            self._checkAndTriggerDirtyCollection(model, action);
        });
    },
    /** Checks and triggers the dirtyCollection event */
    _checkAndTriggerDirtyCollection: function (model, action) {
        var isDirty = this._dirtyCheck(model, action);
        this._setAndTriggerDirtyCollection(isDirty);
    },
    /** Sets and triggers the dirtyCollection event */
    _setAndTriggerDirtyCollection: function (isDirty) {
        this.isDirty = isDirty;
        this.trigger('dirtyCollection', this.isDirty);
    },
    /** Performs dirty checking of the collection only if it contains models of type Suit.Model*/
    _dirtyCheck: function (model, action) {
        var isDirty = false;

        if (model instanceof Suit.Model) {
            if (model.isDirty && action === 'change') {
                this._handleAddChangeEvents(model, action);
            } else if (action === 'add' && !this.isFetching()) {
                this._handleAddChangeEvents(model, action);
            } else if (action === 'remove' && !this.isFetching()) {
                this._handleRemoveEvent(model, action);
            }
            isDirty = !_.isEmpty(this._dirtyModels);
        }
        return isDirty;
    },
    _handleAddChangeEvents: function (model, action) {
        var self = this,
            dirtyModelIndex = -1;


        _.find(this._dirtyModels, function (dirtyModelContainer, index) {
            var foundMatchingModel = !_.isUndefined(dirtyModelContainer) && !_.isUndefined(dirtyModelContainer.model);

            if (action === 'add') {
                foundMatchingModel = foundMatchingModel && self._isMatchingModel(model, dirtyModelContainer.model);

            } else {
                foundMatchingModel = foundMatchingModel && dirtyModelContainer.action === action &&
                                     (dirtyModelContainer.model.cid === model.clonedModel.cid ||
                                     self._isMatchingModel(model, dirtyModelContainer.model));

            }

            dirtyModelIndex = foundMatchingModel ? index : dirtyModelIndex;
            return foundMatchingModel;
        });

        if (dirtyModelIndex === -1) {
            this._dirtyModels.push({model: model.clonedModel, action: action});
        }
        else if (action !== 'change') {
            this._dirtyModels.splice(dirtyModelIndex, 1);
        }
    },
    _handleRemoveEvent: function (model, action) {

        var anyMatch = false,
            self = this,
            dirtyModelIndex = -1,
            previousAction = '';

        _.filter(this._dirtyModels, function (dirtyModelContainer, index) {
            var foundMatchingModel = !_.isUndefined(dirtyModelContainer.model) &&
                                     self._isMatchingModel(model, dirtyModelContainer.model);
            anyMatch = foundMatchingModel || anyMatch;
            dirtyModelIndex = foundMatchingModel ? index : dirtyModelIndex;
            previousAction = foundMatchingModel ? dirtyModelContainer.action : previousAction;
            return !foundMatchingModel;
        });

        if (!anyMatch) {
            this._dirtyModels.push({model: model.clonedModel, action: action});
        } else {
            if (previousAction === 'add') {
                this._dirtyModels.splice(dirtyModelIndex, 1);
            } else if (previousAction === 'change') {
                this._dirtyModels[dirtyModelIndex].action = 'remove';
            }

        }
    },
    _findModelIndex: function (knownModels, candidateModel) {
        var self = this,
            modelIndex = -1;
        _.find(knownModels, function (knownModelContainer, index) {
            var isMatchingModel = knownModelContainer.cid === candidateModel.cid ||
                                  self._isMatchingModel(knownModelContainer.attributes, candidateModel.attributes);
            modelIndex = isMatchingModel ? index : -1;
            return isMatchingModel;
        });

        return modelIndex;
    },
    _isMatchingModel: function (knownModel, candidateModel) {
        var isMatchingModel = false;
        if (!_.isUndefined(knownModel) && !_.isUndefined(candidateModel)) {
            for (var attributeName in candidateModel) {
                if (_.isUndefined(knownModel[attributeName])) {
                    isMatchingModel = false;
                } else if (_.isNull(knownModel[attributeName]) || _.isNull(candidateModel[attributeName])) {
                    isMatchingModel = knownModel[attributeName] === candidateModel[attributeName];
                } else {
                    isMatchingModel = knownModel[attributeName].toString() === candidateModel[attributeName].toString();
                }

                if (!isMatchingModel) {
                    break;
                }
            }
        }
        return isMatchingModel;
    },
    /** Checks and returns an array with all the dirty models */
    checkAndGetDirtyModels: function () {
        var self = this,
            dirtyModels = [];
        if (this._dirtyModels.length > 0) {
            dirtyModels = _.chain(this._dirtyModels).groupBy(function (dirtyModelContainer) {
                var isDefined = !_.isUndefined(dirtyModelContainer) && !_.isUndefined(dirtyModelContainer.model);
                return isDefined ? dirtyModelContainer.model.cid : null;
            }).map(function (dirtyModelsContainer, dirtyModelCid) {
                var result;
                if (!_.isNull(dirtyModelCid)) {
                    var dirtyModelContainer = _.first(dirtyModelsContainer),
                        foundModelIndex = self._findModelIndex(self.models, dirtyModelContainer.model),
                        model = foundModelIndex !== -1 ? self.models[foundModelIndex] : null,
                        action = dirtyModelContainer.action;

                    model = _.isNull(model) ? self.model.findOrCreate(dirtyModelContainer.model.attributes) : model;
                    if (!_.isNull(model)) {
                        result = { model: model, action: action};
                    }
                }
                return result;
            }).compact().value();
        }
        return dirtyModels;
    },
    /** Revert the dirty models to its original attributes and values */
    revert: function () {
        var dirtyModels = this.checkAndGetDirtyModels(),
            model,
            isDirty,
            addedModels = [],
            removedModels = [];

        _.each(dirtyModels, function (dirtyModel) {
            switch (dirtyModel.action) {
                case 'change':
                    dirtyModel.model.revert();
                    break;
                case 'add':
                    addedModels.push(dirtyModel.model);
                    break;
                case 'remove':
                    removedModels.push(dirtyModel.model);
                    break;
            }
        });

        if (addedModels.length > 0) {
            this.remove(addedModels, {silent: true});
        }

        if (removedModels.length > 0) {
            this.add(removedModels, {silent: true});
        }

        model = null;
        isDirty = false;
        this._dirtyModels = [];
        this._setAndTriggerDirtyCollection(model, isDirty);
    },
    /**
    * Returns the attribute that will be used to sort the collection
    * @return {string}
    */
    sortBy: 'id',
    /**
    * Returns the attribute that will be used to define the direction or order of the sort, values are 'asc' or 'desc'.
    * @return {string}
    */
    sortOrder: 'asc',
    /** Model to be instantiated by this collection. */
    model: Suit.Model,
    /**
    * Comparator function used by the 'sort()' method in order to sort the collection using the 'sortBy' and 'sortOrder' attributes.
    * @return {number}
    */
    comparator: function (a, b) {
        if (_.isEmpty(this.sortBy) || _.isEmpty(this.sortOrder)) {
            return;
        }
        var sortBy = this.sortBy.split(':');
        var attr = sortBy[0];
        var func = sortBy[1];
        if (_.isUndefined(func)) {
            a = a.get(attr);
            b = b.get(attr);
        } else {
            a = a[func]();
            b = b[func]();
        }
        if (_.isString(a)) { a = a.toLowerCase(); }
        if (_.isString(b)) { b = b.toLowerCase(); }

        if (this.sortOrder === 'asc') {
            return a > b ?  1 : a < b ? -1 : 0;
        } else {
            return a > b ?  -1 : a < b ? 1 : 0;
        }
    }
});

// Extend the RestfulUrls.
_.extend(Suit.Collection.prototype, Suit.RestfulUrls);

/* global HTMLElement, jQuery */
'use strict';

Suit.View = Backbone.View.extend(/** @lends Suit.View.prototype */{
    /**
      * @class Suit.View
      * @classdesc Suit framework view class, it's use to manage the DOM layout and events triggered by the application.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyView = Suit.View.extend({ Suit.View.prototype.initialize.apply(this, this.options); });</b></p>
      *
      * <p>This will create a view object with all of the features that Suit.View has to offer.</p>
      *
      * <h4>Usage:</h4>
      *
      * <p>When you decide to create a View you should create it with the command line using the following command:<br />
      * <br />
      * <b>yo suit:view[folderName]/[name]</b></p>
      *
      * <p>The folder is optional.</p>
      *
      * <p>This will create two files:<br />
      * <br />
      * <b>app/views/[folderName]/[name].js</b><br />
      * <b>spec/views/[folderName]/[name]_spec.js</b><br />
      * <br />
      * These will be a template for testing and basic view defaults.<br />
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var view = new Suit.View()</b></p>
      *
      * @augments Backbone.View
      * @constructs Suit.View
      */
    initialize: function (options) {
        // This should included in all of the
        // Suit.View.prototype.initialize.apply(this, this.options);
        this.viewData = {};
        options = _.isObject(options) ? options : {};
        this.options = _.isObject(this.options) ? this.options : {};
        this.options = _.extend(this.options, options);

        this.components = {};

        this.setParent(this.options.parent);
        this.children = this.options.children || [];

        if (!_.isUndefined(this.options.model)) {
            this.model = this.options.model;
            this.listenTo(this.model, 'request', this.cleanErrors);
            this.listenTo(this.model, 'error', this.handleErrors);
            this.listenTo(this.model, 'validated', this.handleValidation);
        }

        // Extending child events, to our custom events
        this.events = _.result(this, 'events') || {};
        this.events = _.extend({
            'mouseover .error' : function (event) {
                var currentTarget = $(event.currentTarget);
                var key = currentTarget.attr('data-error-key');

                // Since select boxes are "different", we need to actually select
                // the <select> inside the .select-box
                if (currentTarget.is('.select-box')) {
                    key = currentTarget.find('select').attr('data-error-key');
                }

                // This is a way to actually recalculate the current offset
                var tooltip = $('body').find('.tooltip[data-error-key="' + key + '"]');
                tooltip.css({
                    top: currentTarget.offset().top - tooltip.height() - 12,
                    left: currentTarget.offset().left
                }).show();
            },
            'mouseout .error' : function (event) {
                var currentTarget = $(event.currentTarget);
                var key = currentTarget.attr('data-error-key');
                if (currentTarget.is('.select-box')) {
                    key = currentTarget.find('select').attr('data-error-key');
                }
                $('body').find('.tooltip[data-error-key="' + key + '"]').hide();
            }
        }, this.events);

        // Here we will wrap the render and close events.
        var self = this;
        // Render
        _.bindAll(this, 'render');
        this.render = _.wrap(this.render, function (render) {
            self._beforeRender();
            self.trigger('onRender');
            render();
            self._afterRender();
            return self;
        });
        // Close
        _.bindAll(this, 'close');
        this.close = _.wrap(this.close, function (close) {
            self._beforeClose();
            self.trigger('onClose');
            close();
            self._afterClose();
            return self;
        });

        // Listen to the user permissions in order to remove elements that they should not see.
        if (App.currentUser) {
            this.listenTo(App.currentUser, 'change:permission', this._removeUnauthorizedElements);
        }

        // Create an errors container to clear the proper errors for the view.
        this.errors = [];

        // Attach this view to the el data('view') property for later use.
        this.$el.data('view', this);
    },
    /** Applying formatter functionality in our views */
    formatters: Suit.Helpers.Formatters,
    /**
    *   Cleans error tag when form is submitted or model is saved
    */
    cleanErrors: function () {
        this.$el.find('.error').removeClass('error');
        while (this.errors.length) {
            var el = this.errors.pop();
            el.remove();
        }
    },
    /**
      * Handles server response errors for inputs on the view.
      * @param {Suit.Model} model
      * @param {Object} response
    */
    handleErrors: function (model, response) {
        var self = this;
        if (!_.isUndefined(response) && (response.status === 400 || response.status === 422)) {
            var jsonResponse = JSON.parse(response.responseText);
            _.each(jsonResponse, function (val, key) {
                self.showVisualError(key, val);
            });
        }
    },
    /**
      * Handles front-end validation (at client side)
      * @param {Bool} isValid - Determines if the validation passed or not
      * @param {Suit.Model} model - Model that is being validated
      * @param {Object} invalidAttrs - Object with the list of invalid attrs
      */
    handleValidation: function (isValid, model, invalidAttrs) {
        var self = this;
        this.cleanErrors();

        if (!isValid) {
            _.each(invalidAttrs, function (value, key) {
                self.showVisualError(key, value);
            });
        }
    },
    /**
      * Handles the visual error show on the form inputs, based on the received
      * key.
      * @param {String} key - Form key
      */
    showVisualError: function (key, value) {
        var underscoredKey = _.str.underscored(key);
        var inputElem = this.$el.find('[name="' + key + '"], [data-name="' + key + '"], [name="' + underscoredKey + '"], [data-name="' + underscoredKey + '"]');
        if (inputElem.length > 0) {
            if (inputElem.prop('type') === 'select-one') {
                inputElem.parent().addClass('error');
            } else {
                inputElem.addClass('error');
            }

            // Add key reference, for further use
            inputElem.attr('data-error-key', key);

            var content = this._formatErrorMessage(key, value);

            // Add tooltip element
            var tooltip = $('<div class="tooltip" data-error-key="' + key + '"><div class="tooltip-content">' +  content + '</div><div class="tooltip-arrow"></div></div>');
            this.errors.push(tooltip);
            $('body').append(tooltip);
        } else {
            this._unhandledUIErrors(key, value);
        }
    },
    /**
     * Humanizes and formats the error message to display on input validations.
     * @param  {String} key - Form key
     * @param  {String} value - The error message of the Form key
     * @return {String} The formatted message
     */
    _formatErrorMessage: function (key, value) {
        // If the value is a list of errors, we should show them in a list
        var content = '';
        var searchText = new RegExp(key, 'ig');
        if (_.isArray(value)) {
            content = value.map(function (msg) {
                return msg.replace(searchText, _.str.humanize(key));
            }).join('<br />');
        } else {
            content = value.replace(searchText, _.str.humanize(key));
        }

        return content;
    },
    /**
      * It handles the visual errors that are no associated to an element in
      * the view.
      * @param {String} key - Form key
      * @param {String} value - The error message of the Form Key
      */
    _unhandledUIErrors: function (key, value) {
        var body = $('body');
        //If there is no tooltip error for this key, we should show it on an alert
        if (!_.str.contains(body.find('.tooltip:not("#suit-tooltip")').attr('data-error-key'), key)) {
            var errors = '<div class="ml-30">' + Suit.Helpers.Formatters.humanize(key) + '<ul>';
            _.each(value, function (element) {
                errors += '<li>' + Suit.Helpers.Formatters.humanize(element) + '</li>';
            });
            errors += '</ul></div>';

            var alertBox = body.find('.alert-box-error');
            //If there is no alert, we should create it, or check if does not contains the error
            if (alertBox.length === 0) {
                errors = '<h3>Errors</h3>' + errors;
                var msgView = new Suit.Components.ErrorAlert({message: errors});
                body.prepend(msgView.render().$el);
            } else if (!_.str.contains(alertBox.html(), errors)) {
                alertBox.append(errors);
            }
        }
    },
    /**
      * Sets the parent view for this view and adds this view as one of it's child.
      * @param {Suit.View} parent
      */
    setParent: function (parent) {
        this.parent = parent;
        if (!_.isUndefined(this.parent)) {
            this.parent.children.push(this);
            this.parent.children = _.uniq(this.parent.children);
            this.listenTo(this.parent, 'onClose', this.close);
        }
    },
    /**
      * Sets a view as a child and this view as a parent.
      * @param {Suit.View} child
      */
    setChild: function (child) {
        child.setParent(this);
    },
    /**
      * Searches the DOM under the view and returns the Jquery element that matches the selector or the view's element
      if the selector is undefined.
      * @param {string} selector
      * @return {element}
      */
    find: function (selector) {
        if (_.isUndefined(selector)) {
            return this.$el;
        }
        return this.$el.find(selector);
    },
    /**
      * It finds the closes parent view for a selector. Useful when adding a child view using a selector and there is another
      * child view in between.
      * @param {string} selector
      * @return {Suit.View}
      */
    findClosestParentView: function (selector) {
        var el = this.find(selector);
        if (el === this.$el) {
            return this;
        } else if (!_.isUndefined(el.data('view'))) {
            return el.data('view');
        } else {
            var parent = _.find(el.parents(), function (parent) {
                return !_.isUndefined($(parent).data('view'));
            });
            if (!_.isUndefined(parent)) {
                return $(parent).data('view');
            } else {
                return undefined;
            }
        }
    },
    /**
      * Appends a view to this view to the root element or the selector.
      * @param {Suit.View} view
      * @param {string} selector
      */
    appendView: function (view, selector) {
        // Check which is the closes view before appending.
        var parentView = this.findClosestParentView(selector);
        var el = this.find(selector);
        view.setParent(parentView);
        el.append(view.el);
        view.render();
        return this;
    },
    /**
      * Prepends a view to this view to the root element or the selector.
      * @param {Suit.View} view
      * @param {string} selector
      */
    prependView: function (view, selector) {
        // Check which is the closes view before prepending.
        var parentView = this.findClosestParentView(selector);
        var el = this.find(selector);
        view.setParent(parentView);
        el.prepend(view.el);
        view.render();
        return this;
    },
    /**
      * Replaces the html content of the root element or the selector of this view with another view.
      * @param {Suit.View} view
      * @param {string} selector
      */
    htmlView: function (view, selector) {
        this.empty(selector);
        this.appendView(view, selector);
        return this;
    },

    // This should be moved to Guide
    noData: function (selector) {
        var el = this.find(selector);

        if (el.find('.no-data').length === 0) {
            var parent = el.parent();
            var height = el.outerHeight();
            var width = el.outerWidth();

            var divElem = $('<div class="no-data bgc-light-grey p-absolute ta-center fs-20"></div>');

            parent.data('original-position', parent.css('position'));
            parent.css('position', 'relative');

            divElem.html('Ø NO DATA FOR SELECTED TIMEFRAME');
            divElem.css('line-height', height + 'px');
            divElem.css('vertical-align', 'middle');
            divElem.css('width', width + 'px');
            divElem.css('height', height + 'px');
            divElem.css('top', 0);
            divElem.css('left', 0);
            el.append(divElem);
        }
    },
    // This should be moved to Guide
    removeNoData: function (selector) {
        var el = this.find(selector);
        var parent = el.parent();
        var noDataEl = el.find('.no-data');
        noDataEl.remove();
        parent.css('position', parent.data('original-position'));
    },
    /**
      * Displays loader for the current view selector.
      * Example usage: view.loader({selector: '.anyClass', loaderSize: 'small', tone: 'light'});
      *
      * @param {Object}
      * object.selector
      * object.loaderSize - large or small default is large.
      * object.tone - dark or light default is dark.
    **/
    loader: function (object) {
        var el;

        if (object) {
            object.selector = object.selector || {};

            if (object.selector instanceof HTMLElement) {
                el  = $(object.selector);
            } else if (object.selector instanceof jQuery) {
                el  = object.selector;
            } else if (typeof object.selector === 'string') {
                el  = this.find(object.selector);
            } else {
                el = this.$el;
            }
        } else {
            el = this.$el;
        }

        var parent = el.parent();
        var height = el.outerHeight();
        var width = el.outerWidth();

        var divElem = $('<div class="loader"></div>');

        if (object && object.loaderSize === 'small') {
            divElem.addClass('small');
        }

        if (object && object.tone === 'light') {
            divElem.addClass('light');
        }

        parent.data('original-position', parent.css('position'));
        parent.css('position', 'relative');
        divElem.css('width', width + 'px');
        divElem.css('height', height + 'px');
        divElem.css('top', 0);
        divElem.css('left', 0);
        el.append(divElem);
    },
    /**
    Remove the loader from the view
    @params {String} selector.
    */
    removeLoader: function (selector) {
        var el;

        if (selector instanceof HTMLElement) {
            el = $(selector);
        } else if (selector instanceof jQuery) {
            el = selector;
        } else {
            el = this.find(selector);
        }

        var parent = el.parent();
        var loader = el.find('.loader');
        loader.remove();
        parent.css('position', parent.data('original-position'));
    },
    /**
      * Empty's the content of the views element or an specific selector.
      * @param {string} selector
      */
    empty: function (selector) {
        this.closeChildren(selector);
        this.find(selector).empty();
    },
    /**
      * It fetches all the children for a view using the passed selector to search the DOM under the view.
      * @param {string} selector
      * @return {array} array of children views.
      */
    findChildrenBySelector: function (selector) {
        if (!_.isUndefined(selector)) {
            var closestParent = this.findClosestParentView(selector);
            if (!_.isUndefined(closestParent)) {
                var el = closestParent.find(selector).get(0);
                return _.filter(closestParent.children, function (child) {
                    return child.$el === el || _.contains(child.$el.parents(), el);
                });
            }
        }
        return this.children;
    },
    /**
      * It closes child views using the passed selector by removing them for DOM and clearing their events.
      * @param {string} selector
      */
    closeChildren: function (selector) {
        var children = this.findChildrenBySelector(selector);
        for (var i = children.length - 1; i >= 0; i--) {
            children[i].close();
        }
    },
    /**
      * It handles before close events in for the Suit framework exclusively, DO NOT OVERRIDE IT!
      */
    _beforeClose: function () {
        if (this._rivets) {
            this._rivets.unbind();
        }
        this.$('.error').off('hover');
        this.trigger('beforeClose');
        this.beforeClose();
        //Remove the tooltips associated to the view
        _.each(this.$el.find('[data-error-key]'), function (htmlElement) {
                var $htmlElement = $(htmlElement);
                var dataErrorKey = $htmlElement.attr('data-error-key');
                $('.tooltip[data-error-key="' + dataErrorKey + '"]').remove();
            });
        // Remove from parent children.
        if (!_.isUndefined(this.parent)) {
            var index = this.parent.children.indexOf(this);
            if (index >= 0) {
                this.parent.children.splice(index, 1);
            }
            this.parent = undefined;
        }
        this.trigger('onClose');
        this.unbind();
        if (!_.isUndefined(this.$el)) {
            this.$el.unbind();
        }
        // Detach all events and remove all JQuery children form DOM and clean up.
        if (!_.isUndefined(this.$el)) {
            _.each(this.$el.find('*'), function (el) {
                el = $(el);
                el.unbind();
                el.remove();
            });
        }
    },
    /** Method to be implemented for before close handling. */
    beforeClose: function () {
        // Override and implement your before render logic.
    },
    /**
      * It closes the view by removing it from DOM, clearing all event and closing all child views.
      */
    close: function (event) {
        // Prevent defaults if it's called by an actual object on the view.
        if (event instanceof Event) {
            event.preventDefault();
        }
        if (!_.isUndefined(this.$el)) {
            this.remove(); // <<< remove does two things, this.$el.remove() and also this.stopListening()
        } else {
            this.stopListening();
        }
        if (!_.isUndefined(this.$el)) {
            delete this.$el;
        }
        delete this.el;
    },
    /**
      * It handles after close events in for the Suit framework exclusively, DO NOT OVERRIDE IT!
      */
    _afterClose: function () {
        this.trigger('afterClose');
        this.afterClose();
    },
    /** Method to be implemented for after render handling. */
    afterClose: function () {
        // Override and implement your after close logic.
    },
    /**
      * It handles before render events in for the Suit framework exclusively, DO NOT OVERRIDE IT!
      */
    _beforeRender: function () {
        this.trigger('beforeRender');
        this.beforeRender();
    },
    /** Method to be implemented for before render handling. */
    beforeRender: function () {
        // Override and implement your before render logic.
    },
    /** Render function for the view */
    render: function () {
        if (this.template) {
            this.empty();
            this.$el.html(this.template(this));
        }
        return this;
    },

    /*** Binds Rivets to View ***/
    initRivets: function () {
        if (this._rivets) {
            this._rivets.unbind();
        }
        this._rivets = window.rivets.bind(this.el, this);
    },

    /**
      * It handles after render events in for the Suit framework exclusively, DO NOT OVERRIDE IT!
      */
    _afterRender: function () {
        var self = this;
        this.initializeComponents();
        // Remove the data-role components not visible to some users.
        this._removeUnauthorizedElements();
        //we have to wait for compnents to initialize before the render.
        // _.defer(function () {

        this.initRivets();

        // If we are re-rendering, we need to keep focus on first element with autofocus
        var autoFocused = self.find('input[autofocus]:first');
        if (!_.isEmpty(autoFocused)) {
            _.defer(function () { autoFocused.focus(); });
        }

        self.trigger('afterRender');
        self.afterRender();
        // });
    },
    /** This checks the current user's permission is present in the data-permissions attributes.
     * The roles will be separated by commas.
     */
    _removeUnauthorizedElements: function () {
        if (!App.currentUser || !this.el) { return; }
        var self = this;
        var elements = this.find('[data-permissions]');
        var permission = App.currentUser.get('permission');

        _.each(elements, function (el) {
            el = $(el);
            var permissions = el.attr('data-permissions').replace(/ /g, '').split(',');
            if (!_.contains(permissions, permission)) {
                // We need to figure out if this is a view or just a simple element.
                var view = el.data('view');
                if (view) {
                    view.close();
                } else {
                    self.empty(el);
                    el.remove();
                }
            }
        });
    },
    /** Method to be implemented for after render handling. */
    afterRender: function () {
        // Override and implement your after render logic.
    },
    /** Use for Suit Component management. It searches for uninitialized components inside the view in order to
      * properly initialized them. */
    initializeComponents: function () {
        var self = this;
        _.each(Suit.Components.registeredComponents, function (component) {
            var foundElements = self.$el.find('.' + _.str.dasherize(component).slice(1));
            // For each found element we need to figure out if it has a compoment,
            // if it's initialized and attached to the view as a child.
            if (foundElements.length > 0) {
                _.each(foundElements, function (fc) {
                    var elementView = $(fc).data('view');
                    if (_.isUndefined(elementView)) {
                        var c = new Suit.Components[component]({el: fc});
                        c.setParent(self);
                    } else {
                        elementView.setParent(self);
                    }
                });
            }
        });
    },
    /** Serializer for the form components, useful for converting form elements into
      * a JavaScript object, and then hit the service with this data */
    serializeObject: function (el) {
        el = el || 'form';
        var o = {};
        var a = this.find(el + ' :input').serializeArray();

        $.each(a, function () {
            var keyName = _.str.camelize(this.name);

            if (o[keyName]) {
                if (!o[keyName].push) {
                    o[keyName] = [o[keyName]];
                }
                o[keyName].push(this.value || '');
            } else {
                o[keyName] = this.value || '';
            }
        });

        return o;
    }
});

'use strict';

var Controller = Suit.Controller = function (options) {
    options = options || {};

    this.initialize.apply(this, arguments);
};

var Events = Backbone.Events;

_.extend(Controller.prototype, Events, /** @lends Controller.prototype */{
    /**
      * @class Suit.Controller
      * @classdesc Suit frameword controller class that handles fetching data, rendering components, rendering views, updating urls and the page title.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyController = Suit.Controller.extend({});</b></p>
      *
      * <p>This will create a controller object with all of the features that Suit.Controller has to offer.</p>
      *
      * <h4>Usage:</h4>
      *
      * <p>When you decide to create a Controller you should create it with the command line using the following command:<br/>
      * <br />
      * <b>yo suit:controller [name]</b></p>
      *
      * <p>This will create two files:<br />
      * <br />
      * <b>app/controllers/[name].js</b><br />
      * <b>spec/controlles/[name]_spec.js</b><br />
      * <br />
      * These will be a template for testing and basic controller defaults.<br />
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var controller = new Suit.Controller()</b></p>
      *
      * @constructs Suit.Controller
      */
    //initialize: function () {},
    /**
      * The _initialize function will check if the current user has permissions to execute the controller
      * depending on the App.can object.<br />
      * If the user does not meet the criteria, then it will be sent to redirect url in the object. If not defined,
      * the user will be redirected to the main page.
      */
    initialize: function () {
        var self = this;
        // Remove functions that don't need to be authenticated.
        var functions = _.without(_.functions(this), 'goBack');
        _.each(functions, function (func) {
            var actions = _.functions(Events);
            _.zip(actions, ['initialize', 'constructor']);
            if (!_.contains(actions, func)) {
                self[func] = _.wrap(self[func], function (f) {
                    // Check if the user can access.
                    if (Suit.Can.go(self.className, func)) {
                        return f.apply(self, Array.prototype.slice.call(arguments, 1));
                    } else if (Suit.Can.authenticate()) {
                        Backbone.history.navigate('/', true);
                    }
                });
            }
        });
    },
    /**
      * Set the window.document.title, so that it has a meaningful title
      * @param {String} title - New title that is going to be applied into
      */
    setTitle: function (title) {
        window.document.title = 'SET - ' + title;
    },
    /**
      * Redirects back to last known route, if any, if not it will use the fallback
      * URL.
      * @param {String} fallback - Fallback route, if there is no previous URL
      * @param {Boolean} trigger - If you want to trigger the navigation
      */
    goBack: function (fallback, trigger) {
        fallback = fallback || null;
        trigger  = !_.isUndefined(trigger) ? trigger : true;

        var previousRoute = App.routesHistory.previousRoute;

        if (previousRoute && !fallback) {
            Backbone.history.navigate(previousRoute, {trigger: trigger});
        } else if (fallback) {
            Backbone.history.navigate(fallback, {trigger: trigger});
        } else {
            Backbone.history.navigate('', {trigger: trigger});
        }
    }
});

// Copy the Backbone extend helper function.
Controller.extend = Backbone.Model.extend;

'use strict';

var Cache = Suit.Cache = function (options) {
    options = options || {};
    this.initialize.apply(this, arguments);
};

var Events = Backbone.Events;

_.extend(Cache.prototype, Events, /** @lends Cache.prototype */{
    /**
      * @class Suit.Cache
      * @classdesc Suit framework Cache class that handles global caching solutions.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyCache = Suit.Cache.extend({});</b></p>
      *
      * <p>This will create a cache object with all of the features that Suit.Cache has to offer.</p>
      *
      * <h4>Usage:</h4>
      *
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var cache = new Suit.Cache()</b></p>
      *
      * @constructs Suit.Cache
      */
    initialize: function () {},
    /**
      Initializes and returns the data object
      **/
    getData: function () {
        this.data = this.data || {};
        return this.data;
    },
    /**
      Sets the analytics cache using cache rule
      @params {String} key - Key that defines the key in the cache.
      @params {object} value - Url that defines the key in the cache.
      **/
    set: function (key, value) {
        var cache = this.getData();
        cache[key] = {value: value, timestamp: moment().utc()};
    },
    /**
      Gets the analytics cache using url key.
      @params {String} url - Url that defines the key in the cache.
      **/
    get: function (key) {
        var cache = this.getData();
        if (this.expired(key)) {
            delete cache[key];
        }
        var object = cache[key];
        return _.isUndefined(object) ? undefined : object.value;
    },
    /**
      Verifies if the key is cachable.
      @params {String} key - String that defines the key in the cache.
      **/
    expired: function (key) {
        var cache = this.getData();
        if (!_.has(cache, key) || this.expirationRule(key)) {
            return true;
        } else {
            return false;
        }
    },
    /*
      Cache rule to be overriden for custom caching rule.
      If the value returned is true, then the the key should be cached.
      @params {String} Key - String that defines the key in the cache.
      **/
    expirationRule: function (key) {
        return key === false;
    }
});

// Copy the Backbone extend helper function.
Cache.extend = Backbone.Model.extend;

'use strict';

Suit.Router = Backbone.Router.extend(/** @lends Suit.Router.prototype */{
    /**
      * @class Suit.Router
      * @classdesc Suit framework router for basic routing and controller delegation.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyRouter = Suit.Router.extend({});</b></p>
      *
      * <h4>Usage</h4>
      *
      * <p>When you decide to create a Router you should create it with the command line using the following command:<br/>
      * <br />
      * <b>yo suit:router [name]</b></p>
      *
      * <p>This will create two files:<br />
      * <br />
      * <b>app/routers/[name].js</b><br />
      * <b>spec/routers/[name]_spec.js</b><br />
      * <br />
      * These will be a template for testing and basic router defaults.<br />
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var router = new Suit.Router()</b></p>
      *
      * @augments Backbone.Router
      * @constructs Suit.Router
      */
    initialize: function () {
        this.on('all', this.storeRoute);
    },
    /** Handles rendering of the layout for a router **/
    beforeEach: function () {
        return;
    },
    /** Before object that contains a list of function names to be is only called on first load or router switching. **/
    before: {},
    /** Alias for beforeEach **/
    layout: function () { this.beforeEach(); },
    /**
      * Stores the route history object, so that we use for history management
      * purposes (like going to last known route).
      */
    storeRoute: function () {
        // Store new routes only if they changed
        if (App.routesHistory.currentRoute !== Backbone.history.fragment) {
            App.routesHistory.previousRoute = App.routesHistory.currentRoute;
            App.routesHistory.currentRoute = Backbone.history.fragment;
        }
    },
    /**
      * Override the _extractParameters, method in order to parse parameters that look like query strings
      * into an object.<br/>
      * Useful for when you want to parse routes like this:<br />
      * #status?some=value
      */
    _extractParameters: function (route, fragment) {
        var re = /([^&=]+)=?([^&]*)/g;
        var decode = function (str) {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        };
        var parseParams = function (query) {
            if (query && _.contains(query, '=')) {
                var params = {}, e;
                e = re.exec(query);
                while (e) {
                    var k = decode(e[1]);
                    var v = decode(e[2]);
                    if (params[k] !== undefined) {
                        if (!$.isArray(params[k])) {
                            params[k] = [params[k]];
                        }
                        params[k].push(v);
                    } else {
                        params[k] = v;
                    }
                    e = re.exec(query);
                }
                return Suit.Helpers.toCamelCaseObject(params);
            } else {
                return query;
            }
        };
        var result = route.exec(fragment).slice(1);
        for (var i = result.length - 1; i >= 0; i--) {
            result[i] = parseParams(result[i]);
        }
        return result.length > 1 ? result.slice(0, -1) : result;
    },
    getCallback: function (name) {
        var routerName = this.className,
            controller = App.Controllers[routerName],
            scope = this,
            callback = this[name];

        if (controller && !callback) {
            callback = controller[name];
            scope = controller;
        }

        return _.bind(callback, scope);
    },
    /**
      * Override the route function so that a controller get's called on calls after the application is first loaded.
      * @param {String} route string for the current route being called.
      * @param {String} name string with the name of the function to be called.
      * @param {Function} callback function that get's called if the route is matched.
      */
    route: function (route, name) {
        var router = this;

        var routerName = router.className,
            controller = App.Controllers[routerName];

        var f = function () {

            var goToRoute = function (args) {
                if (router.layout) { router.layout.apply(router, args); }
                var before = router.before[name];
                if (before) {
                    _.each(before, function (funcName) {
                        router.getCallback(funcName).apply(null, args);
                    });
                }
                router.getCallback(name).apply(null, args);
                if (router.afterEach) { router.afterEach.apply(router, args); }
            };
            var routeStripper = /^[#\/]|\s+$/g;
            var fragment = Backbone.history.fragment;
            fragment = fragment.replace(routeStripper, '');
            // find the router, and router this route goes to.
            var handlers = Backbone.history.handlers;
            var handler = _.find(handlers, function (h) {
                if (h.route.test(fragment)) { return true; }
            });

            window.document.title = _.str.humanize(name);

            // Close all modals if the route changes.
            Suit.Components.Modal.closeAll();

            // Get all params.
            var args = router._extractParameters(handler.route, fragment);

            if (App.currentRouter !== router) {
                App.currentRouter = router;
                // On first load of the page.
                if (_.isUndefined(Backbone.history.firstLoad) || Backbone.history.firstLoad) {
                    Backbone.history.firstLoad = false;
                    App.mainRouter.beforeAll.apply(App.mainRouter, args);
                    // Call the router
                    goToRoute(args);
                    App.mainRouter.afterAll.apply(App.mainRouter, args);
                } else {
                    goToRoute(args);
                }
                return;
            }

            // Call the proper controller.
            var routerName = router.className;
            if (_.has(App.Controllers, routerName) && _.contains(_.functions(App.Controllers[routerName]), name)) {
                controller[name].apply(controller, args);
                return false;
            } else {
                goToRoute(args);
            }
        };
        return Backbone.Router.prototype.route.call(router, route, name, f);
    }
});


'use strict';

var Can = function (options) {
    options = options || {};
    this.initialize.apply(this, arguments);
};

var Events = Backbone.Events;

_.extend(Can.prototype, Events, /** @lends Can.prototype */{
    /**
      * @class Suit.Can
      * @classdesc Suit framework controller access moderator. Model to be User "CAN" perform this action.
      *
      * <h4>Usage:</h4>
      *
      * <p>When you decide to create a controller action, that you want to regulate access, you should update the can.js file located in app/can.js.<br/>
      * <br />
      *
      * <p>The can file has the App.canRules object. This object contains the following tree structure:<br />
      * <br />
      * - controller<br />
      * - - action<br />
      * - - - permissions: ['admin', 'ad_ops', etc]  (if not defined everybody is allowed)<br />
      * - - - redirect: 'router to navigate to'<br />
      * - - - message: 'access message to display when the access is restricted'<br />
      * <br />
      *
      * @constructs Suit.Can
      */
    initialize: function () {},

    go: function (controller, action) {
        var rule;
        try {
            // Check if it requires login. Default is True.
            var baseRule = App.canRules;
            var controllerRule = baseRule[controller] || {};
            rule = controllerRule[action] || {};

            // Check if the global application requires login.
            if (!(rule.requireLogin === false ||
                  (controllerRule.requireLogin === false && !rule.requireLogin) ||
                  (baseRule.requireLogin === false && !controllerRule.requireLogin && !rule.requireLogin)) && !this.authenticate()) {
                return false;
            }

            if (!rule || !rule.permissions) {
                return true;
            }
        } catch (error) {
            return true;
        }
        var user = App.currentUser;
        var permissions = rule.permissions;
        if (_.contains(permissions, user.get('permission'))) {
            return true;
        }
        return false;
    },
    authenticate: function () {
        // Check if the user is logged in.
        if (_.isNull(Suit.LocalStorage.getItem('token'))) {
            App.Controllers.Sessions.logout();
            return false;
        } else {
            if (_.isNull(App.currentUser)) {
                App.currentUser = App.Models.User.find({token: Suit.LocalStorage.getItem('token')}) || App.Models.User.findOrCreate({token: Suit.LocalStorage.getItem('token')});
            }
            if (App.currentUser.isNew()) {
                App.currentUser.fetchMe();
            }
        }
        return true;
    }
});

// Copy the Backbone extend helper function.
Can.extend = Backbone.Model.extend;
Suit.Can = new Can();

'use strict';
Suit.Components = Suit.Components || {};
Suit.Components.Binders = Suit.Components.Binders || {};

/** List of registered components for the Suit framework */
Suit.Components.registeredComponents = Suit.Components.registeredComponents || [];

/** Here you will register a component using the class name of the top element. */
Suit.Components.registerComponent = function (className) {
    className = _.str.classify(_.str.underscored(className));
    Suit.Components.registeredComponents.push(className);
    Suit.Components.registeredComponents = _.uniq(Suit.Components.registeredComponents);
};

Suit.Components.Binders['component-*'] = {
    block: true,
    bind: function () {
        var $el = $(this.el),
            id = $el.attr('id'),
            componentName = _.str.camelize(_.str.underscored(this.args[0])),
            className = _.str.classify(_.str.underscored(componentName)),
            data = $el.data(),
            self = this,
            attr = {el: this.el};
        _.each(data, function (value, key) {
            var attrKey = key;
            if (_.isString(value)) {
                var keypath = value.split(':'),
                    keyName = keypath.shift(),
                    rootModel = self.view.models[keyName] || self.view.models.options[keyName],
                    model = rootModel;
                if (rootModel && keypath.length > 0) {
                    model = self.view.adapters[':'].read(rootModel, keypath.join(':'));
                }
                attr[attrKey] = model || value;
            } else {
                attr[attrKey] = value;
            }
        });
        this.componentView = new Suit.Components[className](attr);
        $el.removeAttr('suit-component-' + componentName);
        this.componentView.setParent(this.view.models);
        this.componentView.render();
        $el.attr('suit-component-' + componentName);
        if (id) {
            this.view.models.components[id] = this.componentView;
        }
    },

    unbind: function () {
        this.componentView.close();
    },

    routine: function () {
    }
};

_.extend(window.rivets.binders, Suit.Components.Binders);


Suit.Component = Suit.View.extend(/** @lends Suit.Component.prototype */{
    /**
      * @class Suit.Component
      * @classdesc Suit framework component class is basically a Suit.View to be extended with particular functionality.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyComponent = Suit.Component.extend({});</b></p>
      *
      * <p>This will create a collection object with all of the features that Suit.Component has to offer.</p>
      *
      * <h4>Usage:</h4>
      * 
      * <p>When you decide to create a Component you should create it with the command line using the following command:<br />
      * <br />
      * <b>yo suit:component</b></p>
      *
      * <p>This will ask you for the type of component that you will like to create, along with other configuration questions, it will also ask you about where do you want to place the component generated, which is a template location. The location can be myFolder/myView. The component will be appended to the bottom of the template and it will be automatically instatiated when you render the view. It is your job to test for the components instantiation and rendering.<br />
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var component = new Suit.Component()</b></p>
      *
      * @augments Backbone.View
      * @constructs Suit.Component 
      */
    initialize: function (options) {
        Suit.View.prototype.initialize.apply(this, [options]);
    }
});

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}
Suit.Components.Alert = Suit.Component.extend(/** @lends Suit.Components.Alert.prototype */{
    /**
      * @class Suit.Components.Alert
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        this.type = this.options.type || 'information';
        this.timeout = this.options.timeout;
        this.message = this.options.message || 'Suit alert box!';
        this.listenTo(Backbone.history, 'route', this.close);
    },
    /** className for the component, there are four(4) types of alerts. */
    className: function () {
        return 'alert-box-' + this.type;
    },
    /** Tagnanme for this component is a */
    tagName: 'a',
    /** Suppress the href element on the click event */
    attributes: {href: 'javascript:void(0);'},
    /** Component template */
    template: JST['suit/components/alert'],
    /** Events that this view responds to */
    events: {
        'click': 'close'
    },
    /** Messages to be shown in the alert box */
    message: 'Suit alert box!',
    /** Type of alert box, it could be (confirmation, error, warning, information) */
    type: 'information',
    /** Alert box icon to show before text */
    alertIcon: 'i',
    afterRender: function () {
        if (this.timeout) {
            var self = this;
            this.$el.delay(this.timeout).fadeOut('slow', function () {
                self.close();
            });

        }
    }

});
Suit.Components.ConfirmationAlert = Suit.Components.Alert.extend(/** @lends Suit.Component.ConfirmationAlert.prototype */{
    initialize: function (options) {
        Suit.Components.Alert.prototype.initialize.apply(this, [options]);
        this.timeout = this.options.timeout || 2000;
    },
    /**
      * @class Suit.Components.ConfirmationAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-confirmation',
    alertIcon: 'c'
});
Suit.Components.ErrorAlert = Suit.Components.Alert.extend(/** @lends Suit.Components.ErrorAlert.prototype */{
    /**
      * @class Suit.Components.ErrorAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-error',
    alertIcon: 'e'
});
Suit.Components.WarningAlert = Suit.Components.Alert.extend(/** @lends Suit.Components.WarningAlert */{
    /**
      * @class Suit.Components.WarningAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-warning',
    alertIcon: 'a'
});
Suit.Components.InformationAlert = Suit.Components.Alert.extend(/** @lends Suit.Components.InformationAlert.prototype */{
    /**
      * @class Suit.Components.InformationAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-information',
    alertIcon: 'i'
});

'use strict';

Suit.Components = Suit.Components || {};

Suit.Components.Chart = Suit.Component.extend(/** @lends Suit.Components.Table.prototype */{
    /**
      * @class Suit.Components.Table
      * @classdesc Suit Component Framework Table Component.
      *
      * This component is meant to be used along with tabular data. The data will
      * be handled from the source (which is passed as a keypath to the
      * component element's data-table-source attribute).
      *
      * The Table Component will provide with sorting functionalities (linked to
      * source's default sorting functionality). If the user trigger a source
      * sort change, the Table Component will interact with the changes.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Table
      */

    formatters: {
        '': 'defaultFormat',
        'date': 'dateFormat',
        'datetime': 'datetimeFormat',
        'thousand': 'thousandFormat',
        'percentage': 'percentageFormat',
        'abbreviate': 'abbreviateFormat',
        'flatPercentage': 'flatPercentageFormat',
        'truncateText': 'truncateTextFormat'
    },

    colorsMap: {
        blue: [50, 161, 204],
        purple: [104, 91, 139],
        blueberry: [78, 129, 204],
        green: [64, 168, 128],
        lime: [107, 178, 107],
        yellow: [209, 175, 80],
        tangerine: [216, 161, 80],
        orange: [221, 133, 78],
        red: [200, 70, 60],
        lightestGrey: [247, 247, 247]
    },

    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        this.baseColor               = this.options.baseColor || 'blue';
        this.theme                   = this.options.theme || 'dark';
        this.chartType               = this.options.chartType || 'line';
        this.margin                  = {left: _.isUndefined(this.options.marginLeft) ? 50 : this.options.marginLeft,
                                        right: _.isUndefined(this.options.marginRight) ? 0 : this.options.marginRight,
                                        top: _.isUndefined(this.options.marginTop) ? 40 : this.options.marginTop,
                                        bottom: _.isUndefined(this.options.marginBottom) ? 40 : this.options.marginBottom };
        this.hasAverage              = this.options.hasAverage || false;
        this.staggerLabels           = this.options.staggerLabels || false;
        this.transitionDuration      = this.options.transitionDuration || 350;
        this.showValues              = this.options.showValues || false;
        this.valueFormat             = this.options.valueFormat || 'abbreviate';
        this.tooltips                = this.options.tooltips || false;
        this.xAxisFormat             = this.options.xAxisFormat || '';
        this.yAxisFormat             = this.options.yAxisFormat || 'abbreviate';
        this.xAxisLabel              = this.options.xAxisLabel || 'Date';
        this.yAxisLabel              = this.options.yAxisLabel || 'Impressions';
        this.showXAxis               = this.options.showXAxis || false;
        this.showYAxis               = this.options.showYAxis || false;
        this.showLabels              = this.options.showLabels || false;
        this.labelType               = this.options.labelType || 'percent';
        this.donut                   = this.options.donut || false;
        this.donutRatio              = this.options.donutRatio || 0.4;
        this.useInteractiveGuideline = this.options.useInteractiveGuideline || true;
        this.showLegend              = this.options.showLegend || false;
        this.showControls            = this.options.showControls || false;
        this.minY                    = this.options.minY || 0;
        this.maxY                    = this.options.maxY || 'auto';
        this.interactive             = _.isUndefined(this.options.interactive) ? true : this.options.interactive;
        this.rightAlignYAxis         = this.options.rightAlignYAxis || false;
        this.xAttr                   = this.options.xAttr || 'timestamp';
        this.stacked                 = this.options.stacked || false;
        this.source                  = this.options.source || [];
        this.barHeight               = this.options.barHeight || 'auto';
        this.barWidth               = this.options.barWidth || 'auto';
        this.truncateLength         = this.options.truncateLength || 20;
        this.data                    = [];
        this.tooltipContent          = null;
        this.tooltipsIncludeSmallBars   = _.isUndefined(this.options.tooltipsIncludeSmallBars) ? false : this.options.tooltipsIncludeSmallBars;

        if (this.source instanceof Suit.Collection) {
            this.listenTo(this.source, 'reset remove', this.renderChart);
            this.listenTo(this.source, 'add', this.updateChart);
        } else if (this.source instanceof Suit.Model) {
            this.listenTo(this.source, 'change', this.renderChart);
        }
    },

    beforeClose: function () {
        if (this.legend) {
            this.legend.off('click');
        }
    },

    afterRender: function () {
        this.isPie = (this.chartType === 'pie') ? true : false;

        this.$container = this.$el.find('[data-chart]');
        if (!this.$container || this.$container.length < 1) {
            this.$container = $('<div class="chart-container"></div>');
            this.$el.append(this.$container);
        }
        this.$container.addClass('chart-theme-' + this.theme);
        this.renderChart();
        this.activateLegend();

    },

    activateLegend: function () {
        this.legend = $('body [data-legend-for="' + this.$el.attr('id') + '"]');
        if (this.legend && this.legend.length > 0) {
            this.legend.on('click', '[data-toggle-series]', _.bind(this.toggleChartSeries, this));
            this.legend.on('click', '[data-switch-series]', _.bind(this.switchChartSeries, this));
        }
    },

    switchChartSeries: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(e.target),
            state = this.chart.state(),
            index = this.findSeriesIndexByKey(target.data('switchSeries'));
        state.disabled = _.map(state.disabled, function (value, key) {
            if (key === index) {
                return false;
            }
            return true;
        });
        this.chart.dispatch.changeState(state);
        this.chart.update();

    },

    findSeriesIndexByKey: function (key) {
        var result;
        var keyVal = this.isPie ? 'label' : 'key';
        _.each(this.data, function (series, index) {
            if (series[keyVal] === key) {
                result = index;
            }
        });
        return result;
    },

    toggleChartSeries: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(e.target),
            state = this.chart.state(),
            index = this.findSeriesIndexByKey(target.data('toggleSeries')),
            stateCount;
        target.toggleClass('disabled');
        state.disabled[index] = target.hasClass('disabled');
        stateCount = _.countBy(state.disabled, function (bool) { return bool ? 'true': 'false'; });

        if (!stateCount.false) {
            this.legend.find('[data-toggle-series]').removeClass('disabled');
            state.disabled = _.map(state.disabled, function () { return false; });
        }
        this.chart.dispatch.changeState(state);
        this.chart.update();
    },

    chartData: function (source) {
        var results,
            self = this;

        if (this.isPie) {
            results = [];
            if (source instanceof Suit.Model) {
                for (var sourceKey in source.attributes) {
                    results.push({label: sourceKey, value: source.get(sourceKey)});
                }
            } else if (source.constructor === Object) {
                for (var sobjKey in source) {
                    results.push({label: sobjKey, value: source[sobjKey]});
                }
            }
            return results;
        }

        results = {};

        if (source instanceof Suit.Collection) {
            source = source.models;
        }
        var momentObject = moment().constructor;
        _.each(source, function (item) {
            if (item instanceof Suit.Model) {
                for (var key in item.attributes) {
                    if (key !== self.xAttr) {
                        results[key] = results[key] || [];
                        results[key].push({x: (item.get(self.xAttr) instanceof momentObject) ? item.get(self.xAttr).toDate().getTime() / 1000 : item.get(self.xAttr), y: item.get(key)});
                    }
                }
            } else if (item.constructor === Object) {
                for (var objKey in item) {
                    if (objKey !== self.xAttr) {
                        results[objKey] = results[objKey] || [];
                        results[objKey].push({x: (item[self.xAttr] instanceof momentObject) ? item[self.xAttr].toDate().getTime() / 1000 : item[self.xAttr], y: item[objKey]});
                    }
                }
            }
        });
        var finalResults = [];
        for (var rkey in results) {
            finalResults.push({ values: results[rkey], key: rkey});
        }
        return finalResults;

    },

    updateChart: function () {
        this.svg.datum(this.chartData(this.source));
        this.svg.call(this.chart);
    },

    renderChart: function () {
        this.data = this.chartData(this.source);
        this.color = this.color || this.generateColors();
        var chart,
            minMax;

        if (this.chartType === 'line') {
            chart = nv.models.lineChart();
            chart.useInteractiveGuideline(this.useInteractiveGuideline).rightAlignYAxis(this.rightAlignYAxis);
            chart.showYAxis(this.showYAxis).showXAxis(this.showXAxis);
            chart.xAxis.tickValues(_.bind(this.xTicks, this));
            chart.showLegend(this.showLegend);
        } else if (this.chartType === 'stackedarea') {
            chart = nv.models.stackedAreaChart();
            chart.useInteractiveGuideline(this.useInteractiveGuideline).rightAlignYAxis(this.rightAlignYAxis);
            chart.showYAxis(this.showYAxis).showXAxis(this.showXAxis);
            chart.xAxis.tickValues(_.bind(this.xTicks, this));
            chart.showLegend(this.showLegend);
            chart.showControls(this.showControls);
        } else if (this.chartType === 'bar') {
            chart = nv.models.discreteBarChart();
            chart.showYAxis(this.showYAxis).showXAxis(this.showXAxis);
            chart.showValues(this.showValues);
            chart.valueFormat(this.getFormatter(this.valueFormat));
        }
        else if (this.chartType === 'horizontalbar') {
            chart = nv.models.multiBarHorizontalChart();
            chart.showYAxis(this.showYAxis).showXAxis(this.showXAxis);
            chart.showControls(this.showControls);
            chart.showValues(this.showValues);
            chart.valueFormat(this.getFormatter(this.valueFormat));
            chart.stacked(this.stacked);
            chart.showLegend(this.showLegend);
        }

        if (this.isPie) {
            chart = nv.models.pieChart()
                    .x(function (d) { return d.label; })
                    .y(function (d) { return d.value; })
                    .showLabels(this.showLabels)
                    .labelThreshold(0.01)
                    .labelType(this.labelType)
                    .donut(this.donut)
                    .donutRatio(this.donutRatio)
                    .showLegend(this.showLegend);
        } else {
            minMax = this._minMaxValues(this.data);
            // X and Y axis information
            chart.xAxis.axisLabel(this.xAxisLabel)
                .tickFormat(this.getFormatter(this.xAxisFormat));

            chart.yAxis
                .axisLabel(this.yAxisLabel)
                .tickFormat(this.getFormatter(this.yAxisFormat));


            // Set min/max values for Axis
            if (this.minY !== 'auto' && this.maxY !== 'auto') {
                chart.forceY([this.minY, this.maxY]);
            } else if (this.minY !== 'auto') {
                chart.forceY([this.minY, minMax.y.max]);
            } else if (this.maxY !== 'auto') {
                chart.forceY([minMax.y.min, this.maxY]);
            }
        }

        if (!_.isNull(this.tooltipContent) && _.isFunction(this.tooltipContent)) {
            if (this.chartType === 'line' || this.chartType === 'stackedarea') {
                chart.interactiveLayer.tooltip.contentGenerator(this.tooltipContent);
            }
            else if (this.chartType === 'bar') {
                chart.tooltipContent(this.tooltipContent);
            }
            else if (this.chartType === 'horizontalbar') {
                chart.tooltip(this.tooltipContent);
            }
        }

        chart.margin(this.margin)
            .color(this.color)
            .height(this.$el.height())
            .width(this.$el.width())
            .tooltips(this.tooltips);

        // Draw the chart
        this.$container.height(this.$el.height()).empty();
        var svg = d3.select(this.$container[0])
            .append('svg')
            .datum(this.data)
            .call(chart);

        // If not interactive (no bullets), then we should remove all the
        // unneeded elements used for hover.
        if (this.interactive === false) {
            // Remove the circles (used for interactivity)
            svg.selectAll('circle').remove();
        }

        this.svg = svg;
        this.chart = chart;
        if (!this.isPie) {
            var m = svg.selectAll('.nv-x .nv-axisMaxMin')[0];
            $(m[0]).css({transform: 'translate(45px, 0)'});
            $(m[1]).css({transform: 'translate(' + (this.$el.width() - (this.margin.left + 50)) + 'px, 0)'});
        }

        // let's find max height between the bars
        var chartHeight = this.chart.height() - this.chart.margin().top - this.chart.margin().bottom;
        var self = this;
        if (this.chartType === 'horizontalbar' && this.barHeight !== 'auto') {
            this.svg.transition()
                .duration(250)
                .each('end', function () {
                    self.svg.selectAll('.nv-bar').each(function () {
                        var bar = d3.select(this),
                            height = parseInt(self.barHeight),
                            rect = bar.select('rect'),
                            prevHeight = rect.attr('height'),
                            deltaHeight = Math.abs(prevHeight - height),
                            y = rect.attr('y') + deltaHeight / 2;

                        rect.attr('y', y)
                            .attr('height', height);
                    });
                });
        }

        if ((this.chartType === 'bar' && this.tooltipsIncludeSmallBars) || (this.chartType === 'bar')) {

            this.svg.transition()
                .duration(250)
                .each('end', function () {
                    // let's to create a new rect for each bar existing to allow a better an
                    // user experience then the user move the mouse
                    // over a bar with low result on the axis x.
                    self.svg.selectAll('.nv-bar').each(function () {
                        var bar = d3.select(this),
                            rect = bar.select('rect'),
                            width = parseInt(self.barWidth),
                            prevWidth = rect.attr('width'),
                            height = rect.attr('height'),
                            deltaWidth = Math.abs(prevWidth - width),
                            x = rect.attr('x') ? (0 + deltaWidth / 2) : (parseInt(rect.attr('x') + deltaWidth / 2));

                        if (self.barWidth === 'auto') {
                            width = prevWidth;
                        } else {
                            rect.attr('class', 'overlay-bar')
                                .attr('width', width)
                                .attr('x', x);
                        }
                        if (self.tooltipsIncludeSmallBars) {
                            bar.append('rect')
                            .attr('class', 'overlay-bar')
                            .style('fill', 'transparent')
                            .attr('width', width)
                            .attr('height', Math.abs(chartHeight - height))
                            .attr('y', height - chartHeight);
                        }


                    });
                });

        }

        return this.chart;
    },

    xTicks: function (data) {
        var w = this.$el.width() - this.margin.left - this.margin.right,
            xData = data[0].values,
            span = $('<span style="visibility: hidden;">' + this.getFormatter(this.xAxisFormat)(xData[0].x) + '</span>'),
            num,
            values;
        $('body').append(span);
        num = Math.floor(w / (span.width() + 50)) - 2;
        span.remove();
        if (num >= xData.length) {
            values = _.map(xData, function (item) {
                return item.x;
            });
        } else {
            var inc = Math.floor(xData.length / num);
            values = [xData[0].x];
            for (var i = inc; i < xData.length - 3; i += inc) {
                values.push(xData[i].x);
            }
            values.push(xData[xData.length - 1].x);
        }
        return values;
    },

    _minMaxValues: function (values) {
        var allResults  = _.flatten(_.pluck(values, 'values')),
            allYVals    = _.pluck(allResults, 'y'),
            allXVals    = _.pluck(allResults, 'x');
        return {x:
            {
                min: Math.min.apply(null, allXVals),
                max: Math.max.apply(null, allXVals)
            },
            y: {
                min: Math.min.apply(null, allYVals),
                max: Math.max.apply(null, allYVals)
            }
        };
    },
    generateColor: function (rgb, opacity) {
        return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (Math.round(opacity * 100) / 100) + ')';
    },
    /** Generates a color array based on the data sections */
    generateColors: function () {
        var colors = [];
        var baseColor = this.colorsMap[this.baseColor];
        var opacityBase = 1;

        var length = this.data.length || 4;

        if (this.type === 'bargraph' && this.data && this.data[0].values) {
            length = this.data[0].values.length;
        } else if (this.type === 'bulletgraph' && this.data && this.data.measures) {
            length = this.data.measures.length;
        }

        if (this.options.hasAverage) {
            length = length - 1;
        }

        for (var i = 0; i < length; i++) {
            colors.push(this.generateColor(baseColor, opacityBase));
            opacityBase = opacityBase - 0.2;
        }

        if (this.options.hasAverage) {
            colors.push('#F7F7F7');
        }

        return colors;
    },

    getFormatter: function (formatter) {
        if (typeof(formatter) === 'function') {
            return formatter;
        }
        if (formatter === 'truncateText') {
            return _.bind(this[this.formatters[formatter]], this);
        }
        else {
            return this[this.formatters[formatter]];
        }
    },
    /** Default formatter, only returns the original value */
    defaultFormat: function (d) {
        return d;
    },
    /** Abbreviate Format, will format using MM, B and K */
    abbreviateFormat: function (d) {
        return Suit.Helpers.Formatters.abbreviateNumber(d);
    },
    /** Date formatter will format a timestamp into M/D/YYYY h:mm a */
    datetimeFormat: function (d) {
        return moment.unix(d).utc().format('M/D/YYYY h:mm a');
    },
    /** String formatter will truncate the text of more than 24 characters */
    truncateTextFormat: function (d) {
        return Suit.Helpers.Formatters.truncate(d, this.truncateLength);
    },
    /** Date formatter will format a timestamp into M/D/YYYY */
    dateFormat: function (d) {
        return moment.unix(d).utc().format('M/D/YYYY');
    },
    /** Thousand formatter will format numbers with thousand separator */
    thousandFormat: function (d) {
        return d3.format(',r')(d);
    },
    percentageFormat: function (d) {
        return parseFloat(d).toFixed(2) + '%';
    },
    flatPercentageFormat: function (d) {
        return parseInt(d) + '%';
    }

});

Suit.Components.registerComponent('Chart');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Confirm = Suit.Component.extend(/** @lends Suit.Components.Confirm.prototype */{
    /**
      * @class Suit.Components.Confirm
      * @classdesc Suit Component Framework Confirm Component.
      * The confirm component is a widget that is going to be used a an alternative
      * to the default promppt flow.
      *
      * @augments Suit.Component
      * @param {Object} options - Object to describe the default options
      * @param {String} options.title - Title for the confirmation dialog. Default: Confirm
      * @param {String} options.text - Text for the confirmation dialog. Default: Are you sure?
      * @param {Function} options.success - Function that is handled as success calllback.
      * param {Functoin} options.cancel - Function that is handled as cancel callback.
      * @constructs Suit.Components.Confirm
      */
    initialize: function (options) {
        this.title   = options.title || 'Confirm';
        this.text    = options.text || 'Are you sure?';
        this.color   = options.color || 'blue';

        Suit.Component.prototype.initialize.apply(this, [options]);

        // Modal
        this.modal = new Suit.Components.Modal({
            view: this,
            size: 'small',
            persistent: true
        });

        this.modal.show();
    },
    /** Template to use for the view */
    template: JST['suit/components/confirm'],
    /** Confirm button events */
    events: {
        'click button.yes': 'defaultSuccess',
        'click .no': 'defaultCancel'
    },
    /** Default success handler. Is a wrapper for success call */
    defaultSuccess: function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.options.success && _.isFunction(this.options.success)) {
            this.options.success.call(this);
        }
        this.modal.close();
    },
    /** Default cancel handler. Is a wrapper for cancel call */
    defaultCancel: function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.options.cancel && _.isFunction(this.options.cancel)) {
            this.options.cancel.call(this);
        }
        this.modal.close();
    }
});

// Register component.
Suit.Components.registerComponent('Confirm');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}
Suit.Components.DatePicker = Suit.Component.extend(/** @lends Suit.Components.DatePicker.prototype */{
    /**
      * @class Suit.Components.DatePicker
      * @classdesc This is the Suit framework datepicker. It is based on the pikaday javascript library.
      *
      * @augments Suit.Components
      * @constructs Suit.Components.DatePicker
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        var self = this;
        // Attributes that come from the view element
        var args = {
            defaultDate: this.$el.data('dp-default-date'),
            setDefaultDate: this.$el.data('dp-set-default-date'),
            firstDay: this.$el.data('dp-first-day'),
            minDate: this.$el.data('dp-min-date'),
            maxDate: this.$el.data('dp-max-date')
        };

        // Clean the values which are falsy
        args = _(args).reduce(function (obj, v, k) {
            if (v) {
                obj[k] = v;
            }
            return obj;
        }, {});

        // Custom attribuets assigned on our end
        var defaultValues = {
            // Input field
            field: this.$el.find('input')[0],
            // Date Foramt
            format: 'MM/DD/YYYY',
            // Wrapper for onSelect function
            onSelect: function () {
                // trigger onSelect event
                self.trigger('selected');
            },
            // Wrapper for the open picker
            onOpen: function () {
                self.openPicker(self);
            },
            // Wrapper for the close picker
            onClose: function () {
                self.closePicker(self);
            },
            // i18n attributes used in order to override the next/back buttons
            // and the months abbreviatiobs (both to support the expected behaviour
            // described on the design.
            i18n: {
                previousMonth : '<',
                nextMonth     : '>',
                months        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                weekdays      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                weekdaysShort : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            }
        };

        // Extend the Pikaday component using a mix between our default attributes
        // and the values received from the the view
        _.extend(args, defaultValues);
        this.picker = new Pikaday(args);

        // Put styles to the calendar modal, based on the style that is being used
        // on the component initialization.
        var color = this.$el.attr('class').split(' ')[1] || 'blue';
        $(this.picker.el).addClass(color);

        // Setting disabled, if it is
        if (this.$el.hasClass('disabled')) {
            color = 'blue';
            this.$el.find('a').addClass('disabled');
            this.$el.find('input').attr('disabled', 'disabled');
        }
    },
    /** Events that this view responds to */
    events: {
        'click .date-picker-trigger': 'showPicker'
    },
    openPicker: function (self) {
        self.$el.addClass('active');
    },
    closePicker: function (self) {
        self.$el.removeClass('active');
    },
    showPicker: function (event) {
        event.preventDefault();

        if (!$(event.currentTarget).hasClass('disabled')) {
            this.picker.show();
        }
    },
    beforeClose: function () {
        var el = $(this.picker.el);
        el.unbind();
        el.remove();
    }
});

// Register component.
Suit.Components.registerComponent('DatePicker');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}
Suit.Components.DateRange = Suit.Component.extend(/** @lends Suit.Components.DateRange.prototype */{
    /**
      * @class Suit.Components.DateRange
      * @classdesc This is the Suit framework date range.
      *
      * @augments Suit.Components
      * @constructs Suit.Components.DateRange
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);

        // Reference
        var self = this;

        // Sequencial range (end date starts based on start date)
        this.sequencial = this.$el.data('dr-sequencial') || false;

        // Storing references for pickers (start and end dates)
        this.startPicker = this.$el.find('.date-picker-start').data('view');
        this.endPicker   = this.$el.find('.date-picker-end').data('view');

        // Once the start date is selected, jump to end date
        this.listenTo(this.startPicker, 'selected', function () {
            // If we execute it immediately a glitch occured (because it's listening
            // to the blur of the first date picker), and it closed the second one.
            _.defer(function () {
                self.selectedStart();
                self.trigger('change:start');
                self.$el.trigger('change:start');
            });
        });

        this.listenTo(this.endPicker, 'selected', function () {
            self.find('select').val('custom');
            self.trigger('change:end');
            self.$el.trigger('change:end');
        });

    },
    /** Events */
    events: {
        'change select': 'predefinedSelected'
    },

    /** Selects the end date based on the start date (is sequencial) and focuses
      * on end date. */
    selectedStart: function () {
        // If this date range is sequencial (selected `start date` is min date of `end date`)
        if (this.sequencial && this.startPicker && this.startPicker.find) {
            this.endPicker.picker.setMinDate(new Date(this.startPicker.find('input').val()));
        }

        this.endPicker.find('input').focus();
        this.find('select').val('custom');
        this.trigger('change');
        this.$el.trigger('change');

    },
    /** If a predefined value is selected (from the select), then we have to trigger
      * or change the picker values. */
    predefinedSelected: function (event) {
        event.preventDefault();
        var value = $(event.target).val();

        if (value !== 'all') {
            this.startPicker.find('input').attr('placeholder', 'yyyy/mm/dd');
        }

        switch (value) {
            case 'custom':
                this.startPicker.find('input').val('').focus();
                this.endPicker.find('input').val('');
                break;
            case 'today':
                this.startPicker.picker.setMoment(moment(), true);
                this.endPicker.picker.setMoment(moment(), true);
                break;
            case 'last_7_days':
                this.startPicker.picker.setMoment(moment().subtract(7, 'days'), true);
                this.endPicker.picker.setMoment(moment(), true);
                break;
            case 'this_month':
                this.startPicker.picker.setMoment(moment().date(1), true);
                this.endPicker.picker.setMoment(moment(), true);
                break;
            case 'this_quarter':
                this.startPicker.picker.setMoment(moment().startOf('quarter'), true);
                this.endPicker.picker.setMoment(moment(), true);
                break;
            case 'all':
                this.startPicker.find('input').val('').attr('placeholder', 'Before').change();
                this.endPicker.picker.setMoment(moment(), true);
                break;
        }
        this.trigger('change:range');
        this.$el.trigger('change:range');
        // Trigger the change event manually;
        this.trigger('change');
        this.$el.trigger('change');
    }
});

// Register component.
Suit.Components.registerComponent('DateRange');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Modal = Suit.Component.extend(/** @lends Suit.Components.Modal.prototype */{
    /**
      * @class Suit.Components.Modal
      * @classdesc It creates a new Modal to show on the screen.<br />
      * The options support the following:<br />
      * view: View to render inside the modal.<br />
      * size: [small/large], if left empty it will render de default size.<br />
      * persistent: [true/false], if the modal cannot be closed by clicking outside. Default: false.
      * @augments Suit.Component
      * @param {object} options Includes the View and the size of the modal.
      * @constructs Suit.Components.Modal
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);

        // Default size is no size.
        this.size = '';

        // Default modal persistent.
        this.persistent = false;

        if (!_.isUndefined(options)) {
            if (!_.isUndefined(options.view)) {
                this.appendView(options.view);
            }
            if (!_.isUndefined(options.size) && (options.size === 'large' || options.size === 'small')) {
                this.$el.addClass(options.size);
            }
            if (!_.isUndefined(options.persistent)) {
                this.persistent = options.persistent;
            }
        }
        // Create this modals, overlay.
        this.overlay = $('<div class="suit-modal-overlay"></div>');
        // Attach and event to the overlay to close the modal.
        var self = this;

        if (this.persistent === false) {
            this.overlay.bind('click', function (event) {
                if (event.target === this) {
                    self.close();
                }
            });
        }
        // Listen to the onClose event and close the overlay and unblur the screen.
        this.listenTo(this, 'beforeClose', this.resetView);

        // Add modal to currentModals array.
        Suit.Components.Modal.currentModals.push(this);
        Suit.Components.Modal.currentModals = _.uniq(Suit.Components.Modal.currentModals);

        // Show your modal on initialize.
        this.show();
    },
    /** Modal template will be empty */
    template: function () { return ''; },
    /** Modal class is 'suit-modal' */
    className: 'suit-modal',
    /** Modal events */
    events: {
        'click .close': 'closeModal'
    },
    /** Prevent all defaults and close this modal */
    closeModal: function (event) {
        event.preventDefault();
        this.close();
    },
    /** Appends the overlay and modal to the body while setting the proper z-indexes and removing the scrolling capabilities from the body */
    show: function () {
        //var self = this;
        var el = this.$el;
        // Set the z-indexes.
        var zIndex = 1000 + $('.suit-modal').length * 2;
        this.overlay.css('z-index', zIndex);
        zIndex++;
        el.css('z-index', zIndex);
        // Add blur to the main view.
        //App.mainView.$el.addClass('blur');
        // Remove scrolling from the body.
        $('body').css('overflow', 'hidden');
        $('body').append(this.overlay);
        el.hide();
        this.overlay.append(this.el);

        // show, align and hide the modal so no one knows, shhhh!!!!
        //el.show();
        //var overlayHeight = self.overlay.height();
        //var height = el.height();
        //var top = -(height / 2);
        //if (height > overlayHeight - 30) {
        //    top = -(overlayHeight / 2) + 60;
        //}
        //el.css('margin-top', top + 'px');
        //el.hide();

        el.fadeIn(200);
    },
    /** It resets the view to it's original state by removing the blur on the main view and restoring the scroll on the body. */
    resetView: function () {
        // Remove this modal from currentModals Array.
        Suit.Components.Modal.currentModals.splice(Suit.Components.Modal.currentModals.indexOf(this), 1);
        // Restore scrolling to the body.
        $('body').css('overflow', 'auto');
        this.overlay.unbind('click');
        this.overlay.remove();
        // Remove blur from main view.
        App.mainView.$el.removeClass('blur');
    }
    // modal sizes and pop up type.
});

Suit.Components.Modal.currentModals = [];
Suit.Components.Modal.closeAll = function () {
    _.each(Suit.Components.Modal.currentModals, function (modal) {
        modal.close();
    });
};

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.MultiSelect = Suit.Component.extend(/** @lends Suit.Components.MultiSelect.prototype */{
    /**
    * @class Suit.Components.MultiSelect
      * @classdesc Suit component framework for multi select checkbox
        Usage: 1) Type in the terminal-> yo suit:component <press enter>
               2) Go to Multi Select Template and press space bar
               3) Write the path of your view, example: users/form
               4) It should insert the template into your view's jst template file.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.MultiSelect
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        var cid = this.cid;

        //if user clicks somewhere outside the view it should close the multi select
        $(document).on('click.' + cid, function (event) {
            if (!_.isUndefined(event.target.className)) {
                if (event.target.className !== 'multi-select-counter-row' && event.target.className !== 'ms-checkbox') {
                    $('.multi-select-options').hide();
                }
            }
        });

        this.on('onClose', function () {
            $(document).off('click.' + cid);
        });
    },
    /* events to open close box and calculate total selected*/
    events: {
        'click input[type="checkbox"]': 'updateCounter',
        'click .multi-select-counter-row': 'toggleOptions',
        'click .icon': 'toggleOptions'
    },
    /* Open or close the checkboxes box */
    toggleOptions: function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var el = this.$el;
        if (!el.attr('disabled')) {
            el.find('.multi-select-options').toggle();
        }
    },
    /* update total counter of the amount of selected checkboxes. */
    updateCounter: function () {
        var el = this.$el;
        var length = el.find('input:checkbox:checked').length;
        el.find('.multi-select-counter').html(length);
    }
});

// Register component.
Suit.Components.registerComponent('MultiSelect');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Slider = Suit.Component.extend(/** @lends Suit.Components.Slider.prototype */{
    /**
      * @class Suit.Components.Slider
      * @classdesc Suit component framework slider component.
      *
      * <p>Attributes to be set in mark-up</p>
      * <p>It takes the same attributes as the DragDealer plugin as data attributes:</p>
      * <p>
            data-disabled = false<br/>
            data-horizontal = true<br/>
            data-vertical = false<br/>
            data-x = 0<br/>
            data-y = 0<br/>
            data-steps = 0<br/>
            data-snap = false<br/>
            data-slide = true<br/>
            data-loose = false<br/>
            data-top = 0<br/>
            data-bottom = 0<br/>
            data-left = 0<br/>
            data-right = 0<br/>
            data-handleClass = 'handle'
        </p>
        <p>
            There are two events triggered by this component at the component level.
            <br/>
            slide (x, y): Called every animation loop, as long as the handle is being dragged or in the process of a sliding animation. The x, y positional values received by this callback reflect the exact position of the handle DOM element, which includes exceeding values (even negative values) when the loose option is set true.
            <br/>
            change (x, y): Called when releasing handle, with the projected x, y position of the handle. Projected value means the value the slider will have after finishing a sliding animation, caused by either a step restriction or drag motion (see steps and slide options.)
        </p>
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Slider
      */
    initialize: function () {
        Suit.Component.prototype.initialize.apply(this, this.options);
        // Let's initialize all components and hook up all the events.
        var el = this.$el;

        // We need to set the id for the slider to use.
        el.attr('id', this.cid);

        var args = {
            disabled: el.attr('data-disabled') || false,
            horizontal: el.attr('data-horizontal') || true,
            vertical: el.attr('data-vertical') || false,
            x: el.attr('data-x') || 0,
            y: el.attr('data-y') || 0,
            steps: el.attr('data-steps') || 0,
            snap: el.attr('data-snap') || false,
            slide: el.attr('data-slide') || true,
            loose: el.attr('data-loose') || false,
            top: el.attr('data-top') || 0,
            bottom: el.attr('data-bottom') || 0,
            left: el.attr('data-left') || 0,
            right: el.attr('data-right') || 0,
            callback: this.callback,
            animationCallback: this.animationCallback,
            handleClass: el.attr('data-handleClass') || 'handle'
        };
        this.slider = new Dragdealer(this.cid, args);
    },

    callback: function (x, y) {
        var view = $(this.wrapper).data('view');
        view.trigger('change', x, y);
    },
    animationCallback: function (x, y) {
        var view = $(this.wrapper).data('view');
        view.trigger('slide', x, y);
    }
});

// Register component.
Suit.Components.registerComponent('Slider');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.SuitTab = Suit.Component.extend(/** @lends Suit.Components.SuitTab.prototype */{
    /**
      * @class Suit.Components.SuitTab
      * @classdesc Suit component framework tabbing component.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.SuitTab
      */
    initialize: function () {
        Suit.Component.prototype.initialize.apply(this, this.options);
    },
    /** Tab events */
    events: {
        'click .suit-tab-link': 'switchTab'
    },
    /** Switches the tab using the currently clicked tab event */
    switchTab: function (event) {
        this.$el.find('.suit-tab-link').removeClass('active');
        $(event.currentTarget).addClass('active');
    }
});

// Register component.
Suit.Components.registerComponent('SuitTab');

'use strict';

Suit.Components = Suit.Components || {};

Suit.Components.Table = Suit.Component.extend(/** @lends Suit.Components.Table.prototype */{
    /**
      * @class Suit.Components.Table
      * @classdesc Suit Component Framework Table Component.
      *
      * This component is meant to be used along with tabular data. The data will
      * be handled from the collection (which is passed as a keypath to the
      * component element's data-table-collection attribute).
      *
      * The Table Component will provide with sorting functionalities (linked to
      * collection's default sorting functionality). If the user trigger a collection
      * sort change, the Table Component will interact with the changes.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Table
      */

    events: {
        'click th a.sortable': '_sortTable',
    },

    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        this.$thead = this.find('thead').first();
        this.$tbody = this.find('tbody').first();
        var keypath = (this.collection instanceof Suit.Collection) ? 'collection.models' : false;
        if (keypath === false) {
            throw (new Error('data-collection must be an instance of Suit.Collection'));
        }
        this.$tbody.find('tr').first().attr('suit-each-row', keypath);
        this.listenTo(this.collection, 'sort', this._updateHeaders);
        this.listenTo(this.collection, 'add remove', this._updateValidations);
        this.listenTo(this.collection, 'sync', this._adjustHeaderSize);
        if (_.has(this.options, 'infiniteScroll')) {
            this._setupInfiniteScroll();
        }
    },

    beforeClose: function () {
        if (_.has(this.options, 'infiniteScroll')) {
            this._teardownInfiniteScroll();
        }
    },

    afterRender: function () {
        if (_.has(this.options, 'infiniteScroll')) {
            this._adjustHeaderSize();
        }
        this.collection.sort();
    },

    // PRIVATE METHODS

    /* Callback from collection "sort" event.  It updates the the thead > th's to reflect current sort-by/sort-order */
    _updateHeaders: function () {
        var self = this,
            $ele;
        _.each(this.find('th a.sortable'), function (element) {
            $ele = $(element);
            if (self.collection.sortBy === $ele.attr('data-sort-by')) {
                $ele.addClass('active ' + self.collection.sortOrder);
            } else {
                $ele.data('current-sort-order', false);
                $ele.removeClass('active asc desc');
            }
        });
    },

    /* Callback from collection "add" and "remove" event. Makes sure to revalidate all models, to make sure each validation is assigned to the correct one */
    _updateValidations: function () {
        this.collection.each(function (model) {
            model.validate();
        });
    },

    /* Set's up infinite scroll on table. Wraps table, sets up listeners, etc. */
    _setupInfiniteScroll: function () {
        this.enableInfiniteScroll = true;
        this._fetchingNextPage = false;
        var $table,
            infiniteScrollWrapper = $('<div class="infinite-scroll"><div class="infinite-scroll-container"></div></div>');

        infiniteScrollWrapper.css({position: 'relative'}).find('.infinite-scroll-container').css({'overflow-y': 'scroll'});

        if (_.has(this.options, 'stickyHeaders')) {
            this._stickyHeaders = true;
        }

        if (this.$el.attr('height')) {
            this.options.heightRestricted = true;
            infiniteScrollWrapper.find('.infinite-scroll-container').css({height: this.$el.attr('height')});
        }

        this.$el.wrap(infiniteScrollWrapper);

        $table = $('<table/>');
        $table.addClass(this.$el.attr('class'));

        this.$newThead = this.$thead.clone();
        this.$el.closest('.infinite-scroll').prepend(this.$newThead);
        this.$newThead.wrap($table);

        this.$thead.find('a.sortable').removeClass('sortable');

        this.$thead.css('visibility', 'hidden');
        this.$thead.find('th').css({'line-height': '0px', 'height': '0px', 'border': '0px'});

        this.$scrollingView = this.$el.closest('.infinite-scroll-container');
        this.$loader = $('<div class="infinite-scroll-loader"/>').css({position: 'relative', height: 100});
        this.$scrollingView.append(this.$loader);
        this.$loader.hide();
        this.el = this.$el.closest('.infinite-scroll')[0];
        this.$el = $(this.el);

        if (this.options.heightRestricted) {
            this.$scrollingView.on('scroll', _.bind(this._scrollViewScrolled, this));
        } else {
            this.__windowScrolled =  _.bind(this._windowScrolled, this);
            this.$window = $(window);
            this.$window.on('scroll', this.__windowScrolled);
        }
    },

    /* Removes call backs, options and variables for infinite scrolling. */
    _teardownInfiniteScroll: function () {
        this.$newThead.find('a.sortable').off('click');
        if (this.options.heightRestricted) {
            this.$scrollingView.off('scroll');
        } else {
            this.$window.off('scroll', this.__windowScrolled);
        }
    },

    _adjustHeaderSize: function () {
        if (!this.$newThead || this.$newThead.length < 1) {
            return;
        }
        var children = this.$newThead.find('tr').first().children(),
            $th, w;
        this.$thead.find('tr').first().children().each(function (index, th) {
            $th = $(th);
            w = $th.width();
            if (w > 0) {
                children.eq(index).width(w);
            }
        });
    },

    /* Hides loader that was shows during a table:next event */
    _removeInfiniteLoader: function () {
        var loader = this.$el.find('.infinite-scroll-loader');
        this.parent.removeLoader(loader);
        loader.hide();
        this._fetchingNextPage = false;
    },

    /* Bound to th a.sortable links, sorts collection if non-infinite scroll based, otherwise triggers a table:sort event */
    _sortTable: function (event) {
        event.preventDefault();
        var href,
            url,
            $target = $(event.target),
            sortOrder = $target.data('default-sort'),
            sortBy = $target.data('sort-by');

        if ($target.data('current-sort-order') === 'asc') {
            sortOrder = 'desc';
        } else if ($target.data('current-sort-order') === 'desc') {
            sortOrder = 'asc';
        }
        $target.data('current-sort-order', sortOrder);

        $target.removeClass('active asc desc');
        $target.addClass('active ' + sortOrder);

        this.collection.sortBy    = sortBy;
        this.collection.sortOrder = sortOrder;
        if (_.has(this.options, 'infiniteScroll')) {
            this.trigger('table:sort', this.collection);
        } else {
            this.collection.sort();
        }
        href = $target.attr('href');
        url = href.indexOf('?') === -1 ? href + '?' : href;
        url += $.param({ sortBy: sortBy, sortOrder: sortOrder });
        Backbone.history.navigate(url);
    },

    /* Bound to window scroll event, checks if bottom of the table has come into view, if so, calls _next */
    _windowScrolled: function (event) {
        if (this._stickyHeaders) {
            this._stickHeaders();
        }
        if (this._fetchingNextPage || !this.enableInfiniteScroll) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        var offset = ((this.$el.height() + this.$el.offset().top) - this.$window.height()) - 100;
        if (this.$window.scrollTop() >= offset && this._fetchingNextPage === false) {
            event.preventDefault();
            this._next();
        }
    },

    /* For window based infinite scroll tables, sticks headers if they have reached the top of the page on scrolling. Called from _windowScrolled */
    _stickHeaders: function () {
        var table = this.$newThead.closest('table'),
            scrollTop = this.$window.scrollTop(),
            thOffset = this.$newThead.offset().top,
            infiniteScrollContainer = this.$el.find('.infinite-scroll-container');
        if (scrollTop > thOffset && !table.data('isStuck')) {
            table.data('isStuck', true);
            table.data('startingOffset', thOffset);
            table.css({position: 'fixed', 'z-index': 50, width: table.width(), top: 0});
            infiniteScrollContainer.css({'margin-top': this.$newThead.height()});
        } else if (table.data('isStuck') === true && scrollTop < table.data('startingOffset')) {
            table.data('isStuck', false);
            table.data('startingOffset', false);
            table.css({position: 'static'});
            infiniteScrollContainer.css({'margin-top': 0});
        }
    },

    /* Bound to overflow container scroll event, checks if bottom of the content has come into view, if so, calls _next */
    _scrollViewScrolled: function (event) {
        if (this._fetchingNextPage || !this.enableInfiniteScroll) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        var offset = (this.$scrollingView[0].scrollHeight - this.$scrollingView.height());
        if (this.$scrollingView.scrollTop() === offset && this._fetchingNextPage === false) {
            event.preventDefault();
            this._next();
        }
    },

    /* Called when bottom of infinite scroll based table comes into view, adds a loader and fires a table:next event*/
    _next: function () {
        var loader = this.$el.find('.infinite-scroll-loader');
        this._fetchingNextPage = true;
        loader.show();
        this.parent.loader({selector: loader, loaderSize: 'small', tone: 'light'});
        this.trigger('table:next', this.collection, _.bind(this._removeInfiniteLoader, this));
    }
});

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.TimePicker = Suit.Component.extend(/** @lends Suit.Components.TimePicker.prototype */{
    /**
      * @class Suit.Components.TimePicker
      * @classdesc This is the Suit framework time picker.
      *
      * @augments Suit.Components
      * @constructs Suit.Components.TimePicker
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);

        // Get the component color
        var color = this.$el.attr('class').split(' ')[1] || 'blue';

        if (this.$el.hasClass('disabled')) {
            color = 'blue';
            this.$el.find('a').addClass('disabled');
            this.$el.find('input').attr('disabled', 'disabled');
        }

        // Initialize the jQuery plugin
        this.$el.find('input').timepicker({
            // Adding default color
            className: color,
            // Time format like 00:00 AM
            timeFormat: 'h:i A',
            // Adding support to 11:59pm, by using the noneOption, available
            // on the plugin.
            noneOption: [
                {
                    label: '11:59 PM',
                    value: '11:59 PM'
                }
            ],
        });

        // Set reference to the picker, for further use
        this.picker = this.$el.find('input');
    },
    /** Events that this view responds to */
    events: {
        'click .time-picker-trigger': 'showPicker',
        'showTimepicker input': 'toggleActive',
        'hideTimepicker input': 'toggleActive',
        'timeFormatError input': 'invalidTime'
    },
    showPicker: function (event) {
        event.preventDefault();

        if (!$(event.currentTarget).hasClass('disabled')) {
            this.$el.find('input').timepicker('show');
        }
    },
    toggleActive: function () {
        // Method to actually move the first element (noneOption) to the bottom
        // of the list.
        if (!this.noneAtBottom) {
            var first = $('body ul.ui-timepicker-list').children(':first-child');
            $('body ul.ui-timepicker-list').append(first);
            this.noneAtBottom = true;
        }
        this.$el.toggleClass('active');
    },
    invalidTime: function () {
        // If invalid, we clear the value
        this.picker.timepicker('setTime');
    }
});

// Register component.
Suit.Components.registerComponent('TimePicker');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.ToggleButton = Suit.Component.extend(/** @lends Suit.Components.ToggleButton.prototype */{
    /**
      * @class Suit.Components.ToggleButton
      * @classdesc Suit component framework toggle button component.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.ToggleButton
      */
    initialize: function () {
        Suit.Component.prototype.initialize.apply(this, this.options);
    },
    /** Toggle events */
    events: {
        'click': 'toggle'
    },
    /** Switches the toggle state of the button and triggers the toggle event with the state (true/on and false/off) as the only parameter */
    toggle: function () {
        var el = this.$el;
        el.toggleClass('active');
        el.trigger('toggled', el.hasClass('active'));
        this.trigger('toggled', el.hasClass('active'));
    }
});

// Register component.
Suit.Components.registerComponent('ToggleButton');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Typeahead = Suit.Component.extend(/** @lends Suit.Components.Typeahead.prototype */{
    /**
      * @class Suit.Components.Typeahead
      * @classdesc Suit component framework Typeahead component.
      *
      * <p>Attributes to be set in mark-up</p>
      * <p>It takes the same attributes as the DragDealer plugin as data attributes:</p>
      * <p>
           class = 'typeahead', typehead class <BR/>
           data-url = someUrl.com, url of the api that respondes with the values<BR/>
           data-param = 'youQueryParameter', parameter your domain is going to receive to query<BR/>
           data-limit = 10, limit of answers returned by the server.  <BR/>
           data-key = 'label', key in json object to look for  <BR/>

        </p>
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Typeahead
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        // Let's initialize all components and hook up all the events.
        var el = this.$el;
        var url = el.data('url');
        var dataKey =  el.data('key') || 'label';
        var dataLimit = el.data('limit') || 10;
        var dataDisableEnter = el.data('disable-enter') || false;
        var filterLang = el.data('filter-lang') || false;
        var globalFilters = el.data('global-filters') ? _.map(el.data('global-filters').split(','), function (n) { return +n; }) : [];
        var local = this.options.local || undefined;
        var self = this;

        //query parameter
        if (el.data('param')) {
            var queryString = el.data('param') + '=%QUERY', //%QUERY is used to replace the value of the query.
            urlArray = url.split('?');
            url = urlArray[0];
            if (urlArray[1]) {
                queryString += '&' + urlArray[1];
            }
            url = url + '?' + queryString;
        }

        //server return limit.
        if (dataLimit) {
            url = url + '&' + 'limit' + '=' + dataLimit;
        }
        // We need to set the id for the Typeahead to use.
        el.attr('id', this.cid);

        //start the engine
        this.engine = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace(dataKey),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: url,
                filter: function (parsedResponse) {
                    // Only if we have to filter the languages, we have to remove them
                    if (filterLang) {
                        parsedResponse = _.reject(parsedResponse, function (item) {
                            return _.contains(App.Models.Label.languageArray, item.id);
                        });
                    }
                    if (globalFilters) {
                        parsedResponse = _.reject(parsedResponse, function (item) {
                            return _.contains(globalFilters, item.id);
                        });
                    }

                    if (!_.isUndefined(self.transformData)) {
                        self.transformData(parsedResponse);
                    }

                    return parsedResponse;
                }
            },
            local: local,
            limit: dataLimit,
            rateLimitWait: 100
        });

        this.engine.initialize();

        //start the typeahead
        $('#' + this.cid).typeahead(null, {
            name: 'name',
            displayKey: dataKey,
            source: self.engine.ttAdapter()
        });


        $('#' + this.cid).keypress(function (e) {
            if (e.which === 13) {// enter
                // var tab = $.Event('keydown');
                // tab.keyCode = tab.which = 9; // 9 == tab
                if (dataDisableEnter && !_.isEmpty($(this).val())) {
                    return false;
                } else {
                    $(this).trigger('typeahead:selected');
                }
            }
        });
    }
});

// Register component.
Suit.Components.registerComponent('Typeahead');

'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Video = Suit.Component.extend(/** @lends Suit.Components.Video.prototype */{
    /**
      * @class Suit.Components.Video
      * @classdesc Suit component framework video component.
      *
      * <p>Attributes to be set in mark-up</p>
      * <p>It takes the same attributes as the VideoJS plugin as data attributes:</p>
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Video
      */
    initialize: function () {
        Suit.Component.prototype.initialize.apply(this, this.options);
        // Let's initialize all components and hook up all the events.
        var self = this;
        var el = this.$el;

        // We need to set the id for the slider to use.
        el.attr('id', this.cid);

        var video = document.getElementById(this.cid);
        if (video) {
            this.video = videojs(video, {
                'controls': true,
                'autoplay': false,
                'preload': 'auto',
                'techOrder': ['html5', 'flash']
            });
        }

        // Keep track if we disposed it because this is done for each tech.
        this.isDisposed = false;
        this.listenTo(this, 'onClose', function () {
            if (self.video && !self.isDisposed) {
                self.video.dispose();
                self.isDisposed = true;
            }
        });
    }
});

// Update the flash player location.
videojs.options.flash.swf = 'bower_components/videojs/dist/video-js/video-js.swf';

// Register component.
Suit.Components.registerComponent('Video');

'use strict';
Suit.Components = Suit.Components || {};
Suit.Components.Binders = Suit.Components.Binders || {};

Suit.Components.Binders.view = {
    block: true,
    bind: function (el) {
        var $el = $(el),
            Root = App.Views,
            data = $el.data(),
            view = data.name,
            self = this,
            attr;

        if (!_.isUndefined(Root) && !_.isUndefined(view)) {
            _.each(view.split('.'), function (child) {
                Root = Root[child];
            });
        }

        if (_.isUndefined(Root)) { throw view + ' does not exist.'; }

        attr = {el: el};
        _.each(data, function (value, key) {
            var keypath = value.split(':'),
                rootModel = self.view.models[keypath.shift()],
                model = rootModel;
            if (rootModel && keypath.length > 0) {
                model = self.view.adapters[':'].read(rootModel, keypath.join(':'));
            }
            attr[_.str.camelize(_.str.underscored(key))] = model || value;
        });

        // We need to render after it binds.
        _.defer(function () {
            $el.removeAttr('suit-view');
            self.$view = new Root(attr);
            self.$view.setParent(self.view.models);
            self.$view.render();
        });
    },

    unbind: function () {
        if (this.$view) {
            this.$view.close();
        }
    },

    routine: function () {
    }
};

_.extend(window.rivets.binders, Suit.Components.Binders);

(function (rivets) {
    'use strict';

    rivets.configure({
        prefix: 'suit',
        handler: function (target, event, binding) {
            if (binding.model instanceof Suit.Model) {
                return this.apply(binding.model, []);
            }
            var $target = $(target),
                val = $target.val(),
                args = [event, target];
            if ($target.is(':input')) {
                var code = event.charCode || event.keyCode;
                val += (event.type === 'keypress') ?  String.fromCharCode(code) : '';
                args.unshift(val);
            }
            this.apply(binding.model, args);
        }
    });

})(window.rivets);

(function (root, factory) {
    'use strict';
    factory(root.rivets, root.Backbone);
})
(this, function (rivets) {
    'use strict';

    var Model = Suit.Model,
        Collection = Suit.Collection;

    /**
     * Resolves path chain
     *
     * for a, 'b:c:d' returns {model: a:b:c, key:'d'}
     *
     * @param {Model}  model
     * @param {String} keypath
     *
     * @returns {{model: Model, key: String}}
     */
    function getKeyPathRoot(model, keypath) {
        keypath = keypath.split(':');

        while (keypath.length > 1) {
            model = model.get(keypath.shift());
        }

        var key = keypath.shift();

        if (key.indexOf('.') > 0) {
            key = key.split('.');
            if (key.length > 2) {
                throw (new Error('Cannot access properties of object on relation with "."'));
            }
            model = model.get(key[0]);
            key = key[1];
        }



        return {
            model: model,
            key: key
        };
    }



    /**
     *
     * Sets an attribute value to 'value' or calls that method with 'value'
     *
     * @param {Model|Collection}  obj
     * @param {String} key
     * @param {*}      value
     *
     * @returns {*} value
     */
    function setOrCall(obj, key, value) {
        if (_.isFunction(obj[key])) {
            return obj[key](value);
        } else {
            obj[key] = value;
            return value;
        }
    }

    /**
     * @param {Model|Collection}  obj
     * @param {String} keypath
     * @param {*}      [value]
     *
     * @returns {*}
     */
    function getterSetter(obj, keypath, value) {
        var root = getKeyPathRoot(obj, keypath);
        obj = root.model;


        if (arguments.length === 2) {
            if (!(obj instanceof Model)) {
                return _.result(obj, root.key);
            }
            return obj.get(root.key);
        }

        if (!(obj instanceof Model)) {
            return setOrCall(obj, root.key, value);
        }

        return obj.set(root.key, value);
    }

    /**
     * @param {String} action on or off
     * @returns {Function}
     */
    function onOffFactory(action) {

        /**
         * @param {Model|Collection}    obj
         * @param {String}   keypath
         * @param {Function} callback
         */
        return function (obj, keypath, callback) {
            if (!(obj instanceof Model)) {
                obj[action]('add remove reset', callback);
                return;
            }

            var root = getKeyPathRoot(obj, keypath),
                collection = root.model.get(root.key);

            if (collection instanceof Collection) {
                collection[action]('add remove reset', callback);
            } else {
                root.model[action]('change:' + root.key, callback);
            }
        };
    }

    /**
     * @param {Model|Collection} obj
     * @param {String}           keypath
     * @returns {*}
     */
    function read(obj, keypath) {
        if (obj instanceof Collection) {
            return _.result(obj, keypath);
        }

        var value = getterSetter(obj, keypath);

        // rivets cant iterate over Backbone.Collection -> return Array
        // if (value instanceof Collection) {
        //     return value.models;
        // }

        return value;
    }

    /**
     * @param {Model|Collection} obj
     * @param {String}           keypath
     * @param {*}                value
     */
    function publish(obj, keypath, value) {
        if (obj instanceof Collection) {
            return setOrCall(obj, keypath, value);
        } else {
            return getterSetter(obj, keypath, value);
        }
    }

    // Configure rivets data-bind for Backbone.js
    rivets.adapters[':'] =  {
        subscribe: onOffFactory('on'),
        unsubscribe: onOffFactory('off'),
        read: read,
        publish: publish
    };
});
(function () {
    'use strict';
    _.extend(window.rivets.formatters, _.clone(Suit.Helpers.Formatters));
})();
'use strict';
(function (rivets) {

    var binders = {

        'class-*-unless': function (el, value) {
            return (!Boolean(value)) ? $(el).addClass(this.args[0]) : $(el).removeClass(this.args[0]);
        },


        'tooltip': {
            bind: function (el) {
                var currentTarget = $(el);

                var message = this.keypath;
                var color = currentTarget.data('color');
                var tooltip = $('#suit-tooltip');

                if (tooltip.length === 0) {
                    tooltip = $('<div id="suit-tooltip" class="tooltip ' + color + '"><div class="tooltip-content">' +  message + '</div><div class="tooltip-arrow"></div></div>');
                    $('body').append(tooltip);
                }

                this.callback = function () {
                    tooltip.attr('class', 'tooltip ' + color);
                    tooltip.children('.tooltip-content').text(message);
                    tooltip.css({
                        top: currentTarget.offset().top - tooltip.height() - 12,
                        left: currentTarget.offset().left - 10,
                        'max-width': '250px'
                    }).show();
                };
                this.hideCallback = function () {
                    tooltip.hide();
                };
                currentTarget.on('mouseover', this.callback);
                currentTarget.on('mouseout', this.hideCallback);
            },
            unbind: function (el) {
                var currentTarget = $(el);
                currentTarget.off('mouseover', this.callback);
                currentTarget.off('mouseout', this.hideCallback);
            }
        }

    };
    _.extend(rivets.binders, binders);

})(window.rivets);

'use strict';

Suit = Suit || {};
Suit.appStart = function () {
    // Prepare the body.
    $('body').prepend(App.mainView.render().el);

    // Start routes.
    App.mainRouter = new App.Routers.Main();
    _.each(App.Routers, function (value, key) {
        new App.Routers[key]();
    });
    Backbone.history.start({pushState: false});
};

// Start application.
if (_.isUndefined(window.jasmine)) {
    $(function () {
        Suit.appStart();
    });
}
