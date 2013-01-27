Lightweight Modal Framework
=============

> [nodejs component located here](https://github.com/kkamkou/jqFenster/tree/nodejs)

> [more examples and demo](http://kkamkou.github.com/jqFenster/)

## HTML injection
Just add the **class="jqFenster"** to element
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
