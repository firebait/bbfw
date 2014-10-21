'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}
Suit.Components.DatePicker = Suit.Component.extend(/** @lends Suit.Components.DatePicker.prototype */{
    /**
      * @class Suit.Components.DatePicker
      * @classdesc This is the Suit framework datepicker. It is based on the pikaday javascript library.
      *
      * @augments Suit.Components
      * @constructs Suit.Components.DatePicker
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        var self = this;
        // Attributes that come from the view element
        var args = {
            defaultDate: this.$el.data('dp-default-date'),
            setDefaultDate: this.$el.data('dp-set-default-date'),
            firstDay: this.$el.data('dp-first-day'),
            minDate: this.$el.data('dp-min-date'),
            maxDate: this.$el.data('dp-max-date')
        };

        // Clean the values which are falsy
        args = _(args).reduce(function (obj, v, k) {
            if (v) {
                obj[k] = v;
            }
            return obj;
        }, {});

        // Custom attribuets assigned on our end
        var defaultValues = {
            // Input field
            field: this.$el.find('input')[0],
            // Date Foramt
            format: 'MM/DD/YYYY',
            // Wrapper for onSelect function
            onSelect: function () {
                // trigger onSelect event
                self.trigger('selected');
            },
            // Wrapper for the open picker
            onOpen: function () {
                self.openPicker(self);
            },
            // Wrapper for the close picker
            onClose: function () {
                self.closePicker(self);
            },
            // i18n attributes used in order to override the next/back buttons
            // and the months abbreviatiobs (both to support the expected behaviour
            // described on the design.
            i18n: {
                previousMonth : '<',
                nextMonth     : '>',
                months        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                weekdays      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                weekdaysShort : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            }
        };

        // Extend the Pikaday component using a mix between our default attributes
        // and the values received from the the view
        _.extend(args, defaultValues);
        this.picker = new Pikaday(args);

        // Put styles to the calendar modal, based on the style that is being used
        // on the component initialization.
        var color = this.$el.attr('class').split(' ')[1] || 'blue';
        $(this.picker.el).addClass(color);

        // Setting disabled, if it is
        if (this.$el.hasClass('disabled')) {
            color = 'blue';
            this.$el.find('a').addClass('disabled');
            this.$el.find('input').attr('disabled', 'disabled');
        }
    },
    /** Events that this view responds to */
    events: {
        'click .date-picker-trigger': 'showPicker'
    },
    openPicker: function (self) {
        self.$el.addClass('active');
    },
    closePicker: function (self) {
        self.$el.removeClass('active');
    },
    showPicker: function (event) {
        event.preventDefault();

        if (!$(event.currentTarget).hasClass('disabled')) {
            this.picker.show();
        }
    },
    beforeClose: function () {
        var el = $(this.picker.el);
        el.unbind();
        el.remove();
    }
});

// Register component.
Suit.Components.registerComponent('DatePicker');
