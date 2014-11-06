/** @namespace */
Suit = {
    /** @namespace */
    Components: {}
};

// Start application.
$( function () {
    // Prepare the body.
    $('body').prepend(App.mainView.render().el);

    // Start routes.
    App.mainRouter = new App.Routers.Main();
    _.each(App.Routers, function (value, key) {
        new App.Routers[key]();
    });
    Backbone.history.start({pushState: false});
});
