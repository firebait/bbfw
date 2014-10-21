'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

/** List of registered components for the Suit framework */
Suit.Components.registeredComponents = [];

/** Here you will register a component using the class name of the top element. */
Suit.Components.registerComponent = function (className) {
    className = _.str.classify(_.str.underscored(className));
    Suit.Components.registeredComponents.push(className);
    Suit.Components.registeredComponents = _.uniq(Suit.Components.registeredComponents);
};

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
