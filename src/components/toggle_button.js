'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.ToggleButton = Suit.Component.extend(/** @lends Suit.Components.ToggleButton.prototype */{
    /**
      * @class Suit.Components.ToggleButton
      * @classdesc Suit component framework toggle button component.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.ToggleButton
      */
    initialize: function () {
        Suit.Component.prototype.initialize.apply(this, this.options);
    },
    /** Toggle events */
    events: {
        'click': 'toggle'
    },
    /** Switches the toggle state of the button and triggers the toggle event with the state (true/on and false/off) as the only parameter */
    toggle: function () {
        var el = this.$el;
        el.toggleClass('active');
        el.trigger('toggled', el.hasClass('active'));
        this.trigger('toggled', el.hasClass('active'));
    }
});

// Register component.
Suit.Components.registerComponent('ToggleButton');
