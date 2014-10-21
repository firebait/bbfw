'use strict';

describe('Suit video component', function () {
   
    var view;

    beforeEach(function () {
        view = new Suit.View();
        // We need to make a tempalte that includes a toogle button.
        view.template = function () { return '<video height="186" width="330" class="video video-js vjs-default-skin vjs-big-play-centered"><source src="" /></video>'; };
        view.render();
    });

    afterEach(function () {
        view.close();
    });

    it('should initialize a toggle button view', function () {
        var video = view.$el.find('.video');
        expect(video.data('view')).not.toBeUndefined();
    });

});
