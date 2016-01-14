'use strict';

describe('Date picker component', function () {

    var view;

    describe('default date picker', function () {

        beforeEach(function () {
            view = new Suit.View();
            // We need to make the template by hand as the components get initialized by the view.
            view.template = function () { return '<div class="date-picker blue"><a href="#" class="date-picker-trigger"><span class="icon">#</span></a><input type="text" class="date-picker-date" id="datepicker" placeholder="mm/dd/yyyy"></input></div>'; };
            view.render();
        });

        afterEach(function () {
            view.close();
        });

        it('should initialize the pikaday component', function () {
            expect(view.$el.data('view')).toBeDefined();
            expect($('body').find('.pika-single').hasClass('blue')).toBe(true);
        });

        it('should show the pikaday component', function () {
            view.$el.find('.date-picker-trigger').trigger('click');
            expect($('body').find('.pika-single').hasClass('is-hidden')).toBe(false);
        });

        it('should close the pikaday component', function () {
            var picker = view.$el.find('.date-picker').data('view').picker;
            picker.show();
            picker.hide();
            expect($('body').find('.pika-single').hasClass('is-hidden')).toBe(true);
        });
    });

    describe('date-picker having the disabled class', function () {
        beforeEach(function () {
            view = new Suit.View();
            // We need to make the template by hand as the components get initialized by the view.
            view.template = function () { return '<div class="date-picker blue disabled"><a href="#" class="date-picker-trigger"><span class="icon">#</span></a><input type="text" class="date-picker-date" id="datepicker" placeholder="mm/dd/yyyy"></input></div>'; };
            view.render();
        });

        afterEach(function () {
            view.close();
        });

        it('should assign the disabled to its children', function () {
            expect(view.$el.find('input').attr('disabled')).toBe('disabled');
            expect(view.$el.find('a').hasClass('disabled')).toBe(true);
        });
    });
});
