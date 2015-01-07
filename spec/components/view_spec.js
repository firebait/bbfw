'use strict';

describe('Suit Component View', function () {

	var model, collection, view, el;

	describe('instantiation', function () {

		beforeEach(function () {
			App.Views.Children = App.Views.Children || {};
			model = new Suit.Model({name: 'view component model'});
			collection = new Suit.Collection();
			collection.add(model);
			App.Views.Children.Child = Suit.View.extend({template: function () { return '<div id="model" suit-text="model:name"></div><div id="collection" suit-each-model="collection.models">{model:name}</div>'; }});
			view = new Suit.View({model: model, collection: collection, el: '<div><div suit-view data-name="Children.Child" data-model="model" data-collection="collection"></div></div>'});
			el = view.render().$el;
		});

		it('should render the child view with the collection and model data', function () {
			expect(el.find('#model').text()).toEqual('view component model');
			expect(el.find('#collection').text()).toEqual('view component model');
		});
	});

});