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
    toCamelCaseObject: function (response) {
        var self = this;
        if (_.isArray(response) && _.isObject(response) && response.length > 0 && _.isObject(response[0])) {
            _.each(response, function (object, index) {
                response[index] = self.toCamelCaseObject.apply(self, [object]);
            });
        } else if (_.isObject(response) && !_.isArray(response)) {
            _.each(_.keys(response), function (key) {
                var value = response[key];
                var newKey = _.str.camelize(key);
                delete response[key];
                // We need to parse all objects recursive.
                if (_.isObject(value)) {
                    response[newKey] = self.toCamelCaseObject.apply(self, [value]);
                } else {
                    response[newKey] = value;
                }
            });
        }
        return response;
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
        if (!_.isUndefined(num) && num !== null) {
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
        backBoneSync(method, model, options);
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
        if (!this.localStorage || _.isUndefined(this.className)) {
            return;
        }
        var key = this.className + this.id;
        if (eventName !== 'deleted') {
            var currentAttr = JSON.parse(localStorage.getItem(key));
            if (!_.isObject(currentAttr)) {
                currentAttr = {};
            }
            var attributes = this.attributes;
            _.each(attributes, function (value, k) {
                currentAttr[k] = value;
            });
            localStorage.setItem(key, JSON.stringify(currentAttr));
        } else {
            localStorage.removeItem(key);
        }
    },
    loadFromLocalStorage: function (force) {
        if (!this.localStorage || _.isUndefined(this.className)) {
            return;
        }
        var key = this.className + this.id;
        var allAttrs = localStorage.getItem(key);

        // Load if you are forcing it or if it has only the id attribute.
        if (this.localStorage && (force || ((this.id && _.size(this.attributes) === 1) && !_.isNull(allAttrs)))) {
            var self = this;
            this.attributes = JSON.parse(allAttrs);
            // We need to trigger the change events on the model for each attribute that was set.
            this.trigger('change');
            _.each(allAttrs, function (attr) {
                self.trigger('change:' + attr);
            });
        }
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
        // Validates if the value introduced is actually a numeric value
        numeric: function (attr, val) {
            // Only validates if value is present
            if (val || val === 0) {
                val = parseFloat(val);
                if (!_.isNumber(val) || _.isNaN(val)) {
                    return this.validatorMessages.numeric
                        .replace('{attr}', _.str.capitalize(attr));
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
    initialize: function () {},
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
    initialize: function () {},
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
    /** Model to be used with this collection. */
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
            },
            // We are going to listen to form events and trigger them with our custom logic.
            'submit' : function (event) {
                event.preventDefault();
                event.stopPropagation();
                var form = $(event.target);
                var action = form.attr('action');
                var method = (form.attr('method') || 'GET').toUpperCase();
                var attrs = form.serialize();
                var url = action;
                if (method === 'GET') {
                    url += '?' + attrs;
                }
                App.request.params = self.serializeObject();
                Backbone.history.navigate(url, {trigger: true});
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
        $('body').find('.tooltip[data-error-key]').remove();
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

            // If the value is a list of errors, we should show them in a list
            var content = _.isArray(value) ? value.join('<br />') : value;

            // Add tooltip element
            var tooltip = $('<div class="tooltip" data-error-key="' + key + '"><div class="tooltip-content">' +  content + '</div><div class="tooltip-arrow"></div></div>');
            $('body').append(tooltip);
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
        if (object && object.selector) {
            el  = this.find(object.selector);
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
        var el = this.find(selector);
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

        if (previousRoute) {
            Backbone.history.navigate(previousRoute, {trigger: trigger});
        } else if (!previousRoute && fallback) {
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
      Sets the analytics cache using cache rule
      @params {String} key - Key that defines the key in the cache.
      @params {object} value - Url that defines the key in the cache.
      **/
    set: function (key, value) {
        var cache = App.cache;
        cache[key] = {value: value, timestamp: moment().utc()};
    },
    /**
      Gets the analytics cache using url key.
      @params {String} url - Url that defines the key in the cache.
      **/
    get: function (key) {
        var cache = App.cache;
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
        var cache = App.cache;
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
    /**
      * Override the route function so that a controller get's called on calls after the application is first loaded.
      * @param {String} route string for the current route being called.
      * @param {String} name string with the name of the function to be called.
      * @param {Function} callback function that get's called if the route is matched.
      */
    route: function (route, name, callback) {
        var router = this;

        var routerName = router.className,
            controller = App.Controllers[routerName],
            scope = router;

        callback = callback || this[name];
        if (controller) {
            callback = controller[name];
            scope = controller;
        }

        var f = function () {

            var goToRoute = function (args) {
                if (router.beforeEach) { router.beforeEach.apply(router, args); }
                callback.apply(scope, args);
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
        var user = App.currentUser;
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
        var permissions = rule.permissions;
        if (_.contains(permissions, user.get('permission'))) {
            return true;
        }
        return false;
    },
    authenticate: function () {
        // Check if the user is logged in.
        if (_.isNull(localStorage.getItem('token'))) {
            App.Controllers.Sessions.logout();
            return false;
        } else {
            if (_.isNull(App.currentUser)) {
                App.currentUser = App.Models.User.find({token: localStorage.getItem('token')}) || App.Models.User.findOrCreate({token: localStorage.getItem('token')});
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
Suit.Components.registeredComponents = [];

/** Here you will register a component using the class name of the top element. */
Suit.Components.registerComponent = function (className) {
    className = _.str.classify(_.str.underscored(className));
    Suit.Components.registeredComponents.push(className);
    Suit.Components.registeredComponents = _.uniq(Suit.Components.registeredComponents);
};

Suit.Components.Binders['component-*'] = {
    block: true,
    bind: function () {
        var $el = $(this.el);
        var componentName = _.str.camelize(_.str.underscored(this.args[0]));
        var className = _.str.classify(_.str.underscored(componentName));
        var data = {};
        _.each($el.data(), function (value, key) {
            if (_.str.startsWith(key, componentName)) {
                data[key] = value;
            }
        });
        var attr = {el: this.el};
        var self = this;
        _.each(data, function (value, key) {
            var keypath = value.split(':');
            var rootModel = self.view.models[keypath.shift()];
            var model = rootModel;
            if (rootModel && keypath.length > 0) {
                model = self.view.adapters[':'].read(rootModel, keypath.join(':'));
            }
            attr[_.str.camelize(_.str.underscored(key.replace(componentName, '')))] = model || value;
        });
        this.componentView = new Suit.Components[className](attr);
        $el.removeAttr('suit-component-' + componentName);
        this.componentView.render();
        $el.attr('suit-component-' + componentName);
        this.componentView.setParent(this.view.models);
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
        this.message = this.options.message || 'Suit alert box!';
        this.listenTo(Backbone.history, 'route', this.close);
    },
    /** className for the component, there are four(4) types of alerts. */
    className: function () {
        return 'alert-box-set-' + this.type;
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
    alertIcon: 'i'

});
Suit.Components.ConfirmationAlert = Suit.Components.Alert.extend(/** @lends Suit.Component.ConfirmationAlert.prototype */{
    /**
      * @class Suit.Components.ConfirmationAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-confirmation',
    alertIcon: 'c',
    afterRender: function () {
        var self = this;
        this.$el.delay(2000).fadeOut('slow', function () {
            self.close();
        });
    }
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
                this.startPicker.picker.setMoment(moment().subtract('days', 7), true);
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

Suit.Components.Graph = Suit.Component.extend(/** @lends Suit.Components.Graph.prototype */{
    /**
      * @class Suit.Components.Graph
      *
      * Graph component for drawing SET-flavoured graphs.
      *
      * Constructs a chart based on NVD3 library. It accepts predefined values for
      * drawing the chart.
      *
      * Example of usage:
      * // Initialize the chart on your own view:
      * // you can pass some options for defining your chart look and feel.
      * var linearGraph = new Suit.Components.LineGraph({});
      * // then, append it to your desired location:
      * this.htmlView(linearGraph, '#linear-graph');
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Array} options.data - Chart data
      * @param {Array} options.color - Array of colors
      * @param {Int} options.height - Chart height
      * @param {Boolean} options.showXAxis - Show the `x` axis or not
      * @param {Boolean} options.showYAxis - Show the `y` axis or not
      * @param {Int} options.width - Chart width
      **/
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);

        // This is for enabling/disabling the logs
        nv.dev = false;

        this.size      = options.size || 'tiny';
        this.data      = options.data || [];
        this.baseColor = options.baseColor || 'blue';
        this.isWidget  = !_.isUndefined(options.isWidget) ? !!options.isWidget : false;
        this.color     = this.generateColors();
        this.height    = options.height || 100;
        this.margin    = !_.isUndefined(options.margin) ? options.margin : {};
        this.showXAxis = !_.isUndefined(options.showXAxis) ? !!options.showXAxis : true;
        this.showYAxis = !_.isUndefined(options.showYAxis) ? !!options.showYAxis : true;
        this.width     = options.width || 100;
        this.noData    = !_.isUndefined(options.noData) ? options.noData : 'No Data';
    },
    /** className for the component. */
    className: function () {
        return 'graph-set-' + this.type;
    },
    /** Base colors map */
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
    /** Generates a single rgba color string based on rgb array and opacity */
    generateColor: function (rgb, opacity) {
        return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (Math.round(opacity * 100) / 100) + ')';
    },
    /** Generates a color array based on the data sections */
    generateColors: function () {
        var colors = [];
        var baseColor = this.colorsMap[this.baseColor];
        var opacityBase = 1;

        // if is wdiget (label distribution charts) we need 100% and 0% only
        // if not, then we have to make it look like gradient
        if (this.isWidget) {
            if (this.type === 'stacked-areagraph' || this.type === 'areagraph') {
                colors = [
                    '#e0e0e0',
                    this.generateColor(baseColor, 1)
                ];
            } else {
                colors = [
                    this.generateColor(baseColor, 1),
                    this.generateColor(this.colorsMap.lightestGrey, 1)
                ];
            }
        } else {
            var length = this.data.length;

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
        }

        if (this.options.hasAverage) {
            colors.push('#F7F7F7');
        }

        return colors;
    },
    /** After render, we still need to attach the graph to the view we just made */
    afterRender: function () {
        this.chart = this.generateChart();
    },
    /** Generates the chart. This function needs to be rewritten on singular charts */
    generateChart: function () {
        throw new Error('Needs to be rewritten');
    },
    /** ticker formats */
    formatters: {
        '': 'defaultFormat',
        'date': 'dateFormat',
        'datetime': 'datetimeFormat',
        'thousand': 'thousandFormat',
        'percentage': 'percentageFormat',
        'abbreviate': 'abbreviateFormat',
        'flatPercentage': 'flatPercentageFormat'
    },
    /** Gets the formatter function based on the formatter */
    getFormatter: function (formatter) {
        if (typeof(formatter) === 'function') {
            return formatter;
        }
        return this[this.formatters[formatter]];
    },
    /** Default formatter, only returns the original value */
    defaultFormat: function (d) {
        return d;
    },
    /** Abbreviate Format, will format using MM, B and K */
    abbreviateFormat: function (d) {
        return Suit.Helpers.Formatters.abbreviateNumber(d);
    },
    /** Date formatter will format a timestamp into YYYY/MM/DD */
    datetimeFormat: function (d) {
        return moment.unix(d).utc().format('YYYY/MM/DD HH:mm');
    },
    /** Date formatter will format a timestamp into YYYY/MM/DD */
    dateFormat: function (d) {
        return moment.unix(d).utc().format('YYYY/MM/DD');
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
    },
    /** Events that this view responds to */
    events: {},
    /** template */
    template: JST['suit/components/graph'],
    /** Graph type */
    type: 'base-graph',
    /** Charts Data */
    data : []
});

Suit.Components.LineGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.LineGraph.prototype */{
    /**
      * @class Suit.Components.LineGraph
      * @augments Suit.Components.Graph

      * @param options list of options for configuring the chart. These include:
      * minY - minimum value for Y Axis, accepted values are: Int || 'auto'
      * maxY - maximum value for Y Axis, accepted values are: Int || 'auto'
      */
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);

        this.useInteractiveGuideline = options.useInteractiveGuideline || true;
        this.showLegend              = options.showLegend || false;
        this.xAxisLabel              = options.xAxisLabel || 'Date';
        this.xAxisFormat             = options.xAxisFormat || 'date';
        this.yAxisLabel              = options.yAxisLabel || 'Impressions';
        this.yAxisFormat             = options.yAxisFormat || 'thousand';
        this.tooltips                = options.tooltips || false;
        this.minY                    = !_.isUndefined(options.minY) ? options.minY : 0;
        this.maxY                    = !_.isUndefined(options.maxY) ? options.maxY : 'auto';
        this.interactive             = !_.isUndefined(options.interactive) ? options.interactive : true;
    },
    /** Graph type */
    type: 'linegraph',

    /** Generates the chart. */
    generateChart: function () {
        var minMax = this._minMaxValues(this.data),
            chart = nv.models.lineChart()
                    .margin(this.margin)
                    .useInteractiveGuideline(this.useInteractiveGuideline)
                    .showLegend(this.showLegend)
                    .color(this.color)
                    .height(this.height)
                    .width(this.width)
                    .showYAxis(this.showYAxis)
                    .showXAxis(this.showXAxis)
                    .tooltips(this.tooltips);

        // X and Y axis information
        chart.xAxis
            // We need to use the actual values in the data in order to get currect data.
            .tickValues(function (data) {
                var xData = data[0].values;
                var size = xData.length;
                var values = [xData[0].x, xData[Math.floor(size / 2)].x, xData[size - 1].x];
                return values;
            })
            .axisLabel(this.xAxisLabel)
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

        // Sets the data
        var chartData = this.data;

        // Draw the chart
        var svg = d3.select(this.el)
            .append('svg')
            .datum(chartData)
            .call(chart);

        // If not interactive (no bullets), then we should remove all the
        // unneeded elements used for hover.
        if (this.interactive === false) {
            // Remove the circles (used for interactivity)
            svg.selectAll('circle').remove();
        }

        nv.addGraph(function () { return chart; });
        return chart;
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
    }
});

Suit.Components.PieChart = Suit.Components.Graph.extend({
    /**
      * @class Suit.Components.DonutGraph
      * @augments Suit.Components.Graph
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Boolean} options.showLabels - Chart showlabels default is false
      * @param {String} options.labelType - label type default is 'percent'. Can be "key", "value" or "percent"
      * @param {Boolean} options.donut - donut or pie chart, default is false so default is pie chart
      * @param {Float} options.donutRatio - float tocConfigure how big you want the donut hole size to be
      * @param {Int} options.width - Width of the chart including labels.
      * @param {Int} options.height - Chart height including labels.
      * @param {Boolean} options.showLegend - show legend of chart default is false.
      * @param {Int} options.outerWidth - width of containing box of graph
      * @param {Int} options.outerHeight - height of containing box of graph
      *
      */
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);
        this.showLabels = this.options.showLabels || false;
        this.labelType  = this.options.labelType || 'percent';
        this.donut      = this.options.donut || false;
        this.donutRatio = this.options.donutRatio || 0.4;
        this.showLegend = this.options.showLegend || false;
        this.tooltips   = this.options.tooltips || false;
    },
    type: 'piegraph',
    /** Generates the chart. */
    generateChart: function () {
        var self = this;
        var chart = nv.models.pieChart()
                    .x(function (d) { return d.label; })
                    .y(function (d) { return d.value; })
                    .margin(self.margin)
                    .showLabels(self.showLabels)
                    .labelThreshold(0.01)
                    .labelType(self.labelType)
                    .donut(self.donut)
                    .donutRatio(self.donutRatio)
                    .width(self.width)
                    .height(self.height)
                    .showLegend(self.showLegend)
                    .tooltips(self.tooltips);

        if (!_.isUndefined(self.color)) {
            chart.color(self.color);
        }

       // Sets the data
        var chartData = self.data;

        d3.select(self.el)
            .append('svg')
            .datum(chartData)
            .transition().duration(300)
            .call(chart);

        nv.addGraph(function () { return chart; });

        return chart;
    }
});

Suit.Components.BarGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.BarGraph.prototype */{
    /**
      * @class Suit.Components.BarGraph
      * @augments Suit.Components.Graph
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Boolean} options.showValues - Chart showValue. Defaults: false.
      * @param {Boolean} options.staggerLabels - Staggering labels for when not enough room. Default: false.
      * @param {Integer} options.transitionDuration - Transition duration. Default: 350.
      * @param {Boolean} options.tooltips - Show labels. Default false.
      **/
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);

        this.hasAverage         = this.options.hasAverage || false;
        this.staggerLabels      = this.options.staggerLabels || false;
        this.transitionDuration = this.options.transitionDuration || 350;
        this.showValues         = this.options.showValues || false;
        this.tooltips           = this.options.tooltips || false;
        this.xAxisFormat        = this.options.xAxisFormat || '';
        this.yAxisFormat        = this.options.yAxisFormat || 'abbreviate';
    },
    /** Graph type */
    type: 'bargraph',
    /** Generates the chart. */
    generateChart: function () {
        var self = this,
            chart;
        nv.addGraph(function () {
            chart = nv.models.discreteBarChart()
                    .x(function (d) { return d.label; })
                    .y(function (d) { return d.value; })
                    .showValues(self.showValues)
                    .width(self.width)
                    .height(self.height)
                    .staggerLabels(self.staggerLabels)
                    .transitionDuration(self.transitionDuration)
                    .tooltips(self.tooltips)
                    .showYAxis(self.showYAxis)
                    .showXAxis(self.showXAxis);

            if (!_.isUndefined(self.color)) {
                chart.color(self.color);
            }

            // X and Y axis information
            chart.xAxis
                .tickFormat(self.getFormatter(self.xAxisFormat));

            chart.yAxis
                .tickFormat(self.getFormatter(self.yAxisFormat));

            // Sets the data
            var chartData = self.data;
            var svg = d3.select(self.el)
                .append('svg')
                .datum(chartData)
                .call(chart);

            if (self.hasAverage) {
                var maxValue = _.max(self.data[0].values, function (value) {
                    return value.value;
                });
                var averageValue  = self.data[0].values[self.data[0].values.length - 1];
                var chartHeight   = chart.height() - chart.margin().bottom - chart.margin().top;
                var averageHeight = 0;
                var margintTop    = 0;

                // Bars/columns
                var cols = svg.selectAll('.nv-barsWrap .nv-series-0 g');


                if (averageValue && averageValue.value && maxValue && maxValue.value && cols.length > 0 && cols[0].length > 0) {
                    // Calculcate heights
                    averageHeight = (averageValue.value * chartHeight) / maxValue.value;
                    margintTop = chartHeight - averageHeight;

                    // Remove average column (created just for the space)
                    self.$el.find('.nv-barsWrap .nv-series-0 g').last().remove();
                    // Append new element
                    var rect = svg.select('.nv-barsWrap .nv-series-0')
                        .insert('g', ':first-child');

                    rect.append('rect')
                        .attr('width', '100%')
                        .attr('height', averageHeight)
                        .attr('x', 1)
                        .attr('y', margintTop)
                        .attr('fill', '#F7F7F7');

                    rect.append('text')
                        .text('AVG')
                        .attr('x', 200)
                        .attr('y', 230)
                        .attr('fill', '#313233');
                }
            }

            return chart;
        });
        return chart;
    }
});

Suit.Components.BulletGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.LineGraph.prototype */{
    /**
      * @class Suit.Components.BarGraph
      * @augments Suit.Components.Graph
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Boolean} options.showValues - Chart showValue. Defaults: false.
      * @param {Boolean} options.staggerLabels - Staggering labels for when not enough room. Default: false.
      * @param {Integer} options.transitionDuration - Transition duration. Default: 350.
      * @param {Boolean} options.tooltips - Show labels. Default false.
      **/
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);
    },
    /** Graph type */
    type: 'bulletgraph',
    /** Generates the chart. */
    generateChart: function () {
        var self = this;
        var chart = nv.models.bulletChart()
                    .color(self.color)
                    .margin({right: 15})
                    .tooltipContent(function (key, x, y) {
                        return '<p>' + y + '%</p>';
                    })
                    .width(self.width)
                    .height(self.height);

        chart.tickFormat(self.getFormatter('flatPercentage'));

        // Sets the data
        var chartData = self.data;

        // Draw chart
        d3.select(self.el)
            .append('svg')
            .datum(chartData)
            .transition()
            .attr('width', self.width)
            .attr('height', self.height)
            .call(chart);
        nv.addGraph(function () { return chart; });
        return chart;
    }
});

Suit.Components.StackedAreaGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.StackedAreaGraph.prototype */{
    /**
      * @class Suit.Components.StackedAreaGraph
      * @augments Suit.Components.Graph
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Boolean} options.showValues - Chart showValue. Defaults: false.
      * @param {Boolean} options.staggerLabels - Staggering labels for when not enough room. Default: false.
      * @param {Integer} options.transitionDuration - Transition duration. Default: 350.
      * @param {Boolean} options.tooltips - Show labels. Default false.
      * @param {Decimal} options.baseLine - The baseline (in percentage), that shows a black thin line as reference
      **/
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);
        this.useInteractiveGuideline = this.options.useInteractiveGuideline || false;
        this.xAxisLabel              = this.options.xAxisLabel || '';
        this.xAxisFormat             = this.options.xAxisFormat || 'default';
        this.yAxisLabel              = this.options.yAxisLabel || '';
        this.yAxisFormat             = this.options.yAxisFormat || 'default';
        this.tooltips                = this.options.tooltips || false;
        this.baseLine                = this.options.baseLine || false;
        this.width                   = this.options.width;
        this.height                  = this.options.height;
        this.margin                  = this.options.margin || {left: 10, right: 15, top: 0, bottom: 0};
        this.tooltipContent          = this.options.tooltipContent;
        this.rightAlignYAxis         = this.options.rightAlignYAxis || false;
    },
    /** Graph type */
    type: 'stacked-areagraph',
    /** Generates the chart. */

    generateChart: function () {
        var self = this;
        var chart = nv.models.stackedAreaChart()
                      .x(function (d) { return d[0]; })
                      .y(function (d) { return d[1]; })
                      .width(self.width)
                      .height(self.height)
                      .margin(this.margin)
                      .useInteractiveGuideline(self.useInteractiveGuideline)
                      .rightAlignYAxis(this.rightAlignYAxis)
                      .transitionDuration(500)
                      .interactive(true)
                      .showLegend(false)
                      .showControls(false)
                      .showYAxis(self.showYAxis)
                      .showXAxis(self.showXAxis)
                      .noData(self.noData)
                      .tooltips(self.tooltips);


        if (!_.isUndefined(self.tooltipContent)) {
            chart.tooltipContent(self.tooltipContent);
        }

        if (!_.isUndefined(self.color)) {
            chart.color(self.color);
        }


        chart.xAxis
            // We need to use the actual values in the data in order to get currect data.
            .tickValues(function (data) {
                var xData = data[0].values;
                var size = xData.length;
                // We need to figure out how to define the number of ticks.
                //var values = [xData[0].x, xData[Math.floor(size / 2)].x, xData[size - 1].x];
                var values = [xData[0][0], xData[Math.floor(size / 3)][0], xData[Math.floor(2 * size / 3)][0], xData[size - 1][0]];
                return values;
            })
            .tickFormat(self.getFormatter(self.xAxisFormat));

        chart.yAxis
            .tickFormat(self.getFormatter(self.yAxisFormat));

        // Sets the data
        var chartData = self.data;

        // Draw chart
        d3.select(self.el)
            .append('svg')
            .datum(chartData)
            .transition()
            .call(chart);

        var rect = d3.select('.nv-series-0')
            .insert('g', ':first-child');

        if (self.baseLine) {
            var x = (chart.width() - chart.margin().left - chart.margin().right) * self.baseLine;

            rect.append('rect')
                .attr('width', '1')
                .attr('height', 100)
                .attr('x', x)
                .attr('y', 0)
                .attr('stroke', '#313233');
        }
        nv.addGraph(function () { return chart; });

        return chart;
    }
});

