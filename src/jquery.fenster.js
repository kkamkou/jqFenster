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
 *      jQuery('.myElement').fenster({href: 'newUri'}).reInit();
 *
 *  Owners (working in the opened popup)
 *      jQuery.fensterFinder(this).setOptions({href: 'newUri'}).reInit();
 *
 *  Anonymous (creates popup on the fly)
 *      jQuery.fenster({href: 'uri'}).open();
 *      jQuery.fenster('#myPopup').open();
 */

/*jshint jquery: true, browser: true, laxbreak: true */
(function ($) {
  "use strict";

  // default options
  var defaultOptions = {
    href: null,
    selector: null,
    options: null,
    delayOpen: 200,
    callbackOpen: $.noop,
    callbackClose: $.noop
  };

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
    if (this.isDestroyable()) {
      this._init();
    }
  };

  // overloaded functions
  JqFensterApi.prototype = {
    close: function () {
      if (!this.getHolder()) {
        return this;
      }
      this.options.callbackClose.call(null, this.getHolder());
      this.getHolder().trigger('jqFensterClose');
      this.setHolder(null);
      return this;
    },

    isDestroyable: function () {
      return !!(this.element && this.element.data('jqFensterDestroyable'));
    },

    // DOM cleanup (removes <a> from the end of the body)
    destroy: function () {
      if (!this.isDestroyable()) {
        return false;
      }
      this.close();
      this.element.remove();
      this.element = null;
      return true;
    },

    open: function (cb) {
      if (!this.element) {
        return this;
      }

      var cbToExecute = function () {
        this.options.callbackOpen.call(null, this.getHolder());
        if ($.isFunction(cb)) {
          cb.call(this);
        }
        return this;
      };

      if (this.getHolder()) {
        return cbToExecute.call(this);
      }

      // and now we have to click and wait for the holder
      this.element.trigger('click');

      setTimeout(function () {
        this.setHolder(
          this.element.data('jqFensterHolder')
            .one('jqFensterClose', this.close.bind(this))
        );
        cbToExecute.call(this);
      }.bind(this), this.options.delayOpen);

      return this;
    },

    reInit: function () {
      var that = this;

      this.close();
      setTimeout(function () {
        if (that.element.data('jqFensterLocked')) { // for in-dom elements
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
      // it is not possible to use href and selector in the same time
      if (this.options.href && this.options.selector) {
        this.options.selector = null;
      }
      this.element.data('href', this.options.href || null);
      this.element.data('selector', this.options.selector || null);
      this.element.data('options', this.options.options || null);
      return this;
    }
  };

  // jQuery plugin
  $.fn.fenster = function (options) {
    if (!this.hasClass('jqFenster')) {
      return $.fenster(this.selector);
    }
    return new JqFensterApi(this, options);
  };

  // helps to find/create the jqFenster object
  $.extend({
    // $.fensterFinder(selector|this)
    fensterFinder: function (target) {
      var $elem, $target;

      // target is a selector or an api instance
      $target = (target instanceof JqFensterApi) ? target.element : $(target);

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

    // $.fenster(selector)
    fenster: function (options) {
      var $elem = $('<a />', {css: {display: 'none'}})
        .addClass('jqFenster')
        .data('jqFensterDestroyable', true);

      $('body').append($elem);

      if ($.type(options) === 'string') {
        options = {'selector': options};
      }

      return $elem.fenster(options);
    }
  });
}(jQuery));
