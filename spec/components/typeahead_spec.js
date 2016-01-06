'use strict';

describe('Suit typeahead component', function () {

    var view, el, testDiv;

    beforeEach(function () {
        view = new Suit.View();
        // We need to make a template that includes a toggle button.
        view.template = function () { return '<input type="text" class="typeahead" data-url="something.com?param=1" data-param="query" data-global-filters="test1,test2">'; };
        el = view.$el;
        testDiv = $('<div id="container-' + jasmine.getEnv().currentSpec.id + '"></div>');
        $('body').append(testDiv);
        testDiv.html(el);
        view.render();
    });

    afterEach(function () {
        testDiv.remove();
        view.close();
    });

    it('should initialize a typeahead component', function () {
        var typeahead = el.find('.typeahead').eq(1);
        expect(typeahead.data('view')).not.toBeUndefined();
    });

    it('should trigger the typeahead selection on pressing enter', function () {
        var typeahead = $('.typeahead');
        var spy = sinon.spy($.fn, 'trigger');
        typeahead.focus().typeahead('val', 'test').focus();
        var e = $.Event('keypress');
        e.which = 13;
        typeahead.trigger(e);
        expect(spy).toHaveBeenCalledWith('typeahead:selected');
        spy.restore();
    });

    it('should not do anything on enter if disable-enter is enabled', function () {
        view.template = function () { return '<input type="text" class="typeahead" data-url="something.com" data-param="query" data-disable-enter="true">'; };
        view.render();

        var typeahead = $('.typeahead');
        var spy = sinon.spy($.fn, 'trigger');
        typeahead.focus().typeahead('val', 'test').focus();
        var e = $.Event('keypress');
        e.which = 13;
        typeahead.trigger(e);
        expect(spy).not.toHaveBeenCalledWith('typeahead:selected');
        spy.restore();
    });

});
