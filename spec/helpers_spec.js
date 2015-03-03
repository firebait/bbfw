'use strict';

var helpers = Suit.Helpers;
var formatters = helpers.Formatters;

describe('Suit Helpers', function () {

    it('should test the toJSON funtion of the helpers', function () {
        var camelCaseJSON = {id: '2', name: 'McDonalds2', createdAt: '2014/04/28 15:31:50', createdBy: 'admin@set.tv', modificateAt: '2014/04/28 15:52:07', modificateBy: 'admin@set.tv', arrayObject: [{newObject: 'value'}]};
        var underscore = helpers.toJSON(camelCaseJSON);
        expect(underscore).toEqual({ id : '2', name : 'McDonalds2', 'created_at' : '2014/04/28 15:31:50', 'created_by' : 'admin@set.tv', 'modificate_at' : '2014/04/28 15:52:07', 'modificate_by' : 'admin@set.tv', 'array_object': [{'new_object': 'value'}]});
    });

    it('should test the toUnderscoredObject funtion of the helpers', function () {
        var camelCaseJSON = {id: '2', name: 'McDonalds2', createdAt: '2014/04/28 15:31:50', createdBy: 'admin@set.tv', modificateAt: '2014/04/28 15:52:07', modificateBy: 'admin@set.tv', arrayObject: [{newObject: 'value'}]};
        var underscore = helpers.toUnderscoredObject(camelCaseJSON);
        expect(underscore).toEqual({ id : '2', name : 'McDonalds2', 'created_at' : '2014/04/28 15:31:50', 'created_by' : 'admin@set.tv', 'modificate_at' : '2014/04/28 15:52:07', 'modificate_by' : 'admin@set.tv', 'array_object': [{'new_object': 'value'}]});
    });

    it('should test the toCamelCase function of the helpers', function () {
        var underscore = { id : '2', name : 'McDonalds2', 'created_at' : '2014/04/28 15:31:50', 'created_by' : 'admin@set.tv', 'modificate_at' : '2014/04/28 15:52:07', 'modificate_by' : 'admin@set.tv', 'array_object': [{'new_object': 'value'}] };
        var converted = helpers.toCamelCaseObject(underscore);
        expect(converted).toEqual({ id : '2', name : 'McDonalds2', createdAt : '2014/04/28 15:31:50', createdBy : 'admin@set.tv', modificateAt : '2014/04/28 15:52:07', modificateBy : 'admin@set.tv', 'arrayObject': [{'newObject': 'value'}] });
    });
});

