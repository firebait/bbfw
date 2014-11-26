'use strict';

var Controller = Suit.Controller = function (options) {
    options = options || {};

    this.initialize.apply(this, arguments);
};

var Events = Backbone.Events;

_.extend(Controller.prototype, Events, /** @lends Controller.prototype */{
    /**
      * @class Suit.Controller
      * @classdesc Suit frameword controller class that handles fetching data, rendering components, rendering views, updating urls and the page title.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyController = Suit.Controller.extend({});</b></p>
      *
      * <p>This will create a controller object with all of the features that Suit.Controller has to offer.</p>
      *
      * <h4>Usage:</h4>
      *
      * <p>When you decide to create a Controller you should create it with the command line using the following command:<br/>
      * <br />
      * <b>yo suit:controller [name]</b></p>
      *
      * <p>This will create two files:<br />
      * <br />
      * <b>app/controllers/[name].js</b><br />
      * <b>spec/controlles/[name]_spec.js</b><br />
      * <br />
      * These will be a template for testing and basic controller defaults.<br />
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var controller = new Suit.Controller()</b></p>
      *
      * @constructs Suit.Controller
      */
    //initialize: function () {},
    /**
      * The _initialize function will check if the current user has permissions to execute the controller
      * depending on the App.can object.<br />
      * If the user does not meet the criteria, then it will be sent to redirect url in the object. If not defined,
      * the user will be redirected to the main page.
      */
    initialize: function () {
        var self = this;
        // Remove functions that don't need to be authenticated.
        var functions = _.without(_.functions(this), 'goBack');
        _.each(functions, function (func) {
            var actions = _.functions(Events);
            _.zip(actions, ['initialize', 'constructor']);
            if (!_.contains(actions, func)) {
                self[func] = _.wrap(self[func], function (f) {
                    // Check if the user can access.
                    if (Suit.Can.go(self.className, func)) {
                        return f.apply(self, Array.prototype.slice.call(arguments, 1));
                    }
                });
            }
        });
    },
    /**
      * Set the window.document.title, so that it has a meaningful title
      * @param {String} title - New title that is going to be applied into
      */
    setTitle: function (title) {
        window.document.title = 'SET - ' + title;
    },
    /**
      * Redirects back to last known route, if any, if not it will use the fallback
      * URL.
      * @param {String} fallback - Fallback route, if there is no previous URL
      * @param {Boolean} trigger - If you want to trigger the navigation
      */
    goBack: function (fallback, trigger) {
        fallback = fallback || null;
        trigger  = !_.isUndefined(trigger) ? trigger : true;

        var previousRoute = App.routesHistory.previousRoute;

        if (previousRoute) {
            Backbone.history.navigate(previousRoute, {trigger: trigger});
        } else if (fallback) {
            Backbone.history.navigate(fallback, {trigger: trigger});
        } else {
            Backbone.history.navigate('', {trigger: trigger});
        }
    }
});

// Copy the Backbone extend helper function.
Controller.extend = Backbone.Model.extend;
