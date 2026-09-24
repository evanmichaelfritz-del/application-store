# Application Store — closed-network rebuild brief

## Closed-network rule (read first)

This document is the **store-level** source of truth.

- Do **not** fetch external pages, docs, or product sites.
- Do **not** invent demos beyond the seeded catalog.
- Do **not** mint a second transitions public repo. This is Application Store.
- Not Helix, not grok.me, not peptide / Publish product code.
- Per-piece briefs live on each card (`AGENT_PROMPT` reveal) and in `src/agentPrompts.ts`.

---

## Goal

Build **Application Store** (master storefront) as **Expo + TypeScript + React Native**, Palantir Code Workspace friendly:

```bash
npm install
npx expo start
npm run web   # port 43181
```

- Baseball-card gallery cloned from the transitions.dev Expo recreate.
- Left nav: Transitions / Effects / Graphic design / AI skills / Tools / Manual.
- Each card: **Showcase** (live demo), **Copy HTML**, **Copy CSS**, **Copy script**, **AGENT_PROMPT** reveal.
- Deploy-ready for Vercel via Expo web export (`vercel.json` → `dist`).

---

## Design lock (exact tokens)

| Token | Value |
| --- | --- |
| Page background | `#fdfdfd` |
| Cards | white |
| Card border | `rgba(0,0,0,0.06)` |
| Card shadow | `0 1px 3px rgba(0,0,0,0.04)` |
| Stage | `#f9f9f9`, border-radius **14**, height **~220px** |
| Font | **Inter** |

**Brand**

- Title: `Application Store`
- Not “transitions.dev recreate”.

**Card anatomy**

- Stage (live showcase, ~220px) → title → subtitle → **Showcase** / **Copy HTML** / **Copy CSS** / **Copy script** / **AGENT_PROMPT**.
- Pro badge on Pro demos. Same interactive demo; **no paywall**.

**Motion stack** — unchanged from the transitions recreate:

- RN-native: Reanimated (+ Gesture Handler).
- Do **not** drive demos with CSS `@keyframes`.
- Copy HTML, Copy CSS, and Copy script emit the closed-network preview pieces. Copy script says the effect is HTML and CSS only when the preview has no script.
- Reduced motion: `AccessibilityInfo` + in-app toggle.
- Springs: layout/default **20 / 280**; pop **mass 0.8, damping 12**; snap **18 / 300**.

---

## Seeded catalog

Transitions section: essential + texts pieces, including Image generation loader. Effects section: effects pieces plus libraries.dev CLEAR (Border Beam, Gooey, Liquid metal), plus Shimmer text and one gallery card per Thinking Orb preview (Solving, Thinking, Agent listening, Searching, Agent planning, Agent thinking, Working, Agent shaping) plus the Orb state picker. AI skills is empty. Graphic design / Tools empty. Manual is an add slot.

Success card subtitle: **`Success check with blur and rotate`**.
