'use strict';
Suit.Components = Suit.Components || {};
Suit.Components.Binders = Suit.Components.Binders || {};

/** List of registered components for the Suit framework */
Suit.Components.registeredComponents = [];

/** Here you will register a component using the class name of the top element. */
Suit.Components.registerComponent = function (className) {
    className = _.str.classify(_.str.underscored(className));
    Suit.Components.registeredComponents.push(className);
    Suit.Components.registeredComponents = _.uniq(Suit.Components.registeredComponents);
};

Suit.Components.Binders['component-*'] = {
    block: true,
    bind: function () {
        var $el = $(this.el);
        var componentName = _.str.camelize(_.str.underscored(this.args[0]));
        var className = _.str.classify(_.str.underscored(componentName));
        var data = {};
        _.each($el.data(), function (value, key) {
            if (_.str.startsWith(key, componentName)) {
                data[key] = value;
            }
        });
        var attr = {el: this.el};
        var self = this;
        _.each(data, function (value, key) {
            var keypath = value.split(':');
            var rootModel = self.view.models[keypath.shift()];
            var model = rootModel;
            if (rootModel && keypath.length > 1) {
                model = self.view.adapters[':'].read(rootModel, keypath.join(':'));
            }
            attr[_.str.camelize(_.str.underscored(key.replace(componentName, '')))] = model || value;
        });
        this.componentView = new Suit.Components[className](attr);
        $el.removeAttr('suit-component-' + componentName);
        this.componentView.render();
        $el.attr('suit-component-' + componentName);
        this.componentView.setParent(this.view.models);
    },

    unbind: function () {
        this.componentView.close();
    },

    routine: function () {
    }
};

_.extend(window.rivets.binders, Suit.Components.Binders);


Suit.Component = Suit.View.extend(/** @lends Suit.Component.prototype */{
    /**
      * @class Suit.Component
      * @classdesc Suit framework component class is basically a Suit.View to be extended with particular functionality.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyComponent = Suit.Component.extend({});</b></p>
      *
      * <p>This will create a collection object with all of the features that Suit.Component has to offer.</p>
      *
      * <h4>Usage:</h4>
      * 
      * <p>When you decide to create a Component you should create it with the command line using the following command:<br />
      * <br />
      * <b>yo suit:component</b></p>
      *
      * <p>This will ask you for the type of component that you will like to create, along with other configuration questions, it will also ask you about where do you want to place the component generated, which is a template location. The location can be myFolder/myView. The component will be appended to the bottom of the template and it will be automatically instatiated when you render the view. It is your job to test for the components instantiation and rendering.<br />
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var component = new Suit.Component()</b></p>
      *
      * @augments Backbone.View
      * @constructs Suit.Component 
      */
    initialize: function (options) {
        Suit.View.prototype.initialize.apply(this, [options]);
    }
});
