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
  "use strict";

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
    beforeLoad: function () {
      return this.append('<div class="jqFensterLoading"><p></p></div>');
    },

    // removes the loader element
    afterLoad: function () {
      return this.find('div.jqFensterLoading').remove();
    }
  };
}(jQuery));
