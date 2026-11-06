# BaseCase design system

Warm "paper" colour palette (cream background, ink text, coral accent) on
the original rounded, soft-shadow UI language: Inter body, Space Grotesk
semibold display, JetBrains Mono labels. Light is the default; the warm dark
variant is toggled with `<ThemeToggle />` (next-themes, `class="dark"`).

Everything visual flows from `app/globals.css`. Do not hardcode colours or
load extra fonts in components.

## Tokens (Tailwind utilities)

| Purpose            | Utilities                                                                 |
| ------------------ | ------------------------------------------------------------------------- |
| Page / surfaces    | `bg-bg` (paper), `bg-surface`, `bg-surface-2` (card, white), `bg-surface-3` |
| Rules / borders    | `border-line` (hairline), `border-line-strong`, `border-fg` (1.5px emphasis) |
| Text               | `text-fg` (ink), `text-fg-secondary` (body), `text-fg-muted`, `text-fg-dim` |
| Accent (coral)     | `text-accent`, `bg-accent`, `text-accent-ink` (text on accent), `bg-accent-soft`, `text-accent-hover`, `bg-accent-deep` |
| Highlight / scrim  | `bg-highlight` (marker yellow), `bg-scrim` (modal backdrop)              |
| Status             | `text-success`, `text-warning`, `text-danger`, `text-info` (+ `bg-*`)   |
| Fonts              | `font-sans` (Inter), `font-display` (Space Grotesk, always 600), `font-mono` (JetBrains Mono) |
| Shadows            | `shadow-soft`, `shadow-hard` (deep soft), `shadow-hard-sm`                |

Translucent tints: use the ink with an opacity modifier (`bg-fg/5`,
`border-fg/10`) — never `white/…` or `black/…`, they break in one theme.

CSS variables with the same names exist for inline styles:
`var(--bg) var(--surface) var(--surface-2) var(--line) var(--fg)
var(--fg-secondary) var(--fg-muted) var(--accent) var(--accent-ink)
var(--accent-soft) var(--highlight) var(--success) var(--danger)`, plus
`--syn-keyword/-string/-number/-comment` for code mocks.

## Recipes (plain class names)

- `btn` + `btn-primary` (solid accent, soft accent glow) | `btn-secondary`
  (card + border) | `btn-ghost` | `btn-outline-accent` (+ `btn-sm | btn-lg`)
- `input-base`
- `card-base` (card + hairline + 1rem radius), `card-hover` (lift, accent
  border, accent-tinted soft shadow, highlighter sweep; add `card-icon` /
  `card-arrow` to children for nudges), `card-glow-top` (accent top rule)
- `chip` + `chip-accent | chip-neutral | chip-easy | chip-medium | chip-hard`
- `eyebrow` (mono uppercase accent label), `text-gradient` (accent gradient
  text), `mark` (highlighter, optional)
- `bg-grid`, `bg-dots`, `mask-radial`, `mask-x`, `divider-glow` (hairline)
- `skeleton` (shimmer loader), `border-beam` (rotating accent border),
  `spotlight`, `nav-glass`, `syn-keyword|string|number|comment`

## Components (`@/components/shared`)

`AmbientBackground`, `Container`, `DifficultyBadge`, `EmptyState`, `GlowCard`,
`LoadingScreen`, `Logo`, `Marquee`, `PageHero`, `ProgressBar`, `Reveal`
(framer-motion `whileInView`, once), `SearchFilterBar`, `SectionHeader`,
`StatTile`, `ThemeToggle`, `ThemedToaster`. Difficulty helpers live in
`@/lib/difficulty`. Motion primitives (`Stagger`, `StaggerItem`, `MotionCard`,
`CountUp`, `TiltCard`, `PageTransition`, presets) live in `@/components/motion`.

## Performance rules

1. No `backdrop-blur` outside the navbar (`nav-glass`, 8px). Use solid `bg-surface-2`.
2. No `blur-2xl/3xl` glow divs and never animate them. Use the static
   gradients from `bg-ambient` / `PageHero` instead.
3. One background layer per page: `AmbientBackground` is mounted in the
   `(main)`, `(auth)` and landing layouts — pages must not add their own.
4. Animate only `transform` and `opacity`; keep durations 150–300 ms; use
   `Reveal`/`Stagger` (observed once) rather than scroll listeners.
5. `<style>` blocks inside components must not redefine `:root` variables.
6. Don't fetch the session on the client — layouts pass it down as a prop
   (`lib/auth-session.ts#getServerSession`, mock-aware).
7. Heavy client libs (Monaco, three.js) load through `next/dynamic` with
   `ssr: false` and a `skeleton`, and never re-mount on unrelated renders.
