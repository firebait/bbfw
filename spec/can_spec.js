'use strict';

describe('Suit framework Can', function () {
    
    describe('go', function () {

        it('should allow return true if no rules are defined', function () {
            App.currentUser = App.Models.User.findOrCreate({id: 1});
            App.canRules = {};
            expect(Suit.Can.go('controller', 'action', App.currentUser)).toBe(true);
        });

        it('should block the user if the permissions don\'t match', function () {
            App.currentUser = App.Models.User.findOrCreate({id: 1, permission: 'admin'});
            App.canRules.controller = {action: {permissions: ['network']}};
            expect(Suit.Can.go('controller', 'action', App.currentUser)).toBe(false);
        });

        it('should allow the user if the permissions match', function () {
            App.currentUser = App.Models.User.findOrCreate({id: 1, permission: 'admin'});
            App.canRules.controller = {action: {permissions: ['admin']}};
            expect(Suit.Can.go('controller', 'action', App.currentUser)).toBe(true);
        });

    });
});
