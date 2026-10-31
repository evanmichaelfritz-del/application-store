# AGENT_PROMPT — Stageshow

## Piece

- id: `stageshow`
- title: Stageshow
- subtitle: Faux product UI stills, cursor demos and bento grids for your agent.

## Stage content

One recording and one still of the same product UI. The recording element has class `stageshow`. The still has class `stageshow-still` and uses the poster image.

## Geometry and values

- Both share width 100%, max-height 420px, aspect-ratio 1546 / 1080, object-fit contain, background #f9f9f9, and border-radius 14px.
- The recording is display block. The still is display none until reduced motion.

## States

| State | Trigger | From | To | Duration | Easing | Delay |
| --- | --- | --- | --- | --- | --- | --- |
| playing | the document loads | the still hidden | the recording running | | | |
| still | reduced motion | the recording hidden | the still image | | | |

## Timing

The recording element is set to loop and autoplay. The stylesheet does not assign a duration to the swap between the recording and the still.

## Reduced motion

`prefers-reduced-motion: reduce` and `html[data-reduce-motion="1"]` hide `.stageshow` and show `.stageshow-still`. The still is the poster frame.

## Gotchas

- The recording is muted, and it sets loop, autoplay, and playsinline.
- The still `src` is the same poster image as the recording.
- Reduced motion is both the media query and the document attribute. Either one shows the still.

## Setup

Mount the HTML and the CSS in one document. The script copy states that this effect is HTML and CSS only.

## Known gaps

Phone widths are a known gap.

## Checklist

- [ ] The recording source is `/media/stageshow-demo.mp4` and the poster is `/media/stageshow-poster.jpg`.
- [ ] The recording is muted, looped, autoplay, and playsinline.
- [ ] Both boxes use width 100%, max-height 420px, aspect-ratio 1546 / 1080, object-fit contain, background #f9f9f9, and border-radius 14px.
- [ ] Reduced motion hides the recording and shows the still.

## Code

### HTML

```html
<video class="stageshow" src="/media/stageshow-demo.mp4" poster="/media/stageshow-poster.jpg" muted loop autoplay playsinline></video>
<img class="stageshow-still" src="/media/stageshow-poster.jpg" alt="">
```

### CSS

```css
.stageshow, .stageshow-still {
  width: 100%;
  max-height: 420px;
  aspect-ratio: 1546 / 1080;
  object-fit: contain;
  background: #f9f9f9;
  border-radius: 14px;
}
.stageshow { display: block; }
.stageshow-still { display: none; }
@media (prefers-reduced-motion: reduce) {
  .stageshow { display: none; }
  .stageshow-still { display: block; }
}
html[data-reduce-motion="1"] .stageshow { display: none; }
html[data-reduce-motion="1"] .stageshow-still { display: block; }
```

### Script

```js
This effect is HTML and CSS only.
```
