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
 *  animationSpeed      0      Sets animation speed for a window in ms
 *  noOverlay           false  Disables ygOverlay usage
 *  callbackOpen        none   Called after a window was opened
 *  callbackClose       none   Called after a window was closed
 *  width               true   Disable it if you're resizing the window by yourself
 *                             or specify the exact value (px, em, etc.)
 *
 * @example:
 *  jQuery.jqFensterOptions.animationSpeed = 0; // global
 *
 *  (a href="/hello/world/"|input|...) class="jqFenster"
 *      data-href="/hello/world"
 *      data-selector="#myDiv"
 *      data-options='{animationSpeed: 200, noOverlay: true, callbackOpen: "myOpen", callbackClose: "myClose", width: "300px"}'
 *
 * In a popup you can use the close helper
 *  (a|input|...) class="jqFensterClose"
 */


/*jslint browser: true, nomen: true, vars: true, indent: 2 */
/*jshint jquery: true, browser: true, laxbreak: true */

(function (doc, win, $) {
  "use strict";

  // default set of options
  $.jqFensterOptions = {
    noOverlay: false,
    animationSpeed: 0, // in ms, for example: 200, 400 or 800
    callbackOpen: null,
    callbackClose: null,
    template: null,
    width: true
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

  var JqFenster = function (options, $element) {
    this.options = $.extend({}, options);
    this.element = $element;
    this.overlay = null;
    this.holder = null;

    this._init = function () {
      var that = this;

      // default holder styles
      this.holder = $('<div/>').addClass('jqFensterHolder');

      // storing own information
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

  JqFenster.prototype = {
    getHolder: function () {
      return this.holder;
    },
    getElement: function () {
      return this.element;
    },
    getOverlay: function () {
      return this.overlay;
    },
    open: function () {
      if (this.isLocked()) {
        return false;
      }

      this._init();
      this.setLock(true);

      // DOM corrections
      $('body').append(this.getHolder());

      // working with the data
      if (this.getElement().data('selector')) {
        return this.create($(this.getElement().data('selector')));
      }

      // context storing
      var that = this;

      // loader animation
      if (this.options.template.beforeLoad) {
        this.options.template.beforeLoad.call(this.getHolder());
      }

      // preloads content from the href
      $.get((this.getElement().data('href') || this.getElement().attr('href')))
        .done(function (data) {
          // loader remove
          if (that.options.template.afterLoad) {
            that.options.template.afterLoad.call(that.getHolder());
          }
          that.create(data);
        });

      return this;
    },
    show: function () {
      // making sure that the inner content is hidden; avoiding browser issues
      var $elem = this.options.template.prepare.call(this.getHolder());

      // cycling to get the element height
      if (!$elem.height()) {
        var that = this;
        setTimeout(function () {
          that.show();
        }, 30);
        return this;
      }

      // changing the width for centering the element
      if (this.options.width !== false) {
        this.getHolder().children().css(
          'width',
          this.options.width === true ? $elem.width() : this.options.width
        );
      }

      $elem.show();

      return this;
    },
    create: function (target) {
      var that = this,
        $holder = this.getHolder(),
        $element = this.getElement(),
        $injected = this.options.template.inject.call($holder, target);

      this.show();

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
      if (this.options.noOverlay || !$.isFunction($.fn.jqEbony)) {
        $holder.hide().fadeIn(this.options.animationSpeed, function () {
          $holder.trigger('jqFensterCallbackOpen');
        });
        return false;
      }

      // overlay enabled
      this.setOverlay(
        $($holder).jqEbony({
          clickCloseArea: $injected,
          animationSpeed: this.options.animationSpeed,
          callbackClose: function () {
            return that.close.call(
              $.data(this.getElement().get(0), 'jqFenster')
            );
          },
          callbackOpen: function () {
            return $holder.trigger('jqFensterCallbackOpen');
          }
        })
      );

      this.getOverlay().open();

      return false;
    },
    close: function () {
      var $element = this.getElement(),
        $holder = this.getHolder(),
        that = this,
        cb = function () {
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

          return that;
        };

      // jqEbony is used, just hidding the window
      if ($.isFunction($.fn.jqEbony) && !this.getOverlay()) {
        $holder.hide();
        return cb();
      }

      // using an animation to close the window
      $holder.fadeOut(this.getOverlay() ? 0 : this.options.animationSpeed, cb);

      return this;
    },
    isLocked: function () {
      return this.getElement().data('jqFensterLocked');
    },
    setLock: function (marker) {
      return this.getElement().data('jqFensterLocked', !!marker);
    },
    setOverlay: function (overlay) {
      this.overlay = overlay;
      return this;
    }
  };

  // default DOM listener
  var jqFensterCallback = function () {
    (new JqFenster($.jqFensterOptions, $(this))).open();
    return false;
  };

  // jQuery compatibility
  if ($.isFunction($.fn.live)) {
    $('.jqFenster').live('click', jqFensterCallback);
  } else {
    $(doc).on('click', '.jqFenster', jqFensterCallback);
  }
}(document, window, jQuery));
