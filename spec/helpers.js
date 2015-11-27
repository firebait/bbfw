// Create an Application.
var App = {
    /** @namespace */
    Models: {},
    /** @namespace */
    Collections: {},
    /** @namespace */
    Views: {},
    /** @namespace */
    Controllers: {},
    /** @namespace */
    Routers: {},
    /** @namespace */
    Reports: {},
    /** @namespace */
    Helpers: {},
    /** @namespace */
    Caches: {},
    /** Stores the user that is currently logged in */
    currentUser: null,
    /** Main View for the application. */
    mainView: null,
    /** Main Router for the application */
    mainRouter: null,
    /** History object allow us to mantain in a common place the current and previous
      * route, for using the history management */
    routesHistory: {
        currentRoute: null,
        previousRoute: null
    },
    /** Application cache **/
    cache: {},
    /** Object to store form request information and argument values **/
    request: {
        params: {}
    }
};

var setUp = function () {
	// Initialize Jasmine Clock.
   	jasmine.Clock.useMock();
	// Create User model to use in our framework.
	App.Models.User = Suit.Model.extend({
		className: 'User'
	});
	// Create the main view.
	App.mainView = new Suit.View();
    // Create a router with two routes.
    var router = Suit.Router.extend({
        beforeAll: function () {},
        afterAll: function () {},
        routes: {
            '': 'index',
            'landing': 'landing',
            'style_guide': 'styleGuide'
        },
        index: function () {},
        landing: function () {},
        styleGuide: function () {},
    });
    App.mainRouter = new router();
    App.currentUser = App.Models.User.findOrCreate({id: 1, timeZone: 'utc', permission: 'ad_ops'});
    Suit.LocalStorage.setItem('token', 'something');
};

// Login before every test and render the main view
beforeEach(function () {
    setUp();
});

// Let's clean up for the messy kids that don't close their modal test views.
afterEach(function () {
	Suit.Components.Modal.closeAll();
});