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

Expo web export is the host path. `vercel.json` sets install, build, and `dist` output.

### Ship / Store — CLI

From the repo root (logged in with `vercel`):

```bash
npm install
npx vercel           # preview
npx vercel --prod    # production
```

Or connect the Git remote in the Vercel dashboard:

1. **Add New Project** → import this repo.
2. Framework Preset: **Other** (do not pick Next.js).
3. Build Command: `npx setup-skia-web public && npx expo export --platform web`
4. Output Directory: `dist`
5. Install Command: `npm install`
6. Node.js **20+**.
7. Deploy. Vercel rewrites SPA routes to `/index.html` and serves `/canvaskit.wasm` as `application/wasm`.

Local production-shaped check:

```bash
npm run export:web
npx serve dist
```

Gooey on web needs `public/canvaskit.wasm` (created by `setup-skia-web`). The wasm file is gitignored; CI / Vercel regenerate it during install/build.

## Recreate a piece

Each card’s **AGENT_PROMPT** button reveals a closed-network brief for that piece. Store-level brief: [AGENT_PROMPT.md](./AGENT_PROMPT.md).
