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
 *      jQuery('.myElement').fenster().open();
 *      jQuery('.myElement').fenster().close();
 *      jQuery('.myElement').fenster({'href': 'newUri'}).reInit();
 *
 *  Owners (working in the opened popup)
 *      jQuery.fensterFinder(this).redraw()
 *      jQuery.fensterFinder(this).setOptions({'href': 'newUri'}).reInit();
 *
 *  Anonymous (creates popup on the fly)
 *      jQuery.fenster({'href': 'uri'}).open();
 *      jQuery.fenster('#myPopup').open();
 *      jQuery.fenster(jQuery('#myPopup')).open();
 */
(function ($) {
    "use strict";

    //
    var jqFenster = function ($elem, options) {
        this.holder = $elem.data('jqFensterHolder');
        this.element = $elem;

        // options merge
        this.setOptions(options);

        // dynamic object requires custom init
        if (!this.element.hasClass('jqFenster')) {
            this.element.addClass('jqFenster');
            this._init();
        }
    };

    // overloaded functions
    jqFenster.prototype = {
        close: function () {
            if (this.holder) {
                this.holder.trigger('jqFensterClose');
                this.holder = null;
            }
            return this;
        },

        open: function () {
            if (!this.holder) {
                this.element.trigger('click');
            }
            return this;
        },

        reInit: function () {
            this.close()._init().open();
            return this;
        },

        redraw: function () {
            if (this.holder) {
                this.holder.trigger('jqFensterReposition');
            }
            return this;
        },

        getHolder: function () {
            return this.holder;
        },

        getElement: function () {
            return this.holder ? this.holder.data('jqFensterAncestor') : null;
        },

        setOptions: function (options) {
            this.options = $.extend({
                'href': null,
                'selector': null,
                'options': null
            }, options || {});
            return this;
        },

        _init: function () {
            // href
            if (this.options.href) {
                this.element.data('href', this.options.href);
            }

            // selector
            if (this.options.selector) {
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
        return new jqFenster(this, options);
    };

    // helps to find/creatre the jqFenster object
    $.extend({
        // working inside opened window
        fensterFinder: function (target) {
            var $elem = $(target).parents('.jqFensterHolder');
            if ($elem.length) {
                return $($elem.data('jqFensterAncestor')).fenster();
            }
            return null;
        },

        // quick helper
        fenster: function (options) {
            var $elem = $('<a />');

            // quick helper for the jQuery selector
            if (typeof (options) === 'string') {
                options = {'selector': options};
            }

            // quick helper for the jQuery object
            if (typeof (options) === 'object' && options.selector) {
                options = {'selector': options.selector};
            }

            return $($elem).fenster(options);
        }
    });
}(jQuery));
