'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}
Suit.Components.Alert = Suit.Component.extend(/** @lends Suit.Components.Alert.prototype */{
    /**
      * @class Suit.Components.Alert
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        this.type = this.options.type || 'information';
        this.timeout = this.options.timeout;
        this.message = this.options.message || 'Suit alert box!';
        this.listenTo(Backbone.history, 'route', this.close);
    },
    /** className for the component, there are four(4) types of alerts. */
    className: function () {
        return 'alert-box-' + this.type;
    },
    /** Tagnanme for this component is a */
    tagName: 'a',
    /** Suppress the href element on the click event */
    attributes: {href: 'javascript:void(0);'},
    /** Component template */
    template: JST['suit/components/alert'],
    /** Events that this view responds to */
    events: {
        'click': 'close'
    },
    /** Messages to be shown in the alert box */
    message: 'Suit alert box!',
    /** Type of alert box, it could be (confirmation, error, warning, information) */
    type: 'information',
    /** Alert box icon to show before text */
    alertIcon: 'i',
    afterRender: function () {
        if (this.timeout) {
            var self = this;
            this.$el.delay(this.timeout).fadeOut('slow', function () {
                self.close();
            });

        }
    }

});
Suit.Components.ConfirmationAlert = Suit.Components.Alert.extend(/** @lends Suit.Component.ConfirmationAlert.prototype */{
    initialize: function (options) {
        Suit.Components.Alert.prototype.initialize.apply(this, [options]);
        this.timeout = this.options.timeout || 2000;
    },
    /**
      * @class Suit.Components.ConfirmationAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-confirmation',
    alertIcon: 'c'
});
Suit.Components.ErrorAlert = Suit.Components.Alert.extend(/** @lends Suit.Components.ErrorAlert.prototype */{
    /**
      * @class Suit.Components.ErrorAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-error',
    alertIcon: 'e'
});
Suit.Components.WarningAlert = Suit.Components.Alert.extend(/** @lends Suit.Components.WarningAlert */{
    /**
      * @class Suit.Components.WarningAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-warning',
    alertIcon: 'a'
});
Suit.Components.InformationAlert = Suit.Components.Alert.extend(/** @lends Suit.Components.InformationAlert.prototype */{
    /**
      * @class Suit.Components.InformationAlert
      * @augments Suit.Components.Alert
      */
    className: 'alert-box-information',
    alertIcon: 'i'
});
