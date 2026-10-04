import { copyFileSync } from 'node:fs'

copyFileSync(new URL('../src/styles/tokens.css', import.meta.url), new URL('../dist/tokens.css', import.meta.url))
