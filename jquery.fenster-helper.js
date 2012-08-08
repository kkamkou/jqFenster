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
 * Depends:
 *  jquery.ebony.js (optional)
 *
 * Default options:
 *  animationSpeed  400    Sets animation speed for a window
 *  noOverlay       false  Disables ygOverlay usage
 *  unfixed         false  Removes static positioning for a window
 *  callbackOpen    none   Called after a window was created
 *  callbackClose   none   Called after a window was closed
 *
 * @example:
 *  jQuery.jqFensterOptions.animationSpeed = 0; // global
 *
 *  (a href="/hello/world/"|input|...) class="jqFenster"
 *      data-href="/hello/world"
 *      data-selector="#myDiv"
 *      data-options='{animationSpeed: 200, noOverlay: true, unfixed: true, callbackOpen: "myOpen", callbackClose: "myClose"}'
 *
 * In a popup you can use the close helper
 *  (a|input|...) class="jqFensterClose"
 */

(function (doc, win, $) {
    "use strict";

    // default set of options
    $.jqFensterOptions = {
        'noOverlay': false,
        'unfixed': false,
        'animationSpeed': 0, // in ms, for example: 200, 400 or 800
        'callbackOpen': null,
        'callbackClose': null
    };

    // main class
    var JqFenster = function (options, element) {
        // defaults
        this.overlay = null;
        this.options = options,
        this.element = element;
        this.holder = null;

        // constructor
        this._init = function () {
            var that = this;

            this.holder = $('<div/>').css({
                'display': 'none',
                'position': 'fixed',
                '_position': 'absolute',
                'left': 0,
                'top': 0
            });

            // do we have JSON options?
            // For example: data-options='{a:0, b:true, c:"3"}'
            if (element.data('options')) {
                try {
                    // @see http://ecma262-5.com/ELS5_HTML.htm#Section_15.5.4.11
                    $.extend(
                        this.options,
                        typeof (element.data('options')) === 'object' ? element.data('options')
                            : $.parseJSON(element.data('options').replace(/([a-zA-Z]+):/g, '"$01":'))
                    );
                } catch (e) {
                    $.error([
                        'jqFenster: incorrect JSON provided (check the code of a link)',
                        element.data('options'), e.toString()
                    ]);
                }

                // open event redeclaration
                if (this.options.callbackOpen) {
                    this.options.callbackOpen = win[this.options.callbackOpen];
                }

                // close event redeclaration
                if (this.options.callbackClose) {
                    this.options.callbackClose = win[this.options.callbackClose];
                }

                // should we use fixed position or not
                if (this.options.unfixed) {
                    this.element.css('position', 'absolute');
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
        }
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

            // locking this link
            this.getElement().data('jqFensterLocked', true);

            // DOM corrections
            $('body').append(this.getHolder());

            // working with the data
            if (this.getElement().data('selector')) {
                return this.create($(this.getElement().data('selector')));
            }

            var that = this;

            // preload content from the href
            $.get((this.getElement().data('href') || this.getElement().attr('href')))
                .done(function (data) {
                    return that.create(data);
                });

            return this;
        },

        // move window to the center of a screen
        centerize: function ($elem) {
            // cycling to get the element height
            if (!$elem.height()) {
                var that = this;
                setTimeout(function () { that.centerize($elem); }, 30);
                return this;
            }

            var elemInfo = {
                    'width':         $elem.width(),
                    'height':        $elem.height(),
                    'positionType':  $elem.parent().css('position'),
                    'paddingTop':    parseInt($elem.css('padding-top'), 10),
                    'paddingBottom': parseInt($elem.css('padding-bottom'), 10),
                    'borderTop':     parseInt($elem.css('border-top-width'), 10),
                    'borderBottom':  parseInt($elem.css('border-bottom-width'), 10)
                },
                elemMath = {
                    'mediaBorder': 0,
                    'mediaPadding': 0,
                    'halfWidth': 0,
                    'halfHeight': 0
                };

            // get the media of padding and borders
            elemMath.mediaBorder = (elemInfo.borderTop + elemInfo.borderBottom) / 2;
            elemMath.mediaPadding = (elemInfo.paddingTop + elemInfo.paddingBottom) / 2;

            // get the half minus of width and height
            elemMath.halfWidth = (elemInfo.width / 2) * (-1);
            elemMath.halfHeight = ((elemInfo.height / 2) * (-1));
            elemMath.halfHeight -= elemMath.mediaPadding - elemMath.mediaBorder;

            // aplying the css
            this.getHolder().css({
                'width': elemInfo.width,
                'height': elemInfo.height,
                'top': '50%',
                'left': '50%',
                'margin-top': elemMath.halfHeight,
                'margin-left': elemMath.halfWidth
            });

            // ie thinks different :)
            // also, if popup is greater then the content window, we should adjust it
            if ($.browser.msie && $.browser.version < 9) {
                this.getHolder().css({
                    'top': $(win).height() / 2 - elemInfo.height / 2,
                    'margin-top': 0
                });

                if (parseInt(this.getHolder().css('top'), 10) < 0) {
                    this.getHolder().css({'top': $(win).scrollTop(), 'position': 'absolute'});
                }
            } else {
                if (elemInfo.height > $(win).height()) {
                    this.getHolder().css({
                        'top': 0,
                        'margin-top': $(win).scrollTop(),
                        'position': 'absolute'
                    });
                }
            }

            // check the current position
            if (elemInfo.positionType === 'static') {
                this.getHolder().parent().css('position', 'relative');
            }

            // showing element (always)
            $elem.show();

            return this;
        },

        // content switch and show
        create: function (target) {
            var that = this;

            // DOM corrections
            this.getHolder().empty().append(target);

            // making sure that the inner content is hidden
            // avoiding browser issues
            this.getHolder().children().hide();

            // centerizing
            this.centerize(this.getHolder().children());

            // overlay with the popup or standalone popup
            if (!this.options.noOverlay && $.type($.fn.jqEbony) !== 'undefined') {
                this.setOverlay(
                    $(this.getHolder()).jqEbony({
                        'animationSpeed': this.options.animationSpeed,
                        'callbackClose': function () {
                            that.getHolder().trigger('jqFensterClose');
                        },
                        'callbackOpen': function () {
                            that.getHolder().trigger('jqFensterCallbackOpen');
                        }
                    }).open()
                );
            } else {
                this.getHolder().fadeIn(this.options.animationSpeed, function () {
                    that.getHolder().trigger('jqFensterCallbackOpen');
                });
            }

            // the close trigger
            this.getHolder().bind('jqFensterClose', function () {
                return that.close();
            });

            // close buttons
            this.getHolder().find('.jqFensterClose').bind('click', function () {
                that.getHolder().trigger('jqFensterClose');
                return false;
            });

            // resize trigger
            this.getHolder().bind('jqFensterReposition', function () {
                return that.centerize(this.getHolder().children());
            });

            // storing holder
            this.getElement().data('jqFensterHolder', this.getHolder());

            // linking holder with the ancestor
            this.getHolder().addClass('jqFensterHolder')
                .data('jqFensterAncestor', this.getElement());

            return false;
        },

        close: function () {
            var that = this;

            // removing current window
            this.getHolder().children()
                .fadeOut(this.options.animationSpeed, function () {
                    // calling default callback
                    that.getHolder().trigger('jqFensterCallbackClose');

                    // DOM cleanup
                    if (!that.getElement().data('selector')) {
                        $(this).parent().remove();
                    } else {
                        $(this).unwrap();
                    }

                    // data and marker cleanup, unlocking the current object
                    that.getElement()
                        .data('jqFensterLocked', false)
                        .removeData('jqFensterHolder');
                });

            // if the current plugin uses jqEbony, we should notice it
            if ($.type(this.getOverlay()) === 'object') {
                this.getOverlay().close();
                this.setOverlay(null);
                return this;
            }

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
        return (new JqFenster($.jqFensterOptions, $(this))).open();
    });
}(document, window, jQuery));
