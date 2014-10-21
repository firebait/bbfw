'use strict';

describe('Suit toggle button component', function () {
   
    var view;

    beforeEach(function () {
        view = new Suit.View();
        // We need to make a tempalte that includes a toogle button.
        view.template = function () { return '<button class="toggle-button">Some Value</button>'; };
        view.render();
    });

    afterEach(function () {
        view.close();
    });

    it('should initialize a toggle button view', function () {
        var button = view.$el.find('.toggle-button');
        var toggleViewSpy = sinon.spy(button.data('view'), 'trigger');
        expect(button.hasClass('active')).toBe(false);
        button.trigger('click');
        expect(button.hasClass('active')).toBe(true);
        expect(toggleViewSpy).toHaveBeenCalledWith('toggled', true);
        button.trigger('click');
        expect(button.hasClass('active')).toBe(false);
        expect(toggleViewSpy).toHaveBeenCalledWith('toggled', false);
    });
});
