'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Modal = Suit.Component.extend(/** @lends Suit.Components.Modal.prototype */{
    /**
      * @class Suit.Components.Modal
      * @classdesc It creates a new Modal to show on the screen.<br />
      * The options support the following:<br />
      * view: View to render inside the modal.<br />
      * size: [small/large], if left empty it will render de default size.<br />
      * persistent: [true/false], if the modal cannot be closed by clicking outside. Default: false.
      * @augments Suit.Component
      * @param {object} options Includes the View and the size of the modal.
      * @constructs Suit.Components.Modal
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);

        // Default size is no size.
        this.size = '';

        // Default modal persistent.
        this.persistent = false;

        if (!_.isUndefined(options)) {
            if (!_.isUndefined(options.view)) {
                this.appendView(options.view);
            }
            if (!_.isUndefined(options.size) && (options.size === 'large' || options.size === 'small')) {
                this.$el.addClass(options.size);
            }
            if (!_.isUndefined(options.persistent)) {
                this.persistent = options.persistent;
            }
        }
        // Create this modals, overlay.
        this.overlay = $('<div class="suit-modal-overlay"></div>');
        // Attach and event to the overlay to close the modal.
        var self = this;

        if (this.persistent === false) {
            this.overlay.bind('click', function (event) {
                if (event.target === this) {
                    self.close();
                }
            });
        }
        // Listen to the onClose event and close the overlay and unblur the screen.
        this.listenTo(this, 'beforeClose', this.resetView);

        // Add modal to currentModals array.
        Suit.Components.Modal.currentModals.push(this);
        Suit.Components.Modal.currentModals = _.uniq(Suit.Components.Modal.currentModals);

        // Show your modal on initialize.
        this.show();
    },
    /** Modal template will be empty */
    template: function () { return ''; },
    /** Modal class is 'suit-modal' */
    className: 'suit-modal',
    /** Modal events */
    events: {
        'click .close': 'closeModal'
    },
    /** Prevent all defaults and close this modal */
    closeModal: function (event) {
        event.preventDefault();
        this.close();
    },
    /** Appends the overlay and modal to the body while setting the proper z-indexes and removing the scrolling capabilities from the body */
    show: function () {
        //var self = this;
        var el = this.$el;
        // Set the z-indexes.
        var zIndex = 1000 + $('.suit-modal').length * 2;
        this.overlay.css('z-index', zIndex);
        zIndex++;
        el.css('z-index', zIndex);
        // Add blur to the main view.
        //App.mainView.$el.addClass('blur');
        // Remove scrolling from the body.
        $('body').css('overflow', 'hidden');
        $('body').append(this.overlay);
        el.hide();
        this.overlay.append(this.el);

        // show, align and hide the modal so no one knows, shhhh!!!!
        //el.show();
        //var overlayHeight = self.overlay.height();
        //var height = el.height();
        //var top = -(height / 2);
        //if (height > overlayHeight - 30) {
        //    top = -(overlayHeight / 2) + 60;
        //}
        //el.css('margin-top', top + 'px');
        //el.hide();

        el.fadeIn(200);
    },
    /** It resets the view to it's original state by removing the blur on the main view and restoring the scroll on the body. */
    resetView: function () {
        // Remove this modal from currentModals Array.
        Suit.Components.Modal.currentModals.splice(Suit.Components.Modal.currentModals.indexOf(this), 1);
        // Restore scrolling to the body.
        $('body').css('overflow', 'auto');
        this.overlay.unbind('click');
        this.overlay.remove();
        // Remove blur from main view.
        App.mainView.$el.removeClass('blur');
    }
    // modal sizes and pop up type.
});

Suit.Components.Modal.currentModals = [];
Suit.Components.Modal.closeAll = function () {
    _.each(Suit.Components.Modal.currentModals, function (modal) {
        modal.close();
    });
};
