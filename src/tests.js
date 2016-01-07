QUnit.config.autostart = false;
QUnit.config.altertitle = false;
QUnit.config.reorder = false;
QUnit.config.scrolltop = false;

var animationDelay = 300;
function countHidenLinks() {
  return $('body a.jqFenster:hidden:not([href])').length;
}
function countHolders() {
  return $('.jqFensterHolder').length;
}
function countHoldersVisible() {
  return $('.jqFensterHolder:visible').length;
}

QUnit.module("Environment check");
QUnit.test('DOM Init', 3, function (assert) {
  assert.equal($('.jqEbony').length, 0, 'DOM does not have jqEbony');
  assert.equal(countHolders(), 0, 'DOM does not have jqFensterHolder');
  assert.equal(countHidenLinks(), 0, 'DOM does not have hidden links');
});

QUnit.test('jQuery functions', 2, function (assert) {
  assert.equal($.type($.fenster), 'function', 'jQuery has the "$.fenster()" function');
  assert.equal($.type($.fensterFinder), 'function', 'jQuery has the "$.fensterFinder()" function');
});

QUnit.test('API functionality', 10, function (assert) {
  var $fenster = $('#targetSecond').fenster(),
    fncList = [
      'open', 'close', 'destroy', 'reInit', 'getAncestor', 'getHolder', 'setHolder', 'setOptions',
      'isDestroyable'
    ];

  fncList.forEach(function (name) {
    assert.ok($.isFunction($fenster[name]), '"$fenster.' + name + '()" exists');
  });

  $fenster.destroy();

  assert.throws($('unknown').fenster, '"fenster()" throws in case of invalid selector');
});

