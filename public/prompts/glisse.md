# AGENT_PROMPT — Glisse

## Piece

- id: `glisse`
- title: Glisse
- subtitle: Liquid Glass controls on a wallpaper you can drag.

Kelvin Zhang (@kelvinzhg). Post: https://x.com/kelvinzhg/status/2114756680047321369. Repo: https://github.com/0kzh/glisse. Site: https://glisse.kelvinzhang.com. The library is MIT, Copyright (c) 2026 Kelvin Zhang. The copied document carries that full licence.

## Stage content

A 640px stage, background #0c0c0c, `data-theme="dark"`. A 1300×1300 wallpaper sits in a scroller. On top: a Glass lens, a TabBar (Home, Browse, Radio, Library; Radio selected), a SegmentedControl (Day, Week, Month; Week selected), three Sliders (continuous, stepped, disabled), and a Wi-Fi Switch that starts on. A dock under them sets the Glass knobs. The credit links Kelvin Zhang and @kelvinzhg, plus the repo and the site. The visible words are Kelvin Zhang, @kelvinzhg, repo, and site.

## Geometry and values

- Stage: width 100%, height 640px, background #0c0c0c.
- Wallpaper: 1300×1300. The scroller starts centred across and 30% down. A mouse drag scrolls it. The wheel scrolls it. The cursor is grab, and grabbing while the pointer is down. A 150px drag moves the wallpaper 150px.
- Glass lens: 210×120, radius 75px, background color transparent, so the rim image stays. Shadows: `0 4px 9px rgba(0,0,0,.16)`, `inset 0 2px 24px rgba(0,0,0,.2)`, `inset 0 -2px 24px rgba(255,255,255,.2)`. It does not take pointer events, so the wallpaper drags underneath it. The words Liquid and Glass on the wallpaper sit inside the lens at rest.
- Tab bar: four tabs, Radio selected. Segmented control: Day, Week, Month, Week selected.
- Continuous slider: aria-label Volume, value 40, step 1. Stepped slider: aria-label Stepped volume, value 40, step 10. Disabled slider: aria-label Disabled volume, value 40, disabled.
- Switch: aria-label Wi-Fi, checked.
- Knobs, on the Glass lens only. Each slider track is 240px wide. Bend 0 to 1 step 0.01, default 0.45 (`--lg-glass-bend`). Dispersion 0 to 2 step 0.05, default 0.4 (`--lg-glass-dispersion`). Frost 0 to 12 step 0.5, default 0, shown with px (`--lg-blur`). Rim 0 to 1 step 0.01, default 0.13 (`--lg-rim-shine`).
- Credit: 12px, line-height 16px, colour rgb(255 255 255 / 0.62), centred 10px from the bottom.

## States

| State | Trigger | From | To | Duration | Easing | Delay |
| --- | --- | --- | --- | --- | --- | --- |
| wallpaper | mouse drag or wheel on the scroller | the centred, 30% down rest | the pointer's scroll | follows the pointer | | |
| press | pointer down on a button | rest | grow 6px (mouse) or 15px (touch) | mouse stiffness 417.6 damping 29.2; touch 515 and 27.3 | spring | |
| release | pointer up on a button | the lifted control | scale 1 and translate 0 | mouse stiffness 230 damping 23.7; touch 250 and 11.8 | spring | |
| tab | click or drag a tab | the selected tab | the tab under the pointer | rest slide 1024 / 58.9 and lift 676 / 47.8; drag 2500 / 94 and 576 / 44.2 | spring | |
| segment | click or drag a segment | the selected segment | the segment under the pointer | rest slide 1024 / 58.9 and lift 676 / 47.8; drag 2500 / 94 and 576 / 44.2 | spring | |
| slider | drag a thumb | the current value | the value under the pointer | follows the pointer; lift stiffness 2000 damping 80 | spring | |
| switch | click Wi-Fi | off or on | the other | position and color stiffness 1000 damping 80; lift 2000 and 80 | spring | |
| bend | the Bend knob | 0.45 | 0 to 1 | follows the knob | | |
| dispersion | the Dispersion knob | 0.4 | 0 to 2 | follows the knob | | |
| frost | the Frost knob | 0px | 0px to 12px | follows the knob | | |
| rim | the Rim knob | 0.13 | 0 to 1 | follows the knob | | |
| disabled | the Disabled slider | value 40 | the same | | | |
| reduced | prefers-reduced-motion: reduce, or data-reduce-motion="1" | a spring | the target at once | 0ms | | |

## Timing

`createSpring` in `internal/spring.ts` takes stiffness and damping. It snaps to the target when `prefers-reduced-motion: reduce` matches, when `data-reduce-motion="1"` is on the document, or when the document is hidden. A moving spring settles when the offset is under 1e-4 and the velocity is under 1e-3. The frame step is capped at 0.1s.

`internal/press.ts`: a mouse press grows the longer side by 6px at stiffness 417.6 and damping 29.2, and releases at 230 and 23.7. A touch press grows by 15px at 515 and 27.3, and releases at 250 and 11.8.

`internal/segments.tsx`: at rest the slide spring is stiffness 1024 and damping 58.9, and the lift spring is 676 and 47.8. During a drag those are 2500 and 94, and 576 and 44.2. The lift crosses under the labels at 0.5.

A slider thumb lifts at stiffness 2000 and damping 80. A switch moves and recolors at 1000 and 80, and its thumb lifts at 2000 and 80. Holding a tab or segment lifts its selection into a lens. Reduced motion snaps those springs.

## Reduced motion

`prefers-reduced-motion: reduce` and `data-reduce-motion="1"` on the document snap the springs to the target. The lift is instant. The stage does not add a second clock.

## Gotchas

- The copied document is one HTML file. Its script is the library and this stage, bundled. The credit anchors are external URLs, and nothing fetches them. The document is 974px wide and centred, dock included.
- The MIT text, Copyright (c) 2026 Kelvin Zhang, is in that file, including "Permission is hereby granted, free of charge" and "THE SOFTWARE IS PROVIDED \"AS IS\"". Stripping it is a failed copy.
- The wallpaper is an inlined 1300×1300 drawing.
- Frost writes `--lg-blur`, 0 to 12, step 0.5.
- Continuous, Stepped, and Disabled are on screen together.
- The Glass knobs write custom properties on the lens. They do not retune the tab, segment, slider, or switch lenses.

## Setup

Mount the HTML file. It has no install step and no run command. The script reads the custom properties on the Glass lens and listens for prefers-reduced-motion and for data-reduce-motion="1".

## Known gaps

The wallpaper is a drawn scene inlined in the file, not a photo.

The stage shows the Continuous, Stepped and Disabled sliders together.

The lens stays in place. Dragging moves the wallpaper behind it.

The type is system-ui.

Checked in desktop Chrome only. Safari was not checked.

## Checklist

- [ ] Radio starts selected. Week starts selected. Volume is 40. Stepped volume is 40 at step 10. Disabled volume stays at 40. Wi-Fi starts on.
- [ ] Bend starts at 0.45, Dispersion at 0.4, Frost at 0px, Rim at 0.13. Each knob reaches its min and its max. Bend and Rim, 100 steps at 0.01, land on every value.
- [ ] Dragging the wallpaper moves it under the lens. A 150px drag moves it 150px. Holding a tab, segment, slider, or switch lifts that control.
- [ ] The credit shows Kelvin Zhang and @kelvinzhg as links, and also links the repo and the site. No address is written out in the stage.
- [ ] The document includes the MIT text and does not request a font, a script, or an image.

## Code

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Glisse</title>
<!--
Glisse
Copyright (c) 2026 Kelvin Zhang
https://github.com/0kzh/glisse

MIT License

Copyright (c) 2026 Kelvin Zhang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->
<style>
.glisse {
  position: relative;
  width: 100%;
  height: 640px;
  overflow: hidden;
  background: #0c0c0c;
  color: #fff;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.glisse-scroller {
  position: absolute;
  inset: 0;
  overflow: auto;
  cursor: grab;
  overscroll-behavior: none;
  user-select: none;
  scrollbar-width: none;
}
.glisse-scroller[data-dragging] { cursor: grabbing; }
.glisse-scroller::-webkit-scrollbar { display: none; }
.glisse-wall {
  position: relative;
  width: 1300px;
  height: 1300px;
  pointer-events: none;
}
.glisse-wall img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
.glisse-overlay {
  position: absolute;
  inset: 0 0 148px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  pointer-events: none;
}
.glisse-overlay > * { pointer-events: auto; }
.glisse-lens { pointer-events: none; flex: none; }
.glisse .glisse-lens.lg-glass,
.glisse .glisse-lens.lg-glass[data-rim],
.glisse .glisse-lens.lg-glass[data-drawn] {
  box-shadow: 0 4px 9px rgba(0,0,0,.16), inset 0 2px 24px rgba(0,0,0,.2), inset 0 -2px 24px rgba(255,255,255,.2);
}
.glisse-sliders {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 320px;
}
.glisse-slider-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgb(255 255 255 / 0.86);
  font-size: 12px;
  line-height: 16px;
}
.glisse-slider-label > span:first-child { flex: none; width: 84px; }
.glisse-slider-label .lg-slider { flex: 1; min-width: 0; }
.glisse-switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgb(255 255 255 / 0.9);
  font-size: 13px;
  line-height: 18px;
}
.glisse-dock {
  position: absolute;
  right: 20px;
  bottom: 36px;
  left: 20px;
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(2, max-content);
  justify-content: center;
  gap: 8px 28px;
}
.glisse-knob {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: rgb(255 255 255 / 0.82);
  font-size: 12px;
  line-height: 16px;
}
.glisse-knob > span:first-child { flex: none; width: 76px; }
.glisse-knob .lg-slider { width: 240px; flex: none; }
.glisse-knob > span:last-child {
  flex: none;
  min-width: 40px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.glisse-credit {
  position: absolute;
  right: 16px;
  bottom: 10px;
  left: 16px;
  z-index: 4;
  margin: 0;
  color: rgb(255 255 255 / 0.62);
  font: 400 12px/16px system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  text-align: center;
  pointer-events: auto;
}
.glisse-credit a { color: inherit; }
@media (prefers-reduced-motion: reduce) {
  .glisse-scroller { scroll-behavior: auto; }
}

html, body { margin: 0; height: 100%; background: #0c0c0c; }
body { display: flex; justify-content: center; }
#glisse-frame { position: relative; width: 974px; height: 640px; flex: none; }
#glisse-root { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="glisse-frame">
<div id="glisse-root"></div>
<p class="glisse-credit"><a href="https://x.com/kelvinzhg/status/2114756680047321369" target="_blank" rel="noopener noreferrer">Kelvin Zhang</a> (<a href="https://x.com/kelvinzhg/status/2114756680047321369" target="_blank" rel="noopener noreferrer">@kelvinzhg</a>) · <a href="https://github.com/0kzh/glisse" target="_blank" rel="noopener noreferrer">repo</a> · <a href="https://glisse.kelvinzhang.com" target="_blank" rel="noopener noreferrer">site</a></p>
</div>
<script>
/*!
Glisse
Copyright (c) 2026 Kelvin Zhang
https://github.com/0kzh/glisse

MIT License

Copyright (c) 2026 Kelvin Zhang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use strict";(()=>{var fh=Object.create;var xs=Object.defineProperty;var dh=Object.getOwnPropertyDescriptor;var gh=Object.getOwnPropertyNames;var mh=Object.getPrototypeOf,hh=Object.prototype.hasOwnProperty;var Ce=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(n){throw e=0,n}};var ph=(t,e,n,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of gh(e))!hh.call(t,a)&&a!==n&&xs(t,a,{get:()=>e[a],enumerable:!(l=dh(e,a))||l.enumerable});return t};var N=(t,e,n)=>(n=t!=null?fh(mh(t)):{},ph(e||!t||!t.__esModule?xs(n,"default",{value:t,enumerable:!0}):n,t));var Hs=Ce(ut=>{"use strict";function hc(t,e){var n=t.length;t.push(e);t:for(;0<n;){var l=n-1>>>1,a=t[l];if(0<bi(a,e))t[l]=e,t[n]=a,n=l;else break t}}function _e(t){return t.length===0?null:t[0]}function yi(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;t:for(var l=0,a=t.length,i=a>>>1;l<i;){var u=2*(l+1)-1,c=t[u],o=u+1,r=t[o];if(0>bi(c,n))o<a&&0>bi(r,c)?(t[l]=r,t[o]=n,l=o):(t[l]=c,t[u]=n,l=u);else if(o<a&&0>bi(r,n))t[l]=r,t[o]=n,l=o;else break t}}return e}function bi(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}ut.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Ms=performance,ut.unstable_now=function(){return Ms.now()}):(dc=Date,Ts=dc.now(),ut.unstable_now=function(){return dc.now()-Ts});var Ms,dc,Ts,Xe=[],on=[],bh=1,ge=null,Bt=3,pc=!1,ra=!1,sa=!1,bc=!1,Os=typeof setTimeout=="function"?setTimeout:null,Rs=typeof clearTimeout=="function"?clearTimeout:null,As=typeof setImmediate<"u"?setImmediate:null;function vi(t){for(var e=_e(on);e!==null;){if(e.callback===null)yi(on);else if(e.startTime<=t)yi(on),e.sortIndex=e.expirationTime,hc(Xe,e);else break;e=_e(on)}}function vc(t){if(sa=!1,vi(t),!ra)if(_e(Xe)!==null)ra=!0,dl||(dl=!0,fl());else{var e=_e(on);e!==null&&yc(vc,e.startTime-t)}}var dl=!1,fa=-1,Ds=5,ws=-1;function Ls(){return bc?!0:!(ut.unstable_now()-ws<Ds)}function gc(){if(bc=!1,dl){var t=ut.unstable_now();ws=t;var e=!0;try{t:{ra=!1,sa&&(sa=!1,Rs(fa),fa=-1),pc=!0;var n=Bt;try{e:{for(vi(t),ge=_e(Xe);ge!==null&&!(ge.expirationTime>t&&Ls());){var l=ge.callback;if(typeof l=="function"){ge.callback=null,Bt=ge.priorityLevel;var a=l(ge.expirationTime<=t);if(t=ut.unstable_now(),typeof a=="function"){ge.callback=a,vi(t),e=!0;break e}ge===_e(Xe)&&yi(Xe),vi(t)}else yi(Xe);ge=_e(Xe)}if(ge!==null)e=!0;else{var i=_e(on);i!==null&&yc(vc,i.startTime-t),e=!1}}break t}finally{ge=null,Bt=n,pc=!1}e=void 0}}finally{e?fl():dl=!1}}}var fl;typeof As=="function"?fl=function(){As(gc)}:typeof MessageChannel<"u"?(mc=new MessageChannel,zs=mc.port2,mc.port1.onmessage=gc,fl=function(){zs.postMessage(null)}):fl=function(){Os(gc,0)};var mc,zs;function yc(t,e){fa=Os(function(){t(ut.unstable_now())},e)}ut.unstable_IdlePriority=5;ut.unstable_ImmediatePriority=1;ut.unstable_LowPriority=4;ut.unstable_NormalPriority=3;ut.unstable_Profiling=null;ut.unstable_UserBlockingPriority=2;ut.unstable_cancelCallback=function(t){t.callback=null};ut.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Ds=0<t?Math.floor(1e3/t):5};ut.unstable_getCurrentPriorityLevel=function(){return Bt};ut.unstable_next=function(t){switch(Bt){case 1:case 2:case 3:var e=3;break;default:e=Bt}var n=Bt;Bt=e;try{return t()}finally{Bt=n}};ut.unstable_requestPaint=function(){bc=!0};ut.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=Bt;Bt=t;try{return e()}finally{Bt=n}};ut.unstable_scheduleCallback=function(t,e,n){var l=ut.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?l+n:l):n=l,t){case 1:var a=-1;break;case 2:a=250;break;case 5:a=1073741823;break;case 4:a=1e4;break;default:a=5e3}return a=n+a,t={id:bh++,callback:e,priorityLevel:t,startTime:n,expirationTime:a,sortIndex:-1},n>l?(t.sortIndex=n,hc(on,t),_e(Xe)===null&&t===_e(on)&&(sa?(Rs(fa),fa=-1):sa=!0,yc(vc,n-l))):(t.sortIndex=a,hc(Xe,t),ra||pc||(ra=!0,dl||(dl=!0,fl()))),t};ut.unstable_shouldYield=Ls;ut.unstable_wrapCallback=function(t){var e=Bt;return function(){var n=Bt;Bt=e;try{return t.apply(this,arguments)}finally{Bt=n}}}});var _s=Ce((Ev,Cs)=>{"use strict";Cs.exports=Hs()});var js=Ce(C=>{"use strict";var xc=Symbol.for("react.transitional.element"),vh=Symbol.for("react.portal"),yh=Symbol.for("react.fragment"),Sh=Symbol.for("react.strict_mode"),Eh=Symbol.for("react.profiler"),xh=Symbol.for("react.consumer"),Mh=Symbol.for("react.context"),Th=Symbol.for("react.forward_ref"),Ah=Symbol.for("react.suspense"),zh=Symbol.for("react.memo"),qs=Symbol.for("react.lazy"),Oh=Symbol.for("react.activity"),Ns=Symbol.iterator;function Rh(t){return t===null||typeof t!="object"?null:(t=Ns&&t[Ns]||t["@@iterator"],typeof t=="function"?t:null)}var Ys={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Xs=Object.assign,Vs={};function ml(t,e,n){this.props=t,this.context=e,this.refs=Vs,this.updater=n||Ys}ml.prototype.isReactComponent={};ml.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};ml.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Zs(){}Zs.prototype=ml.prototype;function Mc(t,e,n){this.props=t,this.context=e,this.refs=Vs,this.updater=n||Ys}var Tc=Mc.prototype=new Zs;Tc.constructor=Mc;Xs(Tc,ml.prototype);Tc.isPureReactComponent=!0;var Us=Array.isArray;function Ec(){}var nt={H:null,A:null,T:null,S:null},Qs=Object.prototype.hasOwnProperty;function Ac(t,e,n){var l=n.ref;return{$$typeof:xc,type:t,key:e,ref:l!==void 0?l:null,props:n}}function Dh(t,e){return Ac(t.type,e,t.props)}function zc(t){return typeof t=="object"&&t!==null&&t.$$typeof===xc}function wh(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var Bs=/\/+/g;function Sc(t,e){return typeof t=="object"&&t!==null&&t.key!=null?wh(""+t.key):e.toString(36)}function Lh(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(Ec,Ec):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function gl(t,e,n,l,a){var i=typeof t;(i==="undefined"||i==="boolean")&&(t=null);var u=!1;if(t===null)u=!0;else switch(i){case"bigint":case"string":case"number":u=!0;break;case"object":switch(t.$$typeof){case xc:case vh:u=!0;break;case qs:return u=t._init,gl(u(t._payload),e,n,l,a)}}if(u)return a=a(t),u=l===""?"."+Sc(t,0):l,Us(a)?(n="",u!=null&&(n=u.replace(Bs,"$&/")+"/"),gl(a,e,n,"",function(r){return r})):a!=null&&(zc(a)&&(a=Dh(a,n+(a.key==null||t&&t.key===a.key?"":(""+a.key).replace(Bs,"$&/")+"/")+u)),e.push(a)),1;u=0;var c=l===""?".":l+":";if(Us(t))for(var o=0;o<t.length;o++)l=t[o],i=c+Sc(l,o),u+=gl(l,e,n,i,a);else if(o=Rh(t),typeof o=="function")for(t=o.call(t),o=0;!(l=t.next()).done;)l=l.value,i=c+Sc(l,o++),u+=gl(l,e,n,i,a);else if(i==="object"){if(typeof t.then=="function")return gl(Lh(t),e,n,l,a);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return u}function Si(t,e,n){if(t==null)return t;var l=[],a=0;return gl(t,l,"","",function(i){return e.call(n,i,a++)}),l}function Hh(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var Gs=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},Ch={map:Si,forEach:function(t,e,n){Si(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Si(t,function(){e++}),e},toArray:function(t){return Si(t,function(e){return e})||[]},only:function(t){if(!zc(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};C.Activity=Oh;C.Children=Ch;C.Component=ml;C.Fragment=yh;C.Profiler=Eh;C.PureComponent=Mc;C.StrictMode=Sh;C.Suspense=Ah;C.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=nt;C.__COMPILER_RUNTIME={__proto__:null,c:function(t){return nt.H.useMemoCache(t)}};C.cache=function(t){return function(){return t.apply(null,arguments)}};C.cacheSignal=function(){return null};C.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var l=Xs({},t.props),a=t.key;if(e!=null)for(i in e.key!==void 0&&(a=""+e.key),e)!Qs.call(e,i)||i==="key"||i==="__self"||i==="__source"||i==="ref"&&e.ref===void 0||(l[i]=e[i]);var i=arguments.length-2;if(i===1)l.children=n;else if(1<i){for(var u=Array(i),c=0;c<i;c++)u[c]=arguments[c+2];l.children=u}return Ac(t.type,a,l)};C.createContext=function(t){return t={$$typeof:Mh,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:xh,_context:t},t};C.createElement=function(t,e,n){var l,a={},i=null;if(e!=null)for(l in e.key!==void 0&&(i=""+e.key),e)Qs.call(e,l)&&l!=="key"&&l!=="__self"&&l!=="__source"&&(a[l]=e[l]);var u=arguments.length-2;if(u===1)a.children=n;else if(1<u){for(var c=Array(u),o=0;o<u;o++)c[o]=arguments[o+2];a.children=c}if(t&&t.defaultProps)for(l in u=t.defaultProps,u)a[l]===void 0&&(a[l]=u[l]);return Ac(t,i,a)};C.createRef=function(){return{current:null}};C.forwardRef=function(t){return{$$typeof:Th,render:t}};C.isValidElement=zc;C.lazy=function(t){return{$$typeof:qs,_payload:{_status:-1,_result:t},_init:Hh}};C.memo=function(t,e){return{$$typeof:zh,type:t,compare:e===void 0?null:e}};C.startTransition=function(t){var e=nt.T,n={};nt.T=n;try{var l=t(),a=nt.S;a!==null&&a(n,l),typeof l=="object"&&l!==null&&typeof l.then=="function"&&l.then(Ec,Gs)}catch(i){Gs(i)}finally{e!==null&&n.types!==null&&(e.types=n.types),nt.T=e}};C.unstable_useCacheRefresh=function(){return nt.H.useCacheRefresh()};C.use=function(t){return nt.H.use(t)};C.useActionState=function(t,e,n){return nt.H.useActionState(t,e,n)};C.useCallback=function(t,e){return nt.H.useCallback(t,e)};C.useContext=function(t){return nt.H.useContext(t)};C.useDebugValue=function(){};C.useDeferredValue=function(t,e){return nt.H.useDeferredValue(t,e)};C.useEffect=function(t,e){return nt.H.useEffect(t,e)};C.useEffectEvent=function(t){return nt.H.useEffectEvent(t)};C.useId=function(){return nt.H.useId()};C.useImperativeHandle=function(t,e,n){return nt.H.useImperativeHandle(t,e,n)};C.useInsertionEffect=function(t,e){return nt.H.useInsertionEffect(t,e)};C.useLayoutEffect=function(t,e){return nt.H.useLayoutEffect(t,e)};C.useMemo=function(t,e){return nt.H.useMemo(t,e)};C.useOptimistic=function(t,e){return nt.H.useOptimistic(t,e)};C.useReducer=function(t,e,n){return nt.H.useReducer(t,e,n)};C.useRef=function(t){return nt.H.useRef(t)};C.useState=function(t){return nt.H.useState(t)};C.useSyncExternalStore=function(t,e,n){return nt.H.useSyncExternalStore(t,e,n)};C.useTransition=function(){return nt.H.useTransition()};C.version="19.2.3"});var Yt=Ce((Mv,Ks)=>{"use strict";Ks.exports=js()});var ks=Ce(Vt=>{"use strict";var _h=Yt();function Js(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function rn(){}var Xt={d:{f:rn,r:function(){throw Error(Js(522))},D:rn,C:rn,L:rn,m:rn,X:rn,S:rn,M:rn},p:0,findDOMNode:null},Nh=Symbol.for("react.portal");function Uh(t,e,n){var l=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Nh,key:l==null?null:""+l,children:t,containerInfo:e,implementation:n}}var da=_h.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Ei(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}Vt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Xt;Vt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(Js(299));return Uh(t,e,null,n)};Vt.flushSync=function(t){var e=da.T,n=Xt.p;try{if(da.T=null,Xt.p=2,t)return t()}finally{da.T=e,Xt.p=n,Xt.d.f()}};Vt.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,Xt.d.C(t,e))};Vt.prefetchDNS=function(t){typeof t=="string"&&Xt.d.D(t)};Vt.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,l=Ei(n,e.crossOrigin),a=typeof e.integrity=="string"?e.integrity:void 0,i=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?Xt.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:l,integrity:a,fetchPriority:i}):n==="script"&&Xt.d.X(t,{crossOrigin:l,integrity:a,fetchPriority:i,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};Vt.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Ei(e.as,e.crossOrigin);Xt.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&Xt.d.M(t)};Vt.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,l=Ei(n,e.crossOrigin);Xt.d.L(t,n,{crossOrigin:l,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};Vt.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Ei(e.as,e.crossOrigin);Xt.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else Xt.d.m(t)};Vt.requestFormReset=function(t){Xt.d.r(t)};Vt.unstable_batchedUpdates=function(t,e){return t(e)};Vt.useFormState=function(t,e,n){return da.H.useFormState(t,e,n)};Vt.useFormStatus=function(){return da.H.useHostTransitionStatus()};Vt.version="19.2.3"});var Fs=Ce((Av,Ws)=>{"use strict";function $s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE($s)}catch(t){console.error(t)}}$s(),Ws.exports=ks()});var sm=Ce(Ku=>{"use strict";var Et=_s(),Td=Yt(),Bh=Fs();function M(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Ad(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Ia(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,(e.flags&4098)!==0&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function zd(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Od(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Is(t){if(Ia(t)!==t)throw Error(M(188))}function Gh(t){var e=t.alternate;if(!e){if(e=Ia(t),e===null)throw Error(M(188));return e!==t?null:t}for(var n=t,l=e;;){var a=n.return;if(a===null)break;var i=a.alternate;if(i===null){if(l=a.return,l!==null){n=l;continue}break}if(a.child===i.child){for(i=a.child;i;){if(i===n)return Is(a),t;if(i===l)return Is(a),e;i=i.sibling}throw Error(M(188))}if(n.return!==l.return)n=a,l=i;else{for(var u=!1,c=a.child;c;){if(c===n){u=!0,n=a,l=i;break}if(c===l){u=!0,l=a,n=i;break}c=c.sibling}if(!u){for(c=i.child;c;){if(c===n){u=!0,n=i,l=a;break}if(c===l){u=!0,l=i,n=a;break}c=c.sibling}if(!u)throw Error(M(189))}}if(n.alternate!==l)throw Error(M(190))}if(n.tag!==3)throw Error(M(188));return n.stateNode.current===n?t:e}function Rd(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=Rd(t),e!==null)return e;t=t.sibling}return null}var it=Object.assign,qh=Symbol.for("react.element"),xi=Symbol.for("react.transitional.element"),Sa=Symbol.for("react.portal"),Sl=Symbol.for("react.fragment"),Dd=Symbol.for("react.strict_mode"),uo=Symbol.for("react.profiler"),wd=Symbol.for("react.consumer"),$e=Symbol.for("react.context"),nr=Symbol.for("react.forward_ref"),co=Symbol.for("react.suspense"),oo=Symbol.for("react.suspense_list"),lr=Symbol.for("react.memo"),sn=Symbol.for("react.lazy"),ro=Symbol.for("react.activity"),Yh=Symbol.for("react.memo_cache_sentinel"),Ps=Symbol.iterator;function ga(t){return t===null||typeof t!="object"?null:(t=Ps&&t[Ps]||t["@@iterator"],typeof t=="function"?t:null)}var Xh=Symbol.for("react.client.reference");function so(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===Xh?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Sl:return"Fragment";case uo:return"Profiler";case Dd:return"StrictMode";case co:return"Suspense";case oo:return"SuspenseList";case ro:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case Sa:return"Portal";case $e:return t.displayName||"Context";case wd:return(t._context.displayName||"Context")+".Consumer";case nr:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case lr:return e=t.displayName||null,e!==null?e:so(t.type)||"Memo";case sn:e=t._payload,t=t._init;try{return so(t(e))}catch{}}return null}var Ea=Array.isArray,L=Td.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,J=Bh.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,jn={pending:!1,data:null,method:null,action:null},fo=[],El=-1;function qe(t){return{current:t}}function At(t){0>El||(t.current=fo[El],fo[El]=null,El--)}function et(t,e){El++,fo[El]=t.current,t.current=e}var Ge=qe(null),Ga=qe(null),En=qe(null),eu=qe(null);function nu(t,e){switch(et(En,e),et(Ga,t),et(Ge,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?cd(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=cd(e),t=Wg(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}At(Ge),et(Ge,t)}function ql(){At(Ge),At(Ga),At(En)}function go(t){t.memoizedState!==null&&et(eu,t);var e=Ge.current,n=Wg(e,t.type);e!==n&&(et(Ga,t),et(Ge,n))}function lu(t){Ga.current===t&&(At(Ge),At(Ga)),eu.current===t&&(At(eu),$a._currentValue=jn)}var Oc,tf;function Xn(t){if(Oc===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Oc=e&&e[1]||"",tf=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Oc+t+tf}var Rc=!1;function Dc(t,e){if(!t||Rc)return"";Rc=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var l={DetermineComponentFrameRoot:function(){try{if(e){var s=function(){throw Error()};if(Object.defineProperty(s.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(s,[])}catch(h){var f=h}Reflect.construct(t,[],s)}else{try{s.call()}catch(h){f=h}t.call(s.prototype)}}else{try{throw Error()}catch(h){f=h}(s=t())&&typeof s.catch=="function"&&s.catch(function(){})}}catch(h){if(h&&f&&typeof h.stack=="string")return[h.stack,f.stack]}return[null,null]}};l.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var a=Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot,"name");a&&a.configurable&&Object.defineProperty(l.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var i=l.DetermineComponentFrameRoot(),u=i[0],c=i[1];if(u&&c){var o=u.split(`
`),r=c.split(`
`);for(a=l=0;l<o.length&&!o[l].includes("DetermineComponentFrameRoot");)l++;for(;a<r.length&&!r[a].includes("DetermineComponentFrameRoot");)a++;if(l===o.length||a===r.length)for(l=o.length-1,a=r.length-1;1<=l&&0<=a&&o[l]!==r[a];)a--;for(;1<=l&&0<=a;l--,a--)if(o[l]!==r[a]){if(l!==1||a!==1)do if(l--,a--,0>a||o[l]!==r[a]){var m=`
`+o[l].replace(" at new "," at ");return t.displayName&&m.includes("<anonymous>")&&(m=m.replace("<anonymous>",t.displayName)),m}while(1<=l&&0<=a);break}}}finally{Rc=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?Xn(n):""}function Vh(t,e){switch(t.tag){case 26:case 27:case 5:return Xn(t.type);case 16:return Xn("Lazy");case 13:return t.child!==e&&e!==null?Xn("Suspense Fallback"):Xn("Suspense");case 19:return Xn("SuspenseList");case 0:case 15:return Dc(t.type,!1);case 11:return Dc(t.type.render,!1);case 1:return Dc(t.type,!0);case 31:return Xn("Activity");default:return""}}function ef(t){try{var e="",n=null;do e+=Vh(t,n),n=t,t=t.return;while(t);return e}catch(l){return`
Error generating stack: `+l.message+`
`+l.stack}}var mo=Object.prototype.hasOwnProperty,ar=Et.unstable_scheduleCallback,wc=Et.unstable_cancelCallback,Zh=Et.unstable_shouldYield,Qh=Et.unstable_requestPaint,ae=Et.unstable_now,jh=Et.unstable_getCurrentPriorityLevel,Ld=Et.unstable_ImmediatePriority,Hd=Et.unstable_UserBlockingPriority,au=Et.unstable_NormalPriority,Kh=Et.unstable_LowPriority,Cd=Et.unstable_IdlePriority,Jh=Et.log,kh=Et.unstable_setDisableYieldValue,Pa=null,ie=null;function pn(t){if(typeof Jh=="function"&&kh(t),ie&&typeof ie.setStrictMode=="function")try{ie.setStrictMode(Pa,t)}catch{}}var ue=Math.clz32?Math.clz32:Fh,$h=Math.log,Wh=Math.LN2;function Fh(t){return t>>>=0,t===0?32:31-($h(t)/Wh|0)|0}var Mi=256,Ti=262144,Ai=4194304;function Vn(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function wu(t,e,n){var l=t.pendingLanes;if(l===0)return 0;var a=0,i=t.suspendedLanes,u=t.pingedLanes;t=t.warmLanes;var c=l&134217727;return c!==0?(l=c&~i,l!==0?a=Vn(l):(u&=c,u!==0?a=Vn(u):n||(n=c&~t,n!==0&&(a=Vn(n))))):(c=l&~i,c!==0?a=Vn(c):u!==0?a=Vn(u):n||(n=l&~t,n!==0&&(a=Vn(n)))),a===0?0:e!==0&&e!==a&&(e&i)===0&&(i=a&-a,n=e&-e,i>=n||i===32&&(n&4194048)!==0)?e:a}function ti(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function Ih(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function _d(){var t=Ai;return Ai<<=1,(Ai&62914560)===0&&(Ai=4194304),t}function Lc(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function ei(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function Ph(t,e,n,l,a,i){var u=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var c=t.entanglements,o=t.expirationTimes,r=t.hiddenUpdates;for(n=u&~n;0<n;){var m=31-ue(n),s=1<<m;c[m]=0,o[m]=-1;var f=r[m];if(f!==null)for(r[m]=null,m=0;m<f.length;m++){var h=f[m];h!==null&&(h.lane&=-536870913)}n&=~s}l!==0&&Nd(t,l,0),i!==0&&a===0&&t.tag!==0&&(t.suspendedLanes|=i&~(u&~e))}function Nd(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var l=31-ue(e);t.entangledLanes|=e,t.entanglements[l]=t.entanglements[l]|1073741824|n&261930}function Ud(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var l=31-ue(n),a=1<<l;a&e|t[l]&e&&(t[l]|=e),n&=~a}}function Bd(t,e){var n=e&-e;return n=(n&42)!==0?1:ir(n),(n&(t.suspendedLanes|e))!==0?0:n}function ir(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function ur(t){return t&=-t,2<t?8<t?(t&134217727)!==0?32:268435456:8:2}function Gd(){var t=J.p;return t!==0?t:(t=window.event,t===void 0?32:cm(t.type))}function nf(t,e){var n=J.p;try{return J.p=t,e()}finally{J.p=n}}var _n=Math.random().toString(36).slice(2),Lt="__reactFiber$"+_n,It="__reactProps$"+_n,Wl="__reactContainer$"+_n,ho="__reactEvents$"+_n,tp="__reactListeners$"+_n,ep="__reactHandles$"+_n,lf="__reactResources$"+_n,ni="__reactMarker$"+_n;function cr(t){delete t[Lt],delete t[It],delete t[ho],delete t[tp],delete t[ep]}function xl(t){var e=t[Lt];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Wl]||n[Lt]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=dd(t);t!==null;){if(n=t[Lt])return n;t=dd(t)}return e}t=n,n=t.parentNode}return null}function Fl(t){if(t=t[Lt]||t[Wl]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function xa(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(M(33))}function Hl(t){var e=t[lf];return e||(e=t[lf]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Tt(t){t[ni]=!0}var qd=new Set,Yd={};function el(t,e){Yl(t,e),Yl(t+"Capture",e)}function Yl(t,e){for(Yd[t]=e,t=0;t<e.length;t++)qd.add(e[t])}var np=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),af={},uf={};function lp(t){return mo.call(uf,t)?!0:mo.call(af,t)?!1:np.test(t)?uf[t]=!0:(af[t]=!0,!1)}function Yi(t,e,n){if(lp(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var l=e.toLowerCase().slice(0,5);if(l!=="data-"&&l!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function zi(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function Ve(t,e,n,l){if(l===null)t.removeAttribute(n);else{switch(typeof l){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+l)}}function he(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Xd(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function ap(t,e,n){var l=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var a=l.get,i=l.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return a.call(this)},set:function(u){n=""+u,i.call(this,u)}}),Object.defineProperty(t,e,{enumerable:l.enumerable}),{getValue:function(){return n},setValue:function(u){n=""+u},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function po(t){if(!t._valueTracker){var e=Xd(t)?"checked":"value";t._valueTracker=ap(t,e,""+t[e])}}function Vd(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),l="";return t&&(l=Xd(t)?t.checked?"true":"false":t.value),t=l,t!==n?(e.setValue(t),!0):!1}function iu(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var ip=/[\n"\\]/g;function ve(t){return t.replace(ip,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function bo(t,e,n,l,a,i,u,c){t.name="",u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.type=u:t.removeAttribute("type"),e!=null?u==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+he(e)):t.value!==""+he(e)&&(t.value=""+he(e)):u!=="submit"&&u!=="reset"||t.removeAttribute("value"),e!=null?vo(t,u,he(e)):n!=null?vo(t,u,he(n)):l!=null&&t.removeAttribute("value"),a==null&&i!=null&&(t.defaultChecked=!!i),a!=null&&(t.checked=a&&typeof a!="function"&&typeof a!="symbol"),c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?t.name=""+he(c):t.removeAttribute("name")}function Zd(t,e,n,l,a,i,u,c){if(i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.type=i),e!=null||n!=null){if(!(i!=="submit"&&i!=="reset"||e!=null)){po(t);return}n=n!=null?""+he(n):"",e=e!=null?""+he(e):n,c||e===t.value||(t.value=e),t.defaultValue=e}l=l??a,l=typeof l!="function"&&typeof l!="symbol"&&!!l,t.checked=c?t.checked:!!l,t.defaultChecked=!!l,u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"&&(t.name=u),po(t)}function vo(t,e,n){e==="number"&&iu(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function Cl(t,e,n,l){if(t=t.options,e){e={};for(var a=0;a<n.length;a++)e["$"+n[a]]=!0;for(n=0;n<t.length;n++)a=e.hasOwnProperty("$"+t[n].value),t[n].selected!==a&&(t[n].selected=a),a&&l&&(t[n].defaultSelected=!0)}else{for(n=""+he(n),e=null,a=0;a<t.length;a++){if(t[a].value===n){t[a].selected=!0,l&&(t[a].defaultSelected=!0);return}e!==null||t[a].disabled||(e=t[a])}e!==null&&(e.selected=!0)}}function Qd(t,e,n){if(e!=null&&(e=""+he(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+he(n):""}function jd(t,e,n,l){if(e==null){if(l!=null){if(n!=null)throw Error(M(92));if(Ea(l)){if(1<l.length)throw Error(M(93));l=l[0]}n=l}n==null&&(n=""),e=n}n=he(e),t.defaultValue=n,l=t.textContent,l===n&&l!==""&&l!==null&&(t.value=l),po(t)}function Xl(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var up=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function cf(t,e,n){var l=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?l?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":l?t.setProperty(e,n):typeof n!="number"||n===0||up.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function Kd(t,e,n){if(e!=null&&typeof e!="object")throw Error(M(62));if(t=t.style,n!=null){for(var l in n)!n.hasOwnProperty(l)||e!=null&&e.hasOwnProperty(l)||(l.indexOf("--")===0?t.setProperty(l,""):l==="float"?t.cssFloat="":t[l]="");for(var a in e)l=e[a],e.hasOwnProperty(a)&&n[a]!==l&&cf(t,a,l)}else for(var i in e)e.hasOwnProperty(i)&&cf(t,i,e[i])}function or(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var cp=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),op=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Xi(t){return op.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function We(){}var yo=null;function rr(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Ml=null,_l=null;function of(t){var e=Fl(t);if(e&&(t=e.stateNode)){var n=t[It]||null;t:switch(t=e.stateNode,e.type){case"input":if(bo(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+ve(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var l=n[e];if(l!==t&&l.form===t.form){var a=l[It]||null;if(!a)throw Error(M(90));bo(l,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(e=0;e<n.length;e++)l=n[e],l.form===t.form&&Vd(l)}break t;case"textarea":Qd(t,n.value,n.defaultValue);break t;case"select":e=n.value,e!=null&&Cl(t,!!n.multiple,e,!1)}}}var Hc=!1;function Jd(t,e,n){if(Hc)return t(e,n);Hc=!0;try{var l=t(e);return l}finally{if(Hc=!1,(Ml!==null||_l!==null)&&(Vu(),Ml&&(e=Ml,t=_l,_l=Ml=null,of(e),t)))for(e=0;e<t.length;e++)of(t[e])}}function qa(t,e){var n=t.stateNode;if(n===null)return null;var l=n[It]||null;if(l===null)return null;n=l[e];t:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(l=!l.disabled)||(t=t.type,l=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!l;break t;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(M(231,e,typeof n));return n}var en=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),So=!1;if(en)try{hl={},Object.defineProperty(hl,"passive",{get:function(){So=!0}}),window.addEventListener("test",hl,hl),window.removeEventListener("test",hl,hl)}catch{So=!1}var hl,bn=null,sr=null,Vi=null;function kd(){if(Vi)return Vi;var t,e=sr,n=e.length,l,a="value"in bn?bn.value:bn.textContent,i=a.length;for(t=0;t<n&&e[t]===a[t];t++);var u=n-t;for(l=1;l<=u&&e[n-l]===a[i-l];l++);return Vi=a.slice(t,1<l?1-l:void 0)}function Zi(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Oi(){return!0}function rf(){return!1}function Pt(t){function e(n,l,a,i,u){this._reactName=n,this._targetInst=a,this.type=l,this.nativeEvent=i,this.target=u,this.currentTarget=null;for(var c in t)t.hasOwnProperty(c)&&(n=t[c],this[c]=n?n(i):i[c]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Oi:rf,this.isPropagationStopped=rf,this}return it(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Oi)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Oi)},persist:function(){},isPersistent:Oi}),e}var nl={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Lu=Pt(nl),li=it({},nl,{view:0,detail:0}),rp=Pt(li),Cc,_c,ma,Hu=it({},li,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:fr,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==ma&&(ma&&t.type==="mousemove"?(Cc=t.screenX-ma.screenX,_c=t.screenY-ma.screenY):_c=Cc=0,ma=t),Cc)},movementY:function(t){return"movementY"in t?t.movementY:_c}}),sf=Pt(Hu),sp=it({},Hu,{dataTransfer:0}),fp=Pt(sp),dp=it({},li,{relatedTarget:0}),Nc=Pt(dp),gp=it({},nl,{animationName:0,elapsedTime:0,pseudoElement:0}),mp=Pt(gp),hp=it({},nl,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),pp=Pt(hp),bp=it({},nl,{data:0}),ff=Pt(bp),vp={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},yp={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Sp={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Ep(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Sp[t])?!!e[t]:!1}function fr(){return Ep}var xp=it({},li,{key:function(t){if(t.key){var e=vp[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Zi(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?yp[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:fr,charCode:function(t){return t.type==="keypress"?Zi(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Zi(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Mp=Pt(xp),Tp=it({},Hu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),df=Pt(Tp),Ap=it({},li,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:fr}),zp=Pt(Ap),Op=it({},nl,{propertyName:0,elapsedTime:0,pseudoElement:0}),Rp=Pt(Op),Dp=it({},Hu,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),wp=Pt(Dp),Lp=it({},nl,{newState:0,oldState:0}),Hp=Pt(Lp),Cp=[9,13,27,32],dr=en&&"CompositionEvent"in window,Aa=null;en&&"documentMode"in document&&(Aa=document.documentMode);var _p=en&&"TextEvent"in window&&!Aa,$d=en&&(!dr||Aa&&8<Aa&&11>=Aa),gf=" ",mf=!1;function Wd(t,e){switch(t){case"keyup":return Cp.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Fd(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Tl=!1;function Np(t,e){switch(t){case"compositionend":return Fd(e);case"keypress":return e.which!==32?null:(mf=!0,gf);case"textInput":return t=e.data,t===gf&&mf?null:t;default:return null}}function Up(t,e){if(Tl)return t==="compositionend"||!dr&&Wd(t,e)?(t=kd(),Vi=sr=bn=null,Tl=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return $d&&e.locale!=="ko"?null:e.data;default:return null}}var Bp={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function hf(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!Bp[t.type]:e==="textarea"}function Id(t,e,n,l){Ml?_l?_l.push(l):_l=[l]:Ml=l,e=Mu(e,"onChange"),0<e.length&&(n=new Lu("onChange","change",null,n,l),t.push({event:n,listeners:e}))}var za=null,Ya=null;function Gp(t){Jg(t,0)}function Cu(t){var e=xa(t);if(Vd(e))return t}function pf(t,e){if(t==="change")return e}var Pd=!1;en&&(en?(Di="oninput"in document,Di||(Uc=document.createElement("div"),Uc.setAttribute("oninput","return;"),Di=typeof Uc.oninput=="function"),Ri=Di):Ri=!1,Pd=Ri&&(!document.documentMode||9<document.documentMode));var Ri,Di,Uc;function bf(){za&&(za.detachEvent("onpropertychange",t0),Ya=za=null)}function t0(t){if(t.propertyName==="value"&&Cu(Ya)){var e=[];Id(e,Ya,t,rr(t)),Jd(Gp,e)}}function qp(t,e,n){t==="focusin"?(bf(),za=e,Ya=n,za.attachEvent("onpropertychange",t0)):t==="focusout"&&bf()}function Yp(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Cu(Ya)}function Xp(t,e){if(t==="click")return Cu(e)}function Vp(t,e){if(t==="input"||t==="change")return Cu(e)}function Zp(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var oe=typeof Object.is=="function"?Object.is:Zp;function Xa(t,e){if(oe(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),l=Object.keys(e);if(n.length!==l.length)return!1;for(l=0;l<n.length;l++){var a=n[l];if(!mo.call(e,a)||!oe(t[a],e[a]))return!1}return!0}function vf(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function yf(t,e){var n=vf(t);t=0;for(var l;n;){if(n.nodeType===3){if(l=t+n.textContent.length,t<=e&&l>=e)return{node:n,offset:e-t};t=l}t:{for(;n;){if(n.nextSibling){n=n.nextSibling;break t}n=n.parentNode}n=void 0}n=vf(n)}}function e0(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?e0(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function n0(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=iu(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=iu(t.document)}return e}function gr(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var Qp=en&&"documentMode"in document&&11>=document.documentMode,Al=null,Eo=null,Oa=null,xo=!1;function Sf(t,e,n){var l=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;xo||Al==null||Al!==iu(l)||(l=Al,"selectionStart"in l&&gr(l)?l={start:l.selectionStart,end:l.selectionEnd}:(l=(l.ownerDocument&&l.ownerDocument.defaultView||window).getSelection(),l={anchorNode:l.anchorNode,anchorOffset:l.anchorOffset,focusNode:l.focusNode,focusOffset:l.focusOffset}),Oa&&Xa(Oa,l)||(Oa=l,l=Mu(Eo,"onSelect"),0<l.length&&(e=new Lu("onSelect","select",null,e,n),t.push({event:e,listeners:l}),e.target=Al)))}function Yn(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var zl={animationend:Yn("Animation","AnimationEnd"),animationiteration:Yn("Animation","AnimationIteration"),animationstart:Yn("Animation","AnimationStart"),transitionrun:Yn("Transition","TransitionRun"),transitionstart:Yn("Transition","TransitionStart"),transitioncancel:Yn("Transition","TransitionCancel"),transitionend:Yn("Transition","TransitionEnd")},Bc={},l0={};en&&(l0=document.createElement("div").style,"AnimationEvent"in window||(delete zl.animationend.animation,delete zl.animationiteration.animation,delete zl.animationstart.animation),"TransitionEvent"in window||delete zl.transitionend.transition);function ll(t){if(Bc[t])return Bc[t];if(!zl[t])return t;var e=zl[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in l0)return Bc[t]=e[n];return t}var a0=ll("animationend"),i0=ll("animationiteration"),u0=ll("animationstart"),jp=ll("transitionrun"),Kp=ll("transitionstart"),Jp=ll("transitioncancel"),c0=ll("transitionend"),o0=new Map,Mo="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Mo.push("scrollEnd");function De(t,e){o0.set(t,e),el(e,[t])}var uu=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},me=[],Ol=0,mr=0;function _u(){for(var t=Ol,e=mr=Ol=0;e<t;){var n=me[e];me[e++]=null;var l=me[e];me[e++]=null;var a=me[e];me[e++]=null;var i=me[e];if(me[e++]=null,l!==null&&a!==null){var u=l.pending;u===null?a.next=a:(a.next=u.next,u.next=a),l.pending=a}i!==0&&r0(n,a,i)}}function Nu(t,e,n,l){me[Ol++]=t,me[Ol++]=e,me[Ol++]=n,me[Ol++]=l,mr|=l,t.lanes|=l,t=t.alternate,t!==null&&(t.lanes|=l)}function hr(t,e,n,l){return Nu(t,e,n,l),cu(t)}function al(t,e){return Nu(t,null,null,e),cu(t)}function r0(t,e,n){t.lanes|=n;var l=t.alternate;l!==null&&(l.lanes|=n);for(var a=!1,i=t.return;i!==null;)i.childLanes|=n,l=i.alternate,l!==null&&(l.childLanes|=n),i.tag===22&&(t=i.stateNode,t===null||t._visibility&1||(a=!0)),t=i,i=i.return;return t.tag===3?(i=t.stateNode,a&&e!==null&&(a=31-ue(n),t=i.hiddenUpdates,l=t[a],l===null?t[a]=[e]:l.push(e),e.lane=n|536870912),i):null}function cu(t){if(50<Ua)throw Ua=0,Qo=null,Error(M(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var Rl={};function kp(t,e,n,l){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=l,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ne(t,e,n,l){return new kp(t,e,n,l)}function pr(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Ie(t,e){var n=t.alternate;return n===null?(n=ne(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function s0(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Qi(t,e,n,l,a,i){var u=0;if(l=t,typeof t=="function")pr(t)&&(u=1);else if(typeof t=="string")u=F1(t,n,Ge.current)?26:t==="html"||t==="head"||t==="body"?27:5;else t:switch(t){case ro:return t=ne(31,n,e,a),t.elementType=ro,t.lanes=i,t;case Sl:return Kn(n.children,a,i,e);case Dd:u=8,a|=24;break;case uo:return t=ne(12,n,e,a|2),t.elementType=uo,t.lanes=i,t;case co:return t=ne(13,n,e,a),t.elementType=co,t.lanes=i,t;case oo:return t=ne(19,n,e,a),t.elementType=oo,t.lanes=i,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case $e:u=10;break t;case wd:u=9;break t;case nr:u=11;break t;case lr:u=14;break t;case sn:u=16,l=null;break t}u=29,n=Error(M(130,t===null?"null":typeof t,"")),l=null}return e=ne(u,n,e,a),e.elementType=t,e.type=l,e.lanes=i,e}function Kn(t,e,n,l){return t=ne(7,t,l,e),t.lanes=n,t}function Gc(t,e,n){return t=ne(6,t,null,e),t.lanes=n,t}function f0(t){var e=ne(18,null,null,0);return e.stateNode=t,e}function qc(t,e,n){return e=ne(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var Ef=new WeakMap;function ye(t,e){if(typeof t=="object"&&t!==null){var n=Ef.get(t);return n!==void 0?n:(e={value:t,source:e,stack:ef(e)},Ef.set(t,e),e)}return{value:t,source:e,stack:ef(e)}}var Dl=[],wl=0,ou=null,Va=0,pe=[],be=0,wn=null,Ne=1,Ue="";function Je(t,e){Dl[wl++]=Va,Dl[wl++]=ou,ou=t,Va=e}function d0(t,e,n){pe[be++]=Ne,pe[be++]=Ue,pe[be++]=wn,wn=t;var l=Ne;t=Ue;var a=32-ue(l)-1;l&=~(1<<a),n+=1;var i=32-ue(e)+a;if(30<i){var u=a-a%5;i=(l&(1<<u)-1).toString(32),l>>=u,a-=u,Ne=1<<32-ue(e)+a|n<<a|l,Ue=i+t}else Ne=1<<i|n<<a|l,Ue=t}function br(t){t.return!==null&&(Je(t,1),d0(t,1,0))}function vr(t){for(;t===ou;)ou=Dl[--wl],Dl[wl]=null,Va=Dl[--wl],Dl[wl]=null;for(;t===wn;)wn=pe[--be],pe[be]=null,Ue=pe[--be],pe[be]=null,Ne=pe[--be],pe[be]=null}function g0(t,e){pe[be++]=Ne,pe[be++]=Ue,pe[be++]=wn,Ne=e.id,Ue=e.overflow,wn=t}var Ht=null,at=null,X=!1,xn=null,Se=!1,To=Error(M(519));function Ln(t){var e=Error(M(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Za(ye(e,t)),To}function xf(t){var e=t.stateNode,n=t.type,l=t.memoizedProps;switch(e[Lt]=t,e[It]=l,n){case"dialog":G("cancel",e),G("close",e);break;case"iframe":case"object":case"embed":G("load",e);break;case"video":case"audio":for(n=0;n<Ja.length;n++)G(Ja[n],e);break;case"source":G("error",e);break;case"img":case"image":case"link":G("error",e),G("load",e);break;case"details":G("toggle",e);break;case"input":G("invalid",e),Zd(e,l.value,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name,!0);break;case"select":G("invalid",e);break;case"textarea":G("invalid",e),jd(e,l.value,l.defaultValue,l.children)}n=l.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||l.suppressHydrationWarning===!0||$g(e.textContent,n)?(l.popover!=null&&(G("beforetoggle",e),G("toggle",e)),l.onScroll!=null&&G("scroll",e),l.onScrollEnd!=null&&G("scrollend",e),l.onClick!=null&&(e.onclick=We),e=!0):e=!1,e||Ln(t,!0)}function Mf(t){for(Ht=t.return;Ht;)switch(Ht.tag){case 5:case 31:case 13:Se=!1;return;case 27:case 3:Se=!0;return;default:Ht=Ht.return}}function pl(t){if(t!==Ht)return!1;if(!X)return Mf(t),X=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||$o(t.type,t.memoizedProps)),n=!n),n&&at&&Ln(t),Mf(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(M(317));at=fd(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(M(317));at=fd(t)}else e===27?(e=at,Nn(t.type)?(t=Po,Po=null,at=t):at=e):at=Ht?xe(t.stateNode.nextSibling):null;return!0}function Wn(){at=Ht=null,X=!1}function Yc(){var t=xn;return t!==null&&(Wt===null?Wt=t:Wt.push.apply(Wt,t),xn=null),t}function Za(t){xn===null?xn=[t]:xn.push(t)}var Ao=qe(null),il=null,Fe=null;function dn(t,e,n){et(Ao,e._currentValue),e._currentValue=n}function Pe(t){t._currentValue=Ao.current,At(Ao)}function zo(t,e,n){for(;t!==null;){var l=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,l!==null&&(l.childLanes|=e)):l!==null&&(l.childLanes&e)!==e&&(l.childLanes|=e),t===n)break;t=t.return}}function Oo(t,e,n,l){var a=t.child;for(a!==null&&(a.return=t);a!==null;){var i=a.dependencies;if(i!==null){var u=a.child;i=i.firstContext;t:for(;i!==null;){var c=i;i=a;for(var o=0;o<e.length;o++)if(c.context===e[o]){i.lanes|=n,c=i.alternate,c!==null&&(c.lanes|=n),zo(i.return,n,t),l||(u=null);break t}i=c.next}}else if(a.tag===18){if(u=a.return,u===null)throw Error(M(341));u.lanes|=n,i=u.alternate,i!==null&&(i.lanes|=n),zo(u,n,t),u=null}else u=a.child;if(u!==null)u.return=a;else for(u=a;u!==null;){if(u===t){u=null;break}if(a=u.sibling,a!==null){a.return=u.return,u=a;break}u=u.return}a=u}}function Il(t,e,n,l){t=null;for(var a=e,i=!1;a!==null;){if(!i){if((a.flags&524288)!==0)i=!0;else if((a.flags&262144)!==0)break}if(a.tag===10){var u=a.alternate;if(u===null)throw Error(M(387));if(u=u.memoizedProps,u!==null){var c=a.type;oe(a.pendingProps.value,u.value)||(t!==null?t.push(c):t=[c])}}else if(a===eu.current){if(u=a.alternate,u===null)throw Error(M(387));u.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(t!==null?t.push($a):t=[$a])}a=a.return}t!==null&&Oo(e,t,n,l),e.flags|=262144}function ru(t){for(t=t.firstContext;t!==null;){if(!oe(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Fn(t){il=t,Fe=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function Ct(t){return m0(il,t)}function wi(t,e){return il===null&&Fn(t),m0(t,e)}function m0(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},Fe===null){if(t===null)throw Error(M(308));Fe=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else Fe=Fe.next=e;return n}var $p=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,l){t.push(l)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},Wp=Et.unstable_scheduleCallback,Fp=Et.unstable_NormalPriority,bt={$$typeof:$e,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function yr(){return{controller:new $p,data:new Map,refCount:0}}function ai(t){t.refCount--,t.refCount===0&&Wp(Fp,function(){t.controller.abort()})}var Ra=null,Ro=0,Vl=0,Nl=null;function Ip(t,e){if(Ra===null){var n=Ra=[];Ro=0,Vl=Qr(),Nl={status:"pending",value:void 0,then:function(l){n.push(l)}}}return Ro++,e.then(Tf,Tf),e}function Tf(){if(--Ro===0&&Ra!==null){Nl!==null&&(Nl.status="fulfilled");var t=Ra;Ra=null,Vl=0,Nl=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function Pp(t,e){var n=[],l={status:"pending",value:null,reason:null,then:function(a){n.push(a)}};return t.then(function(){l.status="fulfilled",l.value=e;for(var a=0;a<n.length;a++)(0,n[a])(e)},function(a){for(l.status="rejected",l.reason=a,a=0;a<n.length;a++)(0,n[a])(void 0)}),l}var Af=L.S;L.S=function(t,e){Rg=ae(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&Ip(t,e),Af!==null&&Af(t,e)};var Jn=qe(null);function Sr(){var t=Jn.current;return t!==null?t:P.pooledCache}function ji(t,e){e===null?et(Jn,Jn.current):et(Jn,e.pool)}function h0(){var t=Sr();return t===null?null:{parent:bt._currentValue,pool:t}}var Pl=Error(M(460)),Er=Error(M(474)),Uu=Error(M(542)),su={then:function(){}};function zf(t){return t=t.status,t==="fulfilled"||t==="rejected"}function p0(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(We,We),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,Rf(t),t;default:if(typeof e.status=="string")e.then(We,We);else{if(t=P,t!==null&&100<t.shellSuspendCounter)throw Error(M(482));t=e,t.status="pending",t.then(function(l){if(e.status==="pending"){var a=e;a.status="fulfilled",a.value=l}},function(l){if(e.status==="pending"){var a=e;a.status="rejected",a.reason=l}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,Rf(t),t}throw kn=e,Pl}}function Zn(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(kn=n,Pl):n}}var kn=null;function Of(){if(kn===null)throw Error(M(459));var t=kn;return kn=null,t}function Rf(t){if(t===Pl||t===Uu)throw Error(M(483))}var Ul=null,Qa=0;function Li(t){var e=Qa;return Qa+=1,Ul===null&&(Ul=[]),p0(Ul,t,e)}function ha(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Hi(t,e){throw e.$$typeof===qh?Error(M(525)):(t=Object.prototype.toString.call(e),Error(M(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function b0(t){function e(d,g){if(t){var p=d.deletions;p===null?(d.deletions=[g],d.flags|=16):p.push(g)}}function n(d,g){if(!t)return null;for(;g!==null;)e(d,g),g=g.sibling;return null}function l(d){for(var g=new Map;d!==null;)d.key!==null?g.set(d.key,d):g.set(d.index,d),d=d.sibling;return g}function a(d,g){return d=Ie(d,g),d.index=0,d.sibling=null,d}function i(d,g,p){return d.index=p,t?(p=d.alternate,p!==null?(p=p.index,p<g?(d.flags|=67108866,g):p):(d.flags|=67108866,g)):(d.flags|=1048576,g)}function u(d){return t&&d.alternate===null&&(d.flags|=67108866),d}function c(d,g,p,b){return g===null||g.tag!==6?(g=Gc(p,d.mode,b),g.return=d,g):(g=a(g,p),g.return=d,g)}function o(d,g,p,b){var y=p.type;return y===Sl?m(d,g,p.props.children,b,p.key):g!==null&&(g.elementType===y||typeof y=="object"&&y!==null&&y.$$typeof===sn&&Zn(y)===g.type)?(g=a(g,p.props),ha(g,p),g.return=d,g):(g=Qi(p.type,p.key,p.props,null,d.mode,b),ha(g,p),g.return=d,g)}function r(d,g,p,b){return g===null||g.tag!==4||g.stateNode.containerInfo!==p.containerInfo||g.stateNode.implementation!==p.implementation?(g=qc(p,d.mode,b),g.return=d,g):(g=a(g,p.children||[]),g.return=d,g)}function m(d,g,p,b,y){return g===null||g.tag!==7?(g=Kn(p,d.mode,b,y),g.return=d,g):(g=a(g,p),g.return=d,g)}function s(d,g,p){if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return g=Gc(""+g,d.mode,p),g.return=d,g;if(typeof g=="object"&&g!==null){switch(g.$$typeof){case xi:return p=Qi(g.type,g.key,g.props,null,d.mode,p),ha(p,g),p.return=d,p;case Sa:return g=qc(g,d.mode,p),g.return=d,g;case sn:return g=Zn(g),s(d,g,p)}if(Ea(g)||ga(g))return g=Kn(g,d.mode,p,null),g.return=d,g;if(typeof g.then=="function")return s(d,Li(g),p);if(g.$$typeof===$e)return s(d,wi(d,g),p);Hi(d,g)}return null}function f(d,g,p,b){var y=g!==null?g.key:null;if(typeof p=="string"&&p!==""||typeof p=="number"||typeof p=="bigint")return y!==null?null:c(d,g,""+p,b);if(typeof p=="object"&&p!==null){switch(p.$$typeof){case xi:return p.key===y?o(d,g,p,b):null;case Sa:return p.key===y?r(d,g,p,b):null;case sn:return p=Zn(p),f(d,g,p,b)}if(Ea(p)||ga(p))return y!==null?null:m(d,g,p,b,null);if(typeof p.then=="function")return f(d,g,Li(p),b);if(p.$$typeof===$e)return f(d,g,wi(d,p),b);Hi(d,p)}return null}function h(d,g,p,b,y){if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return d=d.get(p)||null,c(g,d,""+b,y);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case xi:return d=d.get(b.key===null?p:b.key)||null,o(g,d,b,y);case Sa:return d=d.get(b.key===null?p:b.key)||null,r(g,d,b,y);case sn:return b=Zn(b),h(d,g,p,b,y)}if(Ea(b)||ga(b))return d=d.get(p)||null,m(g,d,b,y,null);if(typeof b.then=="function")return h(d,g,p,Li(b),y);if(b.$$typeof===$e)return h(d,g,p,wi(g,b),y);Hi(g,b)}return null}function v(d,g,p,b){for(var y=null,x=null,T=g,R=g=0,D=null;T!==null&&R<p.length;R++){T.index>R?(D=T,T=null):D=T.sibling;var A=f(d,T,p[R],b);if(A===null){T===null&&(T=D);break}t&&T&&A.alternate===null&&e(d,T),g=i(A,g,R),x===null?y=A:x.sibling=A,x=A,T=D}if(R===p.length)return n(d,T),X&&Je(d,R),y;if(T===null){for(;R<p.length;R++)T=s(d,p[R],b),T!==null&&(g=i(T,g,R),x===null?y=T:x.sibling=T,x=T);return X&&Je(d,R),y}for(T=l(T);R<p.length;R++)D=h(T,d,R,p[R],b),D!==null&&(t&&D.alternate!==null&&T.delete(D.key===null?R:D.key),g=i(D,g,R),x===null?y=D:x.sibling=D,x=D);return t&&T.forEach(function(w){return e(d,w)}),X&&Je(d,R),y}function S(d,g,p,b){if(p==null)throw Error(M(151));for(var y=null,x=null,T=g,R=g=0,D=null,A=p.next();T!==null&&!A.done;R++,A=p.next()){T.index>R?(D=T,T=null):D=T.sibling;var w=f(d,T,A.value,b);if(w===null){T===null&&(T=D);break}t&&T&&w.alternate===null&&e(d,T),g=i(w,g,R),x===null?y=w:x.sibling=w,x=w,T=D}if(A.done)return n(d,T),X&&Je(d,R),y;if(T===null){for(;!A.done;R++,A=p.next())A=s(d,A.value,b),A!==null&&(g=i(A,g,R),x===null?y=A:x.sibling=A,x=A);return X&&Je(d,R),y}for(T=l(T);!A.done;R++,A=p.next())A=h(T,d,R,A.value,b),A!==null&&(t&&A.alternate!==null&&T.delete(A.key===null?R:A.key),g=i(A,g,R),x===null?y=A:x.sibling=A,x=A);return t&&T.forEach(function(Z){return e(d,Z)}),X&&Je(d,R),y}function E(d,g,p,b){if(typeof p=="object"&&p!==null&&p.type===Sl&&p.key===null&&(p=p.props.children),typeof p=="object"&&p!==null){switch(p.$$typeof){case xi:t:{for(var y=p.key;g!==null;){if(g.key===y){if(y=p.type,y===Sl){if(g.tag===7){n(d,g.sibling),b=a(g,p.props.children),b.return=d,d=b;break t}}else if(g.elementType===y||typeof y=="object"&&y!==null&&y.$$typeof===sn&&Zn(y)===g.type){n(d,g.sibling),b=a(g,p.props),ha(b,p),b.return=d,d=b;break t}n(d,g);break}else e(d,g);g=g.sibling}p.type===Sl?(b=Kn(p.props.children,d.mode,b,p.key),b.return=d,d=b):(b=Qi(p.type,p.key,p.props,null,d.mode,b),ha(b,p),b.return=d,d=b)}return u(d);case Sa:t:{for(y=p.key;g!==null;){if(g.key===y)if(g.tag===4&&g.stateNode.containerInfo===p.containerInfo&&g.stateNode.implementation===p.implementation){n(d,g.sibling),b=a(g,p.children||[]),b.return=d,d=b;break t}else{n(d,g);break}else e(d,g);g=g.sibling}b=qc(p,d.mode,b),b.return=d,d=b}return u(d);case sn:return p=Zn(p),E(d,g,p,b)}if(Ea(p))return v(d,g,p,b);if(ga(p)){if(y=ga(p),typeof y!="function")throw Error(M(150));return p=y.call(p),S(d,g,p,b)}if(typeof p.then=="function")return E(d,g,Li(p),b);if(p.$$typeof===$e)return E(d,g,wi(d,p),b);Hi(d,p)}return typeof p=="string"&&p!==""||typeof p=="number"||typeof p=="bigint"?(p=""+p,g!==null&&g.tag===6?(n(d,g.sibling),b=a(g,p),b.return=d,d=b):(n(d,g),b=Gc(p,d.mode,b),b.return=d,d=b),u(d)):n(d,g)}return function(d,g,p,b){try{Qa=0;var y=E(d,g,p,b);return Ul=null,y}catch(T){if(T===Pl||T===Uu)throw T;var x=ne(29,T,null,d.mode);return x.lanes=b,x.return=d,x}}}var In=b0(!0),v0=b0(!1),fn=!1;function xr(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Do(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function Mn(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Tn(t,e,n){var l=t.updateQueue;if(l===null)return null;if(l=l.shared,(K&2)!==0){var a=l.pending;return a===null?e.next=e:(e.next=a.next,a.next=e),l.pending=e,e=cu(t),r0(t,null,n),e}return Nu(t,l,e,n),cu(t)}function Da(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var l=e.lanes;l&=t.pendingLanes,n|=l,e.lanes=n,Ud(t,n)}}function Xc(t,e){var n=t.updateQueue,l=t.alternate;if(l!==null&&(l=l.updateQueue,n===l)){var a=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var u={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};i===null?a=i=u:i=i.next=u,n=n.next}while(n!==null);i===null?a=i=e:i=i.next=e}else a=i=e;n={baseState:l.baseState,firstBaseUpdate:a,lastBaseUpdate:i,shared:l.shared,callbacks:l.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var wo=!1;function wa(){if(wo){var t=Nl;if(t!==null)throw t}}function La(t,e,n,l){wo=!1;var a=t.updateQueue;fn=!1;var i=a.firstBaseUpdate,u=a.lastBaseUpdate,c=a.shared.pending;if(c!==null){a.shared.pending=null;var o=c,r=o.next;o.next=null,u===null?i=r:u.next=r,u=o;var m=t.alternate;m!==null&&(m=m.updateQueue,c=m.lastBaseUpdate,c!==u&&(c===null?m.firstBaseUpdate=r:c.next=r,m.lastBaseUpdate=o))}if(i!==null){var s=a.baseState;u=0,m=r=o=null,c=i;do{var f=c.lane&-536870913,h=f!==c.lane;if(h?(Y&f)===f:(l&f)===f){f!==0&&f===Vl&&(wo=!0),m!==null&&(m=m.next={lane:0,tag:c.tag,payload:c.payload,callback:null,next:null});t:{var v=t,S=c;f=e;var E=n;switch(S.tag){case 1:if(v=S.payload,typeof v=="function"){s=v.call(E,s,f);break t}s=v;break t;case 3:v.flags=v.flags&-65537|128;case 0:if(v=S.payload,f=typeof v=="function"?v.call(E,s,f):v,f==null)break t;s=it({},s,f);break t;case 2:fn=!0}}f=c.callback,f!==null&&(t.flags|=64,h&&(t.flags|=8192),h=a.callbacks,h===null?a.callbacks=[f]:h.push(f))}else h={lane:f,tag:c.tag,payload:c.payload,callback:c.callback,next:null},m===null?(r=m=h,o=s):m=m.next=h,u|=f;if(c=c.next,c===null){if(c=a.shared.pending,c===null)break;h=c,c=h.next,h.next=null,a.lastBaseUpdate=h,a.shared.pending=null}}while(!0);m===null&&(o=s),a.baseState=o,a.firstBaseUpdate=r,a.lastBaseUpdate=m,i===null&&(a.shared.lanes=0),Cn|=u,t.lanes=u,t.memoizedState=s}}function y0(t,e){if(typeof t!="function")throw Error(M(191,t));t.call(e)}function S0(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)y0(n[t],e)}var Zl=qe(null),fu=qe(0);function Df(t,e){t=un,et(fu,t),et(Zl,e),un=t|e.baseLanes}function Lo(){et(fu,un),et(Zl,Zl.current)}function Mr(){un=fu.current,At(Zl),At(fu)}var re=qe(null),Ee=null;function gn(t){var e=t.alternate;et(gt,gt.current&1),et(re,t),Ee===null&&(e===null||Zl.current!==null||e.memoizedState!==null)&&(Ee=t)}function Ho(t){et(gt,gt.current),et(re,t),Ee===null&&(Ee=t)}function E0(t){t.tag===22?(et(gt,gt.current),et(re,t),Ee===null&&(Ee=t)):mn(t)}function mn(){et(gt,gt.current),et(re,re.current)}function ee(t){At(re),Ee===t&&(Ee=null),At(gt)}var gt=qe(0);function du(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Fo(n)||Io(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if((e.flags&128)!==0)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var nn=0,_=null,I=null,ht=null,gu=!1,Bl=!1,Pn=!1,mu=0,ja=0,Gl=null,t1=0;function st(){throw Error(M(321))}function Tr(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!oe(t[n],e[n]))return!1;return!0}function Ar(t,e,n,l,a,i){return nn=i,_=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,L.H=t===null||t.memoizedState===null?I0:Ur,Pn=!1,i=n(l,a),Pn=!1,Bl&&(i=M0(e,n,l,a)),x0(t),i}function x0(t){L.H=Ka;var e=I!==null&&I.next!==null;if(nn=0,ht=I=_=null,gu=!1,ja=0,Gl=null,e)throw Error(M(300));t===null||vt||(t=t.dependencies,t!==null&&ru(t)&&(vt=!0))}function M0(t,e,n,l){_=t;var a=0;do{if(Bl&&(Gl=null),ja=0,Bl=!1,25<=a)throw Error(M(301));if(a+=1,ht=I=null,t.updateQueue!=null){var i=t.updateQueue;i.lastEffect=null,i.events=null,i.stores=null,i.memoCache!=null&&(i.memoCache.index=0)}L.H=P0,i=e(n,l)}while(Bl);return i}function e1(){var t=L.H,e=t.useState()[0];return e=typeof e.then=="function"?ii(e):e,t=t.useState()[0],(I!==null?I.memoizedState:null)!==t&&(_.flags|=1024),e}function zr(){var t=mu!==0;return mu=0,t}function Or(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function Rr(t){if(gu){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}gu=!1}nn=0,ht=I=_=null,Bl=!1,ja=mu=0,Gl=null}function Zt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ht===null?_.memoizedState=ht=t:ht=ht.next=t,ht}function mt(){if(I===null){var t=_.alternate;t=t!==null?t.memoizedState:null}else t=I.next;var e=ht===null?_.memoizedState:ht.next;if(e!==null)ht=e,I=t;else{if(t===null)throw _.alternate===null?Error(M(467)):Error(M(310));I=t,t={memoizedState:I.memoizedState,baseState:I.baseState,baseQueue:I.baseQueue,queue:I.queue,next:null},ht===null?_.memoizedState=ht=t:ht=ht.next=t}return ht}function Bu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function ii(t){var e=ja;return ja+=1,Gl===null&&(Gl=[]),t=p0(Gl,t,e),e=_,(ht===null?e.memoizedState:ht.next)===null&&(e=e.alternate,L.H=e===null||e.memoizedState===null?I0:Ur),t}function Gu(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return ii(t);if(t.$$typeof===$e)return Ct(t)}throw Error(M(438,String(t)))}function Dr(t){var e=null,n=_.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var l=_.alternate;l!==null&&(l=l.updateQueue,l!==null&&(l=l.memoCache,l!=null&&(e={data:l.data.map(function(a){return a.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Bu(),_.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),l=0;l<t;l++)n[l]=Yh;return e.index++,n}function ln(t,e){return typeof e=="function"?e(t):e}function Ki(t){var e=mt();return wr(e,I,t)}function wr(t,e,n){var l=t.queue;if(l===null)throw Error(M(311));l.lastRenderedReducer=n;var a=t.baseQueue,i=l.pending;if(i!==null){if(a!==null){var u=a.next;a.next=i.next,i.next=u}e.baseQueue=a=i,l.pending=null}if(i=t.baseState,a===null)t.memoizedState=i;else{e=a.next;var c=u=null,o=null,r=e,m=!1;do{var s=r.lane&-536870913;if(s!==r.lane?(Y&s)===s:(nn&s)===s){var f=r.revertLane;if(f===0)o!==null&&(o=o.next={lane:0,revertLane:0,gesture:null,action:r.action,hasEagerState:r.hasEagerState,eagerState:r.eagerState,next:null}),s===Vl&&(m=!0);else if((nn&f)===f){r=r.next,f===Vl&&(m=!0);continue}else s={lane:0,revertLane:r.revertLane,gesture:null,action:r.action,hasEagerState:r.hasEagerState,eagerState:r.eagerState,next:null},o===null?(c=o=s,u=i):o=o.next=s,_.lanes|=f,Cn|=f;s=r.action,Pn&&n(i,s),i=r.hasEagerState?r.eagerState:n(i,s)}else f={lane:s,revertLane:r.revertLane,gesture:r.gesture,action:r.action,hasEagerState:r.hasEagerState,eagerState:r.eagerState,next:null},o===null?(c=o=f,u=i):o=o.next=f,_.lanes|=s,Cn|=s;r=r.next}while(r!==null&&r!==e);if(o===null?u=i:o.next=c,!oe(i,t.memoizedState)&&(vt=!0,m&&(n=Nl,n!==null)))throw n;t.memoizedState=i,t.baseState=u,t.baseQueue=o,l.lastRenderedState=i}return a===null&&(l.lanes=0),[t.memoizedState,l.dispatch]}function Vc(t){var e=mt(),n=e.queue;if(n===null)throw Error(M(311));n.lastRenderedReducer=t;var l=n.dispatch,a=n.pending,i=e.memoizedState;if(a!==null){n.pending=null;var u=a=a.next;do i=t(i,u.action),u=u.next;while(u!==a);oe(i,e.memoizedState)||(vt=!0),e.memoizedState=i,e.baseQueue===null&&(e.baseState=i),n.lastRenderedState=i}return[i,l]}function T0(t,e,n){var l=_,a=mt(),i=X;if(i){if(n===void 0)throw Error(M(407));n=n()}else n=e();var u=!oe((I||a).memoizedState,n);if(u&&(a.memoizedState=n,vt=!0),a=a.queue,Lr(O0.bind(null,l,a,t),[t]),a.getSnapshot!==e||u||ht!==null&&ht.memoizedState.tag&1){if(l.flags|=2048,Ql(9,{destroy:void 0},z0.bind(null,l,a,n,e),null),P===null)throw Error(M(349));i||(nn&127)!==0||A0(l,e,n)}return n}function A0(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=_.updateQueue,e===null?(e=Bu(),_.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function z0(t,e,n,l){e.value=n,e.getSnapshot=l,R0(e)&&D0(t)}function O0(t,e,n){return n(function(){R0(e)&&D0(t)})}function R0(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!oe(t,n)}catch{return!0}}function D0(t){var e=al(t,2);e!==null&&Ft(e,t,2)}function Co(t){var e=Zt();if(typeof t=="function"){var n=t;if(t=n(),Pn){pn(!0);try{n()}finally{pn(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ln,lastRenderedState:t},e}function w0(t,e,n,l){return t.baseState=n,wr(t,I,typeof l=="function"?l:ln)}function n1(t,e,n,l,a){if(Yu(t))throw Error(M(485));if(t=e.action,t!==null){var i={payload:a,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(u){i.listeners.push(u)}};L.T!==null?n(!0):i.isTransition=!1,l(i),n=e.pending,n===null?(i.next=e.pending=i,L0(e,i)):(i.next=n.next,e.pending=n.next=i)}}function L0(t,e){var n=e.action,l=e.payload,a=t.state;if(e.isTransition){var i=L.T,u={};L.T=u;try{var c=n(a,l),o=L.S;o!==null&&o(u,c),wf(t,e,c)}catch(r){_o(t,e,r)}finally{i!==null&&u.types!==null&&(i.types=u.types),L.T=i}}else try{i=n(a,l),wf(t,e,i)}catch(r){_o(t,e,r)}}function wf(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(l){Lf(t,e,l)},function(l){return _o(t,e,l)}):Lf(t,e,n)}function Lf(t,e,n){e.status="fulfilled",e.value=n,H0(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,L0(t,n)))}function _o(t,e,n){var l=t.pending;if(t.pending=null,l!==null){l=l.next;do e.status="rejected",e.reason=n,H0(e),e=e.next;while(e!==l)}t.action=null}function H0(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function C0(t,e){return e}function Hf(t,e){if(X){var n=P.formState;if(n!==null){t:{var l=_;if(X){if(at){e:{for(var a=at,i=Se;a.nodeType!==8;){if(!i){a=null;break e}if(a=xe(a.nextSibling),a===null){a=null;break e}}i=a.data,a=i==="F!"||i==="F"?a:null}if(a){at=xe(a.nextSibling),l=a.data==="F!";break t}}Ln(l)}l=!1}l&&(e=n[0])}}return n=Zt(),n.memoizedState=n.baseState=e,l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:C0,lastRenderedState:e},n.queue=l,n=$0.bind(null,_,l),l.dispatch=n,l=Co(!1),i=Nr.bind(null,_,!1,l.queue),l=Zt(),a={state:e,dispatch:null,action:t,pending:null},l.queue=a,n=n1.bind(null,_,a,i,n),a.dispatch=n,l.memoizedState=t,[e,n,!1]}function Cf(t){var e=mt();return _0(e,I,t)}function _0(t,e,n){if(e=wr(t,e,C0)[0],t=Ki(ln)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var l=ii(e)}catch(u){throw u===Pl?Uu:u}else l=e;e=mt();var a=e.queue,i=a.dispatch;return n!==e.memoizedState&&(_.flags|=2048,Ql(9,{destroy:void 0},l1.bind(null,a,n),null)),[l,i,t]}function l1(t,e){t.action=e}function _f(t){var e=mt(),n=I;if(n!==null)return _0(e,n,t);mt(),e=e.memoizedState,n=mt();var l=n.queue.dispatch;return n.memoizedState=t,[e,l,!1]}function Ql(t,e,n,l){return t={tag:t,create:n,deps:l,inst:e,next:null},e=_.updateQueue,e===null&&(e=Bu(),_.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(l=n.next,n.next=t,t.next=l,e.lastEffect=t),t}function N0(){return mt().memoizedState}function Ji(t,e,n,l){var a=Zt();_.flags|=t,a.memoizedState=Ql(1|e,{destroy:void 0},n,l===void 0?null:l)}function qu(t,e,n,l){var a=mt();l=l===void 0?null:l;var i=a.memoizedState.inst;I!==null&&l!==null&&Tr(l,I.memoizedState.deps)?a.memoizedState=Ql(e,i,n,l):(_.flags|=t,a.memoizedState=Ql(1|e,i,n,l))}function Nf(t,e){Ji(8390656,8,t,e)}function Lr(t,e){qu(2048,8,t,e)}function a1(t){_.flags|=4;var e=_.updateQueue;if(e===null)e=Bu(),_.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function U0(t){var e=mt().memoizedState;return a1({ref:e,nextImpl:t}),function(){if((K&2)!==0)throw Error(M(440));return e.impl.apply(void 0,arguments)}}function B0(t,e){return qu(4,2,t,e)}function G0(t,e){return qu(4,4,t,e)}function q0(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Y0(t,e,n){n=n!=null?n.concat([t]):null,qu(4,4,q0.bind(null,e,t),n)}function Hr(){}function X0(t,e){var n=mt();e=e===void 0?null:e;var l=n.memoizedState;return e!==null&&Tr(e,l[1])?l[0]:(n.memoizedState=[t,e],t)}function V0(t,e){var n=mt();e=e===void 0?null:e;var l=n.memoizedState;if(e!==null&&Tr(e,l[1]))return l[0];if(l=t(),Pn){pn(!0);try{t()}finally{pn(!1)}}return n.memoizedState=[l,e],l}function Cr(t,e,n){return n===void 0||(nn&1073741824)!==0&&(Y&261930)===0?t.memoizedState=e:(t.memoizedState=n,t=wg(),_.lanes|=t,Cn|=t,n)}function Z0(t,e,n,l){return oe(n,e)?n:Zl.current!==null?(t=Cr(t,n,l),oe(t,e)||(vt=!0),t):(nn&42)===0||(nn&1073741824)!==0&&(Y&261930)===0?(vt=!0,t.memoizedState=n):(t=wg(),_.lanes|=t,Cn|=t,e)}function Q0(t,e,n,l,a){var i=J.p;J.p=i!==0&&8>i?i:8;var u=L.T,c={};L.T=c,Nr(t,!1,e,n);try{var o=a(),r=L.S;if(r!==null&&r(c,o),o!==null&&typeof o=="object"&&typeof o.then=="function"){var m=Pp(o,l);Ha(t,e,m,ce(t))}else Ha(t,e,l,ce(t))}catch(s){Ha(t,e,{then:function(){},status:"rejected",reason:s},ce())}finally{J.p=i,u!==null&&c.types!==null&&(u.types=c.types),L.T=u}}function i1(){}function No(t,e,n,l){if(t.tag!==5)throw Error(M(476));var a=j0(t).queue;Q0(t,a,e,jn,n===null?i1:function(){return K0(t),n(l)})}function j0(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:jn,baseState:jn,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ln,lastRenderedState:jn},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ln,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function K0(t){var e=j0(t);e.next===null&&(e=t.alternate.memoizedState),Ha(t,e.next.queue,{},ce())}function _r(){return Ct($a)}function J0(){return mt().memoizedState}function k0(){return mt().memoizedState}function u1(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=ce();t=Mn(n);var l=Tn(e,t,n);l!==null&&(Ft(l,e,n),Da(l,e,n)),e={cache:yr()},t.payload=e;return}e=e.return}}function c1(t,e,n){var l=ce();n={lane:l,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Yu(t)?W0(e,n):(n=hr(t,e,n,l),n!==null&&(Ft(n,t,l),F0(n,e,l)))}function $0(t,e,n){var l=ce();Ha(t,e,n,l)}function Ha(t,e,n,l){var a={lane:l,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Yu(t))W0(e,a);else{var i=t.alternate;if(t.lanes===0&&(i===null||i.lanes===0)&&(i=e.lastRenderedReducer,i!==null))try{var u=e.lastRenderedState,c=i(u,n);if(a.hasEagerState=!0,a.eagerState=c,oe(c,u))return Nu(t,e,a,0),P===null&&_u(),!1}catch{}if(n=hr(t,e,a,l),n!==null)return Ft(n,t,l),F0(n,e,l),!0}return!1}function Nr(t,e,n,l){if(l={lane:2,revertLane:Qr(),gesture:null,action:l,hasEagerState:!1,eagerState:null,next:null},Yu(t)){if(e)throw Error(M(479))}else e=hr(t,n,l,2),e!==null&&Ft(e,t,2)}function Yu(t){var e=t.alternate;return t===_||e!==null&&e===_}function W0(t,e){Bl=gu=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function F0(t,e,n){if((n&4194048)!==0){var l=e.lanes;l&=t.pendingLanes,n|=l,e.lanes=n,Ud(t,n)}}var Ka={readContext:Ct,use:Gu,useCallback:st,useContext:st,useEffect:st,useImperativeHandle:st,useLayoutEffect:st,useInsertionEffect:st,useMemo:st,useReducer:st,useRef:st,useState:st,useDebugValue:st,useDeferredValue:st,useTransition:st,useSyncExternalStore:st,useId:st,useHostTransitionStatus:st,useFormState:st,useActionState:st,useOptimistic:st,useMemoCache:st,useCacheRefresh:st};Ka.useEffectEvent=st;var I0={readContext:Ct,use:Gu,useCallback:function(t,e){return Zt().memoizedState=[t,e===void 0?null:e],t},useContext:Ct,useEffect:Nf,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,Ji(4194308,4,q0.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Ji(4194308,4,t,e)},useInsertionEffect:function(t,e){Ji(4,2,t,e)},useMemo:function(t,e){var n=Zt();e=e===void 0?null:e;var l=t();if(Pn){pn(!0);try{t()}finally{pn(!1)}}return n.memoizedState=[l,e],l},useReducer:function(t,e,n){var l=Zt();if(n!==void 0){var a=n(e);if(Pn){pn(!0);try{n(e)}finally{pn(!1)}}}else a=e;return l.memoizedState=l.baseState=a,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:a},l.queue=t,t=t.dispatch=c1.bind(null,_,t),[l.memoizedState,t]},useRef:function(t){var e=Zt();return t={current:t},e.memoizedState=t},useState:function(t){t=Co(t);var e=t.queue,n=$0.bind(null,_,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Hr,useDeferredValue:function(t,e){var n=Zt();return Cr(n,t,e)},useTransition:function(){var t=Co(!1);return t=Q0.bind(null,_,t.queue,!0,!1),Zt().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var l=_,a=Zt();if(X){if(n===void 0)throw Error(M(407));n=n()}else{if(n=e(),P===null)throw Error(M(349));(Y&127)!==0||A0(l,e,n)}a.memoizedState=n;var i={value:n,getSnapshot:e};return a.queue=i,Nf(O0.bind(null,l,i,t),[t]),l.flags|=2048,Ql(9,{destroy:void 0},z0.bind(null,l,i,n,e),null),n},useId:function(){var t=Zt(),e=P.identifierPrefix;if(X){var n=Ue,l=Ne;n=(l&~(1<<32-ue(l)-1)).toString(32)+n,e="_"+e+"R_"+n,n=mu++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=t1++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:_r,useFormState:Hf,useActionState:Hf,useOptimistic:function(t){var e=Zt();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=Nr.bind(null,_,!0,n),n.dispatch=e,[t,e]},useMemoCache:Dr,useCacheRefresh:function(){return Zt().memoizedState=u1.bind(null,_)},useEffectEvent:function(t){var e=Zt(),n={impl:t};return e.memoizedState=n,function(){if((K&2)!==0)throw Error(M(440));return n.impl.apply(void 0,arguments)}}},Ur={readContext:Ct,use:Gu,useCallback:X0,useContext:Ct,useEffect:Lr,useImperativeHandle:Y0,useInsertionEffect:B0,useLayoutEffect:G0,useMemo:V0,useReducer:Ki,useRef:N0,useState:function(){return Ki(ln)},useDebugValue:Hr,useDeferredValue:function(t,e){var n=mt();return Z0(n,I.memoizedState,t,e)},useTransition:function(){var t=Ki(ln)[0],e=mt().memoizedState;return[typeof t=="boolean"?t:ii(t),e]},useSyncExternalStore:T0,useId:J0,useHostTransitionStatus:_r,useFormState:Cf,useActionState:Cf,useOptimistic:function(t,e){var n=mt();return w0(n,I,t,e)},useMemoCache:Dr,useCacheRefresh:k0};Ur.useEffectEvent=U0;var P0={readContext:Ct,use:Gu,useCallback:X0,useContext:Ct,useEffect:Lr,useImperativeHandle:Y0,useInsertionEffect:B0,useLayoutEffect:G0,useMemo:V0,useReducer:Vc,useRef:N0,useState:function(){return Vc(ln)},useDebugValue:Hr,useDeferredValue:function(t,e){var n=mt();return I===null?Cr(n,t,e):Z0(n,I.memoizedState,t,e)},useTransition:function(){var t=Vc(ln)[0],e=mt().memoizedState;return[typeof t=="boolean"?t:ii(t),e]},useSyncExternalStore:T0,useId:J0,useHostTransitionStatus:_r,useFormState:_f,useActionState:_f,useOptimistic:function(t,e){var n=mt();return I!==null?w0(n,I,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:Dr,useCacheRefresh:k0};P0.useEffectEvent=U0;function Zc(t,e,n,l){e=t.memoizedState,n=n(l,e),n=n==null?e:it({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Uo={enqueueSetState:function(t,e,n){t=t._reactInternals;var l=ce(),a=Mn(l);a.payload=e,n!=null&&(a.callback=n),e=Tn(t,a,l),e!==null&&(Ft(e,t,l),Da(e,t,l))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var l=ce(),a=Mn(l);a.tag=1,a.payload=e,n!=null&&(a.callback=n),e=Tn(t,a,l),e!==null&&(Ft(e,t,l),Da(e,t,l))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=ce(),l=Mn(n);l.tag=2,e!=null&&(l.callback=e),e=Tn(t,l,n),e!==null&&(Ft(e,t,n),Da(e,t,n))}};function Uf(t,e,n,l,a,i,u){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(l,i,u):e.prototype&&e.prototype.isPureReactComponent?!Xa(n,l)||!Xa(a,i):!0}function Bf(t,e,n,l){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,l),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,l),e.state!==t&&Uo.enqueueReplaceState(e,e.state,null)}function tl(t,e){var n=e;if("ref"in e){n={};for(var l in e)l!=="ref"&&(n[l]=e[l])}if(t=t.defaultProps){n===e&&(n=it({},n));for(var a in t)n[a]===void 0&&(n[a]=t[a])}return n}function tg(t){uu(t)}function eg(t){console.error(t)}function ng(t){uu(t)}function hu(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(l){setTimeout(function(){throw l})}}function Gf(t,e,n){try{var l=t.onCaughtError;l(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(a){setTimeout(function(){throw a})}}function Bo(t,e,n){return n=Mn(n),n.tag=3,n.payload={element:null},n.callback=function(){hu(t,e)},n}function lg(t){return t=Mn(t),t.tag=3,t}function ag(t,e,n,l){var a=n.type.getDerivedStateFromError;if(typeof a=="function"){var i=l.value;t.payload=function(){return a(i)},t.callback=function(){Gf(e,n,l)}}var u=n.stateNode;u!==null&&typeof u.componentDidCatch=="function"&&(t.callback=function(){Gf(e,n,l),typeof a!="function"&&(An===null?An=new Set([this]):An.add(this));var c=l.stack;this.componentDidCatch(l.value,{componentStack:c!==null?c:""})})}function o1(t,e,n,l,a){if(n.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){if(e=n.alternate,e!==null&&Il(e,n,a,!0),n=re.current,n!==null){switch(n.tag){case 31:case 13:return Ee===null?Su():n.alternate===null&&ft===0&&(ft=3),n.flags&=-257,n.flags|=65536,n.lanes=a,l===su?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([l]):e.add(l),to(t,l,a)),!1;case 22:return n.flags|=65536,l===su?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([l])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([l]):n.add(l)),to(t,l,a)),!1}throw Error(M(435,n.tag))}return to(t,l,a),Su(),!1}if(X)return e=re.current,e!==null?((e.flags&65536)===0&&(e.flags|=256),e.flags|=65536,e.lanes=a,l!==To&&(t=Error(M(422),{cause:l}),Za(ye(t,n)))):(l!==To&&(e=Error(M(423),{cause:l}),Za(ye(e,n))),t=t.current.alternate,t.flags|=65536,a&=-a,t.lanes|=a,l=ye(l,n),a=Bo(t.stateNode,l,a),Xc(t,a),ft!==4&&(ft=2)),!1;var i=Error(M(520),{cause:l});if(i=ye(i,n),Na===null?Na=[i]:Na.push(i),ft!==4&&(ft=2),e===null)return!0;l=ye(l,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=a&-a,n.lanes|=t,t=Bo(n.stateNode,l,t),Xc(n,t),!1;case 1:if(e=n.type,i=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||i!==null&&typeof i.componentDidCatch=="function"&&(An===null||!An.has(i))))return n.flags|=65536,a&=-a,n.lanes|=a,a=lg(a),ag(a,t,n,l),Xc(n,a),!1}n=n.return}while(n!==null);return!1}var Br=Error(M(461)),vt=!1;function wt(t,e,n,l){e.child=t===null?v0(e,null,n,l):In(e,t.child,n,l)}function qf(t,e,n,l,a){n=n.render;var i=e.ref;if("ref"in l){var u={};for(var c in l)c!=="ref"&&(u[c]=l[c])}else u=l;return Fn(e),l=Ar(t,e,n,u,i,a),c=zr(),t!==null&&!vt?(Or(t,e,a),an(t,e,a)):(X&&c&&br(e),e.flags|=1,wt(t,e,l,a),e.child)}function Yf(t,e,n,l,a){if(t===null){var i=n.type;return typeof i=="function"&&!pr(i)&&i.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=i,ig(t,e,i,l,a)):(t=Qi(n.type,null,l,e,e.mode,a),t.ref=e.ref,t.return=e,e.child=t)}if(i=t.child,!Gr(t,a)){var u=i.memoizedProps;if(n=n.compare,n=n!==null?n:Xa,n(u,l)&&t.ref===e.ref)return an(t,e,a)}return e.flags|=1,t=Ie(i,l),t.ref=e.ref,t.return=e,e.child=t}function ig(t,e,n,l,a){if(t!==null){var i=t.memoizedProps;if(Xa(i,l)&&t.ref===e.ref)if(vt=!1,e.pendingProps=l=i,Gr(t,a))(t.flags&131072)!==0&&(vt=!0);else return e.lanes=t.lanes,an(t,e,a)}return Go(t,e,n,l,a)}function ug(t,e,n,l){var a=l.children,i=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),l.mode==="hidden"){if((e.flags&128)!==0){if(i=i!==null?i.baseLanes|n:n,t!==null){for(l=e.child=t.child,a=0;l!==null;)a=a|l.lanes|l.childLanes,l=l.sibling;l=a&~i}else l=0,e.child=null;return Xf(t,e,i,n,l)}if((n&536870912)!==0)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&ji(e,i!==null?i.cachePool:null),i!==null?Df(e,i):Lo(),E0(e);else return l=e.lanes=536870912,Xf(t,e,i!==null?i.baseLanes|n:n,n,l)}else i!==null?(ji(e,i.cachePool),Df(e,i),mn(e),e.memoizedState=null):(t!==null&&ji(e,null),Lo(),mn(e));return wt(t,e,a,n),e.child}function Ma(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function Xf(t,e,n,l,a){var i=Sr();return i=i===null?null:{parent:bt._currentValue,pool:i},e.memoizedState={baseLanes:n,cachePool:i},t!==null&&ji(e,null),Lo(),E0(e),t!==null&&Il(t,e,l,!0),e.childLanes=a,null}function ki(t,e){return e=pu({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function Vf(t,e,n){return In(e,t.child,null,n),t=ki(e,e.pendingProps),t.flags|=2,ee(e),e.memoizedState=null,t}function r1(t,e,n){var l=e.pendingProps,a=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(X){if(l.mode==="hidden")return t=ki(e,l),e.lanes=536870912,Ma(null,t);if(Ho(e),(t=at)?(t=Ig(t,Se),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:wn!==null?{id:Ne,overflow:Ue}:null,retryLane:536870912,hydrationErrors:null},n=f0(t),n.return=e,e.child=n,Ht=e,at=null)):t=null,t===null)throw Ln(e);return e.lanes=536870912,null}return ki(e,l)}var i=t.memoizedState;if(i!==null){var u=i.dehydrated;if(Ho(e),a)if(e.flags&256)e.flags&=-257,e=Vf(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(M(558));else if(vt||Il(t,e,n,!1),a=(n&t.childLanes)!==0,vt||a){if(l=P,l!==null&&(u=Bd(l,n),u!==0&&u!==i.retryLane))throw i.retryLane=u,al(t,u),Ft(l,t,u),Br;Su(),e=Vf(t,e,n)}else t=i.treeContext,at=xe(u.nextSibling),Ht=e,X=!0,xn=null,Se=!1,t!==null&&g0(e,t),e=ki(e,l),e.flags|=4096;return e}return t=Ie(t.child,{mode:l.mode,children:l.children}),t.ref=e.ref,e.child=t,t.return=e,t}function $i(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(M(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Go(t,e,n,l,a){return Fn(e),n=Ar(t,e,n,l,void 0,a),l=zr(),t!==null&&!vt?(Or(t,e,a),an(t,e,a)):(X&&l&&br(e),e.flags|=1,wt(t,e,n,a),e.child)}function Zf(t,e,n,l,a,i){return Fn(e),e.updateQueue=null,n=M0(e,l,n,a),x0(t),l=zr(),t!==null&&!vt?(Or(t,e,i),an(t,e,i)):(X&&l&&br(e),e.flags|=1,wt(t,e,n,i),e.child)}function Qf(t,e,n,l,a){if(Fn(e),e.stateNode===null){var i=Rl,u=n.contextType;typeof u=="object"&&u!==null&&(i=Ct(u)),i=new n(l,i),e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Uo,e.stateNode=i,i._reactInternals=e,i=e.stateNode,i.props=l,i.state=e.memoizedState,i.refs={},xr(e),u=n.contextType,i.context=typeof u=="object"&&u!==null?Ct(u):Rl,i.state=e.memoizedState,u=n.getDerivedStateFromProps,typeof u=="function"&&(Zc(e,n,u,l),i.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(u=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),u!==i.state&&Uo.enqueueReplaceState(i,i.state,null),La(e,l,i,a),wa(),i.state=e.memoizedState),typeof i.componentDidMount=="function"&&(e.flags|=4194308),l=!0}else if(t===null){i=e.stateNode;var c=e.memoizedProps,o=tl(n,c);i.props=o;var r=i.context,m=n.contextType;u=Rl,typeof m=="object"&&m!==null&&(u=Ct(m));var s=n.getDerivedStateFromProps;m=typeof s=="function"||typeof i.getSnapshotBeforeUpdate=="function",c=e.pendingProps!==c,m||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(c||r!==u)&&Bf(e,i,l,u),fn=!1;var f=e.memoizedState;i.state=f,La(e,l,i,a),wa(),r=e.memoizedState,c||f!==r||fn?(typeof s=="function"&&(Zc(e,n,s,l),r=e.memoizedState),(o=fn||Uf(e,n,o,l,f,r,u))?(m||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(e.flags|=4194308)):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=l,e.memoizedState=r),i.props=l,i.state=r,i.context=u,l=o):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),l=!1)}else{i=e.stateNode,Do(t,e),u=e.memoizedProps,m=tl(n,u),i.props=m,s=e.pendingProps,f=i.context,r=n.contextType,o=Rl,typeof r=="object"&&r!==null&&(o=Ct(r)),c=n.getDerivedStateFromProps,(r=typeof c=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(u!==s||f!==o)&&Bf(e,i,l,o),fn=!1,f=e.memoizedState,i.state=f,La(e,l,i,a),wa();var h=e.memoizedState;u!==s||f!==h||fn||t!==null&&t.dependencies!==null&&ru(t.dependencies)?(typeof c=="function"&&(Zc(e,n,c,l),h=e.memoizedState),(m=fn||Uf(e,n,m,l,f,h,o)||t!==null&&t.dependencies!==null&&ru(t.dependencies))?(r||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(l,h,o),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(l,h,o)),typeof i.componentDidUpdate=="function"&&(e.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof i.componentDidUpdate!="function"||u===t.memoizedProps&&f===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===t.memoizedProps&&f===t.memoizedState||(e.flags|=1024),e.memoizedProps=l,e.memoizedState=h),i.props=l,i.state=h,i.context=o,l=m):(typeof i.componentDidUpdate!="function"||u===t.memoizedProps&&f===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===t.memoizedProps&&f===t.memoizedState||(e.flags|=1024),l=!1)}return i=l,$i(t,e),l=(e.flags&128)!==0,i||l?(i=e.stateNode,n=l&&typeof n.getDerivedStateFromError!="function"?null:i.render(),e.flags|=1,t!==null&&l?(e.child=In(e,t.child,null,a),e.child=In(e,null,n,a)):wt(t,e,n,a),e.memoizedState=i.state,t=e.child):t=an(t,e,a),t}function jf(t,e,n,l){return Wn(),e.flags|=256,wt(t,e,n,l),e.child}var Qc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function jc(t){return{baseLanes:t,cachePool:h0()}}function Kc(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=le),t}function cg(t,e,n){var l=e.pendingProps,a=!1,i=(e.flags&128)!==0,u;if((u=i)||(u=t!==null&&t.memoizedState===null?!1:(gt.current&2)!==0),u&&(a=!0,e.flags&=-129),u=(e.flags&32)!==0,e.flags&=-33,t===null){if(X){if(a?gn(e):mn(e),(t=at)?(t=Ig(t,Se),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:wn!==null?{id:Ne,overflow:Ue}:null,retryLane:536870912,hydrationErrors:null},n=f0(t),n.return=e,e.child=n,Ht=e,at=null)):t=null,t===null)throw Ln(e);return Io(t)?e.lanes=32:e.lanes=536870912,null}var c=l.children;return l=l.fallback,a?(mn(e),a=e.mode,c=pu({mode:"hidden",children:c},a),l=Kn(l,a,n,null),c.return=e,l.return=e,c.sibling=l,e.child=c,l=e.child,l.memoizedState=jc(n),l.childLanes=Kc(t,u,n),e.memoizedState=Qc,Ma(null,l)):(gn(e),qo(e,c))}var o=t.memoizedState;if(o!==null&&(c=o.dehydrated,c!==null)){if(i)e.flags&256?(gn(e),e.flags&=-257,e=Jc(t,e,n)):e.memoizedState!==null?(mn(e),e.child=t.child,e.flags|=128,e=null):(mn(e),c=l.fallback,a=e.mode,l=pu({mode:"visible",children:l.children},a),c=Kn(c,a,n,null),c.flags|=2,l.return=e,c.return=e,l.sibling=c,e.child=l,In(e,t.child,null,n),l=e.child,l.memoizedState=jc(n),l.childLanes=Kc(t,u,n),e.memoizedState=Qc,e=Ma(null,l));else if(gn(e),Io(c)){if(u=c.nextSibling&&c.nextSibling.dataset,u)var r=u.dgst;u=r,l=Error(M(419)),l.stack="",l.digest=u,Za({value:l,source:null,stack:null}),e=Jc(t,e,n)}else if(vt||Il(t,e,n,!1),u=(n&t.childLanes)!==0,vt||u){if(u=P,u!==null&&(l=Bd(u,n),l!==0&&l!==o.retryLane))throw o.retryLane=l,al(t,l),Ft(u,t,l),Br;Fo(c)||Su(),e=Jc(t,e,n)}else Fo(c)?(e.flags|=192,e.child=t.child,e=null):(t=o.treeContext,at=xe(c.nextSibling),Ht=e,X=!0,xn=null,Se=!1,t!==null&&g0(e,t),e=qo(e,l.children),e.flags|=4096);return e}return a?(mn(e),c=l.fallback,a=e.mode,o=t.child,r=o.sibling,l=Ie(o,{mode:"hidden",children:l.children}),l.subtreeFlags=o.subtreeFlags&65011712,r!==null?c=Ie(r,c):(c=Kn(c,a,n,null),c.flags|=2),c.return=e,l.return=e,l.sibling=c,e.child=l,Ma(null,l),l=e.child,c=t.child.memoizedState,c===null?c=jc(n):(a=c.cachePool,a!==null?(o=bt._currentValue,a=a.parent!==o?{parent:o,pool:o}:a):a=h0(),c={baseLanes:c.baseLanes|n,cachePool:a}),l.memoizedState=c,l.childLanes=Kc(t,u,n),e.memoizedState=Qc,Ma(t.child,l)):(gn(e),n=t.child,t=n.sibling,n=Ie(n,{mode:"visible",children:l.children}),n.return=e,n.sibling=null,t!==null&&(u=e.deletions,u===null?(e.deletions=[t],e.flags|=16):u.push(t)),e.child=n,e.memoizedState=null,n)}function qo(t,e){return e=pu({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function pu(t,e){return t=ne(22,t,null,e),t.lanes=0,t}function Jc(t,e,n){return In(e,t.child,null,n),t=qo(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Kf(t,e,n){t.lanes|=e;var l=t.alternate;l!==null&&(l.lanes|=e),zo(t.return,e,n)}function kc(t,e,n,l,a,i){var u=t.memoizedState;u===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:l,tail:n,tailMode:a,treeForkCount:i}:(u.isBackwards=e,u.rendering=null,u.renderingStartTime=0,u.last=l,u.tail=n,u.tailMode=a,u.treeForkCount=i)}function og(t,e,n){var l=e.pendingProps,a=l.revealOrder,i=l.tail;l=l.children;var u=gt.current,c=(u&2)!==0;if(c?(u=u&1|2,e.flags|=128):u&=1,et(gt,u),wt(t,e,l,n),l=X?Va:0,!c&&t!==null&&(t.flags&128)!==0)t:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Kf(t,n,e);else if(t.tag===19)Kf(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(a){case"forwards":for(n=e.child,a=null;n!==null;)t=n.alternate,t!==null&&du(t)===null&&(a=n),n=n.sibling;n=a,n===null?(a=e.child,e.child=null):(a=n.sibling,n.sibling=null),kc(e,!1,a,n,i,l);break;case"backwards":case"unstable_legacy-backwards":for(n=null,a=e.child,e.child=null;a!==null;){if(t=a.alternate,t!==null&&du(t)===null){e.child=a;break}t=a.sibling,a.sibling=n,n=a,a=t}kc(e,!0,n,null,i,l);break;case"together":kc(e,!1,null,null,void 0,l);break;default:e.memoizedState=null}return e.child}function an(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Cn|=e.lanes,(n&e.childLanes)===0)if(t!==null){if(Il(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(M(153));if(e.child!==null){for(t=e.child,n=Ie(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Ie(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Gr(t,e){return(t.lanes&e)!==0?!0:(t=t.dependencies,!!(t!==null&&ru(t)))}function s1(t,e,n){switch(e.tag){case 3:nu(e,e.stateNode.containerInfo),dn(e,bt,t.memoizedState.cache),Wn();break;case 27:case 5:go(e);break;case 4:nu(e,e.stateNode.containerInfo);break;case 10:dn(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Ho(e),null;break;case 13:var l=e.memoizedState;if(l!==null)return l.dehydrated!==null?(gn(e),e.flags|=128,null):(n&e.child.childLanes)!==0?cg(t,e,n):(gn(e),t=an(t,e,n),t!==null?t.sibling:null);gn(e);break;case 19:var a=(t.flags&128)!==0;if(l=(n&e.childLanes)!==0,l||(Il(t,e,n,!1),l=(n&e.childLanes)!==0),a){if(l)return og(t,e,n);e.flags|=128}if(a=e.memoizedState,a!==null&&(a.rendering=null,a.tail=null,a.lastEffect=null),et(gt,gt.current),l)break;return null;case 22:return e.lanes=0,ug(t,e,n,e.pendingProps);case 24:dn(e,bt,t.memoizedState.cache)}return an(t,e,n)}function rg(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)vt=!0;else{if(!Gr(t,n)&&(e.flags&128)===0)return vt=!1,s1(t,e,n);vt=(t.flags&131072)!==0}else vt=!1,X&&(e.flags&1048576)!==0&&d0(e,Va,e.index);switch(e.lanes=0,e.tag){case 16:t:{var l=e.pendingProps;if(t=Zn(e.elementType),e.type=t,typeof t=="function")pr(t)?(l=tl(t,l),e.tag=1,e=Qf(null,e,t,l,n)):(e.tag=0,e=Go(null,e,t,l,n));else{if(t!=null){var a=t.$$typeof;if(a===nr){e.tag=11,e=qf(null,e,t,l,n);break t}else if(a===lr){e.tag=14,e=Yf(null,e,t,l,n);break t}}throw e=so(t)||t,Error(M(306,e,""))}}return e;case 0:return Go(t,e,e.type,e.pendingProps,n);case 1:return l=e.type,a=tl(l,e.pendingProps),Qf(t,e,l,a,n);case 3:t:{if(nu(e,e.stateNode.containerInfo),t===null)throw Error(M(387));l=e.pendingProps;var i=e.memoizedState;a=i.element,Do(t,e),La(e,l,null,n);var u=e.memoizedState;if(l=u.cache,dn(e,bt,l),l!==i.cache&&Oo(e,[bt],n,!0),wa(),l=u.element,i.isDehydrated)if(i={element:l,isDehydrated:!1,cache:u.cache},e.updateQueue.baseState=i,e.memoizedState=i,e.flags&256){e=jf(t,e,l,n);break t}else if(l!==a){a=ye(Error(M(424)),e),Za(a),e=jf(t,e,l,n);break t}else for(t=e.stateNode.containerInfo,t.nodeType===9?t=t.body:t=t.nodeName==="HTML"?t.ownerDocument.body:t,at=xe(t.firstChild),Ht=e,X=!0,xn=null,Se=!0,n=v0(e,null,l,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Wn(),l===a){e=an(t,e,n);break t}wt(t,e,l,n)}e=e.child}return e;case 26:return $i(t,e),t===null?(n=md(e.type,null,e.pendingProps,null))?e.memoizedState=n:X||(n=e.type,t=e.pendingProps,l=Tu(En.current).createElement(n),l[Lt]=e,l[It]=t,_t(l,n,t),Tt(l),e.stateNode=l):e.memoizedState=md(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return go(e),t===null&&X&&(l=e.stateNode=Pg(e.type,e.pendingProps,En.current),Ht=e,Se=!0,a=at,Nn(e.type)?(Po=a,at=xe(l.firstChild)):at=a),wt(t,e,e.pendingProps.children,n),$i(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&X&&((a=l=at)&&(l=G1(l,e.type,e.pendingProps,Se),l!==null?(e.stateNode=l,Ht=e,at=xe(l.firstChild),Se=!1,a=!0):a=!1),a||Ln(e)),go(e),a=e.type,i=e.pendingProps,u=t!==null?t.memoizedProps:null,l=i.children,$o(a,i)?l=null:u!==null&&$o(a,u)&&(e.flags|=32),e.memoizedState!==null&&(a=Ar(t,e,e1,null,null,n),$a._currentValue=a),$i(t,e),wt(t,e,l,n),e.child;case 6:return t===null&&X&&((t=n=at)&&(n=q1(n,e.pendingProps,Se),n!==null?(e.stateNode=n,Ht=e,at=null,t=!0):t=!1),t||Ln(e)),null;case 13:return cg(t,e,n);case 4:return nu(e,e.stateNode.containerInfo),l=e.pendingProps,t===null?e.child=In(e,null,l,n):wt(t,e,l,n),e.child;case 11:return qf(t,e,e.type,e.pendingProps,n);case 7:return wt(t,e,e.pendingProps,n),e.child;case 8:return wt(t,e,e.pendingProps.children,n),e.child;case 12:return wt(t,e,e.pendingProps.children,n),e.child;case 10:return l=e.pendingProps,dn(e,e.type,l.value),wt(t,e,l.children,n),e.child;case 9:return a=e.type._context,l=e.pendingProps.children,Fn(e),a=Ct(a),l=l(a),e.flags|=1,wt(t,e,l,n),e.child;case 14:return Yf(t,e,e.type,e.pendingProps,n);case 15:return ig(t,e,e.type,e.pendingProps,n);case 19:return og(t,e,n);case 31:return r1(t,e,n);case 22:return ug(t,e,n,e.pendingProps);case 24:return Fn(e),l=Ct(bt),t===null?(a=Sr(),a===null&&(a=P,i=yr(),a.pooledCache=i,i.refCount++,i!==null&&(a.pooledCacheLanes|=n),a=i),e.memoizedState={parent:l,cache:a},xr(e),dn(e,bt,a)):((t.lanes&n)!==0&&(Do(t,e),La(e,null,null,n),wa()),a=t.memoizedState,i=e.memoizedState,a.parent!==l?(a={parent:l,cache:l},e.memoizedState=a,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=a),dn(e,bt,l)):(l=i.cache,dn(e,bt,l),l!==a.cache&&Oo(e,[bt],n,!0))),wt(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(M(156,e.tag))}function Ze(t){t.flags|=4}function $c(t,e,n,l,a){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(a&335544128)===a)if(t.stateNode.complete)t.flags|=8192;else if(Cg())t.flags|=8192;else throw kn=su,Er}else t.flags&=-16777217}function Jf(t,e){if(e.type!=="stylesheet"||(e.state.loading&4)!==0)t.flags&=-16777217;else if(t.flags|=16777216,!nm(e))if(Cg())t.flags|=8192;else throw kn=su,Er}function Ci(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?_d():536870912,t.lanes|=e,jl|=e)}function pa(t,e){if(!X)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var l=null;n!==null;)n.alternate!==null&&(l=n),n=n.sibling;l===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:l.sibling=null}}function lt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,l=0;if(e)for(var a=t.child;a!==null;)n|=a.lanes|a.childLanes,l|=a.subtreeFlags&65011712,l|=a.flags&65011712,a.return=t,a=a.sibling;else for(a=t.child;a!==null;)n|=a.lanes|a.childLanes,l|=a.subtreeFlags,l|=a.flags,a.return=t,a=a.sibling;return t.subtreeFlags|=l,t.childLanes=n,e}function f1(t,e,n){var l=e.pendingProps;switch(vr(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return lt(e),null;case 1:return lt(e),null;case 3:return n=e.stateNode,l=null,t!==null&&(l=t.memoizedState.cache),e.memoizedState.cache!==l&&(e.flags|=2048),Pe(bt),ql(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(pl(e)?Ze(e):t===null||t.memoizedState.isDehydrated&&(e.flags&256)===0||(e.flags|=1024,Yc())),lt(e),null;case 26:var a=e.type,i=e.memoizedState;return t===null?(Ze(e),i!==null?(lt(e),Jf(e,i)):(lt(e),$c(e,a,null,l,n))):i?i!==t.memoizedState?(Ze(e),lt(e),Jf(e,i)):(lt(e),e.flags&=-16777217):(t=t.memoizedProps,t!==l&&Ze(e),lt(e),$c(e,a,t,l,n)),null;case 27:if(lu(e),n=En.current,a=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==l&&Ze(e);else{if(!l){if(e.stateNode===null)throw Error(M(166));return lt(e),null}t=Ge.current,pl(e)?xf(e,t):(t=Pg(a,l,n),e.stateNode=t,Ze(e))}return lt(e),null;case 5:if(lu(e),a=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==l&&Ze(e);else{if(!l){if(e.stateNode===null)throw Error(M(166));return lt(e),null}if(i=Ge.current,pl(e))xf(e,i);else{var u=Tu(En.current);switch(i){case 1:i=u.createElementNS("http://www.w3.org/2000/svg",a);break;case 2:i=u.createElementNS("http://www.w3.org/1998/Math/MathML",a);break;default:switch(a){case"svg":i=u.createElementNS("http://www.w3.org/2000/svg",a);break;case"math":i=u.createElementNS("http://www.w3.org/1998/Math/MathML",a);break;case"script":i=u.createElement("div"),i.innerHTML="<script><\/script>",i=i.removeChild(i.firstChild);break;case"select":i=typeof l.is=="string"?u.createElement("select",{is:l.is}):u.createElement("select"),l.multiple?i.multiple=!0:l.size&&(i.size=l.size);break;default:i=typeof l.is=="string"?u.createElement(a,{is:l.is}):u.createElement(a)}}i[Lt]=e,i[It]=l;t:for(u=e.child;u!==null;){if(u.tag===5||u.tag===6)i.appendChild(u.stateNode);else if(u.tag!==4&&u.tag!==27&&u.child!==null){u.child.return=u,u=u.child;continue}if(u===e)break t;for(;u.sibling===null;){if(u.return===null||u.return===e)break t;u=u.return}u.sibling.return=u.return,u=u.sibling}e.stateNode=i;t:switch(_t(i,a,l),a){case"button":case"input":case"select":case"textarea":l=!!l.autoFocus;break t;case"img":l=!0;break t;default:l=!1}l&&Ze(e)}}return lt(e),$c(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==l&&Ze(e);else{if(typeof l!="string"&&e.stateNode===null)throw Error(M(166));if(t=En.current,pl(e)){if(t=e.stateNode,n=e.memoizedProps,l=null,a=Ht,a!==null)switch(a.tag){case 27:case 5:l=a.memoizedProps}t[Lt]=e,t=!!(t.nodeValue===n||l!==null&&l.suppressHydrationWarning===!0||$g(t.nodeValue,n)),t||Ln(e,!0)}else t=Tu(t).createTextNode(l),t[Lt]=e,e.stateNode=t}return lt(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(l=pl(e),n!==null){if(t===null){if(!l)throw Error(M(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(M(557));t[Lt]=e}else Wn(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;lt(e),t=!1}else n=Yc(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(ee(e),e):(ee(e),null);if((e.flags&128)!==0)throw Error(M(558))}return lt(e),null;case 13:if(l=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(a=pl(e),l!==null&&l.dehydrated!==null){if(t===null){if(!a)throw Error(M(318));if(a=e.memoizedState,a=a!==null?a.dehydrated:null,!a)throw Error(M(317));a[Lt]=e}else Wn(),(e.flags&128)===0&&(e.memoizedState=null),e.flags|=4;lt(e),a=!1}else a=Yc(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=a),a=!0;if(!a)return e.flags&256?(ee(e),e):(ee(e),null)}return ee(e),(e.flags&128)!==0?(e.lanes=n,e):(n=l!==null,t=t!==null&&t.memoizedState!==null,n&&(l=e.child,a=null,l.alternate!==null&&l.alternate.memoizedState!==null&&l.alternate.memoizedState.cachePool!==null&&(a=l.alternate.memoizedState.cachePool.pool),i=null,l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(i=l.memoizedState.cachePool.pool),i!==a&&(l.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Ci(e,e.updateQueue),lt(e),null);case 4:return ql(),t===null&&jr(e.stateNode.containerInfo),lt(e),null;case 10:return Pe(e.type),lt(e),null;case 19:if(At(gt),l=e.memoizedState,l===null)return lt(e),null;if(a=(e.flags&128)!==0,i=l.rendering,i===null)if(a)pa(l,!1);else{if(ft!==0||t!==null&&(t.flags&128)!==0)for(t=e.child;t!==null;){if(i=du(t),i!==null){for(e.flags|=128,pa(l,!1),t=i.updateQueue,e.updateQueue=t,Ci(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)s0(n,t),n=n.sibling;return et(gt,gt.current&1|2),X&&Je(e,l.treeForkCount),e.child}t=t.sibling}l.tail!==null&&ae()>vu&&(e.flags|=128,a=!0,pa(l,!1),e.lanes=4194304)}else{if(!a)if(t=du(i),t!==null){if(e.flags|=128,a=!0,t=t.updateQueue,e.updateQueue=t,Ci(e,t),pa(l,!0),l.tail===null&&l.tailMode==="hidden"&&!i.alternate&&!X)return lt(e),null}else 2*ae()-l.renderingStartTime>vu&&n!==536870912&&(e.flags|=128,a=!0,pa(l,!1),e.lanes=4194304);l.isBackwards?(i.sibling=e.child,e.child=i):(t=l.last,t!==null?t.sibling=i:e.child=i,l.last=i)}return l.tail!==null?(t=l.tail,l.rendering=t,l.tail=t.sibling,l.renderingStartTime=ae(),t.sibling=null,n=gt.current,et(gt,a?n&1|2:n&1),X&&Je(e,l.treeForkCount),t):(lt(e),null);case 22:case 23:return ee(e),Mr(),l=e.memoizedState!==null,t!==null?t.memoizedState!==null!==l&&(e.flags|=8192):l&&(e.flags|=8192),l?(n&536870912)!==0&&(e.flags&128)===0&&(lt(e),e.subtreeFlags&6&&(e.flags|=8192)):lt(e),n=e.updateQueue,n!==null&&Ci(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),l=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(l=e.memoizedState.cachePool.pool),l!==n&&(e.flags|=2048),t!==null&&At(Jn),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),Pe(bt),lt(e),null;case 25:return null;case 30:return null}throw Error(M(156,e.tag))}function d1(t,e){switch(vr(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Pe(bt),ql(),t=e.flags,(t&65536)!==0&&(t&128)===0?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return lu(e),null;case 31:if(e.memoizedState!==null){if(ee(e),e.alternate===null)throw Error(M(340));Wn()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(ee(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(M(340));Wn()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return At(gt),null;case 4:return ql(),null;case 10:return Pe(e.type),null;case 22:case 23:return ee(e),Mr(),t!==null&&At(Jn),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Pe(bt),null;case 25:return null;default:return null}}function sg(t,e){switch(vr(e),e.tag){case 3:Pe(bt),ql();break;case 26:case 27:case 5:lu(e);break;case 4:ql();break;case 31:e.memoizedState!==null&&ee(e);break;case 13:ee(e);break;case 19:At(gt);break;case 10:Pe(e.type);break;case 22:case 23:ee(e),Mr(),t!==null&&At(Jn);break;case 24:Pe(bt)}}function ui(t,e){try{var n=e.updateQueue,l=n!==null?n.lastEffect:null;if(l!==null){var a=l.next;n=a;do{if((n.tag&t)===t){l=void 0;var i=n.create,u=n.inst;l=i(),u.destroy=l}n=n.next}while(n!==a)}}catch(c){$(e,e.return,c)}}function Hn(t,e,n){try{var l=e.updateQueue,a=l!==null?l.lastEffect:null;if(a!==null){var i=a.next;l=i;do{if((l.tag&t)===t){var u=l.inst,c=u.destroy;if(c!==void 0){u.destroy=void 0,a=e;var o=n,r=c;try{r()}catch(m){$(a,o,m)}}}l=l.next}while(l!==i)}}catch(m){$(e,e.return,m)}}function fg(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{S0(e,n)}catch(l){$(t,t.return,l)}}}function dg(t,e,n){n.props=tl(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(l){$(t,e,l)}}function Ca(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var l=t.stateNode;break;case 30:l=t.stateNode;break;default:l=t.stateNode}typeof n=="function"?t.refCleanup=n(l):n.current=l}}catch(a){$(t,e,a)}}function Be(t,e){var n=t.ref,l=t.refCleanup;if(n!==null)if(typeof l=="function")try{l()}catch(a){$(t,e,a)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(a){$(t,e,a)}else n.current=null}function gg(t){var e=t.type,n=t.memoizedProps,l=t.stateNode;try{t:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&l.focus();break t;case"img":n.src?l.src=n.src:n.srcSet&&(l.srcset=n.srcSet)}}catch(a){$(t,t.return,a)}}function Wc(t,e,n){try{var l=t.stateNode;H1(l,t.type,n,e),l[It]=e}catch(a){$(t,t.return,a)}}function mg(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Nn(t.type)||t.tag===4}function Fc(t){t:for(;;){for(;t.sibling===null;){if(t.return===null||mg(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Nn(t.type)||t.flags&2||t.child===null||t.tag===4)continue t;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Yo(t,e,n){var l=t.tag;if(l===5||l===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=We));else if(l!==4&&(l===27&&Nn(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(Yo(t,e,n),t=t.sibling;t!==null;)Yo(t,e,n),t=t.sibling}function bu(t,e,n){var l=t.tag;if(l===5||l===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(l!==4&&(l===27&&Nn(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(bu(t,e,n),t=t.sibling;t!==null;)bu(t,e,n),t=t.sibling}function hg(t){var e=t.stateNode,n=t.memoizedProps;try{for(var l=t.type,a=e.attributes;a.length;)e.removeAttributeNode(a[0]);_t(e,l,n),e[Lt]=t,e[It]=n}catch(i){$(t,t.return,i)}}var ke=!1,pt=!1,Ic=!1,kf=typeof WeakSet=="function"?WeakSet:Set,Mt=null;function g1(t,e){if(t=t.containerInfo,Jo=Ru,t=n0(t),gr(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else t:{n=(n=t.ownerDocument)&&n.defaultView||window;var l=n.getSelection&&n.getSelection();if(l&&l.rangeCount!==0){n=l.anchorNode;var a=l.anchorOffset,i=l.focusNode;l=l.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break t}var u=0,c=-1,o=-1,r=0,m=0,s=t,f=null;e:for(;;){for(var h;s!==n||a!==0&&s.nodeType!==3||(c=u+a),s!==i||l!==0&&s.nodeType!==3||(o=u+l),s.nodeType===3&&(u+=s.nodeValue.length),(h=s.firstChild)!==null;)f=s,s=h;for(;;){if(s===t)break e;if(f===n&&++r===a&&(c=u),f===i&&++m===l&&(o=u),(h=s.nextSibling)!==null)break;s=f,f=s.parentNode}s=h}n=c===-1||o===-1?null:{start:c,end:o}}else n=null}n=n||{start:0,end:0}}else n=null;for(ko={focusedElem:t,selectionRange:n},Ru=!1,Mt=e;Mt!==null;)if(e=Mt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Mt=t;else for(;Mt!==null;){switch(e=Mt,i=e.alternate,t=e.flags,e.tag){case 0:if((t&4)!==0&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)a=t[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if((t&1024)!==0&&i!==null){t=void 0,n=e,a=i.memoizedProps,i=i.memoizedState,l=n.stateNode;try{var v=tl(n.type,a);t=l.getSnapshotBeforeUpdate(v,i),l.__reactInternalSnapshotBeforeUpdate=t}catch(S){$(n,n.return,S)}}break;case 3:if((t&1024)!==0){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Wo(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Wo(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((t&1024)!==0)throw Error(M(163))}if(t=e.sibling,t!==null){t.return=e.return,Mt=t;break}Mt=e.return}}function pg(t,e,n){var l=n.flags;switch(n.tag){case 0:case 11:case 15:je(t,n),l&4&&ui(5,n);break;case 1:if(je(t,n),l&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(u){$(n,n.return,u)}else{var a=tl(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(a,e,t.__reactInternalSnapshotBeforeUpdate)}catch(u){$(n,n.return,u)}}l&64&&fg(n),l&512&&Ca(n,n.return);break;case 3:if(je(t,n),l&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{S0(t,e)}catch(u){$(n,n.return,u)}}break;case 27:e===null&&l&4&&hg(n);case 26:case 5:je(t,n),e===null&&l&4&&gg(n),l&512&&Ca(n,n.return);break;case 12:je(t,n);break;case 31:je(t,n),l&4&&yg(t,n);break;case 13:je(t,n),l&4&&Sg(t,n),l&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=x1.bind(null,n),Y1(t,n))));break;case 22:if(l=n.memoizedState!==null||ke,!l){e=e!==null&&e.memoizedState!==null||pt,a=ke;var i=pt;ke=l,(pt=e)&&!i?Ke(t,n,(n.subtreeFlags&8772)!==0):je(t,n),ke=a,pt=i}break;case 30:break;default:je(t,n)}}function bg(t){var e=t.alternate;e!==null&&(t.alternate=null,bg(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&cr(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var ct=null,$t=!1;function Qe(t,e,n){for(n=n.child;n!==null;)vg(t,e,n),n=n.sibling}function vg(t,e,n){if(ie&&typeof ie.onCommitFiberUnmount=="function")try{ie.onCommitFiberUnmount(Pa,n)}catch{}switch(n.tag){case 26:pt||Be(n,e),Qe(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:pt||Be(n,e);var l=ct,a=$t;Nn(n.type)&&(ct=n.stateNode,$t=!1),Qe(t,e,n),Ba(n.stateNode),ct=l,$t=a;break;case 5:pt||Be(n,e);case 6:if(l=ct,a=$t,ct=null,Qe(t,e,n),ct=l,$t=a,ct!==null)if($t)try{(ct.nodeType===9?ct.body:ct.nodeName==="HTML"?ct.ownerDocument.body:ct).removeChild(n.stateNode)}catch(i){$(n,e,i)}else try{ct.removeChild(n.stateNode)}catch(i){$(n,e,i)}break;case 18:ct!==null&&($t?(t=ct,rd(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),$l(t)):rd(ct,n.stateNode));break;case 4:l=ct,a=$t,ct=n.stateNode.containerInfo,$t=!0,Qe(t,e,n),ct=l,$t=a;break;case 0:case 11:case 14:case 15:Hn(2,n,e),pt||Hn(4,n,e),Qe(t,e,n);break;case 1:pt||(Be(n,e),l=n.stateNode,typeof l.componentWillUnmount=="function"&&dg(n,e,l)),Qe(t,e,n);break;case 21:Qe(t,e,n);break;case 22:pt=(l=pt)||n.memoizedState!==null,Qe(t,e,n),pt=l;break;default:Qe(t,e,n)}}function yg(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{$l(t)}catch(n){$(e,e.return,n)}}}function Sg(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{$l(t)}catch(n){$(e,e.return,n)}}function m1(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new kf),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new kf),e;default:throw Error(M(435,t.tag))}}function _i(t,e){var n=m1(t);e.forEach(function(l){if(!n.has(l)){n.add(l);var a=M1.bind(null,t,l);l.then(a,a)}})}function Jt(t,e){var n=e.deletions;if(n!==null)for(var l=0;l<n.length;l++){var a=n[l],i=t,u=e,c=u;t:for(;c!==null;){switch(c.tag){case 27:if(Nn(c.type)){ct=c.stateNode,$t=!1;break t}break;case 5:ct=c.stateNode,$t=!1;break t;case 3:case 4:ct=c.stateNode.containerInfo,$t=!0;break t}c=c.return}if(ct===null)throw Error(M(160));vg(i,u,a),ct=null,$t=!1,i=a.alternate,i!==null&&(i.return=null),a.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)Eg(e,t),e=e.sibling}var Re=null;function Eg(t,e){var n=t.alternate,l=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Jt(e,t),kt(t),l&4&&(Hn(3,t,t.return),ui(3,t),Hn(5,t,t.return));break;case 1:Jt(e,t),kt(t),l&512&&(pt||n===null||Be(n,n.return)),l&64&&ke&&(t=t.updateQueue,t!==null&&(l=t.callbacks,l!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?l:n.concat(l))));break;case 26:var a=Re;if(Jt(e,t),kt(t),l&512&&(pt||n===null||Be(n,n.return)),l&4){var i=n!==null?n.memoizedState:null;if(l=t.memoizedState,n===null)if(l===null)if(t.stateNode===null){t:{l=t.type,n=t.memoizedProps,a=a.ownerDocument||a;e:switch(l){case"title":i=a.getElementsByTagName("title")[0],(!i||i[ni]||i[Lt]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=a.createElement(l),a.head.insertBefore(i,a.querySelector("head > title"))),_t(i,l,n),i[Lt]=t,Tt(i),l=i;break t;case"link":var u=pd("link","href",a).get(l+(n.href||""));if(u){for(var c=0;c<u.length;c++)if(i=u[c],i.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&i.getAttribute("rel")===(n.rel==null?null:n.rel)&&i.getAttribute("title")===(n.title==null?null:n.title)&&i.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){u.splice(c,1);break e}}i=a.createElement(l),_t(i,l,n),a.head.appendChild(i);break;case"meta":if(u=pd("meta","content",a).get(l+(n.content||""))){for(c=0;c<u.length;c++)if(i=u[c],i.getAttribute("content")===(n.content==null?null:""+n.content)&&i.getAttribute("name")===(n.name==null?null:n.name)&&i.getAttribute("property")===(n.property==null?null:n.property)&&i.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&i.getAttribute("charset")===(n.charSet==null?null:n.charSet)){u.splice(c,1);break e}}i=a.createElement(l),_t(i,l,n),a.head.appendChild(i);break;default:throw Error(M(468,l))}i[Lt]=t,Tt(i),l=i}t.stateNode=l}else bd(a,t.type,t.stateNode);else t.stateNode=hd(a,l,t.memoizedProps);else i!==l?(i===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):i.count--,l===null?bd(a,t.type,t.stateNode):hd(a,l,t.memoizedProps)):l===null&&t.stateNode!==null&&Wc(t,t.memoizedProps,n.memoizedProps)}break;case 27:Jt(e,t),kt(t),l&512&&(pt||n===null||Be(n,n.return)),n!==null&&l&4&&Wc(t,t.memoizedProps,n.memoizedProps);break;case 5:if(Jt(e,t),kt(t),l&512&&(pt||n===null||Be(n,n.return)),t.flags&32){a=t.stateNode;try{Xl(a,"")}catch(v){$(t,t.return,v)}}l&4&&t.stateNode!=null&&(a=t.memoizedProps,Wc(t,a,n!==null?n.memoizedProps:a)),l&1024&&(Ic=!0);break;case 6:if(Jt(e,t),kt(t),l&4){if(t.stateNode===null)throw Error(M(162));l=t.memoizedProps,n=t.stateNode;try{n.nodeValue=l}catch(v){$(t,t.return,v)}}break;case 3:if(Ii=null,a=Re,Re=Au(e.containerInfo),Jt(e,t),Re=a,kt(t),l&4&&n!==null&&n.memoizedState.isDehydrated)try{$l(e.containerInfo)}catch(v){$(t,t.return,v)}Ic&&(Ic=!1,xg(t));break;case 4:l=Re,Re=Au(t.stateNode.containerInfo),Jt(e,t),kt(t),Re=l;break;case 12:Jt(e,t),kt(t);break;case 31:Jt(e,t),kt(t),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,_i(t,l)));break;case 13:Jt(e,t),kt(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Xu=ae()),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,_i(t,l)));break;case 22:a=t.memoizedState!==null;var o=n!==null&&n.memoizedState!==null,r=ke,m=pt;if(ke=r||a,pt=m||o,Jt(e,t),pt=m,ke=r,kt(t),l&8192)t:for(e=t.stateNode,e._visibility=a?e._visibility&-2:e._visibility|1,a&&(n===null||o||ke||pt||Qn(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){o=n=e;try{if(i=o.stateNode,a)u=i.style,typeof u.setProperty=="function"?u.setProperty("display","none","important"):u.display="none";else{c=o.stateNode;var s=o.memoizedProps.style,f=s!=null&&s.hasOwnProperty("display")?s.display:null;c.style.display=f==null||typeof f=="boolean"?"":(""+f).trim()}}catch(v){$(o,o.return,v)}}}else if(e.tag===6){if(n===null){o=e;try{o.stateNode.nodeValue=a?"":o.memoizedProps}catch(v){$(o,o.return,v)}}}else if(e.tag===18){if(n===null){o=e;try{var h=o.stateNode;a?sd(h,!0):sd(o.stateNode,!1)}catch(v){$(o,o.return,v)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}l&4&&(l=t.updateQueue,l!==null&&(n=l.retryQueue,n!==null&&(l.retryQueue=null,_i(t,n))));break;case 19:Jt(e,t),kt(t),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,_i(t,l)));break;case 30:break;case 21:break;default:Jt(e,t),kt(t)}}function kt(t){var e=t.flags;if(e&2){try{for(var n,l=t.return;l!==null;){if(mg(l)){n=l;break}l=l.return}if(n==null)throw Error(M(160));switch(n.tag){case 27:var a=n.stateNode,i=Fc(t);bu(t,i,a);break;case 5:var u=n.stateNode;n.flags&32&&(Xl(u,""),n.flags&=-33);var c=Fc(t);bu(t,c,u);break;case 3:case 4:var o=n.stateNode.containerInfo,r=Fc(t);Yo(t,r,o);break;default:throw Error(M(161))}}catch(m){$(t,t.return,m)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function xg(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;xg(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function je(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)pg(t,e.alternate,e),e=e.sibling}function Qn(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Hn(4,e,e.return),Qn(e);break;case 1:Be(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&dg(e,e.return,n),Qn(e);break;case 27:Ba(e.stateNode);case 26:case 5:Be(e,e.return),Qn(e);break;case 22:e.memoizedState===null&&Qn(e);break;case 30:Qn(e);break;default:Qn(e)}t=t.sibling}}function Ke(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var l=e.alternate,a=t,i=e,u=i.flags;switch(i.tag){case 0:case 11:case 15:Ke(a,i,n),ui(4,i);break;case 1:if(Ke(a,i,n),l=i,a=l.stateNode,typeof a.componentDidMount=="function")try{a.componentDidMount()}catch(r){$(l,l.return,r)}if(l=i,a=l.updateQueue,a!==null){var c=l.stateNode;try{var o=a.shared.hiddenCallbacks;if(o!==null)for(a.shared.hiddenCallbacks=null,a=0;a<o.length;a++)y0(o[a],c)}catch(r){$(l,l.return,r)}}n&&u&64&&fg(i),Ca(i,i.return);break;case 27:hg(i);case 26:case 5:Ke(a,i,n),n&&l===null&&u&4&&gg(i),Ca(i,i.return);break;case 12:Ke(a,i,n);break;case 31:Ke(a,i,n),n&&u&4&&yg(a,i);break;case 13:Ke(a,i,n),n&&u&4&&Sg(a,i);break;case 22:i.memoizedState===null&&Ke(a,i,n),Ca(i,i.return);break;case 30:break;default:Ke(a,i,n)}e=e.sibling}}function qr(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&ai(n))}function Yr(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&ai(t))}function Oe(t,e,n,l){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Mg(t,e,n,l),e=e.sibling}function Mg(t,e,n,l){var a=e.flags;switch(e.tag){case 0:case 11:case 15:Oe(t,e,n,l),a&2048&&ui(9,e);break;case 1:Oe(t,e,n,l);break;case 3:Oe(t,e,n,l),a&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&ai(t)));break;case 12:if(a&2048){Oe(t,e,n,l),t=e.stateNode;try{var i=e.memoizedProps,u=i.id,c=i.onPostCommit;typeof c=="function"&&c(u,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(o){$(e,e.return,o)}}else Oe(t,e,n,l);break;case 31:Oe(t,e,n,l);break;case 13:Oe(t,e,n,l);break;case 23:break;case 22:i=e.stateNode,u=e.alternate,e.memoizedState!==null?i._visibility&2?Oe(t,e,n,l):_a(t,e):i._visibility&2?Oe(t,e,n,l):(i._visibility|=2,vl(t,e,n,l,(e.subtreeFlags&10256)!==0||!1)),a&2048&&qr(u,e);break;case 24:Oe(t,e,n,l),a&2048&&Yr(e.alternate,e);break;default:Oe(t,e,n,l)}}function vl(t,e,n,l,a){for(a=a&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var i=t,u=e,c=n,o=l,r=u.flags;switch(u.tag){case 0:case 11:case 15:vl(i,u,c,o,a),ui(8,u);break;case 23:break;case 22:var m=u.stateNode;u.memoizedState!==null?m._visibility&2?vl(i,u,c,o,a):_a(i,u):(m._visibility|=2,vl(i,u,c,o,a)),a&&r&2048&&qr(u.alternate,u);break;case 24:vl(i,u,c,o,a),a&&r&2048&&Yr(u.alternate,u);break;default:vl(i,u,c,o,a)}e=e.sibling}}function _a(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,l=e,a=l.flags;switch(l.tag){case 22:_a(n,l),a&2048&&qr(l.alternate,l);break;case 24:_a(n,l),a&2048&&Yr(l.alternate,l);break;default:_a(n,l)}e=e.sibling}}var Ta=8192;function bl(t,e,n){if(t.subtreeFlags&Ta)for(t=t.child;t!==null;)Tg(t,e,n),t=t.sibling}function Tg(t,e,n){switch(t.tag){case 26:bl(t,e,n),t.flags&Ta&&t.memoizedState!==null&&I1(n,Re,t.memoizedState,t.memoizedProps);break;case 5:bl(t,e,n);break;case 3:case 4:var l=Re;Re=Au(t.stateNode.containerInfo),bl(t,e,n),Re=l;break;case 22:t.memoizedState===null&&(l=t.alternate,l!==null&&l.memoizedState!==null?(l=Ta,Ta=16777216,bl(t,e,n),Ta=l):bl(t,e,n));break;default:bl(t,e,n)}}function Ag(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function ba(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var l=e[n];Mt=l,Og(l,t)}Ag(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)zg(t),t=t.sibling}function zg(t){switch(t.tag){case 0:case 11:case 15:ba(t),t.flags&2048&&Hn(9,t,t.return);break;case 3:ba(t);break;case 12:ba(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,Wi(t)):ba(t);break;default:ba(t)}}function Wi(t){var e=t.deletions;if((t.flags&16)!==0){if(e!==null)for(var n=0;n<e.length;n++){var l=e[n];Mt=l,Og(l,t)}Ag(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Hn(8,e,e.return),Wi(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,Wi(e));break;default:Wi(e)}t=t.sibling}}function Og(t,e){for(;Mt!==null;){var n=Mt;switch(n.tag){case 0:case 11:case 15:Hn(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var l=n.memoizedState.cachePool.pool;l!=null&&l.refCount++}break;case 24:ai(n.memoizedState.cache)}if(l=n.child,l!==null)l.return=n,Mt=l;else t:for(n=t;Mt!==null;){l=Mt;var a=l.sibling,i=l.return;if(bg(l),l===n){Mt=null;break t}if(a!==null){a.return=i,Mt=a;break t}Mt=i}}}var h1={getCacheForType:function(t){var e=Ct(bt),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return Ct(bt).controller.signal}},p1=typeof WeakMap=="function"?WeakMap:Map,K=0,P=null,q=null,Y=0,k=0,te=null,vn=!1,ta=!1,Xr=!1,un=0,ft=0,Cn=0,$n=0,Vr=0,le=0,jl=0,Na=null,Wt=null,Xo=!1,Xu=0,Rg=0,vu=1/0,yu=null,An=null,St=0,zn=null,Kl=null,tn=0,Vo=0,Zo=null,Dg=null,Ua=0,Qo=null;function ce(){return(K&2)!==0&&Y!==0?Y&-Y:L.T!==null?Qr():Gd()}function wg(){if(le===0)if((Y&536870912)===0||X){var t=Ti;Ti<<=1,(Ti&3932160)===0&&(Ti=262144),le=t}else le=536870912;return t=re.current,t!==null&&(t.flags|=32),le}function Ft(t,e,n){(t===P&&(k===2||k===9)||t.cancelPendingCommit!==null)&&(Jl(t,0),yn(t,Y,le,!1)),ei(t,n),((K&2)===0||t!==P)&&(t===P&&((K&2)===0&&($n|=n),ft===4&&yn(t,Y,le,!1)),Ye(t))}function Lg(t,e,n){if((K&6)!==0)throw Error(M(327));var l=!n&&(e&127)===0&&(e&t.expiredLanes)===0||ti(t,e),a=l?y1(t,e):Pc(t,e,!0),i=l;do{if(a===0){ta&&!l&&yn(t,e,0,!1);break}else{if(n=t.current.alternate,i&&!b1(n)){a=Pc(t,e,!1),i=!1;continue}if(a===2){if(i=e,t.errorRecoveryDisabledLanes&i)var u=0;else u=t.pendingLanes&-536870913,u=u!==0?u:u&536870912?536870912:0;if(u!==0){e=u;t:{var c=t;a=Na;var o=c.current.memoizedState.isDehydrated;if(o&&(Jl(c,u).flags|=256),u=Pc(c,u,!1),u!==2){if(Xr&&!o){c.errorRecoveryDisabledLanes|=i,$n|=i,a=4;break t}i=Wt,Wt=a,i!==null&&(Wt===null?Wt=i:Wt.push.apply(Wt,i))}a=u}if(i=!1,a!==2)continue}}if(a===1){Jl(t,0),yn(t,e,0,!0);break}t:{switch(l=t,i=a,i){case 0:case 1:throw Error(M(345));case 4:if((e&4194048)!==e)break;case 6:yn(l,e,le,!vn);break t;case 2:Wt=null;break;case 3:case 5:break;default:throw Error(M(329))}if((e&62914560)===e&&(a=Xu+300-ae(),10<a)){if(yn(l,e,le,!vn),wu(l,0,!0)!==0)break t;tn=e,l.timeoutHandle=Fg($f.bind(null,l,n,Wt,yu,Xo,e,le,$n,jl,vn,i,"Throttled",-0,0),a);break t}$f(l,n,Wt,yu,Xo,e,le,$n,jl,vn,i,null,-0,0)}}break}while(!0);Ye(t)}function $f(t,e,n,l,a,i,u,c,o,r,m,s,f,h){if(t.timeoutHandle=-1,s=e.subtreeFlags,s&8192||(s&16785408)===16785408){s={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:We},Tg(e,i,s);var v=(i&62914560)===i?Xu-ae():(i&4194048)===i?Rg-ae():0;if(v=P1(s,v),v!==null){tn=i,t.cancelPendingCommit=v(Ff.bind(null,t,e,i,n,l,a,u,c,o,m,s,null,f,h)),yn(t,i,u,!r);return}}Ff(t,e,i,n,l,a,u,c,o)}function b1(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var l=0;l<n.length;l++){var a=n[l],i=a.getSnapshot;a=a.value;try{if(!oe(i(),a))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function yn(t,e,n,l){e&=~Vr,e&=~$n,t.suspendedLanes|=e,t.pingedLanes&=~e,l&&(t.warmLanes|=e),l=t.expirationTimes;for(var a=e;0<a;){var i=31-ue(a),u=1<<i;l[i]=-1,a&=~u}n!==0&&Nd(t,n,e)}function Vu(){return(K&6)===0?(ci(0,!1),!1):!0}function Zr(){if(q!==null){if(k===0)var t=q.return;else t=q,Fe=il=null,Rr(t),Ul=null,Qa=0,t=q;for(;t!==null;)sg(t.alternate,t),t=t.return;q=null}}function Jl(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,N1(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),tn=0,Zr(),P=t,q=n=Ie(t.current,null),Y=e,k=0,te=null,vn=!1,ta=ti(t,e),Xr=!1,jl=le=Vr=$n=Cn=ft=0,Wt=Na=null,Xo=!1,(e&8)!==0&&(e|=e&32);var l=t.entangledLanes;if(l!==0)for(t=t.entanglements,l&=e;0<l;){var a=31-ue(l),i=1<<a;e|=t[a],l&=~i}return un=e,_u(),n}function Hg(t,e){_=null,L.H=Ka,e===Pl||e===Uu?(e=Of(),k=3):e===Er?(e=Of(),k=4):k=e===Br?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,te=e,q===null&&(ft=1,hu(t,ye(e,t.current)))}function Cg(){var t=re.current;return t===null?!0:(Y&4194048)===Y?Ee===null:(Y&62914560)===Y||(Y&536870912)!==0?t===Ee:!1}function _g(){var t=L.H;return L.H=Ka,t===null?Ka:t}function Ng(){var t=L.A;return L.A=h1,t}function Su(){ft=4,vn||(Y&4194048)!==Y&&re.current!==null||(ta=!0),(Cn&134217727)===0&&($n&134217727)===0||P===null||yn(P,Y,le,!1)}function Pc(t,e,n){var l=K;K|=2;var a=_g(),i=Ng();(P!==t||Y!==e)&&(yu=null,Jl(t,e)),e=!1;var u=ft;t:do try{if(k!==0&&q!==null){var c=q,o=te;switch(k){case 8:Zr(),u=6;break t;case 3:case 2:case 9:case 6:re.current===null&&(e=!0);var r=k;if(k=0,te=null,Ll(t,c,o,r),n&&ta){u=0;break t}break;default:r=k,k=0,te=null,Ll(t,c,o,r)}}v1(),u=ft;break}catch(m){Hg(t,m)}while(!0);return e&&t.shellSuspendCounter++,Fe=il=null,K=l,L.H=a,L.A=i,q===null&&(P=null,Y=0,_u()),u}function v1(){for(;q!==null;)Ug(q)}function y1(t,e){var n=K;K|=2;var l=_g(),a=Ng();P!==t||Y!==e?(yu=null,vu=ae()+500,Jl(t,e)):ta=ti(t,e);t:do try{if(k!==0&&q!==null){e=q;var i=te;e:switch(k){case 1:k=0,te=null,Ll(t,e,i,1);break;case 2:case 9:if(zf(i)){k=0,te=null,Wf(e);break}e=function(){k!==2&&k!==9||P!==t||(k=7),Ye(t)},i.then(e,e);break t;case 3:k=7;break t;case 4:k=5;break t;case 7:zf(i)?(k=0,te=null,Wf(e)):(k=0,te=null,Ll(t,e,i,7));break;case 5:var u=null;switch(q.tag){case 26:u=q.memoizedState;case 5:case 27:var c=q;if(u?nm(u):c.stateNode.complete){k=0,te=null;var o=c.sibling;if(o!==null)q=o;else{var r=c.return;r!==null?(q=r,Zu(r)):q=null}break e}}k=0,te=null,Ll(t,e,i,5);break;case 6:k=0,te=null,Ll(t,e,i,6);break;case 8:Zr(),ft=6;break t;default:throw Error(M(462))}}S1();break}catch(m){Hg(t,m)}while(!0);return Fe=il=null,L.H=l,L.A=a,K=n,q!==null?0:(P=null,Y=0,_u(),ft)}function S1(){for(;q!==null&&!Zh();)Ug(q)}function Ug(t){var e=rg(t.alternate,t,un);t.memoizedProps=t.pendingProps,e===null?Zu(t):q=e}function Wf(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=Zf(n,e,e.pendingProps,e.type,void 0,Y);break;case 11:e=Zf(n,e,e.pendingProps,e.type.render,e.ref,Y);break;case 5:Rr(e);default:sg(n,e),e=q=s0(e,un),e=rg(n,e,un)}t.memoizedProps=t.pendingProps,e===null?Zu(t):q=e}function Ll(t,e,n,l){Fe=il=null,Rr(e),Ul=null,Qa=0;var a=e.return;try{if(o1(t,a,e,n,Y)){ft=1,hu(t,ye(n,t.current)),q=null;return}}catch(i){if(a!==null)throw q=a,i;ft=1,hu(t,ye(n,t.current)),q=null;return}e.flags&32768?(X||l===1?t=!0:ta||(Y&536870912)!==0?t=!1:(vn=t=!0,(l===2||l===9||l===3||l===6)&&(l=re.current,l!==null&&l.tag===13&&(l.flags|=16384))),Bg(e,t)):Zu(e)}function Zu(t){var e=t;do{if((e.flags&32768)!==0){Bg(e,vn);return}t=e.return;var n=f1(e.alternate,e,un);if(n!==null){q=n;return}if(e=e.sibling,e!==null){q=e;return}q=e=t}while(e!==null);ft===0&&(ft=5)}function Bg(t,e){do{var n=d1(t.alternate,t);if(n!==null){n.flags&=32767,q=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){q=t;return}q=t=n}while(t!==null);ft=6,q=null}function Ff(t,e,n,l,a,i,u,c,o){t.cancelPendingCommit=null;do Qu();while(St!==0);if((K&6)!==0)throw Error(M(327));if(e!==null){if(e===t.current)throw Error(M(177));if(i=e.lanes|e.childLanes,i|=mr,Ph(t,n,i,u,c,o),t===P&&(q=P=null,Y=0),Kl=e,zn=t,tn=n,Vo=i,Zo=a,Dg=l,(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?(t.callbackNode=null,t.callbackPriority=0,T1(au,function(){return Vg(),null})):(t.callbackNode=null,t.callbackPriority=0),l=(e.flags&13878)!==0,(e.subtreeFlags&13878)!==0||l){l=L.T,L.T=null,a=J.p,J.p=2,u=K,K|=4;try{g1(t,e,n)}finally{K=u,J.p=a,L.T=l}}St=1,Gg(),qg(),Yg()}}function Gg(){if(St===1){St=0;var t=zn,e=Kl,n=(e.flags&13878)!==0;if((e.subtreeFlags&13878)!==0||n){n=L.T,L.T=null;var l=J.p;J.p=2;var a=K;K|=4;try{Eg(e,t);var i=ko,u=n0(t.containerInfo),c=i.focusedElem,o=i.selectionRange;if(u!==c&&c&&c.ownerDocument&&e0(c.ownerDocument.documentElement,c)){if(o!==null&&gr(c)){var r=o.start,m=o.end;if(m===void 0&&(m=r),"selectionStart"in c)c.selectionStart=r,c.selectionEnd=Math.min(m,c.value.length);else{var s=c.ownerDocument||document,f=s&&s.defaultView||window;if(f.getSelection){var h=f.getSelection(),v=c.textContent.length,S=Math.min(o.start,v),E=o.end===void 0?S:Math.min(o.end,v);!h.extend&&S>E&&(u=E,E=S,S=u);var d=yf(c,S),g=yf(c,E);if(d&&g&&(h.rangeCount!==1||h.anchorNode!==d.node||h.anchorOffset!==d.offset||h.focusNode!==g.node||h.focusOffset!==g.offset)){var p=s.createRange();p.setStart(d.node,d.offset),h.removeAllRanges(),S>E?(h.addRange(p),h.extend(g.node,g.offset)):(p.setEnd(g.node,g.offset),h.addRange(p))}}}}for(s=[],h=c;h=h.parentNode;)h.nodeType===1&&s.push({element:h,left:h.scrollLeft,top:h.scrollTop});for(typeof c.focus=="function"&&c.focus(),c=0;c<s.length;c++){var b=s[c];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}Ru=!!Jo,ko=Jo=null}finally{K=a,J.p=l,L.T=n}}t.current=e,St=2}}function qg(){if(St===2){St=0;var t=zn,e=Kl,n=(e.flags&8772)!==0;if((e.subtreeFlags&8772)!==0||n){n=L.T,L.T=null;var l=J.p;J.p=2;var a=K;K|=4;try{pg(t,e.alternate,e)}finally{K=a,J.p=l,L.T=n}}St=3}}function Yg(){if(St===4||St===3){St=0,Qh();var t=zn,e=Kl,n=tn,l=Dg;(e.subtreeFlags&10256)!==0||(e.flags&10256)!==0?St=5:(St=0,Kl=zn=null,Xg(t,t.pendingLanes));var a=t.pendingLanes;if(a===0&&(An=null),ur(n),e=e.stateNode,ie&&typeof ie.onCommitFiberRoot=="function")try{ie.onCommitFiberRoot(Pa,e,void 0,(e.current.flags&128)===128)}catch{}if(l!==null){e=L.T,a=J.p,J.p=2,L.T=null;try{for(var i=t.onRecoverableError,u=0;u<l.length;u++){var c=l[u];i(c.value,{componentStack:c.stack})}}finally{L.T=e,J.p=a}}(tn&3)!==0&&Qu(),Ye(t),a=t.pendingLanes,(n&261930)!==0&&(a&42)!==0?t===Qo?Ua++:(Ua=0,Qo=t):Ua=0,ci(0,!1)}}function Xg(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,ai(e)))}function Qu(){return Gg(),qg(),Yg(),Vg()}function Vg(){if(St!==5)return!1;var t=zn,e=Vo;Vo=0;var n=ur(tn),l=L.T,a=J.p;try{J.p=32>n?32:n,L.T=null,n=Zo,Zo=null;var i=zn,u=tn;if(St=0,Kl=zn=null,tn=0,(K&6)!==0)throw Error(M(331));var c=K;if(K|=4,zg(i.current),Mg(i,i.current,u,n),K=c,ci(0,!1),ie&&typeof ie.onPostCommitFiberRoot=="function")try{ie.onPostCommitFiberRoot(Pa,i)}catch{}return!0}finally{J.p=a,L.T=l,Xg(t,e)}}function If(t,e,n){e=ye(n,e),e=Bo(t.stateNode,e,2),t=Tn(t,e,2),t!==null&&(ei(t,2),Ye(t))}function $(t,e,n){if(t.tag===3)If(t,t,n);else for(;e!==null;){if(e.tag===3){If(e,t,n);break}else if(e.tag===1){var l=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof l.componentDidCatch=="function"&&(An===null||!An.has(l))){t=ye(n,t),n=lg(2),l=Tn(e,n,2),l!==null&&(ag(n,l,e,t),ei(l,2),Ye(l));break}}e=e.return}}function to(t,e,n){var l=t.pingCache;if(l===null){l=t.pingCache=new p1;var a=new Set;l.set(e,a)}else a=l.get(e),a===void 0&&(a=new Set,l.set(e,a));a.has(n)||(Xr=!0,a.add(n),t=E1.bind(null,t,e,n),e.then(t,t))}function E1(t,e,n){var l=t.pingCache;l!==null&&l.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,P===t&&(Y&n)===n&&(ft===4||ft===3&&(Y&62914560)===Y&&300>ae()-Xu?(K&2)===0&&Jl(t,0):Vr|=n,jl===Y&&(jl=0)),Ye(t)}function Zg(t,e){e===0&&(e=_d()),t=al(t,e),t!==null&&(ei(t,e),Ye(t))}function x1(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),Zg(t,n)}function M1(t,e){var n=0;switch(t.tag){case 31:case 13:var l=t.stateNode,a=t.memoizedState;a!==null&&(n=a.retryLane);break;case 19:l=t.stateNode;break;case 22:l=t.stateNode._retryCache;break;default:throw Error(M(314))}l!==null&&l.delete(e),Zg(t,n)}function T1(t,e){return ar(t,e)}var Eu=null,yl=null,jo=!1,xu=!1,eo=!1,Sn=0;function Ye(t){t!==yl&&t.next===null&&(yl===null?Eu=yl=t:yl=yl.next=t),xu=!0,jo||(jo=!0,z1())}function ci(t,e){if(!eo&&xu){eo=!0;do for(var n=!1,l=Eu;l!==null;){if(!e)if(t!==0){var a=l.pendingLanes;if(a===0)var i=0;else{var u=l.suspendedLanes,c=l.pingedLanes;i=(1<<31-ue(42|t)+1)-1,i&=a&~(u&~c),i=i&201326741?i&201326741|1:i?i|2:0}i!==0&&(n=!0,Pf(l,i))}else i=Y,i=wu(l,l===P?i:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),(i&3)===0||ti(l,i)||(n=!0,Pf(l,i));l=l.next}while(n);eo=!1}}function A1(){Qg()}function Qg(){xu=jo=!1;var t=0;Sn!==0&&_1()&&(t=Sn);for(var e=ae(),n=null,l=Eu;l!==null;){var a=l.next,i=jg(l,e);i===0?(l.next=null,n===null?Eu=a:n.next=a,a===null&&(yl=n)):(n=l,(t!==0||(i&3)!==0)&&(xu=!0)),l=a}St!==0&&St!==5||ci(t,!1),Sn!==0&&(Sn=0)}function jg(t,e){for(var n=t.suspendedLanes,l=t.pingedLanes,a=t.expirationTimes,i=t.pendingLanes&-62914561;0<i;){var u=31-ue(i),c=1<<u,o=a[u];o===-1?((c&n)===0||(c&l)!==0)&&(a[u]=Ih(c,e)):o<=e&&(t.expiredLanes|=c),i&=~c}if(e=P,n=Y,n=wu(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),l=t.callbackNode,n===0||t===e&&(k===2||k===9)||t.cancelPendingCommit!==null)return l!==null&&l!==null&&wc(l),t.callbackNode=null,t.callbackPriority=0;if((n&3)===0||ti(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(l!==null&&wc(l),ur(n)){case 2:case 8:n=Hd;break;case 32:n=au;break;case 268435456:n=Cd;break;default:n=au}return l=Kg.bind(null,t),n=ar(n,l),t.callbackPriority=e,t.callbackNode=n,e}return l!==null&&l!==null&&wc(l),t.callbackPriority=2,t.callbackNode=null,2}function Kg(t,e){if(St!==0&&St!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(Qu()&&t.callbackNode!==n)return null;var l=Y;return l=wu(t,t===P?l:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),l===0?null:(Lg(t,l,e),jg(t,ae()),t.callbackNode!=null&&t.callbackNode===n?Kg.bind(null,t):null)}function Pf(t,e){if(Qu())return null;Lg(t,e,!0)}function z1(){U1(function(){(K&6)!==0?ar(Ld,A1):Qg()})}function Qr(){if(Sn===0){var t=Vl;t===0&&(t=Mi,Mi<<=1,(Mi&261888)===0&&(Mi=256)),Sn=t}return Sn}function td(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:Xi(""+t)}function ed(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function O1(t,e,n,l,a){if(e==="submit"&&n&&n.stateNode===a){var i=td((a[It]||null).action),u=l.submitter;u&&(e=(e=u[It]||null)?td(e.formAction):u.getAttribute("formAction"),e!==null&&(i=e,u=null));var c=new Lu("action","action",null,l,a);t.push({event:c,listeners:[{instance:null,listener:function(){if(l.defaultPrevented){if(Sn!==0){var o=u?ed(a,u):new FormData(a);No(n,{pending:!0,data:o,method:a.method,action:i},null,o)}}else typeof i=="function"&&(c.preventDefault(),o=u?ed(a,u):new FormData(a),No(n,{pending:!0,data:o,method:a.method,action:i},i,o))},currentTarget:a}]})}}for(Ni=0;Ni<Mo.length;Ni++)Ui=Mo[Ni],nd=Ui.toLowerCase(),ld=Ui[0].toUpperCase()+Ui.slice(1),De(nd,"on"+ld);var Ui,nd,ld,Ni;De(a0,"onAnimationEnd");De(i0,"onAnimationIteration");De(u0,"onAnimationStart");De("dblclick","onDoubleClick");De("focusin","onFocus");De("focusout","onBlur");De(jp,"onTransitionRun");De(Kp,"onTransitionStart");De(Jp,"onTransitionCancel");De(c0,"onTransitionEnd");Yl("onMouseEnter",["mouseout","mouseover"]);Yl("onMouseLeave",["mouseout","mouseover"]);Yl("onPointerEnter",["pointerout","pointerover"]);Yl("onPointerLeave",["pointerout","pointerover"]);el("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));el("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));el("onBeforeInput",["compositionend","keypress","textInput","paste"]);el("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));el("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));el("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ja="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),R1=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ja));function Jg(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var l=t[n],a=l.event;l=l.listeners;t:{var i=void 0;if(e)for(var u=l.length-1;0<=u;u--){var c=l[u],o=c.instance,r=c.currentTarget;if(c=c.listener,o!==i&&a.isPropagationStopped())break t;i=c,a.currentTarget=r;try{i(a)}catch(m){uu(m)}a.currentTarget=null,i=o}else for(u=0;u<l.length;u++){if(c=l[u],o=c.instance,r=c.currentTarget,c=c.listener,o!==i&&a.isPropagationStopped())break t;i=c,a.currentTarget=r;try{i(a)}catch(m){uu(m)}a.currentTarget=null,i=o}}}}function G(t,e){var n=e[ho];n===void 0&&(n=e[ho]=new Set);var l=t+"__bubble";n.has(l)||(kg(e,t,2,!1),n.add(l))}function no(t,e,n){var l=0;e&&(l|=4),kg(n,t,l,e)}var Bi="_reactListening"+Math.random().toString(36).slice(2);function jr(t){if(!t[Bi]){t[Bi]=!0,qd.forEach(function(n){n!=="selectionchange"&&(R1.has(n)||no(n,!1,t),no(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Bi]||(e[Bi]=!0,no("selectionchange",!1,e))}}function kg(t,e,n,l){switch(cm(e)){case 2:var a=nb;break;case 8:a=lb;break;default:a=$r}n=a.bind(null,e,n,t),a=void 0,!So||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(a=!0),l?a!==void 0?t.addEventListener(e,n,{capture:!0,passive:a}):t.addEventListener(e,n,!0):a!==void 0?t.addEventListener(e,n,{passive:a}):t.addEventListener(e,n,!1)}function lo(t,e,n,l,a){var i=l;if((e&1)===0&&(e&2)===0&&l!==null)t:for(;;){if(l===null)return;var u=l.tag;if(u===3||u===4){var c=l.stateNode.containerInfo;if(c===a)break;if(u===4)for(u=l.return;u!==null;){var o=u.tag;if((o===3||o===4)&&u.stateNode.containerInfo===a)return;u=u.return}for(;c!==null;){if(u=xl(c),u===null)return;if(o=u.tag,o===5||o===6||o===26||o===27){l=i=u;continue t}c=c.parentNode}}l=l.return}Jd(function(){var r=i,m=rr(n),s=[];t:{var f=o0.get(t);if(f!==void 0){var h=Lu,v=t;switch(t){case"keypress":if(Zi(n)===0)break t;case"keydown":case"keyup":h=Mp;break;case"focusin":v="focus",h=Nc;break;case"focusout":v="blur",h=Nc;break;case"beforeblur":case"afterblur":h=Nc;break;case"click":if(n.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":h=sf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":h=fp;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":h=zp;break;case a0:case i0:case u0:h=mp;break;case c0:h=Rp;break;case"scroll":case"scrollend":h=rp;break;case"wheel":h=wp;break;case"copy":case"cut":case"paste":h=pp;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":h=df;break;case"toggle":case"beforetoggle":h=Hp}var S=(e&4)!==0,E=!S&&(t==="scroll"||t==="scrollend"),d=S?f!==null?f+"Capture":null:f;S=[];for(var g=r,p;g!==null;){var b=g;if(p=b.stateNode,b=b.tag,b!==5&&b!==26&&b!==27||p===null||d===null||(b=qa(g,d),b!=null&&S.push(ka(g,b,p))),E)break;g=g.return}0<S.length&&(f=new h(f,v,null,n,m),s.push({event:f,listeners:S}))}}if((e&7)===0){t:{if(f=t==="mouseover"||t==="pointerover",h=t==="mouseout"||t==="pointerout",f&&n!==yo&&(v=n.relatedTarget||n.fromElement)&&(xl(v)||v[Wl]))break t;if((h||f)&&(f=m.window===m?m:(f=m.ownerDocument)?f.defaultView||f.parentWindow:window,h?(v=n.relatedTarget||n.toElement,h=r,v=v?xl(v):null,v!==null&&(E=Ia(v),S=v.tag,v!==E||S!==5&&S!==27&&S!==6)&&(v=null)):(h=null,v=r),h!==v)){if(S=sf,b="onMouseLeave",d="onMouseEnter",g="mouse",(t==="pointerout"||t==="pointerover")&&(S=df,b="onPointerLeave",d="onPointerEnter",g="pointer"),E=h==null?f:xa(h),p=v==null?f:xa(v),f=new S(b,g+"leave",h,n,m),f.target=E,f.relatedTarget=p,b=null,xl(m)===r&&(S=new S(d,g+"enter",v,n,m),S.target=p,S.relatedTarget=E,b=S),E=b,h&&v)e:{for(S=D1,d=h,g=v,p=0,b=d;b;b=S(b))p++;b=0;for(var y=g;y;y=S(y))b++;for(;0<p-b;)d=S(d),p--;for(;0<b-p;)g=S(g),b--;for(;p--;){if(d===g||g!==null&&d===g.alternate){S=d;break e}d=S(d),g=S(g)}S=null}else S=null;h!==null&&ad(s,f,h,S,!1),v!==null&&E!==null&&ad(s,E,v,S,!0)}}t:{if(f=r?xa(r):window,h=f.nodeName&&f.nodeName.toLowerCase(),h==="select"||h==="input"&&f.type==="file")var x=pf;else if(hf(f))if(Pd)x=Vp;else{x=Yp;var T=qp}else h=f.nodeName,!h||h.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?r&&or(r.elementType)&&(x=pf):x=Xp;if(x&&(x=x(t,r))){Id(s,x,n,m);break t}T&&T(t,f,r),t==="focusout"&&r&&f.type==="number"&&r.memoizedProps.value!=null&&vo(f,"number",f.value)}switch(T=r?xa(r):window,t){case"focusin":(hf(T)||T.contentEditable==="true")&&(Al=T,Eo=r,Oa=null);break;case"focusout":Oa=Eo=Al=null;break;case"mousedown":xo=!0;break;case"contextmenu":case"mouseup":case"dragend":xo=!1,Sf(s,n,m);break;case"selectionchange":if(Qp)break;case"keydown":case"keyup":Sf(s,n,m)}var R;if(dr)t:{switch(t){case"compositionstart":var D="onCompositionStart";break t;case"compositionend":D="onCompositionEnd";break t;case"compositionupdate":D="onCompositionUpdate";break t}D=void 0}else Tl?Wd(t,n)&&(D="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(D="onCompositionStart");D&&($d&&n.locale!=="ko"&&(Tl||D!=="onCompositionStart"?D==="onCompositionEnd"&&Tl&&(R=kd()):(bn=m,sr="value"in bn?bn.value:bn.textContent,Tl=!0)),T=Mu(r,D),0<T.length&&(D=new ff(D,t,null,n,m),s.push({event:D,listeners:T}),R?D.data=R:(R=Fd(n),R!==null&&(D.data=R)))),(R=_p?Np(t,n):Up(t,n))&&(D=Mu(r,"onBeforeInput"),0<D.length&&(T=new ff("onBeforeInput","beforeinput",null,n,m),s.push({event:T,listeners:D}),T.data=R)),O1(s,t,r,n,m)}Jg(s,e)})}function ka(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Mu(t,e){for(var n=e+"Capture",l=[];t!==null;){var a=t,i=a.stateNode;if(a=a.tag,a!==5&&a!==26&&a!==27||i===null||(a=qa(t,n),a!=null&&l.unshift(ka(t,a,i)),a=qa(t,e),a!=null&&l.push(ka(t,a,i))),t.tag===3)return l;t=t.return}return[]}function D1(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function ad(t,e,n,l,a){for(var i=e._reactName,u=[];n!==null&&n!==l;){var c=n,o=c.alternate,r=c.stateNode;if(c=c.tag,o!==null&&o===l)break;c!==5&&c!==26&&c!==27||r===null||(o=r,a?(r=qa(n,i),r!=null&&u.unshift(ka(n,r,o))):a||(r=qa(n,i),r!=null&&u.push(ka(n,r,o)))),n=n.return}u.length!==0&&t.push({event:e,listeners:u})}var w1=/\r\n?/g,L1=/\u0000|\uFFFD/g;function id(t){return(typeof t=="string"?t:""+t).replace(w1,`
`).replace(L1,"")}function $g(t,e){return e=id(e),id(t)===e}function F(t,e,n,l,a,i){switch(n){case"children":typeof l=="string"?e==="body"||e==="textarea"&&l===""||Xl(t,l):(typeof l=="number"||typeof l=="bigint")&&e!=="body"&&Xl(t,""+l);break;case"className":zi(t,"class",l);break;case"tabIndex":zi(t,"tabindex",l);break;case"dir":case"role":case"viewBox":case"width":case"height":zi(t,n,l);break;case"style":Kd(t,l,i);break;case"data":if(e!=="object"){zi(t,"data",l);break}case"src":case"href":if(l===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(l==null||typeof l=="function"||typeof l=="symbol"||typeof l=="boolean"){t.removeAttribute(n);break}l=Xi(""+l),t.setAttribute(n,l);break;case"action":case"formAction":if(typeof l=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof i=="function"&&(n==="formAction"?(e!=="input"&&F(t,e,"name",a.name,a,null),F(t,e,"formEncType",a.formEncType,a,null),F(t,e,"formMethod",a.formMethod,a,null),F(t,e,"formTarget",a.formTarget,a,null)):(F(t,e,"encType",a.encType,a,null),F(t,e,"method",a.method,a,null),F(t,e,"target",a.target,a,null)));if(l==null||typeof l=="symbol"||typeof l=="boolean"){t.removeAttribute(n);break}l=Xi(""+l),t.setAttribute(n,l);break;case"onClick":l!=null&&(t.onclick=We);break;case"onScroll":l!=null&&G("scroll",t);break;case"onScrollEnd":l!=null&&G("scrollend",t);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(M(61));if(n=l.__html,n!=null){if(a.children!=null)throw Error(M(60));t.innerHTML=n}}break;case"multiple":t.multiple=l&&typeof l!="function"&&typeof l!="symbol";break;case"muted":t.muted=l&&typeof l!="function"&&typeof l!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(l==null||typeof l=="function"||typeof l=="boolean"||typeof l=="symbol"){t.removeAttribute("xlink:href");break}n=Xi(""+l),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":l!=null&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(n,""+l):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":l&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":l===!0?t.setAttribute(n,""):l!==!1&&l!=null&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(n,l):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":l!=null&&typeof l!="function"&&typeof l!="symbol"&&!isNaN(l)&&1<=l?t.setAttribute(n,l):t.removeAttribute(n);break;case"rowSpan":case"start":l==null||typeof l=="function"||typeof l=="symbol"||isNaN(l)?t.removeAttribute(n):t.setAttribute(n,l);break;case"popover":G("beforetoggle",t),G("toggle",t),Yi(t,"popover",l);break;case"xlinkActuate":Ve(t,"http://www.w3.org/1999/xlink","xlink:actuate",l);break;case"xlinkArcrole":Ve(t,"http://www.w3.org/1999/xlink","xlink:arcrole",l);break;case"xlinkRole":Ve(t,"http://www.w3.org/1999/xlink","xlink:role",l);break;case"xlinkShow":Ve(t,"http://www.w3.org/1999/xlink","xlink:show",l);break;case"xlinkTitle":Ve(t,"http://www.w3.org/1999/xlink","xlink:title",l);break;case"xlinkType":Ve(t,"http://www.w3.org/1999/xlink","xlink:type",l);break;case"xmlBase":Ve(t,"http://www.w3.org/XML/1998/namespace","xml:base",l);break;case"xmlLang":Ve(t,"http://www.w3.org/XML/1998/namespace","xml:lang",l);break;case"xmlSpace":Ve(t,"http://www.w3.org/XML/1998/namespace","xml:space",l);break;case"is":Yi(t,"is",l);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=cp.get(n)||n,Yi(t,n,l))}}function Ko(t,e,n,l,a,i){switch(n){case"style":Kd(t,l,i);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(M(61));if(n=l.__html,n!=null){if(a.children!=null)throw Error(M(60));t.innerHTML=n}}break;case"children":typeof l=="string"?Xl(t,l):(typeof l=="number"||typeof l=="bigint")&&Xl(t,""+l);break;case"onScroll":l!=null&&G("scroll",t);break;case"onScrollEnd":l!=null&&G("scrollend",t);break;case"onClick":l!=null&&(t.onclick=We);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Yd.hasOwnProperty(n))t:{if(n[0]==="o"&&n[1]==="n"&&(a=n.endsWith("Capture"),e=n.slice(2,a?n.length-7:void 0),i=t[It]||null,i=i!=null?i[n]:null,typeof i=="function"&&t.removeEventListener(e,i,a),typeof l=="function")){typeof i!="function"&&i!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,l,a);break t}n in t?t[n]=l:l===!0?t.setAttribute(n,""):Yi(t,n,l)}}}function _t(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":G("error",t),G("load",t);var l=!1,a=!1,i;for(i in n)if(n.hasOwnProperty(i)){var u=n[i];if(u!=null)switch(i){case"src":l=!0;break;case"srcSet":a=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(M(137,e));default:F(t,e,i,u,n,null)}}a&&F(t,e,"srcSet",n.srcSet,n,null),l&&F(t,e,"src",n.src,n,null);return;case"input":G("invalid",t);var c=i=u=a=null,o=null,r=null;for(l in n)if(n.hasOwnProperty(l)){var m=n[l];if(m!=null)switch(l){case"name":a=m;break;case"type":u=m;break;case"checked":o=m;break;case"defaultChecked":r=m;break;case"value":i=m;break;case"defaultValue":c=m;break;case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(M(137,e));break;default:F(t,e,l,m,n,null)}}Zd(t,i,c,o,r,u,a,!1);return;case"select":G("invalid",t),l=u=i=null;for(a in n)if(n.hasOwnProperty(a)&&(c=n[a],c!=null))switch(a){case"value":i=c;break;case"defaultValue":u=c;break;case"multiple":l=c;default:F(t,e,a,c,n,null)}e=i,n=u,t.multiple=!!l,e!=null?Cl(t,!!l,e,!1):n!=null&&Cl(t,!!l,n,!0);return;case"textarea":G("invalid",t),i=a=l=null;for(u in n)if(n.hasOwnProperty(u)&&(c=n[u],c!=null))switch(u){case"value":l=c;break;case"defaultValue":a=c;break;case"children":i=c;break;case"dangerouslySetInnerHTML":if(c!=null)throw Error(M(91));break;default:F(t,e,u,c,n,null)}jd(t,l,a,i);return;case"option":for(o in n)n.hasOwnProperty(o)&&(l=n[o],l!=null)&&(o==="selected"?t.selected=l&&typeof l!="function"&&typeof l!="symbol":F(t,e,o,l,n,null));return;case"dialog":G("beforetoggle",t),G("toggle",t),G("cancel",t),G("close",t);break;case"iframe":case"object":G("load",t);break;case"video":case"audio":for(l=0;l<Ja.length;l++)G(Ja[l],t);break;case"image":G("error",t),G("load",t);break;case"details":G("toggle",t);break;case"embed":case"source":case"link":G("error",t),G("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(r in n)if(n.hasOwnProperty(r)&&(l=n[r],l!=null))switch(r){case"children":case"dangerouslySetInnerHTML":throw Error(M(137,e));default:F(t,e,r,l,n,null)}return;default:if(or(e)){for(m in n)n.hasOwnProperty(m)&&(l=n[m],l!==void 0&&Ko(t,e,m,l,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(l=n[c],l!=null&&F(t,e,c,l,n,null))}function H1(t,e,n,l){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var a=null,i=null,u=null,c=null,o=null,r=null,m=null;for(h in n){var s=n[h];if(n.hasOwnProperty(h)&&s!=null)switch(h){case"checked":break;case"value":break;case"defaultValue":o=s;default:l.hasOwnProperty(h)||F(t,e,h,null,l,s)}}for(var f in l){var h=l[f];if(s=n[f],l.hasOwnProperty(f)&&(h!=null||s!=null))switch(f){case"type":i=h;break;case"name":a=h;break;case"checked":r=h;break;case"defaultChecked":m=h;break;case"value":u=h;break;case"defaultValue":c=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(M(137,e));break;default:h!==s&&F(t,e,f,h,l,s)}}bo(t,u,c,o,r,m,i,a);return;case"select":h=u=c=f=null;for(i in n)if(o=n[i],n.hasOwnProperty(i)&&o!=null)switch(i){case"value":break;case"multiple":h=o;default:l.hasOwnProperty(i)||F(t,e,i,null,l,o)}for(a in l)if(i=l[a],o=n[a],l.hasOwnProperty(a)&&(i!=null||o!=null))switch(a){case"value":f=i;break;case"defaultValue":c=i;break;case"multiple":u=i;default:i!==o&&F(t,e,a,i,l,o)}e=c,n=u,l=h,f!=null?Cl(t,!!n,f,!1):!!l!=!!n&&(e!=null?Cl(t,!!n,e,!0):Cl(t,!!n,n?[]:"",!1));return;case"textarea":h=f=null;for(c in n)if(a=n[c],n.hasOwnProperty(c)&&a!=null&&!l.hasOwnProperty(c))switch(c){case"value":break;case"children":break;default:F(t,e,c,null,l,a)}for(u in l)if(a=l[u],i=n[u],l.hasOwnProperty(u)&&(a!=null||i!=null))switch(u){case"value":f=a;break;case"defaultValue":h=a;break;case"children":break;case"dangerouslySetInnerHTML":if(a!=null)throw Error(M(91));break;default:a!==i&&F(t,e,u,a,l,i)}Qd(t,f,h);return;case"option":for(var v in n)f=n[v],n.hasOwnProperty(v)&&f!=null&&!l.hasOwnProperty(v)&&(v==="selected"?t.selected=!1:F(t,e,v,null,l,f));for(o in l)f=l[o],h=n[o],l.hasOwnProperty(o)&&f!==h&&(f!=null||h!=null)&&(o==="selected"?t.selected=f&&typeof f!="function"&&typeof f!="symbol":F(t,e,o,f,l,h));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var S in n)f=n[S],n.hasOwnProperty(S)&&f!=null&&!l.hasOwnProperty(S)&&F(t,e,S,null,l,f);for(r in l)if(f=l[r],h=n[r],l.hasOwnProperty(r)&&f!==h&&(f!=null||h!=null))switch(r){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(M(137,e));break;default:F(t,e,r,f,l,h)}return;default:if(or(e)){for(var E in n)f=n[E],n.hasOwnProperty(E)&&f!==void 0&&!l.hasOwnProperty(E)&&Ko(t,e,E,void 0,l,f);for(m in l)f=l[m],h=n[m],!l.hasOwnProperty(m)||f===h||f===void 0&&h===void 0||Ko(t,e,m,f,l,h);return}}for(var d in n)f=n[d],n.hasOwnProperty(d)&&f!=null&&!l.hasOwnProperty(d)&&F(t,e,d,null,l,f);for(s in l)f=l[s],h=n[s],!l.hasOwnProperty(s)||f===h||f==null&&h==null||F(t,e,s,f,l,h)}function ud(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function C1(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),l=0;l<n.length;l++){var a=n[l],i=a.transferSize,u=a.initiatorType,c=a.duration;if(i&&c&&ud(u)){for(u=0,c=a.responseEnd,l+=1;l<n.length;l++){var o=n[l],r=o.startTime;if(r>c)break;var m=o.transferSize,s=o.initiatorType;m&&ud(s)&&(o=o.responseEnd,u+=m*(o<c?1:(c-r)/(o-r)))}if(--l,e+=8*(i+u)/(a.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Jo=null,ko=null;function Tu(t){return t.nodeType===9?t:t.ownerDocument}function cd(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Wg(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function $o(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var ao=null;function _1(){var t=window.event;return t&&t.type==="popstate"?t===ao?!1:(ao=t,!0):(ao=null,!1)}var Fg=typeof setTimeout=="function"?setTimeout:void 0,N1=typeof clearTimeout=="function"?clearTimeout:void 0,od=typeof Promise=="function"?Promise:void 0,U1=typeof queueMicrotask=="function"?queueMicrotask:typeof od<"u"?function(t){return od.resolve(null).then(t).catch(B1)}:Fg;function B1(t){setTimeout(function(){throw t})}function Nn(t){return t==="head"}function rd(t,e){var n=e,l=0;do{var a=n.nextSibling;if(t.removeChild(n),a&&a.nodeType===8)if(n=a.data,n==="/$"||n==="/&"){if(l===0){t.removeChild(a),$l(e);return}l--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")l++;else if(n==="html")Ba(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,Ba(n);for(var i=n.firstChild;i;){var u=i.nextSibling,c=i.nodeName;i[ni]||c==="SCRIPT"||c==="STYLE"||c==="LINK"&&i.rel.toLowerCase()==="stylesheet"||n.removeChild(i),i=u}}else n==="body"&&Ba(t.ownerDocument.body);n=a}while(n);$l(e)}function sd(t,e){var n=t;t=0;do{var l=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),l&&l.nodeType===8)if(n=l.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=l}while(n)}function Wo(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Wo(n),cr(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function G1(t,e,n,l){for(;t.nodeType===1;){var a=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!l&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(l){if(!t[ni])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(i=t.getAttribute("rel"),i==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(i!==a.rel||t.getAttribute("href")!==(a.href==null||a.href===""?null:a.href)||t.getAttribute("crossorigin")!==(a.crossOrigin==null?null:a.crossOrigin)||t.getAttribute("title")!==(a.title==null?null:a.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(i=t.getAttribute("src"),(i!==(a.src==null?null:a.src)||t.getAttribute("type")!==(a.type==null?null:a.type)||t.getAttribute("crossorigin")!==(a.crossOrigin==null?null:a.crossOrigin))&&i&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var i=a.name==null?null:""+a.name;if(a.type==="hidden"&&t.getAttribute("name")===i)return t}else return t;if(t=xe(t.nextSibling),t===null)break}return null}function q1(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=xe(t.nextSibling),t===null))return null;return t}function Ig(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=xe(t.nextSibling),t===null))return null;return t}function Fo(t){return t.data==="$?"||t.data==="$~"}function Io(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function Y1(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var l=function(){e(),n.removeEventListener("DOMContentLoaded",l)};n.addEventListener("DOMContentLoaded",l),t._reactRetry=l}}function xe(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Po=null;function fd(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return xe(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function dd(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function Pg(t,e,n){switch(e=Tu(n),t){case"html":if(t=e.documentElement,!t)throw Error(M(452));return t;case"head":if(t=e.head,!t)throw Error(M(453));return t;case"body":if(t=e.body,!t)throw Error(M(454));return t;default:throw Error(M(451))}}function Ba(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);cr(t)}var Me=new Map,gd=new Set;function Au(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var cn=J.d;J.d={f:X1,r:V1,D:Z1,C:Q1,L:j1,m:K1,X:k1,S:J1,M:$1};function X1(){var t=cn.f(),e=Vu();return t||e}function V1(t){var e=Fl(t);e!==null&&e.tag===5&&e.type==="form"?K0(e):cn.r(t)}var ea=typeof document>"u"?null:document;function tm(t,e,n){var l=ea;if(l&&typeof e=="string"&&e){var a=ve(e);a='link[rel="'+t+'"][href="'+a+'"]',typeof n=="string"&&(a+='[crossorigin="'+n+'"]'),gd.has(a)||(gd.add(a),t={rel:t,crossOrigin:n,href:e},l.querySelector(a)===null&&(e=l.createElement("link"),_t(e,"link",t),Tt(e),l.head.appendChild(e)))}}function Z1(t){cn.D(t),tm("dns-prefetch",t,null)}function Q1(t,e){cn.C(t,e),tm("preconnect",t,e)}function j1(t,e,n){cn.L(t,e,n);var l=ea;if(l&&t&&e){var a='link[rel="preload"][as="'+ve(e)+'"]';e==="image"&&n&&n.imageSrcSet?(a+='[imagesrcset="'+ve(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(a+='[imagesizes="'+ve(n.imageSizes)+'"]')):a+='[href="'+ve(t)+'"]';var i=a;switch(e){case"style":i=kl(t);break;case"script":i=na(t)}Me.has(i)||(t=it({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),Me.set(i,t),l.querySelector(a)!==null||e==="style"&&l.querySelector(oi(i))||e==="script"&&l.querySelector(ri(i))||(e=l.createElement("link"),_t(e,"link",t),Tt(e),l.head.appendChild(e)))}}function K1(t,e){cn.m(t,e);var n=ea;if(n&&t){var l=e&&typeof e.as=="string"?e.as:"script",a='link[rel="modulepreload"][as="'+ve(l)+'"][href="'+ve(t)+'"]',i=a;switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":i=na(t)}if(!Me.has(i)&&(t=it({rel:"modulepreload",href:t},e),Me.set(i,t),n.querySelector(a)===null)){switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(ri(i)))return}l=n.createElement("link"),_t(l,"link",t),Tt(l),n.head.appendChild(l)}}}function J1(t,e,n){cn.S(t,e,n);var l=ea;if(l&&t){var a=Hl(l).hoistableStyles,i=kl(t);e=e||"default";var u=a.get(i);if(!u){var c={loading:0,preload:null};if(u=l.querySelector(oi(i)))c.loading=5;else{t=it({rel:"stylesheet",href:t,"data-precedence":e},n),(n=Me.get(i))&&Kr(t,n);var o=u=l.createElement("link");Tt(o),_t(o,"link",t),o._p=new Promise(function(r,m){o.onload=r,o.onerror=m}),o.addEventListener("load",function(){c.loading|=1}),o.addEventListener("error",function(){c.loading|=2}),c.loading|=4,Fi(u,e,l)}u={type:"stylesheet",instance:u,count:1,state:c},a.set(i,u)}}}function k1(t,e){cn.X(t,e);var n=ea;if(n&&t){var l=Hl(n).hoistableScripts,a=na(t),i=l.get(a);i||(i=n.querySelector(ri(a)),i||(t=it({src:t,async:!0},e),(e=Me.get(a))&&Jr(t,e),i=n.createElement("script"),Tt(i),_t(i,"link",t),n.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},l.set(a,i))}}function $1(t,e){cn.M(t,e);var n=ea;if(n&&t){var l=Hl(n).hoistableScripts,a=na(t),i=l.get(a);i||(i=n.querySelector(ri(a)),i||(t=it({src:t,async:!0,type:"module"},e),(e=Me.get(a))&&Jr(t,e),i=n.createElement("script"),Tt(i),_t(i,"link",t),n.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},l.set(a,i))}}function md(t,e,n,l){var a=(a=En.current)?Au(a):null;if(!a)throw Error(M(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=kl(n.href),n=Hl(a).hoistableStyles,l=n.get(e),l||(l={type:"style",instance:null,count:0,state:null},n.set(e,l)),l):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=kl(n.href);var i=Hl(a).hoistableStyles,u=i.get(t);if(u||(a=a.ownerDocument||a,u={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},i.set(t,u),(i=a.querySelector(oi(t)))&&!i._p&&(u.instance=i,u.state.loading=5),Me.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Me.set(t,n),i||W1(a,t,n,u.state))),e&&l===null)throw Error(M(528,""));return u}if(e&&l!==null)throw Error(M(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=na(n),n=Hl(a).hoistableScripts,l=n.get(e),l||(l={type:"script",instance:null,count:0,state:null},n.set(e,l)),l):{type:"void",instance:null,count:0,state:null};default:throw Error(M(444,t))}}function kl(t){return'href="'+ve(t)+'"'}function oi(t){return'link[rel="stylesheet"]['+t+"]"}function em(t){return it({},t,{"data-precedence":t.precedence,precedence:null})}function W1(t,e,n,l){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?l.loading=1:(e=t.createElement("link"),l.preload=e,e.addEventListener("load",function(){return l.loading|=1}),e.addEventListener("error",function(){return l.loading|=2}),_t(e,"link",n),Tt(e),t.head.appendChild(e))}function na(t){return'[src="'+ve(t)+'"]'}function ri(t){return"script[async]"+t}function hd(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var l=t.querySelector('style[data-href~="'+ve(n.href)+'"]');if(l)return e.instance=l,Tt(l),l;var a=it({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return l=(t.ownerDocument||t).createElement("style"),Tt(l),_t(l,"style",a),Fi(l,n.precedence,t),e.instance=l;case"stylesheet":a=kl(n.href);var i=t.querySelector(oi(a));if(i)return e.state.loading|=4,e.instance=i,Tt(i),i;l=em(n),(a=Me.get(a))&&Kr(l,a),i=(t.ownerDocument||t).createElement("link"),Tt(i);var u=i;return u._p=new Promise(function(c,o){u.onload=c,u.onerror=o}),_t(i,"link",l),e.state.loading|=4,Fi(i,n.precedence,t),e.instance=i;case"script":return i=na(n.src),(a=t.querySelector(ri(i)))?(e.instance=a,Tt(a),a):(l=n,(a=Me.get(i))&&(l=it({},n),Jr(l,a)),t=t.ownerDocument||t,a=t.createElement("script"),Tt(a),_t(a,"link",l),t.head.appendChild(a),e.instance=a);case"void":return null;default:throw Error(M(443,e.type))}else e.type==="stylesheet"&&(e.state.loading&4)===0&&(l=e.instance,e.state.loading|=4,Fi(l,n.precedence,t));return e.instance}function Fi(t,e,n){for(var l=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),a=l.length?l[l.length-1]:null,i=a,u=0;u<l.length;u++){var c=l[u];if(c.dataset.precedence===e)i=c;else if(i!==a)break}i?i.parentNode.insertBefore(t,i.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function Kr(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Jr(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var Ii=null;function pd(t,e,n){if(Ii===null){var l=new Map,a=Ii=new Map;a.set(n,l)}else a=Ii,l=a.get(n),l||(l=new Map,a.set(n,l));if(l.has(t))return l;for(l.set(t,null),n=n.getElementsByTagName(t),a=0;a<n.length;a++){var i=n[a];if(!(i[ni]||i[Lt]||t==="link"&&i.getAttribute("rel")==="stylesheet")&&i.namespaceURI!=="http://www.w3.org/2000/svg"){var u=i.getAttribute(e)||"";u=t+u;var c=l.get(u);c?c.push(i):l.set(u,[i])}}return l}function bd(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function F1(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;return e.rel==="stylesheet"?(t=e.disabled,typeof e.precedence=="string"&&t==null):!0;case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function nm(t){return!(t.type==="stylesheet"&&(t.state.loading&3)===0)}function I1(t,e,n,l){if(n.type==="stylesheet"&&(typeof l.media!="string"||matchMedia(l.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var a=kl(l.href),i=e.querySelector(oi(a));if(i){e=i._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=zu.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=i,Tt(i);return}i=e.ownerDocument||e,l=em(l),(a=Me.get(a))&&Kr(l,a),i=i.createElement("link"),Tt(i);var u=i;u._p=new Promise(function(c,o){u.onload=c,u.onerror=o}),_t(i,"link",l),n.instance=i}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&(n.state.loading&3)===0&&(t.count++,n=zu.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var io=0;function P1(t,e){return t.stylesheets&&t.count===0&&Pi(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var l=setTimeout(function(){if(t.stylesheets&&Pi(t,t.stylesheets),t.unsuspend){var i=t.unsuspend;t.unsuspend=null,i()}},6e4+e);0<t.imgBytes&&io===0&&(io=62500*C1());var a=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Pi(t,t.stylesheets),t.unsuspend)){var i=t.unsuspend;t.unsuspend=null,i()}},(t.imgBytes>io?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(l),clearTimeout(a)}}:null}function zu(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Pi(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Ou=null;function Pi(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Ou=new Map,e.forEach(tb,t),Ou=null,zu.call(t))}function tb(t,e){if(!(e.state.loading&4)){var n=Ou.get(t);if(n)var l=n.get(null);else{n=new Map,Ou.set(t,n);for(var a=t.querySelectorAll("link[data-precedence],style[data-precedence]"),i=0;i<a.length;i++){var u=a[i];(u.nodeName==="LINK"||u.getAttribute("media")!=="not all")&&(n.set(u.dataset.precedence,u),l=u)}l&&n.set(null,l)}a=e.instance,u=a.getAttribute("data-precedence"),i=n.get(u)||l,i===l&&n.set(null,a),n.set(u,a),this.count++,l=zu.bind(this),a.addEventListener("load",l),a.addEventListener("error",l),i?i.parentNode.insertBefore(a,i.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(a,t.firstChild)),e.state.loading|=4}}var $a={$$typeof:$e,Provider:null,Consumer:null,_currentValue:jn,_currentValue2:jn,_threadCount:0};function eb(t,e,n,l,a,i,u,c,o){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Lc(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Lc(0),this.hiddenUpdates=Lc(null),this.identifierPrefix=l,this.onUncaughtError=a,this.onCaughtError=i,this.onRecoverableError=u,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=o,this.incompleteTransitions=new Map}function lm(t,e,n,l,a,i,u,c,o,r,m,s){return t=new eb(t,e,n,u,o,r,m,s,c),e=1,i===!0&&(e|=24),i=ne(3,null,null,e),t.current=i,i.stateNode=t,e=yr(),e.refCount++,t.pooledCache=e,e.refCount++,i.memoizedState={element:l,isDehydrated:n,cache:e},xr(i),t}function am(t){return t?(t=Rl,t):Rl}function im(t,e,n,l,a,i){a=am(a),l.context===null?l.context=a:l.pendingContext=a,l=Mn(e),l.payload={element:n},i=i===void 0?null:i,i!==null&&(l.callback=i),n=Tn(t,l,e),n!==null&&(Ft(n,t,e),Da(n,t,e))}function vd(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function kr(t,e){vd(t,e),(t=t.alternate)&&vd(t,e)}function um(t){if(t.tag===13||t.tag===31){var e=al(t,67108864);e!==null&&Ft(e,t,67108864),kr(t,67108864)}}function yd(t){if(t.tag===13||t.tag===31){var e=ce();e=ir(e);var n=al(t,e);n!==null&&Ft(n,t,e),kr(t,e)}}var Ru=!0;function nb(t,e,n,l){var a=L.T;L.T=null;var i=J.p;try{J.p=2,$r(t,e,n,l)}finally{J.p=i,L.T=a}}function lb(t,e,n,l){var a=L.T;L.T=null;var i=J.p;try{J.p=8,$r(t,e,n,l)}finally{J.p=i,L.T=a}}function $r(t,e,n,l){if(Ru){var a=tr(l);if(a===null)lo(t,e,l,Du,n),Sd(t,l);else if(ib(a,t,e,n,l))l.stopPropagation();else if(Sd(t,l),e&4&&-1<ab.indexOf(t)){for(;a!==null;){var i=Fl(a);if(i!==null)switch(i.tag){case 3:if(i=i.stateNode,i.current.memoizedState.isDehydrated){var u=Vn(i.pendingLanes);if(u!==0){var c=i;for(c.pendingLanes|=2,c.entangledLanes|=2;u;){var o=1<<31-ue(u);c.entanglements[1]|=o,u&=~o}Ye(i),(K&6)===0&&(vu=ae()+500,ci(0,!1))}}break;case 31:case 13:c=al(i,2),c!==null&&Ft(c,i,2),Vu(),kr(i,2)}if(i=tr(l),i===null&&lo(t,e,l,Du,n),i===a)break;a=i}a!==null&&l.stopPropagation()}else lo(t,e,l,null,n)}}function tr(t){return t=rr(t),Wr(t)}var Du=null;function Wr(t){if(Du=null,t=xl(t),t!==null){var e=Ia(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=zd(e),t!==null)return t;t=null}else if(n===31){if(t=Od(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Du=t,null}function cm(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(jh()){case Ld:return 2;case Hd:return 8;case au:case Kh:return 32;case Cd:return 268435456;default:return 32}default:return 32}}var er=!1,On=null,Rn=null,Dn=null,Wa=new Map,Fa=new Map,hn=[],ab="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Sd(t,e){switch(t){case"focusin":case"focusout":On=null;break;case"dragenter":case"dragleave":Rn=null;break;case"mouseover":case"mouseout":Dn=null;break;case"pointerover":case"pointerout":Wa.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Fa.delete(e.pointerId)}}function va(t,e,n,l,a,i){return t===null||t.nativeEvent!==i?(t={blockedOn:e,domEventName:n,eventSystemFlags:l,nativeEvent:i,targetContainers:[a]},e!==null&&(e=Fl(e),e!==null&&um(e)),t):(t.eventSystemFlags|=l,e=t.targetContainers,a!==null&&e.indexOf(a)===-1&&e.push(a),t)}function ib(t,e,n,l,a){switch(e){case"focusin":return On=va(On,t,e,n,l,a),!0;case"dragenter":return Rn=va(Rn,t,e,n,l,a),!0;case"mouseover":return Dn=va(Dn,t,e,n,l,a),!0;case"pointerover":var i=a.pointerId;return Wa.set(i,va(Wa.get(i)||null,t,e,n,l,a)),!0;case"gotpointercapture":return i=a.pointerId,Fa.set(i,va(Fa.get(i)||null,t,e,n,l,a)),!0}return!1}function om(t){var e=xl(t.target);if(e!==null){var n=Ia(e);if(n!==null){if(e=n.tag,e===13){if(e=zd(n),e!==null){t.blockedOn=e,nf(t.priority,function(){yd(n)});return}}else if(e===31){if(e=Od(n),e!==null){t.blockedOn=e,nf(t.priority,function(){yd(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function tu(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=tr(t.nativeEvent);if(n===null){n=t.nativeEvent;var l=new n.constructor(n.type,n);yo=l,n.target.dispatchEvent(l),yo=null}else return e=Fl(n),e!==null&&um(e),t.blockedOn=n,!1;e.shift()}return!0}function Ed(t,e,n){tu(t)&&n.delete(e)}function ub(){er=!1,On!==null&&tu(On)&&(On=null),Rn!==null&&tu(Rn)&&(Rn=null),Dn!==null&&tu(Dn)&&(Dn=null),Wa.forEach(Ed),Fa.forEach(Ed)}function Gi(t,e){t.blockedOn===e&&(t.blockedOn=null,er||(er=!0,Et.unstable_scheduleCallback(Et.unstable_NormalPriority,ub)))}var qi=null;function xd(t){qi!==t&&(qi=t,Et.unstable_scheduleCallback(Et.unstable_NormalPriority,function(){qi===t&&(qi=null);for(var e=0;e<t.length;e+=3){var n=t[e],l=t[e+1],a=t[e+2];if(typeof l!="function"){if(Wr(l||n)===null)continue;break}var i=Fl(n);i!==null&&(t.splice(e,3),e-=3,No(i,{pending:!0,data:a,method:n.method,action:l},l,a))}}))}function $l(t){function e(o){return Gi(o,t)}On!==null&&Gi(On,t),Rn!==null&&Gi(Rn,t),Dn!==null&&Gi(Dn,t),Wa.forEach(e),Fa.forEach(e);for(var n=0;n<hn.length;n++){var l=hn[n];l.blockedOn===t&&(l.blockedOn=null)}for(;0<hn.length&&(n=hn[0],n.blockedOn===null);)om(n),n.blockedOn===null&&hn.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(l=0;l<n.length;l+=3){var a=n[l],i=n[l+1],u=a[It]||null;if(typeof i=="function")u||xd(n);else if(u){var c=null;if(i&&i.hasAttribute("formAction")){if(a=i,u=i[It]||null)c=u.formAction;else if(Wr(a)!==null)continue}else c=u.action;typeof c=="function"?n[l+1]=c:(n.splice(l,3),l-=3),xd(n)}}}function rm(){function t(i){i.canIntercept&&i.info==="react-transition"&&i.intercept({handler:function(){return new Promise(function(u){return a=u})},focusReset:"manual",scroll:"manual"})}function e(){a!==null&&(a(),a=null),l||setTimeout(n,20)}function n(){if(!l&&!navigation.transition){var i=navigation.currentEntry;i&&i.url!=null&&navigation.navigate(i.url,{state:i.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var l=!1,a=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){l=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),a!==null&&(a(),a=null)}}}function Fr(t){this._internalRoot=t}ju.prototype.render=Fr.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(M(409));var n=e.current,l=ce();im(n,l,t,e,null,null)};ju.prototype.unmount=Fr.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;im(t.current,2,null,t,null,null),Vu(),e[Wl]=null}};function ju(t){this._internalRoot=t}ju.prototype.unstable_scheduleHydration=function(t){if(t){var e=Gd();t={blockedOn:null,target:t,priority:e};for(var n=0;n<hn.length&&e!==0&&e<hn[n].priority;n++);hn.splice(n,0,t),n===0&&om(t)}};var Md=Td.version;if(Md!=="19.2.3")throw Error(M(527,Md,"19.2.3"));J.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(M(188)):(t=Object.keys(t).join(","),Error(M(268,t)));return t=Gh(e),t=t!==null?Rd(t):null,t=t===null?null:t.stateNode,t};var cb={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:L,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(ya=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ya.isDisabled&&ya.supportsFiber))try{Pa=ya.inject(cb),ie=ya}catch{}var ya;Ku.createRoot=function(t,e){if(!Ad(t))throw Error(M(299));var n=!1,l="",a=tg,i=eg,u=ng;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(l=e.identifierPrefix),e.onUncaughtError!==void 0&&(a=e.onUncaughtError),e.onCaughtError!==void 0&&(i=e.onCaughtError),e.onRecoverableError!==void 0&&(u=e.onRecoverableError)),e=lm(t,1,!1,null,null,n,l,null,a,i,u,rm),t[Wl]=e.current,jr(t),new Fr(e)};Ku.hydrateRoot=function(t,e,n){if(!Ad(t))throw Error(M(299));var l=!1,a="",i=tg,u=eg,c=ng,o=null;return n!=null&&(n.unstable_strictMode===!0&&(l=!0),n.identifierPrefix!==void 0&&(a=n.identifierPrefix),n.onUncaughtError!==void 0&&(i=n.onUncaughtError),n.onCaughtError!==void 0&&(u=n.onCaughtError),n.onRecoverableError!==void 0&&(c=n.onRecoverableError),n.formState!==void 0&&(o=n.formState)),e=lm(t,1,!0,e,n??null,l,a,o,i,u,c,rm),e.context=am(null),n=e.current,l=ce(),l=ir(l),a=Mn(l),a.callback=null,Tn(n,a,l),n=l,e.current.lanes=n,ei(e,n),Ye(e),t[Wl]=e.current,jr(t),new ju(e)};Ku.version="19.2.3"});var gm=Ce((Ov,dm)=>{"use strict";function fm(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(fm)}catch(t){console.error(t)}}fm(),dm.exports=sm()});var Jm=Ce(lc=>{"use strict";var Ib=Symbol.for("react.transitional.element"),Pb=Symbol.for("react.fragment");function Km(t,e,n){var l=null;if(n!==void 0&&(l=""+n),e.key!==void 0&&(l=""+e.key),"key"in e){n={};for(var a in e)a!=="key"&&(n[a]=e[a])}else n=e;return e=n.ref,{$$typeof:Ib,type:t,key:l,ref:e!==void 0?e:null,props:n}}lc.Fragment=Pb;lc.jsx=Km;lc.jsxs=Km});var tt=Ce((Qv,km)=>{"use strict";km.exports=Jm()});var rh=N(gm());var Qt=N(Yt());var mm="glisse-styles";function hm(t){if(typeof document>"u"||document.getElementById(mm))return;let e=document.createElement("style");e.id=mm,e.textContent=t,document.head.prepend(e)}var pm=`/*!
 * MIT License
 * Copyright (c) 2026 Kelvin Zhang
 * https://github.com/0kzh/glisse
 */

:where(:root, [data-theme="light"]) {
  --lg-foreground: rgb(0 0 0 / 0.88);
  --lg-muted: rgb(60 60 67 / 0.6);
  --lg-glass: rgb(255 255 255 / 0.6);
  --lg-glass-active: rgb(236 236 240 / 0.85);
  --lg-edge: rgb(0 0 0 / 0.08);
  --lg-drop: rgb(0 0 0 / 0.06);
  --lg-selection: rgb(0 0 0 / 0.1);
  --lg-lens: rgb(0 0 0 / 0.03);
  --lg-lens-drop: rgb(0 0 0 / 0.11);
  --lg-segment-track: rgb(118 118 128 / 0.12);
  --lg-segment-thumb: rgb(255 255 255);
  --lg-segment-label: rgb(0 0 0);
  --lg-segment-lens: rgb(0 0 0 / 0.03);
  --lg-surface: rgb(250 250 252 / 0.86);
  --lg-surface-edge: rgb(0 0 0 / 0.08);
  --lg-shadow: rgb(25 25 35 / 0.12);
  --lg-highlight: rgb(60 60 67 / 0.09);
  --lg-separator: rgb(60 60 67 / 0.15);
  --lg-destructive: #ff383c;
  --lg-track: rgb(59 59 66 / 0.3);
  --lg-rail: rgb(0 0 0 / 0.1);
  --lg-on: #34c759;
  --lg-fill: #0088ff;
  --lg-ring: rgb(0 0 0 / 0.4);
  --lg-lens-shine: -1.5;
  --lg-rim-shine: 0.3;
  --lg-ease: cubic-bezier(0.25, 0.1, 0.25, 1);
}

:where([data-theme="dark"]) {
  --lg-foreground: rgb(255 255 255);
  --lg-muted: rgb(235 235 245 / 0.6);
  --lg-glass: rgb(40 40 40 / 0.62);
  --lg-glass-active: rgb(70 70 70 / 0.62);
  --lg-edge: rgb(255 255 255 / 0.08);
  --lg-drop: transparent;
  --lg-selection: rgb(255 255 255 / 0.145);
  --lg-lens: rgb(255 255 255 / 0.055);
  --lg-lens-drop: transparent;
  --lg-segment-track: transparent;
  --lg-segment-thumb: rgb(235 235 245 / 0.3);
  --lg-segment-label: rgb(255 255 255);
  --lg-segment-lens: transparent;
  --lg-surface: rgb(28 28 31 / 0.86);
  --lg-surface-edge: rgb(255 255 255 / 0.13);
  --lg-shadow: rgb(0 0 0 / 0.38);
  --lg-highlight: rgb(235 235 245 / 0.13);
  --lg-separator: rgb(235 235 245 / 0.16);
  --lg-destructive: #ff4245;
  --lg-track: rgb(235 235 245 / 0.3);
  --lg-rail: rgb(255 255 255 / 0.1);
  --lg-on: #30d158;
  --lg-fill: #0091ff;
  --lg-ring: rgb(255 255 255 / 0.5);
  --lg-lens-shine: 1;
  --lg-rim-shine: 0.13;
}

@media (prefers-color-scheme: dark) {
  :where(:root:not([data-theme="light"])) {
    --lg-foreground: rgb(255 255 255);
    --lg-muted: rgb(235 235 245 / 0.6);
    --lg-glass: rgb(40 40 40 / 0.62);
    --lg-glass-active: rgb(70 70 70 / 0.62);
    --lg-edge: rgb(255 255 255 / 0.08);
    --lg-drop: transparent;
    --lg-selection: rgb(255 255 255 / 0.145);
    --lg-lens: rgb(255 255 255 / 0.055);
    --lg-lens-drop: transparent;
    --lg-segment-track: transparent;
    --lg-segment-thumb: rgb(235 235 245 / 0.3);
    --lg-segment-label: rgb(255 255 255);
    --lg-segment-lens: transparent;
    --lg-surface: rgb(28 28 31 / 0.86);
    --lg-surface-edge: rgb(255 255 255 / 0.13);
    --lg-shadow: rgb(0 0 0 / 0.38);
    --lg-highlight: rgb(235 235 245 / 0.13);
    --lg-separator: rgb(235 235 245 / 0.16);
    --lg-destructive: #ff4245;
    --lg-track: rgb(235 235 245 / 0.3);
    --lg-rail: rgb(255 255 255 / 0.1);
    --lg-on: #30d158;
    --lg-fill: #0091ff;
    --lg-ring: rgb(255 255 255 / 0.5);
  --lg-lens-shine: 1;
    --lg-rim-shine: 0.13;
  }
}

/* Glass */

.lg-glass {
  position: relative;
  background-color: var(--lg-glass);
  background-image: var(--lg-rim, none);
  background-size: 100% 100%;
  -webkit-backdrop-filter: blur(var(--lg-blur, 3px)) var(--lg-filter, saturate(1.5));
  backdrop-filter: blur(var(--lg-blur, 3px)) var(--lg-filter, saturate(1.5));
  box-shadow:
    inset 0 0 0 0.5px var(--lg-edge),
    0 1px 3px var(--lg-drop);
}

/* Glass that paints its rim (see refraction.ts) draws its edge line there,
   under the light, which an inset shadow would cover. */
.lg-glass[data-rim] {
  box-shadow: 0 1px 3px var(--lg-drop);
}

/* Glass that draws its own bent rim (see drawn.ts) keeps the drawing under
   everything else it holds, and its lit rim over the drawing. */
.lg-glass[data-drawn] {
  isolation: isolate;
}

.lg-drawn {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.lg-drawn > canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.lg-drawn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--lg-rim, none) 0 0 / 100% 100%;
}

.lg-glass::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    circle 240px at var(--lg-x, 50%) var(--lg-y, 50%),
    rgb(255 255 255 / 0.035),
    rgb(255 255 255 / 0.025) 50%,
    transparent
  );
  opacity: 0;
  transition: opacity 220ms ease-in-out;
}

.lg-glass[data-pressed]::after {
  opacity: 1;
  transition-duration: 0s;
}

/* Button */

.lg-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 20px;
  color: var(--lg-foreground);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  /* A long press keeps pressing, as on iOS, rather than selecting the label. */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
  transition: background-color 200ms ease;
}

.lg-button[data-icon] {
  padding-left: 12px;
}

.lg-button[data-icon="only"] {
  width: 40px;
  padding: 0;
}

.lg-button > svg {
  flex: none;
  width: 20px;
  height: 20px;
}

/* Lights up at once when pressed, as on iOS, and fades on release. */
.lg-button:is(:active, [data-pressed]) {
  background-color: var(--lg-glass-active);
  transition-duration: 0s;
}

@media (hover: hover) and (pointer: fine) {
  .lg-button:hover {
    background-color: var(--lg-glass-active);
  }
}

.lg-button:disabled {
  background-color: var(--lg-glass);
  opacity: 0.35;
  cursor: default;
}

.lg-button[data-destructive]:not([data-tint]) {
  --lg-tint: var(--lg-destructive);
}

.lg-button:is([data-tint], [data-destructive]) {
  color: var(--lg-tint);
}

.lg-button[data-variant="filled"] {
  --lg-button-fill: var(--lg-tint, var(--lg-fill));
  color: #fff;
}

.lg-button[data-variant="filled"],
.lg-button[data-variant="filled"]:disabled {
  background-color: var(--lg-button-fill);
}

.lg-button[data-variant="filled"]:is(:active, [data-pressed]) {
  background-color: color-mix(in srgb, var(--lg-button-fill) 85%, #000);
}

@media (hover: hover) and (pointer: fine) {
  .lg-button[data-variant="filled"]:hover {
    background-color: color-mix(in srgb, var(--lg-button-fill) 88%, #fff);
  }

  .lg-button[data-variant="filled"]:hover:is(:active, [data-pressed]) {
    background-color: color-mix(in srgb, var(--lg-button-fill) 85%, #000);
  }
}

.lg-button:focus-visible,
.lg-tab:focus-visible,
.lg-switch:focus-visible,
.lg-menu-item:focus-visible {
  outline: 2px solid var(--lg-ring);
  outline-offset: 2px;
}

/* Tab bar */

/* The bar's padding is --lg-tab-inset. The selection fills its slot, less
   --lg-thumb-inset on every side: none here, 2px on a segmented control. */
.lg-tab-bar {
  --lg-tab-width: 84px;
  --lg-tab-height: 32px;
  --lg-tab-inset: 4px;
  --lg-thumb-inset: 0px;
  --lg-lens-grow-x: 27px;
  --lg-lens-grow-y: 20px;
  position: relative;
  display: inline-flex;
  padding: var(--lg-tab-inset);
  border-radius: calc(var(--lg-tab-height) / 2 + var(--lg-tab-inset));
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

.lg-tab-bar-glass {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.lg-tab-bar-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle 260px at var(--lg-x, 20%) 50%,
    rgb(255 255 255 / 0.09),
    rgb(255 255 255 / 0.045) 60%,
    transparent
  );
  opacity: 0;
  transition: opacity 160ms ease;
}

:is(.lg-tab-bar, .lg-segmented)[data-lifted] .lg-tab-bar-glass::before {
  opacity: 1;
  transition-duration: 120ms;
}

/* The labels, with room around them for the whole lifted lens, which
   refracts them (see lens.ts): Safari paints none of a filter outside its
   element. The room hangs outside the bar and takes no clicks. */
.lg-tab-labels {
  --lg-room-x: calc(var(--lg-lens-grow-x) / 2 + 4px);
  --lg-room-y: calc(var(--lg-lens-grow-y) / 2 + 4px);
  position: relative;
  z-index: 1;
  display: flex;
  margin: calc(var(--lg-room-y) * -1) calc(var(--lg-room-x) * -1);
  padding: var(--lg-room-y) var(--lg-room-x);
  pointer-events: none;
}

/* What the lifted lens shows in place of the labels: the same labels in full
   colour, laid exactly over them and seen only through the lens. */
.lg-tab-lensed {
  position: absolute;
  top: var(--lg-tab-inset);
  left: var(--lg-tab-inset);
  color: var(--lg-tab-selected, var(--lg-foreground));
  visibility: hidden;
}

:is(.lg-tab-bar, .lg-segmented)[data-lensing] .lg-tab-tint {
  visibility: hidden;
}

.lg-tab,
.lg-tab-copy {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--lg-tab-width);
  height: var(--lg-tab-height);
  font: inherit;
  font-size: 14px;
}

.lg-tab {
  position: relative;
  z-index: 1;
  padding: 0;
  border: 0;
  border-radius: calc(var(--lg-tab-height) / 2);
  color: var(--lg-muted);
  background: none;
  text-decoration: none;
  cursor: pointer;
  pointer-events: auto;
  -webkit-touch-callout: none;
  transition: color 200ms ease;
}

.lg-tab:focus-visible {
  outline-offset: -2px;
}

/* A tab's own label, wrapped so its colour can change at once, without the
   tab's colour transition. While the selection is over the selected tab (no
   data-away), it draws that tab's label alone: drawn twice, the copy on its
   own layer lands a fraction of a pixel off and the label beneath fringes it.
   Transparent, not hidden, so the tab keeps its name. */
.lg-tab-face {
  display: contents;
}

.lg-tab-bar:not([data-away]) .lg-tab[data-selected] > .lg-tab-face {
  color: transparent;
}

/* A label alone, centred by its letters: its box is trimmed to the height of
   the capitals above the baseline, so neither the font's ascent and descent
   nor the page's line height moves it off centre. Browsers without text-box
   centre its line box instead. */
.lg-tab-text {
  display: block;
  text-box: trim-both cap alphabetic;
}

/* Tabs with icons, as in an iOS tab bar: each icon over a small label, the
   others in full colour and the selected one in --lg-tab-selected. */
.lg-tab-bar[data-icons] {
  --lg-tab-width: 72px;
  --lg-tab-height: 52px;
  --lg-lens-grow-x: 24px;
  --lg-lens-grow-y: 16px;
  --lg-tab-selected: var(--lg-fill);
}

.lg-tab-bar[data-icons] :is(.lg-tab, .lg-tab-copy) {
  flex-direction: column;
  gap: 1px;
  font-size: 10px;
  font-weight: 500;
}

.lg-tab-bar[data-icons] .lg-tab {
  color: var(--lg-foreground);
}

.lg-tab-icon {
  display: flex;
}

.lg-tab-icon > svg {
  width: 26px;
  height: 26px;
}

@media (hover: hover) and (pointer: fine) {
  .lg-tab:hover {
    color: var(--lg-foreground);
  }
}

.lg-tab-lens,
.lg-tab-tint,
.lg-segmented-thumb {
  position: absolute;
  top: calc(var(--lg-tab-inset) + var(--lg-thumb-inset));
  left: calc(var(--lg-tab-inset) + var(--lg-thumb-inset));
  width: calc(var(--lg-tab-width) - 2 * var(--lg-thumb-inset));
  height: calc(var(--lg-tab-height) - 2 * var(--lg-thumb-inset));
  border-radius: calc(var(--lg-tab-height) / 2 - var(--lg-thumb-inset));
  pointer-events: none;
  transform: translateX(calc(var(--lg-tab-width) * var(--lg-index, 0)));
  transition: opacity 140ms ease;
  will-change: transform;
}

.lg-tab-tint {
  z-index: 1;
  overflow: hidden;
  color: var(--lg-tab-selected, var(--lg-foreground));
}

/* The labels again, set back by the tint's inset so they line up. */
.lg-tab-row {
  display: flex;
  height: var(--lg-tab-height);
  margin: calc(var(--lg-thumb-inset) * -1) 0 0 calc(var(--lg-thumb-inset) * -1);
  transform: translateX(calc(var(--lg-tab-width) * var(--lg-index, 0) * -1));
  transform-origin: 0 0;
  will-change: transform;
}

/* Lifted, the lens casts iOS's shadow (fitted to iOS 26.1), faded in with its
   lift (--lg-lift) and kept to iOS's size against its own stretch
   (--lg-lift-y). The page's --lg-lens-drop colours it: none on a dark page. */
.lg-tab-lens.lg-glass {
  z-index: 2;
  background-color: transparent;
  background-image: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  box-shadow: 0 calc(7px / var(--lg-lift-y, 1)) calc(11px / var(--lg-lift-y, 1))
    color-mix(in srgb, var(--lg-lens-drop) calc(var(--lg-lift, 0) * 100%), transparent);
  transition:
    opacity 140ms ease,
    background-color 140ms ease;
}

.lg-tab-bar[data-lifted] .lg-tab-lens.lg-glass {
  background-color: var(--lg-lens);
  transition-duration: 100ms;
}

.lg-tab-lens::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--lg-selection);
  transition: opacity 140ms ease;
}

.lg-tab-lens[data-pressed]::after {
  opacity: 0.2;
}

.lg-tab-bar[data-lifted] .lg-tab-lens::before {
  opacity: 0;
  transition-duration: 100ms;
}

:is(.lg-tab-bar, .lg-segmented)[data-refracting] .lg-tab-lens.lg-glass {
  background-image: var(--lg-rim, none);
}

/* On a light page (data-light), where a faint lens is lost against light
   glass, the lifted lens stands out as iOS 26.1's does: it drops under the
   labels and bends the bar's glass and the page behind it, where the browser
   can (--lg-filter), and takes iOS's brighter rim. The labels it bends on its
   own, so they bend once. At rest it lies over the labels, as before. */
:is(.lg-tab-bar, .lg-segmented)[data-refracting][data-light] .lg-tab-lens.lg-glass {
  background-image: var(--lg-rim-bright, var(--lg-rim, none));
}

.lg-segmented[data-refracting][data-light] .lg-tab-lens.lg-glass,
.lg-tab-bar[data-under][data-light] .lg-tab-lens.lg-glass {
  z-index: 0;
  -webkit-backdrop-filter: var(--lg-filter, none);
  backdrop-filter: var(--lg-filter, none);
}

/* A tab bar's lens on a light page changes over with its lift, so the
   selected label never changes colour at once: the grey of the selection,
   which lies over the label at rest, fades as the lens lifts (--lg-rest),
   the lens drops under the labels once it's gone (data-under), and only then
   does its fill come in (--lg-under), as its bend does. Settling, the same
   in reverse. */
.lg-tab-bar[data-light] .lg-tab-lens::before {
  opacity: var(--lg-rest, 1);
  transition: none;
}

.lg-tab-bar[data-light] .lg-tab-lens.lg-glass {
  background-color: color-mix(in srgb, var(--lg-lens) calc(var(--lg-under, 0) * 100%), transparent);
  transition: opacity 140ms ease;
}

:is(.lg-tab-bar, .lg-segmented)[data-hidden] :is(.lg-tab-lens, .lg-tab-tint, .lg-segmented-thumb),
:is(.lg-tab-bar, .lg-segmented):not([data-ready]):not(:has([data-selected])) :is(.lg-tab-lens, .lg-tab-tint, .lg-segmented-thumb) {
  opacity: 0;
}

/* Segmented control, sized as iOS 26.1's, measured from UIKit: a 32px
   capsule, segments of 13px labels, and under the selected one a thumb inset
   2px on every side. Held, the thumb fades and the lens lifts in its place,
   24px wider and 16px taller. Its track is the tab bar's glass. On a light
   page it's tinted with iOS's track fill (--lg-segment-track), or the white
   thumb would vanish against a white page; on a dark one it's the glass
   alone, exactly as the tab bar's. */
.lg-segmented {
  --lg-tab-width: 84px;
  --lg-tab-height: 32px;
  --lg-tab-inset: 0px;
  --lg-thumb-inset: 2px;
  --lg-lens-grow-x: 24px;
  --lg-lens-grow-y: 16px;
  --lg-tab-selected: var(--lg-segment-label);
  position: relative;
  display: inline-flex;
  border-radius: calc(var(--lg-tab-height) / 2);
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

.lg-segmented > .lg-tab-bar-glass {
  background-image: var(--lg-rim, none), linear-gradient(var(--lg-segment-track) 0 0);
}

.lg-segmented :is(.lg-tab, .lg-tab-copy) {
  font-size: 13px;
}

/* Every label in full colour, the selected one in medium, as UIKit sets it.
   With no colour to change under the thumb, there's no tint: a second copy
   of a label drawn over it would thicken it. */
.lg-segmented .lg-tab,
.lg-segmented .lg-tab:hover {
  color: var(--lg-segment-label);
}

.lg-segmented :is(.lg-tab, .lg-tab-copy)[data-selected] {
  font-weight: 500;
}

.lg-segmented .lg-tab-tint {
  display: none;
}

.lg-segmented-thumb {
  background: var(--lg-segment-thumb);
}

.lg-segmented[data-lifted] .lg-segmented-thumb {
  opacity: 0;
  transition-duration: 100ms;
}

.lg-segmented .lg-tab-lens::before {
  content: none;
}

.lg-segmented[data-lifted] .lg-tab-lens.lg-glass {
  background-color: var(--lg-segment-lens);
  transition-duration: 100ms;
}

/* Input */

.lg-input {
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  width: 100%;
  max-width: 360px;
  height: 40px;
  padding: 0 14px;
  border-radius: 20px;
  color: var(--lg-foreground);
  transition: background-color 200ms ease;
}

.lg-input:focus-within {
  background-color: var(--lg-glass-active);
}

.lg-input input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  color: inherit;
  background: none;
  font: inherit;
  font-size: 14px;
}

.lg-input input::placeholder {
  color: var(--lg-muted);
}

.lg-input input::-webkit-search-cancel-button {
  display: none;
}

.lg-input-icon {
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--lg-muted);
}

.lg-input-icon {
  display: grid;
  place-items: center;
}

.lg-input-icon > svg {
  width: 100%;
  height: 100%;
}

.lg-input-clear {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-right: -8px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--lg-muted);
  background: none;
  cursor: pointer;
}

.lg-input-clear svg {
  width: 14px;
  height: 14px;
}

.lg-input:has(input:disabled) {
  opacity: 0.35;
}

/* Switch and slider thumbs */

/* At rest, a white knob. Held, it lifts into clear glass, a lens that bends the
   track under its rim (see lens.ts), so the blur and brightening clear as it
   lifts and the track shows through true, all but a little frost:
   --lg-thumb-frost, the blur kept on the lifted glass. */
.lg-switch-thumb,
.lg-slider-thumb {
  --lg-settled: calc(1 - var(--lg-lift, 0));
  --lg-thumb-blur: calc(2px * var(--lg-settled) + var(--lg-thumb-frost, 0.5px) * var(--lg-lift, 0));
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  -webkit-backdrop-filter: blur(var(--lg-thumb-blur)) brightness(calc(1 + 0.15 * var(--lg-settled))) saturate(1.5);
  backdrop-filter: blur(var(--lg-thumb-blur)) brightness(calc(1 + 0.15 * var(--lg-settled))) saturate(1.5);
  box-shadow:
    0 6px 24px rgb(0 0 0 / 0.2),
    inset 0 0 0 1.5px rgb(255 255 255 / 0.5),
    inset 0 2px 1px rgb(255 255 255 / 0.45),
    inset 2px 7px 24px rgb(0 0 0 / 0.09),
    inset -2px -7px 24px rgb(255 255 255 / 0.16);
}

.lg-thumb-face {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #fff;
}

/* Switch */

.lg-switch {
  --lg-scale: 0.375;
  position: relative;
  flex: none;
  width: calc(160px * var(--lg-scale));
  height: calc(67px * var(--lg-scale));
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: none;
  cursor: pointer;
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
}


.lg-switch::before {
  content: "";
  position: absolute;
  inset: min(0px, calc((67px * var(--lg-scale) - 44px) / 2)) -8px;
}

/* What the lifted thumb refracts: the track, with room around it for the
   whole lens, since Safari paints none of a filter outside its element. */
.lg-switch-bed {
  position: absolute;
  inset: -6px -12px;
  pointer-events: none;
}

.lg-switch-track,
.lg-switch-fill {
  position: absolute;
  border-radius: 999px;
}

.lg-switch-track {
  inset: 6px 12px;
  background: var(--lg-track);
}

.lg-switch-fill {
  inset: 0;
  background: var(--lg-on);
  opacity: 0;
}

/* What the lifted thumb shows in place of the track: the track as Aave's
   switch draws it, a little smaller so the glass rings it, growing as the
   thumb does. It's seen only through the thumb (see lens.ts). */
.lg-switch-inset {
  visibility: hidden;
}

/* Centred by margins rather than a transform: WebKit sizes a filter's box by
   its content's untransformed layout, so nothing may sit past it even before
   a transform moves it back. */
.lg-switch-inset .lg-switch-track {
  inset: 0;
  width: calc((100% - 24px) * (0.85 + 0.1 * var(--lg-lift, 0)));
  height: calc((100% - 12px) * 0.75 * (0.525 + 0.45 * var(--lg-lift, 0)));
  margin: auto;
}

.lg-switch-thumb {
  top: 50%;
  left: calc(-21.95px * var(--lg-scale));
  width: calc(146px * var(--lg-scale));
  height: calc(92px * var(--lg-scale));
  transform: translate(0, -50%) scale(0.65);
}

.lg-switch[aria-checked="true"] .lg-switch-fill {
  opacity: 1;
}

.lg-switch[aria-checked="true"] .lg-switch-thumb {
  transform: translate(calc(57.9px * var(--lg-scale)), -50%) scale(0.65);
}

.lg-switch:disabled {
  opacity: 0.35;
  cursor: default;
}

/* Slider */

.lg-slider {
  position: relative;
  width: 100%;
  height: 40px;
}

/* What the lifted thumb refracts, with room around the track for the whole lens. */
.lg-slider-bed {
  position: absolute;
  inset: -4px -16px;
  pointer-events: none;
}

.lg-slider-track {
  position: absolute;
  inset: 21px 16px auto;
  height: 6px;
  border-radius: 3px;
  background: var(--lg-rail);
}

/* Ends under the middle of the thumb, where a lifted thumb shows it. It's
   rounded rather than clipped by the track, since Safari can't refract
   content clipped round its corners. */
.lg-slider-fill {
  display: block;
  width: calc((100% - 36px) * var(--lg-progress) + 18px);
  height: 100%;
  border-radius: inherit;
  background: var(--lg-fill);
}

/* What the lifted thumb shows in place of the track: the track as Aave's
   slider draws it, a little thicker as if magnified, growing as the thumb
   does. It's
   seen only through the thumb (see lens.ts). --lg-slider-line sets how thick
   it is once the thumb is fully lifted, and --lg-slider-bend how far the
   thumb's rim bends it. */
.lg-slider-magnified {
  visibility: hidden;
}

.lg-slider-magnified .lg-slider-track {
  inset: 0 16px;
  height: calc(var(--lg-slider-line, 8px) * (0.6 + 0.4 * var(--lg-lift, 0)));
  margin: auto 0;
  border-radius: 999px;
}

/* Within a few pixels of either end, the fill gives way from the middle of
   the thumb to the end of the track, so through the thumb an empty slider
   shows no fill and a full one no bare track. */
.lg-slider-magnified .lg-slider-fill {
  --lg-travel: calc((100% - 36px) * var(--lg-progress));
  width: calc(
    var(--lg-travel) + min(18px, var(--lg-travel) * 4) + max(0px, 18px - (100% - 36px - var(--lg-travel)) * 4)
  );
}

.lg-slider-thumb {
  top: 0;
  left: calc((100% - 36px) * var(--lg-progress) - 12px);
  width: 60px;
  height: 40px;
  scale: 0.6;
}

.lg-slider input {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 40px;
  margin: 0;
  background: transparent;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
}

.lg-slider input::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
}

/* The native thumb only takes the touch; the glass thumb is drawn beneath.
   iOS shades the native one even without its appearance, so hide it. */
.lg-slider input::-webkit-slider-thumb {
  width: 36px;
  height: 40px;
  margin-top: -17px;
  border: 0;
  background: transparent;
  box-shadow: none;
  opacity: 0;
  /* A touch on the thumb drags it rather than scrolling the page; the rest of
     the track still scrolls. Blocking touchmove instead would stop Safari's
     own drag. */
  touch-action: none;
  appearance: none;
  -webkit-appearance: none;
}

.lg-slider input::-moz-range-track {
  height: 6px;
  background: transparent;
}

.lg-slider input::-moz-range-thumb {
  width: 36px;
  height: 40px;
  border: 0;
  background: transparent;
  box-shadow: none;
  opacity: 0;
}

.lg-slider:has(input:focus-visible) .lg-slider-thumb {
  outline: 2px solid var(--lg-ring);
  outline-offset: 3px;
}

.lg-slider:has(input:disabled) {
  opacity: 0.35;
}

.lg-slider input:disabled {
  cursor: default;
}

/* Menu */

.lg-menu {
  position: relative;
  display: inline-flex;
}

.lg-menu-card {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  box-sizing: border-box;
  width: 200px;
  border-radius: 20px;
  color: var(--lg-foreground);
  font-size: 14px;
  transform-origin: calc(100% - 20px) 20px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.lg-menu-card[data-align="start"] {
  right: auto;
  left: 0;
  transform-origin: 20px 20px;
}

.lg-menu-card[data-phase="leaving"] {
  pointer-events: none;
}

.lg-menu-surface {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--lg-surface);
  -webkit-backdrop-filter: blur(22px) saturate(1.9);
  backdrop-filter: blur(22px) saturate(1.9);
  box-shadow:
    inset 0 0 0 0.5px var(--lg-surface-edge),
    0 12px 40px var(--lg-shadow);
  pointer-events: none;
}

.lg-menu-card[data-align="start"] .lg-menu-surface {
  right: auto;
  left: 0;
}

.lg-menu-glyph {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  pointer-events: none;
}

.lg-menu-card[data-align="start"] .lg-menu-glyph {
  right: auto;
  left: 0;
}

.lg-menu-glyph > svg {
  width: 20px;
  height: 20px;
}

.lg-menu-content {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 6px;
}

.lg-menu-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.11), rgb(255 255 255 / 0.025));
  opacity: 0;
  transition: opacity 120ms ease-out;
}

.lg-menu-card[data-pressed]::after {
  opacity: 1;
}

.lg-menu-plate {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 14px;
  background: var(--lg-highlight);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 100ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 80ms ease-out;
}

.lg-menu-item {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: 6px 12px;
  border: 0;
  border-radius: 14px;
  color: inherit;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.lg-menu-item > svg {
  flex: none;
  width: 16px;
  height: 16px;
}

.lg-menu-item:focus-visible {
  outline-offset: -2px;
  background: var(--lg-highlight);
}

@media (hover: hover) and (pointer: fine) {
  .lg-menu-item:hover:not(:disabled) {
    background: var(--lg-highlight);
  }
}

.lg-menu-card[data-scrubbing] .lg-menu-item {
  background: transparent;
  outline: none;
}

.lg-menu-item[data-destructive] {
  color: var(--lg-destructive);
}

.lg-menu-item:disabled {
  opacity: 0.38;
  cursor: default;
}

.lg-menu-separator {
  flex: none;
  margin: 7px 11px;
  border-top: 0.5px solid var(--lg-separator);
}

@media (prefers-reduced-motion: reduce) {
  .lg-menu-plate {
    transition: opacity 80ms ease-out;
  }

  .lg-menu-card {
    animation: lg-menu-fade 100ms ease-out;
  }
}

@keyframes lg-menu-fade {
  from {
    opacity: 0;
  }
}
`;var ms=N(Yt());function we(...t){return t.filter(Boolean).join(" ")}var sb=N(Yt());var la=new Set,Ju=0,Ir=0;function ob(t,e){let n=t.value-t.target,l=t.velocity,a=t.damping/2,i=a*a-t.stiffness;if(Math.abs(i)<1e-4){let u=Math.exp(-a*e),c=l+a*n;t.value=t.target+u*(n+c*e),t.velocity=u*(l-a*c*e)}else if(i>0){let u=Math.sqrt(i),c=-a+u,o=-a-u,r=(l-o*n)/(c-o),m=n-r;t.value=t.target+r*Math.exp(c*e)+m*Math.exp(o*e),t.velocity=r*c*Math.exp(c*e)+m*o*Math.exp(o*e)}else{let u=Math.sqrt(-i),c=Math.exp(-a*e),o=Math.cos(u*e),r=Math.sin(u*e);t.value=t.target+c*(n*o+(l+a*n)/u*r),t.velocity=c*(l*o-(a*l+t.stiffness*n)/u*r)}}function bm(t){Ju=0;let e=Math.min(.1,Math.max(0,(t-Ir)/1e3));Ir=t;for(let n of la)ob(n,e),Math.abs(n.value-n.target)<1e-4&&Math.abs(n.velocity)<.001&&(n.value=n.target,n.velocity=0,la.delete(n)),n.paint(n.value);la.size&&(Ju=requestAnimationFrame(bm))}function rb(){return document.documentElement.getAttribute("data-reduce-motion")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches}function Le(t,e,n,l){let a={value:t,target:t,velocity:0,stiffness:e,damping:n,paint:l};return{paint:()=>l(a.value),set(i,u=!1){if(a.target=i,u||document.hidden||rb()){a.value=i,a.velocity=0,la.delete(a),l(i);return}la.add(a),Ju||(Ir=Number(document.timeline?.currentTime??performance.now()),Ju=requestAnimationFrame(bm))},tune(i,u){a.stiffness=i,a.damping=u},stop:()=>{la.delete(a)}}}var gi=N(Yt());var fb="http://www.w3.org/2000/svg",si;function U(t,e){let n=document.createElementNS(fb,t);for(let[l,a]of Object.entries(e))n.setAttribute(l,String(a));return n}function aa(){if(si?.isConnected)return si;let t=U("svg",{width:0,height:0,"aria-hidden":"true"});return t.style.cssText="position:absolute;pointer-events:none",si=U("defs",{}),t.append(si),document.body.append(t),si}var db={angle:45,glow:.4,spread:.5,glowPower:1.5,edge:.5,edgeWidth:2,edgePower:1.5},gb={angle:30,glow:.4,spread:.5,glowPower:2,edge:.5,edgeWidth:1.5,edgePower:1},se=(t,e,n)=>Math.min(n,Math.max(e,t)),mb=t=>Math.tanh(1.7724538509*t);function fi(t,e,n,l,a){let i=Math.abs(t)-n+a,u=Math.abs(e)-l+a;return Math.hypot(Math.max(i,0),Math.max(u,0))+Math.min(Math.max(i,u),0)-a}function vm(t,e){let n=(e*e+t*t)/(2*t),l=0;for(let i=0;i<=200;i++){let u=i/200*e,c=u/Math.sqrt(n*n-u*u);l+=i===0||i===200?c/2:c}let a=l/200;return{radius:n,scale:a>0?.5/a:1}}var ym=(t,{radius:e,scale:n})=>{let l=Math.min(t,.999*e);return l/Math.sqrt(e*e-l*l)*n},ku=(()=>{let t=new Float32Array(256),e=0;for(let n=0;n<t.length;n++){let l=Math.max(.004,n/(t.length-1)),a=(1-(1-l)**4)**.25,i=Math.atan((1-l)**3/a**3),u=Math.asin(Math.sin(i)/1.5);t[n]=Math.tan(i-u)*(.6+a),e=Math.max(e,t[n])}return t.map(n=>n/e)})();function hb(t){let e=se(t,0,1)*(ku.length-1),n=Math.floor(e),l=ku[n];return l+(ku[Math.min(n+1,ku.length-1)]-l)*(e-n)}function xm({width:t,height:e},n){let l=n.depth*(n.relative?Math.min(t,e):1);return n.maxDepth===void 0?l:Math.min(l,n.maxDepth)}function Mm(t,e){let n=t.width/2,l=t.height/2,a=se(t.radius,0,Math.min(n,l)),i=xm(t,e);if(e.bezel){let E=se(Math.max(a,i),0,Math.min(n,l));return(d,g,p)=>{if(p.edge=fi(d,g,n,l,a),p.x=p.y=p.amount=0,p.edge>=0||i<=0||-p.edge>=i)return;let b=Math.abs(d)-n+E,y=Math.abs(g)-l+E;if(b>0&&y>0){let x=Math.hypot(b,y);p.x=Math.sign(d)*b/x,p.y=Math.sign(g)*y/x}else b>y?p.x=Math.sign(d):p.y=Math.sign(g);p.amount=hb(-p.edge/i)}}let u=e.dome*(e.relative?Math.min(t.width,t.height):1),{splay:c}=e,o=Math.max(0,n-i),r=Math.max(0,l-i),m=se(a,0,Math.min(o,r)),s=i>0?1/(i*Math.SQRT2):1e6,f=Math.max(.01,Math.min(u,Math.min(n,l)-1)),h=u>0?vm(f,n):null,v=u>0?vm(f,l):null,S=.5*Math.min(n,l);return(E,d,g)=>{if(g.edge=fi(E,d,n,l,a),g.x=g.y=g.amount=0,g.edge>=0)return;let p=Math.abs(E),b=Math.abs(d),y=h?Math.sign(E)*ym(p,h):se(E/n,-1,1),x=v?Math.sign(d)*ym(b,v):se(d/l,-1,1);if(c<1&&S>0){let T=Math.max(0,1-(l-b)/S)*(1-c),R=Math.max(0,1-(n-p)/S)*(1-c);if(T>.001||R>.001){let D=Math.hypot(y,x);y*=1-T,x*=1-R;let A=Math.hypot(y,x);A>.001&&(y*=D/A,x*=D/A)}}g.x=y,g.y=x,g.amount=.5*(1+mb(fi(E,d,o,r,m)*s))}}var Tm=({edge:t,amount:e})=>Math.min(1,e*20,-t);function pb(t,e,n,l){let{width:a,height:i}=t,u=a/2,c=i/2,o=Math.max(1,Math.round(a*l)),r=Math.max(1,Math.round(i*l)),m=new Uint8ClampedArray(o*r*4),s=new Uint8ClampedArray(o*r*4),f=new Uint8ClampedArray(o*r*4),h=new Uint8ClampedArray(o*r*4),v=(y,x,T,R=255)=>{y[x]=y[x+1]=y[x+2]=T,y[x+3]=R},S=Mm(t,e),E={edge:0,x:0,y:0,amount:0},d=Math.cos(n.angle*Math.PI/180),g=Math.sin(n.angle*Math.PI/180),p=(1-n.spread)*Math.SQRT2,b=n.spread*Math.SQRT2;for(let y=0;y<r;y++)for(let x=0;x<o;x++){let T=(y*o+x)*4,R=(x+.5)/o*a-u,D=(y+.5)/r*i-c;S(R,D,E);let{edge:A,amount:w}=E,Z=Math.round(255*se(-A,0,1));if(A>=0){v(h,T,0,Z),v(m,T,128),v(s,T,128),v(f,T,128,0);continue}v(h,T,Math.round(255*w),Z),v(m,T,Math.round((.5-.5*E.x*w)*255)),v(s,T,Math.round((.5-.5*E.y*w)*255));let V=Math.abs(se(R/u,-1,1)*d+se(D/c,-1,1)*g),j=b>.001?n.glow*se((V-p)/b,0,1)**n.glowPower*w:0,z=n.edge*Math.max(0,1+A/n.edgeWidth)*V**n.edgePower,Ot=Math.min(1,j+z);v(f,T,Math.round(127*Ot+128),Math.round(255*Tm(E)))}return{columns:o,rows:r,across:m,down:s,light:f,shape:h}}function Am(t,e,n){let{width:l,height:a}=t,i=Math.max(1,Math.round(l*n)),u=Math.max(1,Math.round(a*n)),c=new Float32Array(i*u*4),o=Mm(t,e),r={edge:0,x:0,y:0,amount:0};for(let m=0;m<u;m++)for(let s=0;s<i;s++){if(o((s+.5)/i*l-l/2,(m+.5)/u*a-a/2,r),r.edge>=0)continue;let f=(m*i+s)*4;c[f]=r.x*r.amount,c[f+1]=r.y*r.amount,c[f+2]=Math.max(0,Tm(r)),c[f+3]=se(-r.edge,0,1)}return{columns:i,rows:u,data:c}}var Sm=new Map;function bb(t,e){let n=Sm.get(t);if(n)return n;let l=e(),a=document.createElement("canvas");a.width=l.columns,a.height=l.rows;let i=a.getContext("2d");if(!i)return null;let u=i.createImageData(l.columns,l.rows),c=r=>(u.data.set(r),i.putImageData(u,0,0),a.toDataURL()),o={across:c(l.across),down:c(l.down),light:c(l.light),shape:c(l.shape)};return Sm.set(t,o),o}var ns=()=>/AppleWebKit\//.test(navigator.userAgent)&&!/Chrom(?:e|ium)\//.test(navigator.userAgent),$u=["1 0 0 0 0  0 0 0 0 0  0 0 0 0 0","0 0 0 0 0  0 1 0 0 0  0 0 0 0 0","0 0 0 0 0  0 0 0 0 0  0 0 1 0 0"],ia=(t,e,n)=>U("feColorMatrix",{in:t,type:"matrix",values:e,result:n}),Wu=(t,e,n,l,a)=>U("feComposite",{in:t,in2:e,operator:"arithmetic",k2:n,k3:l,result:a});function vb(t){return[...$u.map((e,n)=>ia(`ray-${t}-${n}`,`${e}  0 0 0 0.3333 0`,`light-${t}-${n}`)),Wu(`light-${t}-0`,`light-${t}-1`,1,1,`light-${t}-01`),Wu(`light-${t}-01`,`light-${t}-2`,1,1,`spread-${t}`),ia(`spread-${t}`,"3 0 0 0 0  0 3 0 0 0  0 0 3 0 0  0 0 0 1 0",`bent-${t}`)]}function yb(t,e){let n=e==="light"?1:0,l=[],a=c=>[0,1,2].map(o=>o===c?`${[0,1,2].map(r=>r===c?n?-1:1:0).join(" ")} 0 ${n}`:"0 0 0 0 0").join("  ")+"  0 0 0 1 0";$u.forEach((c,o)=>{let r=`ray-${t}-${o}`;l.push(ia(r,"0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1",`cover-${t}-${o}`),ia(r,"0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",`covers-${t}-${o}`),ia(r,a(o),`inks-${t}-${o}`))}),l.push(U("feBlend",{in:`cover-${t}-0`,in2:`cover-${t}-1`,mode:"lighten",result:`most-${t}-01`}),U("feBlend",{in:`most-${t}-01`,in2:`cover-${t}-2`,mode:"lighten",result:`most-${t}`}),ia(`most-${t}`,`0 0 0 0 ${n}  0 0 0 0 ${n}  0 0 0 0 ${n}  1 0 0 0 0`,`inked-${t}`));let i=`inked-${t}`;$u.forEach((c,o)=>{let[r,m]=n?[`covers-${t}-${o}`,`inks-${t}-${o}`]:[`inks-${t}-${o}`,`covers-${t}-${o}`];l.push(Wu(i,r,o===0?.5:1,.5,`inked-${t}-${o}a`),Wu(`inked-${t}-${o}a`,m,1,-.5,`inked-${t}-${o}b`)),i=`inked-${t}-${o}b`});let u=U("feComponentTransfer",{in:i,result:`bent-${t}`});return u.append(U("feFuncA",{type:"linear",slope:2,intercept:0})),l.push(u),l}function ls(t,e,n){let l=e?"objectBoundingBox":"userSpaceOnUse",a=U("filter",{filterUnits:l,primitiveUnits:l,"color-interpolation-filters":"sRGB"});if(e)for(let[c,o]of Object.entries({x:0,y:0,width:1,height:1}))a.setAttribute(c,String(o));let i=t.length===1,u=t.map(({maps:c,shine:o,blur:r,ink:m},s)=>{let f=p=>i?p:`${p}-${s}`,h=(p,b)=>U("feImage",{href:p,preserveAspectRatio:"none",result:b}),v=[h(c.across,`across-${s}`),h(c.down,`down-${s}`),h(c.light,f("raw")),U("feFlood",{"flood-color":"rgb(128, 128, 128)",result:`neutral-${s}`})];n&&v.push(h(c.shape,f("shape"))),a.append(...v);for(let p of["across","down"]){let b=U("feComponentTransfer",{in:`${p}-grey-${s}`,result:`${p}-pull-${s}`});b.append(U("feFuncA",{type:"linear",slope:0,intercept:.5})),a.append(U("feComposite",{in:`${p}-${s}`,in2:`neutral-${s}`,operator:"over",result:`${p}-grey-${s}`}),b)}let S=$u.map((p,b)=>{let y=U("feDisplacementMap",{in:"SourceGraphic",in2:`across-pull-${s}`,xChannelSelector:"R",yChannelSelector:"A",result:`across-${s}-${b}`}),x=U("feDisplacementMap",{in:`across-${s}-${b}`,in2:`down-pull-${s}`,xChannelSelector:"A",yChannelSelector:"R",result:`ray-${s}-${b}`});return v.push(y),a.append(y,x),[y,x]});a.append(...m?yb(s,m):vb(s));let E;if(r){E=U("feGaussianBlur",{in:`bent-${s}`,result:`soft-${s}`});let p=h(c.shape,`weight-${s}`);v.push(p),a.append(p,U("feColorMatrix",{in:`weight-${s}`,type:"matrix",values:"0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0",result:`bends-${s}`}),E,U("feComposite",{in:`soft-${s}`,in2:`bends-${s}`,operator:"in",result:`soft-in-${s}`}),U("feComposite",{in:`bent-${s}`,in2:`bends-${s}`,operator:"out",result:`sharp-${s}`}),U("feComposite",{in:`soft-in-${s}`,in2:`sharp-${s}`,operator:"arithmetic",k2:1,k3:1,result:`softened-${s}`}))}let d=r?`softened-${s}`:`bent-${s}`,g=d;if(o>0){let p=`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 ${-.5019607843137255}`;a.append(U("feColorMatrix",{in:f("raw"),type:"matrix",values:p,result:`glint-${s}`}),U("feComposite",{in:`glint-${s}`,in2:d,operator:"arithmetic",k2:o,k3:1,result:`lit-${s}`})),g=`lit-${s}`}else if(o<0){let p=`0 0 ${o} 0 ${1-128*o/255}`;a.append(U("feColorMatrix",{in:f("raw"),type:"matrix",values:`${p}  ${p}  ${p}  0 0 0 0 1`,result:`shade-${s}`}),U("feComposite",{in:`shade-${s}`,in2:d,operator:"arithmetic",k1:1,result:`lit-${s}`})),g=`lit-${s}`}return a.append(U("feComposite",{in:g,in2:f("raw"),operator:"in",result:f("inside")})),{boxed:v,rays:S,soften:E}});if(!i)for(let c of["raw","inside",...n?["shape"]:[]]){let o=U("feMerge",{result:c});t.forEach((r,m)=>o.append(U("feMergeNode",{in:`${c}-${m}`}))),a.append(o)}return a.append(U("feComposite",{in:"SourceGraphic",in2:"raw",operator:"out",result:"outside"}),U("feComposite",{in:"inside",in2:"outside",operator:"arithmetic",k2:1,k3:1,result:"seen"})),n&&a.append(U("feComposite",{in:"seen",in2:"shape",operator:"in"})),{filter:a,parts:u}}function as(t,e,n,l,a){if(!a)for(let[i,u]of Object.entries({x:0,y:0,width:n,height:l}))t.filter.setAttribute(i,String(u));e.forEach((i,u)=>{let c=t.parts[u],o=[1+.2*i.dispersion,1+.1*i.dispersion,1];c.rays.forEach(([s,f],h)=>{s.setAttribute("scale",String((a?i.reach/n:i.reach)*o[h])),f.setAttribute("scale",String((a?i.reach/l:i.reach)*o[h]))});let r=Math.max(i.blur,.01);c.soften?.setAttribute("stdDeviation",a?`${r/n} ${r/l}`:String(r));let m=a?{x:i.x/n,y:i.y/l,width:i.width/n,height:i.height/l}:{x:i.x,y:i.y,width:i.width,height:i.height};for(let s of c.boxed)for(let[f,h]of Object.entries(m))s.setAttribute(f,String(h))})}function di(t,e=getComputedStyle(t)){let n=t.offsetWidth,l=t.offsetHeight;if(!n||!l)return null;let a=e.borderTopLeftRadius,i=Math.min(n/2,l/2,a.endsWith("%")?Math.min(n,l)*parseFloat(a)/100:parseFloat(a)||0);return{width:n,height:l,radius:i}}function is(t,e,n){let l=parseFloat(t.getPropertyValue("--lg-lens-shine"))||0,a=n.strengthProperty?parseFloat(t.getPropertyValue(n.strengthProperty)):NaN,i=l>0?n.darkStrength??n.strength:n.strength,u=Number.isFinite(a)?a:i,c=n.dispersionProperty?parseFloat(t.getPropertyValue(n.dispersionProperty)):NaN,o=Number.isFinite(c)?Math.max(0,c):n.dispersion;return{reach:u*(n.bezel?xm(e,n):Math.min(e.width,e.height)),dispersion:o,page:l}}function us(t,e){let n=getComputedStyle(t),l=di(t,n);if(!l)return null;let{width:a,height:i,radius:u}=l,{reach:c,dispersion:o,page:r}=is(n,l,e),m=e.paintsLight?0:e.shine===void 0?r:Math.sign(r)*e.shine,s=Math.min(devicePixelRatio||1,2),f=r<0&&!e.paintsLight?gb:db,h=e.edgeWidth===void 0?f:{...f,edgeWidth:e.edgeWidth},v=[a,i,u,s,JSON.stringify(h),JSON.stringify(e)].join("|"),S=bb(v,()=>pb(l,e,h,s)),E=e.blur??0,d=e.ink?r<0?"light":"dark":void 0;return S?{maps:S,key:`${v}|${m}|${d}`,shine:m,ink:d,blur:E,reach:c,dispersion:o,width:a,height:i}:null}var Pr=new Map,zm=0;function ts(t){let{content:e}=t,n=e.offsetWidth,l=e.offsetHeight,a=e.getBoundingClientRect(),i=[];if(n&&l){let s=a.width/n||1;for(let f of t.members){let h=f.glass.getBoundingClientRect();if(!f.fit||!h.width||!h.height)continue;let v=h.width/s,S=h.height/s,E=f.fit.reach*(Math.min(v,S)/Math.min(f.fit.width,f.fit.height))*f.amount,{dispersion:d}=f.fit,g=f.fit.blur*f.amount;f.placed={x:(h.left-a.left)/s,y:(h.top-a.top)/s,width:v,height:S,reach:E,dispersion:d,blur:g},i.push(f)}}if(!i.length){t.placed="",e.style.removeProperty("filter"),t.standIn&&e.style.removeProperty("visibility"),t.standIn=!1;return}let u=ns(),c=i.some(s=>s.replaces);t.standIn=c;let o=i.map(s=>s.fit.key).join(`
`)+(c?`
stand-in`:"");(o!==t.built||!t.graph)&&(t.graph?.filter.remove(),t.graph=ls(i.map(s=>s.fit),u,c),aa().append(t.graph.filter),t.built=o,t.placed="");let r=i.map(s=>s.placed),m=[n,l,...r.flatMap(({x:s,y:f,width:h,height:v,reach:S,dispersion:E,blur:d})=>[s,f,h,v,S,E,d])].map(s=>s.toFixed(2)).join(" ");if(m!==t.placed){t.placed=m,as(t.graph,r,n,l,u),t.graph.filter.id=`${t.name}-${++t.version}`,e.style.filter=`url("#${t.graph.filter.id}")`;for(let s of i){if(!s.replaces)continue;e.style.visibility="visible";let{x:f,y:h,width:v,height:S}=s.placed,E=s.replaces.getBoundingClientRect(),d=a.width/n||1;Om(s.replaces,{image:`url("${s.fit.maps.shape}"), linear-gradient(#000, #000)`,position:`${f+(a.left-E.left)/d}px ${h+(a.top-E.top)/d}px, 0 0`,size:`${v}px ${S}px, 100% 100%`})}}}var Em=["image","position","size","repeat","composite"];function Om(t,e){for(let l of Em)t.style.removeProperty(`-webkit-mask-${l}`),t.style.removeProperty(`mask-${l}`);if(!e)return;let n={...e,repeat:"no-repeat",composite:"exclude"};for(let l of Em)t.style.setProperty(`-webkit-mask-${l}`,l==="composite"?"xor":n[l]),t.style.setProperty(`mask-${l}`,n[l])}function Un(t,e,n,l){let a=Pr.get(e);a||(a={content:e,lenses:0,members:[],name:`glisse-lens-${zm++}`,standIn:!1,built:"",placed:"",version:0},Pr.set(e,a));let i=a;i.lenses++;let u={glass:t,options:n,replaces:l,amount:1},c=!1,o=()=>{u.fit=us(t,n)??void 0},r={setActive(m){m!==c&&(c=m,c?(i.members.push(u),o()):(i.members.splice(i.members.indexOf(u),1),l&&Om(l)),ts(i))},update(m){m!==void 0&&(u.amount=se(m,0,1)),c&&ts(i)},refit(){c&&(o(),ts(i))},destroy(){r.setActive(!1),!(--i.lenses>0)&&(i.graph?.filter.remove(),Pr.delete(e))}};return r}function Rm(t,e){let n=`glisse-bend-${zm++}`,l=null,a=null,i="",u=0,c=0,o=()=>{if(!l||!a)return;let{width:r,height:m,dispersion:s,blur:f}=l,h=l.reach*u;as(a,[{x:0,y:0,width:r,height:m,reach:h,dispersion:s,blur:f*u}],r,m,!1),a.filter.id=`${n}-${++c}`,t.style.setProperty("--lg-filter",`url("#${a.filter.id}")`)};return{update(r){r=Math.round(se(r,0,1)*20)/20,r!==u&&(u=r,o())},refit(){l=us(t,e),l&&(l.key!==i&&(a?.filter.remove(),a=ls([{maps:l.maps,shine:0,blur:l.blur}],!1,!1),aa().append(a.filter),i=l.key),o())},destroy(){a?.filter.remove(),a=null,t.style.removeProperty("--lg-filter")}}}var es=new Map;function Dm(t,e){let n=us(t,e);if(!n)return;let{maps:l,key:a,shine:i,reach:u,dispersion:c,width:o,height:r}=n,m=`${a}|${u}|${c}`,s=es.get(m);if(!s){let f=ls([{maps:l,shine:i}],!1,!1);as(f,[{x:0,y:0,width:o,height:r,reach:u,dispersion:c,blur:0}],o,r,!1),s=`glisse-backdrop-${es.size}`,f.filter.id=s,aa().append(f.filter),es.set(m,s)}t.style.setProperty("--lg-filter",`url("#${s}") saturate(1.5)`)}var Cm=()=>ns()&&!!_m(),Sb=(t,e,n)=>Math.min(n,Math.max(e,t)),Eb=`#version 300 es
out vec2 uv;
out vec2 st;
void main() {
  vec2 corner = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  uv = vec2(corner.x + 1.0, 1.0 - corner.y) * 0.5;
  st = (corner + 1.0) * 0.5;
  gl_Position = vec4(corner, 0.0, 1.0);
}`,xb=`#version 300 es
precision highp float;
uniform sampler2D under;
uniform sampler2D field;
uniform vec2 size;
uniform vec2 window;
uniform vec2 origin;
uniform float scale;
uniform float reach;
uniform float split;
in vec2 st;
out vec4 colour;

vec4 at(vec2 point) {
  vec2 from = (origin + point * scale) / window;
  if (any(lessThan(from, vec2(0.0))) || any(greaterThan(from, vec2(1.0)))) return vec4(0.0);
  return texture(under, from);
}

void main() {
  vec2 point = st * size;
  vec2 pull = texture(field, st).rg * reach;
  vec4 red = at(point - pull * (1.0 + 0.2 * split));
  vec4 green = at(point - pull * (1.0 + 0.1 * split));
  vec4 blue = at(point - pull);
  colour = vec4(red.r, green.g, blue.b, (red.a + green.a + blue.a) / 3.0);
}`,Mb=`#version 300 es
precision highp float;
uniform sampler2D under;
uniform vec2 stride;
in vec2 st;
out vec4 colour;
void main() {
  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (int i = -8; i <= 8; i++) {
    float x = float(i) * 0.375;
    float weight = exp(-0.5 * x * x);
    sum += texture(under, st + stride * x) * weight;
    total += weight;
  }
  colour = sum / total;
}`,Tb=`#version 300 es
precision highp float;
uniform sampler2D under;
uniform sampler2D field;
uniform float saturation;
uniform vec4 tint;
in vec2 uv;
out vec4 colour;
void main() {
  vec4 lens = texture(field, uv);
  vec4 seen = texture(under, uv);
  float grey = dot(seen.rgb, vec3(0.2126, 0.7152, 0.0722));
  seen.rgb = clamp(mix(vec3(grey), seen.rgb, saturation), 0.0, seen.a);
  seen.rgb = seen.rgb * (1.0 - tint.a) + tint.rgb * tint.a * seen.a;
  colour = seen * min(lens.b, lens.a);
}`,Bn;function _m(){if(Bn!==void 0)return Bn;if(Bn=null,typeof document>"u")return null;try{Bn=Ab()}catch{}return Bn}function Ab(){let t=document.createElement("canvas"),e=document.createElement("canvas"),n=t.getContext?.("webgl2",{antialias:!1,depth:!1,stencil:!1}),l=e.getContext?.("2d");if(!n||!l)return null;let a=(s,...f)=>{let h=n.createProgram();for(let[v,S]of[[n.VERTEX_SHADER,Eb],[n.FRAGMENT_SHADER,s]]){let E=n.createShader(v);n.shaderSource(E,S),n.compileShader(E),n.attachShader(h,E)}return n.linkProgram(h),n.getProgramParameter(h,n.LINK_STATUS)?(n.useProgram(h),n.uniform1i(n.getUniformLocation(h,"under"),0),n.uniform1i(n.getUniformLocation(h,"field"),1),{program:h,at:Object.fromEntries(f.map(v=>[v,n.getUniformLocation(h,v)]))}):null},i=a(xb,"size","window","origin","scale","reach","split"),u=a(Mb,"stride"),c=a(Tb,"saturation","tint");if(!i||!u||!c)return null;n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),n.enable(n.SCISSOR_TEST);let o=ua(n),r=n.createFramebuffer();t.addEventListener("webglcontextlost",()=>{Bn=void 0});let m=Number(n.getParameter(n.MAX_TEXTURE_SIZE))||4096;return{canvas:t,gl:n,bend:i,soften:u,finish:c,under:o,largest:m,drawn:new Map,frame:r,paper:e,pen:l}}function ua(t){let e=t.createTexture();return t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),e}var wm=(t,e)=>t?.endsWith("%")?parseFloat(t)/100:t==="left"||t==="top"?0:t==="right"||t==="bottom"?1:e;function cs(t,e,n){t.beginPath(),n>0&&t.roundRect?t.roundRect(e.x,e.y,e.width,e.height,Math.min(n,e.width/2,e.height/2)):t.rect(e.x,e.y,e.width,e.height)}function Fu(t,e,n,l,a,i,u,c){if(!n||!l||!a.width||!a.height)return;let o=a.width,r=a.height,m=Math.max(a.width/n,a.height/l),s=Math.min(a.width/n,a.height/l),f=i==="cover"?m:i==="contain"?s:i==="scale-down"?Math.min(1,s):i==="none"?1:0;f&&(o=n*f,r=l*f);let[h,v]=u.split(" ");t.save(),cs(t,a,c),t.clip(),t.drawImage(e,a.x+(a.width-o)*wm(h,.5),a.y+(a.height-r)*wm(v,.5),o,r),t.restore()}function Nm(t){let e=[],n=0,l=0;for(let a=0;a<t.length;a++)t[a]==="("?n++:t[a]===")"?n--:t[a]===","&&!n&&(e.push(t.slice(l,a).trim()),l=a+1);return e.push(t.slice(l).trim()),e}var zb={top:0,right:90,bottom:180,left:270};function Ob(t,e,n){let l=/^linear-gradient\((.*)\)$/s.exec(e)?.[1];if(!l)return null;let a=Nm(l),i=180,u=a[0];if(/^-?[\d.]+deg$/.test(u))i=parseFloat(u),a.shift();else if(u.startsWith("to ")){let[S,E]=u.slice(3).split(" ");if(E===void 0)i=zb[S]??180;else{let d=S==="left"||E==="left"?-1:1,g=S==="top"||E==="top"?1:-1;i=Math.atan2(d*n.height,g*n.width)*180/Math.PI}a.shift()}let c=i*Math.PI/180,o=Math.sin(c),r=-Math.cos(c),m=(Math.abs(n.width*o)+Math.abs(n.height*r))/2,s=n.x+n.width/2,f=n.y+n.height/2,h=t.createLinearGradient(s-o*m,f-r*m,s+o*m,f+r*m),v=a.map(S=>{let E=/^(.*?)\s+(-?[\d.]+)(%|px)$/.exec(S);return E?{colour:E[1],at:E[3]==="%"?parseFloat(E[2])/100:parseFloat(E[2])/(2*m)}:{colour:S,at:NaN}});if(v.length<2)return null;Number.isNaN(v[0].at)&&(v[0].at=0),Number.isNaN(v.at(-1).at)&&(v.at(-1).at=1);for(let S=1;S<v.length;S++){if(!Number.isNaN(v[S].at))continue;let E=S;for(;Number.isNaN(v[E].at);)E++;for(let d=S;d<E;d++)v[d].at=v[S-1].at+(v[E].at-v[S-1].at)*(d-S+1)/(E-S+1)}try{let S=0;for(let E of v)h.addColorStop(S=Sb(Math.max(E.at,S),0,1),E.colour)}catch{return null}return h}var Lm=new Map;function Rb(t,e){let n=Lm.get(t);return n||(n=new Image,n.crossOrigin="anonymous",n.src=t,Lm.set(t,n)),n.complete||n.addEventListener("load",e,{once:!0}),n}var Um=t=>t==="transparent"||/,\s*0\)$|\/\s*0\)$/.test(t);function Db(t,e,n,l,a){let i=parseFloat(e.borderTopLeftRadius)||0,u=e.backgroundColor,c=Nm(e.backgroundImage).at(-1),o=/^url\(["']?(.*?)["']?\)$/.exec(c)?.[1],r=o?Rb(o,l):null,m=!Um(u);if(m||c!=="none"){let h=e.backgroundSize.split(",").at(-1).trim(),v=e.backgroundPosition.split(",").at(-1).trim();a.push({element:t,alpha:n,media:r??void 0,paint(S,E){if(m&&(S.fillStyle=u,cs(S,E,i),S.fill()),r){if(!this.barred&&r.complete&&r.naturalWidth){let g=h==="cover"||h==="contain"?h:h==="auto"?"none":"fill";Fu(S,r,r.naturalWidth,r.naturalHeight,E,g,v,i)}return}let d=Ob(S,c,E);d&&(S.fillStyle=d,cs(S,E,i),S.fill())}})}let s=e.objectFit,f=e.objectPosition;if(t instanceof HTMLImageElement)t.complete||t.addEventListener("load",l,{once:!0}),a.push({element:t,alpha:n,media:t,paint(h,v){!this.barred&&t.complete&&t.naturalWidth&&Fu(h,t,t.naturalWidth,t.naturalHeight,v,s,f,i)}});else if(t instanceof HTMLVideoElement)a.push({element:t,alpha:n,media:t,live:()=>`${t.currentTime}|${t.readyState}`,paint(h,v){!this.barred&&t.readyState>=2&&Fu(h,t,t.videoWidth,t.videoHeight,v,s,f,i)}});else if(t instanceof HTMLCanvasElement){let h=0;a.push({element:t,alpha:n,media:t,live:()=>h++,paint(v,S){!this.barred&&t.width&&t.height&&Fu(v,t,t.width,t.height,S,"fill",f,i)}})}}function wb(t,e,n,l){let a=[],i=document.createRange(),u=n.measureText("x"),c=u.fontBoundingBoxAscent??u.actualBoundingBoxAscent,o=u.fontBoundingBoxDescent??u.actualBoundingBoxDescent,r=e.textTransform==="uppercase",m=e.textTransform==="lowercase",s=null,f=0,h=0,v=0;for(let S of t.data){i.setStart(t,v),i.setEnd(t,v+=S.length);let E=i.getClientRects()[0];if(!E||!E.width||!S.trim()){s=null;continue}if(s&&(Math.abs(E.top-h)>E.height/2||E.left<f-1)&&(s=null),!s){let d=E.top+(E.height-c-o)/2+c;a.push(s={text:"",x:E.left-l.left,y:d-l.top}),h=E.top}s.text+=r?S.toUpperCase():m?S.toLowerCase():S,f=E.right}return a}function Lb(t,e,n,l,a,i){if(!t.data.trim())return;let u=`${n.fontStyle} ${n.fontWeight} ${n.fontSize} ${n.fontFamily}`,c=n.letterSpacing==="normal"?"0px":n.letterSpacing,o=n.webkitTextFillColor||n.color;a.font=u;let r=wb(t,n,a,e.getBoundingClientRect());!r.length||Um(o)||i.push({element:e,alpha:l,paint(m,s){m.font=u,m.fillStyle=o,m.textBaseline="alphabetic","letterSpacing"in m&&(m.letterSpacing=c);for(let f of r)m.fillText(f.text,s.x+f.x,s.y+f.y);"letterSpacing"in m&&(m.letterSpacing="0px")}})}var os=new Map;function Hb(t){let e=os.get(t);if(e)return e;let n={source:t,lenses:new Set,pieces:[],stale:!0,version:0,measured:-1,from:new DOMRect,boxes:[],key:"",whole:null,stop(){}},l=()=>{n.stale=!0},a=new MutationObserver(o=>{o.some(r=>!(r.target instanceof Element)||!r.target.closest(".lg-drawn"))&&l()});a.observe(t,{subtree:!0,childList:!0,characterData:!0,attributes:!0});let i=new ResizeObserver(l);i.observe(t),window.addEventListener("resize",l),t.addEventListener("load",l,!0),document.fonts?.addEventListener?.("loadingdone",l);let u=new MutationObserver(l);u.observe(document.documentElement,{attributes:!0});let c=matchMedia("(prefers-color-scheme: dark)");return c.addEventListener?.("change",l),n.stop=()=>{u.disconnect(),c.removeEventListener?.("change",l),a.disconnect(),i.disconnect(),window.removeEventListener("resize",l),t.removeEventListener("load",l,!0),document.fonts?.removeEventListener?.("loadingdone",l);let{whole:o}=n;o&&o.of===Bn&&o.of.gl.deleteTexture(o.texture),n.whole=null},os.set(t,n),n}function Cb(t,e){t.stale=!1,t.version++;let n=t.pieces=[],l=()=>{t.version++},a=(i,u)=>{let c=getComputedStyle(i);if(c.display==="none"||i.classList.contains("lg-drawn")||(u*=parseFloat(c.opacity)||0,u<=0))return;let o=c.visibility!=="hidden";o&&Db(i,c,u,l,n);for(let r of i.childNodes)r instanceof Element?a(r,u):o&&r instanceof Text&&Lb(r,i,c,u,e,n)};a(t.source,1)}function _b(t,e,n){if(t.measured===e)return;t.measured=e,t.stale&&Cb(t,n);let l=t.from=t.source.getBoundingClientRect(),a=`${t.version}`;t.boxes=t.pieces.map(i=>{let u=i.element.getBoundingClientRect();return a+=`|${(u.x-l.x).toFixed(2)},${(u.y-l.y).toFixed(2)},${u.width.toFixed(2)},${u.height.toFixed(2)}`,i.live&&(a+=`,${i.live()}`),u}),t.key=a}function Nb(t){let e=document.createElement("canvas");e.width=e.height=1;let n=e.getContext("2d");try{return n.drawImage(t,0,0,1,1),n.getImageData(0,0,1,1),!0}catch{return!1}}function Bm(t,e,n,l,a,i,u,c,o){let{gl:r,pen:m,paper:s}=t,f=e.from;(s.width!==u||s.height!==c)&&(s.width=u,s.height=c);let h=()=>{m.setTransform(1,0,0,1,0,0),m.clearRect(0,0,u,c),m.setTransform(i,0,0,i,-l*i,-a*i),m.save(),m.beginPath(),m.rect(f.x,f.y,f.width,f.height),m.clip(),e.pieces.forEach((S,E)=>{let d=e.boxes[E];o&&(d.right<o.left||d.left>o.right||d.bottom<o.top||d.top>o.bottom)||(m.globalAlpha=S.alpha,S.paint(m,d))}),m.restore()},v=()=>{r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,n),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,s)};h();try{return v(),!0}catch{for(let S of e.pieces)S.media&&!S.barred&&(S.barred=!Nb(S.media));s.width=u,h();try{return v(),!0}catch{return!1}}}var Ub=1<<23;function Bb(t,e,n){let{width:l,height:a}=e.from;if(!l||!a||e.pieces.some(o=>o.live))return null;let i=Math.min(n,t.largest/Math.max(l,a),Math.sqrt(Ub/(l*a)));if(i<Math.min(n,2))return null;let u=`${e.key}|${i}`,c=e.whole;return c?.of===t&&c.key===u?c:(c?.of!==t&&(c=e.whole={texture:ua(t.gl),of:t,key:"",density:0,across:0,down:0}),c.key="",c.density=i,c.across=Math.ceil(l*i),c.down=Math.ceil(a*i),Bm(t,e,c.texture,e.from.x,e.from.y,i,c.across,c.down,null)?(t.paper.width=t.paper.height=0,c.key=u,c):null)}var Pu=new Set,Gm=0,Hm=0;function qm(){Hm++;for(let t of Pu)t.draw(Hm);Gm=Pu.size?requestAnimationFrame(qm):0}var Iu=new Map;function Gb(t,e){t.fillStyle="#0000",t.fillStyle=e;let n=String(t.fillStyle);if(n.startsWith("#")){let[c,o,r]=[1,3,5].map(m=>parseInt(n.slice(m,m+2),16)/255);return[c,o,r,1]}let[l=0,a=0,i=0,u=1]=(n.match(/[\d.]+/g)??[]).map(Number);return[l/255,a/255,i/255,u]}function Ym(t,e,n){let l=Hb(e),a=document.createElement("i");a.className="lg-drawn",a.setAttribute("aria-hidden","true");let i=document.createElement("canvas"),u=i.getContext("2d");a.append(i);let c=!1,o=null,r=0,m=0,s=0,f="",h=null,v=null,S="",E=()=>{let b=getComputedStyle(t);if(o=di(t,b),!o)return;({reach:r,dispersion:m}=is(b,o,n));let y=parseFloat(b.getPropertyValue("--lg-blur"));s=Number.isFinite(y)?y:3;let x=Math.min(devicePixelRatio||1,2),T=[o.width,o.height,o.radius,x,JSON.stringify(n)].join("|");T!==f&&(h=null),f=T,S=""},d=b=>{if(h&&v===b)return h;let y=Iu.get(f);if(!y){Iu.size>32&&Iu.clear();let T=Math.min(devicePixelRatio||1,2);Iu.set(f,y=Am(o,n,T))}let{gl:x}=b;return x.activeTexture(x.TEXTURE1),h=ua(x),v=b,x.texImage2D(x.TEXTURE_2D,0,x.RGBA16F,y.columns,y.rows,0,x.RGBA,x.FLOAT,y.data),h},g={draw(b){let y=_m();if(!y||!u||!o)return;a.parentNode!==t&&t.prepend(a);let x=t.getBoundingClientRect();if(!x.width||!x.height||x.bottom<0||x.right<0||x.top>innerHeight||x.left>innerWidth)return;_b(l,b,y.pen);let T=Math.min(devicePixelRatio||1,3),R=Math.min(x.width,x.height)/Math.min(o.width,o.height),D=r*R/2,A=s*R,w=Math.ceil(D*(1+.2*m))+1,Z=getComputedStyle(t).backgroundColor,V=l.from,j=[(x.x-V.x).toFixed(2),(x.y-V.y).toFixed(2),x.width.toFixed(2),x.height.toFixed(2),T,D,m,A,Z,f,l.key].join("|");if(j===S)return;S=j;let{gl:z,pen:Ot}=y,Nt,Ut,Rt,jt=1,ot=Bb(y,l,T);if(ot)Nt=ot.texture,Ut=[ot.across,ot.down],Rt=[(x.x-V.x)*ot.density,(x.y-V.y)*ot.density],jt=ot.density/T;else{let Kt=Math.ceil((x.width+2*w)*T),O=Math.ceil((x.height+2*w)*T),B=new DOMRect(x.x-w,x.y-w,x.width+2*w,x.height+2*w);if(!Bm(y,l,y.under,B.x,B.y,T,Kt,O,B))return;Nt=y.under,Ut=[Kt,O],Rt=[w*T,w*T]}let Q=Math.round(x.width*T),rt=Math.round(x.height*T);(y.canvas.width<Q||y.canvas.height<rt)&&(y.canvas.width=Math.max(y.canvas.width,Q),y.canvas.height=Math.max(y.canvas.height,rt));let fe=`${Q}|${rt}`,H=y.drawn.get(fe);if(!H){if(y.drawn.size>=16){for(let Kt of y.drawn.values())for(let O of Kt)z.deleteTexture(O);y.drawn.clear()}H=[ua(z),ua(z),ua(z)];for(let Kt of H)z.bindTexture(z.TEXTURE_2D,Kt),z.texImage2D(z.TEXTURE_2D,0,z.RGBA,Q,rt,0,z.RGBA,z.UNSIGNED_BYTE,null);y.drawn.set(fe,H)}z.activeTexture(z.TEXTURE1),z.bindTexture(z.TEXTURE_2D,d(y)),z.activeTexture(z.TEXTURE0),z.viewport(0,0,Q,rt),z.scissor(0,0,Q,rt),z.bindFramebuffer(z.FRAMEBUFFER,y.frame);let xt=Nt,Ae=(Kt,O)=>(z.useProgram(Kt.program),z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,O,0),z.bindTexture(z.TEXTURE_2D,xt),xt=O,Kt.at),yt=Ae(y.bend,H[0]);z.uniform2f(yt.size,Q,rt),z.uniform2f(yt.window,...Ut),z.uniform2f(yt.origin,...Rt),z.uniform1f(yt.scale,jt),z.uniform1f(yt.reach,D*T),z.uniform1f(yt.split,m),z.drawArrays(z.TRIANGLES,0,3);let ze=A*T;ze>=.2&&(z.uniform2f(Ae(y.soften,H[1]).stride,ze/Q,0),z.drawArrays(z.TRIANGLES,0,3),z.uniform2f(Ae(y.soften,H[2]).stride,0,ze/rt),z.drawArrays(z.TRIANGLES,0,3)),z.bindFramebuffer(z.FRAMEBUFFER,null),z.clearColor(0,0,0,0),z.clear(z.COLOR_BUFFER_BIT),z.useProgram(y.finish.program),z.bindTexture(z.TEXTURE_2D,xt),z.uniform1f(y.finish.at.saturation,1.5),z.uniform4f(y.finish.at.tint,...Gb(Ot,Z)),z.drawArrays(z.TRIANGLES,0,3),i.width!==Q||i.height!==rt?(i.width=Q,i.height=rt):u.clearRect(0,0,Q,rt),u.drawImage(y.canvas,0,y.canvas.height-rt,Q,rt,0,0,Q,rt)}},p={setActive(b){b!==c&&(c=b,c?(E(),t.prepend(a),t.setAttribute("data-drawn",""),l.lenses.add(g),Pu.add(g),Gm||=requestAnimationFrame(qm)):(a.remove(),t.removeAttribute("data-drawn"),l.lenses.delete(g),Pu.delete(g)))},update(){},refit(){c&&E()},destroy(){p.setActive(!1),h&&v&&v===Bn&&v.gl.deleteTexture(h),h=null,!l.lenses.size&&(l.stop(),os.delete(e))}};return p}var fs={strength:2,strengthProperty:"--lg-glass-bend",dispersion:.6,dispersionProperty:"--lg-glass-dispersion",depth:.3,maxDepth:36,dome:0,splay:1,relative:!0,bezel:!0,paintsLight:!0},Gn=(t,e,n)=>Math.min(n,Math.max(e,t)),Xm=1.22,qb=.5;function Yb({width:t,height:e,radius:n},l,a,i=[0,0,0,0]){let u=Math.max(1,Math.round(t*a)),c=Math.max(1,Math.round(e*a)),o=new Uint8ClampedArray(u*c*4),r=t/2,m=e/2,s=Gn(n,0,Math.min(r,m)),f=.5/a;for(let h=0;h<c;h++)for(let v=0;v<u;v++){let S=(v+.5)/u*t-r,E=(h+.5)/c*e-m,d=-fi(S,E,r,m,s);if(d<-f||d>2*Xm)continue;let g=Math.abs(S)-r+s,p=Math.abs(E)-m+s,b=0,y=0;if(g>0&&p>0){let j=Math.hypot(g,p);b=Math.sign(S)*g/j,y=Math.sign(E)*p/j}else g>p?b=Math.sign(S):y=Math.sign(E);let x=Math.abs(b+y),T=Math.max(0,d)/(Xm*Math.sqrt(Math.max(1,x))),R=Gn((d+f)*a,0,1),D=Gn((Math.min(qb,d+f)-Math.max(0,d-f))*a,0,1),A=T<1?l*Math.min(1,x)**1.5*(1-T**1.5)*R:0,w=i[3]*D*(1-A),Z=A+w;if(Z<=0)continue;let V=(h*u+v)*4;for(let j=0;j<3;j++)o[V+j]=Math.round((255*A+i[j]*w)/Z);o[V+3]=Math.round(255*Z)}return{columns:u,rows:c,data:o}}function Xb(t,e){t.fillStyle="#0000",t.fillStyle=e;let n=String(t.fillStyle);if(n.startsWith("#")){let[c,o,r]=[1,3,5].map(m=>parseInt(n.slice(m,m+2),16));return[c,o,r,1]}let[l=0,a=0,i=0,u=1]=(n.match(/[\d.]+/g)??[]).map(Number);return[l,a,i,u]}var Vm=new Map,rs;function ds(t){let e=getComputedStyle(t),n=di(t,e);if(rs??=document.createElement("canvas").getContext("2d"),!n||!rs)return;let l=parseFloat(e.getPropertyValue("--lg-rim-shine")),a=Number.isFinite(l)?Gn(l,0,1):.13,i=Xb(rs,e.getPropertyValue("--lg-edge").trim()||"transparent"),u=Math.min(devicePixelRatio||1,3),c=[n.width,n.height,n.radius,a,i,u].join("|"),o=Vm.get(c);if(!o){let{columns:r,rows:m,data:s}=Yb(n,a,u,i),f=document.createElement("canvas");f.width=r,f.height=m;let h=f.getContext("2d");if(!h)return;let v=h.createImageData(r,m);v.data.set(s),h.putImageData(v,0,0),o=`url("${f.toDataURL()}")`,Vm.set(c,o)}t.style.setProperty("--lg-rim",o),t.setAttribute("data-rim","")}var tc=new Set,ec;function Vb(t){if(tc.add(t),!ec){let e=()=>tc.forEach(a=>a()),n=new MutationObserver(e);n.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"],subtree:!0});let l=matchMedia("(prefers-color-scheme: dark)");l.addEventListener?.("change",e),ec=()=>{n.disconnect(),l.removeEventListener?.("change",e)}}return()=>{tc.delete(t),!tc.size&&(ec?.(),ec=void 0)}}function Zb(t){if("requestIdleCallback"in window){let n=requestIdleCallback(t,{timeout:500});return()=>cancelIdleCallback(n)}let e=setTimeout(t,50);return()=>clearTimeout(e)}function gs(t,e,n){let l,a=!1,i=new ResizeObserver(()=>{l?.(),l=Zb(()=>{a=!0,e()})});return i.observe(t),{refit:()=>{a&&e()},stop:()=>{l?.(),i.disconnect();for(let u of n)t.style.removeProperty(u)}}}var nc=()=>/Chrom(?:e|ium)\//.test(navigator.userAgent),Qb="data-glisse-backdrop";function jb(t){let{left:e,top:n,right:l,bottom:a}=t.getBoundingClientRect();for(let i=t.parentElement;i&&i!==document.body;i=i.parentElement){let u=getComputedStyle(i);if(!/hidden|clip|auto|scroll/.test(`${u.overflow} ${u.overflowX} ${u.overflowY}`))continue;let c=i.getBoundingClientRect();e=Math.max(e,c.left),n=Math.max(n,c.top),l=Math.min(l,c.right),a=Math.min(a,c.bottom)}return new DOMRect(e,n,Math.max(0,l-e),Math.max(0,a-n))}function Kb(t){let e=t.getBoundingClientRect(),n=l=>{if(l.contains(t)||t.contains(l))return!1;let a=jb(l);return a.left<e.right&&a.right>e.left&&a.top<e.bottom&&a.bottom>e.top};for(let l=t.parentElement;l&&l!==document.body;l=l.parentElement){let a=[...l.querySelectorAll(`[${Qb}]`)].find(n);if(a)return a}return null}var ca=new Map,Qm=0;function jm(){for(let t of ca.values())t.values().next().value?.update();Qm=ca.size?requestAnimationFrame(jm):0}function Jb(t,e){let n=Cm(),l=n?Ym(t,e,fs):Un(t,e,fs),a=!1,i=gs(t,()=>{if(ds(t),a)return l.refit();if(a=!0,l.setActive(!0),n)return;let u=ca.get(e);u||ca.set(e,u=new Set),u.add(l),Qm||=requestAnimationFrame(jm)},["--lg-rim"]);return{refit:i.refit,stop:()=>{i.stop();let u=ca.get(e);u?.delete(l),u&&!u.size&&ca.delete(e),l.destroy()}}}function ul(t,e=!1,n=!0){let l=(0,gi.useRef)(null);(0,gi.useEffect)(()=>{let a=t.current;if(!a)return;if(e){let o=n?Zm:Zm.filter(r=>r!=="--lg-filter");return gs(a,()=>Fb(a,n&&nc()),o).stop}let i=Kb(a),u=i?Jb(a,i):gs(a,()=>{ds(a),nc()&&Dm(a,fs)},["--lg-filter","--lg-rim"]);l.current=u.refit;let c=Vb(()=>ds(a));return()=>{l.current=null,c(),u.stop(),a.removeAttribute("data-rim")}},[t,e,n]),(0,gi.useEffect)(()=>l.current?.())}var Zm=["--lg-filter","--lg-rim","--lg-rim-bright"],ss=new Map;function kb(t,e){let n=new Float32Array(128),l=0;for(let a=0;a<n.length;a++){let i=Math.max(.001,a/(n.length-1)),u=(1-(1-i)**4)**.25,c=Math.atan((1-i)**3/u**3),o=Math.asin(Math.sin(c)/1.5);n[a]=Math.tan(c-o)*(e+u*t),l=Math.max(l,n[a])}return{samples:n,maximum:l}}function $b(t,e,n){let l=Math.min(devicePixelRatio||1,2),a=Gn(Math.min(t,e)*.12,4,10),i=Gn(Math.min(t,e)*.2,8,24),{samples:u,maximum:c}=kb(a,i),o=document.createElement("canvas");o.width=Math.ceil(t*l),o.height=Math.ceil(e*l);let r=o.getContext("2d"),m=r.createImageData(o.width,o.height),s=r.createImageData(o.width,o.height),f=r.createImageData(o.width,o.height);for(let E=0;E<o.height;E++)for(let d=0;d<o.width;d++){let g=(d+.5)*t/o.width-t/2,p=(E+.5)*e/o.height-e/2,b=Math.abs(g)-(t/2-n),y=Math.abs(p)-(e/2-n),x=Math.max(b,0),T=Math.max(y,0),R=Math.hypot(x,T),D=n-(R+Math.min(Math.max(b,y),0)),A=R>0?x/R*Math.sign(g):b>y?Math.sign(g):0,w=R>0?T/R*Math.sign(p):b>y?0:Math.sign(p),Z=0;if(D>=0&&D<a){let Ut=D/a*(u.length-1),Rt=Math.floor(Ut),jt=u[Rt],ot=u[Math.min(Rt+1,u.length-1)];Z=jt+(ot-jt)*(Ut-Rt)}let V=(E*o.width+d)*4;m.data[V]=Math.round(127.5+A*Z/c*127.5),m.data[V+1]=Math.round(127.5+w*Z/c*127.5),m.data[V+2]=128,m.data[V+3]=255;let j=-(A+w)*Math.SQRT1_2,z=Math.max(j,0)**3,Ot=Math.max(-j,0)**3;s.data[V]=s.data[V+1]=s.data[V+2]=255;let Nt=0;if(D>=0){let Ut=[.18,.42,.66].map(Q=>Math.exp(-(((D-Q)/.22)**2))),Rt=Math.max(...Ut);Nt=Rt*(.06+.8*z+.35*Ot)*.85;for(let Q=0;Q<3;Q++)s.data[V+Q]=Math.round(255*(.65+.35*(Rt?Ut[Q]/Rt:0)));let jt=[.4,.5,.6].map(Q=>Math.exp(-(((D-Q)/.4)**2))),ot=Math.max(...jt);for(let Q=0;Q<3;Q++)f.data[V+Q]=Math.round(255*(.85+.15*(ot?jt[Q]/ot:0)));f.data[V+3]=Math.round(Gn(ot*(.55+.3*z+.15*Ot),0,1)*255)}s.data[V+3]=Math.round(Gn(Nt,0,1)*255)}r.putImageData(m,0,0);let h=o.toDataURL();r.putImageData(s,0,0);let v=o.toDataURL();r.putImageData(f,0,0);let S=o.toDataURL();return{displacement:h,highlight:v,brightHighlight:S,scale:c*2}}function Wb(t,e,n){let l=[t,e,n].join("-"),a=ss.get(l);if(a)return a;let{displacement:i,highlight:u,brightHighlight:c,scale:o}=$b(t,e,n),r=`glisse-selection-${ss.size}`,m={x:0,y:0,width:t,height:e},s=U("filter",{id:r,...m,filterUnits:"userSpaceOnUse",primitiveUnits:"userSpaceOnUse","color-interpolation-filters":"sRGB"});s.append(U("feImage",{href:i,...m,preserveAspectRatio:"none",result:"field"}));let f=[["r",1.035,"1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"],["g",1,"0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"],["b",.965,"0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"]];for(let[v,S,E]of f)s.append(U("feDisplacementMap",{in:"SourceGraphic",in2:"field",scale:o*S,xChannelSelector:"R",yChannelSelector:"G",result:`${v}-ray`}),U("feColorMatrix",{in:`${v}-ray`,type:"matrix",values:E,result:v}));s.append(U("feComposite",{in:"r",in2:"g",operator:"arithmetic",k2:1,k3:1,result:"rg"}),U("feComposite",{in:"rg",in2:"b",operator:"arithmetic",k2:1,k3:1})),aa().append(s);let h={filter:`url("#${r}")`,rim:`url("${u}")`,brightRim:`url("${c}")`};return ss.set(l,h),h}function Fb(t,e){let n=t.offsetWidth,l=t.offsetHeight;if(!n||!l)return;let a=getComputedStyle(t).borderTopLeftRadius,i=Math.min(n/2,l/2,a.endsWith("%")?Math.min(n,l)*parseFloat(a)/100:parseFloat(a)),{filter:u,rim:c,brightRim:o}=Wb(n,l,i);e&&t.style.setProperty("--lg-filter",u),t.style.setProperty("--lg-rim",c),t.style.setProperty("--lg-rim-bright",o)}var tv=N(tt());var oa=N(Yt());var $m=N(tt());var hs=(0,oa.forwardRef)(function({className:e,...n},l){let a=(0,oa.useRef)(null);return(0,oa.useImperativeHandle)(l,()=>a.current),ul(a),(0,$m.jsx)("div",{ref:a,className:we("lg-glass",e),...n})});var ps=N(Yt());var qn=N(Yt());function cl(t,e,n){let[l,a]=(0,qn.useState)(e),i=t!==void 0,u=(0,qn.useRef)(n);(0,qn.useEffect)(()=>{u.current=n});let c=(0,qn.useCallback)(o=>{i||a(o),u.current?.(o)},[i]);return[i?t:l,c]}var Wm=N(tt());var bs=N(Yt());var Fm=N(tt());var lv=N(Yt());var Im=N(tt());var Gt=N(Yt());var mi=(t,e)=>e||performance.now()-t>=150;var dt=N(tt());var ol=(t,e,n)=>Math.min(n,Math.max(e,t)),av=["ArrowLeft","ArrowRight","Home","End"],hi=[1024,58.9,676,47.8],ac=.5,iv=[2500,94,576,44.2],uv={strength:.2,strengthProperty:"--lg-tab-bend",dispersion:2,dispersionProperty:"--lg-tab-dispersion",depth:4,dome:0,splay:1,ink:!0,blur:2},cv={strength:.3,strengthProperty:"--lg-segment-bend",dispersion:.1,depth:2.5,dome:0,splay:1};function ov({bar:t,glass:e,thumb:n,labels:l,lensed:a,lens:i,tint:u,row:c},o,r,m){let s=[...t.querySelectorAll(".lg-tab")],f=0,h=0,v=0,S=0,E=0,d=16,g=12,p=-1,b=!1,y=0,x=null,T={x:0,lift:0},R=Un(i,a,o,l),D=r&&nc()?Rm(i,o):null,A=!1,w=()=>t.toggleAttribute("data-away",p<0||Math.abs(T.x-p*f)>.5),Z=()=>{let O=getComputedStyle(t);E=parseFloat(O.paddingLeft)||0,f=(t.clientWidth-E-(parseFloat(O.paddingRight)||0))/s.length,S=parseFloat(O.getPropertyValue("--lg-thumb-inset"))||0,h=f-2*S,v=i.offsetHeight,d=parseFloat(O.getPropertyValue("--lg-lens-grow-x"))||0,g=parseFloat(O.getPropertyValue("--lg-lens-grow-y"))||0},V=()=>{let{x:O,lift:B}=T,Dt=1+d/h*B,de=1+g/v*B,sl=`translateX(${O}px) scale(${Dt}, ${de})`;i.style.transform=u.style.transform=sl,n&&(n.style.transform=sl),i.style.setProperty("--lg-lift",String(ol(B,0,1))),i.style.setProperty("--lg-lift-y",String(de)),c.style.transform=`scale(${1/Dt}, ${1/de}) translate(${-O+(Dt-1)*(S+h/2)}px, ${(de-1)*(S+v/2)}px)`,!x&&B<.01&&delete t.dataset.refracting,w(),B>.01!==A&&(A=B>.01,t.toggleAttribute("data-lensing",A),R.setActive(A));let fc=ol(B,0,1),pi=ol((B-ac)/(1-ac),0,1);i.style.setProperty("--lg-rest",String(ol(1-B/ac,0,1))),i.style.setProperty("--lg-under",String(pi)),t.toggleAttribute("data-under",B>ac),R.update(fc),D?.update(pi)},j=Le(0,hi[0],hi[1],O=>{T.x=O,V()}),z=Le(0,hi[2],hi[3],O=>{T.lift=O,V()}),Ot=(O,B,Dt=!1)=>{let[de,sl,fc,pi]=x?iv:hi;j.tune(de,sl),z.tune(fc,pi),j.set(O,Dt),z.set(B?1:0,Dt)},Nt=(O=!1)=>{if(w(),x)return;let B=p>=0;B?delete t.dataset.hidden:t.dataset.hidden="",B&&Ot(p*f,!1,O||!b),b=B},Ut=O=>ol(x.anchor+O.clientX-x.x,0,f*(s.length-1)),Rt=(O,B)=>{e.style.setProperty("--lg-x",`${ol((O.clientX-B.left)/B.width*100,0,100)}%`),i.style.setProperty("--lg-x",`${ol((O.clientX-B.left-E-S-T.x)/h*100,0,100)}%`)},jt=()=>{let O=x;return x=null,delete t.dataset.lifted,delete i.dataset.pressed,O&&t.hasPointerCapture(O.id)&&t.releasePointerCapture(O.id),O},ot=!1,Q=O=>{let B=O.target.closest(".lg-tab");if(!O.isPrimary||O.button!==0||x||!B||O.metaKey||O.ctrlKey||O.shiftKey||O.altKey)return;cancelAnimationFrame(y),y=0,Z(),t.toggleAttribute("data-light",parseFloat(getComputedStyle(i).getPropertyValue("--lg-lens-shine"))<0),D?.refit();let Dt=t.getBoundingClientRect();x={id:O.pointerId,x:O.clientX,anchor:s.indexOf(B)*f,moved:!1,box:Dt,at:performance.now()},ot=!1,t.dataset.lifted="",t.dataset.refracting="",delete t.dataset.hidden,i.dataset.pressed="",Rt(O,Dt),Ot(x.anchor,!0,!b),b=!0},rt=O=>{O.pointerId===x?.id&&(!x.moved&&Math.abs(O.clientX-x.x)>6&&(x.moved=!0,t.setPointerCapture(O.pointerId)),x.moved&&Ot(Ut(O),!0),Rt(O,x.box))},fe=O=>{if(O.pointerId!==x?.id||O.type==="lostpointercapture"&&O.target!==t)return;let B=Math.round(Ut(O)/f),{moved:Dt,box:de}=jt(),sl=O.clientY>=de.top-24&&O.clientY<=de.bottom+24;O.type==="pointerup"&&(Dt||sl)?(ot=!0,y=requestAnimationFrame(()=>{y=0,Nt()}),s[B]?.click()):(ot=Dt,Nt())},H=O=>{x&&O.cancelable&&mi(x.at,x.moved)&&O.preventDefault()},xt=O=>{if(O.isTrusted&&ot&&O.detail!==0){ot=!1,O.preventDefault();return}let B=O.target.closest(".lg-tab");if(!B||O.metaKey||O.ctrlKey||O.shiftKey||O.altKey)return;let Dt=s.indexOf(B);B instanceof HTMLAnchorElement&&(p=Dt,Nt()),m(Dt)},Ae=O=>{let B=O.target.closest(".lg-tab");if(!B||B instanceof HTMLAnchorElement||!av.includes(O.key))return;O.preventDefault();let Dt=s.indexOf(B),de=O.key==="Home"?0:O.key==="End"?s.length-1:(Dt+(O.key==="ArrowRight"?1:s.length-1))%s.length;m(de),s[de]?.focus()},yt=()=>{cancelAnimationFrame(y),y=0,jt(),Nt(!0)},ze=()=>{document.hidden&&yt()},Kt=new ResizeObserver(()=>{Z(),x||Nt(!0)});return Z(),t.dataset.ready="",t.addEventListener("pointerdown",Q),window.addEventListener("pointermove",rt),window.addEventListener("pointerup",fe),window.addEventListener("pointercancel",fe),t.addEventListener("lostpointercapture",fe),t.addEventListener("touchmove",H,{passive:!1}),t.addEventListener("click",xt,!0),t.addEventListener("keydown",Ae),document.addEventListener("visibilitychange",ze),window.addEventListener("blur",yt),Kt.observe(t),{setActive(O){cancelAnimationFrame(y),y=0,p=O,Nt()},destroy(){cancelAnimationFrame(y),j.stop(),z.stop(),R.destroy(),D?.destroy(),Kt.disconnect();for(let O of["ready","hidden","lifted","refracting","lensing","away","light","under"])delete t.dataset[O];t.removeEventListener("pointerdown",Q),window.removeEventListener("pointermove",rt),window.removeEventListener("pointerup",fe),window.removeEventListener("pointercancel",fe),t.removeEventListener("lostpointercapture",fe),t.removeEventListener("touchmove",H),t.removeEventListener("click",xt,!0),t.removeEventListener("keydown",Ae),document.removeEventListener("visibilitychange",ze),window.removeEventListener("blur",yt)}}}function ic(t){return t.icon===void 0?(0,dt.jsx)("span",{className:"lg-tab-text",children:t.label}):(0,dt.jsxs)(dt.Fragment,{children:[(0,dt.jsx)("span",{className:"lg-tab-icon","aria-hidden":!0,children:t.icon}),(0,dt.jsx)("span",{className:"lg-tab-label",children:t.label})]})}function uc({kind:t,items:e,value:n,defaultValue:l=null,onValueChange:a,link:i="a",className:u,style:c,...o}){let r=t==="segmented",m=(0,Gt.useRef)(null),s=(0,Gt.useRef)(null),f=(0,Gt.useRef)(null),h=(0,Gt.useRef)(null),v=(0,Gt.useRef)(null),S=(0,Gt.useRef)(null),E=(0,Gt.useRef)(null),d=(0,Gt.useRef)(null),g=(0,Gt.useRef)(null),[p,b]=cl(n,l,a),y=e.findIndex(A=>A.value===p),x=(0,Gt.useRef)({items:e,selected:y,setValue:b}),T=e.map(A=>A.value).join(`
`),R=!r&&e.every(A=>A.href!==void 0),D=!r&&e.some(A=>A.icon!==void 0);return ul(s),ul(S,!0,r),(0,Gt.useEffect)(()=>{x.current={items:e,selected:y,setValue:b}}),(0,Gt.useEffect)(()=>{let A=ov({bar:m.current,glass:s.current,thumb:f.current,labels:h.current,lensed:v.current,lens:S.current,tint:E.current,row:d.current},r?cv:uv,!r,w=>{let Z=x.current.items[w];Z&&x.current.setValue(Z.value)});return A.setActive(x.current.selected),g.current=A,()=>{A.destroy(),g.current=null}},[T,r]),(0,Gt.useLayoutEffect)(()=>{g.current?.setActive(y)},[y]),(0,dt.jsxs)("div",{ref:m,role:r?"radiogroup":R?"navigation":"tablist","data-icons":D?"":void 0,className:we(r?"lg-segmented":"lg-tab-bar",u),style:{...c,"--lg-index":Math.max(y,0),"--lg-tabs":e.length},...o,children:[(0,dt.jsx)("span",{ref:s,className:"lg-glass lg-tab-bar-glass","aria-hidden":!0}),r&&(0,dt.jsx)("span",{ref:f,className:"lg-segmented-thumb","aria-hidden":!0}),(0,dt.jsx)("span",{ref:h,className:"lg-tab-labels",role:"none",children:e.map((A,w)=>A.href!==void 0?(0,dt.jsx)(i,{href:A.href,className:"lg-tab","data-selected":w===y?"":void 0,"aria-current":w===y?"page":void 0,draggable:!1,children:(0,dt.jsx)("span",{className:"lg-tab-face",children:ic(A)})},A.value):(0,dt.jsx)("button",{type:"button",role:r?"radio":"tab",className:"lg-tab","data-selected":w===y?"":void 0,"aria-selected":r?void 0:w===y,"aria-checked":r?w===y:void 0,tabIndex:w===y||y<0&&w===0?0:-1,children:(0,dt.jsx)("span",{className:"lg-tab-face",children:ic(A)})},A.value))}),(0,dt.jsx)("span",{ref:v,className:"lg-tab-labels lg-tab-lensed","aria-hidden":!0,children:e.map((A,w)=>(0,dt.jsx)("span",{className:"lg-tab-copy","data-selected":w===y?"":void 0,children:ic(A)},A.value))}),(0,dt.jsx)("span",{ref:E,className:"lg-tab-tint","aria-hidden":!0,children:(0,dt.jsx)("span",{ref:d,className:"lg-tab-row",children:e.map(A=>(0,dt.jsx)("span",{className:"lg-tab-copy",children:ic(A)},A.value))})}),(0,dt.jsx)("span",{ref:S,className:"lg-glass lg-tab-lens","aria-hidden":!0})]})}var Pm=N(tt());function vs(t){return(0,Pm.jsx)(uc,{kind:"segmented",...t})}var qt=N(Yt());var Te=N(tt());var rv={strength:.75,strengthProperty:"--lg-slider-bend",dispersion:.65,depth:2,dome:5,splay:.5},cc=(0,qt.forwardRef)(function({value:e,defaultValue:n,onValueChange:l,min:a=0,max:i=100,step:u=1,className:c,style:o,...r},m){let s=(0,qt.useRef)(null),f=(0,qt.useRef)(null),h=(0,qt.useRef)(null),v=(0,qt.useRef)(null),S=(0,qt.useRef)(null),E=(0,qt.useRef)(null),d=(0,qt.useRef)(null),[g,p]=cl(e,n??a,l),b=i>a?Math.min(1,Math.max(0,(g-a)/(i-a))):0;return(0,qt.useImperativeHandle)(m,()=>f.current),(0,qt.useEffect)(()=>{let y=f.current,x=S.current,T=d.current,R=s.current,D=Un(x,v.current,rv,h.current);E.current=D;let A=Le(0,2e3,80,j=>{let z=Math.min(1,Math.max(0,j));x.style.scale=String(.6+.4*j),R.style.setProperty("--lg-lift",String(z)),T.style.opacity=String(1-.85*z),D.setActive(j>.01),D.update()}),w=()=>{y.disabled||A.set(1)},Z=()=>A.set(0),V=["pointerup","pointercancel","lostpointercapture","blur"];return y.addEventListener("pointerdown",w),V.forEach(j=>y.addEventListener(j,Z)),window.addEventListener("pointerup",Z),()=>{A.stop(),D.destroy(),E.current=null,y.removeEventListener("pointerdown",w),V.forEach(j=>y.removeEventListener(j,Z)),window.removeEventListener("pointerup",Z)}},[]),(0,qt.useLayoutEffect)(()=>{E.current?.update()},[b]),(0,Te.jsxs)("div",{ref:s,className:we("lg-slider",c),style:{...o,"--lg-progress":b},children:[(0,Te.jsx)("span",{ref:h,className:"lg-slider-bed","aria-hidden":!0,children:(0,Te.jsx)("span",{className:"lg-slider-track",children:(0,Te.jsx)("span",{className:"lg-slider-fill"})})}),(0,Te.jsx)("span",{ref:v,className:"lg-slider-bed lg-slider-magnified","aria-hidden":!0,children:(0,Te.jsx)("span",{className:"lg-slider-track",children:(0,Te.jsx)("span",{className:"lg-slider-fill"})})}),(0,Te.jsx)("span",{ref:S,className:"lg-slider-thumb","aria-hidden":!0,children:(0,Te.jsx)("span",{ref:d,className:"lg-thumb-face"})}),(0,Te.jsx)("input",{ref:f,type:"range",min:a,max:i,step:u,value:g,onChange:y=>p(y.currentTarget.valueAsNumber),...r})]})});var zt=N(Yt());var He=N(tt());var sv=57.9*.375,oc=t=>Math.min(1,Math.max(0,t)),fv={strength:.45,strengthProperty:"--lg-switch-bend",dispersion:1,depth:2,dome:6,splay:.4},ys=(0,zt.forwardRef)(function({checked:e,defaultChecked:n=!1,onCheckedChange:l,className:a,...i},u){let c=(0,zt.useRef)(null),o=(0,zt.useRef)(null),r=(0,zt.useRef)(null),m=(0,zt.useRef)(null),s=(0,zt.useRef)(null),f=(0,zt.useRef)(null),h=(0,zt.useRef)(null),[v,S]=cl(e,n,l),E=sv,d=(0,zt.useRef)({checked:v,setChecked:S,travel:E}),g=(0,zt.useRef)(null);return(0,zt.useImperativeHandle)(u,()=>c.current),(0,zt.useEffect)(()=>{d.current={checked:v,setChecked:S,travel:E},g.current?.position.set(v?1:0),g.current?.color.set(v?1:0)},[v,S,E]),(0,zt.useEffect)(()=>{g.current?.position.paint()},[E]),(0,zt.useEffect)(()=>{let p=c.current,b=[m.current,s.current],y=f.current,x=h.current,T=Un(y,r.current,fv,o.current),R=0,D=.65,A=()=>{y.style.transform=`translate(${R}px, -50%) scale(${D})`,T.update()},w=d.current.checked?1:0,Z=Le(w,1e3,80,H=>{R=H*d.current.travel,A()}),V=Le(w,1e3,80,H=>{for(let xt of b)xt.style.opacity=String(oc(H))}),j=Le(0,2e3,80,H=>{D=.65+.25*H,x.style.opacity=String(1-.85*oc(H)),p.style.setProperty("--lg-lift",String(oc(H))),T.setActive(H>.01),A()});g.current={position:Z,color:V},Z.paint(),V.paint(),j.paint();let z=null,Ot=!1,Nt=()=>{Z.set(d.current.checked?1:0),V.set(d.current.checked?1:0)},Ut=H=>{let xt=z;if(z=null,j.set(0),xt&&p.hasPointerCapture(xt.id)&&p.releasePointerCapture(xt.id),H===void 0||H===d.current.checked)return Nt();d.current.setChecked(H),requestAnimationFrame(Nt)},Rt=H=>{!H.isPrimary||H.button!==0||p.disabled||(H.preventDefault(),Ot=!1,z={id:H.pointerId,x:H.clientX,y:H.clientY,from:d.current.checked?1:0,moved:!1,at:performance.now(),box:p.getBoundingClientRect()},p.setPointerCapture(H.pointerId),j.set(1))},jt=H=>{if(H.pointerId!==z?.id)return;let xt=H.clientX-z.x,Ae=Math.abs(H.clientY-z.y);if(!mi(z.at,z.moved)&&Ae>10&&Ae>Math.abs(xt)+4)return Ot=!0,Ut();if(!z.moved&&Math.abs(xt)<4)return;z.moved=!0;let yt=z.from+xt/d.current.travel,ze=yt<0?yt:yt>1?yt-1:0;Z.set(oc(yt)+ze/22),V.set(yt>.5?1:0)},ot=H=>{if(H.pointerId!==z?.id)return;Ot=!0;let{from:xt,x:Ae,moved:yt,box:ze}=z,Kt=xt+(H.clientX-Ae)/d.current.travel,O=H.clientY>=ze.top-24&&H.clientY<=ze.bottom+24;Ut(yt?Kt>.5:O?!d.current.checked:void 0)},Q=H=>{z&&H.cancelable&&mi(z.at,z.moved)&&H.preventDefault()},rt=()=>{z&&(Ot=!0,Ut())},fe=()=>{Ot?Ot=!1:p.disabled||d.current.setChecked(!d.current.checked)};return p.addEventListener("pointerdown",Rt),p.addEventListener("pointermove",jt),p.addEventListener("pointerup",ot),p.addEventListener("pointercancel",rt),p.addEventListener("lostpointercapture",rt),p.addEventListener("touchmove",Q,{passive:!1}),p.addEventListener("click",fe),()=>{g.current=null,[Z,V,j].forEach(H=>H.stop()),T.destroy(),p.removeEventListener("pointerdown",Rt),p.removeEventListener("pointermove",jt),p.removeEventListener("pointerup",ot),p.removeEventListener("pointercancel",rt),p.removeEventListener("lostpointercapture",rt),p.removeEventListener("touchmove",Q),p.removeEventListener("click",fe)}},[]),(0,He.jsxs)("button",{ref:c,type:"button",role:"switch","aria-checked":v,className:we("lg-switch",a),...i,children:[(0,He.jsx)("span",{ref:o,className:"lg-switch-bed","aria-hidden":!0,children:(0,He.jsx)("span",{className:"lg-switch-track",children:(0,He.jsx)("span",{ref:m,className:"lg-switch-fill"})})}),(0,He.jsx)("span",{ref:r,className:"lg-switch-bed lg-switch-inset","aria-hidden":!0,children:(0,He.jsx)("span",{className:"lg-switch-track",children:(0,He.jsx)("span",{ref:s,className:"lg-switch-fill"})})}),(0,He.jsx)("span",{ref:f,className:"lg-switch-thumb","aria-hidden":!0,children:(0,He.jsx)("span",{ref:h,className:"lg-thumb-face"})})]})});var th=N(tt());function Ss(t){return(0,th.jsx)(uc,{kind:"tab-bar",...t})}hm(pm);var eh=`.glisse {
  position: relative;
  width: 100%;
  height: 640px;
  overflow: hidden;
  background: #0c0c0c;
  color: #fff;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.glisse-scroller {
  position: absolute;
  inset: 0;
  overflow: auto;
  cursor: grab;
  overscroll-behavior: none;
  user-select: none;
  scrollbar-width: none;
}
.glisse-scroller[data-dragging] { cursor: grabbing; }
.glisse-scroller::-webkit-scrollbar { display: none; }
.glisse-wall {
  position: relative;
  width: 1300px;
  height: 1300px;
  pointer-events: none;
}
.glisse-wall img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
.glisse-overlay {
  position: absolute;
  inset: 0 0 148px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  pointer-events: none;
}
.glisse-overlay > * { pointer-events: auto; }
.glisse-lens { pointer-events: none; flex: none; }
.glisse .glisse-lens.lg-glass,
.glisse .glisse-lens.lg-glass[data-rim],
.glisse .glisse-lens.lg-glass[data-drawn] {
  box-shadow: 0 4px 9px rgba(0,0,0,.16), inset 0 2px 24px rgba(0,0,0,.2), inset 0 -2px 24px rgba(255,255,255,.2);
}
.glisse-sliders {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 320px;
}
.glisse-slider-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgb(255 255 255 / 0.86);
  font-size: 12px;
  line-height: 16px;
}
.glisse-slider-label > span:first-child { flex: none; width: 84px; }
.glisse-slider-label .lg-slider { flex: 1; min-width: 0; }
.glisse-switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgb(255 255 255 / 0.9);
  font-size: 13px;
  line-height: 18px;
}
.glisse-dock {
  position: absolute;
  right: 20px;
  bottom: 36px;
  left: 20px;
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(2, max-content);
  justify-content: center;
  gap: 8px 28px;
}
.glisse-knob {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: rgb(255 255 255 / 0.82);
  font-size: 12px;
  line-height: 16px;
}
.glisse-knob > span:first-child { flex: none; width: 76px; }
.glisse-knob .lg-slider { width: 240px; flex: none; }
.glisse-knob > span:last-child {
  flex: none;
  min-width: 40px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.glisse-credit {
  position: absolute;
  right: 16px;
  bottom: 10px;
  left: 16px;
  z-index: 4;
  margin: 0;
  color: rgb(255 255 255 / 0.62);
  font: 400 12px/16px system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  text-align: center;
  pointer-events: auto;
}
.glisse-credit a { color: inherit; }
@media (prefers-reduced-motion: reduce) {
  .glisse-scroller { scroll-behavior: auto; }
}
`;var rl=N(tt());function rc({d:t}){return(0,rl.jsx)("svg",{viewBox:"0 0 256 256","aria-hidden":"true",children:(0,rl.jsx)("path",{fill:"currentColor",d:t})})}var nh=(0,rl.jsx)(rc,{d:"M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z"}),lh=(0,rl.jsx)(rc,{d:"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z"}),ah=(0,rl.jsx)(rc,{d:"M104,168a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H96A8,8,0,0,1,104,168Zm-8-40H64a8,8,0,0,0,0,16H96a8,8,0,0,0,0-16Zm0-32H64a8,8,0,0,0,0,16H96a8,8,0,0,0,0-16ZM232,80V192a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V72a8,8,0,0,1,5.7-7.66l160-48a8,8,0,0,1,4.6,15.33L86.51,64H216A16,16,0,0,1,232,80ZM216,192V80H40V192H216Zm-16-56a40,40,0,1,1-40-40A40,40,0,0,1,200,136Zm-16,0a24,24,0,1,0-24,24A24,24,0,0,0,184,136Z"}),ih=(0,rl.jsx)(rc,{d:"M231.65,194.55,198.46,36.75a16,16,0,0,0-19-12.39L132.65,34.42a16.08,16.08,0,0,0-12.3,19l33.19,157.8A16,16,0,0,0,169.16,224a16.25,16.25,0,0,0,3.38-.36l46.81-10.06A16.09,16.09,0,0,0,231.65,194.55ZM136,50.15c0-.06,0-.09,0-.09l46.8-10,3.33,15.87L139.33,66Zm6.62,31.47,46.82-10.05,3.34,15.9L146,97.53Zm6.64,31.57,46.82-10.06,13.3,63.24-46.82,10.06ZM216,197.94l-46.8,10-3.33-15.87L212.67,182,216,197.85C216,197.91,216,197.94,216,197.94ZM104,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,104,32ZM56,48h48V64H56Zm0,32h48v96H56Zm48,128H56V192h48v16Z"});var dv=`<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="1300" viewBox="0 0 1300 1300">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#14225c"/>
<stop offset="0.42" stop-color="#c44b78"/>
<stop offset="0.7" stop-color="#f29a4a"/>
<stop offset="1" stop-color="#f8d7a4"/>
</linearGradient>
<linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#f0b56b"/>
<stop offset="0.35" stop-color="#5a6cb8"/>
<stop offset="1" stop-color="#101833"/>
</linearGradient>
<radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#fff6df"/>
<stop offset="0.35" stop-color="#ffd27a"/>
<stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="1300" height="1300" fill="url(#sky)"/>
<circle cx="880" cy="420" r="240" fill="url(#sun)"/>
<circle cx="880" cy="420" r="64" fill="#fff4d2"/>
<circle cx="250" cy="280" r="96" fill="#ff4d6d"/>
<circle cx="390" cy="210" r="52" fill="#3dfff2"/>
<circle cx="160" cy="430" r="36" fill="#ffe14a"/>
<path d="M0 760C240 620 400 700 580 750C790 810 940 680 1300 750V1300H0Z" fill="#2a3868"/>
<path d="M0 840C280 740 500 900 740 830C990 760 1120 900 1300 850V1300H0Z" fill="#1a2448"/>
<rect y="900" width="1300" height="400" fill="url(#lake)"/>
<text x="650" y="478" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="52" font-weight="700" letter-spacing="-1">Liquid</text>
<text x="650" y="528" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="52" font-weight="700" letter-spacing="-1">Glass</text>
</svg>`,uh=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(dv)}`;var W=N(tt()),gv=[{value:"home",label:"Home",icon:nh},{value:"browse",label:"Browse",icon:lh},{value:"radio",label:"Radio",icon:ah},{value:"library",label:"Library",icon:ih}],mv=[{value:"day",label:"Day"},{value:"week",label:"Week"},{value:"month",label:"Month"}];function hv(t){return(String(t).split(".")[1]??"").length}function pv(t,e){return t.toFixed(hv(e))}function bv(){(0,Qt.useEffect)(()=>{if(document.getElementById("glisse-card-css"))return;let t=document.createElement("style");t.id="glisse-card-css",t.textContent=eh,document.head.appendChild(t)},[])}function vv(t){(0,Qt.useEffect)(()=>{let e=t.current;if(!e)return;let n=()=>{e.scrollLeft=(e.scrollWidth-e.clientWidth)/2,e.scrollTop=e.scrollHeight*.3};n();let l=e.querySelector("img");l?.addEventListener("load",n);let a=null,i=r=>{r.pointerType!=="mouse"||r.button!==0||(a={id:r.pointerId,x:r.clientX,y:r.clientY,left:e.scrollLeft,top:e.scrollTop},e.setPointerCapture(r.pointerId),e.dataset.dragging="")},u=r=>{!a||r.pointerId!==a.id||(e.scrollLeft=a.left-(r.clientX-a.x),e.scrollTop=a.top-(r.clientY-a.y))},c=r=>{!a||r.pointerId!==a.id||(a=null,delete e.dataset.dragging)},o=r=>{if(r.ctrlKey)return;r.preventDefault();let m=r.deltaMode===WheelEvent.DOM_DELTA_LINE?40:r.deltaMode===WheelEvent.DOM_DELTA_PAGE?e.clientHeight:1,s=r.shiftKey&&!r.deltaX?r.deltaY:r.deltaX,f=r.shiftKey&&!r.deltaX?0:r.deltaY;e.scrollLeft+=s*m,e.scrollTop+=f*m};return e.addEventListener("pointerdown",i),e.addEventListener("pointermove",u),e.addEventListener("pointerup",c),e.addEventListener("pointercancel",c),e.addEventListener("wheel",o,{passive:!1}),()=>{l?.removeEventListener("load",n),e.removeEventListener("pointerdown",i),e.removeEventListener("pointermove",u),e.removeEventListener("pointerup",c),e.removeEventListener("pointercancel",c),e.removeEventListener("wheel",o)}},[t])}function Es({label:t,aria:e,value:n,onChange:l,step:a=1,disabled:i=!1}){return(0,W.jsxs)("label",{className:"glisse-slider-label",children:[(0,W.jsx)("span",{children:t}),(0,W.jsx)(cc,{"aria-label":e,value:n,onValueChange:l,step:a,disabled:i})]})}function sc({label:t,min:e,max:n,step:l,value:a,unit:i,onChange:u}){return(0,W.jsxs)("label",{className:"glisse-knob",children:[(0,W.jsx)("span",{children:t}),(0,W.jsx)(cc,{"aria-label":t,min:e,max:n,step:l,value:a,onValueChange:u}),(0,W.jsxs)("span",{children:[pv(a,l),i??""]})]})}function ch({credit:t=null}){let e=(0,Qt.useRef)(null),[n,l]=(0,Qt.useState)("radio"),[a,i]=(0,Qt.useState)("week"),[u,c]=(0,Qt.useState)(40),[o,r]=(0,Qt.useState)(40),[m,s]=(0,Qt.useState)(!0),[f,h]=(0,Qt.useState)(.45),[v,S]=(0,Qt.useState)(.4),[E,d]=(0,Qt.useState)(0),[g,p]=(0,Qt.useState)(.13);bv(),vv(e);let b={width:210,height:120,borderRadius:75,backgroundColor:"transparent","--lg-glass-bend":String(f),"--lg-glass-dispersion":String(v),"--lg-blur":`${E}px`,"--lg-rim-shine":String(g)};return(0,W.jsxs)("div",{id:"glisse",className:"glisse","data-theme":"dark","data-testid":"glisse",children:[(0,W.jsx)("div",{className:"glisse-scroller",ref:e,"data-testid":"glisse-wallpaper",children:(0,W.jsx)("div",{className:"glisse-wall","data-glisse-backdrop":"true",children:(0,W.jsx)("img",{src:uh,alt:"",width:1300,height:1300,draggable:!1})})}),(0,W.jsxs)("div",{className:"glisse-overlay",children:[(0,W.jsx)(hs,{className:"glisse-lens",style:b,"aria-hidden":!0}),(0,W.jsx)(Ss,{"aria-label":"Library",items:gv,value:n,onValueChange:l}),(0,W.jsx)(vs,{"aria-label":"Range",items:mv,value:a,onValueChange:i}),(0,W.jsxs)("div",{className:"glisse-sliders",children:[(0,W.jsx)(Es,{label:"Continuous",aria:"Volume",value:u,onChange:c}),(0,W.jsx)(Es,{label:"Stepped",aria:"Stepped volume",value:o,onChange:r,step:10}),(0,W.jsx)(Es,{label:"Disabled",aria:"Disabled volume",value:40,disabled:!0})]}),(0,W.jsxs)("div",{className:"glisse-switch-row",children:[(0,W.jsx)("span",{children:"Wi-Fi"}),(0,W.jsx)(ys,{"aria-label":"Wi-Fi",checked:m,onCheckedChange:s})]})]}),(0,W.jsxs)("div",{className:"glisse-dock",children:[(0,W.jsx)(sc,{label:"Bend",min:0,max:1,step:.01,value:f,onChange:h}),(0,W.jsx)(sc,{label:"Dispersion",min:0,max:2,step:.05,value:v,onChange:S}),(0,W.jsx)(sc,{label:"Frost",min:0,max:12,step:.5,value:E,unit:"px",onChange:d}),(0,W.jsx)(sc,{label:"Rim",min:0,max:1,step:.01,value:g,onChange:p})]}),t]})}var sh=N(tt()),oh=document.getElementById("glisse-root");oh&&(0,rh.createRoot)(oh).render((0,sh.jsx)(ch,{}));})();

</script>
</body>
</html>

```
