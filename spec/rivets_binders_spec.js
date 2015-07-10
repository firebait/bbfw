'use strict';

describe('Rivets binders', function () {
    var fragment;
    beforeEach(function () {
        fragment = document.createDocumentFragment();
    });

    describe('suit-class-*-unless', function () {

        it('should add a class test if the condition is invalid', function () {
            var el = document.createElement('div');
            el.setAttribute('suit-class-test-unless', 'val');

            var context = {
                val: false
            };

            fragment.appendChild(el);
            window.rivets.bind(fragment, context);

            expect(el.className).toBe('test');
        });

        it('should remove class test if the condition is valid', function () {
            var el = document.createElement('div');
            el.setAttribute('suit-class-test-unless', 'val');

            var context = {
                val: true
            };

            fragment.appendChild(el);
            window.rivets.bind(fragment, context);

            expect(_.isEmpty(el.className)).toBe(true);
        });
    });

    describe('suit-tooltip', function () {
        it('set the tooltip text and color', function () {
            var el = document.createElement('div');
            var text = document.createTextNode('test');
            el.setAttribute('suit-tooltip', 'testing tooltip');
            el.setAttribute('data-color', 'black');

            el.appendChild(text);

            var view =  window.rivets.bind(el);
            view.bindings[0].bind();

            expect($('#suit-tooltip .tooltip-content').text()).toBe('testing tooltip');
            expect($('#suit-tooltip').attr('class')).toBe('tooltip black');

            $('#suit-tooltip').remove();
        });

        it('hovering shows the correct tooltip', function () {
            var el = document.createElement('div');
            var text = document.createTextNode('test 1');
            el.setAttribute('suit-tooltip', 'testing tooltip black');
            el.setAttribute('data-color', 'black');

            el.appendChild(text);

            var el2 = document.createElement('div');
            var text2 = document.createTextNode('test 2');
            el2.setAttribute('suit-tooltip', 'testing tooltip red');
            el2.setAttribute('data-color', 'red');

            el.appendChild(text);
            el2.appendChild(text2);
            $('body').append(el);
            $('body').append(el2);

            var view =  window.rivets.bind(el);
            var view2 =  window.rivets.bind(el2);
            view.bindings[0].bind();
            view2.bindings[0].bind();

            $(el).trigger('mouseover');
            expect($('#suit-tooltip:visible').text()).toBe('testing tooltip black');
            $(el).trigger('mouseout');
            expect($('#suit-tooltip:visible').text()).toBe('');

            $(el2).trigger('mouseover');
            expect($('#suit-tooltip:visible').text()).toBe('testing tooltip red');
            $(el2).trigger('mouseout');
            expect($('#suit-tooltip:visible').text()).toBe('');

            $('#suit-tooltip').remove();
            view.bindings[0].unbind(el);
            view2.bindings[0].unbind(el2);
            $(el).remove();
            $(el2).remove();
        });
    });
});
