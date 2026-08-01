# Design System — robinvanbaalen.nl

## Product Context
- **What this is:** Personal website and blog for Robin van Baalen
- **Who it's for:** Engineering leaders, hiring managers, potential consulting clients, fellow developers
- **Space/industry:** Senior software engineering / technical consulting
- **Project type:** Portfolio + editorial blog
- **Aesthetic posture:** CTO, not developer. Quiet confidence over technical signaling.

## Aesthetic Direction
- **Direction:** Editorial/Refined
- **Decoration level:** Intentional — topographic background pattern, section gradient atmosphere, kinetic hero text. Things you notice on second look, not things that announce themselves.
- **Mood:** A well-lit desk in a dark room. Literary, unhurried, professional without being corporate.
- **Reference approach:** Desaturated, tonal, serif-forward. The opposite of every teal-accent developer portfolio.

## Typography

### Font Stack
- **Serif (headings + body):** Lora (variable, 400-700 + italic), self-hosted via @fontsource
- **Sans (labels, nav, tags, buttons, form inputs):** DM Sans (variable, 100-1000), via @fontsource or Google Fonts
- **Mono (code blocks only):** IBM Plex Mono (400), self-hosted via @fontsource. Never used for UI labels, navigation, or decorative text.

### Type Scale (base 20px, ~1.25 major third)
| Token     | Size   | Usage |
|-----------|--------|-------|
| `2xs`     | 12px   | Chips, tooltips, mobile nav labels, legal |
| `xs`      | 14px   | Tags, metadata, sidebar copy |
| `sm`      | 16px   | Card descriptions, form inputs, secondary text |
| `base`    | 20px   | Body text, article prose |
| `lg`      | 24px   | Card titles, section headings |
| `xl`      | 32px   | Page headings, contact title |
| `2xl`     | 40px   | Large section headings |
| `3xl`     | 48px   | Hero subheadings |
| `display` | 60px   | Hero heading |

### Type Rules
- **Body line-height:** 1.7
- **Heading line-height:** 1.1-1.3
- **Heading letter-spacing:** -0.01em to -0.02em (tighter at larger sizes)
- **Sans labels:** Sentence case or title case, normal letter-spacing, font-weight 450-500. No uppercase, no wide tracking.
- **Mono:** Reserved exclusively for `<code>` and code blocks within articles.

## Color

### Approach: Restrained (cool slate accent)
The accent barely announces itself. Hierarchy comes from brightness and weight, not color saturation.

### Dark Theme (default)
| Token | Value | Usage |
|-------|-------|-------|
| `canvas` | `oklch(10% 0.01 260)` | Page background (named `canvas`, not `base`: a `--color-base` token would make Tailwind resolve `text-base` as a color instead of the 20px type-scale size) |
| `surface` | `oklch(14% 0.012 260)` | Cards, sidebar, raised elements |
| `surface-hover` | `oklch(17% 0.015 260)` | Hover state for surfaces |
| `edge` | `oklch(20% 0.015 260)` | Primary borders |
| `edge-subtle` | `oklch(16% 0.01 260)` | Faint separators |
| `primary` | `oklch(93% 0.015 80)` | Headings, emphasis (warm off-white) |
| `secondary` | `oklch(65% 0.01 80)` | Body text |
| `muted` | `oklch(45% 0.008 260)` | Subdued text, descriptions |
| `dim` | `oklch(30% 0.008 260)` | Very quiet, meta info |
| `accent` | `oklch(62% 0.04 260)` | Links, active states, CTAs |
| `accent-bright` | `oklch(70% 0.05 260)` | Hover on accent elements |
| `accent-dim` | `oklch(52% 0.03 260)` | Quieter accent |
| `accent-glow` | `oklch(62% 0.04 260 / 0.1)` | Background tint, focus rings |
| `accent-subtle` | `oklch(62% 0.04 260 / 0.05)` | Very faint tint (tags) |

