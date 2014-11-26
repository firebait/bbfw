'use strict';

describe('Date range component', function () {
    var view;

    beforeEach(function () {
        view = new Suit.View();
        // We need to make the template by hand as the components get initialized by the view.
        view.template = function () { return '<div class="date-range" data-dr-sequencial="true"> <div class="date-picker blue date-picker-start"> <a href="#" class="date-picker-trigger"><span class="icon">#</span></a> <input type="text" class="date-picker-date" placeholder="mm/dd/yyyy"></input> </div> <div class="date-picker blue date-picker-end"> <input type="text" class="date-picker-date" placeholder="mm/dd/yyyy"></input> </div> <div class="select-box"> <select> <option value="custom">Custom</option> <option value="today">Today</option> <option value="last_7_days">Last 7 Days</option> <option value="this_month">This Month</option> <option value="this_quarter">This Quarter</option> <option value="all">All Time</option> </select> <span class="icon">/</span> </div> </div>'; };
        view.render();
    });

    afterEach(function () {
        view.close();
    });

    describe('default date range', function () {

        it('should initialize all the internal controllers', function () {
            expect(view.$el.data('view')).toBeDefined();
            expect(view.find('.date-picker-start').length).toBe(1);
            expect(view.find('.date-picker-end').length).toBe(1);
            expect(view.find('select').length).toBe(1);

            expect(view.find('select').children().length).toBe(6);

            expect($(view.find('select').children().get(0)).text()).toBe('Custom');
            expect($(view.find('select').children().get(1)).text()).toBe('Today');
            expect($(view.find('select').children().get(2)).text()).toBe('Last 7 Days');
            expect($(view.find('select').children().get(3)).text()).toBe('This Month');
            expect($(view.find('select').children().get(4)).text()).toBe('This Quarter');
            expect($(view.find('select').children().get(5)).text()).toBe('All Time');
        });
    });

    describe('predefined rules', function () {
        var startInput, endInput;

        beforeEach(function () {
            startInput = view.$el.find('.date-picker-start input');
            endInput = view.$el.find('.date-picker-end input');
        });

        afterEach(function () {
            view.$el.find('select').val('custom');
        });

        it('should clear all values when selects custom', function () {
            startInput.val('2014/04/23');
            endInput.val('2014/04/23');

            view.$el.find('select').val('custom').trigger('change');

            expect(startInput.val()).toBe('');
            expect(endInput.val()).toBe('');
        });

        it('should be able to select today for start/end date', function () {
            view.$el.find('select').val('today').trigger('change');

            expect(startInput.val()).toBe(moment().format('MM/DD/YYYY'));
            expect(endInput.val()).toBe(moment().format('MM/DD/YYYY'));
        });

        it('should be able to select last 7 days', function () {
            view.$el.find('select').val('last_7_days').trigger('change');

            expect(startInput.val()).toBe(moment().subtract(7, 'days').format('MM/DD/YYYY'));
            expect(endInput.val()).toBe(moment().format('MM/DD/YYYY'));
        });

        it('should be able to select this month', function () {
            view.$el.find('select').val('this_month').trigger('change');

            expect(startInput.val()).toBe(moment().date(1).format('MM/DD/YYYY'));
            expect(endInput.val()).toBe(moment().format('MM/DD/YYYY'));
        });

        it('should be able to select this quarter', function () {
            view.$el.find('select').val('this_quarter').trigger('change');

            expect(startInput.val()).toBe(moment().startOf('quarter').format('MM/DD/YYYY'));
            expect(endInput.val()).toBe(moment().format('MM/DD/YYYY'));
        });

        it('should be able to use the all filter, by selected all dates before today', function () {
            view.$el.find('select').val('all').trigger('change');

            expect(startInput.val()).toBe('');
            expect(startInput.attr('placeholder')).toBe('Before');
            expect(endInput.val()).toBe(moment().format('MM/DD/YYYY'));
        });
    });
});
