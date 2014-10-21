'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Video = Suit.Component.extend(/** @lends Suit.Components.Video.prototype */{
    /**
      * @class Suit.Components.Video
      * @classdesc Suit component framework video component.
      *
      * <p>Attributes to be set in mark-up</p>
      * <p>It takes the same attributes as the VideoJS plugin as data attributes:</p>
      * 
      * @augments Suit.Component
      * @constructs Suit.Components.Video
      */
    initialize: function () {
        Suit.Component.prototype.initialize.apply(this, this.options);
        // Let's initialize all components and hook up all the events.
        var self = this;
        var el = this.$el;
        
        // We need to set the id for the slider to use.
        el.attr('id', this.cid);
 
        var video = document.getElementById(this.cid);
        if (video) {
            this.video = videojs(video, {
                'controls': true,
                'autoplay': false,
                'preload': 'auto',
                'techOrder': ['flash', 'html5']
            });
        }

        // Keep track if we disposed it because this is done for each tech.
        this.isDisposed = false;
        this.listenTo(this, 'onClose', function () {
            if (self.video && !self.isDisposed) {
                self.video.dispose();
                self.isDisposed = true;
            }
        });
    }
});

// Update the flash player location.
videojs.options.flash.swf = 'bower_components/videojs/dist/video-js/video-js.swf';

// Register component.
Suit.Components.registerComponent('Video');
