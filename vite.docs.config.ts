import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'docs',
  base: '/home-design-system/',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../docs-dist', emptyOutDir: true },
})
