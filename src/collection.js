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
        this._addModificationListeners();
    },
    /** Adds the add, remove and change event listener so that the _checkAndTriggerDirtyCollection gets called */
    _addModificationListeners: function () {
        this._modificationHandler('add');
        this._modificationHandler('remove');
        this._modificationHandler('change');
        this.listenTo(this, 'sync', this.resetDirtyStatus);
    },
    resetDirtyStatus: function () {
        this._dirtyModels = [];
        this._setAndTriggerDirtyCollection(false);
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
            if (model.isDirty || action === 'change') {
                this._handleAddChangeEvents(model, action);
            } else if (action === 'add') {
                this._handleAddChangeEvents(model, action);
            } else if (action === 'remove') {
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

            dirtyModelIndex = foundMatchingModel ? index : -1;
        });

        if (dirtyModelIndex !== -1) {
            this._dirtyModels.splice(dirtyModelIndex, 1);
        } else {
            this._dirtyModels.push({model: model.clonedModel, action: action});
        }
    },
    _handleRemoveEvent: function (model, action) {
        var anyMatch = false,
            self = this,
            dirtyModelIndex = -1;

        _.filter(this._dirtyModels, function (dirtyModelContainer, index) {
            var foundMatchingModel = !_.isUndefined(dirtyModelContainer.model) &&
                                     self._isMatchingModel(model, dirtyModelContainer.model);
            anyMatch = foundMatchingModel || anyMatch;
            dirtyModelIndex = foundMatchingModel ? index : -1;
            return !foundMatchingModel;
        });

        if (!anyMatch) {
            this._dirtyModels.push({model: model.clonedModel, action: action});
        } else {
            this._dirtyModels.splice(dirtyModelIndex, 1);
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
                case 'add':
                    addedModels.push(dirtyModel.model);
                    break;
                case 'remove':
                    removedModels.push(dirtyModel.model);
                    break;
                default:
                    dirtyModel.model.revert();
            }
        });

        if (addedModels.length > 0) {
            this.remove(addedModels);
        }

        if (removedModels.length > 0) {
            this.add(removedModels);
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
