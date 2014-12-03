'use strict';

describe('Rivets Adapter', function () {
    var adapter, spy, model, obj, collection;

    var ModelWithChildren = Suit.Model.extend({
            relations: [
                {
                    type: Backbone.HasMany,
                    key: 'children',
                    collectionType: 'Suit.Collection',
                    relatedModel: 'Suit.Model'
                }
            ]
        }),
        ModelWithChild = Suit.Model.extend({
            relations: [
                {
                    type: Backbone.HasOne,
                    key: 'child',
                    relatedModel: ModelWithChildren
                }
            ]
        });

    describe(': Adapter', function () {

        beforeEach(function () {
            spy = sinon.spy();
            adapter = window.rivets.adapters[':'];
            obj = {cb: function () {}};
        });

        afterEach(function () {
            if (!_.isUndefined(spy.restore)) {
                spy.restore();
            }
        });


        describe('read', function () {

            describe('model', function () {

                it('should return a models attribute', function () {
                    model = Suit.Model.findOrCreate({id: 1, name: 'Test'});
                    expect(adapter.read(model, 'name')).toEqual('Test');
                });

                it('should return a nested models attribute', function () {
                    model = ModelWithChild.findOrCreate({id: 1});
                    model.set('child', ModelWithChildren.findOrCreate({id: 1200, name: 'Nested child'}));
                    expect(adapter.read(model, 'child:name')).toEqual('Nested child');
                });
            });


            describe('collection', function () {

                it('should return a collections attribute or method', function () {
                    var CustomCollection = Suit.Collection.extend({
                        testMethod: function () {
                            return 'test method called';
                        },
                        testAttribute: 'test attribute'
                    });
                    collection = new CustomCollection();
                    expect(adapter.read(collection, 'testMethod')).toEqual('test method called');
                    expect(adapter.read(collection, 'testAttribute')).toEqual('test attribute');
                });

                it('should return a nested collections attribute or method', function () {
                    var CustomCollection = Suit.Collection.extend({
                        testMethod: function () {
                            return 'test method called';
                        },
                        testAttribute: 'test attribute',
                        testObj: {
                            name: 'test'
                        }
                    });

                    var CustomModel = Suit.Model.extend({
                        relations: [
                            {
                                type: Backbone.HasMany,
                                key: 'children',
                                collectionType: CustomCollection,
                                relatedModel: 'Suit.Model'
                            }
                        ]
                    });
                    model = CustomModel.findOrCreate({id: 700});
                    expect(adapter.read(model, 'children.testMethod')).toEqual('test method called');
                    expect(adapter.read(model, 'children.testAttribute')).toEqual('test attribute');
                    expect(function () { adapter.read(model, 'children.testObj.name'); }).toThrow(new Error('Cannot access properties of object on relation with "."'));
                });

            });

        });

        describe('publish', function () {

            describe('model', function () {

                it('should change a models attribute', function () {
                    model = Suit.Model.findOrCreate({id: 1, name: 'Test'});
                    expect(model.get('name')).toEqual('Test');
                    adapter.publish(model, 'name', 'new value');
                    expect(model.get('name')).toEqual('new value');
                });

                it('should change a nested models attribute', function () {
                    model = ModelWithChild.findOrCreate({id: 1});
                    model.set('child', ModelWithChildren.findOrCreate({id: 1200, name: 'Nested child'}));
                    expect(model.get('child').get('name')).toEqual('Nested child');
                    adapter.publish(model, 'child:name', 'new value');
                    expect(model.get('child').get('name')).toEqual('new value');
                });
            });

            describe('collection', function () {

                it('should call a collections method or change a collections attribute', function () {
                    var CustomCollection = Suit.Collection.extend({
                        testMethod: function (value) {
                            return value;
                        },
                        testAttribute: 'test attribute'
                    });
                    collection = new CustomCollection();
                    spy = sinon.spy(collection, 'testMethod');
                    adapter.publish(collection, 'testMethod', 'publish value');
                    expect(spy).toHaveBeenCalledWith('publish value');
                    expect(collection.testAttribute).toEqual('test attribute');
                    adapter.publish(collection, 'testAttribute', 'publish value');
                    expect(collection.testAttribute).toEqual('publish value');
                });

                it('should set a nested collections attribute or method', function () {
                    var CustomCollection = Suit.Collection.extend({
                        testMethod: function (value) {
                            return value;
                        },
                        testAttribute: 'test attribute',
                        testObj: {
                            name: 'test'
                        }
                    });

                    var CustomModel = Suit.Model.extend({
                        relations: [
                            {
                                type: Backbone.HasMany,
                                key: 'children',
                                collectionType: CustomCollection,
                                relatedModel: 'Suit.Model'
                            }
                        ]
                    });
                    model = CustomModel.findOrCreate({id: 700});

                    spy = sinon.spy(model.get('children'), 'testMethod');
                    adapter.publish(model, 'children.testMethod', 'publish value');
                    expect(spy).toHaveBeenCalledWith('publish value');

                    expect(model.get('children').testAttribute).toEqual('test attribute');
                    adapter.publish(model, 'children.testAttribute', 'publish value');
                    expect(model.get('children').testAttribute).toEqual('publish value');

                    expect(function () { adapter.publish(model, 'children.testObj.name'); }).toThrow(new Error('Cannot access properties of object on relation with "."'));
                });

            });

        });

        describe('subscribe', function () {

            it('should subscribe to model change:key events', function () {
                model = Suit.Model.findOrCreate({id: 1, name: 'Test'});
                spy = sinon.spy(obj, 'cb');
                adapter.subscribe(model, 'name', obj.cb);
                model.set({name: 'test 2'});
                expect(spy).toHaveBeenCalled();
            });


            it('should subscribe to collection add, reset, remove events', function () {
                var addModel = Suit.Model.findOrCreate({id: 1000, name: 'Test'});
                collection = new Suit.Collection([
                    {id: 1, name: 'Test'},
                    {id: 2, name: 'Test'},
                    {id: 3, name: 'Test'},
                    {id: 4, name: 'Test'},
                    {id: 5, name: 'Test'}
                ]);
                spy = sinon.spy(obj, 'cb');
                adapter.subscribe(collection, '', obj.cb);
                collection.reset([]);
                collection.add(addModel);
                collection.remove(addModel);
                expect(spy).toHaveBeenCalledThrice();
            });


            it('should subscribe to nested model\'s collection add, reset, remove events', function () {
                var child = ModelWithChildren.findOrCreate({id: 20}),
                    addModel = Suit.Model.findOrCreate({id: 6, name: 'Test'});

                child.get('children').reset([
                    {id: 1, name: 'Test'},
                    {id: 2, name: 'Test'},
                    {id: 3, name: 'Test'},
                    {id: 4, name: 'Test'},
                    {id: 5, name: 'Test'}
                ]);
                model = ModelWithChild.findOrCreate({ id: 100});
                model.set('child', child);
                spy = sinon.spy(obj, 'cb');
                adapter.subscribe(model, 'child:children', obj.cb);
                child.get('children').reset([]);
                child.get('children').add(addModel);
                child.get('children').remove(addModel);
                expect(spy).toHaveBeenCalledThrice();
            });

        });
    });
});