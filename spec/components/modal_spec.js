'use strict';

describe('Suit Component Modal', function () {

    var modal, mainView, view;

    beforeEach(function () {
        Suit.mainView = mainView = new Suit.View();
        view = new Suit.View({id: 'view'});
        mainView.template = view.template = function () { return ''; };
        modal = new Suit.Components.Modal({view: view});
    });

    afterEach(function () {
        if (!_.isUndefined(modal.$el)) { modal.close(); }
    });

    describe('instantiation', function () {

        it('should set the modal class to suit-modal', function () {
            expect(modal.$el.hasClass('suit-modal')).toBe(true);
        });

        it('should render a view inside the modal and set it as child', function () {
            expect(modal.find('#view').length).toBe(1);
            expect(modal.children).toEqual([view]);
            expect(view.parent).toEqual(modal);
        });

        it('should create an overlay for this modal and render it to the body', function () {
            expect(modal.overlay.hasClass('suit-modal-overlay')).toBe(true);
            expect($('body').find('.suit-modal-overlay').length).toBe(1);
        });

    });

    describe('sizing', function () {
        
        it('should set the size to large or small', function () {
            modal.close();
            modal = new Suit.Components.Modal({size: 'large'});
            expect(modal.$el.hasClass('large')).toBe(true);
            modal.close();
            modal = new Suit.Components.Modal({size: 'small'});
            expect(modal.$el.hasClass('small')).toBe(true);
        });
    });

    describe('overlay object', function () {

        it('should close the modal when the overlay is clicked', function () {
            expect($('body').find('.suit-modal').length).toBe(1);
            modal.overlay.trigger('click');
            expect($('body').find('.suit-modal').length).toBe(0);
        });

        //it('should add the blur class to the main view', function () {
        //    expect(Suit.mainView.$el.hasClass('blur')).toBe(true);
        //});

        it('should disable scrolling on the body', function () {
            expect($('body').css('overflow')).toBe('hidden');
        });

    });

    describe('closing object', function () {
        
        it('should close the modal when an element with the close class is clicked', function () {
            expect($('body').find('.suit-modal').length).toBe(1);
            var el = $('<a href="#" class="close"><h6>x</h6></a>');
            view.$el.append(el);
            el.trigger('click');
            expect($('body').find('.suit-modal').length).toBe(0);
        });

        it('should not close the modal when the overlay is clicked for a modal with persistent option set to true', function () {
            var modal = $('.suit-modal').data('view');
            modal.close();
            modal = new Suit.Components.Modal({persistent: true});
            expect($('body').find('.suit-modal').length).toBe(1);
            modal.overlay.trigger('click');
            expect($('body').find('.suit-modal').length).toBe(1);
            modal.close();
        });
    });

    describe('layering modals', function () {

        it('should create a new modal on top of the other', function () {
            var modal1 = new Suit.Components.Modal();
            expect(modal.overlay.attr('style').trim()).toEqual('z-index: 1000;');
            //expect(modal.$el.attr('style').trim()).toEqual('z-index: 1001; margin-top: 60px; display: block; opacity: 0;');
            expect(modal1.overlay.attr('style').trim()).toEqual('z-index: 1002;');
            //expect(modal1.$el.attr('style').trim()).toEqual('z-index: 1003; margin-top: 60px; display: block; opacity: 0;');
            modal1.close();
        });

    });

    describe('modal management', function () {
    
        it('should store the modal in the modal bucket when initialized', function () {
            var modal = $('.suit-modal').data('view');
            expect(Suit.Components.Modal.currentModals).toEqual([modal]);
        });

        it('should close all modals', function () {
            expect($('body').find('.suit-modal').length).toBe(1);
            var modal = $('.suit-modal').data('view');
            expect(Suit.Components.Modal.currentModals).toEqual([modal]);
            Suit.Components.Modal.closeAll();
            expect(Suit.Components.Modal.currentModals).toEqual([]);
            expect($('body').find('.suit-modal').length).toBe(0);
        });
    });
});
