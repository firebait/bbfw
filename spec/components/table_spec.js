'use strict';

describe('Suit Table Component', function () {
    var TableViewComponent, TableViewRow, table, collection, navSpy;

    beforeEach(function () {
        navSpy = sinon.spy(Backbone.history, 'navigate');

        TableViewRow = Suit.View.extend({
            template: _.template('<td><%= model.get(\'id\') %></td><td><%= model.get(\'name\') %></td>'),
            tagName: 'tr'
        });

        TableViewComponent = Suit.Components.Table.extend({
            dataTableView: TableViewRow,
            template: function () {
                return '<table class="table-blue"><thead><tr><th><a href="#test?sortBy=id&sortOrder=asc" class="sortable" data-sort-by="id">ID:</a></th><th><a href="#test?sortBy=name&sortOrder=asc" class="sortable active asc" data-sort-order="asc" data-sort-by="name">Name</a></th></th></thead><tbody></tbody></table>';
            }
        });

        collection = new Suit.Collection([
            { id: 1, name: 'Foo' },
            { id: 2, name: 'Bar' }
        ]);

        table = new TableViewComponent({collection : collection});

        table.render();

        collection.trigger('sync');
    });

    afterEach(function () {
        Backbone.history.navigate.restore();
    });

    describe('rendering the collection', function () {
        it('should render the collection directly, with all the correct elements', function () {
            // Rows are correct
            expect(table.$el.find('tbody').children().length).toBe(2);
            expect(table.$el.find('tbody').children().first().text()).toBe('1Foo');
            expect(table.$el.find('tbody').children().last().text()).toBe('2Bar');
        });

        it('should render with the defaults sort orders', function () {
            var idFilterEl = table.$el.find('a[data-sort-by="id"]');
            expect(idFilterEl.hasClass('active')).toBe(true);
            expect(idFilterEl.hasClass('asc')).toBe(true);
            expect(table.$el.find('a.active').length).toBe(1);
        });
    });

    describe('should test the rollup, maxrow, sortbyRedirect, rollupColums functionality of table component', function () {
        beforeEach(function () {
            //navSpy = sinon.spy(Backbone.history, 'navigate');

            TableViewRow = Suit.View.extend({
                template: _.template('<td><%= model.get(\'id\') %></td><td><%= model.get(\'name\') %></td><td><%= model.get(\'impressions\') %></td>'),
                tagName: 'tr'
            });

            TableViewComponent = Suit.Components.Table.extend({
                dataTableView: TableViewRow,
                template: function () {
                    return '<table class="table-blue"><thead><tr><th><a href="#" class="">ID:</a></th><th><a href="#" class="">Name</a></th><th><a href="javascript:void(0)" class="sortable asc active" data-sort-by="impressions">Impressions</a></th></tr></thead><tbody></tbody></table>';
                }
            });

            collection = new Suit.Collection([
                { id: 1, name: 'Foo', impressions: 900},
                { id: 2, name: 'Bar', impressions: 1000},
                { id: 3, name: 'Lala', impressions: 5000},
                { id: 4, name: 'Kaka', impressions: 7000},
            ]);
            collection.sortBy = 'impressions';
        });

        afterEach(function () {
            //Backbone.history.navigate.restore();
        });

        it('should test the maxDisplayRow functionlity', function () {
            table = new TableViewComponent({collection : collection, maxDisplayRows: 3});
            table.render();
            collection.trigger('sync');
            expect(table.$el.find('tbody').children().last().text()).toBe('3Lala5000');
        });

        it('should test the rollup functionality for average', function () {
            table = new TableViewComponent({collection : collection, maxDisplayRows: 3, rollUpAs: 'average', rollUpColumnKeys: ['impressions']});
            table.render();
            collection.trigger('sync');
            expect(table.$el.find('tbody').children().last().text()).toBe('4 Total Average3475');
        });

        it('should test the rollup functionality for sum', function () {
            table = new TableViewComponent({collection : collection, maxDisplayRows: 3, rollUpAs: 'sum', rollUpColumnKeys: ['impressions']});
            table.render();
            collection.trigger('sync');
            expect(table.$el.find('tbody').children().last().text()).toBe('4 Total Sum13900');
        });

        it('should test the sortByRedirect functionality of table component', function () {
            table = new TableViewComponent({sortByRedirect: false, collection : collection, maxDisplayRows: 3, rollUpAs: 'sum', rollUpColumnKeys: ['impressions']});
            table.render();
            collection.trigger('sync');
            var impsFilterEl = table.$el.find('a[data-sort-by="impressions"]')
                .trigger('click').trigger('click');
            expect(impsFilterEl.attr('href')).toBe('javascript:void(0)');
        });
    });

    describe('sort', function () {
        it('should correctly change the sorting by', function () {
            var nameFilterEl = table.$el.find('a[data-sort-by="name"]')
                .trigger('click').trigger('click');

            // The list should be sorted now
            expect(table.$el.find('tbody').children().first().text()).toBe('2Bar');
            expect(table.$el.find('tbody').children().last().text()).toBe('1Foo');

            // The order is now by name
            expect(nameFilterEl.hasClass('active asc')).toBe(true);
            expect(nameFilterEl.attr('data-sort-order')).toBe('asc');
            expect(nameFilterEl.attr('href')).toBe('#test?sortBy=name&sortOrder=asc');
            expect(table.$el.find('a.active').length).toBe(1);

            expect(navSpy).toHaveBeenCalled();
            expect(navSpy.calledWith('#test?sortBy=name&sortOrder=asc')).toBeTruthy();
        });

        it('should correctly change the sorting order', function () {
            var nameFilterEl = table.$el.find('a[data-sort-by="name"]')
                .trigger('click');

            // The list should be sorted now
            expect(table.$el.find('tbody').children().first().text()).toBe('1Foo');
            expect(table.$el.find('tbody').children().last().text()).toBe('2Bar');

            // The order is now by name
            expect(nameFilterEl.hasClass('active desc')).toBe(true);
            expect(nameFilterEl.attr('data-sort-order')).toBe('desc');
            expect(nameFilterEl.attr('href')).toBe('#test?sortBy=name&sortOrder=desc');
            expect(table.$el.find('a.active').length).toBe(1);

            expect(navSpy).toHaveBeenCalled();
            expect(navSpy.calledWith('#test?sortBy=name&sortOrder=desc')).toBeTruthy();
        });
    });

    describe('should test the data-default-sort', function () {
        beforeEach(function () {
            //navSpy = sinon.spy(Backbone.history, 'navigate');

            TableViewRow = Suit.View.extend({
                template: _.template('<td><%= model.get(\'id\') %></td><td><%= model.get(\'name\') %></td><td><%= model.get(\'impressions\') %></td><td><%= model.get(\'vcr\') %></td>'),
                tagName: 'tr'
            });

            TableViewComponent = Suit.Components.Table.extend({
                dataTableView: TableViewRow,
                template: function () {
                    return '<table class="table-blue"><thead><tr><th><a href="#" class="">ID:</a></th><th><a href="#" class="">Name</a></th><th><a href="javascript:void(0)" class="sortable asc active" data-sort-by="impressions">Impressions</a></th></tr><th><a href="javascript:void(0)" data-sort-order="desc" class="sortable desc" data-sort-by="vcr" data-default-sort="desc">VCR</a></th></thead><tbody></tbody></table>';
                }
            });

            collection = new Suit.Collection([
                { id: 1, name: 'Foo', impressions: 900, vcr: 100},
                { id: 2, name: 'Bar', impressions: 1000, vcr: 200},
                { id: 3, name: 'Lala', impressions: 5000, vcr: 300},
                { id: 4, name: 'Kaka', impressions: 7000, vcr: 400},
            ]);
            collection.sortBy = 'impressions';
        });

        afterEach(function () {
            //Backbone.history.navigate.restore();
        });

        it('should test the data-default-sort of the vcr column to sort in desc when clicked', function () {
            table = new TableViewComponent({collection : collection});
            table.render();
            collection.trigger('sync');

            var vcrFilterEl = table.$el.find('a[data-sort-by="vcr"]').trigger('click');

            // The list should be sorted now
            expect(table.$el.find('tbody').children().first().text()).toBe('4Kaka7000400');
            expect(table.$el.find('tbody').children().last().text()).toBe('1Foo900100');

            // The order is now by name
            expect(vcrFilterEl.hasClass('active desc')).toBe(true);
            expect(vcrFilterEl.attr('data-default-sort')).toBe('desc');
            expect(table.$el.find('a.active').length).toBe(1);

        });

    });
});
