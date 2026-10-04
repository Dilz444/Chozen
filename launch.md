# Launch checklist (dry run: do NOT run until Dilz says go)

The Wix site stays live and untouched until step 9. Every step says what to check before moving on. If a check
fails, stop there: everything before step 9 can be undone without customers noticing.

Estimated time on the day: 2–3 hours, plus DNS propagation (usually under an hour, up to 48). Pick a **Monday or
Tuesday afternoon** after the cut-off, never the week before Mother's Day or Valentine's.

---

## T−7 days: ready to launch?

| # | Step | Check |
|---|---|---|
| 1 | `npm run gate -- --launch` on the latest theme | **0 fail.** Launch mode fails on any `[to confirm]`, `[PRICE]`, sample product or placeholder photo, so this proves every fact is real |
| 2 | Independent check of the served store preview (theme preview link on a phone): one test order each for a local bouquet with a card message, a UK-posted crystal, and a mixed basket to a non-local postcode (should be stopped at the basket) | orders show the date, card message and right delivery method; notification emails read correctly; cancel and refund the test orders |
| 3 | Delivery app: cut-off 10:00 (or her chosen time), delivery days, blackout dates (bank holidays, her holidays), postcode zones identical to theme settings → Same-day delivery | try to pick today after the cut-off: impossible; pick a Sunday: impossible |
| 4 | Settings → Policies filled from `content/legal/` (refund, privacy, terms, shipping); footer legal line real; contact page address real; ICO number in privacy policy | read each on a phone |
| 5 | Settings → Customer privacy: cookie banner on for UK, Accept and Reject equal | private window: no Meta/TikTok/GA requests before Accept (DevTools → Network) |
| 6 | Notification templates: order confirmation and packing slip print `Card message` and the delivery date | test order email |
| 7 | Theme settings → Before launch → turn **off** "Show 'to confirm' marks" | no dashed tags anywhere |
| 8 | `node tools/redirects/build.mjs` after a **fresh** `npm run capture` and the Google index check (`capture/indexed.md`) | `redirects/unmapped.txt` is empty; every target exists |

## Launch day

| # | Step | Where | Check after |
|---|---|---|---|
| 9 | **Export anything from Wix** that exists: orders, customers who opted in to marketing, form submissions, blog images not yet captured. Do NOT cancel Wix yet | Wix dashboard | files saved to Google Drive |
| 10 | Shopify: pick the **Basic** plan (annual), add payment details, set up Shopify Payments (bank account, ID) | Settings → Plan, Payments | Payments shows "active"; a £1 test product purchase succeeds and is refunded |
| 11 | **Connect the domain.** Shopify → Settings → Domains → Connect existing domain → `chozenboutique.co.uk`. At the registrar (where the domain was bought; if it was bought through Wix, the DNS is managed in Wix → Domains): set **A record `@` → `23.227.38.65`** and **CNAME `www` → `shops.myshopify.com`**; remove the old Wix A/CNAME records. **Leave MX records alone** (email) | Shopify + registrar | Shopify shows the domain "Connected"; SSL issued (can take up to an hour) |
| 12 | Make `www.chozenboutique.co.uk` the **primary domain**, with the bare domain and `chozen-boutique.myshopify.com` redirecting to it | Settings → Domains | `curl -I https://chozenboutique.co.uk` → 301 to `https://www.chozenboutique.co.uk/` |
| 13 | Remove the storefront password | Online Store → Preferences | the homepage loads in a private window on a phone with 4G (Wi-Fi off) |
| 14 | **Import the redirects**: Online Store → Navigation → URL redirects → Import → `redirects/wix-to-shopify.csv` (or `node tools/import/push.mjs --apply --only redirects`) | Shopify | spot-check 10 old Wix URLs in a browser: each lands in **one hop** on the right page (`curl -sI <url>` shows one 301) |
| 15 | `llms.txt`: Settings → Files → upload `seo/llms.txt`; add a URL redirect `/llms.txt` → the file's CDN URL | Shopify | `https://www.chozenboutique.co.uk/llms.txt` returns the text |
| 16 | Re-run the gate against the live site: `npm run gate -- --launch --base https://www.chozenboutique.co.uk` | terminal | 0 fail; Lighthouse mobile within a few points of the preview (Shopify adds its own scripts) |

## Same day, after it's live: tell the search engines

| # | Step | Check after |
|---|---|---|
| 17 | **Google Search Console**: add a **Domain property** for `chozenboutique.co.uk` (DNS TXT record at the registrar). Submit `https://www.chozenboutique.co.uk/sitemap.xml`. Settings → "Search generative AI features": include | sitemap status "Success"; URL Inspection on `/` → "URL is on Google" or "Request indexing" |
| 18 | If Wix had connected Search Console before: keep that property; use **Change of address** only if the domain itself changed (it doesn't here, so skip) | — |
| 19 | URL Inspection → Request indexing for: home, `/collections/same-day-flowers`, `/pages/flower-delivery-enfield`, `/pages/balloon-delivery-enfield`, `/pages/delivery` | requested |
| 20 | **Bing Webmaster Tools**: Sign in → Import from Google Search Console | sitemap imported; IndexNow app installed in Shopify and pinging |
| 21 | **Merchant Center**: Shopify → Google & YouTube app → connect the Google account → free listings on; shipping: UK rates for keepsakes; fresh bouquets either excluded or set to local delivery only | products "Approved" within 1–3 days; fix any disapprovals (usually images or shipping) |
| 22 | **Google Business Profile**: if it exists, update website to `https://www.chozenboutique.co.uk/`, hours, products. If it doesn't, create it per `growth.md` (verification can take days, start it at T−14 if possible) | profile shows the new website; the "Website" button opens the new site |
| 23 | Bing Places, Apple Business Connect: same name, address, phone, website | listings submitted |
| 24 | Instagram, TikTok, Facebook: link in bio → `https://www.chozenboutique.co.uk/` | tap each link on a phone |
| 25 | Pinterest: Shopify Pinterest app connected, catalogue syncing, website claimed | catalogue shows products |

## Day +1 to +14

| # | Step | Check after |
|---|---|---|
| 26 | Search Console → Pages: watch for 404s from old Wix URLs; add any missing redirects | 404 list empty of real pages |
| 27 | First real orders: check the card message, delivery date and emails end to end | the customer and Beyzan both got what they expected |
| 28 | Review request emails sending (Judge.me) | first review arrives |
| 29 | **Cancel Wix (not before day 14).** Wix → Subscriptions → cancel the Premium plan (turn off auto-renew). **If the domain is registered through Wix, transfer it out first** (or keep it registered there with DNS pointing to Shopify) so cancelling the plan doesn't touch the domain. Keep the free Wix account so nothing is deleted while the 301s settle | Wix plan shows cancelled; the domain still resolves to Shopify; email still works |
| 30 | Retire the hotmail address from every public place once `hello@` has worked for two weeks | grep the live site for "hotmail": none |

## Undo plan

- Before step 11, nothing customer-facing has changed: stop and fix.
- After step 11: point the A and CNAME records back to Wix (the old values are in a screenshot taken at step 11, take it) and the Wix site is back within the DNS TTL. Shopify keeps everything.
