import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const work = join(root, '.verification')
mkdirSync(work, { recursive: true })

try {
  const output = execFileSync('npm', ['pack', '--json', '--pack-destination', work], {
    cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'],
  })
  const jsonStart = output.search(/\[\s*\{\s*"id"\s*:/)
  assert(jsonStart >= 0, 'npm pack did not return its JSON manifest')
  const [archive] = JSON.parse(output.slice(jsonStart))
  const files = new Set(archive.files.map((file) => file.path))
  for (const required of [
    'dist/index.js', 'dist/styles.css', 'dist/tokens.css', 'dist/types/index.d.ts',
    'dist/types/components/ui/button.d.ts', 'dist/types/components/NavigationDial.d.ts',
    'dist/types/components/ui/input.d.ts', 'dist/types/components/ui/select.d.ts',
    'dist/types/components/ui/textarea.d.ts',
    'README.md', 'DESIGN.md', 'LICENSE', 'NOTICE', 'package.json',
  ]) assert(files.has(required), `Missing packed file: ${required}`)
  for (const name of files) {
    assert(/^(dist\/|README\.md$|DESIGN\.md$|LICENSE$|NOTICE$|package\.json$)/.test(name), `Unintended packed file: ${name}`)
  }

  execFileSync('tar', ['-xzf', join(work, archive.filename), '-C', work])
  const packed = join(work, 'package')
  const manifest = JSON.parse(readFileSync(join(packed, 'package.json'), 'utf8'))
  assert.equal(manifest.name, '@giulioungaretti/home-design-system')
  assert.equal(manifest.version, '0.1.0')
  for (const path of [manifest.main, manifest.types, manifest.exports['./styles.css'], manifest.exports['./tokens.css']]) {
    assert(files.has(path.replace(/^\.\//, '')), `Export target missing: ${path}`)
  }
  const code = readFileSync(join(packed, 'dist/index.js'), 'utf8')
  assert(!code.includes('@/'), 'Bundle contains application aliases')
  assert(!/(?:from\s*|import\s*)["'][^"']+\.css["']/.test(code), 'Main JS must allow explicit stylesheet ordering and SSR')
  for (const dependency of ['react', 'class-variance-authority', 'clsx', 'tailwind-merge', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-separator']) {
    assert(code.includes(`"${dependency}"`) || code.includes(`'${dependency}'`), `Dependency was not externalized: ${dependency}`)
  }
  for (const name of ['lucide-react', 'tailwindcss', 'tw-animate-css', 'vite', 'vitest']) {
    assert(!manifest.dependencies[name], `${name} must remain a development dependency`)
  }
  const css = readFileSync(join(packed, 'dist/styles.css'), 'utf8')
  for (const selector of ['.control-primary', '.control-raised', '.control-flat', '.control-signal', '.physical-switch', '.rounded-full', '.size-12', '.size-16', '.bg-primary', '.bg-secondary', '.bg-card', '.sr-only', '.navigation-dial', '.tabs-track', '.tabs-key', '.field', '.status', '.showcase-section']) {
    assert(css.includes(selector), `Compiled CSS missing ${selector}`)
  }
  for (const token of ['--palette-frost', '--palette-sun', '--palette-orange', '--palette-red', '--palette-chocolate', '--shadow-control', '--shadow-pressed', '--type-sans']) {
    assert(css.includes(`${token}:`), `Bundled stylesheet missing token definition ${token}`)
  }
  assert(!/\.(cv-|login-|service-|console\b|dashboard-)/.test(css), 'Application-specific CSS leaked into library')
  assert.equal(readFileSync(join(packed, 'dist/tokens.css'), 'utf8'), readFileSync(join(root, 'src/styles/tokens.css'), 'utf8'))
  function checkDeclarations(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) checkDeclarations(path)
      else {
        const declaration = readFileSync(path, 'utf8')
        assert(!declaration.includes('@/'), `Alias leaked into ${path}`)
        assert(!declaration.includes('.css'), `CSS side effect leaked into ${path}`)
        assert(!declaration.includes('vite/client'), `Vite ambient types leaked into ${path}`)
      }
    }
  }
  checkDeclarations(join(packed, 'dist/types'))
  const library = await import(pathToFileURL(join(packed, 'dist/index.js')).href)
  const markup = renderToStaticMarkup(createElement(library.TooltipProvider, null,
    createElement(library.Panel, { 'aria-label': 'Packed controls' },
      createElement(library.Button, { variant: 'secondary' }, 'Ready'),
      createElement(library.NavigationDial, { value: 'home', onValueChange() {} }),
    )))
  assert(markup.includes('control-signal') && markup.includes('aria-valuetext="Home"'), 'Packed ESM could not render actual components')
  const fields = renderToStaticMarkup(createElement('form', null,
    createElement(library.Input, { name: 'title', 'aria-label': 'Title', defaultValue: 'Radio' }),
    createElement(library.Select, { name: 'source', 'aria-label': 'Source', defaultValue: 'radio' },
      createElement('option', { value: 'radio' }, 'Radio')),
    createElement(library.Textarea, { name: 'notes', 'aria-label': 'Notes', defaultValue: 'Morning' }),
  ))
  for (const tag of ['input', 'select', 'textarea']) {
    assert(fields.includes(`<${tag} data-slot="${tag}" class="field"`), `Packed ${tag} must retain native semantics and field material`)
  }
  assert(fields.includes('selected=""'), 'Packed Select must retain native default selection')
  assert(css.includes('.size-9') && css.includes('(pointer:coarse)'), 'Compact icon and coarse-pointer styles must be compiled')

  const consumer = join(work, 'consumer')
  mkdirSync(join(consumer, 'node_modules/@giulioungaretti'), { recursive: true })
  symlinkSync(packed, join(consumer, 'node_modules/@giulioungaretti/home-design-system'), 'dir')
  writeFileSync(join(consumer, 'package.json'), '{"type":"module"}\n')
  writeFileSync(join(consumer, 'usage.tsx'), `
import { Button, IconButton, Input, Select, Textarea, NavigationDial, Panel, TooltipProvider, type NavigationPage } from '@giulioungaretti/home-design-system'
import { createRef, type ComponentProps } from 'react'
const page: NavigationPage = 'home'
const props: ComponentProps<typeof Button> = { variant: 'secondary', size: 'icon' }
// @ts-expect-error Invalid variants must remain rejected by the public declarations.
const invalid: ComponentProps<typeof Button> = { variant: 'not-a-variant' }
void invalid
// @ts-expect-error IconButton accepts only its own compact/default sizes.
const invalidIcon: ComponentProps<typeof IconButton> = { label: 'Reset', children: null, size: 'lg' }
// @ts-expect-error Native Select size remains numeric.
const invalidSelect: ComponentProps<typeof Select> = { size: 'sm' }
// @ts-expect-error Input refs must target an input.
const invalidRef: ComponentProps<typeof Input> = { ref: createRef<HTMLTextAreaElement>() }
void invalidIcon; void invalidSelect; void invalidRef
export const specimen = <TooltipProvider><Panel><Button {...props}>Ready</Button><IconButton label="Reset"><span /></IconButton><IconButton size="sm" label="Compact reset"><span /></IconButton><NavigationDial value={page} onValueChange={() => {}} />
<Input ref={createRef<HTMLInputElement>()} size={20} type="email" name="email" aria-label="Email" aria-invalid aria-describedby="email-error" onChange={(event) => { const value: string = event.target.value; void value }} />
<Select ref={createRef<HTMLSelectElement>()} multiple size={3} name="sources" aria-label="Sources" onChange={(event) => { const options: HTMLCollectionOf<HTMLOptionElement> = event.target.selectedOptions; void options }}><option value="radio">Radio</option></Select>
<Textarea ref={createRef<HTMLTextAreaElement>()} rows={4} maxLength={200} name="notes" aria-label="Notes" onChange={(event) => { const value: string = event.target.value; void value }} />
</Panel></TooltipProvider>
`)
  execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'),
    '--ignoreConfig', '--noEmit', '--strict', '--jsx', 'react-jsx',
    '--types', 'react,react-dom', '--noUncheckedSideEffectImports',
    '--module', 'NodeNext', '--moduleResolution', 'NodeNext',
    '--target', 'ES2022', join(consumer, 'usage.tsx')],
  { cwd: consumer, stdio: 'inherit' })
  console.log(`Verified ${archive.filename}: ${files.size} packed files, ESM rendering, styles, exports, external dependencies, and consumer declarations.`)
} finally {
  rmSync(work, { recursive: true, force: true })
}
