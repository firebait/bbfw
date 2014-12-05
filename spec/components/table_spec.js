'use strict';

describe('Suit Table Component', function () {

    var collection, view, spy, el, html, tableComponent, model, testDiv;

    it('should throw an error with an invalid collection', function () {
        html = '<div><span></span><table id="itemsCollection" suit-component-table data data-table-collection="collection" data-table-sort="id">';
        html += '<thead>';
        html += '<th><a href="#table/index" class="sortable" data-sort-by="id" data-default-sort="asc">ID</a></th>';
        html += '<th><a href="#table/index?foo=bar" class="sortable" data-sort-by="name" data-default-sort="desc">Name</a></th>';
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

        view = new Suit.View({el: el, collection: model});


        expect(view.render).toThrow(new Error('data-table-collection must be an instance of Suit.Collection'));
    });

    describe('without infinite scroll', function () {

        beforeEach(function () {
            html = '<div><span></span><table id="itemsCollection" suit-component-table data data-table-collection="collection" data-table-sort="id">';
            html += '<thead>';
            html += '<th><a href="#table/index" class="sortable" data-sort-by="id" data-default-sort="asc">ID</a></th>';
            html += '<th><a href="#table/index?foo=bar" class="sortable" data-sort-by="name" data-default-sort="desc">Name</a></th>';
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
            tableComponent = view.components.itemsCollection;

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
                console.info('TODO: Deferred test');
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

    describe('with infinite scroll', function () {
        beforeEach(function () {
            html = '<div><span></span><table id="itemsCollection" suit-component-table data-table-infinite-scroll data-table-collection="collection" data-table-sort="id">';
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
            tableComponent = view.components.itemsCollection;

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
                console.info('TODO: Deferred test');
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

        describe('with explicit height', function () {
            beforeEach(function () {

                testDiv = $('<div id="container-' + jasmine.getEnv().currentSpec.id + '"></div>');
                $('body').append(testDiv);

                html = '<div><span></span><table id="itemsCollection" height="500" suit-component-table data-table-infinite-scroll data-table-collection="collection" data-table-sort="id">';
                html += '<thead>';
                html += '<th><a href="#table/index?test=var" class="sortable" data-sort-by="id" data-default-sort="asc">ID</a></th>';
                html += '<th><a href="#table/index" class="sortable" data-sort-by="name" data-default-sort="desc">Name</a></th>';
                html += '</thead>';
                html += '<tbody><tr>';
                html += '<td>{ row:id }</td>';
                html += '<td>{ row:name }</td>';
                html += '</tr></tbody></table></div>';
                el = $(html)[0];


                collection = new Suit.Collection([]);
                Backbone.Relational.store.reset();

                var items = [];

                for (var i = 0; i < 200; i++) {
                    items.push({ id: i, name: 'Foo' + i });
                }
                collection.reset(items);

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
                tableComponent = view.components.itemsCollection;
                testDiv.html(view.el);
            });

            afterEach(function () {
                testDiv.remove();
                if (spy.restore) {
                    spy.restore();
                }
                Backbone.Relational.store.reset();
            });

            it('should set the height of the overflow container', function () {
                expect(view.find('.infinite-scroll-container').css('height')).toEqual('500px');
            });

            it('should show a loader when scrolled to bottom', function () {
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(false);
                spy = sinon.spy(tableComponent, '_next');
                var container = view.find('.infinite-scroll-container');
                container.scrollTop(container[0].scrollHeight);
                container.trigger('scroll');
                expect(spy).toHaveBeenCalledOnce();
                container.scrollTop(0);
                container.trigger('scroll');
                expect(spy).toHaveBeenCalledOnce();
                container.scrollTop(container[0].scrollHeight);
                container.trigger('scroll');
                expect(spy).toHaveBeenCalledOnce();
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(true);
            });

            it('should remove loader when calling done from table:next event', function () {
                tableComponent.on('table:next', function (collection, done) {
                    done();
                });
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(false);
                spy = sinon.spy(tableComponent, '_next');
                var container = view.find('.infinite-scroll-container');
                container.scrollTop(container[0].scrollHeight);
                container.trigger('scroll');
                expect(spy).toHaveBeenCalledOnce();
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(false);
            });

            it('should not show a loader when scrolled to bottom if enableInfiniteScroll is false', function () {
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(false);
                tableComponent.enableInfiniteScroll = false;
                spy = sinon.spy(tableComponent, '_next');
                var container = view.find('.infinite-scroll-container');
                container.scrollTop(container[0].scrollHeight);
                container.trigger('scroll');
                expect(spy.called).toEqual(false);
            });
        });

        describe('with no height', function () {
            beforeEach(function () {

                testDiv = $('<div id="container-' + jasmine.getEnv().currentSpec.id + '"></div>');
                $('body').append(testDiv);

                html = '<div><span></span><table id="itemsCollection" suit-component-table data-table-infinite-scroll data-table-collection="collection" data-table-sort="id">';
                html += '<thead>';
                html += '<th><a href="#table/index?test=var" class="sortable" data-sort-by="id" data-default-sort="asc">ID</a></th>';
                html += '<th><a href="#table/index" class="sortable" data-sort-by="name" data-default-sort="desc">Name</a></th>';
                html += '</thead>';
                html += '<tbody><tr>';
                html += '<td>{ row:id }</td>';
                html += '<td>{ row:name }</td>';
                html += '</tr></tbody></table></div>';
                el = $(html)[0];


                collection = new Suit.Collection([]);
                Backbone.Relational.store.reset();

                var items = [];

                for (var i = 0; i < 200; i++) {
                    items.push({ id: i, name: 'Foo' + i });
                }
                collection.reset(items);

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
                tableComponent = view.components.itemsCollection;
                testDiv.html(view.el);
            });

            afterEach(function () {
                testDiv.remove();
                if (spy.restore) {
                    spy.restore();
                }
                Backbone.Relational.store.reset();
            });

            it('should set the height of the overflow container', function () {
                expect(view.find('.infinite-scroll-container').css('height')).toEqual(view.find('.infinite-scroll-container table').height() + 'px');
            });

            it('should show a loader when scrolled to bottom', function () {
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(false);
                spy = sinon.spy(tableComponent, '_next');
                var container = $(window);
                container[0].scroll(0, $(document).height());
                container.trigger('scroll');
                expect(spy).toHaveBeenCalledOnce();
                container[0].scroll(0, 0);
                container.trigger('scroll');
                expect(spy).toHaveBeenCalledOnce();
                container[0].scroll(0, $(document).height());
                container.trigger('scroll');
                expect(spy).toHaveBeenCalledOnce();
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(true);
            });

            it('should remove loader when calling done from table:next event', function () {
                tableComponent.on('table:next', function (collection, done) {
                    done();
                });
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(false);
                spy = sinon.spy(tableComponent, '_next');
                var container = $(window);
                container[0].scroll(0, $(document).height());
                container.trigger('scroll');
                expect(spy).toHaveBeenCalledOnce();
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(false);
            });

            it('should not show a loader when scrolled to bottom if enableInfiniteScroll is false', function () {
                expect(view.find('.infinite-scroll-loader').is(':visible')).toEqual(false);
                spy = sinon.spy(tableComponent, '_next');
                tableComponent.enableInfiniteScroll = false;
                var container = $(window);
                container[0].scroll(0, $(document).height());
                container.trigger('scroll');
                expect(spy.called).toEqual(false);
            });

            describe('sticky headers', function () {
                beforeEach(function () {

                    testDiv = $('<div id="container-' + jasmine.getEnv().currentSpec.id + '"></div>');
                    $('body').append(testDiv);

                    html = '<div><span></span><table id="itemsCollection" suit-component-table data-table-infinite-scroll data-table-sticky-headers data-table-collection="collection" data-table-sort="id">';
                    html += '<thead>';
                    html += '<th><a href="#table/index?test=var" class="sortable" data-sort-by="id" data-default-sort="asc">ID</a></th>';
                    html += '<th><a href="#table/index" class="sortable" data-sort-by="name" data-default-sort="desc">Name</a></th>';
                    html += '</thead>';
                    html += '<tbody><tr>';
                    html += '<td>{ row:id }</td>';
                    html += '<td>{ row:name }</td>';
                    html += '</tr></tbody></table></div>';
                    el = $(html)[0];


                    collection = new Suit.Collection([]);
                    Backbone.Relational.store.reset();

                    var items = [];

                    for (var i = 0; i < 200; i++) {
                        items.push({ id: i, name: 'Foo' + i });
                    }
                    collection.reset(items);

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
                    tableComponent = view.components.itemsCollection;
                    testDiv.html(view.el);
                });

                afterEach(function () {
                    testDiv.remove();
                    if (spy.restore) {
                        spy.restore();
                    }
                    Backbone.Relational.store.reset();
                });

                it('should stick to top of page after scrolling past header', function () {
                    var table = tableComponent.$newThead.closest('table');
                    expect(table.css('position')).not.toEqual('fixed');
                    var container = $(window);
                    container[0].scroll(0, $(document).height());
                    container.trigger('scroll');
                    expect(table.css('position')).toEqual('fixed');
                    expect(table.css('top')).toEqual('0px');

                });

                it('should unstick after scrolling back above header', function () {
                    var table = tableComponent.$newThead.closest('table');
                    expect(table.css('position')).not.toEqual('fixed');
                    var container = $(window);
                    container[0].scroll(0, $(document).height());
                    container.trigger('scroll');
                    expect(table.css('position')).toEqual('fixed');
                    expect(table.css('top')).toEqual('0px');

                    container[0].scroll(0, 0);
                    container.trigger('scroll');
                    expect(table.css('position')).not.toEqual('fixed');

                });

            });
        });

    });
});
