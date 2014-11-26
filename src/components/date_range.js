'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}
Suit.Components.DateRange = Suit.Component.extend(/** @lends Suit.Components.DateRange.prototype */{
    /**
      * @class Suit.Components.DateRange
      * @classdesc This is the Suit framework date range.
      *
      * @augments Suit.Components
      * @constructs Suit.Components.DateRange
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);

        // Reference
        var self = this;

        // Sequencial range (end date starts based on start date)
        this.sequencial = this.$el.data('dr-sequencial') || false;

        // Storing references for pickers (start and end dates)
        this.startPicker = this.$el.find('.date-picker-start').data('view');
        this.endPicker   = this.$el.find('.date-picker-end').data('view');

        // Once the start date is selected, jump to end date
        this.listenTo(this.startPicker, 'selected', function () {
            // If we execute it immediately a glitch occured (because it's listening
            // to the blur of the first date picker), and it closed the second one.
            _.defer(function () {
                self.selectedStart();
                self.trigger('change:start');
                self.$el.trigger('change:start');
            });
        });

        this.listenTo(this.endPicker, 'selected', function () {
            self.find('select').val('custom');
            self.trigger('change:end');
            self.$el.trigger('change:end');
        });

    },
    /** Events */
    events: {
        'change select': 'predefinedSelected'
    },

    /** Selects the end date based on the start date (is sequencial) and focuses
      * on end date. */
    selectedStart: function () {
        // If this date range is sequencial (selected `start date` is min date of `end date`)
        if (this.sequencial && this.startPicker && this.startPicker.find) {
            this.endPicker.picker.setMinDate(new Date(this.startPicker.find('input').val()));
        }

        this.endPicker.find('input').focus();
        this.find('select').val('custom');
        this.trigger('change');
        this.$el.trigger('change');

    },
    /** If a predefined value is selected (from the select), then we have to trigger
      * or change the picker values. */
    predefinedSelected: function (event) {
        event.preventDefault();
        var value = $(event.target).val();

        if (value !== 'all') {
            this.startPicker.find('input').attr('placeholder', 'yyyy/mm/dd');
        }

        switch (value) {
            case 'custom':
                this.startPicker.find('input').val('').focus();
                this.endPicker.find('input').val('');
                break;
            case 'today':
                this.startPicker.picker.setMoment(moment(), true);
                this.endPicker.picker.setMoment(moment(), true);
                break;
            case 'last_7_days':
                this.startPicker.picker.setMoment(moment().subtract(7, 'days'), true);
                this.endPicker.picker.setMoment(moment(), true);
                break;
            case 'this_month':
                this.startPicker.picker.setMoment(moment().date(1), true);
                this.endPicker.picker.setMoment(moment(), true);
                break;
            case 'this_quarter':
                this.startPicker.picker.setMoment(moment().startOf('quarter'), true);
                this.endPicker.picker.setMoment(moment(), true);
                break;
            case 'all':
                this.startPicker.find('input').val('').attr('placeholder', 'Before').change();
                this.endPicker.picker.setMoment(moment(), true);
                break;
        }
        this.trigger('change:range');
        this.$el.trigger('change:range');
        // Trigger the change event manually;
        this.trigger('change');
        this.$el.trigger('change');
    }
});

// Register component.
Suit.Components.registerComponent('DateRange');
