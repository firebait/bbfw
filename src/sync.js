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

    var eventName = method;
    options.success = function (resp, status, xhr) {
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