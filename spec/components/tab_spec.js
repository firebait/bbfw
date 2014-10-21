'use strict';

describe('Suit tab component', function () {

    var view;

    describe('default tab', function () {

        beforeEach(function () {
            view = new Suit.View();
            // We need to make the template by hand as the components get initialized by the view.
            view.template = function () { return '<div class="suit-tab"><div class="suit-tab-default-blue"><a href="#" class="suit-tab-link active">Tab 1</a><a href="#" class="suit-tab-link">Tab 2</a><a href="#" class="suit-tab-link">Tab 3</a></div></div>'; };
            view.render();
        });

        it('should switch the active state between tabs', function () {
            var tabs = view.find('.suit-tab-link');
            var tab1 = $(tabs[0]);
            var tab2 = $(tabs[1]);
            var tab3 = $(tabs[2]);
            expect(tab1.hasClass('active')).toBe(true);
            tab2.trigger('click');
            expect(tab1.hasClass('active')).toBe(false);
            expect(tab2.hasClass('active')).toBe(true);
            expect(tab3.hasClass('active')).toBe(false);
        });
        
    });
});
