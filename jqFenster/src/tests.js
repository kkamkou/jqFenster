test('DOM Init', function() {
  expect(2);
  equal($('.jqFensterHolder').length, 0, 'DOM does not have jqFensterHolder');
  equal($('.jqEbony').length, 0, 'DOM does not have jqEbony');
});

test('jQuery Check', function() {
  expect(2);
  deepEqual($.type($.fenster), 'function', 'jQuery has the "$.fenster()" function');
  deepEqual($.type($.fensterFinder), 'function', 'jQuery has the "$.fensterFinder()" function');
});

test('API Check (jquery.fenster.js)', function() {
  var $fenster = $('#targetSecond').fenster();

  expect(7);
  deepEqual($.type($fenster.open), 'function', '"$fenster.open()" exists');
  deepEqual($.type($fenster.close), 'function', '"$fenster.close()" exists');
  deepEqual($.type($fenster.reInit), 'function', '"$fenster.reInit()" exists');
  deepEqual($.type($fenster.getAncestor), 'function', '"$fenster.getAncestor()" exists');
  deepEqual($.type($fenster.getHolder), 'function', '"$fenster.getHolder()" exists');
  deepEqual($.type($fenster.setHolder), 'function', '"$fenster.setHolder()" exists');
  deepEqual($.type($fenster.setOptions), 'function', '"$fenster.setOptions()" exists');
});

var $fenster = $('#targetSecond').fenster();

asyncTest('open()', function() {
  $fenster.open().open();
  setTimeout(function () {
    var $target = $('.jqFensterHolder');

    expect(3);
    equal($target.length, 1, 'DOM has the "jqFensterHolder" element');
    equal($target.data('jqFensterAncestor').length, 1, 'Holder has the "jqFensterAncestor" data');
    deepEqual($fenster.getAncestor().get(0), $('#targetSecond').get(0), 'Elements are identical');

    start();
  }, 200);
});

asyncTest('close()', function() {
  var $element = $fenster.getAncestor();

  $fenster.close().close();
  setTimeout(function () {
    equal($('.jqFensterHolder').length, 0, '"close()": DOM does not have the "jqFensterHolder" element');
    start();
  }, 200);
});
