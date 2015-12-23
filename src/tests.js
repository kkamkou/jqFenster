QUnit.config.reorder = false;
QUnit.config.altertitle = false;

var animationDelay = 300;

function hiddenLinksCount() {
  return $('body a.jqFenster:hidden:not([href])').length;
}

test('DOM Init', 3, function() {
  equal($('.jqFensterHolder').length, 0, 'DOM does not have jqFensterHolder');
  equal($('.jqEbony').length, 0, 'DOM does not have jqEbony');
  equal(hiddenLinksCount(), 0, 'DOM does not have hidden links');
});

test('jQuery functions', 2, function() {
  deepEqual($.type($.fenster), 'function', 'jQuery has the "$.fenster()" function');
  deepEqual($.type($.fensterFinder), 'function', 'jQuery has the "$.fensterFinder()" function');
});

test('API functionality', 9, function() {
  var $fenster = $('#targetSecond').fenster(),
    fncList = [
      'open', 'close', 'destroy', 'reInit', 'getAncestor', 'getHolder', 'setHolder', 'setOptions',
      'isDestroyable'
    ];

  fncList.forEach(function (name) {
    deepEqual($.type($fenster[name]), 'function', '"$fenster.' + name + '()" exists');
  });

  $fenster.destroy();
});

asyncTest('In-DOM instance', 8, function() {
  $('#simplelink').click();

  setTimeout(function () {
    var $target = $('.jqFensterHolder'),
      $api = $.fensterFinder('#simplelink');

    equal($target.length, 1, 'DOM has the "jqFensterHolder" element');
    equal($target.data('jqFensterAncestor').length, 1, 'Holder has the "jqFensterAncestor" data');
    equal($api.isDestroyable(), false, '"$api.isDestroyable()" is false for non-dynamic modals');
    equal($api.destroy(), false, '"$api.destroy()" is false');

    $api.close();

    setTimeout(function () {
      var $elem = $('#targetSecond');

      equal($('.jqFensterHolder').length, 0, 'DOM does not have the "jqFensterHolder" element');
      deepEqual($.type($elem.data('jqFensterLocked')), 'undefined', 'No jqFensterLocked in data');
      deepEqual($.type($elem.data('jqFensterHolder')), 'undefined', 'No jqFensterHolder in data');
      equal(hiddenLinksCount(), 0, 'No hidden links have been created');

      start();
    }, animationDelay);
  }, animationDelay);
});

asyncTest('Dynamic instance', 10, function() {
  var $fenster = $.fenster({href: 'remote.html'});

  deepEqual($fenster, $fenster.open(), '"$fenster.open()" returns an API instance');

  setTimeout(function () {
    equal(hiddenLinksCount(), 1, 'Empty link added to the body');
    equal($fenster.element.data('jqFensterHolder').hasClass('jqFenster'), false, 'Holder has no jqFenster class');
    deepEqual($fenster, $fenster.close(), '"$fenster.close()" returns an API instance');
    equal($fenster.isDestroyable(), true, '"$fenster.isDestroyable()" is true for dynamic modals');
    deepEqual($fenster.element.get(0), $('body a.jqFenster:last:hidden').get(0), 'Elements are identical');
    equal($fenster.destroy(), true, '"$fenster.destroy()" is true for dynamic modals');

    setTimeout(function () {
      equal($('.jqFensterHolder').length, 0, 'DOM does not have the "jqFensterHolder" element');
      equal(hiddenLinksCount(), 0, 'Empty link is removed from the body');
      equal($fenster.destroy(), false, '"$fenster.destroy()" is false for the destroyed object');
      start();
    }, animationDelay);
  }, animationDelay);
});
