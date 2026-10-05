# Home design system

Accessible React + TypeScript components with neutral enamel surfaces, raised
keys, genuinely circular icon buttons, and a working three-detent navigation
dial. Built from customized shadcn/ui components and Radix primitives.

**Showcase:** https://giulioungaretti.github.io/home-design-system/

## Install from GitHub

This library is distributed through GitHub, **not published to npm**. Use an
immutable commit from the separate public `giulioungaretti/home-design-system`
repository:

```sh
npm install 'git+https://github.com/giulioungaretti/home-design-system.git#<full-commit-sha>'
```

Replace `<full-commit-sha>` with a real published 40-character commit SHA.
Do not pin a moving branch. No release or SHA is implied by this staging copy.
Requires Node 24+ for the Git installation/build and React/React DOM 19+ in the
host application. Keep matching React and React DOM versions.

The `prepare` lifecycle builds ESM, CSS, and declarations on npm Git install.
npm installs the development build dependencies for that preparation; it
therefore needs registry/network access as well as GitHub access. Do not use
`--ignore-scripts` or disable development dependencies during Git preparation.
After installation, the runtime library does not require Vite or Tailwind.
`prepack` also rebuilds artifacts when creating an archive.

## Use

```tsx
import { useState } from 'react'
import {
  Button, IconButton, NavigationDial, Panel, Status, TooltipProvider,
  type NavigationPage,
} from '@giulioungaretti/home-design-system'
import '@giulioungaretti/home-design-system/styles.css'

export function Controls() {
  const [page, setPage] = useState<NavigationPage>('home')
  return (
    <TooltipProvider>
      <Panel aria-labelledby="controls-title" className="material-specimen">
        <h2 id="controls-title">Controls</h2>
        <Button variant="secondary" onClick={() => setPage('home')}>Home</Button>
        <IconButton label="Reset selection" onClick={() => setPage('home')}>
          <span aria-hidden="true">↻</span>
        </IconButton>
        <NavigationDial value={page} onValueChange={setPage} />
        <Status tone="on">Ready</Status>
      </Panel>
    </TooltipProvider>
  )
}
```

Import `styles.css` **once** at your application entry. It contains compiled
Tailwind utilities used by these components, animation utilities, exact tokens,
material rules, dial styling, and the shared layout classes. The host does not
need Tailwind compilation. It includes Tailwind's base reset and global type,
focus, selection, and reduced-motion rules: review these when integrating into
an existing application. Arbitrary utility strings added by consumers are not
automatically compiled; use your own CSS or your host's Tailwind build for them.

`tokens.css` is a separate token-only export for applications that need the
palette without the reset/material layer. The main JS export intentionally
does not auto-import CSS, allowing server rendering and explicit CSS ordering.
Customize semantic CSS variables after the library stylesheet rather than
forking component colors.

```css
/* Host stylesheet loaded after styles.css */
:root {
  --background: #f3f4f2;
}
```

## API

All components and helpers are named exports; types can be derived with React's
`ComponentProps<typeof Button>` (or the relevant component).

| Export | Contract |
| --- | --- |
| `Button`, `buttonVariants` | Typed CVA `variant`: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`. `size`: `default`, `sm`, `lg`, `icon`, `icon-lg`. Native button props; Radix Slot via `asChild`. |
| `IconButton` | Required action `label` and icon `children`; circular 48px control plus tooltip. Optional `size="sm"` is 36px, increasing to 44px for coarse pointers; `size="default"` preserves 48px. Wrap the application in `TooltipProvider`. Accepts Button variant and native props, not `asChild`. |
| `Input`, `Select`, `Textarea` | Native `input`, `select`, and `textarea` props, including React 19 `ref`, merged `className`, and `data-slot="input"`/`"select"`/`"textarea"`. Shared `.field` material and 48px minimum height. `Select` accepts native `option`/`optgroup` children, `multiple`, and `size`; no custom popup. |
| `Panel` | Semantic `section`; `surface="raised"` (default) or `"recessed"`. Supply a heading and `aria-labelledby`, or `aria-label`. |
| `Status` | `tone="off"` (default), `"on"`, or `"alert"` with required text children. Decorative signal dot; not a live region by itself. |
| `PageHeading` | Required `title` renders an h1; optional introductory children. Use one h1 per page. |
| `Switch` | Radix controlled `checked`/`onCheckedChange` or uncontrolled `defaultChecked`; label with `htmlFor`/`id` or `aria-label`. `size` accepts `sm`/`default`; both currently use the same 48×28 geometry. |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Radix `value`/`onValueChange` or `defaultValue`; give triggers/content matching values. `TabsList variant="default"` or `"line"`. Horizontal/vertical orientation. |
| `Separator` | Radix separator, horizontal/vertical; decorative by default. |
| `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` | Radix primitives with material tokens; provider defaults to zero delay. Tooltips supplement, never replace, accessible names. |
| `NavigationDial` | Controlled `value: NavigationPage` and `onValueChange`. Values: `home`, `cv`, `blog`; no routing, links, or personal data. Wire selection to your own state/router if desired. |
| `cn` | `clsx` + `tailwind-merge` for conditional and conflicting utility classes. |
| `tabsListVariants` | Typed tab-track CVA variant helper. |
| `dialPages`, `dialAngle`, `dialPosition`, `clampDialAngle`, `angularDelta` | Dial labels/detents and pure geometry helpers; same end stops used by `NavigationDial`. |

### Rotary navigation

The real knob previews relative pointer rotation and commits to the nearest
detent only on release. Pointer cancellation, blur, and Escape restore the
selected detent. The transparent native range input retains arrows, Home, End,
and screen-reader value semantics. Focused wheel input is throttled and respects
end stops; unfocused wheel input is left to page scrolling. Page labels provide
an alternate 44px touch target. These fixed Home/CV/Blog labels are a reusable
navigation contract, not included pages.

### Native fields

`Input`, `Select`, and `Textarea` retain native controlled and uncontrolled
behavior, form submission/reset, disabled states, and React 19 refs. They do not
generate labels, IDs, validation, errors, or a custom option picker. Textareas
resize vertically; use `rows` for their initial height. Input `size` and Select
`size` remain native numeric attributes, not design-system size variants.

```tsx
import { Input, Select, Textarea } from '@giulioungaretti/home-design-system'

