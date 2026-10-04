# Design tokens: ChoZen Boutique

> **[pending capture] — read this first.** The brief says "her style, executed better, is the brief for every
> design decision". Her style has **not been seen**: the Wix site is blocked from the build environment
> (`open-questions.md` A1). The palette and fonts below are a **provisional stand-in**, chosen to suit a
> florist and crystal boutique. They are **not her palette**. They live in one file (`theme/assets/tokens.css`,
> mirrored in `mockup/tokens.css`), so the measured values replace them in a single edit once
> `npm run capture` has run. The method for doing that is at the bottom of this file.

## What to measure from her site (the capture writes `capture/pages/home/tokens-*.json`)

| Token | Read from | Rule for the new build |
|---|---|---|
| Background | top `bg` colour by painted area | Keep her exact hue. If it is pure white, warm it 1–2% toward her accent so photos don't sit on clinical white |
| Text | top `text` colour | Keep, unless contrast on the background is under 7:1, then darken along the same hue |
| Accent (buttons, links) | most-used saturated colour on `a`, `button` | Keep the hue. Adjust lightness until white text on it is ≥ 4.5:1 (WCAG AA) |
| Secondary tint | second most-used soft background | Section bands and cards |
| Display font | font on `h1`/`h2` | Keep the family. If it's a Wix-only font, use the nearest in Shopify's font library (no external font requests) |
| Body font | font on `p` | Keep the family, set at 16px+ on mobile, line-height 1.55 |
| Logo | `header img` / `img[alt*=logo]` | Use her file as is. Ask for the original vector if only a small PNG exists (B17) |
| Image treatment | screenshots + `images.json` | Note crop ratios, borders, rounded corners, overlays, filters. Keep what's deliberate, drop what's Wix default |

## Provisional set (in use now)

### Palette

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--paper` | `#FBF8F4` | page background (warm ivory) | n/a |
| `--paper-2` | `#F4ECE4` | alternate bands, card backs | n/a |
| `--blush` | `#EED9D6` | soft tint, photo placeholders, chips | decorative |
| `--ink` | `#2A2225` | headings, body text | 15.6:1 on paper |
| `--ink-2` | `#62565A` | secondary text, captions | 6.9:1 on paper |
| `--rose` | `#94495D` | primary buttons, links, focus | 6.4:1 white on rose, 6.0:1 rose on paper |
| `--rose-deep` | `#7A3A4C` | button hover/pressed | 8.5:1 white on it |
| `--sage` | `#5D6B53` | secondary accent, delivery and success states (text-safe) | 5.7:1 on paper |
| `--sage-soft` | `#DCE3D3` | success backgrounds, "we deliver" tint | decorative |
| `--gold` | `#B39368` | hairlines and the logo mark only. Never text | decorative |
| `--line` | `#E6DCD3` | hairlines, input borders on paper (input border uses `--ink-2` for 3:1) | |

### Type

| Role | Family | Size mobile / desktop | Weight | Notes |
|---|---|---|---|---|
| Display (H1) | Cormorant Garamond | 38 / 60px, line-height 1.05 | 500 | italic for the one emphasised word in the H1 |
| H2 | Cormorant Garamond | 30 / 42px, 1.1 | 500 | |
| H3, card titles | Jost | 17 / 18px, 1.3 | 500 | |
| Body | Jost | 16 / 17px, 1.55 | 400 | never under 16px on phones |
| Small / labels | Jost | 13px, letter-spacing .08em, uppercase | 500 | eyebrow labels, chips |
| Price | Jost | 16px tabular-nums | 500 | |

Both families are open-licence (OFL) and **self-hosted as theme assets** (`theme/assets/*.woff2`, two weights each, `font-display: swap`, the two main files preloaded). That avoids depending on exact Shopify font-library handles and adds no third-party request.

### Space, shape, motion

- 4px base. Section padding 56px mobile / 96px desktop. Gutter 16px phone, 24px tablet, 40px desktop; container 1240px.
- Radius: 2px on buttons and inputs (crisp, boutique), 0 on photos. No pill buttons except filter chips.
- Hairline borders (`1px --line`) instead of shadows. One shadow only: the sticky order bar.
- Motion: 200ms ease-out fades and 8px rises on reveal. Off entirely under `prefers-reduced-motion`.
- Tap targets ≥ 44×44px. Inputs 16px (no iOS zoom). Safe-area padding on the sticky bar and header.

### Photography treatment (applies to her photos when they arrive)

- One square hero per product on a plain, light, warm backdrop (see `products/photo-guide.md`). Same backdrop, same light, same height for the whole range.
- Natural daylight, no filters, no heavy vignettes. Slight warmth is fine; colour must match what arrives.
- Crops: 1:1 product cards, 4:5 product page gallery, 3:2 or 16:9 bands. No text on photos.
- Until real photos exist: line-drawn botanical placeholders on `--blush`/`--paper-2`, each with a visible "Photo to come" label. Never stock photos passed off as hers.

### Mood (provisional)

Calm, warm and handmade. A small shop where one person chooses every stem: ivory paper, dusty rose, the green
of jasmine leaves, a thread of gold. Editorial serif headlines, clean geometric body text, lots of air.
Nothing glossy, nothing neon, no glitter.

## Swapping in her measured tokens (after the capture)

1. Open `capture/pages/home/tokens-desktop.json`. Take the top background, text and accent colours and the H1/body fonts.
2. Apply the rules in the first table (contrast fixes keep her hue).
3. Edit the `:root` block in `theme/assets/tokens.css` (and `mockup/tokens.css`). Nothing else references raw hex values; the gate fails the build if any other file does (`_gate/checks/tokens.mjs`).
4. If her fonts differ, drop their woff2 files (OFL or licensed for web) into `theme/assets/`, update `theme/snippets/fonts.liquid` and `--font-display`/`--font-body` in `tokens.css`, and note it here.
5. Re-run `npm run gate`. The contrast check recomputes every pairing above and fails anything under AA.
6. Re-shoot the mockup screenshots: `node mockup/shoot.mjs`.
