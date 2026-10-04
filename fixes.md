# Fixes: what the new build must get right that the Wix site gets wrong

Prioritised by impact on paid orders, then on being found, then on risk. Each line has the check that proves it on
the served preview (`_gate/`). P0 = launch blocker. Rows marked **[pending capture]** are expected from the brief
and get confirmed or dropped when the capture runs.

## P0: a customer can buy real flowers today, on a phone

| # | Fix | Proof |
|---|---|---|
| 1 | Real products with real names, prices, photos and "what's in it", replacing "Flower 2" £100 and "Bouquet 1" £80 | gate `placeholders`: no `[PRICE]`, "Sample", "Flower 2" on any launch page; every product has a hero image and `custom.whats_in_it` |
| 2 | Designed for phones first: no horizontal scroll, 16px inputs, 44×44 tap targets, safe-area insets, reduced motion respected, at iPhone SE, 14 and Pro Max in WebKit and Chromium | gate `mobile` (Playwright at 320/375/390/430) |
| 3 | A delivery date and the 10am cut-off chosen **before** payment, with express checkout locked until it is; honest countdown only before the real cut-off on a real delivery day | gate `cutoff` (fakes the clock: 09:30 Tue shows countdown; 10:01 Tue says tomorrow; Sat 11:00 says Monday) + manual test basket |
| 4 | Card message on every fresh and balloon product, carried to the order, packing slip and emails | test order on the dev store; line item property visible in admin |
| 5 | Postcode check on the homepage and product page, from the same list as the delivery zones | gate `postcode` (EN2 6AB yes; SW1A 1AA no with the UK-wide alternative) |
| 6 | Mixed basket (fresh + keepsake) to a UK address can't dead-end at checkout: the cart warns first | manual test + snippet test |
| 7 | Delivery fee visible before checkout on the product page and the delivery page (DMCC drip pricing) | gate `fees`: product.fresh renders the zone fee line |
| 8 | Two taps from the homepage to a product; three to checkout | gate `paths` (click-through on the served preview) |

## P0: a stranger trusts it enough to pay

| # | Fix | Proof |
|---|---|---|
| 9 | Business identity on every page: trading name, legal name (sole trader's name or Ltd + number), a geographic address (no PO box), phone, domain email; VAT number if registered | gate `legal-footer` |
| 10 | Domain email (`hello@chozenboutique.co.uk`) replaces the hotmail address everywhere public | gate `banned`: no `hotmail.com` in served HTML |
| 11 | "Claims Payment" out of the main nav [B18] | gate `nav` |
| 12 | Policies that are correct and findable: refunds with 14-day cancellation and the perishables exemption, delivery, privacy, cookies, terms, review policy, hallmarking notice | `content/legal/checklist.md` all green |
| 13 | Real photos of her work and of her, in one consistent style; no stock passed off as hers | gate `images`: no file flagged `stock`; every product hero 1:1 and ≥ 1200px |
| 14 | Reviews collected after every order with no gating; no invented reviews and no star schema until real ones exist | gate `schema`: no `aggregateRating` without review data from the app |

## P0: nothing that could get her in trouble

| # | Fix | Proof |
|---|---|---|
| 15 | No health claims on any page, product or meta: crystals and flowers don't heal, treat, cure, relieve, protect or calm | gate `health-claims` over every served page **and** product description; `compliance/crystal-claims-log.md` has a rewrite for every claim found on the Wix site [pending capture] |
| 16 | Crystal disclaimer on every crystal product and guide | gate `crystal-disclaimer` |
| 17 | Jewellery: metal standard and hallmark status stated; plated items never called gold or silver; stone treatments disclosed; Dealer's Notice linked | gate `jewellery` (product metafields required for line = jewellery) |
| 18 | Latex balloon warning (under-8s choking, natural rubber latex) and foil power-line warning on balloon products; lilies-and-cats note on any product containing lilies | gate `warnings` |
| 19 | Cookie banner with equal Accept and Reject; no marketing pixels before consent | manual check in a private window + gate `pixels` (no Meta/TikTok requests before consent) |
| 20 | No fake urgency or scarcity, no pre-ticked marketing box | gate `dark-patterns` |

## P1: found by the right people

| # | Fix | Proof |
|---|---|---|
| 21 | A page for each winnable query (Enfield hub, five area pages, balloon delivery, occasions) with answer-first ledes and question H2s | gate `coverage`: every `target-queries.md` target URL exists and renders |
| 22 | Titles say "Enfield, London" or carry a postcode; unique title and meta per page | gate `meta` (unique, length, place present on local pages) |
| 23 | One H1 per page, the most prominent text, matching the title | gate `headings` |
| 24 | Structured data: Florist (LocalBusiness) with address, hours, `areaServed`; Organization and WebSite on home; Product + Offer; BreadcrumbList; Article on guides; FAQPage mirroring visible Q&A only | gate `schema` (JSON parses, required fields, every value visible on the page) |
| 25 | Draft pages gone: `/blank`, `/blank-3`, placeholder products not live and not in the sitemap | gate `sitemap` + 301 map |
| 26 | Every Wix URL in the sitemap or Google's index redirects once, to its closest new page | `redirects/wix-to-shopify.csv` built from capture; gate `redirects` on launch day |
| 27 | Crystal content consolidated: one meanings hub + a page per hero crystal, taxonomies become filters, no near-duplicates | gate `similarity` (no two pages > 80% similar) |
| 28 | `robots.txt` allows AI and search crawlers; no `nosnippet`; `llms.txt` published | gate `robots` |
| 29 | Same name, address and phone everywhere (site, GBP, Bing Places, Apple, Yelp, Yell, socials) | `growth.md` NAP sheet |

## P1: fast and accessible

| # | Fix | Proof |
|---|---|---|
| 30 | Lighthouse mobile ≥ 90 performance, 100 accessibility, 100 best practices, 100 SEO on home, collection, product, page, article (Shopify's own scripts permitting) | gate `lighthouse` |
| 31 | Images responsive and sized: hero `fetchpriority=high`, everything else lazy, explicit width/height, WebP/AVIF from Shopify's CDN | Lighthouse + gate `images` |
| 32 | Contrast AA everywhere from the tokens, visible focus, skip link, labelled inputs, accordions as `<details>` | gate `a11y` (axe) |
| 33 | Alt text on every meaningful image, describing the photo; `alt=""` on decoration | gate `images` |

## P2: copy that sounds like her

| # | Fix | Proof |
|---|---|---|
| 34 | Copy in her voice, no AI tells, no hype words, no page talking about itself | gate `copy-lint` (banned-tells list) |
| 35 | Each fact once per page (cut-off, fee, area) | gate `repetition` |
| 36 | Area pages each say something only that area has; no copied sentences between them | gate `similarity` across `page.area` |
| 37 | Sympathy pages gentle: no balloons, no countdown, no exclamation marks | gate `sympathy` |
