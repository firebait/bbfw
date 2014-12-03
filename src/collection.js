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
    initialize: function () {},
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
