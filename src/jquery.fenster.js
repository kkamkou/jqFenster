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

/*jshint jquery: true, browser: true, laxbreak: true */
(function ($) {
  "use strict";

  // default options
  var defaultOptions = {'href': null, 'selector': null, 'options': null};

  // the main object
  var JqFensterApi = function ($elem, options) {
    this.holder = $elem.data('jqFensterHolder') || null;
    this.element = $elem;
    this.options = $.extend({}, defaultOptions);

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

    // DOM cleanup (removes <a> at the end of body)
    destroy: function () {
      if (this.element.data('jqFensterDestroyable')) {
        this.element.remove();
      }
    },

    open: function () {
      if (!this.getHolder()) {
        this.setHolder(this.element.trigger('click').data('jqFensterHolder'));
      }
      return this;
    },

    reInit: function () {
      this.close();

      var that = this;
      setTimeout(function () {
        if (that.element.data('modalLocked')) {
          return that.reInit();
        }
        that._init().open();
      }, 50);

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
      $.extend(this.options, options || {});
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
      var $target = $(target), $elem;

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
      // notice api that we should remove this element after execution
      var $elem = $('<a />', {css: {display: 'none'}})
        .data('jqFensterDestroyable', true);

      // DOM update
      $('body').append($elem);

      // quick helper for the jQuery selector
      if ($.type(options) === 'string') {
        options = {'selector': options};
      }

      // new instance
      return $elem.fenster(options);
    }
  });
}(jQuery));
