'use strict';

describe('Suit Helpers', function () {

    it('should test the toJSON funtion of the helpers', function () {
        var camelCaseJSON = {id: '2', name: 'McDonalds2', createdAt: '2014/04/28 15:31:50', createdBy: 'admin@set.tv', modificateAt: '2014/04/28 15:52:07', modificateBy: 'admin@set.tv'};
        var underscore = Suit.Helpers.toJSON(camelCaseJSON);
        expect(underscore).toEqual({ id : '2', name : 'McDonalds2', 'created_at' : '2014/04/28 15:31:50', 'created_by' : 'admin@set.tv', 'modificate_at' : '2014/04/28 15:52:07', 'modificate_by' : 'admin@set.tv' });
    });

    it('should test the toCamelCase function of the helpers', function () {
        var underscore = { id : '2', name : 'McDonalds2', 'created_at' : '2014/04/28 15:31:50', 'created_by' : 'admin@set.tv', 'modificate_at' : '2014/04/28 15:52:07', 'modificate_by' : 'admin@set.tv' };
        var converted = Suit.Helpers.toCamelCaseObject(underscore);
        expect(converted).toEqual({ id : '2', name : 'McDonalds2', createdAt : '2014/04/28 15:31:50', createdBy : 'admin@set.tv', modificateAt : '2014/04/28 15:52:07', modificateBy : 'admin@set.tv' });
    });
});

describe('Suit.Helpers.Formatters', function () {
    describe('formatDate', function () {
        it('should return an empty string if no date was specified', function () {
            var result = Suit.Helpers.Formatters.formatDate();
            expect(result).toBe('');
        });
        it('should format a date into our date format (MM/DD/YYYY)', function () {
            var result = Suit.Helpers.Formatters.formatDate(moment('2014-02-02'));
            expect(result).toBe('02/02/2014');
        });
    });

    describe('formatNumber', function () {
        it('should return 0 if undefined', function () {
            var result = Suit.Helpers.Formatters.formatNumber(undefined);
            expect(result).toBe(0);
        });
        it('shuold return 0 if null', function () {
            var result = Suit.Helpers.Formatters.formatNumber(null);
            expect(result).toBe(0);
        });
        it('should work with integers', function () {
            var result = Suit.Helpers.Formatters.formatNumber(25);
            expect(result).toBe('25');
        });
        it('should work with floating values', function () {
            var result = Suit.Helpers.Formatters.formatNumber(25.44);
            expect(result).toBe('25.4');
        });
    });

    describe('formatNumberOneDecimal', function () {
        it('should return 0 if undefined', function () {
            var result = Suit.Helpers.Formatters.formatNumberOneDecimal(undefined);
            expect(result).toBe(0);
        });
        it('should return 0 if null', function () {
            var result = Suit.Helpers.Formatters.formatNumberOneDecimal(null);
            expect(result).toBe(0);
        });
        it('should return the number with one decimal', function () {
            var result = Suit.Helpers.Formatters.formatNumberOneDecimal('2.79');
            expect(result).toBe('2.8');
        });
    });

    describe('abbreviateNumberNoDecimal', function () {
        it('should return 0 if null or NaN', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumberNoDecimal(null);
            expect(result).toBe('0');

            result = Suit.Helpers.Formatters.abbreviateNumberNoDecimal(NaN);
            expect(result).toBe('0');
        });
        it('should work for Billions', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumberNoDecimal(25000000000);
            expect(result).toBe('25B');
        });
        it('should work for Millions', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumberNoDecimal(3000000);
            expect(result).toBe('3MM');
        });
        it('should work for thousands', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumberNoDecimal(300000);
            expect(result).toBe('300K');
        });
        it('should work also for numbers < 1,000', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumberNoDecimal(999);
            expect(result).toBe(999);
        });
    });

    describe('abbreviateNumber', function () {
        it('should return 0 if null or NaN', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumber(null);
            expect(result).toBe('0');

            result = Suit.Helpers.Formatters.abbreviateNumber(NaN);
            expect(result).toBe('0');
        });
        it('should work for Billions', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumber(2509487766.15);
            expect(result).toBe('2.51B');
        });
        it('should work for Millions', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumber(8948877.24);
            expect(result).toBe('8.95MM');
        });
        it('should work for thousands', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumber(38887.44);
            expect(result).toBe('38.9K');
        });
        it('should work also for numbers < 1,000', function () {
            var result = Suit.Helpers.Formatters.abbreviateNumber(787.39);
            expect(result).toBe('787');
        });
    });

    describe('secondsToString', function () {
    
        it('should convert seconds to HH:MM:SS string', function () {
            var result = Suit.Helpers.Formatters.secondsToString(7971);
            expect(result).toBe('02:12:51');
        });

        it('should convert seconds to MM:SS string if hour is not present', function () {
            var result = Suit.Helpers.Formatters.secondsToString(371);
            expect(result).toBe('06:11');
        });

        it('should convert seconds to MM:SS string if hour and minute is not present', function () {
            var result = Suit.Helpers.Formatters.secondsToString(15);
            expect(result).toBe('00:15');
        });

    });
});
