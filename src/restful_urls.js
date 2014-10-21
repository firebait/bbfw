'use strict';

/**
  * Helper function that generates restful urls for views to use in anchors
  */

Suit.RestfulUrls = {
    /** Url used to generate links for this resource.
        You can override this methods to generate custom functionality.
    **/
    _restfulBase: function () {
        // We need to find a way to extract this into a configuration, so we can pass a regex that will format the url with the proper format per application.
        var url = _.result(this, 'urlRoot');
        if (_.isUndefined(url)) {
            url = _.result(this, 'url');
            url = url.substr(0, url.lastIndexOf('/'));
        }
        return '#' + url.replace('/api/', '').replace('_advertiser', 'advertiser');
    },
    /** Show link url helper method. **/
    showUrl: function () {
        return this._restfulBase.apply(this) + '/' + this.id;
    },
    /** New link url helper method. **/
    newUrl: function () {
        return this._restfulBase.apply(this) + '/new';
    },
    /** Edit link url helper method. **/
    editUrl: function () {
        return this._restfulBase.apply(this) + '/' + this.id + '/edit';
    },
    /** Delete link url helper method. **/
    deleteUrl: function () {
        return this._restfulBase.apply(this) + '/' + this.id;
    }
};
