'use strict';

describe('Suit Component Alert', function () {

    describe('instantiation', function () {
        beforeEach(function () {
        });

        it('should render the default template', function () {
            var alertView = new Suit.Components.Alert({message: 'Hello World'});
            var el = alertView.render().$el;
            expect(el.prop('tagName')).toEqual('A');
            expect(el.find('span').length).toBe(2);
            expect(el.find('p').length).toBe(1);
            expect(el.find('p').text()).toEqual('Hello World');
        });

        describe('Confirmation Alert', function () {

            var element;

            it('should render the default template and disapear after 2 seconds', function () {
                var confirmationAlert = new Suit.Components.ConfirmationAlert();
                var el = confirmationAlert.render().$el;
                element = $('<div></div>');
                element.html(el);
                expect(el.hasClass('alert-box-confirmation')).toBe(true);
                expect($(el.find('span')[0]).text()).toEqual('c');
                expect(element.find('.alert-box-confirmation').length).toBe(1);
                jasmine.Clock.tick(2100);
                expect(element.find('.alert-box-confirmation').length).toBe(0);
            });
        });

        describe('Error Alert', function () {
            var errorAlert = new Suit.Components.ErrorAlert();
            var el = errorAlert.render().$el;
            expect(el.hasClass('alert-box-error')).toBe(true);
            expect($(el.find('span')[0]).text()).toEqual('e');
        });

        describe('Warning Alert', function () {
            var warningAlert = new Suit.Components.WarningAlert();
            var el = warningAlert.render().$el;
            expect(el.hasClass('alert-box-warning')).toBe(true);
            expect($(el.find('span')[0]).text()).toEqual('a');
        });

        describe('Information Alert', function () {
            var informationAlert = new Suit.Components.InformationAlert();
            var el = informationAlert.render().$el;
            expect(el.hasClass('alert-box-information')).toBe(true);
            expect($(el.find('span')[0]).text()).toEqual('i');
        });
    });

    describe('interaction', function () {

        it('should close when you click on the alert box', function () {
            var genericAlert = new Suit.Components.Alert();
            var el = genericAlert.render().$el;
            var elSpy = sinon.spy(genericAlert, 'remove');
            el.trigger('click');
            expect(elSpy).toHaveBeenCalled();
        });

        it('should close when url changes', function () {
            var genericAlert = new Suit.Components.Alert();
            var elSpy = sinon.spy(genericAlert, 'remove');
            Backbone.history.trigger('route');
            expect(elSpy).toHaveBeenCalled();
        });

    });
});
