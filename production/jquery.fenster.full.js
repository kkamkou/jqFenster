/**
 * jqFenster - Lightweight Modal Framework
 * Version: 1.0.1 (2012-11-25)
 * https://github.com/kkamkou/jqFenster
 */
(function($) {


/*
 * File: jquery.fenster.js
 */

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
 *  jquery.fenster-helper.js
 *
 *  Link selectors (if we have information about link only)
 *      jQuery('.myElement').fenster().open().close();
 *      jQuery('.myElement').fenster({'href': 'newUri'}).reInit();
 *
 *  Owners (working in the opened popup)
 *      jQuery.fensterFinder(this).setOptions({'href': 'newUri'}).reInit();
 *
 *  Anonymous (creates popup on the fly)
 *      jQuery.fenster({'href': 'uri'}).open();
 *      jQuery.fenster('#myPopup').open();
 */
(function ($) {
    
    // the main object
    var JqFensterApi = function ($elem, options) {
        this.holder = $elem.data('jqFensterHolder') || null;
        this.element = $elem;

        // options merge
        this.setOptions(options);

        // default options correction
        if (!this.options.selector && this.element.selector) {
            this.options.selector = this.element.selector;
        }

        // dynamic object requires custom init
        if (!this.element.hasClass('jqFenster')) {
            this.element.addClass('jqFenster');
            this._init();
        }
    };

    // overloaded functions
    JqFensterApi.prototype = {
        close: function () {
            if (this.getHolder()) {
                this.getHolder().trigger('jqFensterClose');
                this.setHolder(null);
            }
            return this;
        },

        open: function () {
            return this.getHolder() ? this : this.setHolder(
                this.element.trigger('click').data('jqFensterHolder')
            );
        },

        reInit: function () {
            this.close();

            var that = this;
            setTimeout(function () {
                that._init().open();
            }, 100);

            return this;
        },

        getHolder: function () {
            return this.holder;
        },

        getAncestor: function () {
            return this.getHolder()
                ? this.getHolder().data('jqFensterAncestor') : null;
        },

        setHolder: function (obj) {
            this.holder = obj;
            return this;
        },

        setOptions: function (options) {
            this.options = $.extend(
                {'href': null, 'selector': null, 'options': null},
                options || {}
            );
            return this;
        },

        _init: function () {
            // href
            if (this.options.href !== null) {
                this.element.data('href', this.options.href);
            }

            // selector
            if (this.options.selector !== null) {
                this.element.data('selector', this.options.selector);
            }

            // data-options
            if (this.options.options) {
                this.element.data('options', this.options.options);
            }

            return this;
        }
    };

    // jQuery plugin
    $.fn.fenster = function (options) {
        return new JqFensterApi(this, options);
    };

    // helps to find/creatre the jqFenster object
    $.extend({
        // working inside opened window
        fensterFinder: function (target) {
            var $target = $(target),
                $elem = null;

            // target is link already
            if ($target.data('jqFensterHolder')) {
                return $target.fenster($target.data('options'));
            }

            // trying to find the link holder
            $elem = $target.closest('.jqFensterHolder');
            if ($elem.length) {
                return $($elem.data('jqFensterAncestor')).fenster();
            }

            return null;
        },

        // quick helper
        fenster: function (options) {
            var $elem = $('<a />', {css: {display: 'none'}});

            // DOM update
            $('body').append($elem);

            // quick helper for the jQuery selector
            if ($.type(options) === 'string') {
                options = {'selector': options};
            }

            return $($elem).fenster(options);
        }
    });
}(jQuery));


/*
 * File: jquery.fenster-helper.js
 */

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
    
    // default set of options
    $.jqFensterOptions = {
        'noOverlay': false,
        'animationSpeed': 0, // in ms, for example: 200, 400 or 800
        'callbackOpen': null,
        'callbackClose': null,
        'template': null
    };

    // default template engine
    $.jqFensterOptions.template = {

        // initial corrections
        prepare: function () {
            return this.children().hide();
        },

        // content modification
        inject: function (content) {
            this.empty().append(content);
        },

        // DOM cleanup (ajax used)
        cleanupRemote: function () {
            return this.remove();
        },

        // DOM cleanup (selector used)
        cleanupSelector: function () {
            return this.children().hide().unwrap();
        }
    };

    // main class
    var JqFenster = function (options, $element) {
        // defaults
        this.overlay = null;
        this.options = $.extend({}, options);
        this.element = $element;
        this.holder = null;

        // constructor
        this._init = function () {
            var that = this;

            // default holder styles
            this.holder = $('<div/>').addClass('jqFensterHolder');

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
            }

            // open event redeclaration
            if ($.type(this.options.callbackOpen) === 'string') {
              this.options.callbackOpen = win[this.options.callbackOpen];
            }

            // close event redeclaration
            if ($.type(this.options.callbackClose) === 'string') {
              this.options.callbackClose = win[this.options.callbackClose];
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

            // loader animation
            this.options.template.loaderShow.call(this.getHolder());

            // preload content from the href
            $.get((this.getElement().data('href') || this.getElement().attr('href')))
                .done(function (data) {
                    // loader remove
                    that.options.template.loaderRemove.call(that.getHolder());

                    // modal creation process
                    that.create(data);
                });

            return this;
        },

        // move window to the center of a screen
        show: function () {
            // making sure that the inner content is hidden
            // avoiding browser issues
            var $elem = this.options.template.prepare.call(this.getHolder());

            // cycling to get the element height
            if (!$elem.height()) {
                var that = this;
                setTimeout(function () { that.show(); }, 30);
                return this;
            }

            // applying css rules.
            // only the width, other attributes should be defined manually
            this.getHolder().children().css('width', $elem.width());

            // visibility change
            $elem.show();

            return this;
        },

        // content switch and show
        create: function (target) {
            // defaults
            var that = this,
                $holder = this.getHolder(),
                $element = this.getElement(),
                $injected = this.options.template.inject.call($holder, target);

            // inline area visibility
            this.show();

            // the close trigger
            $holder.bind('jqFensterClose', function () {
                // if the current plugin uses jqEbony, we should notice it
                if ($.type(that.getOverlay()) === 'object') {
                    that.getOverlay().close();
                    that.setOverlay(null);
                }
                return that.close();
            });

            // close buttons
            $holder.find('.jqFensterClose').bind('click', function () {
                $holder.trigger('jqFensterClose');
                return false;
            });

            // linking holder with the ancestor
            $holder.data('jqFensterAncestor', $element);

            // storing holder
            $element.data('jqFensterHolder', $holder);

            // overlay with the popup or standalone popup
            if (!this.options.noOverlay && $.type($.fn.jqEbony) !== 'undefined') {
                this.setOverlay(
                    $($holder).jqEbony({
                        'clickCloseArea': $injected,
                        'animationSpeed': this.options.animationSpeed,
                        'callbackClose': function () {
                            return that.close.apply(
                                $.data(this.getElement().get(0), 'jqFenster')
                            );
                        },
                        'callbackOpen': function () {
                            return $holder.trigger('jqFensterCallbackOpen');
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
            // defaults
            var $element = this.getElement(),
                $holder = this.getHolder(),
                that = this;

            // removing current window
            $holder.fadeOut(
                that.getOverlay() ? 0 : that.options.animationSpeed,
                function () {
                    // calling default callback
                    $holder.trigger('jqFensterCallbackClose');

                    // DOM cleanup
                    $.proxy(
                        $element.data('selector')
                            ? that.options.template.cleanupSelector
                            : that.options.template.cleanupRemote,
                        $(this)
                    )();

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


/*
 * File: jquery.fenster-helper-template-table.js
 */

/**
 * Licensed under the MIT License
 * Redistributions of files must retain the copyright notice below.
 *
 * @category ThirdParty
 * @author   Kanstantsin A Kamkou (2ka.by)
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     https://github.com/kkamkou/jqFenster
 */

(function ($) {
    
    // centerized template engine (table used)
    $.jqFensterOptions.template = {
        // initial corrections
        prepare: function () {
            return this.find('td.jqFensterContent').children().hide();
        },

        // content modification
        inject: function (content) {
            return this.append(
                '<table class="jqFensterContainer"><tr><td class="jqFensterContent"></td></tr></table>'
            ).find('td.jqFensterContent').append(content);
        },

        // DOM cleanup (ajax used)
        cleanupRemote: function () {
            return this.remove();
        },

        // DOM cleanup (selector used)
        cleanupSelector: function () {
            this.parent().append(
                this.find('td.jqFensterContent').children().hide()
            );
            return this.remove();
        },

        // shows the loader element
        loaderShow: function () {
            return this.append('<div class="jqFensterLoading"><p></p></div>');
        },

        // removes the loader element
        loaderRemove: function () {
            return this.find('div.jqFensterLoading').remove();
        }
    };
}(jQuery));


/*
 * File: jqEbony/jquery.ebony.js
 */

/**
 * Licensed under the MIT License
 * Redistributions of files must retain the copyright notice below.
 *
 * @category ThirdParty
 * @author   Kanstantsin A Kamkou (2ka.by)
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     https://github.com/kkamkou/jqEbony
 */

/**
 * v1.0
 *
 * Creates black area for the DOM element
 *
 * @example:
 *  jQuery.jqEbonyOptions.color = [0, 0, 0]; // global
 *  jQuery('#myDiv').jqEbony({
 *      'opacity': 0.5,
 *      'zIndex': 99999,
 *      'callbackClose': null,
 *      'callbackOpen': null,
 *      'escapeCloses': true,
 *      'clickCloses': true,
 *      'animationSpeed': 200,
 *      'color': [0, 0, 0] // white
 *  });
 */
(function (doc, $) {
    
    // default options
    $.jqEbonyOptions = {
        'opacity': 0.7,
        'zIndex': 99999,
        'escapeCloses': true,
        'clickCloses': true,
        'clickCloseArea': null,
        'callbackClose': null,
        'callbackOpen': null,
        'animationSpeed': 0, // in ms, for example: 200, 400 or 800
        'color': [0, 0, 0]
    };

    // main class
    var JqEbony = function (options, element) {
        // default members
        this.layout = null;
        this.element = element;
        this.options = $.extend($.jqEbonyOptions, options || {});
    };

    // extends
    JqEbony.prototype = {
        // returns the ebony layout
        getLayout: function () {
            return this.layout;
        },

        // returns z-index value
        getIndexZ: function () {
            return parseInt(
                $('body').data('jqEbony') || this.getOptions().zIndex,
                10
            );
        },

        // options here
        getOptions: function () {
            return this.options;
        },

        // current element
        getElement: function () {
            return this.element;
        },

        // sets z-index value
        setIndexZ: function (val) {
            $('body').data('jqEbony', val);
            return this;
        },

        // updates the layout object
        setLayout: function (layout) {
            this.layout = layout;
            return this;
        },

        // checks if layout exists
        hasLayout: function () {
            return !!this.layout;
        },

        // creates overlay and shows it
        open: function () {
            // have layout? so, no features
            if (this.hasLayout()) {
                return this;
            }

            // default layout object
            this.setLayout(this.getDefaultLayout());

            // key listeners
            this._setListeners();

            // wrapper
            this.getElement().wrapAll(this.getLayout());

            this._transform() // overlay transformations
                .setIndexZ(this.getIndexZ() + 1); // z-index corrections

            // defaults
            var that = this;

            // we should display all we have so far
            this.getElement().parent().fadeIn(
                this.getOptions().animationSpeed,
                function () {
                    that.getElement()
                        .css('z-index', that.getIndexZ())
                        .fadeIn(
                            that.getOptions().animationSpeed,
                            function () {
                                if (typeof (that.getOptions().callbackOpen) === 'function') {
                                    that.getOptions().callbackOpen.call(that);
                                }
                            }
                        );
                }
            );

            return this;
        },

        close: function () {
            // no layout - no features
            if (!this.hasLayout()) {
                return this;
            }

            var that = this;

            // overlay close
            this.getElement().parent().fadeOut(
                this.getOptions().animationSpeed,
                function () {
                    // DOM cleanup
                    that.getElement().unwrap();

                    // design revert
                    that._revert();

                    // memory cleanup
                    that.setLayout(null);

                    // before close function
                    if (typeof (that.getOptions().callbackClose) === 'function') {
                        that.getOptions().callbackClose.call(that);
                    }
                }
            );

            return this;
        },

        // default element with style (black area)
        getDefaultLayout: function () {
            var rgba = [];

            rgba.push(this.getOptions().color);
            rgba.push(this.getOptions().opacity);

            return $('<div />').addClass('jqEbony')
                .css({
                    'display': 'none',
                    'position': 'fixed',
                    'right': 0,
                    'top': 0,
                    'left': 0,
                    'bottom': 0,
                    'overflow': 'auto',
                    'z-index': this.getIndexZ(),
                    'background': 'rgba(' + rgba.join(',') + ')'
                });
        },

        // adds events (escape and the mouse click)
        _setListeners: function () {
            var that = this;

            // escape key
            if (this.options.escapeCloses) {
                $(doc).one('keyup.jqEbony', function (event) {
                    if ((event.keyCode || event.which) === 27) {
                        event.stopImmediatePropagation();
                        return that.close();
                    }
                });

                // let's make the current event first
                $._data(doc, 'events').keyup.unshift(
                    $._data(doc, 'events').keyup.pop()
                );
            }

            // layout click
            if (this.options.clickCloses) {
                // default click target
                var $clickArea = this.getElement().parent();

                // click target changeg by options
                if (this.getOptions().clickCloseArea !== null) {
                    $clickArea = $(this.getOptions().clickCloseArea);
                }

                // click listener
                this.getElement().bind('click.jqEbony', function (e) {
                    $('>*', $clickArea).each(function () {
                        if (e.target !== this && $(e.target).closest('html', this).length) {
                            return that.close();
                        }
                    });
                });
            }

            return this;
        },

        // element transformation
        _transform: function () {
            var $elem = this.getElement(),
                $body = $('body'),
                $html = $('html'),
                old = {
                    'outerWidth': $body.outerWidth(true),
                    'marginRight': parseInt($('body').css('margin-right'), 10),
                    'scrollTop': $html.scrollTop()
                };

            // storing object
            $elem.data('jqEbony', this);

            // storing old styles
            this.getLayout().data('jqEbonyData', {
                'element': {
                    'position': $elem.css('position'),
                    'display': $elem.css('display'),
                    'visibility': $elem.css('visibility')
                },
                'html': {'overflow': $('html').css('overflow-y')},
                'body': {'margin-right': $('body').css('margin-right')}
            });

            // overflow corrections of the body
            $html.css('overflow', 'hidden');

            // scroll corrections
            $body.css(
                'margin-right',
                $body.outerWidth(true) - old.outerWidth + old.marginRight
            );

            // firefox fix
            $html.scrollTop(old.scrollTop);

            return this;
        },

        // custom data cleanup
        _revert: function () {
            // z-index corrections
            this.setIndexZ(this.getIndexZ() - 1);

            // we can get here another element
            if (!this.getLayout().data('jqEbonyData')) {
                return this;
            }

            // the layout object
            var $layout = this.getLayout(),
                oldScroll = $('html').scrollTop();

            // body revert
            if (!$('div.jqEbony').length) {
                $('body').css($layout.data('jqEbonyData').body);

                // html revert
                $('html').css($layout.data('jqEbonyData').html)
                    .scrollTop(oldScroll); // firefox fix
            }

            // element styles update
            this.getElement()
                .css($layout.data('jqEbonyData').element)
                .removeData('jqEbonyData')
                .removeData('jqEbony');

            return this;
        }
    };

    // jQuery plugin
    $.fn.jqEbony = function (options) {
        return (this.data('jqEbony') || new JqEbony(options, $(this)));
    };
}(document, jQuery));

})(jQuery);