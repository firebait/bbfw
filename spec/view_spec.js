/* global spyOn */
'use strict';

describe('Suit View', function () {

    var view, parent, model, server;

    beforeEach(function () {
        model = new Suit.Model({});
        parent = new Suit.View({id: 'parent'});
        view = new Suit.View({id: 'view'});
        view.template = parent.template = function () { return ''; };
    });

    describe('initialize', function () {

        it('should attach a options object to the view', function () {
            view = new Suit.View(undefined);
            expect(_.has(view, 'options')).toBe(true);
        });

        it('should set the parent on initialize', function () {
            view = new Suit.View({parent: parent});
            expect(_.contains(parent.children, view)).toBe(true);
        });

        it('should set children on initialize', function () {
            parent = new Suit.View({children: [view]});
            expect(parent.children).toEqual([view]);
        });

        it('should store the view in the "view" property of the $el', function () {
            expect(view.$el.data('view')).toEqual(view);
        });
    });

    describe('hierarchy', function () {

        it('should set the parent for the view and the child for the parent', function () {
            view.setParent(parent);
            expect(view.parent).toEqual(parent);
            expect(parent.children).toEqual([view]);
        });

        it('should set the child for a view', function () {
            parent.setChild(view);
            expect(parent.children).toEqual([view]);
        });
    });

    describe('DOM manipulation', function () {
        it('should find an element inside a view or return the view element if no selector is given', function () {
            expect(view.find()).toEqual(view.$el);
            var obj = $('<div id="some-id"></div>');
            view.$el.append(obj);
            expect(view.find('#some-id')).toEqual(view.$el.find('#some-id'));
        });

        it('should append a view and set it\'s parent and it\'s parent children', function () {
            parent.appendView(view);
            expect(parent.$el.find('#view').length).toBe(1);
            expect(parent.children).toEqual([view]);
            expect(view.parent).toEqual(parent);
        });

        it('should scan the parents for the selector in order to find if there is a child view closer to the element we are attaching', function () {
            var childView = new Suit.View({id: 'child-view'});
            childView.template = function () { return '<div id="inside"></div>'; };
            var insideChildView = new Suit.View({id: 'inside-child-view'});
            insideChildView.template = function () { return ''; };
            parent.appendView(view);
            parent.appendView(childView, '#view');
            expect(parent.children).toEqual([view]);
            expect(view.children).toEqual([childView]);
            parent.appendView(insideChildView, '#inside');
            expect(parent.children).toEqual([view]);
            expect(view.children).toEqual([childView]);
            expect(childView.children).toEqual([insideChildView]);
        });

        it('should append a view and set it\'s parent and it\'s parent children', function () {
            parent.prependView(view);
            expect(parent.$el.find('#view').length).toBe(1);
            expect(parent.children).toEqual([view]);
            expect(view.parent).toEqual(parent);
        });

        it('should scan the parents for the selector in order to find if there is a child view closer to the element we are attaching', function () {
            var childView = new Suit.View({id: 'child-view'});
            childView.template = function () { return '<div id="inside"></div>'; };
            var insideChildView = new Suit.View({id: 'inside-child-view'});
            insideChildView.template = function () { return ''; };
            parent.prependView(view);
            parent.prependView(childView, '#view');
            expect(parent.children).toEqual([view]);
            expect(view.children).toEqual([childView]);
            parent.prependView(insideChildView, '#inside');
            expect(parent.children).toEqual([view]);
            expect(view.children).toEqual([childView]);
            expect(childView.children).toEqual([insideChildView]);
        });

        it('should set the html on a selector on the view element', function () {
            parent.htmlView(view);
            expect(parent.$el.find('#view').length).toBe(1);
            expect(parent.children).toEqual([view]);
            expect(view.parent).toEqual(parent);
        });

        it('should empty the element an close all of the child views', function () {
            var viewSpy = sinon.spy(view, 'close');
            parent.htmlView(view);
            expect(parent.$el.html()).not.toBe('');
            parent.empty();
            expect(parent.$el.html()).toBe('');
            expect(viewSpy).toHaveBeenCalled();
        });

        it('should close child views', function () {
            var view2 = new Suit.View();
            view2.template = function () { return ''; };
            var viewSpy = sinon.spy(view, 'close');
            var view2Spy = sinon.spy(view2, 'close');
            parent.appendView(view);
            parent.appendView(view2);
            parent.closeChildren();
            expect(viewSpy).toHaveBeenCalled();
            expect(view2Spy).toHaveBeenCalled();
        });

        it('should close the element and remove it and clear all events', function () {
            var triggerSpy = sinon.spy(view, 'trigger');
            var stopListeningSpy = sinon.spy(view, 'stopListening');
            var unbindSpy = sinon.spy(view, 'unbind');
            var removeSpy = sinon.spy(view, 'remove');
            view.close();
            expect(triggerSpy).toHaveBeenCalled();
            expect(stopListeningSpy).toHaveBeenCalled();
            expect(unbindSpy).toHaveBeenCalled();
            expect(removeSpy).toHaveBeenCalled();
        });

        it('should render using the template', function () {
            view.template = function () { return 'hello world'; };
            view.render();
            expect(view.$el.text()).toEqual('hello world');
        });

        it('should call the loader function and add the loader class to the dom and then remove it', function () {
            view.loader();
            expect(view.$el.find('.loader').length).toBe(1);
            view.removeLoader();
            expect(view.$el.find('.loader').length).toBe(0);
        });

        it('should check the loader function parameters', function () {
            view.$el.html('<div><span class="loaderSelector"></<span></div>');
            view.loader({selector: '.loaderSelector', loaderSize: 'small', tone: 'light'});
            var selectorElem = view.$el.find('.loaderSelector');
            expect(selectorElem.length).toBe(1);
            expect(selectorElem.find('.loader').length).toBe(1);
            expect(selectorElem.find('.small').length).toBe(1);
            expect(selectorElem.find('.light').length).toBe(1);
            view.removeLoader();
            expect(view.$el.find('.loader').length).toBe(0);
        });

    });

    describe('render events', function () {

        it('should fire the beforeRender, onRender and afterRender events and methods when the render function is called', function () {
            var triggerSpy = sinon.spy(view, 'trigger');
            view.render();
            expect(triggerSpy).toHaveBeenCalled();
            expect(triggerSpy).toHaveBeenCalledWith('beforeRender');
            expect(triggerSpy).toHaveBeenCalledWith('onRender');
            expect(triggerSpy).toHaveBeenCalledWith('afterRender');
        });

    });

    describe('close events', function () {

        it('should fire the beforeClose, onClose and afterClose events and methods when the close function is called', function () {
            var triggerSpy = sinon.spy(view, 'trigger');
            view.close();
            expect(triggerSpy).toHaveBeenCalled();
            expect(triggerSpy).toHaveBeenCalledWith('beforeClose');
            expect(triggerSpy).toHaveBeenCalledWith('onClose');
            expect(triggerSpy).toHaveBeenCalledWith('afterClose');
        });

    });

    describe('view error handling of inputs', function () {

        it('should remove and add error class from input field on request and response respectively', function () {
            model.url = 'someurl';
            view = new Suit.View({id: 'view', model: model});
            view.template = function () { return '<input type="text" name="name" class="error"/><div class="tooltip">error</div>'; };
            server = sinon.fakeServer.create();
            server.respondWith('POST', view.model.url, function (xhr) {
                xhr.respond(422, { 'Content-Type': 'application/json' }, JSON.stringify(
                  {'name': 'input field can not be blank', 'name2': 'name2 is wrong'}));
            });
            view.render();
            view.errors = [view.$el.find('.tooltip')];
            //check it contains errors initially
            expect(view.$el.find('[name="name"].error').length).toEqual(1);
            expect(view.errors.length).toBe(1);
            view.model.save();
            //should remove the erorr class upon request
            expect(view.$el.find('[name="name"].error').length).toEqual(0);
            expect(view.errors.length).toBe(0);
            expect(view.$el.find('.tooltip').length).toBe(0);
            server.respond();//server errors
            //should add the class error
            expect(view.$el.find('[name="name"].error').length).toEqual(1);
        });
    });

    describe('view components', function () {

        beforeEach(function () {
            Suit.Components.SuitTest = Suit.Component.extend({hello: 'world'});
            Suit.Components.registerComponent('suit-test');
            view.template = function () { return '<div class="suit-test"></div>'; };
            view.render();
        });

        it('should find the suit-test, initialize it, set the element as the view and set the view as it\'s parent', function () {
            var component = $(view.$el.find('.suit-test').get(0)).data('view');
            expect(component.hello).toEqual('world');
            component.parent = undefined;
            expect(_.isUndefined(component.parent)).toBe(true);
            view.initializeComponents();
            component = $(view.$el.find('.suit-test').get(0)).data('view');
            expect(component.parent).toBe(view);
            expect(_.contains(view.children, component)).toBe(true);
        });
    });

    describe('validation', function () {
        var CustomModel, defer;

        beforeEach(function () {
            defer = _.defer;
            _.defer = function (fn) {
                fn();
            };
        });

        afterEach(function () {
            _.defer = defer;
        });

        it('should respond to validation of model', function () {
            CustomModel = Suit.Model.extend({
                url: 'someurl',
                className: 'CustomModel',
                validates: {
                    name: {
                        rules: ['numeric']
                    }
                },
                initialize: function () {
                }
            });
            model = new CustomModel({});
            view = new Suit.View({id: 'view', model: model});
            model.set('name', 'test');
            spyOn(view, 'showVisualError').andCallThrough();
            model.validate();
            expect(view.showVisualError).toHaveBeenCalled();
        });

        it('should trigger the unhandledUIErrors event', function () {
            model.url = 'someurl';
            view = new Suit.View({id: 'view', model: model});
            view.template = function () { return '<input type="text" name="name" class="test"/>'; };
            view.errorTest = function () {};
            var unhandledErrorSpy = sinon.spy(view, 'errorTest');
            view.listenTo(view, 'unhandledUIErrors', view.errorTest);
            server = sinon.fakeServer.create();
            server.respondWith('POST', view.model.url, function (xhr) {
                xhr.respond(422, { 'Content-Type': 'application/json' }, JSON.stringify(
                  {'state': 'input field can not be blank', 'name2': 'name2 is wrong'}));
            });
            view.render();
            view.model.save();
            server.respond();
            view.close();
            expect(unhandledErrorSpy).toHaveBeenCalled();
        });
    });

    describe('viewable elements', function () {

        it('should remove elements depending on the App.currentUser permission', function () {
            view.$el.append($('<div data-permissions="ad_ops"></div>'));
            expect(view.find('[data-permissions]').length).toBe(1);
            App.currentUser.set('permission', 'ad_ops');
            view._removeUnauthorizedElements();
            expect(view.find('[data-permissions]').length).toBe(1);
            App.currentUser.set('permission', 'network');
            view._removeUnauthorizedElements();
            expect(view.find('[data-permissions]').length).toBe(0);
        });

    });

    describe('Serialize Object', function () {
        it('serialize all inputs from a form or element', function () {
            var view = new Suit.View({});
            view.template =  function () {
                return '<form>' +
                            '<input name="multi" value="1" type="checkbox" checked/>' +
                            '<input name="multi" value="2" type="checkbox" checked/>' +
                            '<input name="name" value="test" type="text"/>' +
                        '</form>';
            };
            view.render();


            var obj = view.serializeObject();
            expect(JSON.stringify(obj)).toBe('{"multi":["1","2"],"name":"test"}');

        });
    });
});