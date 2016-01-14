'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.TimePicker = Suit.Component.extend(/** @lends Suit.Components.TimePicker.prototype */{
    /**
      * @class Suit.Components.TimePicker
      * @classdesc This is the Suit framework time picker.
      *
      * @augments Suit.Components
      * @constructs Suit.Components.TimePicker
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);

        // Get the component color
        var color = this.$el.attr('class').split(' ')[1] || 'blue';

        if (this.$el.hasClass('disabled')) {
            color = 'blue';
            this.$el.find('a').addClass('disabled');
            this.$el.find('input').attr('disabled', 'disabled');
        }

        // Initialize the jQuery plugin
        this.$el.find('input').timepicker({
            // Adding default color
            className: color,
            // Time format like 00:00 AM
            timeFormat: 'h:i A',
            // Adding support to 11:59pm, by using the noneOption, available
            // on the plugin.
            noneOption: [
                {
                    label: '11:59 PM',
                    value: '11:59 PM'
                }
            ],
        });

        // Set reference to the picker, for further use
        this.picker = this.$el.find('input');
    },
    /** Events that this view responds to */
    events: {
        'click .time-picker-trigger': 'showPicker',
        'showTimepicker input': 'toggleActive',
        'hideTimepicker input': 'toggleActive',
        'timeFormatError input': 'invalidTime'
    },
    showPicker: function (event) {
        event.preventDefault();

        if (!$(event.currentTarget).hasClass('disabled')) {
            this.$el.find('input').timepicker('show');
        }
    },
    toggleActive: function () {
        // Method to actually move the first element (noneOption) to the bottom
        // of the list.
        if (!this.noneAtBottom) {
            var first = $('body ul.ui-timepicker-list').children(':first-child');
            $('body ul.ui-timepicker-list').append(first);
            this.noneAtBottom = true;
        }
        this.$el.toggleClass('active');
    },
    invalidTime: function () {
        // If invalid, we clear the value
        this.picker.timepicker('setTime');
    }
});

// Register component.
Suit.Components.registerComponent('TimePicker');