<label className="label" htmlFor="device-name">Device name</label>
<Input
  id="device-name"
  name="deviceName"
  required
  aria-invalid={Boolean(error)}
  aria-describedby={error ? 'device-error' : 'device-hint'}
/>
{error
  ? <p className="error" id="device-error" role="alert">{error}</p>
  : <p className="helper" id="device-hint">Choose a recognizable name.</p>}

<label className="label" htmlFor="source">Source</label>
<Select id="source" name="source" defaultValue="radio">
  <option value="radio">Radio</option>
  <option value="line">Line input</option>
</Select>

<label className="label" htmlFor="notes">Notes</label>
<Textarea id="notes" name="notes" rows={3} aria-describedby="notes-hint" />
<p className="helper" id="notes-hint">Optional listening notes.</p>
```

The host owns `error` and the validation policy in this example. Import the
library stylesheet once as shown above. Native select menus retain the platform
appearance and keyboard behavior.

### Accessibility

Preserve labels, visible focus, tooltip provider context, disabled states,
and descriptive status text. `Button` forwards native attributes; set
`type="button"` explicitly inside forms unless submitting is intended.
Use `asChild` with a single semantic child. Selection/material depth never
substitutes for `aria-pressed`, label text, or validation feedback. Form fields
use shared `.field`, `.label`, `.helper`, `.error` classes: associate errors
with `aria-describedby` and set `aria-invalid`. Reduced-motion preferences
disable authored transitions. The documentation includes a skip link and
main/footer landmarks.

## Develop and verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:package
npm run build:docs
npm run dev
```

- `src/`: reusable UI, typed variants, helpers, and normative tokens.
- `docs/`: the original functional showcase plus visible local rotary selection.
- `test/`: component semantics, keyboard interaction, pointer cancellation,
  dial geometry/wheel behavior, and functional documentation.
- `dist/index.js`, `dist/styles.css`, `dist/tokens.css`, `dist/types/`: package
  artifacts (generated, not committed). ESM only; React, React DOM, and every
  runtime dependency are externalized.
- `docs-dist/`: standalone Vite site with base `/home-design-system/`.
- `scripts/verify-package.mjs`: packs and checks artifact contents, dependency
  boundaries, exports, built rendering, CSS presence, and consumer declarations.

The new lockfile belongs to this manifest. Build and documentation tooling,
test utilities, animation CSS, and specimen icons are dev dependencies; none
are needed by consumers at runtime. `npm pack` includes the actual built
artifacts and relevant usage/design/license/attribution documents.

## GitHub Pages

The Actions workflow validates, builds, packs, and builds the docs on pull
requests and pushes. Deployment is restricted to `main` in
`giulioungaretti/home-design-system`. In that **separate repository**, enable
GitHub Pages with **GitHub Actions** as the source. Pages permissions are granted
only to the deploy job. There is no npm publish step, personal-site link,
custom domain, CV, post, PDF, draft, or administrative demo.

## Attribution

The exact five-color **Never-Setting-Sun** palette is by **Halifax**, CC-BY:
https://www.colourlovers.com/palette/3060721/Never-Setting-Sun
Semantic neutrals are independently derived. Original code is MIT; see
`LICENSE` and `NOTICE` for palette credit, shadcn/ui provenance, and dependency
attributions. Third-party terms are not replaced by this repository's license.
