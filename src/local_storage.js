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
        //console.info('saveToLocalStorage');
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
            //console.info('saving to local storage');
            localStorage.setItem(key, JSON.stringify(currentAttr));
        } else {
            //console.info('destroying from local storage');
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
            //console.info('loadFromLocalStorage');
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
