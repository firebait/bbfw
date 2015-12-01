'use strict';

Suit.View = Backbone.View.extend(/** @lends Suit.View.prototype */{
    /**
      * @class Suit.View
      * @classdesc Suit framework view class, it's use to manage the DOM layout and events triggered by the application.
      *
      * <h4>Extending</h4>
      *
      * <p><b>var MyView = Suit.View.extend({ Suit.View.prototype.initialize.apply(this, this.options); });</b></p>
      *
      * <p>This will create a view object with all of the features that Suit.View has to offer.</p>
      *
      * <h4>Usage:</h4>
      *
      * <p>When you decide to create a View you should create it with the command line using the following command:<br />
      * <br />
      * <b>yo suit:view[folderName]/[name]</b></p>
      *
      * <p>The folder is optional.</p>
      *
      * <p>This will create two files:<br />
      * <br />
      * <b>app/views/[folderName]/[name].js</b><br />
      * <b>spec/views/[folderName]/[name]_spec.js</b><br />
      * <br />
      * These will be a template for testing and basic view defaults.<br />
      * <br />
      * Instantiation:<br />
      * <br />
      * <b>var view = new Suit.View()</b></p>
      *
      * @augments Backbone.View
      * @constructs Suit.View
      */
    initialize: function (options) {
        // This should included in all of the
        // Suit.View.prototype.initialize.apply(this, this.options);
        this.viewData = {};
        options = _.isObject(options) ? options : {};
        this.options = _.isObject(this.options) ? this.options : {};
        this.options = _.extend(this.options, options);

        this.components = {};

        this.setParent(this.options.parent);
        this.children = this.options.children || [];

        if (!_.isUndefined(this.options.model)) {
            this.model = this.options.model;
            this.listenTo(this.model, 'request', this.cleanErrors);
            this.listenTo(this.model, 'error', this.handleErrors);
            this.listenTo(this.model, 'validated', this.handleValidation);
        }

        // Extending child events, to our custom events
        this.events = _.result(this, 'events') || {};
        this.events = _.extend({
            'mouseover .error' : function (event) {
                var currentTarget = $(event.currentTarget);
                var key = currentTarget.attr('data-error-key');

                // Since select boxes are "different", we need to actually select
                // the <select> inside the .select-box
                if (currentTarget.is('.select-box')) {
                    key = currentTarget.find('select').attr('data-error-key');
                }

                // This is a way to actually recalculate the current offset
                var tooltip = $('body').find('.tooltip[data-error-key="' + key + '"]');
                tooltip.css({
                    top: currentTarget.offset().top - tooltip.height() - 12,
                    left: currentTarget.offset().left
                }).show();
            },
            'mouseout .error' : function (event) {
                var currentTarget = $(event.currentTarget);
                var key = currentTarget.attr('data-error-key');
                if (currentTarget.is('.select-box')) {
                    key = currentTarget.find('select').attr('data-error-key');
                }
                $('body').find('.tooltip[data-error-key="' + key + '"]').hide();
            }
        }, this.events);

        // Here we will wrap the render and close events.
        var self = this;
        // Render
        _.bindAll(this, 'render');
        this.render = _.wrap(this.render, function (render) {
            self._beforeRender();
            self.trigger('onRender');
            render();
            self._afterRender();
            return self;
        });
        // Close
        _.bindAll(this, 'close');
        this.close = _.wrap(this.close, function (close) {
            self._beforeClose();
            self.trigger('onClose');
            close();
            self._afterClose();
            return self;
        });

        // Listen to the user permissions in order to remove elements that they should not see.
        if (App.currentUser) {
            this.listenTo(App.currentUser, 'change:permission', this._removeUnauthorizedElements);
        }

        // Create an errors container to clear the proper errors for the view.
        this.errors = [];

        // Attach this view to the el data('view') property for later use.
        this.$el.data('view', this);
    },
    /** Applying formatter functionality in our views */
    formatters: Suit.Helpers.Formatters,
    /**
    *   Cleans error tag when form is submitted or model is saved
    */
    cleanErrors: function () {
        this.$el.find('.error').removeClass('error');
        while (this.errors.length) {
            var el = this.errors.pop();
            el.remove();
        }
    },
    /**
      * Handles server response errors for inputs on the view.
      * @param {Suit.Model} model
      * @param {Object} response
    */
    handleErrors: function (model, response) {
        var self = this;
        if (!_.isUndefined(response) && (response.status === 400 || response.status === 422)) {
            var jsonResponse = JSON.parse(response.responseText);
            _.each(jsonResponse, function (val, key) {
                self.showVisualError(key, val);
            });
        }
    },
    /**
      * Handles front-end validation (at client side)
      * @param {Bool} isValid - Determines if the validation passed or not
      * @param {Suit.Model} model - Model that is being validated
      * @param {Object} invalidAttrs - Object with the list of invalid attrs
      */
    handleValidation: function (isValid, model, invalidAttrs) {
        var self = this;
        this.cleanErrors();

        if (!isValid) {
            _.each(invalidAttrs, function (value, key) {
                self.showVisualError(key, value);
            });
        }
    },
    /**
      * Handles the visual error show on the form inputs, based on the received
      * key.
      * @param {String} key - Form key
      */
    showVisualError: function (key, value) {
        var underscoredKey = _.str.underscored(key);
        var inputElem = this.$el.find('[name="' + key + '"], [data-name="' + key + '"], [name="' + underscoredKey + '"], [data-name="' + underscoredKey + '"]');
        if (inputElem.length > 0) {
            if (inputElem.prop('type') === 'select-one') {
                inputElem.parent().addClass('error');
            } else {
                inputElem.addClass('error');
            }

            // Add key reference, for further use
            inputElem.attr('data-error-key', key);

            // If the value is a list of errors, we should show them in a list
            var content = '';
            if (_.isArray(value)) {
                content = value.map(function (msg) {
                    return msg.replace(key, _.str.humanize(key));
                }).join('<br />');
            } else {
                content = value.replace(key, _.str.humanize(key));
            }

            // Add tooltip element
            var tooltip = $('<div class="tooltip" data-error-key="' + key + '"><div class="tooltip-content">' +  content + '</div><div class="tooltip-arrow"></div></div>');
            this.errors.push(tooltip);
            $('body').append(tooltip);
        }
    },
    /**
      * Sets the parent view for this view and adds this view as one of it's child.
      * @param {Suit.View} parent
      */
    setParent: function (parent) {
        this.parent = parent;
        if (!_.isUndefined(this.parent)) {
            this.parent.children.push(this);
            this.parent.children = _.uniq(this.parent.children);
            this.listenTo(this.parent, 'onClose', this.close);
        }
    },
    /**
      * Sets a view as a child and this view as a parent.
      * @param {Suit.View} child
      */
    setChild: function (child) {
        child.setParent(this);
    },
    /**
      * Searches the DOM under the view and returns the Jquery element that matches the selector or the view's element
      if the selector is undefined.
      * @param {string} selector
      * @return {element}
      */
    find: function (selector) {
        if (_.isUndefined(selector)) {
            return this.$el;
        }
        return this.$el.find(selector);
    },
    /**
      * It finds the closes parent view for a selector. Useful when adding a child view using a selector and there is another
      * child view in between.
      * @param {string} selector
      * @return {Suit.View}
      */
    findClosestParentView: function (selector) {
        var el = this.find(selector);
        if (el === this.$el) {
            return this;
        } else if (!_.isUndefined(el.data('view'))) {
            return el.data('view');
        } else {
            var parent = _.find(el.parents(), function (parent) {
                return !_.isUndefined($(parent).data('view'));
            });
            if (!_.isUndefined(parent)) {
                return $(parent).data('view');
            } else {
                return undefined;
            }
        }
    },
    /**
      * Appends a view to this view to the root element or the selector.
      * @param {Suit.View} view
      * @param {string} selector
      */
    appendView: function (view, selector) {
        // Check which is the closes view before appending.
        var parentView = this.findClosestParentView(selector);
        var el = this.find(selector);
        view.setParent(parentView);
        el.append(view.el);
        view.render();
        return this;
    },
    /**
      * Prepends a view to this view to the root element or the selector.
      * @param {Suit.View} view
      * @param {string} selector
      */
    prependView: function (view, selector) {
        // Check which is the closes view before prepending.
        var parentView = this.findClosestParentView(selector);
        var el = this.find(selector);
        view.setParent(parentView);
        el.prepend(view.el);
        view.render();
        return this;
    },
    /**
      * Replaces the html content of the root element or the selector of this view with another view.
      * @param {Suit.View} view
      * @param {string} selector
      */
    htmlView: function (view, selector) {
        this.empty(selector);
        this.appendView(view, selector);
        return this;
    },

    // This should be moved to Guide
    noData: function (selector) {
        var el = this.find(selector);

        if (el.find('.no-data').length === 0) {
            var parent = el.parent();
            var height = el.outerHeight();
            var width = el.outerWidth();

            var divElem = $('<div class="no-data bgc-light-grey p-absolute ta-center fs-20"></div>');

            parent.data('original-position', parent.css('position'));
            parent.css('position', 'relative');

            divElem.html('Ø NO DATA FOR SELECTED TIMEFRAME');
            divElem.css('line-height', height + 'px');
            divElem.css('vertical-align', 'middle');
            divElem.css('width', width + 'px');
            divElem.css('height', height + 'px');
            divElem.css('top', 0);
            divElem.css('left', 0);
            el.append(divElem);
        }
    },
    // This should be moved to Guide
    removeNoData: function (selector) {
        var el = this.find(selector);
        var parent = el.parent();
        var noDataEl = el.find('.no-data');
        noDataEl.remove();
        parent.css('position', parent.data('original-position'));
    },
    /**
      * Displays loader for the current view selector.
      * Example usage: view.loader({selector: '.anyClass', loaderSize: 'small', tone: 'light'});
      *
      * @param {Object}
      * object.selector
      * object.loaderSize - large or small default is large.
      * object.tone - dark or light default is dark.
    **/
    loader: function (object) {
        var el;
        if (object && object.selector) {
            el  = this.find(object.selector);
        } else {
            el = this.$el;
        }
        var parent = el.parent();
        var height = el.outerHeight();
        var width = el.outerWidth();

        var divElem = $('<div class="loader"></div>');

        if (object && object.loaderSize === 'small') {
            divElem.addClass('small');
        }

        if (object && object.tone === 'light') {
            divElem.addClass('light');
        }

        parent.data('original-position', parent.css('position'));
        parent.css('position', 'relative');
        divElem.css('width', width + 'px');
        divElem.css('height', height + 'px');
        divElem.css('top', 0);
        divElem.css('left', 0);
        el.append(divElem);
    },
    /**
    Remove the loader from the view
    @params {String} selector.
    */
    removeLoader: function (selector) {
        var el = this.find(selector);
        var parent = el.parent();
        var loader = el.find('.loader');
        loader.remove();
        parent.css('position', parent.data('original-position'));
    },
    /**
      * Empty's the content of the views element or an specific selector.
      * @param {string} selector
      */
    empty: function (selector) {
        this.closeChildren(selector);
        this.find(selector).empty();
    },
    /**
      * It fetches all the children for a view using the passed selector to search the DOM under the view.
      * @param {string} selector
      * @return {array} array of children views.
      */
    findChildrenBySelector: function (selector) {
        if (!_.isUndefined(selector)) {
            var closestParent = this.findClosestParentView(selector);
            if (!_.isUndefined(closestParent)) {
                var el = closestParent.find(selector).get(0);
                return _.filter(closestParent.children, function (child) {
                    return child.$el === el || _.contains(child.$el.parents(), el);
                });
            }
        }
        return this.children;
    },
    /**
      * It closes child views using the passed selector by removing them for DOM and clearing their events.
      * @param {string} selector
      */
    closeChildren: function (selector) {
        var children = this.findChildrenBySelector(selector);
        for (var i = children.length - 1; i >= 0; i--) {
            children[i].close();
        }
    },
    /**
      * It handles before close events in for the Suit framework exclusively, DO NOT OVERRIDE IT!
      */
    _beforeClose: function () {
        if (this._rivets) {
            this._rivets.unbind();
        }
        this.$('.error').off('hover');
        this.trigger('beforeClose');
        this.beforeClose();
        //Remove the tooltips associated to the view
        _.each(this.$el.find('[data-error-key]'), function (htmlElement) {
                var $htmlElement = $(htmlElement);
                var dataErrorKey = $htmlElement.attr('data-error-key');
                $('.tooltip[data-error-key="' + dataErrorKey + '"]').remove();
            });
        // Remove from parent children.
        if (!_.isUndefined(this.parent)) {
            var index = this.parent.children.indexOf(this);
            if (index >= 0) {
                this.parent.children.splice(index, 1);
            }
            this.parent = undefined;
        }
        this.trigger('onClose');
        this.unbind();
        if (!_.isUndefined(this.$el)) {
            this.$el.unbind();
        }
        // Detach all events and remove all JQuery children form DOM and clean up.
        if (!_.isUndefined(this.$el)) {
            _.each(this.$el.find('*'), function (el) {
                el = $(el);
                el.unbind();
                el.remove();
            });
        }
    },
    /** Method to be implemented for before close handling. */
    beforeClose: function () {
        // Override and implement your before render logic.
    },
    /**
      * It closes the view by removing it from DOM, clearing all event and closing all child views.
      */
    close: function (event) {
        // Prevent defaults if it's called by an actual object on the view.
        if (event instanceof Event) {
            event.preventDefault();
        }
        if (!_.isUndefined(this.$el)) {
            this.remove(); // <<< remove does two things, this.$el.remove() and also this.stopListening()
        } else {
            this.stopListening();
        }
        if (!_.isUndefined(this.$el)) {
            delete this.$el;
        }
        delete this.el;
    },
    /**
      * It handles after close events in for the Suit framework exclusively, DO NOT OVERRIDE IT!
      */
    _afterClose: function () {
        this.trigger('afterClose');
        this.afterClose();
    },
    /** Method to be implemented for after render handling. */
    afterClose: function () {
        // Override and implement your after close logic.
    },
    /**
      * It handles before render events in for the Suit framework exclusively, DO NOT OVERRIDE IT!
      */
    _beforeRender: function () {
        this.trigger('beforeRender');
        this.beforeRender();
    },
    /** Method to be implemented for before render handling. */
    beforeRender: function () {
        // Override and implement your before render logic.
    },
    /** Render function for the view */
    render: function () {
        if (this.template) {
            this.empty();
            this.$el.html(this.template(this));
        }
        return this;
    },

    /*** Binds Rivets to View ***/
    initRivets: function () {
        if (this._rivets) {
            this._rivets.unbind();
        }
        this._rivets = window.rivets.bind(this.el, this);
    },

    /**
      * It handles after render events in for the Suit framework exclusively, DO NOT OVERRIDE IT!
      */
    _afterRender: function () {
        var self = this;
        this.initializeComponents();
        // Remove the data-role components not visible to some users.
        this._removeUnauthorizedElements();
        //we have to wait for compnents to initialize before the render.
        // _.defer(function () {

        this.initRivets();

        // If we are re-rendering, we need to keep focus on first element with autofocus
        var autoFocused = self.find('input[autofocus]:first');
        if (!_.isEmpty(autoFocused)) {
            _.defer(function () { autoFocused.focus(); });
        }

        self.trigger('afterRender');
        self.afterRender();
        // });
    },
    /** This checks the current user's permission is present in the data-permissions attributes.
     * The roles will be separated by commas.
     */
    _removeUnauthorizedElements: function () {
        if (!App.currentUser || !this.el) { return; }
        var self = this;
        var elements = this.find('[data-permissions]');
        var permission = App.currentUser.get('permission');

        _.each(elements, function (el) {
            el = $(el);
            var permissions = el.attr('data-permissions').replace(/ /g, '').split(',');
            if (!_.contains(permissions, permission)) {
                // We need to figure out if this is a view or just a simple element.
                var view = el.data('view');
                if (view) {
                    view.close();
                } else {
                    self.empty(el);
                    el.remove();
                }
            }
        });
    },
    /** Method to be implemented for after render handling. */
    afterRender: function () {
        // Override and implement your after render logic.
    },
    /** Use for Suit Component management. It searches for uninitialized components inside the view in order to
      * properly initialized them. */
    initializeComponents: function () {
        var self = this;
        _.each(Suit.Components.registeredComponents, function (component) {
            var foundElements = self.$el.find('.' + _.str.dasherize(component).slice(1));
            // For each found element we need to figure out if it has a compoment,
            // if it's initialized and attached to the view as a child.
            if (foundElements.length > 0) {
                _.each(foundElements, function (fc) {
                    var elementView = $(fc).data('view');
                    if (_.isUndefined(elementView)) {
                        var c = new Suit.Components[component]({el: fc});
                        c.setParent(self);
                    } else {
                        elementView.setParent(self);
                    }
                });
            }
        });
    },
    /** Serializer for the form components, useful for converting form elements into
      * a JavaScript object, and then hit the service with this data */
    serializeObject: function (el) {
        el = el || 'form';
        var o = {};
        var a = this.find(el + ' :input').serializeArray();

        $.each(a, function () {
            var keyName = _.str.camelize(this.name);

            if (o[keyName]) {
                if (!o[keyName].push) {
                    o[keyName] = [o[keyName]];
                }
                o[keyName].push(this.value || '');
            } else {
                o[keyName] = this.value || '';
            }
        });

        return o;
    }
});
