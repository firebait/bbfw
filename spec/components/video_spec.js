'use strict';

describe('Suit video component', function () {
   
    var view, html, testDiv, el;

    beforeEach(function () {
        testDiv = $('<div id="container-' + jasmine.getEnv().currentSpec.id + '"></div>');
        $('body').append(testDiv);
        html = '<div><video height="186" width="330" class="video video-js vjs-default-skin vjs-big-play-centered"><source src="http://www.youtube.com/watch?v=xf5PIyJQjHw" /></video></div>';
        el = $(html)[0];
        view = new Suit.View({el: el});
        testDiv.html(view.el);
        view.render();
    });

    afterEach(function () {
        view.close();
    });

    it('should initialize a view containing the video component', function () {
        var video = view.children[0];
        expect(video).not.toBeUndefined();
    });

});
