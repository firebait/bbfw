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

    events: {
        'click th a.sortable': '_sortTable',
    },

    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        this.$thead = this.find('thead').first();
        this.$tbody = this.find('tbody').first();
        this.$tbody.find('tr').first().attr('suit-each-row', 'collection.models');
    },

    _sortTable: function (event) {
        event.preventDefault();
        var $ele,
            href,
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
        this.collection.sort();
        href = $target.attr('href');
        url = href.indexOf('?') === -1 ? href + '?' : href;
        url += $.param({ sortBy: sortBy, sortOrder: sortOrder });
        this.find('th a.sortable').each(function (index, element) {
            if ($target[0] !== element) {
                $ele = $(element);
                $ele.data('current-sort-order', false);
                $ele.removeClass('active asc desc');
            }
        });
        Backbone.history.navigate(url);
    },

    setupInfiniteScroll: function () {
        this.fetchingNextPage = false;
        var thHeight,
            $th,
            table,
            infiniteScrollWrapper = $('<div class="infinite-scroll"><div class="infinite-scroll-container"></div></div>');

        infiniteScrollWrapper.css({position: 'relative'}).find('.infinite-scroll-container').css({overflow: 'auto', height: '400px'});
        this.$el.wrap(infiniteScrollWrapper);

        this.$thead.find('tr').first().children().each(function (index, th) {
            $th = $(th);
            thHeight = $th.height();
            $th.width($th.width());
        });

        table = $('<table/>').height(thHeight);

        this.$newThead = this.$thead.clone();
        this.$newThead.css({position: 'absolute', 'z-index': 10, top: 0, left: 0});
        this.$newThead.wrap(table);
        this.$newThead.find('a.sortable').on('click', _.bind(this._sortTable, this));
        this.$el.closest('.infinite-scroll').prepend(this.$newThead);

        this.$thead.css('visibility', 'hidden');

        this.$scrollingView = this.$el.closest('.infinite-scroll-container');
        this.$scrollingView.css({'margin-top': -thHeight});
        this.$loader = $('<div class="infinite-scroll-loader"/>').css({position: 'relative', height: 100});
        this.$scrollingView.append(this.$loader);
        this.$scrollingView.on('scroll', _.bind(this._scrollViewScrolled, this));
    },

    removeInfiniteLoader: function () {
        this.parent.removeLoader('.infinite-scroll-loader');
        this.find('.infinite-scroll-loader').hide();
        this.fetchingNextPage = false;
    },

    _scrollViewScrolled: function (event) {
        if (this.fetchingNextPage) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        var offset = (this.$scrollingView[0].scrollHeight - this.$scrollingView.height());
        if (this.$scrollingView.scrollTop() === offset && this.fetchingNextPage === false) {
            event.preventDefault();
            this.fetchingNextPage = true;
            this.find('.infinite-scroll-loader').show();
            this.parent.loader({selector: '.infinite-scroll-loader', loaderSize: 'small', tone: 'light'});
            this.trigger('next', this.collection, _.bind(this.removeInfiniteLoader, this));
        }
    },

    beforeClose: function () {
        this.$newThead.find('a.sortable').off('click');
    },

    afterRender: function () {
        if (_.has(this.options, 'infiniteScroll')) {
            this.setupInfiniteScroll();
        }
    }
});

Suit.Components.registerComponent('Table');