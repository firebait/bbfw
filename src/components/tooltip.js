'use strict';

window.rivets.binders.tooltip = {
    bind: function (el) {
        var currentTarget = $(el);
        
        this.callback = function () {
            var tooltip = $('body').find('#suit-tooltip');
            var tooltipContent = $('body').find('#suit-tooltip .tooltip-content');
            var message = $(el).attr('suit-tooltip');
            tooltipContent.text(message);

            tooltip.css({
                top: currentTarget.offset().top - tooltip.height() - 12,
                left: currentTarget.offset().left - 10,
                'max-width': '250px'
            }).show();
        };
        this.hideCallback = function () {
            var tooltip = $('body').find('#suit-tooltip');
            tooltip.hide();
        };
        $(el).on('mouseover', this.callback);
        $(el).on('mouseout', this.hideCallback);
    },
    unbind: function (el) {
        $(el).off('mouseover', this.callback);
        $(el).off('mouseout', this.hideCallback);
      
    },
    routine: function (el) {
        var message = $(el).attr('suit-tooltip');
        var color = $(el).attr('data-color');
        var tooltip = $('<div id="suit-tooltip" class="tooltip ' + color + '"><div class="tooltip-content">' +  message + '</div><div class="tooltip-arrow"></div></div>');
        if ($('#suit-tooltip').length === 0) {
            $('body').append(tooltip);
        }
    }
};