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
        expect(App.cache.key).toEqual({value: 'value', timestamp: timestamp});
        momentStub.restore();
    });

    it('should get cache', function () {
        cache.set('key', 'value');
        expect(cache.get('key')).toEqual('value');
    });

    it('should not get expired cache', function () {
        cache.set('key', 'value');
        cache.expirationRule = function () { return true; };
        expect(_.isUndefined(cache.get('key'))).toEqual(true);
    });

});
