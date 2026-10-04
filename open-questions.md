# Open questions

For Dilz (the builder) and, through him, Beyzan (the client). Nothing here blocks the build. Each item
shows the default the build uses until it's answered, and where that default lives so it's a one-line change.

Ordered by how much they hold back the shop.

---

## A. Blockers I can't clear from here

### A1. The live site, Wix's image server and the Wix API are unreachable from here (re-checked after Dilz's latest message)
Still HTTP 403 from the environment's egress proxy for `www.chozenboutique.co.uk`, `static.wixstatic.com` and
`www.wixapis.com`. Until that changes there is **no capture, no screenshot of her site, no reading of her copy,
captions or palette, and no API writes**. Nothing has been screenshotted from the live site so far: the only
screenshots in this repo are of mockups and the (now parked) Shopify theme.
- **Fix:** environment menu (session title bar) → Edit → Network access → Custom → Allowed domains: add
  `chozenboutique.co.uk`, `*.chozenboutique.co.uk`, `*.wixstatic.com`, `*.parastorage.com`, `*.wix.com`,
  `*.wixapis.com`, `www.instagram.com`, `*.cdninstagram.com`; keep the default package-manager list. Save. If this session still gets 403s afterwards, start a
  new session on this repo. Docs: https://code.claude.com/docs/en/cloud-environments#network-access
- **Or** run `npm install && npx playwright install chromium && npm run capture` on a laptop and push `capture/`.

### A2. `reference-home.png` isn't in the repo
Not in the working tree or on `origin/main` (checked after Dilz's message). Commit it to the repo root and push, and
the capture check compares against it.

### A3. No Wix API key
No `.env` exists, and `www.wixapis.com` is blocked anyway. When both are fixed: create `.env` locally with
`WIX_API_KEY=…` and `WIX_SITE_ID=…` (git-ignored; never commit, paste or screenshot it). Make the key in Wix → Settings →
API Keys with only the Stores, Blog and SEO permissions needed.

### A4. Platform: staying on Wix (Dilz, latest message)
The Shopify plan is parked: nothing deleted, nothing more built on it. See `STATUS.md` for what carries over.

### A5. "I" or "we" in her copy?
The voice samples use "I" (Beyzan). If anyone else makes or delivers the flowers, it becomes "we" where true.

## B. Business facts I must not invent (the build shows a visible placeholder until answered)

| # | Question | Why it matters | Default in the build |
|---|---|---|---|
| B1 | Is there a shop or studio customers can visit, or is it home-based? Exact address? | Google Business Profile type (storefront vs service-area), LocalBusiness schema, the legal "geographic address" requirement (a PO box isn't allowed) | Service-area business, address hidden on Google, full address in the footer as `[ADDRESS]` |
| B2 | Sole trader or limited company? Company number? VAT registered? | Footer legal line, terms, invoices | `[TRADING NAME] is run by [LEGAL NAME]` placeholder |
| B3 | Exact same-day delivery area: which postcodes or towns? | Delivery zones, area pages, schema `areaServed`. **Not invented.** | The brief says "North London". Zones are drafted as EN1–EN3 / N9 N13 N14 N18 N21 and marked **[to confirm]** in `delivery/zones.json` |
| B4 | Delivery fee per zone, and is there a minimum order? | Drip-pricing rules: the fee must show before checkout | `£[FEE]` placeholder |
| B5 | Delivery days. Sundays? Bank holidays? | Cut-off messaging must be true | Mon–Sat, no Sunday, marked [to confirm] |
| B6 | Is 10am the cut-off she wants? Competitors take same-day orders until 2pm–6pm (see `research/keywords.md`). Could she do noon or 1pm? | Biggest conversion lever in the local cluster | 10am, as the brief says. One setting in the theme |
| B7 | Delivery time window (e.g. 10am–6pm)? Can a customer pick AM/PM? | Product page and FAQ copy | "During the day" placeholder |
| B8 | Which balloons: latex, foil, bubble? Helium-filled on delivery? How long do they float? | Product copy, safety notes (latex: under-8s warning) | Generic wording + safety notes |
| B9 | Subscription: what is it exactly (fresh flowers weekly/fortnightly/monthly, local only?), price | Subscription page and app choice | Page built, price `£[PRICE]` |
| B10 | Floral hire: faux or fresh? Who for (offices, restaurants, events)? Monthly price? Contract length? | Hire page copy and the B2B cluster | Enquiry form only, no prices |
| B11 | Buy-back programme: what is bought back (crystals? faux arrangements?), on what terms? | It's an unusual promise; legally it's a contract term | Page kept, demoted to the footer, copy marked [to confirm] |
| B12 | Crystal sourcing: suppliers, countries, any certification? What does the "ethical sourcing" page claim and can she evidence it? | Unevidenced ethical claims are an ASA/CMA "greenwashing" risk | Page kept, claims reduced to what she can show |
| B13 | Jewellery: metals (925 silver? plated? gold-filled?), stone treatments (dyed, heated, reconstituted) | Hallmarking Act, honest descriptions | Product template has fields for both |
| B14 | Opening hours (for Google and schema) | GBP, LocalBusiness `openingHoursSpecification` | `[HOURS]` |
| B15 | Is the business email moving to a domain address (hello@chozenboutique.co.uk)? | Trust; see `growth.md` | Footer shows `hello@chozenboutique.co.uk` marked [to set up], hotmail kept until it works |
| B16 | Does she have any reviews already (Google, Facebook, Etsy, word of mouth with permission)? | Trust block. **Reviews are never invented** (DMCC Act 2024) | No reviews shown until real ones exist |
| B17 | Photos: does she have real photos of past arrangements, balloon sets and deliveries (her phone, Instagram)? | Product and hero imagery is the biggest visual upgrade | Botanical line-drawing placeholders, each labelled |
| B18 | "Claims Payment" in the Wix main nav: what is it? (A payment link for custom orders? A Wix "Pay" page?) | Navigation clean-up | Removed from nav; if it's a custom-order payment link, it becomes "Pay for a custom order" in the footer |
| B19 | `/blank`, `/blank-3`, `/instagram-bio`: drafts, or used anywhere (e.g. the Instagram link-in-bio)? | If Instagram links to `/instagram-bio`, it must redirect, not 404 | `/instagram-bio` → home with UTM; `/blank*` → home. Confirm after capture |
| B20 | Is the Wix store taking real orders or payments now? Any customer accounts, subscribers, newsletter list? | Data migration and GDPR | Assume none; export anything that exists before cancelling Wix |

---

## C. Decisions for Dilz

| # | Decision | My recommendation | Where |
|---|---|---|---|
| C1 | Which lines lead on the homepage | Fresh flowers + balloons (local, same day) lead; faux and crystals are the "sent UK-wide" second row; jewellery folds into "Crystals & jewellery"; hire, subscription and buy-back go to the footer and one homepage line | `focus.md` |
| C2 | Shopify plan | Basic, monthly to start | `build-plan.md` |
| C3 | Delivery-date app | See `build-plan.md` §Apps (the free native Local Delivery cannot show a date picker or cut-off on its own) | `build-plan.md` |
| C4 | Brand name in titles | "ChoZen Boutique, Enfield" in the homepage title, because "ChoZen Boutique" alone returns a Cincinnati clothes shop | `content/pages.md` |
| C5 | Crystal positioning | "Crystal gift meanings" rather than "healing crystals": compliant, and it suits the gifting model | `compliance/crystals.md` |
| C6 | Domain: keep `www.chozenboutique.co.uk` as the canonical host | Yes, keep `www.` (matches what Google may already hold) | `launch.md` |
