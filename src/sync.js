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
