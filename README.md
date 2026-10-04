# ChoZen Boutique: Wix → Shopify rebuild

Florist and gift boutique in Enfield, North London (Beyzan's business). Rebuilt on Shopify with a custom theme in
her style, built by Dilz. Status and the plain-English summary: `summary.md`.

## Start here

| If you want… | Open |
|---|---|
| The plain-English summary (scores, problems, focus, what's needed) | `summary.md` |
| What we still need from Beyzan and Dilz | `open-questions.md` |
| The homepage mockup | `mockup/index.html` (screenshots in `mockup/shots/`, before/after `mockup/before-after.png`) |
| The theme | `theme/` (Shopify Online Store 2.0) |
| See the theme locally | `npm install && npm run preview` → http://127.0.0.1:4380 (`-- --host 0.0.0.0` to open it on a phone on the same Wi-Fi) |
| Run the quality gate | `npm run gate` (preview mode) · `npm run gate -- --launch` (must pass before launch) |
| Capture the Wix site (the "before") | `capture/README.md` → `npm run capture` |
| Her product sheet and photo guide | `products/products-template.xlsx`, `products/photo-guide.pdf` |
| Her one-page shop guide | `handover/guide.pdf` |
| Launch steps (dry run) | `launch.md` |

## Phase 1 documents

`baseline-scores.md` · `focus.md` · `target-queries.md` (+ `research/`) · `build-plan.md` · `fixes.md` ·
`design-tokens.md` · `copy-voice.md` · `content/` (every page, collection, guide and policy; `content/schema-plan.md`) ·
`compliance/crystals.md` · `growth.md` · `redirects/` (301 map)

## Tools

| Command | What it does |
|---|---|
| `npm run capture` | crawls the live Wix site: screenshots (iPhone 14 + desktop), HTML, copy, images, meta, schema, Lighthouse |
| `npm run preview` | renders `theme/` locally with LiquidJS, the content in `content/` and clearly tagged sample products |
| `npm run export` | static export of every route to `preview-dist/` |
| `npm run gate` | the quality gate on the served preview: copy lint + banned AI tells, no health claims, placeholders, headings, ledes, meta, schema, links, images, area-page duplication, tokens, theme-check, mobile at three iPhone sizes, axe, reduced motion, cut-off clock tests, postcode checker, Lighthouse, homepage freeze |
| `npx shopify theme check --path theme` | Shopify's own linter (0 offences at the time of writing) |
| `node tools/redirects/build.mjs` | rebuilds `redirects/wix-to-shopify.csv` from the capture |
| `node tools/import/push.mjs` | dry run of pushing pages, collections, guides, policies, menus and redirects into the store (`--apply` with `SHOPIFY_STORE` and `SHOPIFY_ADMIN_TOKEN` set in the environment; never commit a token) |
| `python3 tools/import/products_to_csv.py products/products-template.xlsx > products/shopify-products.csv` | her filled-in sheet → Shopify product import (as drafts) |
| `node mockup/shoot.mjs`, `node mockup/before-after.mjs` | mockup screenshots and the before/after image |

Credentials never go in this repo: Shopify tokens live in environment variables only, and `.env*` is git-ignored.
