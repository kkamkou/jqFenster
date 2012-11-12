Lightweight Modal Framework
=============

> [nodejs component located here](https://github.com/kkamkou/jqFenster/tree/nodejs)

## HTML injection
Just add the **class="modal"** to element
```html
<!-- anchor -->
<a href="#" class="modal" data-selector="#myModal">open</a>
<a href="/my/address/" class="modal">open</a>
<a href="#" class="modal" data-href="/my/address/">open</a>

<!-- advanced anchor -->
<a href="#" class="modal"
  data-options='{animationSpeed: 200, noOverlay: true, callbackOpen: "myOpen", callbackClose: "myClose"}'>super-puper link</a>

<!-- Button -->
<button data-selector="#myModal" class="modal"></button>

<!-- and etc... -->
<textarea data-selector="#myModal" class="modal"></button>
 
<!-- the modal body -->
<div id="myModal" style="display: none">Hello :)</div>
```