# Design Brief

## Direction

**Roast Ledger** — a specialty coffee-bean storefront that reads like a meticulous roaster's logbook: warm paper, espresso ink, and lab-precise spec data.

## Tone

Editorial / organic-natural with an analytical edge — a roastery that treats beans as data, not decoration.

## Differentiation

Prices, roast levels, and weights are set in monospace like instrument readouts, so the catalog feels like a tasting ledger rather than a generic café page.

## Color Palette

| Token      | OKLCH            | Role                          |
| ---------- | ---------------- | ----------------------------- |
| background | 0.965 0.014 78   | warm paper cream              |
| foreground | 0.215 0.032 52   | espresso ink text             |
| card       | 0.995 0.006 80   | near-white bag stock          |
| primary    | 0.545 0.155 45   | roast tangerine (CTA, badges) |
| accent     | 0.60 0.135 150   | fresh matcha (in-stock)       |
| muted      | 0.925 0.018 76   | sand surfaces                 |

## Typography

- Display: Fraunces — headings, wordmark, product names
- Body: General Sans — paragraphs, UI labels, nav
- Mono: Geist Mono — prices, roast codes, weights, order refs
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold`, label `kicker` utility, body `text-base md:text-lg`

## Elevation & Depth

Flat paper base with a single raised tier: product cards lift on `shadow-card` and deepen to `shadow-elevated` on hover; no glass, no glow.

## Structural Zones

| Zone    | Background          | Border             | Notes                                  |
| ------- | ------------------- | ------------------ | -------------------------------------- |
| Header  | `bg-card`           | `border-b border-border` | Sticky, cart count badge in primary |
| Content | `bg-background`     | —                  | Alternate `bg-muted/40` per section    |
| Footer  | `bg-foreground`     | `border-t`         | Espresso band, cream text, opening hours |

## Spacing & Rhythm

Generous section gaps (`py-16 md:py-24`), tight intra-card spacing (`gap-2`), and `gap-6 md:gap-8` product grids for an airy catalog rhythm.

## Component Patterns

- Buttons: `rounded-full` primary in roast tangerine, hover darkens + lifts; ghost/outline secondary
- Cards: `rounded-xl` white surfaces with `shadow-card`, image top, spec block bottom
- Badges: `rounded-full` pills — roast level in primary, freshness dot in accent, out-of-stock in muted

## Motion

- Entrance: `animate-fade-in-up` staggered on hero and grid (0.5s, cubic-bezier)
- Hover: `transition-smooth` lift + shadow deepen on cards and buttons (0.3s)
- Decorative: `animate-steam` soft opacity drift on hero accent, `animate-fade-in` for toasts

## Constraints

- No purple, no blue, no full-page gradients — depth comes from paper layers
- Prices/specs always in Geist Mono with tabular numerals
- Out-of-stock cards desaturate and disable add-to-cart

## Signature Detail

The **ledger spec block**: every bean card ends in a monospace spec strip (roast · origin · weight · price) that reads like a roasting log entry.
