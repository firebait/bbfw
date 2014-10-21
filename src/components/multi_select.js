'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.MultiSelect = Suit.Component.extend(/** @lends Suit.Components.MultiSelect.prototype */{
    /**
    * @class Suit.Components.MultiSelect
      * @classdesc Suit component framework for multi select checkbox
        Usage: 1) Type in the terminal-> yo suit:component <press enter>
               2) Go to Multi Select Template and press space bar
               3) Write the path of your view, example: users/form
               4) It should insert the template into your view's jst template file.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.MultiSelect
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        var cid = this.cid;

        //if user clicks somewhere outside the view it should close the multi select
        $(document).on('click.' + cid, function (event) {
            if (!_.isUndefined(event.target.className)) {
                if (event.target.className !== 'multi-select-counter-row' && event.target.className !== 'ms-checkbox') {
                    $('.multi-select-options').hide();
                }
            }
        });

        this.on('onClose', function () {
            $(document).off('click.' + cid);
        });
    },
    /* events to open close box and calculate total selected*/
    events: {
        'click input[type="checkbox"]': 'updateCounter',
        'click .multi-select-counter-row': 'toggleOptions',
        'click .icon': 'toggleOptions'
    },
    /* Open or close the checkboxes box */
    toggleOptions: function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var el = this.$el;
        if (!el.attr('disabled')) {
            el.find('.multi-select-options').toggle();
        }
    },
    /* update total counter of the amount of selected checkboxes. */
    updateCounter: function () {
        var el = this.$el;
        var length = el.find('input:checkbox:checked').length;
        el.find('.multi-select-counter').html(length);
    }
});

// Register component.
Suit.Components.registerComponent('MultiSelect');
