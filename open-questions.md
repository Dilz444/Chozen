# Open questions

For Dilz (the builder) and, through him, Beyzan (the client). Nothing here blocks the build. Each item
shows the default the build uses until it's answered, and where that default lives so it's a one-line change.

Ordered by how much they hold back the shop.

---

## A. Blockers I can't clear from here

### A1. The live Wix site is unreachable from the build environment — capture not done
The cloud environment blocks `www.chozenboutique.co.uk`, `static.wixstatic.com`, Google, archive.org,
Instagram, TikTok and Facebook (proxy 403 on every request). So **her palette, fonts, logo, photos and copy
have not been seen**. Every document that depends on them is tagged **[pending capture]**.
- **What you do (pick one):**
  1. On your laptop: `npm install && npm run capture`, then commit and push `capture/` (steps in `capture/README.md`). About 10 minutes of your time.
  2. Or allow the hosts in the cloud environment: environment menu → Edit → Network access → Custom → add
     `chozenboutique.co.uk`, `*.chozenboutique.co.uk`, `*.wixstatic.com`, `*.parastorage.com`, `*.wix.com`
     (https://code.claude.com/docs/en/cloud-environments#network-access). A new session then runs the capture.
- **Also by hand:** the Google `site:` check and the Wix SEO "Site inspection" export (Google blocks scripts). Paste into `capture/indexed.md`.
- **Default meanwhile:** a provisional palette and type pairing in `theme/assets/tokens.css` (one file), placeholder
  copy written from your brief, and the 301 map built from Wix's standard URL patterns.

### A2. The Shopify store doesn't exist yet
I can't create accounts. The theme is built offline against a local preview that renders the real Liquid files
(`npm run preview`). See `build-plan.md` §"Create the store" for the exact steps. Once the store exists, `shopify theme dev`
gives a live preview link for your phone.

---

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
