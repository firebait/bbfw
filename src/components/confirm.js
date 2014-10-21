'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Confirm = Suit.Component.extend(/** @lends Suit.Components.Confirm.prototype */{
    /**
      * @class Suit.Components.Confirm
      * @classdesc Suit Component Framework Confirm Component.
      * The confirm component is a widget that is going to be used a an alternative
      * to the default promppt flow.
      *
      * @augments Suit.Component
      * @param {Object} options - Object to describe the default options
      * @param {String} options.title - Title for the confirmation dialog. Default: Confirm
      * @param {String} options.text - Text for the confirmation dialog. Default: Are you sure?
      * @param {Function} options.success - Function that is handled as success calllback.
      * param {Functoin} options.cancel - Function that is handled as cancel callback.
      * @constructs Suit.Components.Confirm
      */
    initialize: function (options) {
        this.title   = options.title || 'Confirm';
        this.text    = options.text || 'Are you sure?';
        this.color   = options.color || 'blue';

        Suit.Component.prototype.initialize.apply(this, [options]);

        // Modal
        this.modal = new Suit.Components.Modal({
            view: this,
            size: 'small',
            persistent: true
        });

        this.modal.show();
    },
    /** Template to use for the view */
    template: JST['suit/components/confirm'],
    /** Confirm button events */
    events: {
        'click button.yes': 'defaultSuccess',
        'click .no': 'defaultCancel'
    },
    /** Default success handler. Is a wrapper for success call */
    defaultSuccess: function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.options.success && _.isFunction(this.options.success)) {
            this.options.success.call(this);
        }
        this.modal.close();
    },
    /** Default cancel handler. Is a wrapper for cancel call */
    defaultCancel: function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.options.cancel && _.isFunction(this.options.cancel)) {
            this.options.cancel.call(this);
        }
        this.modal.close();
    }
});

// Register component.
Suit.Components.registerComponent('Confirm');
