'use strict';

Suit.Router = Backbone.Router.extend(/** @lends Suit.Router.prototype */{
    /**
      * @class Suit.Router
      * @classdesc Suit framework router for basic routing and controller delegation.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyRouter = Suit.Router.extend({});</b></p>
      *
      * <h4>Usage</h4>
      *
      * <p>When you decide to create a Router you should create it with the command line using the following command:<br/>
      * <br />
      * <b>yo suit:router [name]</b></p>
      *
      * <p>This will create two files:<br />
      * <br />
      * <b>app/routers/[name].js</b><br />
      * <b>spec/routers/[name]_spec.js</b><br />
      * <br />
      * These will be a template for testing and basic router defaults.<br />
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var router = new Suit.Router()</b></p>
      *
      * @augments Backbone.Router
      * @constructs Suit.Router
      */
    initialize: function () {
        this.on('all', this.storeRoute);
    },
    /**
      * Stores the route history object, so that we use for history management
      * purposes (like going to last known route).
      */
    storeRoute: function () {
        // Store new routes only if they changed
        if (App.routesHistory.currentRoute !== Backbone.history.fragment) {
            App.routesHistory.previousRoute = App.routesHistory.currentRoute;
            App.routesHistory.currentRoute = Backbone.history.fragment;
        }
    },
    /**
      * Override the _extractParameters, method in order to parse parameters that look like query strings
      * into an object.<br/>
      * Useful for when you want to parse routes like this:<br />
      * #status?some=value
      */
    _extractParameters: function (route, fragment) {
        var re = /([^&=]+)=?([^&]*)/g;
        var decode = function (str) {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        };
        var parseParams = function (query) {
            if (query && _.contains(query, '=')) {
                var params = {}, e;
                e = re.exec(query);
                while (e) {
                    var k = decode(e[1]);
                    var v = decode(e[2]);
                    if (params[k] !== undefined) {
                        if (!$.isArray(params[k])) {
                            params[k] = [params[k]];
                        }
                        params[k].push(v);
                    } else {
                        params[k] = v;
                    }
                    e = re.exec(query);
                }
                return Suit.Helpers.toCamelCaseObject(params);
            } else {
                return query;
            }
        };
        var result = route.exec(fragment).slice(1);
        for (var i = result.length - 1; i >= 0; i--) {
            result[i] = parseParams(result[i]);
        }
        return result.length > 1 ? result.slice(0, -1) : result;
    },
    /**
      * Override the route function so that a controller get's called on calls after the application is first loaded.
      * @param {String} route string for the current route being called.
      * @param {String} name string with the name of the function to be called.
      * @param {Function} callback function that get's called if the route is matched.
      */
    route: function (route, name, callback) {
        var router = this;

        var routerName = router.className,
            controller = App.Controllers[routerName],
            scope = router;

        if (!callback) { callback = this[name]; }
        if (!callback && controller) {
            callback = controller[name];
            scope = controller;
        }

        var f = function () {

            var goToRoute = function (args) {
                if (router.beforeEach) { router.beforeEach.apply(router, args); }
                callback.apply(scope, args);
                if (router.afterEach) { router.afterEach.apply(router, args); }
            };
            var routeStripper = /^[#\/]|\s+$/g;
            var fragment = Backbone.history.fragment;
            fragment = fragment.replace(routeStripper, '');
            // find the router, and router this route goes to.
            var handlers = Backbone.history.handlers;
            var handler = _.find(handlers, function (h) {
                if (h.route.test(fragment)) { return true; }
            });

            window.document.title = _.str.humanize(name);

            // Close all modals if the route changes.
            Suit.Components.Modal.closeAll();

            // Get all params.
            var args = router._extractParameters(handler.route, fragment);

            if (App.currentRouter !== router) {
                App.currentRouter = router;
                // On first load of the page.
                if (_.isUndefined(Backbone.history.firstLoad) || Backbone.history.firstLoad) {
                    Backbone.history.firstLoad = false;
                    App.mainRouter.beforeAll.apply(App.mainRouter, args);
                    // Call the router
                    goToRoute(args);
                    App.mainRouter.afterAll.apply(App.mainRouter, args);
                } else {
                    goToRoute(args);
                }
                return;
            }

            // Call the proper controller.
            var routerName = router.className;
            if (_.has(App.Controllers, routerName) && _.contains(_.functions(App.Controllers[routerName]), name)) {
                controller[name].apply(controller, args);
                return false;
            } else {
                goToRoute(args);
            }
        };
        return Backbone.Router.prototype.route.call(router, route, name, f);
    }
});

