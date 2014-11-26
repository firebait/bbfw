'use strict';

describe('Suit RestfulUrls', function () {

    var mockModel = _.extend({id: 5}, Suit.RestfulUrls);

    it('should generate the _restfulBase with the urlRoot as string', function () {
        mockModel.urlRoot = 'some_url';
        expect(mockModel._restfulBase()).toEqual('#some_url');
    });

    it('should generate the _restfulBase with the urlRoot as function', function () {
        mockModel.urlRoot = function () { return 'some_function_url'; };
        expect(mockModel._restfulBase()).toEqual('#some_function_url');
    });

    it('should generate the _restfulBase with the urlRoot undefined', function () {
        delete mockModel.urlRoot;
        mockModel.url = 'api/some_function_url';
        expect(mockModel._restfulBase()).toEqual('#api');
    });

    it('should generate the show, new, edit and delete url', function () {
        mockModel.urlRoot = 'restful_base';
        expect(mockModel.showUrl()).toEqual('#restful_base/5');
        expect(mockModel.newUrl()).toEqual('#restful_base/new');
        expect(mockModel.editUrl()).toEqual('#restful_base/5/edit');
        expect(mockModel.deleteUrl()).toEqual('#restful_base/5');
    });
});
