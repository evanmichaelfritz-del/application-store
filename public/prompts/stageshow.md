# AGENT_PROMPT — Stageshow

Follow the Stageshow skill only. The source is `SKILL.md` in the skill folder (name `stageshow`). Do not add screens, kit parts, beats, or checks that file does not state. When it points at `references/`, `examples/`, `kit/`, or `teaching/`, read that file and stop there.

Benji Taylor, https://github.com/benjitaylor/skills. The folder includes `LICENSE` (MIT).

Install:

```
npx skills add benjitaylor/skills --skill stageshow
```

## Piece

- id: `stageshow`
- title: Stageshow
- subtitle: Faux product UI stills, cursor demos and bento grids for your agent.

Miniature product UI: a believable interface, framed in its space, as one still or a short animation in which one thing happens. The viewer recognizes the screen and sees the thing happen. React and plain CSS.

These are authored illustrations, not browser automation: `a.click()` draws the cursor pressing, `a.set()` changes the scene.

## The one idea

It reads as a real product, simplified to what the viewer needs, framed with intent, and every motion has a cause.

Five ways it fails:

- Too much. Real text in every row, numbers everywhere, everything packed. The more detail, the more it looks generated.
- Wireframe. Two gray blobs and a button. Built too small, or stripped of what made it recognizable.
- Boxed. A whole window shrunk into a card with even margins: a screenshot pasted in, not a product shot.
- Flat. Every object the same weight in the same bordered card. The eye has nowhere to land.
- Bland. A gray window with a cursor, whatever the brief said. The brief's look and energy (a blueprint, glass over color, a Dynamic Island, a mascot) are the point; take what it asks for and build it to the rules, as `examples/hero-demo` does with its typed popup and terminal satellite (a satellite is a smaller second object, a receipt, phone or detail card, straddling the hero's edge).

The fix: a full, structured screen in quiet grays, real words only on what the story is about, placeholder lines for the rest, room to breathe, a crop that puts the eye where the story is. Simplify the words, not the context. An empty corner, a void under a list, rows spread to fill a pane, a window floating on a plate (a backdrop or tinted field behind it): unfinished, not calm.

Build it the way a product designer builds a launch page they will be judged on. The gold examples in `examples/` are the bar, not a reference: if yours is the emptier, flatter or smaller one beside the closest gold, that is the first fix. Then look at the frame the way the most exacting designer you know would, the one who screenshots the one wrong thing and sends it back with "what is this?": a dot off its avatar, a unit on its own line, a grabber under the island, copy touching a card. If you can picture that screenshot, you have found the next fix.

## States

Still or animation (loop, once in view, or hover). Fidelity is `minimal` (all bars), `standard` (words where they carry meaning and bars elsewhere), or `realistic` (real content everywhere). Default is light, accent, standard. Go realistic at hero scale, for a named real product, or a still whose subject is a list or page. `Text filler` is written once and the fidelity decides.

The story is three to five beats and a payoff, 10 to 16 seconds. Set `poster` first: most people see only that frame (a thumbnail, reduced motion, a screenshot), so it is the beat that tells the story on its own, never one caught mid-change, with the result left on screen rather than tidied away (`references/motion.md`, Story).

`Stage` carries design size and scale-to-fit, `compact`, scene state, playback, the look, and the cursor. The script gets an `Act` (`set`, `wait`, `move`, `click`, `type`, and the rest in `references/kit.md`, Act).

## Gotchas

Design at the size it will be seen, about 720 × 340 for a hero beside copy (`hero-demo`), 900 to 1100 wide for a full-width hero (`linear`), 400 × 300 for a card, shown at 1:1. Never under about 320 wide for a demo, though a bento tile or a satellite card may be smaller. Every demo that can sit in a phone column ships a `compact` design at the column's width (358), a redesign not a squeeze (`references/framing.md`, Small formats and the page). A grid of tiles is one set: plan it with `references/bento.md`.