describe('Suit.Helpers.Formatters', function () {
    describe('formatDate', function () {
        it('should return an empty string if no date was specified', function () {
            var result = formatters.formatDate();
            expect(result).toBe('');
        });
        it('should format a date into our date format (MM/DD/YYYY)', function () {
            var result = formatters.formatDate(moment('2014-02-02'));
            expect(result).toBe('02/02/2014');
        });
    });

    describe('formatNumber', function () {
        it('should return 0 if undefined', function () {
            var result = formatters.formatNumber(undefined);
            expect(result).toBe('0');
        });
        it('should return 0 if null', function () {
            var result = formatters.formatNumber(null);
            expect(result).toBe('0');
        });
        it('should work with integers', function () {
            var result = formatters.formatNumber(25);
            expect(result).toBe('25');
        });
        it('should work with floating values', function () {
            var result = formatters.formatNumber(25.44);
            expect(result).toBe('25.4');
        });
        it('should work with floating values', function () {
            var result = formatters.formatNumber(0.44);
            expect(result).toBe('0.44');
        });
        it('should return 0 if NaN', function () {
            var result = formatters.formatNumber(NaN);
            expect(result).toBe('0');
        });
    });

    describe('formatNumberPercentage', function () {
        it('should return 0 if undefined', function () {
            var result = formatters.formatNumberPercentage(undefined);
            expect(result).toBe('0%');
        });
        it('should return 0 if null', function () {
            var result = formatters.formatNumberPercentage(null);
            expect(result).toBe('0%');
        });
        it('should return 100% with a value above to 100', function () {
            var result = formatters.formatNumberPercentage(101);
            expect(result).toBe('100%');
        });
        it('should work with integers', function () {
            var result = formatters.formatNumberPercentage(25);
            expect(result).toBe('25%');
        });
        it('should work with floating values', function () {
            var result = formatters.formatNumberPercentage(25.44);
            expect(result).toBe('25.4%');
        });
        it('should work with floating values', function () {
            var result = formatters.formatNumberPercentage(0.44);
            expect(result).toBe('0.44%');
        });
    });

    describe('formatNumberOneDecimal', function () {
        it('should return 0 if undefined', function () {
            var result = formatters.formatNumberOneDecimal(undefined);
            expect(result).toBe('0');
        });
        it('should return 0 if null', function () {
            var result = formatters.formatNumberOneDecimal(null);
            expect(result).toBe('0');
        });
        it('should return the number with one decimal', function () {
            var result = formatters.formatNumberOneDecimal('2.79');
            expect(result).toBe('2.8');
        });
    });

    describe('abbreviateNumberNoDecimal', function () {
        it('should return 0 if null or NaN', function () {
            var result = formatters.abbreviateNumberNoDecimal(null);
            expect(result).toBe('0');

            result = formatters.abbreviateNumberNoDecimal(NaN);
            expect(result).toBe('0');
        });
        it('should work for Billions', function () {
            var result = formatters.abbreviateNumberNoDecimal(25000000000);
            expect(result).toBe('25B');
            result = formatters.abbreviateNumberNoDecimal(-25000000000);
            expect(result).toBe('-25B');
        });
        it('should work for Millions', function () {
            var result = formatters.abbreviateNumberNoDecimal(3000000);
            expect(result).toBe('3MM');
            result = formatters.abbreviateNumberNoDecimal(-3000000);
            expect(result).toBe('-3MM');
        });
        it('should work for thousands', function () {
            var result = formatters.abbreviateNumberNoDecimal(300000);
            expect(result).toBe('300K');
            result = formatters.abbreviateNumberNoDecimal(-300000);
            expect(result).toBe('-300K');
        });
        it('should work also for numbers < 1,000', function () {
            var result = formatters.abbreviateNumberNoDecimal(999);
            expect(result).toBe('999');
            result = formatters.abbreviateNumberNoDecimal(-999);
            expect(result).toBe('-999');
        });
    });

    describe('abbreviateNumber', function () {
        it('should return 0 if null or NaN', function () {
            var result = formatters.abbreviateNumber(null);
            expect(result).toBe('0');

            result = formatters.abbreviateNumber(NaN);
            expect(result).toBe('0');
        });
        it('should work for Billions', function () {
            var result = formatters.abbreviateNumber(2509487766.15);
            expect(result).toBe('2.51B');
        });
        it('should work for Millions', function () {
            var result = formatters.abbreviateNumber(8948877.24);
            expect(result).toBe('8.95MM');
        });
        it('should work for thousands', function () {
            var result = formatters.abbreviateNumber(38887.44);
            expect(result).toBe('38.9K');
        });
        it('should work also for numbers < 1,000', function () {
            var result = formatters.abbreviateNumber(787.39);
            expect(result).toBe('787');
        });
    });

    describe('secondsToString', function () {

        it('should convert seconds to HH:MM:SS string', function () {
            var result = formatters.secondsToString(7971);
            expect(result).toBe('02:12:51');
        });

        it('should convert seconds to MM:SS string if hour is not present', function () {
            var result = formatters.secondsToString(371);
            expect(result).toBe('06:11');
        });

        it('should convert seconds to MM:SS string if hour and minute is not present', function () {
            var result = formatters.secondsToString(15);
            expect(result).toBe('00:15');
        });

    });

    describe('extractNumbersFromString', function () {

        it('should remove the dollar sign $', function () {
            var result = formatters.extractNumbersFromString('$4,000.95');
            expect(result).toBe('4000.95');
        });

        it('should return NaN', function () {
            var result = formatters.extractNumbersFromString('some not number');
            expect(_.isNaN(result)).toBe(true);
        });
    });

    describe('prepend and append', function () {

        it('should prepend string to a sentence', function () {
            var result = formatters.prepend('new-class', 'one', 'two', 'three');
            expect(result).toEqual('new-class one two three');
        });

        it('should append string to a sentence', function () {
            var result = formatters.append('new-class', 'one', 'two', 'three');
            expect(result).toEqual('one two three new-class');
        });
    });

    describe('replace', function () {

        it('should replace text', function () {
            var result = formatters.replace('hello world', 'world', 'all');
            expect(result).toEqual('hello all');
        });

    });

    describe('remove', function () {

        it('should remove text', function () {
            var result = formatters.remove('hello world', ' world');
            expect(result).toEqual('hello');
        });

    });

    describe('convertApiURL', function () {

        it('should remove the api from the url', function () {
            var result = formatters.convertApiURL('/api/some/url');
            expect(result).toEqual('#some/url');
        });

        it('should raise \'Not a valid API url\'', function () {
            expect(function () { formatters.convertApiURL('some/url'); }).toThrow(new Error('Not a valid API url'));
        });
    });

    describe('format absolute', function () {

        it('should convert a number from negative to absolute', function () {
            var result = formatters.absolute('-10');
            expect(result).toEqual(10);
        });

        it('should 0 for NaN', function () {
            var result = formatters.absolute('abc');
            expect(result).toEqual(0);
        });

    });

    describe('infleccion', function () {

        it('should lowercase a string', function () {
            var result = formatters.lowercase('SOME CAPS');
            expect(result).toEqual('some caps');
        });

        it('should uppercase a string', function () {
            var result = formatters.uppercase('some caps');
            expect(result).toEqual('SOME CAPS');
        });

        it('should pluralize a string', function () {
            var result = formatters.pluralize('dog');
            expect(result).toEqual('dogs');
        });

        it('should singularize a string', function () {
            var result = formatters.singularize('dogs');
            expect(result).toEqual('dog');
        });

        it('should gsub a string', function () {
            var result = formatters.gsub('cats and dogs', 'and', 'or');
            expect(result).toEqual('cats or dogs');
        });

        it('should ordinalize a string', function () {
            var result = formatters.ordinalize(1);
            expect(result).toEqual('1st');
        });
    });
});
