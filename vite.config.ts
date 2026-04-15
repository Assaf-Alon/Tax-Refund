import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import metadataPlugin from './vite-plugin-metadata'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), metadataPlugin()],
  // Required for GitHub Pages: repo name must match
  base: '/Tax-Refund/',
  server: {
    host: true,
    port: 10000,
    strictPort: false,
  },
})
