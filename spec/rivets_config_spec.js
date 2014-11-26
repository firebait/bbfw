'use strict';

describe('Rivets Config', function () {
    var TestView, view, el, spy;

    describe('event handler', function () {

        it('should handle events correctly if element is input', function () {
            TestView = Suit.View.extend({
                intitialize: function (options) {
                    Suit.View.prototype.initialize.apply(this, [options]);
                },
                className: 'testview',
                changeHandler: function () {}
            });
            el = $('<div><input type="text" id="textInput" suit-on-change="changeHandler"></div></div>')[0];
            view = new TestView({el: el});
            view.render();

            spy = sinon.spy(view, 'changeHandler');
            var e = $.Event('change');
            view.find('#textInput').val('test').trigger(e);
            expect(spy).toHaveBeenCalledWith('test', e, view.find('#textInput')[0]);

        });

        it('should handle events correctly if element is not an input', function () {
            TestView = Suit.View.extend({
                intitialize: function (options) {
                    Suit.View.prototype.initialize.apply(this, [options]);
                },
                className: 'testview',
                clickHandler: function () {}
            });
            el = $('<div><div id="testDiv" suit-on-click="clickHandler"></div></div>')[0];
            view = new TestView({el: el});
            view.render();

            spy = sinon.spy(view, 'clickHandler');
            var e = $.Event('click');
            view.find('#testDiv').trigger(e);
            expect(spy).toHaveBeenCalledWith(e, view.find('#testDiv')[0]);

        });

        it('should handle events correctly if bound to model', function () {
            TestView = Suit.View.extend({
                intitialize: function (options) {
                    Suit.View.prototype.initialize.apply(this, [options]);
                },
                className: 'testview'
            });
            var model = Suit.Model.findOrCreate({id: 1001});
            model.url = '/test';
            el = $('<div><div id="testDiv" suit-on-click="model.fetch"></div></div>')[0];
            view = new TestView({el: el, model: model});
            view.render();

            spy = sinon.spy(model, 'fetch');
            var e = $.Event('click');
            view.find('#testDiv').trigger(e);
            expect(spy).toHaveBeenCalledOnce();

        });
    });
});