Between a richer story and a calmer frame, choose the frame. No cursor move you can't explain. Data never rewinds in view without a cause.

Count the real strings, usually 3 to 7 (`references/craft.md`, Restraint): a budget for words, not elements. Fit every control's text before it moves. Mark what the cursor touches with `data-target` and `data-cursor`. Measure with `rect()`, never hard-code.

Keep what appears mounted and toggle it so exits animate (`Bubble` and `Fly` hand off explicitly). Animate the relationship, not just the object: a new row carries the rows below it, a surface that resizes never stretches its text. Beats overlap, groups stagger, the payoff holds, the loop ends where it began or resets with a visible cause.

Faults that come back every round. Each one has its rule in the skill. Check them before handing over:

- Content that swaps instead of moving (`references/motion.md`, Changing text and values).
- Gray bars where the eye lands. Filler belongs at the edges (`references/craft.md`, Restraint).
- A plate behind the window, or a window floating with air on four sides. The window or phone fills at least two thirds of the stage and runs off an edge (`references/framing.md`, rule 5 and Small formats and the page).
- Empty bands, cut controls and shadows (`references/craft.md`, Restraint; `references/framing.md`, rule 4).
- Stock AI and made-up logos: sparkles, purple, a letter in a colored square (`references/craft.md`, Icons and logos).
- Busy rows and uneven insets (`references/craft.md`, Restraint and Spacing and alignment).
- Long holds and a reset with no cause (`references/motion.md`, Loops).
- A selection that isn't under the I-beam (`references/motion.md`, Drags and selection).
- A status bar or home indicator drawn by hand. The Phone draws both (`references/craft.md`, Chrome and devices).
- A centered amount centered with its sign (`references/craft.md`, Spacing and alignment).

