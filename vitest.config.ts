import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

/**
 * Stubs static asset imports (png, gif, etc.) during vitest runs.
 * Only active when VITEST env var is set.
 */
function assetStubPlugin(): Plugin {
    return {
        name: 'asset-stub',
        enforce: 'pre',
        resolveId(source) {
            if (/\.(png|jpe?g|gif|svg|webp)$/.test(source)) {
                return '\0asset-stub';
            }
        },
        load(id) {
            if (id === '\0asset-stub') {
                return 'export default "test-asset-stub"';
            }
        },
    };
}

export default defineConfig({
    plugins: [react(), assetStubPlugin()],
    test: {
        environment: 'jsdom',
        globals: false,
    },
})
