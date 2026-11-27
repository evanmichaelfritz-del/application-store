#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

node scripts/check-vercel-routes.mjs
node scripts/check-prompts.mjs
npx setup-skia-web public
npx expo export --platform web
cp dist/index.html dist/404.html
node scripts/check-glisse-export.mjs
node scripts/check-open-bot-avatar-export.mjs