### Light Theme
| Token | Value | Usage |
|-------|-------|-------|
| `canvas` | `oklch(97% 0.005 80)` | Page background |
| `surface` | `oklch(100% 0 0)` | Cards, sidebar |
| `surface-hover` | `oklch(95% 0.005 80)` | Hover state |
| `edge` | `oklch(85% 0.01 80)` | Primary borders |
| `edge-subtle` | `oklch(90% 0.005 80)` | Faint separators |
| `primary` | `oklch(15% 0.01 260)` | Headings |
| `secondary` | `oklch(32% 0.015 260)` | Body text (darkened 3% vs original spec for contrast) |
| `muted` | `oklch(50% 0.01 260)` | Subdued text (darkened 5% for contrast) |
| `dim` | `oklch(65% 0.008 260)` | Very quiet text (darkened 5% for contrast) |
| `accent` | `oklch(42% 0.04 260)` | Links, active states |
| `accent-bright` | `oklch(35% 0.05 260)` | Hover (darker on light) |
| `accent-dim` | `oklch(52% 0.03 260)` | Quieter accent |
| `accent-glow` | `oklch(42% 0.04 260 / 0.08)` | Focus rings |
| `accent-subtle` | `oklch(42% 0.04 260 / 0.04)` | Faint tint |

### Semantic Colors
| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `success` | `oklch(62% 0.14 150)` | `oklch(50% 0.14 150)` | Reserved (availability dot removed 2026-07-31) |
| `success-glow` | `oklch(62% 0.14 150 / 0.3)` | `oklch(50% 0.14 150 / 0.2)` | Reserved |
| `warning` | `oklch(72% 0.14 85)` | `oklch(60% 0.14 85)` | Warnings |
| `error` | `oklch(62% 0.2 25)` | `oklch(52% 0.2 25)` | Form validation |
| `info` | `oklch(62% 0.04 260)` | `oklch(42% 0.04 260)` | Informational |

## Icons
- **Library:** Phosphor Icons (`@phosphor-icons/web` v2.x)
- **Weight:** Regular (not bold, not fill)
- **Sizes:** 16-17px nav/inline, 14px section labels, 18px social

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

### Component Spacing
- Sidebar width: 260px (with 16px wrapper padding)
- Sidebar padding: 32px 24px
- Main content padding: 48px 64px (desktop), 24px (mobile)
- Section gap (divider margin): 48px
- Card padding: 24px, gap: 16px
- Sidebar radius: 12px, card radius: 8px

## Layout
- **Approach:** Grid-disciplined
- **Grid:** Sidebar (260px fixed) + fluid main content
- **Max content width:** Fluid (constrained by padding)
- **Border radius:** sm:4px, md:8px, lg:12px, xl:16px, full:9999px
- **Breakpoint:** 768px — sidebar collapses to bottom nav on mobile

### Sidebar
- Glassy: semi-transparent background with `backdrop-filter: blur(16px)`
- No box-shadow. Flat with blur.
- Border: 1px solid edge color

## Motion
- **Approach:** Intentional — motion adds meaning, not decoration
- **Easing:** enter(`cubic-bezier(0.22, 1, 0.36, 1)`) move(`cubic-bezier(0.45, 0, 0.55, 1)`)
- **Duration:** micro(75ms) short(150ms) medium(300ms) long(500ms)

### Transitions (all interactive elements)
Every hover, focus, and state change must have a transition. Nothing snaps.
- **Hover states:** `var(--dur-short)` with enter easing — border-color, color, background, box-shadow, transform
- **Theme switch:** `var(--dur-medium)` with move easing — background, color, border-color
- **Card hover:** translateY(-2px), border-color change, faint glow shadow
- **Project rows:** background change, name color shift, arrow slides in from left
- **Nav links:** color + background, nav dot tracks cursor position and returns to active
- **Links:** "View all" arrow gap widens on hover
- **Buttons:** translateY(-1px) + faint glow on hover, translateY(0) on active

