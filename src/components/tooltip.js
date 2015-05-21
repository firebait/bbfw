'use strict';

window.rivets.binders.tooltip = {
    bind: function (el) {
        var currentTarget = $(el);

        var message = this.keypath;
        var color = currentTarget.data('color');
        var tooltip = $('#suit-tooltip');
        
        if (tooltip.length === 0) {
            tooltip = $('<div id="suit-tooltip" class="tooltip ' + color + '"><div class="tooltip-content">' +  message + '</div><div class="tooltip-arrow"></div></div>');
            $('body').append(tooltip);
        }
        
        this.callback = function () {
            tooltip.attr('class', 'tooltip ' + color);
            tooltip.children('.tooltip-content').text(message);
            tooltip.css({
                top: currentTarget.offset().top - tooltip.height() - 12,
                left: currentTarget.offset().left - 10,
                'max-width': '250px'
            }).show();
        };
        this.hideCallback = function () {
            tooltip.hide();
        };
        currentTarget.on('mouseover', this.callback);
        currentTarget.on('mouseout', this.hideCallback);
    },
    unbind: function (el) {
        var currentTarget = $(el);
        currentTarget.off('mouseover', this.callback);
        currentTarget.off('mouseout', this.hideCallback);
    }
};