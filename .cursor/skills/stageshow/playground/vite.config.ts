import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const here = dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  plugins: [react()],
  build: { target: 'es2022' },
  server: { host: '127.0.0.1', fs: { allow: [resolve(here, '..'), resolve(here, '../../../..')] } },
  resolve: { dedupe: ['react', 'react-dom'] },
})
