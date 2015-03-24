'use strict';

// Suit Model inherits for Backbone relational which is tested on it's own.
// We are only testing the Backbone Moment extension.
describe('Suit Model', function () {

    var model, server;

    describe('local storage for models with url', function () {

        beforeEach(function () {
            server = sinon.fakeServer.create();
            model = Suit.Model.findOrCreate({id: 111});
            model.className = 'localStorage';
            model.localStorage = true;
            model.url = 'something';
        });

        afterEach(function () {
            server.restore();
            localStorage.clear();
        });

        it('should save to localStorage after model is saved', function () {
            model.set('test', 'test');
            server.respondWith('POST', model.url, [200, { 'Content-Type': 'application/json' }, '{"test": "test"}']);
            model.save();
            server.respond();
            expect(model.get('test')).toEqual('test');
            expect(localStorage.getItem('localStorage111')).toBe('{"id":111,"test":"test"}');
        });
        it('should load from localStorage', function () {
            model.set('test', 'test');
            server.respondWith('POST', model.url, [200, { 'Content-Type': 'application/json' }, '{"test": "test"}']);
            model.save();
            server.respond();
            expect(model.get('test')).toEqual('test');
            expect(localStorage.getItem('localStorage111')).toBe('{"id":111,"test":"test"}');
            Backbone.Relational.store.reset();
            var newModel = Suit.Model.findOrCreate({id: 111});
            newModel.className = 'localStorage';
            newModel.localStorage = true;
            newModel.remoteStorage =  true;
            expect(newModel.get('test')).toEqual('test');
        });

    });

    describe('local storage for models without url', function () {
        beforeEach(function () {
            model = Suit.Model.findOrCreate({id: 112});
            model.className = 'localStorageNoUrl';
            model.localStorage = true;
            model.remoteStorage =  false;
        });

        afterEach(function () {
            localStorage.clear();
        });

        it('should save to localStorage after model is saved', function () {
            model.save({'test': 'test'});
            expect(model.get('test')).toEqual('test');
            expect(localStorage.getItem('localStorageNoUrl112')).toBe('{"id":112,"test":"test"}');
        });

        it('should load from localStorage', function () {
            model.save({'test': 'test'});
            expect(model.get('test')).toEqual('test');
            Backbone.Relational.store.reset();
            var newModel = Suit.Model.findOrCreate({id: 112});
            newModel.className = 'localStorageNoUrl';
            newModel.localStorage = true;
            newModel.remoteStorage =  false;
            expect(newModel.get('test')).toEqual('test');
        });

        it('should remove from localStorage after model is deleted', function () {
            model.save({'test': 'test'});
            expect(model.get('test')).toEqual('test');
            expect(localStorage.getItem('localStorageNoUrl112')).toBe('{"id":112,"test":"test"}');
            model.destroy();
            expect(localStorage.getItem('localStorageNoUrl112')).toBe(null);
        });

    });


    describe('date parsing', function () {

        var dateString;

        beforeEach(function () {
            var date = new Date('2012/01/01 12:00');
            dateString = moment(date).toString();
            model = new Suit.Model();
            model.dateAttrs = ['startDate'];
            model.set({startDate: dateString});
        });

        it('should return a backbone moment if the attribute is on the dateAttrs array', function () {
            expect(model.get('startDate').toString()).toEqual(moment(new Date(dateString)).toString());
        });

        it('should set the backbone moment to a string with the format set on dateFormat attribute', function () {
            expect(model.attributes.startDate).toEqual('2012-01-01 12:00:00');
            model.dateFormat = 'YYYY-MM-DD';
            model.set({startDate: dateString});
            expect(model.attributes.startDate).toEqual('2012-01-01');
        });

        it('should set the backbone moment to an empty string if date is undefined or null', function () {
            expect(model.attributes.startDate).toEqual('2012-01-01 12:00:00');
            model.set({startDate: null});
            expect(model.attributes.startDate).toEqual('');
            model.set({startDate: undefined});
            expect(model.attributes.startDate).toEqual('');
        });

    });

    describe('attribute parsing', function () {

        it('should convert all of the response attributes to camelcase when parsed and revert it when toJSON is called', function () {
            model = new Suit.Model();
            var parseResponse = model.parse({'start_date': 'date1'});
            expect(parseResponse).toEqual({'startDate': 'date1'});
            model.set({'startDate': 'date1'});
            var toJsonAttributes = model.toJSON();
            expect(toJsonAttributes).toEqual({'start_date': 'date1'});
        });

    });

    describe('Suit.Validation', function () {
        describe('validate', function () {
            var spy;

            beforeEach(function () {
                spy = sinon.spy();
            });

            afterEach(function () {
                spy.reset();
            });

            it('should execute the validated event when validation occurs', function () {
                var model = new Suit.Model();
                model.on('validated', spy);
                model.isValid();

                // Async, there we u
                _.defer(function () {
                    expect(spy.called).toBe(true);
                    expect(spy.calledOnce).toBe(true);
                });
            });
        });

        describe('required validation', function () {
            var Model;

            beforeEach(function () {
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['required']
                        }
                    }
                });
                model = new Model();
            });

            it('should validate empty strings', function () {
                model.set({
                    name: ''
                });
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name is required.');

                model.set({
                    name: 'asd'
                });
                expect(model.isValid()).toBe(true);
                expect(model.validate()).toBeUndefined();
            });

            it('should validate if undefined', function () {
                model.set({
                    name: undefined
                });
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name is required.');
            });

            it('should validate if null', function () {
                model.set({
                    name: null
                });
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name is required.');
            });

            it('should validate empty arrays', function () {
                model.set({
                    name: []
                });
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name is required.');

                model.set({
                    name: [1]
                });
                expect(model.isValid()).toBe(true);
                expect(model.validate()).toBeUndefined();
            });
        });

        describe('email validation', function () {
            it('should validate email pattern', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['email']
                        }
                    }
                });
                model = new Model();

                model.set({ name: 'email' });
                expect(model.isValid()).toBe(false);
                model.set({ name: 'email@' });
                expect(model.isValid()).toBe(false);
                model.set({ name: 'email@something' });
                expect(model.isValid()).toBe(false);
                model.set({ name: '@something' });
                expect(model.isValid()).toBe(false);
                model.set({ name: 'email@something.com' });
                expect(model.isValid()).toBe(true);
                model.set({ name: 'email@something.co.uk' });
                expect(model.isValid()).toBe(true);
                model.set({ name: 'a.email@something.co.uk' });
                expect(model.isValid()).toBe(true);
            });
        });

        describe('confirmation validation', function () {
            it('should validate confirmation field', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        password: {
                            rules: ['confirmation']
                        }
                    }
                });
                model = new Model();

                model.set({ });
                expect(model.isValid()).toBe(true);
                model.set({ password: 'password' });
                expect(model.isValid()).toBe(false);
                model.set({ password: 'password', passwordConfirmation: 'pass' });
                expect(model.isValid()).toBe(false);
                model.set({ password: 'password', passwordConfirmation: 'password' });
                expect(model.isValid()).toBe(true);
            });
        });

        describe('min validation', function () {
            it('should validate the min length validation', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['min'],
                            min: 4
                        }
                    }
                });
                model = new Model();
                expect(model.isValid()).toBe(false);
                expect(model.validate().name.length).toBe(1);
                expect(model.validate().name[0]).toBe('Name needs to be at least 4 characters long.');

                model.set({name: 'abc'});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name.length).toBe(1);
                expect(model.validate().name[0]).toBe('Name needs to be at least 4 characters long.');

                model.set({name: 'abcd'});
                expect(model.isValid()).toBe(true);
            });
        });

        describe('inclusion validation', function () {

            it('should validate the inclusion of a value on a list', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['inclusion'],
                            values: [1, 2, 3]
                        }
                    }
                });
                model = new Model({name: 5});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name value in not included in the list of values.');
            });

        });

        describe('numeric range validations', function () {
            it('should validate that atttribute is between the numeric range inclusive', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['required', 'numeric'],
                            numeric: {range: [0, 100], rangeInclusive: true}
                        }
                    }
                });
                model = new Model({name: 0});
                expect(model.isValid()).toBe(true);
                model.set('name', 100);
                expect(model.isValid()).toBe(true);
                model.set('name', 200);
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('The name is not in the range of 0 and 100 inclusive.');
                model.set('name', -100);
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('The name is not in the range of 0 and 100 inclusive.');
            });

            it('should validate that atttribute is between the numeric range not inclusive', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['required', 'numeric'],
                            numeric: {range: [0, 100], rangeInclusive: false}
                        }
                    }
                });
                model = new Model({name: 0});
                expect(model.isValid()).toBe(false);
                model.set('name', 100);
                expect(model.isValid()).toBe(false);
                model.set('name', 200);
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('The name is not in the range of 0 and 100 not inclusive.');
                model.set('name', -100);
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('The name is not in the range of 0 and 100 not inclusive.');
            });

            it('should validate that atttribute greater than', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['required', 'numeric'],
                            numeric: {gt: 100}
                        }
                    }
                });
                model = new Model({name: 100});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('The name has to be greater than 100');
                model.set('name', 101);
                expect(model.isValid()).toBe(true);
            });

            it('should validate that atttribute greater than or equal', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['required', 'numeric'],
                            numeric: {gte: 100}
                        }
                    }
                });
                model = new Model({name: 99});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('The name has to be greater than or equal to 100');
                model.set('name', 100);
                expect(model.isValid()).toBe(true);
            });

            it('should validate that atttribute less than', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['required', 'numeric'],
                            numeric: {lt: 100}
                        }
                    }
                });
                model = new Model({name: 100});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('The name has to be less than 100');
                model.set('name', 99);
                expect(model.isValid()).toBe(true);
            });

            it('should validate that atttribute less than or equal', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['required', 'numeric'],
                            numeric: {lte: 100}
                        }
                    }
                });
                model = new Model({name: 101});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('The name has to be less than or equal to 100');
                model.set('name', 100);
                expect(model.isValid()).toBe(true);
            });

        });

        describe('numeric validation', function () {

            it('should validate if value is numeric', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['numeric']
                        }
                    }
                });
                model = new Model({name: 't'});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name value must be numeric.');

                model.set('name', 0);
                expect(model.isValid()).toBe(true);

                model.set('name', 123);
                expect(model.isValid()).toBe(true);
            });

        });

        describe('max validation', function () {
            it('should validate the max length validation', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['max'],
                            max: 4
                        }
                    }
                });
                model = new Model();
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name needs to be less than 4 characters long.');

                model.set({name: 'abc'});
                expect(model.isValid()).toBe(true);

                model.set({name: 'abcd'});
                expect(model.isValid()).toBe(true);

                model.set({name: 'abcde'});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name needs to be less than 4 characters long.');
            });
        });

        describe('range validation', function () {
            it('should validate the range length validation', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['range'],
                            range: [4, 6]
                        }
                    }
                });
                model = new Model();

                model.set({name: 'abc'});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name[0]).toBe('Name needs to be between 4 and 6.');

                model.set({name: 'abcd'});
                expect(model.isValid()).toBe(true);

                model.set({name: 'abcde'});
                expect(model.isValid()).toBe(true);
            });
        });

        describe('custom validation', function () {
            it('should validate custom validations', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        pass1: {
                            rules: ['passwordMatch']
                        }
                    },
                    passwordMatch: function () {
                        if (this.get('pass1') !== this.get('pass2')) {
                            return 'Passwords don\'t match';
                        }
                    }
                });
                model = new Model({
                    pass1: '',
                    pass2: ''
                });

                expect(model.isValid()).toBe(true);

                model.set({
                    pass1: 'abc',
                    pass2: 'abcd'
                });
                expect(model.isValid()).toBe(false);
                expect(model.validate().pass1[0]).toBe('Passwords don\'t match');
            });

            it('should validate custom validations using parameters provided', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        pass1: {
                            rules: ['passwordMatch'],
                            passwordMatch: {
                                message: 'Bang!'
                            }
                        }
                    },
                    passwordMatch: function (attr, val, args) {
                        if (this.get('pass1') !== this.get('pass2')) {
                            return args.message;
                        }
                    }
                });
                model = new Model({
                    pass1: '',
                    pass2: ''
                });

                expect(model.isValid()).toBe(true);

                model.set({
                    pass1: 'abc',
                    pass2: 'abcd'
                });
                expect(model.isValid()).toBe(false);
                expect(model.validate().pass1[0]).toBe('Bang!');
            });
        });

        describe('multiple validation', function () {
            it('should validate multiple rules at once', function () {
                var Model;
                Model = Suit.Model.extend({
                    validates: {
                        name: {
                            rules: ['required', 'minLengthPass']
                        }
                    }
                });
                model = new Model();
                model.set({name: ''});

                expect(model.isValid()).toBe(false);
                expect(model.validate().name.length).toBe(2);
                expect(model.validate().name[0]).toBe('Name is required.');
                expect(model.validate().name[1]).toBe('Name needs to be at least 6 characters long.');

                model.set({name: 'a'});
                expect(model.isValid()).toBe(false);
                expect(model.validate().name.length).toBe(1);
                expect(model.validate().name[0]).toBe('Name needs to be at least 6 characters long.');

                model.set({name: '1234567'});
                expect(model.isValid()).toBe(true);
            });

            it('should validate with a rule required without email because it is blank', function () {
                var model = new Suit.Model({
                    email: ''
                });
                model.validates = {
                    email: {
                        rules: ['required', 'email']
                    }
                };
                expect(model.isValid()).toBe(false);
                expect(model.validate().email.length).toBe(1);
                expect(model.validate().email[0]).toBe('Email is required.');
            });
        });
    });

});
