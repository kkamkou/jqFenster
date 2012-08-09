/**
 * Licensed under the MIT License
 * Redistributions of files must retain the copyright notice below.
 *
 * @category ThirdParty
 * @author   Kanstantsin A Kamkou (2ka.by)
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     https://github.com/kkamkou/jqFenster
 */

/**
 * v1.0
 *
 * Depends:
 *  jquery.ebony.js (optional)
 *
 * Default options:
 *  animationSpeed  400    Sets animation speed for a window
 *  noOverlay       false  Disables ygOverlay usage
 *  callbackOpen    none   Called after a window was created
 *  callbackClose   none   Called after a window was closed
 *
 * @example:
 *  jQuery.jqFensterOptions.animationSpeed = 0; // global
 *
 *  (a href="/hello/world/"|input|...) class="jqFenster"
 *      data-href="/hello/world"
 *      data-selector="#myDiv"
 *      data-options='{animationSpeed: 200, noOverlay: true, callbackOpen: "myOpen", callbackClose: "myClose"}'
 *
 * In a popup you can use the close helper
 *  (a|input|...) class="jqFensterClose"
 */

(function (doc, win, $) {
    "use strict";

    // default set of options
    $.jqFensterOptions = {
        'noOverlay': false,
        'animationSpeed': 1, // in ms, for example: 200, 400 or 800
        'callbackOpen': null,
        'callbackClose': null
    };

    // main class
    var JqFenster = function (options, $element) {
        // defaults
        this.overlay = null;
        this.options = options;
        this.element = $element;
        this.holder = null;

        // constructor
        this._init = function () {
            var that = this;

            // default holder styles
            this.holder = $('<div/>');

            // lets store some information
            $.data(this.holder.get(0), 'jqFenster', this);

            // do we have JSON options?
            // For example: data-options='{a:0, b:true, c:"3"}'
            if ($element.data('options')) {
                try {
                    // @see http://ecma262-5.com/ELS5_HTML.htm#Section_15.5.4.11
                    $.extend(
                        this.options,
                        $.type($element.data('options')) === 'object' ? $element.data('options')
                            : $.parseJSON($element.data('options').replace(/([a-zA-Z]+):/g, '"$01":'))
                    );
                } catch (e) {
                    $.error([
                        'jqFenster: incorrect JSON provided (check the code of a link)',
                        $element, e.toString()
                    ]);
                }

                // open event redeclaration
                if ($.type(this.options.callbackOpen) === 'string') {
                    this.options.callbackOpen = win[this.options.callbackOpen];
                }

                // close event redeclaration
                if ($.type(this.options.callbackClose) === 'string') {
                    this.options.callbackClose = win[this.options.callbackClose];
                }
            }

            // creating callback for the open event
            if ($.isFunction(this.options.callbackOpen)) {
                this.holder.bind('jqFensterCallbackOpen', function () {
                    return that.options.callbackOpen(that.getElement());
                });
            }

            // creating callback for the close event
            if ($.isFunction(this.options.callbackClose)) {
                this.holder.bind('jqFensterCallbackClose', function () {
                    return that.options.callbackClose(that.getElement());
                });
            }
        };
    };

    // extending
    JqFenster.prototype = {
        // returns the holder object
        getHolder: function () {
            return this.holder;
        },

        // returns the element object
        getElement: function () {
            return this.element;
        },

        // returns the overlay object
        getOverlay: function () {
            return this.overlay;
        },

        // shows popup
        open: function () {
            // locking check
            if (this.isLocked()) {
                return false;
            }

            // constructor
            this._init();

            // locking this element
            this.setLock(true);

            // DOM corrections
            $('body').append(this.getHolder());

            // working with the data
            if (this.getElement().data('selector')) {
                return this.create($(this.getElement().data('selector')));
            }

            var that = this;

            // preload content from the href
            $.get((this.getElement().data('href') || this.getElement().attr('href')))
                .done(function (data) { that.create(data); });

            return this;
        },

        // move window to the center of a screen
        show: function ($elem) {
            // cycling to get the element height
            if (!$elem.height()) {
                var that = this;
                setTimeout(function () { that.show($elem); }, 30);
                return this;
            }

            // aplying the css
            this.getHolder().css({
                'width': $elem.width(),
                'margin': '20px auto'
            });

            $elem.show();

            return this;
        },

        // content switch and show
        create: function (target) {
            var that = this,
                $element = this.getElement(),
                $holder = this.getHolder();

            // DOM corrections
            $holder.empty().append(target);

            // making sure that the inner content is hidden
            // avoiding browser issues
            $holder.children().hide();

            // centerizing
            this.show($holder.children());

            // the close trigger
            $holder.bind('jqFensterClose', function () {
                // if the current plugin uses jqEbony, we should notice it
                if ($.type(that.getOverlay()) === 'object') {
                    that.getOverlay().close();
                    that.setOverlay(null);
                    return that;
                }
                return that.close();
            });

            // resize trigger
            $holder.bind('jqFensterReposition', function () {
                return that.show($holder.children());
            });

            // close buttons
            $holder.find('.jqFensterClose').bind('click', function () {
                $holder.trigger('jqFensterClose');
                return false;
            });

            // linking holder with the ancestor
            $holder.addClass('jqFensterHolder')
                .data('jqFensterAncestor', $element);

            // storing holder
            $element.data('jqFensterHolder', $holder);

            // overlay with the popup or standalone popup
            if (!this.options.noOverlay && $.type($.fn.jqEbony) !== 'undefined') {
                this.setOverlay(
                    $($holder).jqEbony({
                        'animationSpeed': this.options.animationSpeed,
                        'callbackClose': function (instance) {
                            return that.close.apply(
                                $.data(instance.getElement().get(0), 'jqFenster')
                            );
                        },
                        'callbackOpen': function () {
                            $holder.trigger('jqFensterCallbackOpen');
                        }
                    }).open()
                );
            } else {
                $holder.fadeIn(this.options.animationSpeed, function () {
                    $holder.trigger('jqFensterCallbackOpen');
                });
            }

            return false;
        },

        // closes popup
        close: function () {
            var $element = this.getElement(),
                $holder = this.getHolder();

            // removing current window
            $holder.children().fadeOut(
                this.options.animationSpeed,
                function () {
                    // calling default callback
                    $holder.trigger('jqFensterCallbackClose');

                    // DOM cleanup
                    if (!$element.data('selector')) {
                        $holder.remove();
                    } else {
                        $(this).unwrap();
                    }

                    // data and marker cleanup, unlocking the current object
                    $element.removeData('jqFensterLocked')
                        .removeData('jqFensterHolder');
                }
            );

            return this;
        },

        // checks if the current element is locked or not
        isLocked: function () {
            return this.getElement().data('jqFensterLocked');
        },

        // sets the lock marker
        setLock: function (marker) {
            return this.getElement().data('jqFensterLocked', !!marker);
        },

        // sets the overlay object
        setOverlay: function (overlay) {
            this.overlay = overlay;
            return this;
        }
    };

    // DOM listener
    $('.jqFenster').live('click', function (event) {
        (new JqFenster($.jqFensterOptions, $(this))).open();
        return false;
    });
}(document, window, jQuery));
