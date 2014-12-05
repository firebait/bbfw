'use strict';

describe('Suit Router', function () {
    var spy, router;

    beforeEach(function () {
        App.Routers.Main = Suit.Router.extend({
            className: 'Main',
            routes: {
                '': 'rootPage',
                'page-one': 'pageOne',
                'page-two': 'pageTwo',
                '*actions': 'defaultPage'
            },
            beforeAll: function () {},
            afterAll: function () {},
            beforeEach: function () {},
            afterEach: function () {}
        });

        var Controller = Suit.Controller.extend({
            initialize: function (options) {
                Suit.Controller.prototype.initialize.apply(this, [options]);
            },
            className: 'Main',
            rootPage: function () {},
            pageOne: function () {},
            pageTwo: function () {},
            defaultPage: function () {},

        });
        App.Controllers.Main = new Controller();

        App.Routers.Other = Suit.Router.extend({
            className: 'Other',
            routes: {
                'other-page': 'otherPage',
            },
            beforeAll: function () {},
            afterAll: function () {},
            beforeEach: function () {},
            afterEach: function () {}
        });
        var OtherController = Suit.Controller.extend({
            initialize: function (options) {
                Suit.Controller.prototype.initialize.apply(this, [options]);
            },
            className: 'Other',
            otherPage: function () {}

        });
        App.Controllers.Other = new OtherController();

        Backbone.history.start({pushState: false});

    });

    afterEach(function () {
        router = null;
        Backbone.history.stop();
    });

    describe('routing', function () {

        it('should call the before filter before routing', function () {
            router = new App.Routers.Main();
            spy = sinon.spy(router, 'beforeEach');
            Backbone.history.navigate('#/', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            router = null;
            spy.restore();

            router = new App.Routers.Main();
            spy = sinon.spy(router, 'beforeEach');
            Backbone.history.navigate('#/page-one', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            router = null;
            spy.restore();

            router = new App.Routers.Main();
            spy = sinon.spy(router, 'beforeEach');
            Backbone.history.navigate('#/no-page', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            router = null;
            spy.restore();

        });

        it('should call the after filter after routing', function () {
            router = new App.Routers.Main();
            spy = sinon.spy(router, 'afterEach');
            Backbone.history.navigate('#/', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            router = null;
            spy.restore();

            router = new App.Routers.Main();
            spy = sinon.spy(router, 'afterEach');
            Backbone.history.navigate('#/page-one', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            router = null;
            spy.restore();

            router = new App.Routers.Main();
            spy = sinon.spy(router, 'afterEach');
            Backbone.history.navigate('#/no-page', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            router = null;
            spy.restore();
        });

        it('should call the default path if there is no path', function () {
            spy = sinon.spy(App.Controllers.Main, 'rootPage');
            router = new App.Routers.Main();
            Backbone.history.navigate('#/', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            spy.restore();
        });

        it('should call the correct controller method when route is changed', function () {
            spy = [];
            spy.push(sinon.spy(App.Controllers.Main, 'pageOne'));
            spy.push(sinon.spy(App.Controllers.Main, 'pageTwo'));
            spy.push(sinon.spy(App.Controllers.Main, 'defaultPage'));
            router = new App.Routers.Main();

            Backbone.history.navigate('#/page-one', { trigger: true });
            expect(spy[0].calledOnce).toEqual(true);

            Backbone.history.navigate('#/page-two', { trigger: true });
            expect(spy[1].calledOnce).toEqual(true);

            Backbone.history.navigate('#/page-not-in-router', { trigger: true });
            expect(spy[2].calledOnce).toEqual(true);

            _.each(spy, function (s) {
                s.restore();
            });
            spy = null;

        });

        it('should call the layout function and the beforeEach function when it changes router', function () {
            spy = [];
            router = new App.Routers.Main();
            var otherRouter = new App.Routers.Other();
            spy.push(sinon.spy(router, 'layout'));
            spy.push(sinon.spy(router, 'beforeEach'));
            spy.push(sinon.spy(otherRouter, 'layout'));
            spy.push(sinon.spy(otherRouter, 'beforeEach'));

            Backbone.history.navigate('#/page-one', { trigger: true });
            expect(spy[1].calledOnce).toEqual(true);
            expect(spy[1].calledOnce).toEqual(true);
            expect(spy[2].calledOnce).toEqual(false);
            expect(spy[3].calledOnce).toEqual(false);

            Backbone.history.navigate('#/other-page', { trigger: true });
            expect(spy[2].calledOnce).toEqual(true);
            expect(spy[3].calledOnce).toEqual(true);

            _.each(spy, function (s) {
                s.restore();
            });
            spy = null;
        });

        it('should be able to use multiple routers', function () {
            spy = sinon.spy(App.Controllers.Main, 'defaultPage');
            router = new App.Routers.Main();
            Backbone.history.navigate('#/page-not-in-router', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            spy.restore();
            spy = sinon.spy(App.Controllers.Other, 'otherPage');
            router = new App.Routers.Other();
            Backbone.history.navigate('#/other-page', { trigger: true });
            expect(spy.calledOnce).toEqual(true);
            spy.restore();

        });

        describe('params', function () {


            it('should pass params to controller method', function () {
                spy = sinon.spy(App.Controllers.Main, 'pageOne');
                router = new App.Routers.Main();
                Backbone.history.navigate('#/page-one?id=100&name=test', { trigger: true });
                expect(spy).toHaveBeenCalledWith({ id: '100', name: 'test' });
                spy.restore();
            });

            it('should put multiple defined keys into an array', function () {
                spy = sinon.spy(App.Controllers.Main, 'pageOne');
                router = new App.Routers.Main();
                Backbone.history.navigate('#/page-one?id=100&name=test&id=200', { trigger: true });
                expect(spy).toHaveBeenCalledWith({ id: ['100', '200'], name: 'test' });
                spy.restore();
                spy = sinon.spy(App.Controllers.Main, 'pageOne');
                router = new App.Routers.Main();
                Backbone.history.navigate('#/page-one?id=100&name=test&id=200&id=300', { trigger: true });
                expect(spy).toHaveBeenCalledWith({ id: ['100', '200', '300'], name: 'test' });
                spy.restore();
            });

        });

    });

});