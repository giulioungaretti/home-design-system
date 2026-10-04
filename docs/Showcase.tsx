import { useState, type FormEvent } from 'react'
import {
  ArrowUpRight,
  Check,
  Info,
  Minus,
  Plus,
  Power,
  RotateCcw,
} from 'lucide-react'
import {
  Button, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Separator,
  IconButton, Panel, PageHeading, Status, NavigationDial,
  type NavigationPage,
} from '../src/index.js'

const palette = [
  { name: 'p3_c007', value: '#FFF5F5', token: '--palette-frost' },
  { name: 'Texas Sun', value: '#FFC62B', token: '--palette-sun' },
  { name: 'Sunscreen', value: '#FE6900', token: '--palette-orange' },
  { name: 'against', value: '#C82000', token: '--palette-red' },
  { name: 'bitter chocolate', value: '#261914', token: '--palette-chocolate' },
] as const

export function Showcase() {
  const [powered, setPowered] = useState(false)
  const [switchOn, setSwitchOn] = useState(true)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [level, setLevel] = useState(2)
  const [page, setPage] = useState<NavigationPage>('home')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter a device name to try the local form.')
      setSaved('')
      return
    }
    if (name.trim().length > 40) {
      setError('Use 40 characters or fewer for the device name.')
      setSaved('')
      return
    }
    setError('')
    setSaved(
      `“${name.trim()}” accepted in this specimen. Nothing was sent or saved.`,
    )
  }
  return (
    <>
      <PageHeading title="Less, but considered.">
        A small design system inspired by the clarity and tactility of Braun
        appliances. Built with Tailwind CSS, typed variants, and shadcn/ui’s
        Radix primitives.
      </PageHeading>
      <section className="showcase-section" aria-labelledby="palette-heading">
        <div>
          <h2 id="palette-heading" className="section-heading">
            Color
          </h2>
          <p>
            Enamel whites do the work. Color is a signal, never the whole
            surface.
          </p>
        </div>
        <div>
          <div className="palette">
            {palette.map((color) => (
              <div key={color.token}>
                <div
                  className="swatch"
                  style={{ background: `var(${color.token})` }}
                />
                <div className="swatch-meta">
                  {color.name}
                  <code>{color.value}</code>
                </div>
              </div>
            ))}
          </div>
          <p className="helper mt-6">
            <a
              href="https://www.colourlovers.com/palette/3060721/Never-Setting-Sun"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Never-Setting-Sun by Halifax
            </a>
            , CC-BY. The original palette values are preserved exactly.
            Surface neutrals are separately derived.
          </p>
        </div>
      </section>
      <section className="showcase-section" aria-labelledby="buttons-heading">
        <div>
          <h2 id="buttons-heading" className="section-heading">
            Controls
          </h2>
          <p>
            Raised at rest. Recessed under pressure. Every icon control is
            genuinely circular.
          </p>
        </div>
        <div>
          <div className="specimen">
            <Button onClick={() => setPowered(!powered)} aria-pressed={powered}>
              <Power aria-hidden="true" />
              {powered ? 'Demo power on' : 'Demo power off'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setLevel((previous) => Math.min(5, previous + 1))}
            >
              Increase level
              <Plus aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => setLevel(2)}>
              <RotateCcw aria-hidden="true" />
              Reset level
            </Button>
            <Button disabled>Unavailable</Button>
          </div>
          <div className="specimen">
            <IconButton
              label="Lower demo level"
              onClick={() => setLevel((previous) => Math.max(0, previous - 1))}
              disabled={level === 0}
            >
              <Minus aria-hidden="true" />
            </IconButton>
            <output
              className="font-mono text-sm"
              aria-live="polite"
              aria-label="Demo level"
            >
              Level {level} / 5
            </output>
            <IconButton
              label="Raise demo level"
              variant="secondary"
              onClick={() => setLevel((previous) => Math.min(5, previous + 1))}
              disabled={level === 5}
            >
              <Plus aria-hidden="true" />
            </IconButton>
            <Button asChild variant="link">
              <a href="#usage">
                Usage notes
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </div>
          <p className="helper">
            Try these controls. Their state lives only in this page.
          </p>
        </div>
      </section>
      <section className="showcase-section" aria-labelledby="navigation-heading">
        <div>
          <h2 id="navigation-heading" className="section-heading">
            Rotary navigation
          </h2>
          <p>
            Three end-stopped detents. Drag, use the keyboard, scroll while
            focused, or press a label.
          </p>
        </div>
        <div>
          <div className="specimen">
            <NavigationDial value={page} onValueChange={setPage} />
            <output className="font-mono text-sm" aria-live="polite">
              Selected: {page === 'cv' ? 'CV' : page === 'blog' ? 'Blog' : 'Home'}
            </output>
          </div>
          <p className="helper">
            Home, CV, and Blog are local specimen labels, not links to personal
            content. Selection is not persisted.
          </p>
        </div>
      </section>
      <section className="showcase-section" aria-labelledby="states-heading">
        <div>
          <h2 id="states-heading" className="section-heading">
            State & selection
          </h2>
          <p>
            Color is paired with a label. Switches and tabs preserve native
            keyboard behavior.
          </p>
        </div>
        <div>
          <div className="specimen">
            <Status tone="on">Running</Status>
            <Status>Paused</Status>
            <Status tone="alert">Attention needed</Status>
          </div>
          <div className="specimen">
            <label htmlFor="specimen-switch" className="text-sm">
              Demo service {switchOn ? 'on' : 'off'}
            </label>
            <Switch
              id="specimen-switch"
              checked={switchOn}
              onCheckedChange={setSwitchOn}
            />
            <Switch disabled aria-label="Unavailable switch" />
          </div>
          <Tabs defaultValue="overview" className="mt-7">
            <TabsList aria-label="Component information">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="keyboard">Keyboard</TabsTrigger>
              <TabsTrigger value="material">Material</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="helper">
                Radix manages roles, selection, and focus. Our tokens define the
                physical finish.
              </p>
            </TabsContent>
            <TabsContent value="keyboard">
              <p className="helper">
                Use left and right arrows to move between tabs. Space toggles a
                focused switch.
              </p>
            </TabsContent>
            <TabsContent value="material">
              <p className="helper">
                3px panel corners, crisp borders, inset tracks, and a single
                raised control shadow.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <section className="showcase-section" aria-labelledby="fields-heading">
        <div>
          <h2 id="fields-heading" className="section-heading">
            Inputs & feedback
          </h2>
          <p>
            Useful labels. Clear recovery. No placeholder masquerading as a
            field name.
          </p>
        </div>
        <form className="specimen-form" onSubmit={submit} noValidate>
          <label className="label" htmlFor="device-name">
            Demo device name
          </label>
          <input
            className="field"
            id="device-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setSaved('')
            }}
            placeholder="e.g. kitchen radio"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'device-error' : 'device-hint'}
          />
          {error ? (
            <p className="error" id="device-error" role="alert">
              {error}
            </p>
          ) : (
            <p className="helper" id="device-hint">
              1–40 characters. This specimen does not persist data.
            </p>
          )}
          <Button type="submit" variant="outline" className="mt-5">
            <Check aria-hidden="true" />
            Try validation
          </Button>
          <p
            className="helper mt-4"
            role="status"
            aria-label="Validation result"
          >
            {saved}
          </p>
        </form>
      </section>
      <section className="showcase-section" aria-labelledby="materials-heading">
        <div>
          <h2 id="materials-heading" className="section-heading">
            Type & material
          </h2>
          <p>
            Precision without decoration. A familiar grotesk and restrained
            mechanical detail.
          </p>
        </div>
        <div>
          <p className="sample-type">Form follows clarity.</p>
          <p className="helper mt-4">
            Helvetica Neue / Helvetica / Arial. Monospace is reserved for code
            and measurements.
          </p>
          <Separator className="my-6" />
          <Panel className="material-specimen" aria-label="Material example">
            <div className="dial shrink-0" aria-hidden="true" />
            <p>
              A shallow enamel panel. An inset rule. A physical dial, shown as a
              decorative material specimen, not an interactive control.
            </p>
          </Panel>
        </div>
      </section>
      <section
        id="usage"
        className="showcase-section"
        aria-labelledby="usage-heading"
      >
        <div>
          <h2 id="usage-heading" className="section-heading">
            Use the system
          </h2>
          <p>
            A small API, one source of semantic tokens, and accessible
            primitives.
          </p>
        </div>
        <div>
          <div className="notice">
            <Info aria-hidden="true" />
            <p>
              Start with a semantic token or an existing variant. Don’t copy a
              hex value into a component. Give every icon-only button an action
              label.
            </p>
          </div>
          <pre
            className="code-sample"
            tabIndex={0}
            role="region"
            aria-label="Component usage example"
          >
            <code>{`import { Button, IconButton, Panel, TooltipProvider }\n  from '@giulioungaretti/home-design-system'\nimport '@giulioungaretti/home-design-system/styles.css'\n\n<TooltipProvider>\n  <Button variant="secondary">Try control</Button>\n  <IconButton label="Reset demo" onClick={reset}>\n    <RotateCcw aria-hidden="true" />\n  </IconButton>\n  <Panel aria-labelledby="section-title">…</Panel>\n</TooltipProvider>`}</code>
          </pre>
          <p className="helper">
            See README.md and DESIGN.md for architecture, variant usage,
            accessibility, and token guidance.
          </p>
        </div>
      </section>
    </>
  )
}
