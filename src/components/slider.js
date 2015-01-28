'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Slider = Suit.Component.extend(/** @lends Suit.Components.Slider.prototype */{
    /**
      * @class Suit.Components.Slider
      * @classdesc Suit component framework slider component.
      *
      * <p>Attributes to be set in mark-up</p>
      * <p>It takes the same attributes as the DragDealer plugin as data attributes:</p>
      * <p>
            data-disabled = false<br/>
            data-horizontal = true<br/>
            data-vertical = false<br/>
            data-x = 0<br/>
            data-y = 0<br/>
            data-steps = 0<br/>
            data-snap = false<br/>
            data-slide = true<br/>
            data-loose = false<br/>
            data-top = 0<br/>
            data-bottom = 0<br/>
            data-left = 0<br/>
            data-right = 0<br/>
            data-handleClass = 'handle'
        </p>
        <p>
            There are two events triggered by this component at the component level.
            <br/>
            slide (x, y): Called every animation loop, as long as the handle is being dragged or in the process of a sliding animation. The x, y positional values received by this callback reflect the exact position of the handle DOM element, which includes exceeding values (even negative values) when the loose option is set true.
            <br/>
            change (x, y): Called when releasing handle, with the projected x, y position of the handle. Projected value means the value the slider will have after finishing a sliding animation, caused by either a step restriction or drag motion (see steps and slide options.)
        </p>
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Slider
      */
    initialize: function () {
        Suit.Component.prototype.initialize.apply(this, this.options);
        // Let's initialize all components and hook up all the events.
        var el = this.$el;

        // We need to set the id for the slider to use.
        el.attr('id', this.cid);

        var args = {
            disabled: el.attr('data-disabled') || false,
            horizontal: el.attr('data-horizontal') || true,
            vertical: el.attr('data-vertical') || false,
            x: el.attr('data-x') || 0,
            y: el.attr('data-y') || 0,
            steps: el.attr('data-steps') || 0,
            snap: el.attr('data-snap') || false,
            slide: el.attr('data-slide') || true,
            loose: el.attr('data-loose') || false,
            top: el.attr('data-top') || 0,
            bottom: el.attr('data-bottom') || 0,
            left: el.attr('data-left') || 0,
            right: el.attr('data-right') || 0,
            callback: this.callback,
            animationCallback: this.animationCallback,
            handleClass: el.attr('data-handleClass') || 'handle'
        };
        this.slider = new Dragdealer(this.cid, args);
    },

    callback: function (x, y) {
        var view = $(this.wrapper).data('view');
        view.trigger('change', x, y);
    },
    animationCallback: function (x, y) {
        var view = $(this.wrapper).data('view');
        view.trigger('slide', x, y);
    }
});

// Register component.
Suit.Components.registerComponent('Slider');
