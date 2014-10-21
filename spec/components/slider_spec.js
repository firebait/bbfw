'use strict';

describe('Suit slider component', function () {

    var view;

    beforeEach(function () {
        view = new Suit.View();
        // We need to make a tempalte that includes a toogle button.
        view.template = function () { return '<div class="slider"><div class="handle"><span class="icon">T</span></div></div>'; };
        view.render();
    });

    afterEach(function () {
        view.close();
    });

    it('should initialize a toggle button view', function () {
        var slider = view.$el.find('.slider');
        expect(slider.data('view')).not.toBeUndefined();
    });

});
