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
    removeAll: function () {
        this._getStore().clear();
    }
};
