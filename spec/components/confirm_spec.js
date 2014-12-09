'use strict';

describe('Suit Component Confirm', function () {
    afterEach(function () {
        var modal = $('body').find('.suit-modal').data('view');
        if (modal) { modal.close(); }
    });

    describe('initialize', function () {
        it('should render the confirm modal successfuly with default params', function () {
            var confirm = new Suit.Components.Confirm({});

            expect(confirm.$el.find('h4').text()).toBe('Confirm');
            expect(confirm.$el.find('.content-box p').text()).toBe('Are you sure?');
            expect(confirm.$el.find('.yes').length).toBe(1);
            expect(confirm.$el.find('.no').length).toBe(1);
            expect(confirm.$el.find('.btn-primary.blue').length).toBe(1);
            expect(confirm.$el.find('.btn-secondary.blue').length).toBe(1);
        });

        it('should render the confirm modal successfuly with custom params', function () {
            var confirm = new Suit.Components.Confirm({
                title: 'This title',
                text: 'This text',
                color: 'own-color'
            });

            expect(confirm.$el.find('h4').text()).toBe('This title');
            expect(confirm.$el.find('.content-box p').text()).toBe('This text');
            expect(confirm.$el.find('.btn-primary.own-color').length).toBe(1);
            expect(confirm.$el.find('.btn-secondary.own-color').length).toBe(1);
        });

        it('should initialize the confirm with default params', function () {
            var confirm = new Suit.Components.Confirm({});
            expect(confirm.title).toBe('Confirm');
            expect(confirm.text).toBe('Are you sure?');
            expect(confirm.color).toBe('blue');
        });

        it('should initialize the confirm with custom params', function () {
            var confirm = new Suit.Components.Confirm({
                title: 'This title',
                text: 'This text',
                color: 'own-color'
            });
            expect(confirm.title).toBe('This title');
            expect(confirm.text).toBe('This text');
            expect(confirm.color).toBe('own-color');
        });
    });

    describe('callbacks', function () {
        it('should execute the the success callback', function () {
            var successSpy = sinon.spy();
            var confirm = new Suit.Components.Confirm({
                success: successSpy
            });
            confirm.$el.find('.yes').click();

            expect(successSpy.called).toBe(true);
        });
        it('should execute the the error callback', function () {
            var cancelSpy = sinon.spy();
            var confirm = new Suit.Components.Confirm({
                cancel: cancelSpy
            });
            confirm.$el.find('.no').click();

            expect(cancelSpy.called).toBe(true);
        });
    });
});
