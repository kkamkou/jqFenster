/**
 * jqFenster - Lightweight Modal Framework
 * Version: 1.2.8 (2014-05-28)
 * https://github.com/kkamkou/jqFenster
 */
(function(e){(function(e){var t={href:null,selector:null,options:null,delayOpen:200,callbackOpen:e.noop,callbackClose:e.noop},n=function(n,r){this.holder=n.data("jqFensterHolder")||null,this.element=n,this.options=e.extend({},t),this.setOptions(r),!this.options.selector&&this.element.selector&&(this.options.selector=this.element.selector),this.element.hasClass("jqFenster")||(this.element.addClass("jqFenster"),this._init())};n.prototype={close:function(){return this.getHolder()?(this.options.callbackClose.call(null,this.getHolder()),this.getHolder().trigger("jqFensterClose"),this.setHolder(null),this):this},destroy:function(){this.element.data("jqFensterDestroyable")&&this.element.remove()},open:function(t){var n=function(){return this.options.callbackOpen.call(null,this.getHolder()),e.type(t)==="function"&&t.call(this),this};return this.getHolder()?n.call(this):(this.element.trigger("click"),setTimeout(function(){this.setHolder(this.element.data("jqFensterHolder")),n.call(this)}.bind(this),this.options.delayOpen),this)},reInit:function(){this.close();var e=this;return setTimeout(function(){if(e.element.data("modalLocked"))return e.reInit();e._init().open()},50),this},getHolder:function(){return this.holder},getAncestor:function(){return this.getHolder()?this.getHolder().data("jqFensterAncestor"):null},setHolder:function(e){return this.holder=e,this},setOptions:function(t){return e.extend(this.options,t||{}),this},_init:function(){return this.options.href!==null&&this.element.data("href",this.options.href),this.options.selector!==null&&this.element.data("selector",this.options.selector),this.options.options&&this.element.data("options",this.options.options),this}},e.fn.fenster=function(e){return new n(this,e)},e.extend({fensterFinder:function(t){var n=e(t),r;return n.data("jqFensterHolder")?n.fenster(n.data("options")):(r=n.closest(".jqFensterHolder"),r.length?e(r.data("jqFensterAncestor")).fenster():null)},fenster:function(t){var n=e("<a />",{css:{display:"none"}}).data("jqFensterDestroyable",!0);return e("body").append(n),e.type(t)==="string"&&(t={selector:t}),n.fenster(t)}})})(jQuery),function(e,t,n){n.jqFensterOptions={noOverlay:!1,animationSpeed:0,callbackOpen:null,callbackClose:null,template:null},n.jqFensterOptions.template={prepare:function(){return this.children().hide()},inject:function(e){this.empty().append(e)},cleanupRemote:function(){return this.remove()},cleanupSelector:function(){return this.children().hide().unwrap()}};var r=function(e,r){this.overlay=null,this.options=n.extend({},e),this.element=r,this.holder=null,this._init=function(){var e=this;this.holder=n("<div/>").addClass("jqFensterHolder"),n.data(this.holder.get(0),"jqFenster",this);if(r.data("options"))try{n.extend(this.options,n.type(r.data("options"))==="object"?r.data("options"):n.parseJSON(r.data("options").replace(/([a-zA-Z]+):/g,'"$01":')))}catch(i){n.error(["jqFenster: incorrect JSON provided (check the code of a link)",r,i.toString()])}n.type(this.options.callbackOpen)==="string"&&(this.options.callbackOpen=t[this.options.callbackOpen]),n.type(this.options.callbackClose)==="string"&&(this.options.callbackClose=t[this.options.callbackClose]),n.isFunction(this.options.callbackOpen)&&this.holder.bind("jqFensterCallbackOpen",function(){return e.options.callbackOpen(e.getElement())}),n.isFunction(this.options.callbackClose)&&this.holder.bind("jqFensterCallbackClose",function(){return e.options.callbackClose(e.getElement())})}};r.prototype={getHolder:function(){return this.holder},getElement:function(){return this.element},getOverlay:function(){return this.overlay},open:function(){if(this.isLocked())return!1;this._init(),this.setLock(!0),n("body").append(this.getHolder());if(this.getElement().data("selector"))return this.create(n(this.getElement().data("selector")));var e=this;return this.options.template.beforeLoad&&this.options.template.beforeLoad.call(this.getHolder()),n.get(this.getElement().data("href")||this.getElement().attr("href")).done(function(t){e.options.template.afterLoad&&e.options.template.afterLoad.call(e.getHolder()),e.create(t)}),this},show:function(){var e=this.options.template.prepare.call(this.getHolder());if(!e.height()){var t=this;return setTimeout(function(){t.show()},30),this}return this.getHolder().children().css("width",e.width()),e.show(),this},create:function(e){var t=this,r=this.getHolder(),i=this.getElement(),s=this.options.template.inject.call(r,e);return this.show(),r.bind("jqFensterClose",function(){return n.type(t.getOverlay())==="object"?(t.getOverlay().close(),t.setOverlay(null),t):t.close()}),r.find(".jqFensterClose").bind("click",function(){return r.trigger("jqFensterClose"),!1}),r.data("jqFensterAncestor",i),i.data("jqFensterHolder",r),this.options.noOverlay||!n.isFunction(n.fn.jqEbony)?(r.hide().fadeIn(this.options.animationSpeed,function(){r.trigger("jqFensterCallbackOpen")}),!1):(this.setOverlay(n(r).jqEbony({clickCloseArea:s,animationSpeed:this.options.animationSpeed,callbackClose:function(){return t.close.call(n.data(this.getElement().get(0),"jqFenster"))},callbackOpen:function(){return r.trigger("jqFensterCallbackOpen")}})),this.getOverlay().open(),!1)},close:function(){var e=this.getElement(),t=this.getHolder(),r=this,i=function(){return t.trigger("jqFensterCallbackClose"),n.proxy(e.data("selector")?r.options.template.cleanupSelector:r.options.template.cleanupRemote,n(this))(),e.removeData("jqFensterLocked").removeData("jqFensterHolder"),r};return n.isFunction(n.fn.jqEbony)&&!this.getOverlay()?(t.hide(),i()):(t.fadeOut(this.getOverlay()?0:this.options.animationSpeed,i),this)},isLocked:function(){return this.getElement().data("jqFensterLocked")},setLock:function(e){return this.getElement().data("jqFensterLocked",!!e)},setOverlay:function(e){return this.overlay=e,this}};var i=function(){return(new r(n.jqFensterOptions,n(this))).open(),!1};n.isFunction(n.fn.live)?n(".jqFenster").live("click",i):n(e).on("click",".jqFenster",i)}(document,window,jQuery),function(e){e.jqFensterOptions.template={prepare:function(){return this.find("td.jqFensterContent").children().hide()},inject:function(e){return this.append('<table class="jqFensterContainer"><tr><td class="jqFensterContent"></td></tr></table>').find("td.jqFensterContent").append(e)},cleanupRemote:function(){return this.remove()},cleanupSelector:function(){return this.parent().append(this.find("td.jqFensterContent").children().hide()),this.remove()},beforeLoad:function(){return this.append('<div class="jqFensterLoading"><p></p></div>')},afterLoad:function(){return this.find("div.jqFensterLoading").remove()}}}(jQuery),function(e,t){t.jqEbonyOptions={opacity:.7,zIndex:99999,escapeCloses:!0,clickCloses:!0,clickCloseArea:null,callbackClose:null,callbackCloseBefore:null,callbackOpen:null,animationSpeed:0,color:[0,0,0]};var n=function(e,n){this.layout=null,this.element=n,this.options=t.extend(t.jqEbonyOptions,e||{})};n.prototype={getLayout:function(){return this.layout},getIndexZ:function(){return parseInt(t("body").data("jqEbony")||this.getOptions().zIndex,10)},getOptions:function(){return this.options},getElement:function(){return this.element},setIndexZ:function(e){return t("body").data("jqEbony",e),this},setLayout:function(e){return this.layout=e,this},hasLayout:function(){return!!this.layout},open:function(){if(this.hasLayout())return this;this.setLayout(this.getDefaultLayout()),this._setListeners(),this.getElement().wrapAll(this.getLayout()),this._transform().setIndexZ(this.getIndexZ()+1);var e=this;return this.getElement().hide().parent().fadeIn(this.getOptions().animationSpeed,function(){e.getElement().css("z-index",e.getIndexZ()).fadeIn(parseInt(e.getOptions().animationSpeed/2,10),function(){t.isFunction(e.getOptions().callbackOpen)&&e.getOptions().callbackOpen.call(e)})}),this},close:function(){if(!this.hasLayout())return this;var e=this,n=this.getElement();return t.isFunction(this.getOptions().callbackCloseBefore)&&this.getOptions().callbackCloseBefore(n),n.parent().fadeOut(this.getOptions().animationSpeed,function(){n.unwrap(),e._revert(),e.setLayout(null),t.isFunction(e.getOptions().callbackClose)&&e.getOptions().callbackClose.call(e)}),this},getDefaultLayout:function(
){var e=[];return e.push(this.getOptions().color),e.push(this.getOptions().opacity),t("<div />").addClass("jqEbony").css({display:"none",position:"fixed",right:0,top:0,left:0,bottom:0,overflow:"auto","z-index":this.getIndexZ(),background:"rgba("+e.join(",")+")"})},_setListeners:function(){var n=this;this.options.escapeCloses&&(t(e).one("keyup.jqEbony",function(e){if((e.keyCode||e.which)===27)return e.stopImmediatePropagation(),n.close()}),t._data(e,"events").keyup.unshift(t._data(e,"events").keyup.pop()));if(this.options.clickCloses){var r=this.getElement().parent();this.getOptions().clickCloseArea!==null&&(r=t(this.getOptions().clickCloseArea)),this.getElement().bind("click.jqEbony",function(e){var i=t(e.target);t(">*",r).each(function(){if(e.target!==this&&!t(this).is("script")&&!t(this).is("style")&&i.closest("html",this).length)return n.close()})})}return this},_transform:function(){var e=this.getElement(),n=t("body"),r=t("html"),i={outerWidth:n.outerWidth(!0),marginRight:parseInt(t("body").css("margin-right"),10),scrollTop:r.scrollTop()};return e.data("jqEbony",this),this.getLayout().data("jqEbonyData",{element:{position:e.css("position"),display:e.css("display"),visibility:e.css("visibility")},html:{overflow:t("html").css("overflow-y")},body:{"margin-right":t("body").css("margin-right")}}),r.css("overflow","hidden"),n.css("margin-right",n.outerWidth(!0)-i.outerWidth+i.marginRight),r.scrollTop(i.scrollTop),this},_revert:function(){this.setIndexZ(this.getIndexZ()-1);if(!this.getLayout().data("jqEbonyData"))return this;var e=this.getLayout(),n=t("html").scrollTop();return t("div.jqEbony").length||(t("body").css(e.data("jqEbonyData").body),t("html").css(e.data("jqEbonyData").html).scrollTop(n)),this.getElement().css(e.data("jqEbonyData").element).removeData("jqEbonyData").removeData("jqEbony"),this}},t.fn.jqEbony=function(e){return this.data("jqEbony")||new n(e,t(this))}}(document,jQuery)})(jQuery)