Product studies (Figma, Linear, Slack, Raycast, Finder, Spotify, Notion, Gmail, Google's apps, Office, Wikipedia, Telegram, iMessage) borrow the interaction, not another product's identity. Read `references/products.md` first. Specimen sheets are catalogs, not compositions. `teaching/` holds bad/good pairs. The bad halves are never starting points.

## Setup

Most of the quality is decided before any code. Write the plan first: where it sits, the focal object, the action, the payoff, what can be left out.

1. Medium and place. Still or animation, the page, its ground, its width.
2. Look. With the product's code or site at hand, map its tokens to the kit's (`references/looks.md`). If the developer asks for their own components, use them inside the stage instead of the kit's small parts. Otherwise a theme (light, dark, blueprint, glass), a palette (accent, mono) and a fidelity. The product's own icons, its real chrome, the content that makes it recognizable. A brief with a style (kawaii, paper, a poster color) gets that style in full, still built to these rules.
3. The story. Its shape (`references/motion.md`, Story): how it feels to use, a flow, or what the system does.
4. Start from an example. Find the closest gold example and film it. `npm run dev` serves the local viewer. Copy its folder into the project as the starting point. Do not rewrite it from a glance. The quickest loop copies it to `examples/<yours>/`, where the local viewer picks it up and `?capture=<yours>` films it, then moves it into the host when it passes and fixes its kit import path. Keep its structure: the stage size, the crop and bleed, row and type sizes, spacing, the script's beats, the kit parts. Read `references/craft.md` in full before replacing look and content. A copy that only changes the name is not done. If no gold tells the story, pick the layout from the table in `references/framing.md` and copy that example even though its story differs, then borrow the motion from the example whose story is closest. Frame it in the final visible crop. One gutter, a full one or well past. Only filler bleeds. What opens stays in. Windows keep their shape. The page is the ground, so no plate under a hero on a white or dark page and no window whole with air on four sides. `unframed` only when the developer asks. No dead corners. Film one still at both widths beside the gold's. If yours is emptier, flatter or more boxed, fix the frame before any motion.
5. The screen. Build with the kit's tokens, `Bar`, `Text` and `Row`.
6. Choreograph with the `Act` API.
7. Rehearse. Film the loop, not just a still: the contact sheet at the shown width and at 390, and step through every press, menu, morph and the loop seam (`references/rehearse.md`). A still can't show a pop. Read every frame, fix the largest visible fault first (framing, then hierarchy, then motion, then polish), and re-film. Then hold it next to the closest gold and answer the whole-composition and style pairs in `references/teaching.md` as questions about the still (what does the eye land on first, and is it the result? is one window, tile or device clearly leading?). Any no is the largest fault. `film.mjs --gate` ending `rehearsal passed` is necessary, not sufficient. Then run the last pass in `references/rehearse.md`: a fresh-eye review (`references/review.md`) and `REHEARSAL.md` beside the component (template in `references/verify.md`, Hand over).

Film command from the skill:

```
node scripts/film.mjs "<url>/?capture=<gold>" --select '#example' --still --out gold.png
```

Run the folder with `npm install` and `npm run dev`.

Copy `kit/` into the project and import from `kit/index.ts`. React, react-dom and lucide-react (for `Icon`, which `Field` and `Chip` use). Each part brings its own CSS. `references/kit.md` has every part's props and rules. Read the entries for the parts you use.

- The stage. `Stage`, as in States.
- Frames. `Window`, `Phone` with `LockScreen` and `Notification`, `Keyboard`, `Thread` with `Bubble`, `Stamp`, `Receipt`. Real geometry. Never draw a window, device or bubble by hand.
- Motion. `Collapse`, `Roll`, `Swap`, `Count`, `Connector`, `Fly`, `Follow`, `States`, `Stream`, `Popover`, `Scroll`, `Camera`, `Expand`.
- Small parts. `Bar`, `Text`, `Row` (every list is made of it), `Avatar`, `Pin`, `Icon`, `Menu`, `Field`, `Segmented`, `Toggle`, `Tabs`, `Badge`, `Chip`, `BrandMark`, `Code`, `Chart`. Quiet starting points. Restyle to the product. Never reshape a kit part's geometry from outside.
- `stageshow.css`: tokens, looks, edge fades, chrome, phones, keycaps.

References named by the skill: `references/framing.md`, `references/craft.md`, `references/motion.md`, `references/verify.md`, `references/rehearse.md`. Also `references/looks.md`, `references/bento.md`, `references/kit.md`, `references/products.md`, `references/teaching.md`, `references/review.md`, `references/backgrounds.md`, `references/brands.md`.

## Checklist

- [ ] The plan names where it sits, the focal object, the action, the payoff, and what can be left out.
- [ ] The size matches the place: about 720 × 340 beside copy, 900 to 1100 for a full-width hero, 400 × 300 for a card at 1:1, and not under about 320 wide except a bento tile or satellite. A phone column has a `compact` redesign at 358.
- [ ] Look, theme, palette and fidelity come from the skill. Default is light, accent, standard.
- [ ] The story is three to five beats and a payoff, 10 to 16 seconds, and the calmer frame wins.
- [ ] The closest gold example was copied, not redrawn from a glance, and the result reads as the brief's product.
- [ ] Real strings stay in the usual budget of 3 to 7. Cursor targets use `data-target` and `data-cursor`. Positions come from `rect()`.
- [ ] The poster is a settled beat with the result left on screen.
- [ ] The recurring faults above are checked. `film.mjs --gate` ending `rehearsal passed` is not the last pass.
- [ ] `REHEARSAL.md` sits beside the component, from the template in `references/verify.md`.

## Examples

Film the closest one before you start. Gold is the quality bar. Product studies are for borrowing an interaction. Specimen sheets are catalogs, not compositions.

### Gold

| Need | Example | What to learn |
| --- | --- | --- |
| Still or feature card | `static-card` | Quiet hierarchy, a hard crop, one satellite, real words only on the selected customer, its neighbors and the total |
| Dark still | `dark-bento` | One signal said once; album art keeps it a music app |
| Animated hero, a gesture | `hero-demo` | Five beats, named targets, an annotation, a terminal coming forward |
| Choreography, no cursor | `payout-flow` | Slow overlapping arrivals, reading time, a payoff that holds |
| Content changing in place | `choreography` | Retained tracks, soft masks, dependent timing |
| AI answer | `ai-chat` | The question sent, Thinking, the answer streaming in with its height, sources last; no sparkles, no purple |
| AI with cards | `ai-cards` | A multiple-choice card answered and kept as the record, a card of options opening in the thread, booked from its own button |
| Form validation | `form-error` | An error on the field that caused it, cleared by fixing it, then the button confirms on itself |
| Drag to reorder | `reorder` | A row lifted by its grip, the others making room, dropped into place |
| Chart scrub | `chart-scrub` | A hairline and dot that follow the pointer, the headline value rolling to the day under it |
| Edit in a table | `table-edit` | A cell edited in place, then the total it feeds rolls a beat later |
| Loading to content | `loading` | A skeleton at the content's own geometry, rows resolving top to bottom, real chrome throughout |
| Dark hero | `dark-hero` | Depth from surface steps on black, one lit color, a status that changes on its own pill |
| Live collaborators | `presence` | Each person one color everywhere, names riding their cursors, work shown in the doc's own marks |
| System story | `subscriptions` | A chip flies into a row, MRR rolls, a second scene is the reset |
| Close-up | `close-up` | One control at 1.4x with its window's chrome, the row whole, a large cursor to match |
| Many of one | `many-of-one` | A grid of one thing off every edge, one tile in focus by depth, the only one with words |
| Fade crop | `fade-crop` | A window fading out at its foot, over filler, instead of running off an edge |
| Consumer grid | `staggered-bento` | Offset tiles, graphic art, physical objects |
| Image-led hero grid | `hero-grid` | Different grounds and materials composed as one picture |
| Upload | `upload` | A file dragged in from the desktop, an upload row with progress that settles as a file row |
| Share | `share` | A share popover over a document: an email becomes a chip, a role menu, a person added to the list |
| Swipe | `swipe` | A phone swipe to archive: press, swipe, a throw at the finger's speed, the gap closes |

### Product studies

| Need | Example | What to learn |
| --- | --- | --- |
| Design tool | `figma` | Canvas selection, a color picker, a second cursor |
| Issue tracker | `linear` | Command menu and assignment |
| Chat | `slack` | Messages, a reaction, a thread reply |
| Launcher | `raycast` | Search and clipboard history over a blurred desktop |
| Files | `finder`, `finder-glass` | Quick Look over a file list; a file moved into a folder; the same window in frosted glass |
| Music, dark | `spotify` | A dark desktop app with album art |
| Docs and editors | `notion`, `google-docs` | A slash command; a comment and its reply |
| Email | `gmail` | Hover actions, archive, an undo toast |
| Calendar, real app | `google-calendar` | Drag to create an event, the quick-create popup |
| Office | `powerpoint`, `excel` | Slide editing; AutoSum and a chart |
| Browser page | `wikipedia` | Search suggestions in a browser |
| Phone conversations | `telegram`, `imessage` | Native chat apps on an iPhone |

### Specimen and reference sheets

| Need | Example | What to learn |
| --- | --- | --- |
| Kit specimens | `chrome`, `phones`, `controls`, `parts`, `kit-extras` | Every frame and part |
| Glass | `glass` | Frosted surfaces over a color field |
| Backgrounds | `backgrounds` | One interface over twenty grounds; `references/backgrounds.md` |
| Logos | `brand-marks` | Real marks, optically sized, on light and dark; `references/brands.md` |
| A product's look | `looks` | Type, shape and color working together |
