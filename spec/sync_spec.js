/* global backBoneSync, spyOn */
'use strict';

describe('Backbone sync', function () {
    var model, opts, successSpy;

    beforeEach(function () {
        successSpy = sinon.spy();
        spyOn(window, 'backBoneSync');
        model = new Suit.Model();
        opts = {
            originalEvent: {
                type: 'submit',
                srcElement: $('<form method="POST"></form>')[0]
            },
            success: function () {
                successSpy();
            }
        };
    });

    it('sync read', function () {
        Backbone.sync('read', model, opts);
        expect(backBoneSync.calls[0].args[0]).toBe('read');
    });

    it('sync patch', function () {

        Backbone.sync('patch', model, opts);
        expect(backBoneSync.calls[0].args[0]).toBe('patch');
    });

    it('trigger the model with the sent method', function () {
        var callback = sinon.spy();
        model.on('read', callback);
        Backbone.sync('read', model, opts);
        opts.success();

        expect(successSpy.called).toBe(true);
        expect(callback.called).toBe(true);
    });
});
