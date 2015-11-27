'use strict';

var Can = function (options) {
    options = options || {};
    this.initialize.apply(this, arguments);
};

var Events = Backbone.Events;

_.extend(Can.prototype, Events, /** @lends Can.prototype */{
    /**
      * @class Suit.Can
      * @classdesc Suit framework controller access moderator. Model to be User "CAN" perform this action.
      *
      * <h4>Usage:</h4>
      *
      * <p>When you decide to create a controller action, that you want to regulate access, you should update the can.js file located in app/can.js.<br/>
      * <br />
      *
      * <p>The can file has the App.canRules object. This object contains the following tree structure:<br />
      * <br />
      * - controller<br />
      * - - action<br />
      * - - - permissions: ['admin', 'ad_ops', etc]  (if not defined everybody is allowed)<br />
      * - - - redirect: 'router to navigate to'<br />
      * - - - message: 'access message to display when the access is restricted'<br />
      * <br />
      *
      * @constructs Suit.Can
      */
    initialize: function () {},

    go: function (controller, action) {
        var rule;
        try {
            // Check if it requires login. Default is True.
            var baseRule = App.canRules;
            var controllerRule = baseRule[controller] || {};
            rule = controllerRule[action] || {};

            // Check if the global application requires login.
            if (!(rule.requireLogin === false ||
                  (controllerRule.requireLogin === false && !rule.requireLogin) ||
                  (baseRule.requireLogin === false && !controllerRule.requireLogin && !rule.requireLogin)) && !this.authenticate()) {
                return false;
            }

            if (!rule || !rule.permissions) {
                return true;
            }
        } catch (error) {
            return true;
        }
        var user = App.currentUser;
        var permissions = rule.permissions;
        if (_.contains(permissions, user.get('permission'))) {
            return true;
        }
        return false;
    },
    authenticate: function () {
        // Check if the user is logged in.
        if (_.isNull(Suit.LocalStorage.getItem('token'))) {
            App.Controllers.Sessions.logout();
            return false;
        } else {
            if (_.isNull(App.currentUser)) {
                App.currentUser = App.Models.User.find({token: Suit.LocalStorage.getItem('token')}) || App.Models.User.findOrCreate({token: Suit.LocalStorage.getItem('token')});
            }
            if (App.currentUser.isNew()) {
                App.currentUser.fetchMe();
            }
        }
        return true;
    }
});

// Copy the Backbone extend helper function.
Can.extend = Backbone.Model.extend;
Suit.Can = new Can();
