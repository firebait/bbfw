'use strict';
Suit.Components = Suit.Components || {};
Suit.Components.Binders = Suit.Components.Binders || {};

Suit.Components.Binders.view = {
    block: true,
    bind: function (el) {
        var $el = $(el),
            Root = App.Views,
            data = $el.data(),
            view = data.name,
            self = this,
            attr;

        _.each(view.split('.'), function (child) {
            if (_.isUndefined(Root)) { return; }
            Root = Root[child];
        });

        if (_.isUndefined(Root)) { throw view + ' does not exist.'; }

        attr = {el: el};
        _.each(data, function (value, key) {
            var keypath = value.split(':'),
                rootModel = self.view.models[keypath.shift()],
                model = rootModel;
            if (rootModel && keypath.length > 0) {
                model = self.view.adapters[':'].read(rootModel, keypath.join(':'));
            }
            attr[_.str.camelize(_.str.underscored(key))] = model || value;
        });
        $el.removeAttr('suit-view');
        this.$view = new Root(attr);
        this.$view.setParent(this.view.models);
        this.$view.render();
    },

    unbind: function () {
        if (this.$view) {
            this.$view.close();
        }
    },

    routine: function () {
    }
};

_.extend(window.rivets.binders, Suit.Components.Binders);
