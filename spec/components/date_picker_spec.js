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

    });
});
