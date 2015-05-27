'use strict';

describe('Suit Component View', function () {

	var view, el, testDiv;

	describe('instantiation', function () {

		beforeEach(function () {
			testDiv = $('<div id="container-' + jasmine.getEnv().currentSpec.id + '"></div>');
			view = new Suit.View({el: '<div id="testElement" suit-tooltip="testing tooltip" data-color="black">test</div>'});
			view.render();
			el = view.$el;

			testDiv.html(view);
			$('body').append(testDiv);
		});

		afterEach(function () {
			view.close();
			testDiv.remove();
			Backbone.history.stop();
		});

		it('should render the suit-tooltip with correct message and color', function () {
			var container =  el.find('#testElement');
			var tooltip = $('body').find('#suit-tooltip');

			expect(tooltip.length).toBe(1);
			container.trigger('mouseover');

			expect(tooltip.children('.tooltip-content').text()).toBe('testing tooltip');
			expect(tooltip.attr('class')).toBe('tooltip black');
			
		});
	});

});