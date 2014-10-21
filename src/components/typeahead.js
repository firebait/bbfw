'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Typeahead = Suit.Component.extend(/** @lends Suit.Components.Typeahead.prototype */{
    /**
      * @class Suit.Components.Typeahead
      * @classdesc Suit component framework Typeahead component.
      *
      * <p>Attributes to be set in mark-up</p>
      * <p>It takes the same attributes as the DragDealer plugin as data attributes:</p>
      * <p>
           class = 'typeahead', typehead class <BR/>
           data-url = someUrl.com, url of the api that respondes with the values<BR/>
           data-param = 'youQueryParameter', parameter your domain is going to receive to query<BR/>
           data-limit = 10, limit of answers returned by the server.  <BR/>
           data-key = 'label', key in json object to look for  <BR/>

        </p>
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Typeahead
      */
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        // Let's initialize all components and hook up all the events.
        var el = this.$el;
        var url = el.attr('data-url');
        var dataKey =  el.attr('data-key') || 'label';
        var dataLimit = el.attr('data-limit') || 10;
        var filterLang = _.isUndefined(el.attr('data-filter-lang')) ? false : el.attr('data-filter-lang');
        var local = this.options.local || undefined;
        var self = this;

        //query parameter
        if (el.attr('data-param')) {
            url = url + '?' + el.attr('data-param') + '=%QUERY';//%QUERY is used to replace the value of the query.
        }

        //server return limit.
        if (dataLimit) {
            url = url + '&' + 'limit' + '=' + dataLimit;
        }
        // We need to set the id for the Typeahead to use.
        el.attr('id', this.cid);


        //start the engine
        this.engine = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace(dataKey),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: url,
                filter: function (parsedResponse) {
                    // Only if we have to filter the languages, we have to remove them
                    if (filterLang) {
                        parsedResponse = _.reject(parsedResponse, function (item) {
                            return _.contains(App.Models.Label.languageArray, item.id);
                        });
                    }
                    return parsedResponse;
                }
            },
            local: local,
            limit: dataLimit,
            rateLimitWait: 100
        });

        this.engine.initialize();

        //start the typeahead
        $('#' + this.cid).typeahead(null, {
            name: 'name',
            displayKey: dataKey,
            source: self.engine.ttAdapter()
        });


        $('#' + this.cid).keypress(function (e) {
            if (e.which === 13) {//enter
                // var tab = $.Event('keydown');
                // tab.keyCode = tab.which = 9; // 9 == tab
                $(this).trigger('typeahead:selected');
            }
        });
    }
});

// Register component.
Suit.Components.registerComponent('Typeahead');
