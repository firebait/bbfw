'use strict';

Suit.Components = Suit.Components || {};

Suit.Components.Table = Suit.Component.extend(/** @lends Suit.Components.Table.prototype */{
    /**
      * @class Suit.Components.Table
      * @classdesc Suit Component Framework Table Component.
      *
      * This component is meant to be used along with tabular data. The data will
      * be handled from the collection (which is passed as a keypath to the
      * component element's data-table-collection attribute).
      *
      * The Table Component will provide with sorting functionalities (linked to
      * collection's default sorting functionality). If the user trigger a collection
      * sort change, the Table Component will interact with the changes.
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
        var keypath = (this.collection instanceof Suit.Collection) ? 'collection.models' : false;
        if (keypath === false) {
            throw (new Error('data-collection must be an instance of Suit.Collection'));
        }
        this.$tbody.find('tr').first().attr('suit-each-row', keypath);
        this.listenTo(this.collection, 'sort', this._updateHeaders);
        this.listenTo(this.collection, 'sync', this._adjustHeaderSize);
        if (_.has(this.options, 'infiniteScroll')) {
            this._setupInfiniteScroll();
        }
    },

    beforeClose: function () {
        if (_.has(this.options, 'infiniteScroll')) {
            this._teardownInfiniteScroll();
        }
    },

    afterRender: function () {
        if (_.has(this.options, 'infiniteScroll')) {
            this._adjustHeaderSize();
        }
        this.collection.sort();
    },

    // PRIVATE METHODS

    /* Callback from collection "sort" event.  It updates the the thead > th's to reflect current sort-by/sort-order */
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

    /* Set's up infinite scroll on table. Wraps table, sets up listeners, etc. */
    _setupInfiniteScroll: function () {
        this.enableInfiniteScroll = true;
        this._fetchingNextPage = false;
        var $table,
            infiniteScrollWrapper = $('<div class="infinite-scroll"><div class="infinite-scroll-container"></div></div>');

        infiniteScrollWrapper.css({position: 'relative'}).find('.infinite-scroll-container').css({'overflow-y': 'scroll'});

        if (_.has(this.options, 'stickyHeaders')) {
            this._stickyHeaders = true;
        }

        if (this.$el.attr('height')) {
            this.options.heightRestricted = true;
            infiniteScrollWrapper.find('.infinite-scroll-container').css({height: this.$el.attr('height')});
        }

        this.$el.wrap(infiniteScrollWrapper);

        $table = $('<table/>');

        this.$newThead = this.$thead.clone();
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

    /* Removes call backs, options and variables for infinite scrolling. */
    _teardownInfiniteScroll: function () {
        this.$newThead.find('a.sortable').off('click');
        if (this.options.heightRestricted) {
            this.$scrollingView.off('scroll');
        } else {
            this.$window.off('scroll', this.__windowScrolled);
        }
    },

    _adjustHeaderSize: function () {
        if (!this.$newThead || this.$newThead.length < 1) {
            return;
        }
        var children = this.$newThead.find('tr').first().children(),
            $th, w;
        this.$thead.find('tr').first().children().each(function (index, th) {
            $th = $(th);
            w = $th.width();
            if (w > 0) {
                children.eq(index).width(w);
            }
        });
    },

    /* Hides loader that was shows during a table:next event */
    _removeInfiniteLoader: function () {
        this.parent.removeLoader('.infinite-scroll-loader');
        this.find('.infinite-scroll-loader').hide();
        this._fetchingNextPage = false;
    },

    /* Bound to th a.sortable links, sorts collection if non-infinite scroll based, otherwise triggers a table:sort event */
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
            this.trigger('table:sort', this.collection);
        } else {
            this.collection.sort();
        }
        href = $target.attr('href');
        url = href.indexOf('?') === -1 ? href + '?' : href;
        url += $.param({ sortBy: sortBy, sortOrder: sortOrder });
        Backbone.history.navigate(url);
    },

    /* Bound to window scroll event, checks if bottom of the table has come into view, if so, calls _next */
    _windowScrolled: function (event) {
        if (this._stickyHeaders) {
            this._stickHeaders();
        }
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

    /* For window based infinite scroll tables, sticks headers if they have reached the top of the page on scrolling. Called from _windowScrolled */
    _stickHeaders: function () {
        var table = this.$newThead.closest('table'),
            scrollTop = this.$window.scrollTop(),
            thOffset = this.$newThead.offset().top;
        if (scrollTop > thOffset && !table.data('isStuck')) {
            table.data('isStuck', true);
            table.data('startingOffset', thOffset);
            table.css({position: 'fixed', 'z-index': 50, width: table.width(), top: 0});
        } else if (table.data('isStuck') === true && scrollTop < table.data('startingOffset')) {
            table.data('isStuck', false);
            table.data('startingOffset', false);
            table.css({position: 'static'});
        }
    },

    /* Bound to overflow container scroll event, checks if bottom of the content has come into view, if so, calls _next */
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

    /* Called when bottom of infinite scroll based table comes into view, adds a loader and fires a table:next event*/
    _next: function () {
        this._fetchingNextPage = true;
        this.find('.infinite-scroll-loader').show();
        this.parent.loader({selector: '.infinite-scroll-loader', loaderSize: 'small', tone: 'light'});
        this.trigger('table:next', this.collection, _.bind(this._removeInfiniteLoader, this));
    }
});

Suit.Components.registerComponent('Table');
