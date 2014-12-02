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