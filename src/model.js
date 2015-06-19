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
        var isDirty = !this._isMatchingModel(this.clonedModel.attributes, this.attributes);
        return isDirty;
    },
    _isMatchingModel: function (knownModel, candidateModel) {
        var isMatchingModel = false;
        if (!_.isUndefined(knownModel) && !_.isUndefined(candidateModel)) {
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
        }
        return isMatchingModel;
    },
    /** Revert the model to its original attributes and values */
    revert: function () {
        var originalModel = this.clonedModel.attributes,
            currentModel = this.attributes,
            isDirty;

        _.each(currentModel, function (attributeValue, attributeName) {
            if (!_.has(originalModel, attributeName)) {
                originalModel[attributeName] = attributeValue;
            }
        });

        this.attributes = originalModel;
        isDirty = false;
        this._setAndTriggerDirtyModel(isDirty);
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
