'use strict';

describe('Suit Collection', function () {

    var collection;
    var model1, model2, model3, sum;

    beforeEach(function () {
        sum = function () {
            return this.get('a') + this.get('b');
        };
        model1 = new Suit.Model({name: 'Alex', startDate: '2012-01-2', a: 10, b: 10});
        model2 = new Suit.Model({name: 'Bob', startDate: '2012-01-3', a: 5, b: 5});
        model3 = new Suit.Model({name: 'Charlie', startDate: '2012-01-4', a: 1, b: 1});
        model1.sum = sum;
        model2.sum = sum;
        model3.sum = sum;
        collection = new Suit.Collection([model1, model2, model3]);
        collection.sortBy = 'name';
        collection.sortOrder = 'asc';
    });

    it('should not sort if there is no sortBy or sortOrder', function () {
        collection.sortBy = '';
        collection.sort();
        expect(collection.models[0].get('name')).toBe(model1.get('name'));
        expect(collection.models[1].get('name')).toBe(model2.get('name'));
        expect(collection.models[2].get('name')).toBe(model3.get('name'));

        collection.sortBy = 'name';
        collection.sortOrder = '';
        collection.sort();
        expect(collection.models[0].get('name')).toBe(model1.get('name'));
        expect(collection.models[1].get('name')).toBe(model2.get('name'));
        expect(collection.models[2].get('name')).toBe(model3.get('name'));
    });

    it('should sort by name ascending', function () {
        collection.sort();
        expect(collection.models[0].get('name')).toBe(model1.get('name'));
        expect(collection.models[1].get('name')).toBe(model2.get('name'));
        expect(collection.models[2].get('name')).toBe(model3.get('name'));
    });

    it('should sort by name descending', function () {
        collection.sortOrder = 'desc';
        collection.sort();
        expect(collection.models[0].get('name')).toBe(model3.get('name'));
        expect(collection.models[1].get('name')).toBe(model2.get('name'));
        expect(collection.models[2].get('name')).toBe(model1.get('name'));
    });

    it('should sort by date ascending', function () {
        collection.sortBy = 'startDate';
        collection.sort();
        expect(collection.models[0].get('name')).toBe(model1.get('name'));
        expect(collection.models[1].get('name')).toBe(model2.get('name'));
        expect(collection.models[2].get('name')).toBe(model3.get('name'));
    });

    it('should sort by date ascending', function () {
        collection.sortBy = 'startDate';
        collection.sort();
        expect(collection.models[0].get('name')).toBe(model1.get('name'));
        expect(collection.models[1].get('name')).toBe(model2.get('name'));
        expect(collection.models[2].get('name')).toBe(model3.get('name'));
    });

    it('should sort by function passed in', function () {
        collection.sortBy = 'function:sum';
        collection.sort();
        expect(collection.models[0].get('name')).toBe(model3.get('name'));
        expect(collection.models[1].get('name')).toBe(model2.get('name'));
        expect(collection.models[2].get('name')).toBe(model1.get('name'));
    });

    describe('dirty checking', function () {
        beforeEach(function () {
            var Model, Collection;
            Model = Suit.Model.extend({
                initialize: function () {
                    Suit.Model.prototype.initialize.apply(this);
                },
                url: '/api'
            });
            model1 = new Model({name: 'test 1'});
            model2 = new Model({name: 'test 2'});
            model3 = new Model({name: 'test 3'});
            Collection = Suit.Collection.extend({
                initialize: function () {
                    Suit.Collection.prototype.initialize.apply(this);
                },
                model: Model
            });
            collection = new Collection([model1, model2]);
        });

        afterEach(function () {
            collection.reset();
            model1.destroy();
            model2.destroy();
            model3.destroy();
        });

        it('should set the isDirty flag to true when the add event has been triggered', function () {
            expect(collection.isDirty).toBeFalsy();
            collection.add(model3);
            expect(collection.isDirty).toBeTruthy();
        });

        it('should set the isDirty flag to true when the remove event has been triggered', function () {
            expect(collection.isDirty).toBeFalsy();
            collection.remove(collection.models[0]);
            expect(collection.isDirty).toBeTruthy();
        });

        it('should set the isDirty flag to true when the change event has been triggered', function () {
            expect(collection.isDirty).toBeFalsy();
            collection.models[0].set({name: 'TEST 1'});
            expect(collection.isDirty).toBeTruthy();
        });

        it('should set the isDirty flag to false when a new model has been added but then it was removed before saving it', function () {
            collection.add(model3);
            expect(collection.isDirty).toBeTruthy();
            collection.remove(collection.models[2]);
            expect(collection.isDirty).toBeFalsy();
        });

        it('should set the isDirty flag to false when removing and adding back the models from a collection', function () {
            collection.reset([model3, model1]);
            expect(collection.isDirty).toBeFalsy();

            collection.remove(collection.models[0]);
            collection.remove(collection.models[1]);
            expect(collection.isDirty).toBeTruthy();

            collection.add(model3);
            collection.add(model1);
            expect(collection.isDirty).toBeFalsy();
        });

        it('should set the isDirty flag to true when a new model has been added, then changed and finally changed back to its original values', function () {
            collection.add(model3);
            expect(collection.isDirty).toBeTruthy();
            collection.models[2].set({name: 'TEST 3'});
            expect(collection.isDirty).toBeTruthy();
            collection.models[2].set({name: 'test 3'});
            expect(collection.isDirty).toBeTruthy();
        });

        it('should revert the collection after removing models', function () {
            collection.reset([model1, model2]);
            expect(collection.isDirty).toBeFalsy();

            collection.remove(model1);
            collection.remove(model2);
            expect(collection.isDirty).toBeTruthy();

            collection.revert();
            expect(collection.isDirty).toBeFalsy();
            expect(collection.length).toBe(2);
        });

        it('should revert the collection after adding models', function () {
            collection.reset([model2]);
            expect(collection.isDirty).toBeFalsy();

            collection.add(model1);
            collection.add(model3);
            expect(collection.isDirty).toBeTruthy();

            collection.revert();
            expect(collection.isDirty).toBeFalsy();
            expect(collection.length).toBe(1);
        });

        it('should revert the collection after adding and removing models', function () {
            collection.reset([model1, model2]);
            expect(collection.isDirty).toBeFalsy();

            collection.remove(model2);
            collection.add(model3);
            expect(collection.isDirty).toBeTruthy();

            collection.revert();
            expect(collection.isDirty).toBeFalsy();
            expect(collection.models[0].get('name')).toBe('test 1');
            expect(collection.models[1].get('name')).toBe('test 2');
        });

        it('should revert the collection after adding and changed the added model', function () {
            collection.reset([model1]);
            expect(collection.isDirty).toBeFalsy();

            collection.add(model2);
            model2.set({name: 'model 2 I was changed'});
            model1.set({name: 'model 1 test changed'});
            expect(collection.checkAndGetDirtyModels().length).toBe(2);
            expect(collection.isDirty).toBeTruthy();

            collection.revert();
            expect(collection.isDirty).toBeFalsy();
            expect(collection.length).toBe(1);
        });

        it('should return zero dirty models if there has not been any action of modification before calling the function checkAndGetDirtyModels', function () {
            expect(collection.checkAndGetDirtyModels()).toEqual([]);
        });

        it('should return all dirty models if there has been a change action before calling the function checkAndGetDirtyModels', function () {
            collection.models[0].set({name: 'TEST 1'});
            var result = collection.checkAndGetDirtyModels();
            expect(result[0].model instanceof Suit.Model).toBeTruthy();
            expect(result).toEqual([{model: model1, action: 'change'}]);
        });

        it('should return all dirty models if there has been a remove action before calling the function checkAndGetDirtyModels', function () {
            collection.remove(model1);
            var result = collection.checkAndGetDirtyModels();
            expect(result[0].model instanceof Suit.Model).toBeTruthy();
            expect(result[0].model.attributes).toEqual(model1.attributes);
            expect(result[0].model.cid !== model1.cid).toBeTruthy();
            expect(result[0].action).toBe('remove');
        });

        it('should return one instance of dirty model if there has been an add and change action before calling the function checkAndGetDirtyModels', function () {
            collection.add(model3);
            collection.models[2].set({name: 'TEST 3'});
            var result = collection.checkAndGetDirtyModels();
            expect(result).toEqual([{model: model3, action: 'add'}]);
        });
    });
});