### Animations
All animations respect `prefers-reduced-motion: reduce` via a two-layer approach: a global reset zeroes animation/transition durations and delays (transforms are deliberately left alone — the theme slider and nav dot position via transform), and components with entrance motion (kinetic hero) also check `matchMedia` in JS before animating.
- **Kinetic hero:** Words reveal one by one (0.1s stagger, 0.5s duration per word, enter easing). Subtitle fades in after words complete.
- **Nav dot:** Pulsating scale+opacity, 2s infinite
- **Scroll fade-in:** Sections fade up (16px translateY, long duration) via IntersectionObserver at 15% threshold. Hidden state is gated on a `.js` root class so content renders visible without JavaScript.

### View Transitions
Astro's `<ClientRouter />` with default browser crossfade — no custom `::view-transition-*` timing rules. Shared elements carry `transition:name` (sidebar with `transition:animate="none"`, nav labels, hero headings) so they persist smoothly across navigations. The project-row hover reveal is a plain CSS max-height/opacity transition (150ms), not a view transition.
- **Reduced motion:** Instant swap, no animation

No new duration tokens. No new easing curves. Consistency is craft.

## Background Pattern
SVG topographic contour lines (not dot grid):
- Thin ellipses and paths simulating terrain contours
- Stroke-width: 0.5px, using primary text color
- Opacity: 3.5% dark / 5% light
- Masked with radial-gradient (ellipse at 20% 15%, transparent at 50%)
- Fixed position, behind all content

## Section Gradient Atmosphere
Subtle radial gradient glow behind the intro section:
- `radial-gradient(ellipse at 8% 15%, accent at 3.5% opacity, transparent 50%)`
- Optional faint glow behind contact section at lower intensity
- Not on every section — just enough to raise an eyebrow

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-28 | Replace blue accent with cool slate | Blue is generic for dark dev portfolios. Desaturated slate whispers instead of talks. |
| 2026-03-28 | Replace IBM Plex Mono labels with DM Sans | Monospace labels scream "developer." DM Sans in sentence case signals CTO energy. |
| 2026-03-28 | Bump base type to 20px | Previous 16px base was too small for comfortable reading. |
| 2026-03-28 | Replace dot grid with topographic contour lines | More unusual, more editorial. Noticed on second look. |
| 2026-03-28 | Add kinetic hero text | Word-by-word reveal creates a moment of arrival. Respects reduced motion. |
| 2026-03-28 | Glassy sidebar (backdrop-filter blur, no shadow) | Flat + translucent feels modern and clean in both light and dark mode. |
| 2026-03-28 | Add light/dark mode toggle | Industry standard. Theme toggle in sidebar footer. |
| 2026-03-28 | Add section gradient atmosphere | Faint radial glow behind intro/contact. Just enough depth to raise an eyebrow. |
| 2026-03-28 | All hovers must transition | No snapping. Every interactive state change uses easing and duration tokens. |
| 2026-07-31 | Type scale implemented as Tailwind `--text-*` tokens | The scale existed only on paper; components used arbitrary pixel values. Now tokens generate the utilities. |
| 2026-07-31 | Added `2xs: 12px` | Chips, tooltips, mobile nav labels, and legal text legitimately need sub-14px; 10–13px arbitrary values consolidated. |
| 2026-07-31 | Renamed color token `base` → `canvas` | `--color-base` made Tailwind resolve `text-base` as a color, silently breaking the 20px body size. |
| 2026-07-31 | Light text tokens darkened 3–5% vs original spec | Measured contrast on the 97% background; spec values were borderline for meta text. |
| 2026-07-31 | Default transition = 150ms enter easing via `--default-transition-*` | Tailwind v4 has no `--duration-*` theme namespace; setting the defaults enforces the motion spec without per-element classes. |
| 2026-07-31 | View Transitions section rewritten to match shipped reality | Custom crossfade timing was never implemented; shared-element names + default crossfade achieve the intent. |
| 2026-07-31 | 404 page keeps a plain static heading | Error pages should render instantly; kinetic ceremony is for destination pages. Documented exception. |
| 2026-07-31 | Availability dot removed | Component was dead code; `success` tokens kept as reserved. |
