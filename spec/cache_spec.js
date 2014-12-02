'use strict';

describe('Suit.Cache', function () {

    var cache;

    beforeEach(function () {
        cache = new Suit.Cache();
    });

    it('should set cache', function () {
        var timestamp = moment();
        var momentStub = sinon.stub(window, 'moment');
        momentStub.returns(timestamp);
        cache.set('key', 'value');
        expect(cache.data.key).toEqual({value: 'value', timestamp: timestamp});
        momentStub.restore();
    });

    it('should get cache', function () {
        cache.set('key', 'value');
        expect(cache.get('key')).toEqual('value');
    });

    it('should return undefined because cached expired', function () {
        cache.expirationRule = function () { return true; };
        cache.set('key', 'value');
        expect(cache.get('key')).toBeUndefined();
    });

});
