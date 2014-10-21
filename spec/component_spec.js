'use strict';

describe('Suit Components', function () {

    it('should have a registeredComponents array', function () {
        expect(_.isArray(Suit.Components.registeredComponents)).toBe(true);
    });

    it('should register a component and classify the name', function () {
        Suit.Components.registerComponent('SuitTab');
        expect(_.contains(Suit.Components.registeredComponents, 'SuitTab')).toBe(true);
    });

});
