(function (rivets) {
    'use strict';

    rivets.configure({
        prefix: 'suit',
        handler: function (target, event, binding) {
            if (binding.model instanceof Suit.Model) {
                this.apply(binding.model, []);
            }
            var $target = $(target),
                val = $target.val(),
                args = [event, target];
            if ($target.is(':input')) {
                var code = event.charCode || event.keyCode;
                val += (event.type === 'keypress') ?  String.fromCharCode(code) : '';
                args.unshift(val);
            }
            this.apply(binding.model, args);
        }
    });

})(window.rivets);
