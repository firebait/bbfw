'use strict';

describe('Suit time picker component', function () {

    var view;

    beforeEach(function () {
        sinon.spy(Suit.Components.TimePicker.prototype, 'showPicker');
        sinon.spy(Suit.Components.TimePicker.prototype, 'invalidTime');
        view = new Suit.View();
    });

    afterEach(function () {
        Suit.Components.TimePicker.prototype.showPicker.restore();
        Suit.Components.TimePicker.prototype.invalidTime.restore();
        $('.ui-timepicker-wrapper').remove();
        view.close();
    });

    it('should initialize a time picker view', function () {
        view.template = function () {
            return '<div class="time-picker blue">' +
                    '<a href="#" class="time-picker-trigger"><span class="icon">t</span></a>' +
                    '<input type="text" class="time-picker-time" id="timepicker" placeholder="10:00 AM"></input>' +
                    '</div>';
        };
        view.render();

        var picker = view.$el.find('.time-picker');
        expect(picker.data('view')).not.toBeUndefined();

        picker.find('input').click();
        expect($('body .ui-timepicker-wrapper').length).toBe(1);
        expect($('body .ui-timepicker-list').length).toBe(1);
        picker.timepicker('remove');
    });

    it('should set the anchor and the input to disabled', function () {
        view.template = function () {
            return '<div class="time-picker blue disabled">' +
                    '<a href="#" class="time-picker-trigger"><span class="icon">t</span></a>' +
                    '<input type="text" class="time-picker-time" id="timepicker" placeholder="10:00 AM"></input>' +
                    '</div>';
        };
        view.render();

        var picker = view.$el.find('.time-picker');
        picker.find('input').click();

        expect(picker.find('a').hasClass('disabled')).toBe(true);
        expect(picker.find('input').prop('disabled')).toBe(true);
    });

    it('should show time picker when clicking the link', function () {
        view.template = function () {
            return '<div class="time-picker blue">' +
                    '<a href="#" class="time-picker-trigger"><span class="icon">t</span></a>' +
                    '<input type="text" class="time-picker-time" id="timepicker" placeholder="10:00 AM"></input>' +
                    '</div>';
        };
        view.render();

        var picker = view.$el.find('.time-picker');
        picker.find('.time-picker-trigger').click();

        expect(picker.data('view').showPicker).toHaveBeenCalled();
    });

    it('should clear time picker when format is invalid', function () {
        view.template = function () {
            return '<div class="time-picker blue">' +
                    '<a href="#" class="time-picker-trigger"><span class="icon">t</span></a>' +
                    '<input type="text" class="time-picker-time" id="timepicker" placeholder="10:00 AM"></input>' +
                    '</div>';
        };
        view.render();

        var picker = view.$el.find('.time-picker');
        picker.find('input').trigger('timeFormatError');

        expect(picker.data('view').invalidTime).toHaveBeenCalled();
    });
});
