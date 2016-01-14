'use strict';

describe('Suit slider component', function () {

    var view, html, testDiv, el;

    beforeEach(function () {
        testDiv = $('<div id="container-' + jasmine.getEnv().currentSpec.id + '"></div>');
        $('body').append(testDiv);
        html = '<div><div class="slider"><div class="handle"><span class="icon">T</span></div></div></div>';
        el = $(html)[0];
        view = new Suit.View({el: el});
        testDiv.html(view.el);
        view.render();
    });

    afterEach(function () {
        view.close();
    });

    it('should initialize a view containing the slider component', function () {
        var sliderView = view.$el.find('.slider');
        expect(sliderView.data('view')).not.toBeUndefined();
    });

    it('should move the slider to a defined position', function () {
        var position = [1, 1];
        var sliderView = view.$el.find('.slider');
        var slider = sliderView.data('view').slider;
        slider.setValue(1, 1, true);
        expect(_.difference(slider.getValue(), position).length).toBe(0);
    });
});
