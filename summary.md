# ChoZen Boutique: where things stand (4 Oct 2026)

Plain English, for Dilz. Phase 1 (capture, assess, plan, prepare) and Phase 2 (build) are both written, with one
big gap: **the live Wix site couldn't be read from the environment this was built in.** The network policy blocks
chozenboutique.co.uk, Wix's image server, Google, Instagram, TikTok and Facebook. So her real palette, fonts, logo,
photos and words haven't been seen yet. Everything that depends on them is built to swap in, and marked.

## Phase 1

### The scores (baseline, Wix as it stands)

**Overall 2 / 10: not a shop yet.** Mobile 2, product photography 1, product descriptions 1, trust 2, structure 3,
path to a paid order 1, SEO technical ≤ 4, SEO content ≤ 3, legal ≤ 3. Visual design, copy, speed and accessibility
are unscored until the capture runs (scoring them unseen would be guessing). Evidence for each line:
`baseline-scores.md`.

### The three biggest problems

1. **There's nothing to buy.** "Flower 2" at £100 and "Bouquet 1" at £80 are placeholders: no real products, photos, sizes or delivery date step.
2. **No phone layout**, for a business whose customers order urgently on phones.
3. **No front door.** Seven lines plus subscription, hire and buy-back share one menu (with "Claims Payment" in it), while the easiest win, same-day flowers and balloons in named North London areas, has no page. A stranger also can't see an address, legal name or business email (hotmail), and there are no reviews.

### The focus recommendation (your hypothesis was right, with three changes)

- **Fresh flowers and balloons, same day in North London, are the front door.** Correct.
- **Lead on "hand-delivered, with balloons", not on speed.** Her 10am cut-off is the earliest we found: the nearest real Enfield florist takes same-day orders to 1pm, Interflora and the keyword-site networks to 3pm, Flower Station to 5–6pm. But nobody in Enfield sells same-day flowers and balloons together online. **Ask her if noon or 1pm is possible**: it's the cheapest conversion gain there is.
- **Faux flowers are the nationwide second line, ahead of crystals.** Crystals face 43p tumblestones and £2.99 Etsy bracelets, mature content competitors and the strictest advertising rules. Keep them as gift-meaning pieces alongside flowers, not as an encyclopaedia.
- Subscription and buy-back move to the footer until their terms exist (new UK subscription rules arrive January 2027). Floral hire gets one page for local businesses. Nothing is deleted.

Detail: `focus.md`, `target-queries.md`, `research/`.

### The homepage mockup

`mockup/chozen-homepage-mockup.html` (one file, opens anywhere), `mockup/shots/` (iPhone SE, 14, Pro Max, desktop).
The palette and fonts are a **provisional stand-in** (ivory, dusty rose, jasmine green, a thread of gold; Cormorant
Garamond and Jost), because hers haven't been seen. They're one file to swap (`design-tokens.md` says how).
Products are labelled "Sample", photos are labelled line drawings, and unconfirmed facts carry a dashed "to confirm" tag.

**The before/after image** is `mockup/before-after.png`. Its "before" half says "capture pending" until you run the
capture; then `node mockup/before-after.mjs` fills it with her real homepage. **Don't show her the mockup until it
uses her colours and fonts**: run the capture first, swap the tokens, re-shoot (about 30 minutes).

## Phase 2

- **The theme** (`theme/`): a full Shopify Online Store 2.0 theme in the mockup's style: home, collections (plus occasion and sympathy versions), products (same-day or UK-shipping behaviour from one tag), area pages, delivery, contact, floral hire, FAQs, guides, journal, cart, search, 404, password, gift card. It includes an honest cut-off countdown that never lies after 10am, a postcode checker, a card message on every fresh product, a "pause same-day" switch, safety notes driven by product data (lilies, latex, foil, crystal disclaimer, hallmarks), and structured data for Florist, Product, FAQ, Article and breadcrumbs. Shopify's own theme check finds 0 problems.
- **The content** (`content/`, 68 files): every page, collection, area page, guide, crystal meaning page and policy, written to `copy-voice.md`, with no health claims and no invented facts. 73 crystal claim → rewrite pairs are ready for her old pages (`compliance/crystals.md`).
- **The quality gate** (`npm run gate`): checks the served preview for banned AI tells and hype, health claims, placeholders, headings, opening answers, meta, schema, broken links, images, copied sentences between area pages, theme check, horizontal scroll, input size and tap targets on three iPhone sizes, accessibility (axe), reduced motion, the cut-off at faked times of day, the postcode checker, Lighthouse, and a freeze on the signed-off homepage. **Current result: 0 failures.** Lighthouse mobile is 98–99 performance and 100 accessibility, best practices and SEO on home, collection, product, area page and guide. These figures are for the theme on the local preview; Shopify adds its own scripts, so re-measure on the store. An independent checker reviewed the served preview: `_gate/verify-report.md`.
- **Hand-over**: `handover/guide.pdf` is one page covering adding a product, changing a price, marking an order done, pausing same-day (with what customers then see) and replying to a review. It has three slots for admin screenshots that can only be taken once the store exists.
- **Launch**: `launch.md` is a dry run only, in order, with a check after every step and an undo plan.
- **Import tools**: her product sheet → Shopify CSV (as drafts), and a one-command push of all pages, guides, policies, menus and redirects once the store exists. Both are tested locally, but not against a real store yet.

## What she needs to supply (products first)

1. **Products** in `products/products-template.xlsx`: start with 8–12 fresh bouquets and balloon sets.
2. **Photos** per `products/photo-guide.pdf`: one square main photo per product, plus one of her and a few past deliveries.
3. **Business facts** (second sheet in the same file): address, legal name, sole trader or Ltd, VAT, delivery postcodes, fees, days, cut-off, hours, UK postage.
4. **Her story** in her own words (a voice note is fine).
5. Answers on "Claims Payment", the buy-back terms, crystal sourcing and jewellery metals (`open-questions.md` section B).

## What you need to set up

1. **Unblock or run the capture**: either run `npm run capture` on your laptop and push it, or allow `chozenboutique.co.uk`, `*.wixstatic.com`, `*.parastorage.com` and `*.wix.com` in this cloud environment's network settings. Also do the Google `site:` check by hand (`capture/README.md`).
2. **The Shopify store**: Beyzan starts the trial in her name, you join as a collaborator (`build-plan.md` §2). Basic plan, about £19 a month on annual billing. First year all-in is about £390–£630 (`build-plan.md` §1).
3. **Domain email**: Google Workspace on chozenboutique.co.uk, to replace the hotmail.
4. Later: Google Business Profile (her verification), Search Console, Bing, Merchant Center, Pinterest, Judge.me, ICO registration (£52). Order and steps: `growth.md` and `launch.md`.

## How to open the theme preview on your phone

- **Now (no store yet):** on your laptop, `npm install && npm run preview -- --host 0.0.0.0`, then open `http://<your laptop's IP>:4380` on your phone on the same Wi-Fi. For the homepage alone, open `mockup/chozen-homepage-mockup.html` from this repo on any phone.
- **Once the store exists:** `npx shopify theme dev --store <store>.myshopify.com --path theme` prints a preview link that works on your phone. Or push it as a draft theme (`npx shopify theme push --unpublished --path theme`), then in the admin go to Online Store → Themes → ⋯ → Share preview, and open the link on your phone.
