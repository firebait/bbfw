'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Table = Suit.Component.extend(/** @lends Suit.Components.Table.prototype */{
    /**
      * @class Suit.Components.Table
      * @classdesc Suit Component Framework Table Component.
      *
      * This component is meant to be used along with tabular data. The data will
      * be handled from the collection (which is passed as an attribute to the
      * component's instance).
      *
      * The Table Component will provide with sorting functionalities (linked to
      * collection's default sorting functionality). If the user trigger a collection
      * sort change, the Table Component will interact with the changes.
      *
      * Use the <strong>dataTableView</strong> parameter in order to define what
      * view will be used on the rows.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Table
      */
    initialize: function (options) {
        if (this.collection) {
            this.listenTo(this.collection, 'reset sort', this.renderCollection);
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'remove', this.removeOne);
            this.listenTo(this, 'afterRender', this.renderCollection);
        }
        Suit.Component.prototype.initialize.apply(this, [options]);
    },
    /** View for the Table View Rows */
    dataTableView: Suit.View,
    /**
      * List of default events that will be handled by all views if necessary.
      * If views want to extend these events, you need to extend it directly
      * on your view, using the following structure:
      * events: function () {
      *     return _.extend({},Suit.View.prototype.events, {
      *         // 'click .something': myHandler
      *     });
      * }
      */
    events: {
        // Event for sorting the table collection. This only needs to happen
        // on the table head, when the sort anchors are clicked.
        'click table thead a.sortable': 'handleCollectionSort'
    },
    /** Renders the default sort parameters, based on the route */
    afterRender: function () {
        // Selects the sort parameter from the list and activate the current sort
        // order.
        if (this.collection.sortBy && this.collection.sortOrder) {
            this.$el.find('a.sortable').removeClass('active');

            this.$el.find('a[data-sort-by="' + this.collection.sortBy + '"]')
                .addClass(this.collection.sortOrder)
                .addClass('active')
                .attr('data-sort-order', this.collection.sortOrder);
        }
    },
    addOne: function (model) {
        var itemView = new this.dataTableView({
            model: model
        });
        itemView.setParent(this);
        this.prependView(itemView, 'tbody');
    },
    removeOne: function (model) {
        var childView = _.find(this.children, function (m) {
            return m.model.cid === model.cid;
        });
        childView.close();
    },
    /** Renders the collection every sort, reset and afterRender */
    renderCollection: function () {
        var self = this;
        // Create a documentFragment that will allow us to only modify the DOM
        // once, not everytime a new element is created or appended.
        var fragment = document.createDocumentFragment();
        this.empty('tbody');

        // Iterate the collection and append the views to the recently created
        // documentFragment
        var maxDisplayRows = self.options.maxDisplayRows;
        var displayCollection = (maxDisplayRows) ? this.collection.models.slice(0, maxDisplayRows) : this.collection.models;
        _.each(displayCollection, function (model) {
            if (!_.isUndefined(self.dataTableView)) {
                var itemView = new self.dataTableView({model: model});
                itemView.setParent(self);
                fragment.appendChild(itemView.render().el);
            }
        });

        // Rollup functionality
        if (self.options.rollUpAs) {
            var avgModel = self._getRollUpModel();
            if (!_.isUndefined(avgModel)) {
                if (!_.isUndefined(self.dataTableView)) {
                    var itemView = new self.dataTableView({model: avgModel});
                    itemView.setParent(self);
                    fragment.appendChild(itemView.render().el);
                }
            }
        }
        this.$el.find('tbody').append(fragment);
    },
    _getRollUpModel: function () {
        var self = this;
        var nameColumn = this.options.rollUpNameColum || 'name';

        if (self.collection.length > 0) {
            var averageModel = new Suit.Model();
            var displayCollection = self.collection.models;

            _.each(self.options.rollUpColumnKeys, function (key) {
                var sumAttr = _.reduce(displayCollection, function (memo, model) { return memo + model.get(key); }, 0);
                if (self.options.rollUpAs === 'average') {
                    averageModel.set(key, sumAttr / displayCollection.length);
                } else if (self.options.rollUpAs === 'sum') {
                    averageModel.set(key, sumAttr);
                }
            });
            averageModel.set(nameColumn, displayCollection.length + ' Total ' + self.formatters.capitalize(self.options.rollUpAs));

            return averageModel;
        }
    },
    /**
      * Handles collection sort once a sort element (on the thead) is clicked.
      * @param Event event - Click event
      */
    handleCollectionSort: function (event) {
        event.preventDefault();

        // Clicked element, that is dispatching the sorting funcionality on
        // the header.
        var _element = $(event.currentTarget);

        // Sorting properties
        var sortBy       = _element.attr('data-sort-by');
        var sortOrder    = _element.attr('data-sort-order');
        var newSortOrder = _element.attr('data-default-sort');

        // Sort the collection, if it exists
        if (!_.isUndefined(this.collection)) {

            // Decide if we are going to be update
            if (newSortOrder && this.collection.sortBy !== sortBy) {
                sortOrder = newSortOrder;
            } else {
                newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            }

            this.collection.sortBy    = sortBy;
            this.collection.sortOrder = newSortOrder;
            this.collection.sort();

            // Change the sort order, to the new one. If we are sorting desc
            // we need to change the property to desc.
            _element.attr('data-sort-order', newSortOrder);
        }

        // Check the current sortBy element, with the current sortOrder
        this.$el.find('a.sortable').removeClass('asc active desc');
        _element.addClass('active ' + newSortOrder);

        // Change the route, so that the sorting order is kept on the URL, for
        // further use.
        // href represents the base href, so that we can actually have a base route
        // defined directly on the HTML.
        var href    = _element.attr('href');
        if (this.options.sortByRedirect !== false) {
            var newHref = href.replace(sortOrder, newSortOrder);
            _element.attr('href', newHref);
            Backbone.history.navigate(newHref);
        }

    }
});

// Register component.
Suit.Components.registerComponent('Table');
