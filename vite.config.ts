import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const externals = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies })

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: 'src/style-entry.ts',
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'styles',
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) => externals.some((name) => id === name || id.startsWith(`${name}/`)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    css: false,
  },
})
