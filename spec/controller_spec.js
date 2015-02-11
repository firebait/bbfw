'use strict';

describe('Suit Controller', function () {

    var controller;

    beforeEach(function () {
        // Create a controller.
        var Controller = Suit.Controller.extend({
            test: function () {
                return 'testCalled';
            },
            className: 'Test'
        });
        // Start Backbone.History
        Backbone.history.start({silent: true, pushState: false});
        // Current User.
        App.currentUser = App.Models.User.findOrCreate({id: 1});
        controller = new Controller();
    });

    afterEach(function () {
        Backbone.history.stop();
    });

    describe('initialization', function () {
        it('should verify that the test function is allowed for a user', function () {
            var canStub = sinon.stub(Suit.Can, 'go', function () { return false; });
            expect(controller.test()).toBe(undefined);
            canStub.restore();
        });
    });

    describe('title management', function () {
        it('should change the page title using SET-XXXX format', function () {
            controller.setTitle('other page');
            expect(window.document.title).toEqual('SET - other page');
        });
    });

    describe('goBack functionality', function () {

        it('should go to last known route, if it exists', function () {
            Backbone.history.navigate('#landing', true);
            Backbone.history.navigate('#style_guide', true);
            controller.goBack();
            expect(Backbone.history.fragment).toBe('landing');
        });

        it('should go to fallback, if no last route', function () {
            App.routesHistory.previousRoute = null;
            controller.goBack('#style_guide');
            expect(Backbone.history.fragment).toBe('style_guide');
        });

        it('should go to index page, if last known route and fallback don\'t exist', function () {
            var historySpy = sinon.spy(Backbone.history, 'navigate');
            App.routesHistory.previousRoute = null;
            controller.goBack();
            expect(historySpy).toHaveBeenCalled();
            expect(historySpy).toHaveBeenCalledWith('');
            Backbone.history.navigate.restore();
        });
    });

    describe('should test if user is autenticated but not allowed to Suit Can go then should navigate to home', function () {
        it('should verify that url redirection is to / when authenticated but does not have Can Go', function () {
            var historySpy = sinon.spy(Backbone.history, 'navigate');
            var canGoFalse = sinon.stub(Suit.Can, 'go', function () { return false; });
            var canAuthenticate = sinon.stub(Suit.Can, 'authenticate', function () { return true; });
            controller.initialize();
            expect(historySpy).toHaveBeenCalled();
            expect(historySpy).toHaveBeenCalledWith('/');
            Backbone.history.navigate.restore();
            canGoFalse.restore();
            canAuthenticate.restore();
        });
    });
});
