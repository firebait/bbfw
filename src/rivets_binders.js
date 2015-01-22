'use strict';
(function () {

    var binders = {

        'class-*-unless': function (el, value) {
            return (!Boolean(value)) ? $(el).addClass(this.args[0]) : $(el).removeClass(this.args[0]);
        }

    };
    _.extend(window.rivets.binders, binders);

})();