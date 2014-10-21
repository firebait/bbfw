'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.SuitTab = Suit.Component.extend(/** @lends Suit.Components.SuitTab.prototype */{
    /**
      * @class Suit.Components.SuitTab
      * @classdesc Suit component framework tabbing component.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.SuitTab
      */
    initialize: function () {
        Suit.Component.prototype.initialize.apply(this, this.options);
    },
    /** Tab events */
    events: {
        'click .suit-tab-link': 'switchTab'
    },
    /** Switches the tab using the currently clicked tab event */
    switchTab: function (event) {
        this.$el.find('.suit-tab-link').removeClass('active');
        $(event.currentTarget).addClass('active');
    }
});

// Register component.
Suit.Components.registerComponent('SuitTab');