Suit.Components.AreaGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.AreaGraph.prototype */{
    /**
      * @class Suit.Components.AreaGraph
      * @augments Suit.Components.Graph
      *
      * The AreaGraph is the Graph component that generates multiple areas based
      * on a data series. It is built with regular D3 components, but the data expected
      * is the same as for an NVD3.StackedArea Chart.
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Decimal} options.baseLine - The baseline (in percentage), that shows a black thin line as reference
      **/
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);
        this.baseLine = this.options.baseLine || false;
    },
    /** Graph type */
    type: 'areagraph',
    /** Generates the chart. */
    generateChart: function () {
        var self = this;

        // Chart sizes
        var margin = {left: 10, right: 15, top: 0, bottom: 0};
        var width  = self.width - margin.left - margin.right;
        var height = self.height - margin.top - margin.bottom;

        // Data for the Chart
        var chartData = self.data;

        // X-Axis Scale, based on the x-min and x-max
        var xScale = d3.scale.linear()
            .domain([
                d3.min(chartData, function (d) {
                    return d3.min(d.values, function (v) { return v[0]; });
                }),
                d3.max(chartData, function (d) {
                    return d3.max(d.values, function (v) { return v[0]; });
                })
            ])
            .range([0, width]);

        // Y-Axis Scale, based on the y-min and y-max
        var yScale = d3.scale.linear()
            .domain([
                d3.min(chartData, function (d) {
                    return d3.min(d.values, function (v) { return v[1]; });
                }),
                d3.max(chartData, function (d) {
                    return d3.max(d.values, function (v) { return v[1]; });
                })
            ])
            .range([height, margin.top]);

        // SVG and SVG Areas for all areas. Areas are generated based on the
        // data series received. If 3 series are sent, then 3 areas are created.
        var svg = d3.select(self.el).append('svg');
        var area = d3.svg.area()
                        .x(function (d) {
                            return xScale(d[0]) + margin.left;
                        })
                        .y0(height)
                        .y1(function (d) {
                            return yScale(d[1]);
                        });

        // Filling the areas with the expected colors, which are generated
        // based on the multiple areas
        _.each(chartData, function (d, i) {
            svg.append('path')
            .datum(d.values)
            .attr('class', 'area')
            .attr('d', area)
            .style('fill', function () {
                return self.color[i];
            })
            .style('opacity', 1);
        });

        // Adding the baseline component, which creates a black thin line for the
        // expected current status.
        if (self.baseLine) {
            var rect = d3.select('svg')
                .insert('g');

            var x = (width * self.baseLine) + 10;

            rect.append('rect')
                .attr('width', '1')
                .attr('height', 100)
                .attr('x', x)
                .attr('y', 0)
                .attr('stroke', '#313233');
        }
    }
});

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
      * be handled from the collection (which is passed as an attribute to the
      * component's instance).
      *
      * The Table Component will provide with sorting functionalities (linked to
      * collection's default sorting functionality). If the user trigger a collection
      * sort change, the Table Component will interact with the changes.
      *
      * Use the <strong>dataTableView</strong> parameter in order to define what
      * view will be used on the rows.
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
        var keypath = (this.collection instanceof Suit.Collection) ? 'collection.models' : 'collection';
        this.$tbody.find('tr').first().attr('suit-each-row', keypath);
    },

    _sortTable: function (event) {
        event.preventDefault();
        var $ele,
            href,
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
        this.collection.sort();
        href = $target.attr('href');
        url = href.indexOf('?') === -1 ? href + '?' : href;
        url += $.param({ sortBy: sortBy, sortOrder: sortOrder });
        this.find('th a.sortable').each(function (index, element) {
            if ($target[0] !== element) {
                $ele = $(element);
                $ele.data('current-sort-order', false);
                $ele.removeClass('active asc desc');
            }
        });
        Backbone.history.navigate(url);
    },

    // setupInfiniteScroll: function () {
    //     this.fetchingNextPage = false;
    //     var thHeight,
    //         $th,
    //         table,
    //         infiniteScrollWrapper = $('<div class="infinite-scroll"><div class="infinite-scroll-container"></div></div>');

    //     infiniteScrollWrapper.css({position: 'relative'}).find('.infinite-scroll-container').css({overflow: 'auto', height: '400px'});
    //     this.$el.wrap(infiniteScrollWrapper);

    //     this.$thead.find('tr').first().children().each(function (index, th) {
    //         $th = $(th);
    //         thHeight = $th.height();
    //         $th.width($th.width());
    //     });

    //     table = $('<table/>').height(thHeight);

    //     this.$newThead = this.$thead.clone();
    //     this.$newThead.css({position: 'absolute', 'z-index': 10, top: 0, left: 0});
    //     this.$newThead.wrap(table);
    //     this.$newThead.find('a.sortable').on('click', _.bind(this._sortTable, this));
    //     this.$el.closest('.infinite-scroll').prepend(this.$newThead);

    //     this.$thead.css('visibility', 'hidden');

    //     this.$scrollingView = this.$el.closest('.infinite-scroll-container');
    //     this.$scrollingView.css({'margin-top': -thHeight});
    //     this.$loader = $('<div class="infinite-scroll-loader"/>').css({position: 'relative', height: 100});
    //     this.$scrollingView.append(this.$loader);
    //     this.$scrollingView.on('scroll', _.bind(this._scrollViewScrolled, this));
    // },

    // teardownInfiniteScroll: function () {
    //     this.$newThead.find('a.sortable').off('click');
    //     this.$scrollingView.off('scroll');
    // },

    // removeInfiniteLoader: function () {
    //     this.parent.removeLoader('.infinite-scroll-loader');
    //     this.find('.infinite-scroll-loader').hide();
    //     this.fetchingNextPage = false;
    // },

    // _scrollViewScrolled: function (event) {
    //     if (this.fetchingNextPage) {
    //         event.preventDefault();
    //         event.stopPropagation();
    //         return;
    //     }
    //     var offset = (this.$scrollingView[0].scrollHeight - this.$scrollingView.height());
    //     if (this.$scrollingView.scrollTop() === offset && this.fetchingNextPage === false) {
    //         event.preventDefault();
    //         this.fetchingNextPage = true;
    //         this.find('.infinite-scroll-loader').show();
    //         this.parent.loader({selector: '.infinite-scroll-loader', loaderSize: 'small', tone: 'light'});
    //         this.trigger('next', this.collection, _.bind(this.removeInfiniteLoader, this));
    //     }
    // },

    beforeClose: function () {
        // if (_.has(this.options, 'infiniteScroll')) {
        //     this.teardownInfiniteScroll();
        // }
    },

    afterRender: function () {
        // if (_.has(this.options, 'infiniteScroll')) {
        //     this.setupInfiniteScroll();
        // }
        this.find('th a.sortable[data-sort-by="' + this.options.sort + '"]').first().trigger('click');
    }
});

