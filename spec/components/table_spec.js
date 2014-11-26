'use strict';

describe('Suit Table Component', function () {

    var collection, view, spy, el, html, tableComponent, model;

    beforeEach(function () {
        html = '<div><span></span><table id="itemsCollection" suit-component-table data data-table-collection="collection" data-table-sort="id">';
        html += '<thead>';
        html += '<th><a href="#table/index?test=var" class="sortable" data-sort-by="id" data-default-sort="asc">ID</a></th>';
        html += '<th><a href="#table/index" class="sortable" data-sort-by="name" data-default-sort="desc">Name</a></th>';
        html += '</thead>';
        html += '<tbody><tr>';
        html += '<td>{ row:id }</td>';
        html += '<td>{ row:name }</td>';
        html += '</tr></tbody></table></div>';
        el = $(html)[0];


        collection = new Suit.Collection([
            { id: 1, name: 'Foo' },
            { id: 2, name: 'Bar' }
        ]);

        var ModelWithCollection = Suit.Model.extend({
            relations: [
                {
                    type: Backbone.HasMany,
                    key: 'items',
                    collectionType: 'Suit.Collection',
                    relatedModel: 'Suit.Model',
                    includeInJSON: false
                }
            ]
        });

        model = new ModelWithCollection({});
        model.get('items').reset([
            { id: 3, name: 'Child Foo' },
            { id: 4, name: 'Child Bar' }
        ]);

        view = new Suit.View({el: el, collection: collection});
        view.render();
        tableComponent = view.find('#itemsCollection').first();

    });

    afterEach(function () {
        view.close();
    });

    describe('rendering as component', function () {
        it('should initialize the table component', function () {
            spy = sinon.spy(Suit.Components.Table.prototype, 'initialize');
            view = new Suit.View({el: $(html)[0], collection: collection});
            view.render();
            expect(spy.calledOnce).toEqual(true);
            spy.restore();
        });
    });

    describe('rendering the collection', function () {
        it('should render the collection directly, with all the correct elements', function () {
            // Rows are correct
            expect(tableComponent.find('tbody').children().length).toBe(2);
            expect(tableComponent.find('tbody').children().first().text()).toBe('1Foo');
            expect(tableComponent.find('tbody').children().last().text()).toBe('2Bar');


        });

        it('should render the model:collection directly, with all the correct elements', function () {
            view = new Suit.View({el: $(html.replace('data-table-collection="collection"', 'data-table-collection="model:items"'))[0], model: model});
            view.render();
            // Rows are correct
            expect(tableComponent.find('tbody').children().length).toBe(2);
            expect(tableComponent.find('tbody').children().first().text()).toBe('1Foo');
            expect(tableComponent.find('tbody').children().last().text()).toBe('2Bar');


        });

        it('should render with the default sort order', function () {
            var idFilterEl = tableComponent.find('th a.sortable[data-sort-by="id"]').first();
            expect(idFilterEl.hasClass('active')).toBe(true);
            expect(idFilterEl.hasClass('asc')).toBe(true);
            expect(tableComponent.find('a.active').length).toBe(1);
        });
    });

    describe('sorting column', function () {

        it('should sort by correct column and default order on first click', function () {
            tableComponent.find('a.sortable[data-sort-by="name"]').first().trigger('click');
            expect(collection.sortBy).toEqual('name');
            expect(collection.sortOrder).toEqual('desc');

        });

        it('should toggle between asc and desc', function () {
            tableComponent.find('a.sortable[data-sort-by="name"]').first().trigger('click');
            expect(collection.sortBy).toEqual('name');
            expect(collection.sortOrder).toEqual('desc');
            tableComponent.find('a.sortable[data-sort-by="name"]').first().trigger('click');
            expect(collection.sortBy).toEqual('name');
            expect(collection.sortOrder).toEqual('asc');
            tableComponent.find('a.sortable[data-sort-by="name"]').first().trigger('click');
            expect(collection.sortBy).toEqual('name');
            expect(collection.sortOrder).toEqual('desc');

        });

    });
});
