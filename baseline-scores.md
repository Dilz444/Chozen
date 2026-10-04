# Baseline: the Wix site as it stands (4 Oct 2026)

Blunt, for Dilz. Beyzan won't read this. It's the line the new build has to beat on every row.

**How much of this is seen.** The live site is blocked from the build environment (`open-questions.md` A1), so
nothing here comes from looking at her pages. Each score rests on one of three kinds of evidence, and the row
says which:

- **Fact:** from the brief or a check that worked here (web search, the market research).
- **Inference:** follows from a fact (placeholder products mean there are no product photos to judge).
- **Unseen:** needs the capture. Where a fact still caps the score, it gets a ceiling ("≤ 4") instead of a number.

Re-score every row from `capture/` the day it runs. `npm run capture` fills the Lighthouse, alt-text, H1,
schema and indexability columns automatically.

## Scores

| # | Area | Score | Evidence | What the capture confirms |
|---|---|---|---|---|
| 1 | Visual design | **unseen** | She built it over a year and likes it; the brief calls it "her style". On desktop it may be good. | Palette, type, spacing, hierarchy, consistency from screenshots |
| 2 | Mobile | **2** | **Fact:** "desktop-only (mobile never done)". Wix serves an auto-generated mobile layout from the desktop design unless someone works on it, which typically means misordered stacks, tiny or overlapping text and full-width images cropped badly. A florist sells mostly to phones. | iPhone 14 screenshots, horizontal-scroll flag, tap targets, Lighthouse mobile |
| 3 | Product photography | **1** | **Inference:** the products are placeholders ("Flower 2" £100, "Bouquet 1" £80), so there are no photos of things she actually sells. Whatever images sit on those products are stand-ins. | `images.json`: sizes, originals, whether stock |
| 4 | Copy (brand pages) | **unseen** | There's a lot of it (crystal library, guides, About, FAQs, blog). Quality, voice and duplication unknown. | `copy.md` per page through the copy lint |
| 5 | Product descriptions | **1** | **Fact:** the products are placeholders. Nothing to describe what arrives, its size, stems or care. | — |
| 6 | Trust | **2** | **Facts:** a hotmail address as the business email; no reviews anywhere we could find; no visible business identity found (the brand search returns a Cincinnati clothes shop, research/keywords.md); "Claims Payment" in the main menu reads like an insurance or debt-recovery flow and would worry a first-time buyer; placeholder products and £100 "Flower 2" signal an unfinished shop. **For:** a founder story with a real, specific origin (jasmine crowns in Cyprus), a phone number and live social accounts. | About, contact, policies, footer: address and legal name present? |
| 7 | Structure and navigation | **3** | **Facts:** seven product lines plus subscription, monthly hire and a buy-back programme; a crystal taxonomy by colour, by intention, by formation, plus astrology pairing; guides; a blog; "Claims Payment" in the main nav; stray `/blank`, `/blank-3`, `/instagram-bio`. It's trying to be a florist, a balloon shop, a crystal shop, a jeweller and a content site at once, with no front door. | Nav labels, depth, orphan pages, link graph |
| 8 | SEO technical | **≤ 4** | **Facts:** the site is live and indexable but the web-search tool here (Bing/Brave-backed) returned **no pages at all** for `site:chozenboutique.co.uk`; draft pages (`/blank`, `/blank-3`) are live; placeholder product URLs are probably in the store sitemap. Wix itself server-renders and makes sitemaps, so the floor is decent. | Sitemaps, robots, canonicals, noindex, status codes, schema, Google `site:` count |
| 9 | SEO content | **≤ 3** | **Inference:** volume aimed at the wrong target. Most of the content is crystal and astrology information, which is the cluster a new shop is **least** likely to win (Crystal Vaults, Gem Rock Auctions and long-established UK shops own it, and AI Overviews take the clicks), and it's the content most exposed to ASA problems. The winnable intent (same-day flowers and balloons in named North London areas) has, as far as the brief shows, no dedicated pages. Three crystal taxonomies (colour, intention, formation) are likely thin near-duplicates. | Word counts, duplication, H1/H2 intent, claims scan |
| 10 | Speed | **unseen** (expect 3–5) | Wix storefronts commonly score in the 20s–50s on Lighthouse mobile because of their JavaScript runtime. Not measured here. | Lighthouse mobile/desktop for every URL |
| 11 | Accessibility | **unseen** | — | Lighthouse a11y, missing alts, contrast from tokens |
| 12 | Path from landing to paid order | **1** | **Facts:** nothing real to buy (placeholder names and prices); no evidence of a delivery-date or cut-off step for same-day orders; "Claims Payment" muddies where you pay. A customer can't currently send real flowers to anyone. | Click-through of a test basket (no payment) |
| 13 | Legal compliance | **≤ 3** | **Facts and inference:** a hotmail address and, as far as we know, no geographic address or legal name (E-Commerce Regs 2002 reg 6); crystal pages sorted "by intention" almost always imply effects (calm, protection, healing), which the ASA has ruled against (research/legal.md §5); a "buy-back programme" is a contractual promise whose terms we haven't seen; returns, delivery and cookie pages exist but are unseen, and the fresh-flower perishables exemption, 14-day cancellation for keepsakes and DMCC delivery-fee rules are easy to get wrong. | Claims scan on every crystal page, policy pages, cookie banner, footer |
| | **Overall** | **2 / 10** | Not a shop yet. A personal, well-meant site with a lot of words, no real products, no mobile layout, no visible business identity and no route to buying flowers today. The good news: nothing is indexed or ranking, so there's no traffic to lose and the redirect job is small. | |

## The three biggest problems

1. **There's nothing to buy.** Placeholder products and prices, no product photos, no delivery date or cut-off step.
   Every other score is academic until real products exist. This is why `products/products-template.xlsx` is the first thing she fills in.
2. **No phone layout, for a business whose customers are on phones.** Same-day flower orders are urgent, local and
   mobile ("flowers delivered today Enfield" at 9am). The site is desktop-only.
3. **No front door.** Seven lines, three side services and a crystal encyclopaedia compete for the same menu, while
   the one cluster she can win quickly (same-day flowers and balloons in named North London areas) has no page of its
   own. Trust signals that a stranger needs before paying (real address, legal name, domain email, reviews) are missing.

## What the new build must beat (targets)

| Area | Baseline | Target |
|---|---|---|
| Mobile | 2 | 9: designed at 375–430 first, no horizontal scroll, 16px inputs, 44px targets, safe areas |
| Speed | unseen | Lighthouse mobile ≥ 90 performance on home, collection, product (Shopify limits allowing) |
| Accessibility | unseen | ≥ 100 Lighthouse a11y on every template, AA contrast from tokens |
| SEO technical | ≤ 4 | 9: one canonical host, clean sitemap, no drafts live, schema validated, 301s for every indexed URL |
| SEO content | ≤ 3 | 8: a page per winnable query, answer-first, no duplicates, crystal content compliant |
| Trust | 2 | 8 at launch, 9 once reviews arrive: address, legal name, domain email, policies, real photos, review flow |
| Path to order | 1 | 9: two taps from home to a product, delivery date and cut-off before payment, card message, Apple Pay |
| Legal | ≤ 3 | 9: every item in `content/legal/checklist.md` met or flagged to a professional |
| Product photography | 1 | 8: one consistent square hero per product per `products/photo-guide.md` |