QUnit.module("DOM", function (hooks) {
  hooks.afterEach(function (assert) {
    var done = assert.async();
    setTimeout(function () {
      assert.equal(countHidenLinks(), 0, 'No hidden links found');
      assert.equal(countHolders(), 0, 'DOM does not have a "jqFensterHolder" element');
      done();
    }, animationDelay);
  });

  QUnit.module('Manipulations', function () {
    QUnit.test('$.fensterFinder() functionality', 7, function (assert) {
      var done = assert.async(),
        modal = $.fenster('#targetHidden').open();
      setTimeout(function () {
        var asserts = [
          "'#targetHidden'",
          "$('#targetHidden')",
          "$('div.jqFensterHolder')",
          "$('div.jqFensterModalContent')"
        ];
        $(asserts).each(function (idx, e) {
          assert.deepEqual($.fensterFinder(eval(e)), modal, '$.fensterFinder(' + e + ')');
        });
        assert.notEqual($.fensterFinder('#target'), modal, '"#target" is not equal');
        modal.destroy();
        done();
      }, animationDelay);
    });

    QUnit.test('In DOM instance', 9, function (assert) {
      var done = assert.async();

      $('#simplelink').click();

      setTimeout(function () {
        var $target = $('.jqFensterHolder'),
            $api = $.fensterFinder('#simplelink');

        assert.equal($target.length, 1, 'DOM has the "jqFensterHolder" element');
        assert.equal($target.data('jqFensterAncestor').length, 1, 'Holder has the "jqFensterAncestor" data');
        assert.equal($api.isDestroyable(), false, '"$api.isDestroyable()" is false for non-dynamic modals');
        assert.equal($api.destroy(), false, '"$api.destroy()" is false');

        $api.close();

        setTimeout(function () {
          var $elem = $('#targetSecond');

          assert.equal(countHolders(), 0, 'DOM does not have the "jqFensterHolder" element');
          assert.deepEqual($.type($elem.data('jqFensterLocked')), 'undefined', 'No jqFensterLocked in data');
          assert.deepEqual($.type($elem.data('jqFensterHolder')), 'undefined', 'No jqFensterHolder in data');

          done();
        }, animationDelay);
      }, animationDelay);
    });

    QUnit.test('Dynamic instance', 11, function (assert) {
      var done = assert.async(),
        $fenster = $.fenster({href: 'remote.html'});

      assert.deepEqual($fenster, $fenster.open(), '"$fenster.open()" returns an API instance');

      setTimeout(function () {
        assert.equal(countHidenLinks(), 1, 'Empty link added to the body');
        assert.equal($fenster.element.data('jqFensterHolder').hasClass('jqFenster'), false, 'Holder has no jqFenster class');
        assert.deepEqual($fenster, $fenster.close(), '"$fenster.close()" returns an API instance');
        assert.equal($fenster.isDestroyable(), true, '"$fenster.isDestroyable()" is true for dynamic modals');
        assert.deepEqual($fenster.element.get(0), $('body a.jqFenster:last:hidden').get(0), 'Elements are identical');
        assert.equal($fenster.destroy(), true, '"$fenster.destroy()" is true for dynamic modals');

        setTimeout(function () {
          assert.equal($('.jqFensterHolder').length, 0, 'DOM does not have the "jqFensterHolder" element');
          assert.equal($fenster.destroy(), false, '"$fenster.destroy()" is false for the destroyed object');
          done();
        }, animationDelay);
      }, animationDelay);
    });
  });

  QUnit.module("Ticket related", function () {
    QUnit.test('Issue #12', 4, function (assert) {
      var done = assert.async(),
        modal = $.fenster('#targetSecond');

      setTimeout(function () {
        $('a.jqFensterClose:visible').click();
        setTimeout(function () {
          modal.open();
          assert.equal(modal.element.data('jqFensterHolder').length, 1, 'jqFensterHolder is in the data');
          assert.equal(countHoldersVisible(), 1, 'The modal is visible');
          setTimeout(function () {
            modal.destroy();
            done();
          }, animationDelay);
        }, animationDelay);
      }, animationDelay);
    });

    QUnit.test('Issue #13', 8, function (assert) {
      var done = assert.async(),
          modal = $.fenster({href: 'remote-reinit.html'}).open();

      setTimeout(function () {
        modal.getHolder().find('#reinitAnother').trigger('click');
        setTimeout(function () {
          var modalNew = modal
              .setOptions({href: 'remote.html', options: {animationSpeed: 300}})
              .reInit();

          assert.deepEqual(modal, modalNew, 'Objects are the same');
          assert.deepEqual(modalNew.element, modal.element, 'The same element is used');
          assert.ok(modal.isDestroyable(), 'The first object is destroyable');
          assert.ok(modalNew.isDestroyable(), 'The second object is destroyable');

          setTimeout(function () {
            assert.ok($('.jqFensterModalContent:visible').text().indexOf("I'm remote one!") !== -1, 'The modal is visible');
            modalNew.destroy();
            assert.notOk(modal.isDestroyable(), 'The first object is not destroyable anymore');
            done();
          }, animationDelay * 3);
        }, animationDelay);
      }, animationDelay);
    });

    QUnit.test('Issue #14', 3, function (assert) {
      var done = assert.async(),
        modal = $.fenster({href: 'remote.html', options: {noOverlay: true}}).open();

      assert.equal(countHoldersVisible(), 1, 'Modal is visible');

      setTimeout(function () {
        modal.getHolder().find('a.jqFensterClose').click();
        modal.destroy();
        done();
      }, animationDelay);
    });

    QUnit.test('Issue #16', 6, function (assert) {
      var modal, done = assert.async(), $link = $('#simplelink').click();
      setTimeout(function () {
        modal = $.fensterFinder($link);
        assert.ok(modal.element.data('selector'), '"selector" exists in the data');
        assert.equal(countHoldersVisible(), 1, 'The first modal is visible');
        modal.setOptions({href: 'remote.html'}).reInit();
        setTimeout(function () {
          assert.ok($('.jqFensterModalContent:visible').text().indexOf("I'm remote one!") !== -1, 'The second modal is visible');
          assert.notOk(modal.destroy(), 'destroy() returns false');
          modal.close();
          done();
        }, animationDelay);
      }, animationDelay);
    });

    QUnit.test('Issue #17', 4, function (assert) {
      var modalOne = $.fenster('#targetHidden').open(),
        done = assert.async();

      setTimeout(function () {
        $.fensterFinder(modalOne.getHolder()).close();

        setTimeout(function () {
          modalOne.destroy();
          modalTwo = $.fenster('#targetHidden').open();
          assert.notEqual(modalOne, modalTwo, 'Objects are not the same');
          setTimeout(function () {
            assert.equal($('.jqFensterModalContent:visible').text(), 'targetHidden', 'The second modal is visible');
            modalTwo.destroy();
            done();
          }, animationDelay);
        }, animationDelay);
      }, animationDelay);
    });
  });
});
