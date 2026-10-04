---
name: Home design system
description: Neutral enamel materials and accessible physical controls for reusable React interfaces.
colors:
  palette-frost: '#FFF5F5'
  palette-sun: '#FFC62B'
  palette-orange: '#FE6900'
  palette-red: '#C82000'
  palette-chocolate: '#261914'
  background: '#F3F4F2'
  card: '#FCFCFA'
  muted: '#E9EAE7'
  muted-foreground: '#62635E'
  foreground: '#261914'
  primary: '#261914'
  primary-foreground: '#FCFCFA'
  secondary: '#FFC62B'
  destructive: '#C82000'
  border: '#B9BCB4'
  input: '#D6D8D1'
  ring: '#261914'
  surface-highlight: '#FFFFFF'
  signal: '#FE6900'
typography:
  headline:
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: 'clamp(36px, 5vw, 62px)'
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: '-0.04em'
  title:
    fontSize: '24px'
    fontWeight: 500
    letterSpacing: '-0.025em'
  body:
    fontSize: '16px'
    lineHeight: 1.7
  label:
    fontSize: '14px'
    fontWeight: 500
  support:
    fontSize: '13px'
    lineHeight: 1.6
  code:
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
    fontSize: '12px'
    lineHeight: 1.7
  wordmark:
    fontSize: '32px'
    fontWeight: 800
  wordmark-mobile:
    fontSize: '28px'
    fontWeight: 800
  specimen:
    fontSize: '38px'
    lineHeight: 1.15
    letterSpacing: '-0.04em'
rounded:
  panel: '0.1875rem'
  circular: '50%'
spacing:
  compact: '12px'
  control-gap: '16px'
  section-gap: '24px'
  section: '40px'
---

# Home design system

## Direction

**The Braun appliance fascia:** neutral enamel surfaces, chocolate lettering,
machined rules, circular physical controls, and restrained raised/recessed
depth. Inspired by real Braun appliances and Dieter Rams, without claiming
affiliation. Reading surfaces stay open and typographic; controls concentrate
into lightly rounded panels. No image assets are needed: indicators and knobs
are CSS and real accessible controls.

This standalone repository contains reusable components and an interactive
Read/Experience showcase. It does not include a personal site, content archive,
or administration application.

## Source authority

`src/styles/tokens.css` is the single normative source for semantic tokens;
its palette and aliases are preserved exactly from the original implementation.
`src/styles/appliance.css` snapshots only shared material, layout, field, status,
and showcase selectors. `src/components/NavigationDial.css` owns the rotary
control. `src/styles.css` maps semantic tokens to Tailwind and compiles utilities
only from this repository's components and documentation.

The frontmatter is a documentation snapshot, not an independent token source.
Aliases are shown as literal colors for portability; the CSS retains their
relationships. Declared `surface-recessed` and `alert-surface` are available
tokens, not additional palette colors. No synthesized tonal scales are CSS
tokens.

## Color

