/* global spyOn */
'use strict';
describe('App start script', function () {
    it('should append main view, start backbone history and router', function () {
        var tempjQuery = $;

        var prepend = sinon.spy();
        $ = function () {
            return {
                prepend: prepend
            };
        };

        spyOn(App.Routers, 'Main');
        spyOn(Backbone.history, 'start');

        Suit.appStart();

        expect(prepend.called).toBe(true);
        expect(App.Routers.Main).toHaveBeenCalled();
        expect(Backbone.history.start).toHaveBeenCalled();

        $ = tempjQuery;
    });
});
