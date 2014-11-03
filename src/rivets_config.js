(function (rivets) {
    'use strict';

    rivets.configure({
        prefix: 'suit',
        handler: function (target, event, binding) {
            var $target = $(target),
                val = $target.val(),
                args = [event, target];
            if ($target.is(':input')) {
                val += (event.type === 'keypress') ?  String.fromCharCode(event.charCode) : '';
                args.unshift(val);
            }
            this.apply(binding.model, args);
        }
    });

})(window.rivets);