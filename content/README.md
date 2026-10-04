# content/ — every word on the new site

The copy the Shopify build applies. One Markdown file per URL, with front matter. `tools/preview` renders
these through the real theme templates, and `tools/import` turns them into Shopify pages, collections and
articles once the store exists. Rules: `copy-voice.md`. Facts: only the brief, `open-questions.md` defaults
and `research/`. Anything not confirmed is a visible placeholder in square brackets, which the gate refuses at
launch: `[PRICE]`, `[FEE]`, `[ADDRESS]`, `[HOURS]`, `[to confirm]`.

## File format

```markdown
---
url: /pages/flower-delivery-winchmore-hill        # final Shopify URL
type: page                                          # page | collection | article | product | home | policy
template: page.area                                 # Shopify template suffix (templates/page.area.json)
title: Flowers Delivered Today in Winchmore Hill, N21 | ChoZen Boutique   # ≤ 60 chars where possible
meta: Same-day flower and balloon delivery in Winchmore Hill N21, hand-delivered from Enfield. Order by 10am.  # 120–155 chars
h1: Flowers delivered today in Winchmore Hill
lede: >-                                            # the direct answer, ≤ 2 sentences, ≤ 45 words
  We hand-deliver fresh bouquets and balloon gift sets across Winchmore Hill and N21 the same day when you
  order by 10am. Delivery is £[FEE].
schema: [Florist, BreadcrumbList, FAQPage]          # which JSON-LD blocks the template emits
breadcrumbs: [Home, Delivery areas, Winchmore Hill]
images:                                             # every image the page uses, with alt text
  - file: winchmore-hill-delivery-[to come].jpg
    alt: A bouquet of pink roses being handed over at a front door in Winchmore Hill
    status: placeholder
faq:                                                # rendered visibly AND as FAQPage JSON-LD
  - q: What time do I need to order for same-day delivery in Winchmore Hill?
    a: Order by 10am and we deliver the same day, Monday to Saturday [to confirm].
links: [/collections/same-day-flowers, /collections/balloon-gift-sets]   # internal links the page must carry
---

## Body copy in Markdown

H2s are questions (copy-voice rule 2). The first sentence under each answers it.
```

## The new site (information architecture)

Lead with the local, same-day lines; the keepsake lines are the nationwide second row (see `focus.md`).

### Main navigation
1. **Same-day flowers** `/collections/same-day-flowers`
2. **Balloons** `/collections/balloon-gift-sets`
3. **Gifts that last** `/collections/gifts-that-last` → Faux flowers · Crystals · Gemstone jewellery · Gifts
4. **Occasions** → Birthday · Anniversary · New baby · Thank you · Get well · Sympathy · (Mother's Day and Valentine's in season)
5. **About** `/pages/about`

Utility: Delivery areas · Search · Basket. "Claims Payment" leaves the nav (B18).

### Collections (`template: collection` unless noted)
| URL | Line | Notes |
|---|---|---|
| /collections/same-day-flowers | fresh | the front door |
| /collections/balloon-gift-sets | balloon | includes flowers + balloon bundles |
| /collections/gifts-that-last | hub | faux + crystals + jewellery + gifts |
| /collections/faux-flowers | faux | UK shipping |
| /collections/crystals | crystal | filters: colour, formation, meaning (Search & Discovery metafield filters, not separate indexable pages) |
| /collections/gemstone-jewellery | jewellery | Dealer's Notice B on page |
| /collections/gifts | other | |
| /collections/birthday-flowers | occasion | `collection.occasion` |
| /collections/anniversary-flowers | occasion | |
| /collections/new-baby-gifts | occasion | flowers + balloons |
| /collections/thank-you-gifts | occasion | |
| /collections/get-well-soon-gifts | occasion | |
| /collections/sympathy-flowers | occasion | `collection.sympathy` (no balloons, no countdown, gentle) |
| /collections/mothers-day | seasonal | evergreen URL, live by Dec 2026 for 7 Mar 2027 |
| /collections/valentines-day | seasonal | evergreen URL |
| /collections/gifts-under-30 | price | |
| /collections/flower-subscription | subscription | or a page, depending on the app |

### Pages
| URL | Template | Notes |
|---|---|---|
| /pages/about | page.about | Beyzan's story |
| /pages/contact | page.contact | NAP, form, hours |
| /pages/delivery | page.delivery | areas, fees, cut-off, days, UK shipping rates, substitutions |
| /pages/flower-delivery-enfield | page.area | the local hub: EN1, EN2 (Enfield Town, Bush Hill Park, Gordon Hill, Chase Side) |
| /pages/flower-delivery-winchmore-hill | page.area | N21 [to confirm] |
| /pages/flower-delivery-palmers-green | page.area | N13 [to confirm] |
| /pages/flower-delivery-southgate | page.area | N14: Southgate, Oakwood, Cockfosters edge [to confirm] |
| /pages/flower-delivery-edmonton | page.area | N9, N18 [to confirm] |
| /pages/flower-delivery-enfield-lock | page.area | EN3: Enfield Lock, Ponders End, Enfield Highway [to confirm] |
| /pages/balloon-delivery-enfield | page.area | the uncontested local query (research/keywords.md) |
| /pages/flower-subscription | page | if not a collection |
| /pages/floral-hire | page.hire | enquiry form |
| /pages/faqs | page.faq | |
| /pages/buy-back-programme | page | footer only, [to confirm] terms |
| /pages/ethical-sourcing | page | footer only, claims she can evidence |
| /pages/review-policy | page | DMCC Act |
| /pages/cookies | page | PECR |
| /policies/refund-policy, /policies/privacy-policy, /policies/terms-of-service, /policies/shipping-policy | Shopify policies | text in content/legal/ |

### Blogs
| URL | Template | Holds |
|---|---|---|
| /blogs/guides | blog.guides | evergreen guides: crystal meanings, birthstones, crystals by colour, zodiac crystals (as tradition), flower care, faux flower care, faux vs dried vs fresh, card messages, anniversary flowers by year, gifting guides |
| /blogs/journal | blog | her blog posts ported from Wix `/post/*` |

## Folder layout

```
content/home.md
content/pages/*.md
content/collections/*.md
content/guides/*.md           → /blogs/guides/<handle>
content/journal/*.md          → /blogs/journal/<handle> (ported from Wix once captured)
content/legal/*.md
content/products/*.md         → placeholders until products-template.xlsx comes back
```