The exact **Never-Setting-Sun** palette is **by Halifax**, [COLOURlovers
palette 3060721](https://www.colourlovers.com/palette/3060721/Never-Setting-Sun),
**CC-BY**. The five original values are unchanged. The source screenshot named
CC-BY without a version; no version is asserted here. Surface whites and grays
are derived semantic neutrals, not additional Halifax colors. See `NOTICE`.

- Chocolate: foreground, primary actions, focus rings.
- Sun: secondary controls, checked switches, text selection.
- Orange: active indicator lights, not the default button fill.
- Red: destructive text/borders and alert states.
- Frost: palette specimen and the alert-surface alias, not general panel fill.
- Background/card/muted: chassis, raised enamel, inset tracks.
- Muted foreground: supporting copy and inactive indicators.
- Border/input: dividers and strokes, unchecked switch track.
- Surface highlight: white edge highlights in material shadows.

**The Enamel and Signal Rule:** keep broad surfaces neutral. Saturated colors
belong to implemented signals and controls; full-color swatches are specimens.

## Typography and layout

Helvetica Neue, Helvetica, Arial, sans-serif form the body/display stack.
SFMono-Regular, Consolas, Liberation Mono, monospace serve code and measurements.
Headings balance wrapping; paragraphs use pretty wrapping.

Page headings use `clamp(36px, 5vw, 62px)`, 500 weight, 1.04 line-height and
-0.04em tracking. Introductory copy is 16px/1.7 with a 65ch measure. Section
headings use 24px/500. Labels/buttons/tabs use 14px; helper/error copy 13px/1.6;
status, palette metadata, footers, and code use 12px. The specimen line is
38px/1.15; the wordmark is 32px/800, 28px on mobile. These two specimen/shell
roles are intentionally retained from the original showcase, not new body
type steps.

The shell caps at 1200px with 48px side gutters. Topbar minimum height is 106px;
page padding is 68px above and 80px below. Internal gaps are 12–24px with
40px section separation. Showcase rows pair a 230px explanation column with
flexible specimens. Panels have contextual padding.

- Up to 1000px: shell gutters become 32px.
- Up to 700px: gutters become 20px; topbar wraps with an 88px minimum; page
  padding becomes 40px/56px. Showcase sections stack, palette specimens use
  three columns, and the footer stacks.
- Body minimum width is 320px. Code specimens scroll within focusable regions
  rather than forcing page overflow.

## Elevation and shape

Depth is structural: subtle panel lift, raised keys, inset switch/tab tracks,
white edge highlights, and debossed text controls.

- Panel: `--shadow-panel` combines a short contact shadow and a low-opacity
  broad shadow.
- Control: `--shadow-control` combines an inset white top edge and a short
  exterior shadow.
- Pressed: `--shadow-pressed` reverses the cue to an inset shadow and white lower
  edge.
- Primary: a dark key has its own translucent light edge and darker contact
  shadow. Switch thumbs retain Tailwind's small shadow.

**The Physical State Rule:** raised controls depress 1px on activation or
`aria-pressed="true"`. Flat controls have no shadow. Active tabs are raised keys
in an inset track.

Panels, fields, buttons, and tab keys share a 3px radius; Tailwind's `rounded-sm`,
`rounded-md`, and `rounded-lg` map to that semantic radius. Icon buttons are
48px or 64px circles; indicator dots and knobs are circular. Switch tracks are
pill-shaped because a circular thumb travels within them, not because every
panel should be a pill. Borders are generally 1px.

## Components

Customized shadcn/ui sources retain Radix Slot, switch, tabs, tooltip, and
separator semantics. Typed variants use CVA; `cn` combines `clsx` and
`tailwind-merge`. `Panel`, `Status`, `IconButton`, `PageHeading`, and
`NavigationDial` provide the reusable local layer. See README's API table.

- Buttons: chocolate default, raised enamel outline, Sun secondary, transparent
  ghost, enamel/red destructive, underlined link. Default/small minimum height
  44px, large 52px; horizontal padding 20px/12px/24px. Icon sizes are 48px/64px
  with 16px/20px SVGs. `IconButton` requires a label and supplies a tooltip.
- Panels: card fill, border, and panel shadow; recessed uses muted fill/no
  shadow. Name semantic sections when they represent a region.
- Fields: 48px minimum height, card fill, inset contact shadow, shared radius.
  Invalid fields have a destructive border plus associated error copy. Disabled
  fields use 50% opacity; buttons/tab keys use 45%.
- Tabs: inset muted 48px track with 40px keys. Active keys gain card fill,
  border, and shadow. The line variant removes track fill/border.
- Switches: 48×28px inset track, 20px card thumb; checked Sun fill and 24px thumb
  translation, unchecked 2px. The accepted `size` prop does not change geometry.
- Status: orange on, muted off, red alert, always paired with text.
- Navigation dial: 68px knob in a 180px group, -60°/0°/60° detents, mechanical
  face rotation. Native range and labels expose selection; drag preview only
  commits on release. Home/CV/Blog are fixed local navigation labels, not pages.

## Motion and accessibility

Control shadow and transform transitions use 160ms with `--ease-mechanical`;
background uses 160ms default ease. Hover darkens controls at brightness 0.97.
Switch-thumb transform uses Tailwind's 150ms default transition. Dial face
rotation uses 180ms mechanical easing and no transition while dragging.
Reduced motion disables animations/transitions and restores automatic scrolling.

Global visible focus is a 2px chocolate outline offset 4px; dial focus is
offset 5px. Preserve labels, tooltip provider context, native keyboard behavior,
disabled states, and meaningful text alongside indicator colors. Tooltips
supplement labels. The showcase includes title/description metadata, skip link,
main/footer landmarks, accessible local validation, and live outputs.

## Do and don't

- Use semantic tokens and existing typed variants.
- Keep icon controls truly circular and panels minimally rounded.
- Retain material shadows, exact palette values, and Halifax attribution.
- Pair color with text and preserve visible keyboard focus.
- Do not substitute hex values into individual components or promote
  documentation snapshots to independent tokens.
- Do not imply local specimens persist data or operate real devices.
- Do not add personal content or application-specific CSS to the library.
