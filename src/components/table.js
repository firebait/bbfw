'use strict';

Suit.Components = Suit.Components || {};

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

    events: {
        'click th a.sortable': '_sortTable',
    },

    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        this.$thead = this.find('thead').first();
        this.$tbody = this.find('tbody').first();
        var keypath = (this.collection instanceof Suit.Collection) ? 'collection.models' : 'collection';
        this.$tbody.find('tr').first().attr('suit-each-row', keypath);
        this.listenTo(this.collection, 'sort', this._updateHeaders);
    },

    beforeClose: function () {
        if (_.has(this.options, 'infiniteScroll')) {
            this._teardownInfiniteScroll();
        }
    },

    afterRender: function () {
        if (_.has(this.options, 'infiniteScroll')) {
            this._setupInfiniteScroll();
        }
        this.collection.sort();
    },

    // PRIVATE METHODS

    _updateHeaders: function () {
        var self = this,
            $ele;
        _.each(this.find('th a.sortable'), function (element) {
            $ele = $(element);
            if (self.collection.sortBy === $ele.attr('data-sort-by')) {
                $ele.addClass('active ' + self.collection.sortOrder);
            } else {
                $ele.data('current-sort-order', false);
                $ele.removeClass('active asc desc');
            }
        });
    },

    _setupInfiniteScroll: function () {
        this.enableInfiniteScroll = true;
        this._fetchingNextPage = false;
        var thHeight,
            $th,
            $table,
            infiniteScrollWrapper = $('<div class="infinite-scroll"><div class="infinite-scroll-container"></div></div>');

        infiniteScrollWrapper.css({position: 'relative'}).find('.infinite-scroll-container').css({'overflow-y': 'scroll'});

        if (this.$el.attr('height')) {
            this.options.heightRestricted = true;
            infiniteScrollWrapper.find('.infinite-scroll-container').css({height: this.$el.attr('height')});
        }

        this.$el.wrap(infiniteScrollWrapper);

        this.$thead.find('tr').first().children().each(function (index, th) {
            $th = $(th);
            thHeight = $th.height();
            $th.width($th.width());
        });

        $table = $('<table/>');
        $table.height(thHeight);

        this.$newThead = this.$thead.clone();
        this.$newThead.find('a.sortable').on('click', _.bind(this._sortTable, this));
        this.$el.closest('.infinite-scroll').prepend(this.$newThead);
        this.$newThead.wrap($table);

        this.$thead.find('a.sortable').removeClass('sortable');

        this.$thead.css('visibility', 'hidden');
        this.$thead.find('th').css({'line-height': '0px', 'height': '0px', 'border': '0px'});

        this.$scrollingView = this.$el.closest('.infinite-scroll-container');
        this.$loader = $('<div class="infinite-scroll-loader"/>').css({position: 'relative', height: 100});
        this.$scrollingView.append(this.$loader);
        this.$loader.hide();
        this.el = this.$el.closest('.infinite-scroll')[0];
        this.$el = $(this.el);

        if (this.options.heightRestricted) {
            this.$scrollingView.on('scroll', _.bind(this._scrollViewScrolled, this));
        } else {
            this.__windowScrolled =  _.bind(this._windowScrolled, this);
            this.$window = $(window);
            this.$window.on('scroll', this.__windowScrolled);
        }
    },

    _teardownInfiniteScroll: function () {
        this.$newThead.find('a.sortable').off('click');
        if (this.options.heightRestricted) {
            this.$scrollingView.off('scroll');
        } else {
            this.$window.off('scroll', this.__windowScrolled);
            delete this.__windowScrolled;
            delete this.$window;
        }
    },

    _removeInfiniteLoader: function () {
        this.parent.removeLoader('.infinite-scroll-loader');
        this.find('.infinite-scroll-loader').hide();
        this._fetchingNextPage = false;
    },

    _sortTable: function (event) {
        event.preventDefault();
        var href,
            url,
            $target = $(event.target),
            sortOrder = $target.data('default-sort'),
            sortBy = $target.data('sort-by');

        if ($target.data('current-sort-order') === 'asc') {
            sortOrder = 'desc';
        } else if ($target.data('current-sort-order') === 'desc') {
            sortOrder = 'asc';
        }
        $target.data('current-sort-order', sortOrder);

        $target.removeClass('active asc desc');
        $target.addClass('active ' + sortOrder);

        this.collection.sortBy    = sortBy;
        this.collection.sortOrder = sortOrder;
        if (_.has(this.options, 'infiniteScroll')) {
            this.collection.reset([]);
            this.trigger('table:sort', this.collection);
        } else {
            this.collection.sort();
        }
        //  Move to sort event
        href = $target.attr('href');
        url = href.indexOf('?') === -1 ? href + '?' : href;
        url += $.param({ sortBy: sortBy, sortOrder: sortOrder });
        Backbone.history.navigate(url);
    },

    _windowScrolled: function (event) {
        if (this._fetchingNextPage || !this.enableInfiniteScroll) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        var offset = ((this.$el.height() + this.$el.offset().top) - this.$window.height()) - 100;
        if (this.$window.scrollTop() >= offset && this._fetchingNextPage === false) {
            event.preventDefault();
            this._next();
        }
    },

    _scrollViewScrolled: function (event) {
        if (this._fetchingNextPage || !this.enableInfiniteScroll) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        var offset = (this.$scrollingView[0].scrollHeight - this.$scrollingView.height());
        if (this.$scrollingView.scrollTop() === offset && this._fetchingNextPage === false) {
            event.preventDefault();
            this._next();
        }
    },

    _next: function () {
        this._fetchingNextPage = true;
        this.find('.infinite-scroll-loader').show();
        this.parent.loader({selector: '.infinite-scroll-loader', loaderSize: 'small', tone: 'light'});
        this.trigger('table:next', this.collection, _.bind(this._removeInfiniteLoader, this));
    }
});

Suit.Components.registerComponent('Table');