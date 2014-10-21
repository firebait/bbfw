'use strict';

describe('Suit multi-select component', function () {

    var view, el;

    describe('multi-select', function () {

        beforeEach(function () {
            view = new Suit.Components.MultiSelect();
            // We need to make the template by hand as the components get initialized by the view.
            view.template = function () { return '<div class="multi-select"><div class="multi-select-counter-row">(<span class="multi-select-counter">0</span>) Total Selected<span class="icon">/</span></div><div class=" multi-select-options d-none"><div class="ms-checkbox"><input  class="ms-checkbox" type="checkbox" name="multi-select-name" value="value1"> input value 1</div><div class="ms-checkbox"><input class="ms-checkbox" type="checkbox" name="multi-select-name" value="value2"> input value 2</div><div class="ms-checkbox"><input  class="ms-checkbox" type="checkbox" name="multi-select-name" value="value3"> input value 3</div></div></div>'; };
            el = view.render().$el;
        });

        afterEach(function () {
            view.close();
        });

        it('should toggle select options', function () {
            expect(el.find('.multi-select-options').hasClass('d-none')).toBe(true);
            expect(el.find('.multi-select-options').css('display')).toBe('');
            el.find('.multi-select-counter-row').click();
            expect(el.find('.multi-select-options').css('display')).toBe('block');
        });

        it('should show the amount of total items selected', function () {
            var counter = el.find('.multi-select-counter');
            expect(counter.text()).toBe('0');
            var firstCheckbox = el.find('.multi-select-options [type="checkbox"]').first();
            firstCheckbox.click();
            firstCheckbox.attr('checked', 'checked');
            view.updateCounter();
            expect(el.find('.multi-select-counter').text()).toBe('1');
        });

        it('should not toggle select options for disabled multi select', function () {
            view.template = function () { return '<div class="multi-select" disabled><div class="multi-select-counter-row">(<span class="multi-select-counter">0</span>) Total Selected<span class="icon">/</span></div><div class=" multi-select-options d-none"><div class="ms-checkbox"><input  class="ms-checkbox" type="checkbox" name="multi-select-name" value="value1"> input value 1</div><div class="ms-checkbox"><input class="ms-checkbox" type="checkbox" name="multi-select-name" value="value2"> input value 2</div><div class="ms-checkbox"><input  class="ms-checkbox" type="checkbox" name="multi-select-name" value="value3"> input value 3</div></div></div>'; };
            el = view.render().$el;
            expect(el.find('.multi-select-options').hasClass('d-none')).toBe(true);
            expect(el.find('.multi-select-options').css('display')).toBe('');
            el.find('.multi-select-counter-row').click();
            expect(el.find('.multi-select-options').css('display')).toBe('');
        });


    });
});
