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

    describe('authenticate', function () {
        // var spy;
        it('should logout of Session if token doesnt exist', function () {
            // localStorage.removeItem('token');
            // spy = sinon.spy(App.Controllers.Sessions, 'logout');
            // Suit.Can.authenticate();
            // expect(spy).toHaveBeenCalled();
            // change from logout of session to triggering an event?
            console.info('TODO: Should this be moved to guide?');
        });
    });
});
