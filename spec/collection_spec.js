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
});
