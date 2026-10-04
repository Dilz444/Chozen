# Shopify platform research: ChoZen Boutique (Enfield, N. London)

Researched 4 Oct 2026. **Method note:** shopify.com, help.shopify.com, shopify.dev and apps.shopify.com were all blocked for direct fetch, so most figures come from 2026 third-party write-ups found via web search. Treat every price as "check in admin before buying". Anything without a 2025–26 source is marked **unverified**. Prices exclude VAT unless stated. USD→GBP is converted at about **$1 = £0.75**, which is an assumption. Shopify bills most apps in USD.

---

## 1. Plan, prices, card rates

| Plan | Monthly billing | Annual (per month) | Online card rate (Shopify Payments, standard UK cards) | In-person | Fee on 3rd-party gateways | Staff |
|---|---|---|---|---|---|---|
| **Basic** | **£25** | **£19** (£228/yr) | **2% + 25p** | 1.7% | 2% | 2 |
| Grow | £65 | £49 | 1.7% + 25p | 1.6% | 1% | 5 |
| Advanced | £344 | £259 | 1.5% + 25p | 1.5% | 0.5% | 15 |

Sources: [charle.co.uk](https://www.charle.co.uk/articles/shopify-pricing/), [avada.io](https://avada.io/blog/shopify-price-uk/), [russdigital](https://russdigital.co.uk/blog/how-much-does-shopify-cost-uk/), [comparecardfees](https://www.comparecardfees.co.uk/payment-providers/shopify-payments/), [blubolt](https://blubolt.com/insights/shopify-payment-gateways/) (all 2026). Annual billing saves 25%. A promo of the first 3 months at £1/month was reported in 2026 ([charle](https://www.charle.co.uk/articles/shopify-pricing/)). Shopify adds 20% VAT unless you are VAT-registered, in which case the reverse charge applies ([linkmybooks](https://linkmybooks.com/blog/is-there-vat-on-shopify-fees-what-uk-sellers-need-to-know)). Rates for Amex, international and premium cards are higher: **unverified**.

**Recommendation: Basic, billed annually.** Basic covers everything this shop needs:
- **Local delivery:** native on all plans (see section 2).
- **Staff:** 2 staff accounts, plus unlimited collaborator access for the developer ([blackbeltcommerce](https://www.blackbeltcommerce.com/discover-whats-included-in-shopifys-basic-pricing-plan/), [storeguides.uk](https://storeguides.uk/shopify-plans-uk/)).
- **Gift cards and discounts:** included.
- **POS Lite:** free on every paid plan, and takes card, cash and gift-card payments ([shopify.ecom-store.pro](https://shopify.ecom-store.pro/blog/shopify-pos-lite/)).
- **Shopify Subscriptions:** free and works on Basic with Shopify Payments ([charle](https://www.charle.co.uk/articles/setup-subcriptions-shopify/)).
- **Reports:** Basic has the standard analytics dashboards and reports. Exactly which reports are gated to Grow is **unverified**, because the official comparison page was blocked.

Grow's lower card rate only pays back at about £120k a year of online card sales: the extra £360/yr of plan cost divided by the 0.3% rate saving.

## 2. Same-day local delivery

**What native Local Delivery does** ([help.shopify.com local delivery](https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/local-delivery), via search snippets):
- It is set up per **location**, with a **radius** of up to 160 km or a list of **postcodes**. Postcode lists accept prefixes and wildcards, for example `EN1*, EN2*, N21*`, up to 3,000 characters.
- Each location can have up to **10 zones**. Each zone has its own **minimum order price** and **delivery price**, plus up to **3 price-based conditional rules**, for example "free over £60".
- You can write delivery information for the customer. The customer's phone number and delivery instructions are collected at checkout.
- Orders show up as "local delivery" in the admin, where you can filter them and print packing slips.

**What it cannot do:**
- No delivery **date or time-slot picker**.
- No **cut-off times**, no **blackout dates**, no capacity limits per day.
- No "order by 1pm for same-day" messaging.
- No route planning: Shopify's **Local Delivery driver app shut down on 16 Jan 2023** ([community](https://community.shopify.com/t/shopify-local-delivery-app-is-shutting-down-jan-16/176913)). EasyRoutes replaces it, with a free plan covering 50 orders/month and 1 driver; Standard is $39 ([capterra](https://www.capterra.com/p/228110/EasyRoutes-Local-Delivery-Routes-Planner/), 2026).

Florist write-ups confirm Shopify "has no native cutoff feature" ([logbase 2026](https://www.logbase.io/blog/best-shopify-local-delivery-app), [orderrules](https://orderrules.com/blog/setting-up-cutoff-times-shopify)).

**Checkout extensibility on Basic.** Checkout UI extensions on the information, shipping and payment steps are **Plus-only** ([shopify.dev date-picker tutorial](https://shopify.dev/docs/apps/build/checkout/delivery-shipping/delivery-methods/date-picker), [getflare](https://www.getflare.co.uk/blog/shopify-plus-checkout-customization-for-delivery/)). On Basic, delivery-date apps instead put their widget on the **product page and/or cart page**. The chosen date goes into cart attributes, which appear on the order as "Additional details".

The weak spot is that **express buttons skip the cart** (Shop Pay, Apple Pay and "Buy it now"), so a customer can check out without picking a date. Zapiet handles this by disabling Buy-now and express buttons until a date has been chosen ([Zapiet support](https://support.zapiet.com/en/articles/6279874-express-checkout-methods)). In the custom theme, also turn off dynamic checkout buttons on product templates.

| App | Price (2026 sources) | Date, cut-off, blackout, postcode | Notes |
|---|---|---|---|
| **Zapiet – Pickup + Delivery** | Essential **$29.99/mo** (1–2 locations, 250 orders/mo); Advanced $79.99; Pro $179.99; 14-day trial ([analyzify](https://analyzify.com/shopify-apps/zapiet-pickup-delivery), [logbase](https://www.logbase.io/compare/pickeasy-vs-zapiet)) | Yes to all four. Rates by postcode. Product-level prep times on Advanced. | Most established. Product, cart and order-status widgets. Works with POS. Checkout widgets need Plus. Which date features sit on Essential versus Advanced is **unverified**. |
| **Stellar Delivery Date & Pickup** (Identixweb) | Free (20 orders, 3 locations); Product Delivery or Store Pickup **$14.99/mo**; Unlimited $29.99 ([identixweb helpdesk](https://www.identixweb.com/helpdesk/order-delivery-date/odd-pricing/pricing/)) | Yes; product-wise cut-off; weekday and weekend rates | Rated 4.7 from about 541 reviews. Aimed at florists and bakeries ([easysellapp](https://easysellapp.com/blogs/wiki/best-shopify-delivery-date-picker-apps-2026)). |
| **Bird Pickup Delivery Date** | Free (15 orders/mo); Essential **$9.99**; Advance $16.99; Premium $29.99 ([pickyourapp](https://pickyourapp.com/products/store-pickup-and-delivery-date)) | Yes: cut-off, prep time, block-out dates, rates | Cheapest credible option. Charges $0.10 for each order over the plan limit. |
| **Pickeasy** | Free (10 orders/mo); $9.99; $19.99; $29.99; $49.99 | Yes, plus postcode validation | [hulkapps compare](https://www.hulkapps.com/blogs/compare/shopify-in-store-pickup-apps-pickup-delivery-date-pickeasy-vs-estimated-delivery-pickup-edp) |
| **NuFlorist** (built for florists) | Free; Pro $29.99; **Shop $49/mo** for dates, zones, cut-offs and slots ([pickyourapp](https://pickyourapp.com/products/nuflorist), [nuflorist.com](https://nuflorist.com/)) | Yes, plus rush fees, card messages and occasions | Newer app with a smaller track record. Good if card messages and add-ons should also come from an app. |

**Recommendation: Zapiet Essential (about £22.50/mo).** It has the longest track record with florists, so cut-off and same-day logic is mature. It handles postcode rates and POS. Its express-checkout lock fixes the main way date capture breaks on non-Plus stores. **Budget fallback:** Stellar ($14.99) or Bird Essential ($9.99). Test any of them on the dev store with the custom theme before launch, because their app blocks must render in custom sections.

## 3. Mixed carts (local-only bouquet plus a shippable crystal)

**The core limitation:** Shopify checkout gives one delivery method per checkout. Local delivery and pickup are **not offered when a cart needs mixed delivery methods** ([help.shopify.com ship-and-pickup](https://help.shopify.com/en/manual/checkout-settings/ship-and-pickup), [community](https://community.shopify.com/t/local-products-separate-checkout-options-from-shipped-products/387085)).

**Simplest robust setup** (no code, owner-maintainable):
1. **Profile "Fresh – local only":** bouquets and plants. Local delivery zones only, no shipping rates.
2. **Default profile:** crystals and gifts. UK shipping (Royal Mail or Evri flat rates) **and** the same local-delivery zones at the **same prices**. Matching rates across profiles stops the charges stacking ([community](https://community.shopify.com/t/best-way-to-limit-local-delivery-to-specific-products-only/408703/4)).
3. **Result:** a mixed cart for an Enfield postcode checks out as one local delivery, and the crystal travels in the van. A mixed cart for an address outside the zones shows no rate. Prevent that at the cart rather than letting checkout fail: tag fresh products `local-only`, and have the theme cart show a notice, using Liquid to check the tag: "Fresh flowers deliver only to EN1–EN3, N9, N13, N14, N18, N21; for UK shipping please order flowers separately." The delivery app's postcode checker on the product page adds a second guard.
4. **Not recommended:** shipping-rule apps (Intuitive Shipping and similar) or Shopify Functions cart validation. Functions-based validation is possible but needs a custom app, which is too much for a non-technical owner.

**Watch-out:** "market-driven shipping" starts an **opt-in rollout on 1 Oct 2026** and becomes the default on **1 Jul 2027**. It moves shipping options from profiles and zones into Markets ([shopify.dev changelog](https://shopify.dev/changelog/posts/market-driven-shipping-now-available-in-feature-preview), [reachship](https://reachship.com/shopify-shipping-changes-2026/)). Keep using profiles for now, don't opt in until the delivery app confirms support, and expect the setup UI to change.

## 4. Reviews

| Option | Cost | Notes |
|---|---|---|
| Shopify Product Reviews | n/a | **Removed 6 May 2024** ([trustedshops](https://business.trustedshops.com/blog/shopify-to-remove-product-reviews-app-may-2024)) |
| **Judge.me Free** | £0 | Unlimited reviews and review-request emails, photo and video reviews, rich-snippet stars in Google search. Shows Judge.me branding ([wiserreview](https://wiserreview.com/blog/judge-me-review/), [eevy.ai](https://eevy.ai/blog/judgeme-pricing)). |
| Judge.me Awesome | **$15/mo** flat (about £135/yr) | Removes branding. Adds automatic reminders, coupons, Q&A, an all-reviews page, AI summaries, and Google Shopping product-ratings sync (needs 50+ reviews and Merchant Center) ([judge.me help](https://judge.me/help/en/articles/13845576-syncing-product-reviews-to-google-shopping)). |

**Google Customer Reviews** (seller ratings) is separate. Judge.me does **not** feed seller ratings. The old opt-in script **broke on Shopify's Thank-you/Order-status pages in 2025** after ScriptTags were removed and the pages moved to checkout extensibility. Restoring it now needs a checkout-extensibility app, such as the "easy Google Customer Reviews" or "Google Customer Reviews" apps on the App Store ([ppc.land](https://ppc.land/google-customer-reviews-breaks-in-shopify-here-is-the-free-fix/)). Those apps' prices are **unverified**.

**For a local florist, Google Business Profile reviews matter more.** Link to them from the order follow-up email at no cost.

**Recommendation:** start on Judge.me Free. Upgrade to Awesome once there are 50 or more reviews and Shopping ads are running.

## 5. Other features and apps

- **Subscriptions (flower plans):** the Shopify Subscriptions app is **free on all plans**. It needs Shopify Payments, PayPal Express, Stripe or a similar supported gateway, and works on the Online Store and POS ([easysubscription](https://easysubscription.io/blog/best-shopify-subscription-apps/), [subi help](https://help.subi.co/en/articles/6138200-what-are-shopify-s-eligibility-requirements-for-selling-subscriptions)). Check that the delivery-date app works with subscription orders before promising weekly delivery days.
- **Hire and booking (event or wedding flowers, prop hire):** a **form plus deposit is enough** at this volume, and avoids a booking app (usually $10–40/mo, **unverified**).
  1. An enquiry form, either the theme contact form with extra fields or the free Shopify Forms app.
  2. The owner confirms the date.
  3. The owner sends a **draft order invoice** for the deposit (draft orders are on all plans), or the shop sells a "Hire deposit" product whose price is the deposit amount.
- **Gift card messages without an app:**
  - Add `<textarea name="properties[Card message]" maxlength="200">` inside the product form. **Line item properties** work on every plan, follow the item into cart, checkout, the order admin and notifications, and are passed by "Buy it now" because they sit in the form ([printitmyway 2026](https://www.printitmyway.com/blog/shopify-line-item-properties-reference), [shopify.dev cart API](https://shopify.dev/docs/api/ajax/reference/cart)).
  - Use cart attributes (`attributes[Gift message]`) or the cart note for messages that apply to the whole order.
  - Don't start the property name with `_`, which hides it.
  - Add the property loop to the order-confirmation and packing-slip templates so it prints.
- **Google & YouTube app:** free. It syncs products to Merchant Center and opts the store into **free listings** on Google Shopping, Images, Lens and YouTube ([charleagency](https://www.charleagency.com/articles/shopify-google-shopping-guide/), [Google](https://support.google.com/merchants/answer/13692890)). One gotcha for Merchant Center: give local-only bouquets correct shipping settings, or exclude them from the feed.
- **Pinterest app:** free. It does catalog sync (real-time as of Apr 2026), Product Pins (which work as rich pins automatically) and installs the Pinterest tag. You only pay for ads ([exactwhy](https://exactwhy.com/blogs/news/pinterest-hosted-checkout-shopify-2026), [identixweb](https://www.identixweb.com/pinterest-for-shopify/)).
- **Shopify Email:** **10,000 emails/month free**, then $1 per 1,000. **Abandoned-checkout automations are free and don't count** toward the 10,000 ([sequenzy](https://www.sequenzy.com/pricing/shopify-email)). Turn on the abandoned checkout automation on day one.
- **Shopify Inbox:** free live chat with mobile app and AI-suggested replies ([eesel](https://www.eesel.ai/blog/shopify-inbox)).
- **Search & Discovery:** free. Filters (up to 25, including metafield filters such as "occasion" and "colour"), synonyms, boosts and recommendations ([bogos.io](https://bogos.io/shopify-search-and-discovery-app/)). The custom theme must render the `filter` objects.
- **Translate & Adapt:** not needed (English-only, UK-only).

## 6. Theme development

- **Shopify CLI:** current version is **4.8.4**, published 2 Oct 2026, and needs **Node ≥ 22.12** (checked on [registry.npmjs.org/@shopify/cli](https://registry.npmjs.org/@shopify/cli)). Install with `npm i -g @shopify/cli`.
  - CLI 4.0 (21 May 2026) moved to SemVer with auto-updates and **removed `theme serve`**. Use `theme dev` ([shopify.dev changelog](https://shopify.dev/changelog/shopify-cli-40-semver-auto-updates-removing-deprecated-flags-and-commands)).
  - Since **1 Oct 2026**, password-protected stores need CLI ≥ 3.84 for `theme dev` ([changelog](https://shopify.dev/changelog/password-protected-shop-dev-flows-on-shopify-theme-cli-v3-83-x-and-older-to-be-deprecated)).
- **Does `shopify theme dev` need a login? Yes.** It uploads a hidden development theme to a real store and proxies it to localhost. You authenticate either with a Shopify account that has staff or collaborator access to the store, or with a **Theme Access app password** (`--password`) ([shopify.dev CLI for themes](https://shopify.dev/docs/storefronts/themes/tools/cli)). There is no fully offline preview.
- **Dev stores:** free. You create them from a **free Partner account**, or since 2025 from the new **Dev Dashboard**, either through its Stores → Create store → Dev option or with `shopify` CLI. Creating one needs a Partner account or "a merchant store with developer permissions" ([shopify.dev dev stores](https://shopify.dev/docs/apps/build/stores/development-stores), [changelog](https://changelog.shopify.com/posts/build-apps-easily-with-the-new-dev-dashboard)).
  - One gotcha: a dev store created on the new Dev Platform is visible only to the person who created it, until they add others as staff ([community.shopify.dev](https://community.shopify.dev/t/dev-stores-no-longer-visible-to-other-partner-admins-in-new-dev-platform/23293)).
  - **Simplest route for this project:** the owner starts the real Basic trial and adds the developer as a **collaborator**, then build on an unpublished theme in that store.
- **Theme Check, offline linting:** built into the CLI as `shopify theme check`, which runs locally with no login. The standalone package is `@shopify/theme-check-node`, currently **3.30.1** ([npm](https://registry.npmjs.org/@shopify/theme-check-node)). It can run in CI.
- **Online Store 2.0 and section groups:** use JSON templates (`templates/*.json`) so sections are editable on every page. Use **section groups** (`sections/header-group.json`, `footer-group.json`) for the header, announcement bar and footer. Use app blocks (`@app`) in the product and cart sections so the delivery-date and review widgets can be placed without code ([shopify.dev themes architecture](https://shopify.dev/docs/storefronts/themes/architecture)).
- **Performance targets:** the Theme Store bar is an **average Lighthouse performance score ≥ 60** across the home, product and collection pages, **on both desktop and mobile**, plus **accessibility ≥ 90** ([shopify.dev requirements](https://shopify.dev/docs/storefronts/themes/store/requirements), [testing for performance](https://shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance)). Aim higher for a bespoke theme. Use Shopify's [Lighthouse CI GitHub Action](https://shopify.dev/docs/storefronts/themes/tools/lighthouse-ci), `image_url` with `image_tag` (responsive srcset, lazy-load below the fold), and minimal JS. Note that every app embed adds weight.

## 7. Redirects (Wix to Shopify)

**CSV import:** Content → Menus → **URL redirects → Import** ([adnabu](https://blog.adnabu.com/shopify-redirects/shopify-import-redirects/), [webgarh 2026](https://webgarh.com/blogs/shopify/shopify-redirects-the-complete-2026-guide)).
- The file has two columns: `Redirect from,Redirect to`.
- Paths start with `/` and have no domain. Save as CSV, not XLSX.
- Imported redirects are 301s. Non-Plus stores can have up to 100,000.
- A redirect only fires if the old path **404s** on Shopify ([litextension](https://litextension.com/blog/shopify-redirects/)).
- There are no wildcards, so list every URL. Crawl the live Wix sitemap (`/sitemap.xml`) to get the list.

| Wix (default) | Shopify | Source |
|---|---|---|
| `/product-page/{slug}` | `/products/{handle}` | [Wix SEO product pages](https://support.wix.com/en/article/wix-stores-seo-for-product-pages) |
| `/category/{slug}` (new Wix category pages; older sites may use `/shop` or a custom page) | `/collections/{handle}` | [Wix category pages](https://support.wix.com/en/article/wix-stores-customizing-the-category-page) |
| `/post/{slug}` | `/blogs/news/{handle}` | [Wix blog URLs](https://support.wix.com/en/article/wix-blog-about-blog-post-web-addresses-urls) |
| `/blog` | `/blogs/news` | same |
| `/blog/categories/{x}` | `/blogs/news/tagged/{x}` (Shopify uses tags) | [Wix blog categories](https://support.wix.com/en/article/wix-blog-creating-and-managing-blog-categories) |
| `/blog/tags/{x}` | `/blogs/news/tagged/{x}` | same |
| `/{page}` (for example `/about`, `/contact`) | `/pages/{handle}` | — |
| `/shop`, `/shop-1` | `/collections/all` | — |

Example CSV:
```
Redirect from,Redirect to
/product-page/rose-luxe-bouquet,/products/rose-luxe-bouquet
/category/crystals,/collections/crystals
/post/how-to-care-for-peonies,/blogs/news/how-to-care-for-peonies
/blog/categories/weddings,/blogs/news/tagged/weddings
/about,/pages/about
```
Wix lets site owners rename the prefixes, so check the real URLs in the sitemap.

## 8. First-year running cost (ex VAT, before card fees)

| Item | Cheapest sensible | Comfortable |
|---|---|---|
| Shopify Basic, annual | £228 | £228 |
| Delivery date app | Bird Essential $9.99 → **~£90** (or Stellar $14.99 → ~£135) | **Zapiet Essential $29.99 → ~£270** |
| Reviews | Judge.me Free £0 | Judge.me Awesome $15 → ~£135 |
| Route planning | none (owner drives) | EasyRoutes Free £0 |
| Subscriptions, Email (≤10k/mo), Inbox, Search & Discovery, Google & YouTube, Pinterest, Forms | £0 | £0 |
| Domain email, 1 user | **Zoho Mail Lite** about $1/user/mo → ~£9–12 (GBP price **unverified**; [toolradar](https://toolradar.com/tools/zoho-mail/pricing)) | **Google Workspace Business Starter £5.90/mo annual → £70.80** (£7 flexible) ([refractiv](https://refractiv.co.uk/news/google-workspace-cost-uk-pricing/)), or **M365 Business Basic £5.40/mo annual → £64.80** after the 1 Jul 2026 rise (£6.48 monthly) ([nerdster](https://nerdster.co.uk/insights/microsoft-365-price-changes-2026/)) |
| .co.uk domain renewal | ~£10 | ~£10–15 ([123-reg](https://www.123-reg.co.uk/blog/featured/cheap-domain-registrars-uk-compared/)) |
| **Total** | **≈ £340/yr (~£28/mo)** | **≈ £715/yr (~£60/mo)** |

On top of this, card fees are 2% + 25p per online order. A £45 bouquet costs £1.15 in fees. If the shop is not VAT-registered, add 20% VAT to the Shopify plan, apps and email costs.

**Unverified or to confirm in admin:**
- The exact feature split between Zapiet Essential and Advanced.
- The current GBP price of Zoho Mail.
- Prices of the Google Customer Reviews apps.
- Which reports are on Basic.
- How market-driven shipping changes the profile setup in section 3.
