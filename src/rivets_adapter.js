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