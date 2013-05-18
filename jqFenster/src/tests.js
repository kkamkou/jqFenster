QUnit.config.reorder = false;

test('DOM Init', 2, function() {
  equal($('.jqFensterHolder').length, 0, 'DOM does not have jqFensterHolder');
  equal($('.jqEbony').length, 0, 'DOM does not have jqEbony');
});

test('jQuery Check', 2, function() {
  deepEqual($.type($.fenster), 'function', 'jQuery has the "$.fenster()" function');
  deepEqual($.type($.fensterFinder), 'function', 'jQuery has the "$.fensterFinder()" function');
});

test('API Check (jquery.fenster.js)', 8, function() {
  var $fenster = $('#targetSecond').fenster(),
    fncList = [
      'open', 'close', 'destroy', 'reInit', 'getAncestor', 'getHolder', 'setHolder', 'setOptions'
    ];

  fncList.forEach(function (name) {
    deepEqual($.type($fenster[name]), 'function', '"$fenster.' + name + '()" exists');
  });
});

module('In-DOM instance');
asyncTest('open()', 3, function() {
  var $fenster = $('#targetSecond').fenster().open();

  setTimeout(function () {
    var $target = $('.jqFensterHolder');

    equal($target.length, 1, 'DOM has the "jqFensterHolder" element');
    equal($target.data('jqFensterAncestor').length, 1, 'Holder has the "jqFensterAncestor" data');
    deepEqual($fenster.getAncestor().get(0), $('#targetSecond').get(0), 'Elements are identical');

    start();
  }, 200);
});

asyncTest('close()', 3, function() {
  $.fensterFinder($('.jqFensterHolder')).close();

  setTimeout(function () {
    var $elem = $('#targetSecond');

    equal($('.jqFensterHolder').length, 0, 'DOM does not have the "jqFensterHolder" element');
    deepEqual($.type($elem.data('jqFensterLocked')), 'undefined', 'No jqFensterLocked in data');
    deepEqual($.type($elem.data('jqFensterHolder')), 'undefined', 'No jqFensterHolder in data');
    start();
  }, 200);
});

module('Dynamic instance');
asyncTest('open()', 2, function() {
  var countBefore = $('body a.jqFenster:hidden').length;

  $.fenster({'href': 'remote.html'}).open();

  setTimeout(function () {
    equal(countBefore + 1, $('body a.jqFenster:hidden').length, 'Empty link added to the body');
    equal($('.jqFensterHolder').length, 1, 'DOM has the "jqFensterHolder" element');
    start();
  }, 200);
});

asyncTest('close()', 2, function() {
  var countBefore = $('body a.jqFenster:hidden').length;

  $.fensterFinder($('.jqFensterHolder')).close().destroy();

  setTimeout(function () {
    equal($('.jqFensterHolder').length, 0, 'DOM does not have the "jqFensterHolder" element');
    equal(countBefore - 1, $('body a.jqFenster:hidden').length, 'Empty link removed from the body');
    start();
  }, 200);
});

