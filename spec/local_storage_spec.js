'use strict';

describe('Suit Local Storage', function () {

    afterEach(function () {
        Suit.LocalStorage.removeAll();
    });

    it('should get a storage', function () {
        expect(Suit.LocalStorage._getStore()).toBeDefined();
    });

    it('should set and get an item into the storage', function () {
        expect(Suit.LocalStorage.setItem('key', 'value')).not.toBe(null);
        expect(Suit.LocalStorage.getItem('key')).toBe('value');
    });

    it('should set and get an item into the storage', function () {
        expect(Suit.LocalStorage.setItem('key', 'value')).not.toBe(null);
        expect(Suit.LocalStorage.getItem('key')).toBe('value');
    });

    it('should remove an item from the storage', function () {
        Suit.LocalStorage.setItem('key_1', 'value_1');
        Suit.LocalStorage.removeItem('key_1');
        expect(Suit.LocalStorage.getItem('key_1')).toBe(null);
    });

    it('should remove all items from the storage', function () {
        Suit.LocalStorage.setItem('key_1', 'value_1');
        Suit.LocalStorage.setItem('key_2', 'value_2');
        Suit.LocalStorage.removeAll();
        expect(Suit.LocalStorage.getItem('key_1')).toBe(null);
        expect(Suit.LocalStorage.getItem('key_2')).toBe(null);
    });

    it('should return null when getting an item that is not stored', function () {
        expect(Suit.LocalStorage.getItem('key')).toBe(null);
    });

    it('should return null when setting a null key to the storage', function () {
        expect(Suit.LocalStorage.setItem(null, 'value')).toBe(null);
    });

    it('should return null when removing an item that is not stored', function () {
        expect(Suit.LocalStorage.removeItem('key_5')).toBe(null);
    });

    it('should save into the storage the object attributes', function () {
        var object = {};
        _.extend(object, Suit.LocalStorage, {'id': '123', 'className': 'testClassName', 'attributes': [{'key1': 'value1'}, {'key2': 'value2'}]});
        object.saveToLocalStorage('testEvent');
        expect(Suit.LocalStorage.getItem('testClassName123')).toBe('{"0":{"key1":"value1"},"1":{"key2":"value2"}}');
    });
});