Suit.Components.registerComponent('Table');
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
    //
    template: JST['suit/components/time_picker'],
    render: function () {
        $('body').append(this.template(this));
        return this;
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
        var url = el.attr('data-url');
        var dataKey =  el.attr('data-key') || 'label';
        var dataLimit = el.attr('data-limit') || 10;
        var filterLang = _.isUndefined(el.attr('data-filter-lang')) ? false : el.attr('data-filter-lang');
        var local = this.options.local || undefined;
        var self = this;

        //query parameter
        if (el.attr('data-param')) {
            var queryString = el.attr('data-param') + '=%QUERY', //%QUERY is used to replace the value of the query.
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
            if (e.which === 13) {//enter
                // var tab = $.Event('keydown');
                // tab.keyCode = tab.which = 9; // 9 == tab
                $(this).trigger('typeahead:selected');
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
                'techOrder': ['flash', 'html5']
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

        return {
            model: model,
            key: keypath.shift()
        };
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

        if (!(obj instanceof Model)) {
            return obj;
        }

        if (arguments.length === 2) {
            return obj.get(root.key);
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
        if (value instanceof Collection) {
            return value.models;
        }

        return value;
    }

    /**
     * @param {Model|Collection} obj
     * @param {String}           keypath
     * @param {*}                value
     */
    function publish(obj, keypath, value) {
        if (obj instanceof Collection) {
            return _.result(obj, keypath);
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

// Start application.
if (_.isUndefined(window.jasmine)) {
    $(function () {
        // Prepare the body.
        $('body').prepend(App.mainView.render().el);

        // Start routes.
        App.mainRouter = new App.Routers.Main();
        _.each(App.Routers, function (value, key) {
            new App.Routers[key]();
        });
        Backbone.history.start({pushState: false});
    });
}