# Build plan: ChoZen Boutique on Shopify

Platform decided: Shopify, custom theme in her style. Sources: `research/shopify-platform.md` (plans, apps,
delivery, redirects, all cited), `research/legal.md`, `focus.md`, `content/README.md` (site map).

---

## 1. Plan and running costs

**Shopify Basic, billed annually: £19/month (£228/year) + 2% + 25p per online card payment.** Basic includes native
local delivery, two staff accounts, unlimited collaborator access for Dilz, gift cards, discounts, POS Lite and the
free Shopify Subscriptions app. Grow (£49/month annual) only pays back above roughly £120k a year of online sales.
Start on monthly billing (£25) for the first month or two if she wants to be able to stop, then switch to annual.

| Item | Cheapest sensible | Recommended |
|---|---|---|
| Shopify Basic (annual) | £228 | £228 |
| Delivery-date app | Bird Essential ≈ £90/yr | **Zapiet Essential ≈ £270/yr** |
| Reviews | Judge.me Free £0 | Judge.me Free £0 (Awesome at 50+ reviews, ≈ £135/yr) |
| Domain email | Zoho Mail Lite ≈ £10–12/yr | **Google Workspace Business Starter £70.80/yr** |
| Domain renewal (.co.uk) | ≈ £10 | ≈ £10–15 |
| ICO data protection fee | £52 | £52 |
| Free apps: Subscriptions, Shopify Email, Inbox, Search & Discovery, Google & YouTube, Pinterest, Forms, EasyRoutes Free | £0 | £0 |
| **First year** | **≈ £390** | **≈ £630** |

