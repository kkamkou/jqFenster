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

    $('.jqFenster').live('click', function (event) {
        // defaults
        var overlay = null,
            $self = $(this),
            options = {
                'noOverlay': false,
                'unfixed': false,
                'animationSpeed': 0, // in ms, for example: 200, 400 or 800
                'callbackOpen': null,
                'callbackClose': null
            },
            $holder = $('<div/>').css({
                'display': 'none',
                'position': 'fixed',
                '_position': 'absolute',
                'left': 0,
                'top': 0
            });

        // locking check
        if ($self.data('jqFensterLocked')) {
            return false;
        }

        // locking this link
        $self.data('jqFensterLocked', true);

        // have we options?
        if ($self.data('options')) {
            try {
                // @see http://ecma262-5.com/ELS5_HTML.htm#Section_15.5.4.11
                $.extend(
                    options,
                    typeof ($self.data('options')) === 'object' ? $self.data('options')
                        : $.parseJSON($self.data('options').replace(/([a-zA-Z]+):/g, '"$01":'))
                );
            } catch (e) {
                $.error([
                    'jqFenster: incorrect JSON provided (check the code of a link)',
                    $self.data('options'), e.toString()
                ]);
            }

            // creating callback for the open event
            if (options.callbackOpen) {
                options.callbackOpen = win[options.callbackOpen];
                if (typeof (options.callbackOpen) === 'function') {
                    $holder.bind('jqFensterCallbackOpen', function () {
                        return options.callbackOpen($self);
                    });
                }
            }

            // creating callback for the close event
            if (options.callbackClose) {
                options.callbackClose = win[options.callbackClose];
                if (typeof (options.callbackClose) === 'function') {
                    $holder.bind('jqFensterCallbackClose', function () {
                        return options.callbackClose($self);
                    });
                }
            }

            // should we use fixed position or not
            if (options.unfixed) {
                $holder.css('position', 'absolute');
            }
        }

        // move window to the center of a screen
        function centerize($elem) {
            // cycling to get the element height
            if (!$elem.height()) {
                return setTimeout(function () {
                    centerize($elem);
                }, 20);
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
            $holder.css({
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
                $holder.css({
                    'top': $(win).height() / 2 - elemInfo.height / 2,
                    'margin-top': 0
                });

                if (parseInt($holder.css('top'), 10) < 0) {
                    $holder.css({'top': $(win).scrollTop(), 'position': 'absolute'});
                }
            } else {
                if (elemInfo.height > $(win).height()) {
                    $holder.css({
                        'top': 0,
                        'margin-top': $(win).scrollTop(),
                        'position': 'absolute'
                    });
                }
            }

            // check the current position
            if (elemInfo.positionType === 'static') {
                $holder.parent().css('position', 'relative');
            }

            // showing element (always)
            $elem.show();

            return false;
        }

        // content switch and show
        function jqFensterOpen(target) {
            // DOM corrections
            $holder.empty().append(target);

            // making sure that the inner content is hidden
            // avoiding browser issues
            $holder.children().hide();

            // centerizing
            centerize($holder.children());

            // overlay with the popup or standalone popup
            if (!options.noOverlay && typeof ($.fn.jqEbony) !== 'undefined') {
                overlay = $($holder).jqEbony({
                    'animationSpeed': options.animationSpeed,
                    'callbackClose': jqFensterClose,
                    'callbackOpen': function () {
                        $holder.trigger('jqFensterCallbackOpen');
                    }
                }).open();
            } else {
                $holder.fadeIn(options.animationSpeed, function () {
                    $holder.trigger('jqFensterCallbackOpen');
                });
            }

            // close buttons
            $holder.find('.jqFensterClose').bind('click', function () {
                return jqFensterClose();
            });

            // close trigger
            $holder.bind('jqFensterClose', function () {
                return jqFensterClose();
            });

            // resize trigger
            $holder.bind('jqFensterReposition', function () {
                return centerize($holder.children());
            });

            // storing holder
            $self.data('jqFensterHolder', $holder);

            // linking holder with the ancestor
            $holder.addClass('jqFensterHolder')
                .data('jqFensterAncestor', $self);

            return false;
        }

        // close function for the popup
        function jqFensterClose() {
            // removing current window
            $holder.children()
                .fadeOut(options.animationSpeed, function () {
                    // working with the overlay
                    if (overlay) {
                        overlay.close();
                        overlay = null;
                        return false;
                    }

                    // calling default callback
                    $holder.trigger('jqFensterCallbackClose');

                    // DOM cleanup
                    if (!$self.data('selector')) {
                        $(this).parent().remove();
                    } else {
                        $(this).unwrap();
                    }
                });

            // data set and marker cleanup, unlocking object
            $self.data('jqFensterLocked', false)
                .removeData('jqFensterHolder');

            return false;
        }

        // DOM corrections
        $('body').append($holder);

        // working with the data
        if ($self.data('selector')) {
            return jqFensterOpen($($self.data('selector')));
        }

        // preload content from the href
        $.get(($self.data('href') || $self.attr('href'))).done(function (data) {
            return jqFensterOpen(data);
        });

        // we are done
        return false;
    });
}(document, window, jQuery));
