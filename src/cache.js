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
      Initializes and returns the data object
      **/
    getData: function () {
        this.data = this.data || {};
        return this.data;
    },
    /**
      Sets the analytics cache using cache rule
      @params {String} key - Key that defines the key in the cache.
      @params {object} value - Url that defines the key in the cache.
      **/
    set: function (key, value) {
        var cache = this.getData();
        cache[key] = {value: value, timestamp: moment().utc()};
    },
    /**
      Gets the analytics cache using url key.
      @params {String} url - Url that defines the key in the cache.
      **/
    get: function (key) {
        var cache = this.getData();
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
        var cache = this.getData();
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