Prices exclude VAT (add 20% if she isn't VAT-registered). App prices are in USD at ≈ $1 = £0.75. Check every price
in the admin before installing.

## 2. Create the store (exact steps for Dilz and Beyzan)

I can't create accounts (brief rule). This is the order that keeps everything in her name and lets Dilz build.

1. **Beyzan** goes to shopify.com/uk → Start free trial, signs up with **her** email (the new domain email once it
   exists; the hotmail is fine to start and can be changed later). Store name: `ChoZen Boutique`. She chooses
   "I'm selling online and in person: just online", country United Kingdom, currency GBP.
2. She does **not** pick a plan yet (the trial runs first) and does **not** connect the domain.
3. Settings → Users and permissions → **Collaborators**: leave "Anyone can send a request" on. Dilz sends a
   collaborator request from his Partner account (free at partners.shopify.com, or the Dev Dashboard) with
   permissions: Themes, Products, Pages and blogs, Navigation, Settings, Apps, Markets, Customers (read). She approves it.
   - If Dilz would rather build first and hand over later: create a free dev store from the Dev Dashboard, build
     there, then transfer ownership to her (the store then needs a paid plan). Either works; the collaborator route
     keeps her products and settings in one store from day one.
4. Settings → Store details: legal business name, address, phone, sender email (`hello@chozenboutique.co.uk` once Google Workspace is set up).
5. Online Store → Preferences → **password protection stays ON** until launch day.
6. Dilz, on his laptop: `npm i -g @shopify/cli@latest` (needs Node 22.12+), then in this repo:
   `shopify theme dev --store chozen-boutique.myshopify.com --path theme` → opens a local preview and prints a
   **shareable preview link** (works on a phone). `shopify theme push --unpublished --path theme` uploads it as a draft theme.
7. Theme preview on a phone: Online Store → Themes → (the ChoZen theme) → ⋯ → **Share preview** → copy link →
   open on the phone. Works while the store is password-protected.

## 3. Theme architecture

Online Store 2.0, JSON templates, section groups, app blocks. No page builder, no jQuery, no theme framework
dependency. Built mobile-first from `mockup/` and `design-tokens.md`. Lives in `theme/`.

```
theme/
  layout/theme.liquid            head, skip link, header group, main, footer group, JSON-LD (Organization/WebSite on home)
  layout/password.liquid
  config/settings_schema.json    colours (from tokens), fonts (Shopify font library), cut-off hour, delivery days, zones, announcement text
  config/settings_data.json
  locales/en.default.json        every UI string in UK English
  sections/
    header-group.json            announcement bar + header
    footer-group.json            footer + legal line
    announcement.liquid          cut-off aware ("order in the next 2h 14m" only when true)
    header.liquid                logo, nav, search, basket; mobile drawer
    footer.liquid                NAP, menus, social, legal block, Dealer's Notice link
    hero.liquid                  H1, lede, CTAs, postcode checker, image
    promise-strip.liquid
    occasion-chips.liquid
    product-rail.liquid          a collection's products as cards
    feature.liquid               image + text (balloon pairing)
    tiles.liquid                 gifts that last row
    story.liquid                 the florist
    steps.liquid                 how same-day works
    areas.liquid                 delivery areas list (from settings)
    faq.liquid                   visible Q&A + FAQPage JSON-LD from the same blocks
    newsletter.liquid
    main-collection.liquid       filters (Search & Discovery), sort, grid, intro, Q&A below
    main-product.liquid          gallery, price, delivery-type aware form (date app block, card message, cut-off note), what's in it, size, care, warnings
    main-page.liquid, main-area.liquid, main-delivery.liquid, main-contact.liquid, main-hire.liquid, main-faq.liquid, main-about.liquid
    main-blog.liquid, main-article.liquid (guide layout: lede, contents, related products)
    main-cart.liquid             local-only notice for mixed baskets, card-message reminder, delivery-date app block
    main-search.liquid, main-404.liquid, main-list-collections.liquid
  snippets/
    product-card, price, image (responsive image_url/image_tag), icon-sprite, breadcrumbs (+ BreadcrumbList JSON-LD),
    schema-florist (LocalBusiness/Florist), schema-product (Product + Offer, no ratings until real), schema-article,
    cutoff (server-rendered fallback text; JS updates it), postcode-check, placeholder-art (line drawings until photos exist),
    card-message (line item property), warnings (lilies, latex, foil, crystal disclaimer, hallmark)
  templates/
    index.json, collection.json, collection.occasion.json, collection.sympathy.json,
    product.json (keepsakes, UK shipping), product.fresh.json (local same-day), product.balloon.json,
    page.json, page.about.json, page.contact.json, page.delivery.json, page.area.json, page.hire.json, page.faq.json,
    blog.json, blog.guides.json, article.json, article.guide.json,
    cart.json, search.json, 404.json, list-collections.json, password.json, gift_card.liquid
  assets/
    tokens.css (the only raw colours), base.css, sections css split per section (loaded only where used),
    theme.js (≤ 10 kB: drawer, cut-off, postcode, sticky bar), fonts via Shopify font library
```

**Product data (metafields)**, so templates stay generic and the gate can check them:
`custom.line` (fresh / balloon / faux / crystal / jewellery / other), `custom.whats_in_it`, `custom.size`,
`custom.materials`, `custom.treatment`, `custom.care`, `custom.contains_lilies` (bool), `custom.latex` (bool),
`custom.foil` (bool), `custom.personalised` (bool), `custom.occasions` (list), `custom.crystal_meaning` (rich text,
compliance-linted), `custom.colour` (for filters), `custom.formation`. Product tag `local-only` on every fresh and
balloon product.

**Performance rules:** one CSS file per section, critical CSS inline in `theme.liquid` for the header and hero, no
render-blocking JS, `image_url` + `image_tag` with widths 180–1600 and `sizes`, `loading="lazy"` below the fold,
`fetchpriority="high"` on the hero only, fonts from Shopify's CDN with `font-display: swap` and two weights each.
Apps load only on templates that use them (app blocks, not global embeds, where the app allows).

## 4. Same-day delivery: how it works

**The rule:** fresh flowers and balloons are hand-delivered the same day in North London when ordered by 10am on
a delivery day. Everything else ships UK-wide. All zones, days and fees are placeholders until she confirms (B3–B7).

| Piece | How | Who maintains it |
|---|---|---|
| Zones and fees | Shopify **Local delivery** at her location, by postcode prefix: `EN1*, EN2*, EN3*, N9*, N13*, N14*, N18*, N21*` [to confirm], one zone per fee band (e.g. EN1–EN2 £[FEE]; outer £[FEE]), optional "free over £[X]" rule | Beyzan, in Settings → Shipping and delivery |
| Delivery date + cut-off | **Zapiet Essential** (or Bird/Stellar): date picker as an app block on `product.fresh` and the cart; same-day disabled after 10:00 Europe/London; blackout dates (Sundays, bank holidays, her holidays); express checkout buttons locked until a date is chosen; dynamic checkout buttons off on fresh templates | Beyzan pauses same-day here (handover guide) |
| Honest cut-off messaging | The theme reads the cut-off hour and delivery days from **theme settings** (same values as the app) and renders the true state server-side; JS refreshes the countdown. After the cut-off it says "Order now for tomorrow", never a fake timer | Theme settings |
| Pause same-day | One theme setting "Same-day delivery paused" (hides the countdown, shows her message, e.g. "Back on Tuesday") + blackout date in the app | Beyzan (handover guide, 3 taps) |
| Mixed baskets | Shipping profiles: **"Fresh – local only"** (fresh + balloons: local delivery only) and **General** (keepsakes: UK shipping + the same local zones at the same prices). A mixed basket going to a local postcode checks out as one delivery; to a UK address it would fail, so the **cart** shows a notice when it contains a `local-only` item ("Fresh flowers are hand-delivered in North London only. Sending a keepsake further away? Order it separately.") | Theme |
| UK shipping | Royal Mail Tracked 48 / Tracked 24 flat rates by weight [to confirm], or Shopify Shipping labels | Beyzan |
| Card message | `properties[Card message]` textarea (max 200 chars, counter) on fresh and balloon products, printed on the packing slip and order email (templates edited at launch) | Theme + notification templates |
| Postcode checker | Theme snippet with the same prefix list as the zones (from settings) | Theme settings |
| Driver | She delivers; EasyRoutes Free (50 orders/month) for routing when needed | Optional |

## 5. Apps (install at launch, in this order)

| App | Cost | Why |
|---|---|---|
| Zapiet – Pickup + Delivery (Essential) | ≈ $29.99/month | date picker, cut-off, blackout dates, postcode rates, express-checkout lock. Fallback: Bird ($9.99) or Stellar ($14.99). Test it in the custom theme before buying (14-day trial) |
| Judge.me Product Reviews | Free | review requests after every order, photo reviews, no gating |
| Google & YouTube | Free | Merchant Center free listings |
| Pinterest | Free | catalogue sync, product (rich) pins, tag |
| Shopify Email | Free to 10k/month | newsletter + abandoned checkout (free, unmetered) |
| Shopify Inbox | Free | chat on phone |
| Search & Discovery | Free | filters (colour, occasion, formation), synonyms |
| Shopify Forms | Free | floral hire enquiry, newsletter |
| Shopify Subscriptions | Free | when the subscription launches (after January 2027 rules are known) |
| IndexNow (any free app) | Free | Bing pings on publish |
| Cookie banner | Free (Shopify's built-in Customer Privacy banner) | UK consent, equal Accept/Reject |

Not needed: page builders, SEO "booster" apps, popups, countdown apps, translation.

## 6. The port from Wix

Blocked on the capture (A1). Everything below runs from `capture/` once it exists.

| What | How | Where it lands |
|---|---|---|
| Pages | `capture/pages/*/copy.md` → rewrite per `copy-voice.md` into `content/pages/*.md` (the new files already exist as drafts; her facts and phrases get merged in) | Shopify pages |
| Blog posts (`/post/*`) | copy.md → `content/journal/*.md`, rewritten, crystal claims fixed | `/blogs/journal/*` |
| Crystal library and taxonomies | consolidated into `content/guides/crystal-meanings.md` + 12 hero crystal pages; claims logged in `compliance/crystal-claims-log.md` | `/blogs/guides/*` |
| Guides (anniversary, card messages, gifting) | merged into the new guides | `/blogs/guides/*` |
| Products | placeholders are **not** ported. Real products come from `products/products-template.xlsx` | Shopify products (CSV import, `tools/import/`) |
| Images | `capture/images/` originals → renamed `line-subject-detail-n.jpg`, alt text from `content/`, sized ≥ 2048px long edge where the original allows, under 400 kB as uploaded (Shopify serves WebP/AVIF itself) | Shopify Files / products |
| Logo | original vector if she has one; otherwise the largest capture | theme settings |
| Redirects | `redirects/wix-to-shopify.csv` (see §7) | Online Store → Navigation → URL redirects → Import |

## 7. 301 map

`redirects/wix-to-shopify.csv` holds the rules for Wix's standard URL patterns and every URL we know of
from the brief. `node tools/redirects/build.mjs` regenerates it from `capture/sitemaps.json` +
`capture/indexed.md` once the capture runs, so every sitemap URL and every Google-indexed URL has a row. Rules:

- One hop, straight to the final URL. No chains. Shopify only redirects paths that 404, so nothing live is shadowed.
- Placeholder products (`/product-page/flower-2` etc.) → the closest real collection (`/collections/same-day-flowers`), not the homepage.
- `/blank`, `/blank-3` → `/` (drafts). `/instagram-bio` → `/` with nothing lost (if Instagram links to it, update the bio link at launch).
- Crystal taxonomy pages (`/crystals-by-colour` etc.) → the matching guide.
- Wix blog categories (`/blog/categories/x`) → `/blogs/journal/tagged/x`; Wix blog home `/blog` → `/blogs/journal`.
- "Claims Payment" page → `/pages/contact` until B18 is answered.

## 8. What she supplies (in this order)

1. **Products** in `products/products-template.xlsx`: name, line, price, her description, what's in it, size, delivery type. Start with 8–12 fresh and balloon products; the rest can follow.
2. **Photos** per `products/photo-guide.pdf`: one square hero per product, plus a portrait of her and three or four photos of past deliveries.
3. **Business facts** (the "Delivery & business facts" sheet in the same file): address, legal name, sole trader or Ltd, VAT, delivery postcodes, fees, days, cut-off, hours, UK shipping service and price.
4. **Her story** in her own words: a voice note is fine. When she started, why flowers, the jasmine crowns.
5. **Answers** to `open-questions.md` B11–B20 (buy-back, sourcing, jewellery metals, "Claims Payment", the /blank pages).
6. **Logins she keeps**: Shopify owner, domain registrar, Google account for Business Profile and Search Console.

## 9. What Dilz sets up for her

Shopify account steps above, Partner/collaborator access, the theme, products import, apps, Google Workspace
domain email (`hello@`), Search Console and Bing Webmaster Tools, Google Business Profile (with her verifying),
Merchant Center via the app, Pinterest business account, Judge.me, the redirects, DNS at launch (`launch.md`),
and an ICO registration reminder. He never needs her passwords: collaborator access and Google account delegation cover it.
