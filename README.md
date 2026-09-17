# Application Store

Evan Fritz’s master storefront — Expo (React Native + TypeScript) baseball-card gallery. Live showcase, **Copy code**, and **AGENT_PROMPT** on every seeded piece. Not Helix. Not grok.me.

Adapted from the transitions.dev Expo recreate (`evanmichaelfritz-del/transitions-dev-expo`). Same card chrome, stages, springs, and Inter / `#fdfdfd` language. This is a new Application Store app, not a second transitions public repo.

## Left nav

| Section | Contents |
| --- | --- |
| Transitions | Essential + text pieces from the transitions.dev catalog |
| Effects | Confetti, gooey, stacks, dissolve, drag physics, 3D tilt |
| Graphic design | Empty placeholder (libraries.dev ingest later) |
| AI skills | Shimmer text (AI-tagged seed) |
| Tools | Empty placeholder |
| Manual | Hand-authored add slot |

Out of scope this pass: Border Beam / Gooey extras / Liquid metal / Thinking orbs — ingest after libraries.dev clears.

## Open in Palantir Code Workspace (VS Code + RN suite)

1. Clone this repo.
2. Open the **repository root** (the folder with `app.json` and `package.json`).
3. In the integrated terminal:

```bash
npm install
npx expo start
```

4. Scan the QR code with **Expo Go**, or press `i` / `a` for a simulator. For web:

```bash
npx setup-skia-web public   # vendors public/canvaskit.wasm (also runs on npm install)
npm run web                 # Expo web on port 43181
```

Web entry is `index.web.tsx`: `LoadSkiaWeb({ locateFile: (file) => \`/${file}\` })` then `renderRootComponent(App)`. Native / Code Workspace entry stays `index.js` (`react-native-gesture-handler` first, then Expo Router). One-screen `/` route (`app/index.tsx` + thin `app/_layout.tsx`). No native `ios/` / `android/` folder.

`.vscode` is the Expo tabs template. Open this folder directly; the RN suite can attach to Metro on the port Expo prints.

## Stack

- Expo SDK 57, React Native 0.86, React 19, TypeScript
- Expo Router
- `react-native-reanimated` 4 + `react-native-worklets`
- `react-native-gesture-handler`
- `react-native-svg`
- `@shopify/react-native-skia` (Gooey metaball; CanvasKit on web)
- Inter via `@expo-google-fonts/inter`
- `expo-clipboard` for Copy code / Copy prompt

Motion is RN-native (`src/motion.ts`). Copy still emits portable CSS for paste-into-web.

## Scripts

```bash
npm start          # Expo Dev Tools
npm run web        # Web on port 43181
npm run export:web # Static web export → dist/ (Vercel input)
npm run ios
npm run android
```

## Deploy on Vercel (continuous ship)

Expo web export is the host path. `vercel.json` sets install, build, and `dist` output. Production branch is **main**. Do **not** GitHub-mirror this repo just to get a Vercel URL. Do **not** use grok.me.

### Origin ↔ Vercel (required for continuous deploys)

Origin-hosted repos stay private. Vercel’s Origin git integration is in public beta and **will not deploy Origin repos from a Hobby team** — use a Vercel Pro/team.

**From Origin (preferred)**

1. Open this repo on Cursor: [cursor.com/codebase](https://cursor.com/codebase) → this Application Store repo.
2. **Settings → Apps → Manage Apps**.
3. Connect **Vercel** and authorize Evan’s Vercel team (Owner or Member).
4. Import this Origin repo into a Vercel project.
5. Confirm production branch **main**. Framework **Other**. Build / output already in `vercel.json`:
   - Build: `npx setup-skia-web public && npx expo export --platform web`
   - Output: `dist`
   - Install: `npm install`
   - Node **20+**
6. Deploy. After that, every push to `main` is production; other branches / PRs get previews.

**From Vercel**

1. [vercel.com](https://vercel.com) → **Add New Project** → **Continue with Origin** ([docs](https://vercel.com/docs/git/vercel-for-origin)).
2. Connect the Origin team, pick this repo, review settings, **Deploy**.

### One-shot CLI (not continuous)

Needs `vercel login` or `VERCEL_TOKEN` in an interactive / secret-backed environment. Does **not** replace the Origin git link:

```bash
npx vercel           # preview
npx vercel --prod    # production
```

Local production-shaped check:

```bash
npm run export:web
npx serve dist
```

Gooey on web needs `public/canvaskit.wasm` (created by `setup-skia-web`). The wasm file is gitignored; CI / Vercel regenerate it during install/build.

## Recreate a piece

Each card’s **AGENT_PROMPT** button reveals a closed-network brief for that piece. Store-level brief: [AGENT_PROMPT.md](./AGENT_PROMPT.md).
