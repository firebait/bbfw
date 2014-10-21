'use strict';

describe('Suit typeahead component', function () {

    var view;

    beforeEach(function () {
        view = new Suit.View();
        // We need to make a tempalte that includes a toogle button.
        view.template = function () { return '<div class="typeahead" data-url="something.com"></div>'; };
        view.render();
    });

    afterEach(function () {
        view.close();
    });

    it('should initialize a typeahead component', function () {
        var typeahead = view.$el.find('.typeahead');
        expect(typeahead.data('view')).not.toBeUndefined();
    });

});
