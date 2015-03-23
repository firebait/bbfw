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
        /**
        * Checks if the given number is greater than number
        * @param {String} attr - the attribute's name
        * @param {String} val - the attribute's value
        * @param {Number} num - number to compare
        */
        greaterThan: function (attr, val, num) {
            var _val = parseInt(val, 10);
            if (!_.isNumber(_val)  || _.isNaN(_val) || _val <= num) {
                return 'The ' + attr + ' has to be greater than ' + num;
            }
        },
        /**
        * Checks if the given number is greater than or equal to number
        * @param {String} attr - the attribute's name
        * @param {String} val - the attribute's value
        * @param {Number} num - number to compare
        */
        greaterThanOrEqual: function (attr, val, num) {
            var _val = parseInt(val, 10);
            if (!_.isNumber(_val)  || _.isNaN(_val) || _val < num) {
                return 'The ' + attr + ' has to be greater than or equal to ' + num;
            }
        },
        /**
        * Checks if the given number is less than or equal to number
        * @param {String} attr - the attribute's name
        * @param {String} val - the attribute's value
        * @param {Number} num - number to compare
        */
        lessThanOrEqual: function (attr, val, num) {
            var _val = parseInt(val, 10);
            if (!_.isNumber(_val)  || _.isNaN(_val) || _val > num) {
                return 'The ' + attr + ' has to be less than or equal to ' + num;
            }
        },
        /**
        * Checks if the given number is less than number
        * @param {String} attr - the attribute's name
        * @param {String} val - the attribute's value
        * @param {Number} num - number to compare
        */
        lessThan: function (attr, val, num) {
            var _val = parseInt(val, 10);
            if (!_.isNumber(_val)  || _.isNaN(_val) || _val >= num) {
                return 'The ' + attr + ' has to be less than ' + num;
            }
        },
        /**
        * Checks if the given number is inside the valid range
        * @param {String} attr - the attribute's name
        * @param {String} val - the attribute's value
        * @param {Array[Number]} range - an array containing the inclusive min value and max value
        */
        numericRange: function (attr, val, range) {
            var _val = parseInt(val, 10);
            if (!_.isNumber(_val)  || _.isNaN(_val) || _val < range[0] || _val > range[1]) {
                return 'The ' + attr + ' is not in the range of ' + range[0] + ' and ' + range[1];
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