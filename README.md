Lightweight Modal Framework
=============

Powerful pop-up engine, that supports modal nesting and API. If you need a simple "show me the image", use Colorbox. If you need an image gallery, use the Pikachoose.

> [Examples and demo](http://kkamkou.github.com/jqFenster/)

## HTML injection
Just add the **class="jqFenster"** to an element
```html
<!-- anchor -->
<a href="#" class="jqFenster" data-selector="#myModal">open</a>
<a href="/my/address/" class="jqFenster">open</a>
<a href="#" class="jqFenster" data-href="/my/address/">open</a>

<!-- advanced anchor -->
<a href="#" class="jqFenster"
  data-options='{animationSpeed: 200, noOverlay: true, callbackOpen: "myOpen", callbackClose: "myClose"}'>super-puper link</a>

<!-- Button -->
<button data-selector="#myModal" class="jqFenster"></button>

<!-- and etc... -->
<textarea data-selector="#myModal" class="jqFenster"></button>

<!-- the modal body -->
<div id="myModal" style="display: none">Hello :)</div>
```
### Inline configuration
```
$.jqFensterOptions.animationSpeed = 0; // global

(a href="/hello/world/"|input|...) class="jqFenster"
  data-href="/hello/world"
  data-selector="#myDiv"
  data-options='{animationSpeed: 200, noOverlay: true, callbackOpen: "myOpen", callbackClose: "myClose"}'
```

### API
```
Links selectors (if we have information about the link only)
  $('#myElement').fenster().open().close();
  $('#myElement').fenster({href: 'newUri'}).reInit();

Owners (working in the opened popup)
  $.fensterFinder(this).setOptions({href: 'newUri'}).reInit();

Anonymous (creates popup on the fly):
  var cbOpen = function (elem) {};
  var cbClose = function (elem) {};
  var modal = $.fenster({href: '/my/page/', callbackClose: cbClose, callbackClose: cbClose}).open(); // or $.fenster('#myPopup').open();
  modal.close(); // or modal.close().destroy(); to remove a placeholder from the DOM

Global events:
  jqFensterClose, jqFensterCallbackClose, jqFensterCallbackOpen
```

### Build
```
> npm install jake uglify-js@1 csso
> node_modules/.bin/jake build
```

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/kkamkou/jqfenster/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
