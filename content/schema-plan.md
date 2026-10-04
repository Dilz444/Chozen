# Structured data plan

Rules, ported from the Mayfair playbook (S6, S5-11, S16-12):
- **Every value in JSON-LD is also visible on the page.** Facts only in JSON-LD are invisible to AI fetchers and Bing may ignore them. The gate checks this.
- **No self-serving ratings.** `aggregateRating`/`review` only from real first-party product reviews (Judge.me), never for the business itself, never imported from Google or Facebook.
- **FAQPage mirrors visible Q&A exactly.** It is not a ranking lever (Google limited the FAQ rich result); it's there for machine readability.
- **No HowTo, Speakable or SearchAction.** Retired or pointless.
- One `@graph` per page, rendered server-side by Liquid snippets. `@id`s are stable URLs with fragments so blocks reference each other.

| Page type | Blocks | Snippet |
|---|---|---|
| Home | `Florist` (LocalBusiness), `Organization`, `WebSite` | `schema-florist`, in `theme.liquid` when `template == 'index'` |
| Collection | `CollectionPage` + `BreadcrumbList` (+ `FAQPage` if Q&A shown) | `breadcrumbs`, `faq` |
| Product | `Product` + `Offer`(s) + `BreadcrumbList`; `aggregateRating` only when the reviews app supplies real data | `schema-product` |
| Area / delivery pages | `Florist` reference by `@id` + `Service` ("Same-day flower delivery") with `areaServed` for that area + `BreadcrumbList` + `FAQPage` | `schema-florist` (reference), `faq` |
| Guides / journal | `Article` (headline, image, datePublished, dateModified, author = Person Beyzan → /pages/about, publisher → Organization) + `BreadcrumbList` (+ `FAQPage`) | `schema-article` |
| About | `AboutPage` + `Person` (Beyzan, jobTitle "Florist and founder", worksFor → Organization) | `main-about` |
| Contact | `ContactPage` | — |

## Florist (LocalBusiness)

Address, hours and area are placeholders until B1, B3, B14 are answered. If she's home-based and hides her address on
Google, the site still shows the geographic address the law requires (E-Commerce Regs), so it can be in the schema too.
If she uses a service address instead, use that consistently everywhere.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Florist",
      "@id": "https://www.chozenboutique.co.uk/#florist",
      "name": "ChoZen Boutique",
      "url": "https://www.chozenboutique.co.uk/",
      "logo": "https://cdn.shopify.com/…/chozen-logo-512.png",
      "image": ["https://cdn.shopify.com/…/chozen-hero-bouquet.jpg"],
      "description": "Florist and gift boutique in Enfield, London. Fresh flowers and balloon gift sets hand-delivered the same day across North London; faux flowers, crystals and gemstone jewellery sent UK-wide.",
      "telephone": "+447931662545",
      "email": "hello@chozenboutique.co.uk",
      "address": { "@type": "PostalAddress", "streetAddress": "[ADDRESS]", "addressLocality": "Enfield", "addressRegion": "London", "postalCode": "[EN POSTCODE]", "addressCountry": "GB" },
      "geo": { "@type": "GeoCoordinates", "latitude": "[LAT]", "longitude": "[LNG]" },
      "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "[HH:MM]", "closes": "[HH:MM]" }],
      "areaServed": [
        { "@type": "Place", "name": "Enfield, London" }, { "@type": "Place", "name": "Winchmore Hill" },
        { "@type": "Place", "name": "Palmers Green" }, { "@type": "Place", "name": "Southgate" },
        { "@type": "Place", "name": "Edmonton" }, { "@type": "Place", "name": "Enfield Lock" }
      ],
      "priceRange": "£[MIN]–£[MAX]",
      "currenciesAccepted": "GBP",
      "paymentAccepted": "Credit card, Debit card, Apple Pay, Google Pay",
      "sameAs": ["https://www.instagram.com/chozen.boutique/", "https://www.tiktok.com/@chozenboutique", "[FACEBOOK URL]", "[GOOGLE BUSINESS PROFILE URL]"],
      "parentOrganization": { "@id": "https://www.chozenboutique.co.uk/#org" }
    },
    {
      "@type": "Organization",
      "@id": "https://www.chozenboutique.co.uk/#org",
      "name": "ChoZen Boutique",
      "legalName": "[LEGAL NAME]",
      "url": "https://www.chozenboutique.co.uk/",
      "logo": "https://cdn.shopify.com/…/chozen-logo-512.png",
      "founder": { "@type": "Person", "name": "Beyzan [SURNAME?]", "url": "https://www.chozenboutique.co.uk/pages/about" },
      "contactPoint": { "@type": "ContactPoint", "telephone": "+447931662545", "email": "hello@chozenboutique.co.uk", "contactType": "customer service", "areaServed": "GB", "availableLanguage": "en-GB" },
      "sameAs": ["https://www.instagram.com/chozen.boutique/", "https://www.tiktok.com/@chozenboutique", "[FACEBOOK URL]"]
    },
    { "@type": "WebSite", "@id": "https://www.chozenboutique.co.uk/#website", "name": "ChoZen Boutique", "alternateName": "ChoZen Boutique Enfield", "url": "https://www.chozenboutique.co.uk/", "publisher": { "@id": "https://www.chozenboutique.co.uk/#org" } }
  ]
}
```

## Product + Offer

```json
{
  "@type": "Product",
  "@id": "https://www.chozenboutique.co.uk/products/{handle}#product",
  "name": "{{ product.title }}",
  "description": "{{ product.description | strip_html | truncate: 500 }}",
  "image": ["{{ product.featured_image | image_url: width: 1600 }}"],
  "sku": "{{ variant.sku }}",
  "brand": { "@type": "Brand", "name": "ChoZen Boutique" },
  "category": "{{ line }}",
  "offers": {
    "@type": "Offer",
    "url": "https://www.chozenboutique.co.uk/products/{handle}",
    "priceCurrency": "GBP",
    "price": "45.00",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "https://www.chozenboutique.co.uk/#org" },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": { "@type": "MonetaryAmount", "value": "[FEE]", "currency": "GBP" },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "GB", "postalCodePrefix": ["EN1","EN2","EN3","N9","N13","N14","N18","N21"] },
      "deliveryTime": { "@type": "ShippingDeliveryTime", "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" }, "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" }, "cutoffTime": "10:00:00+01:00" }
    },
    "hasMerchantReturnPolicy": { "@type": "MerchantReturnPolicy", "applicableCountry": "GB", "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted", "description": "Fresh flowers are perishable and can't be returned unless faulty." }
  }
}
```

Keepsakes (faux, crystals, jewellery) use `shippingDestination` = GB, the UK shipping rate and transit time, and
`MerchantReturnFiniteReturnWindow` with `merchantReturnDays: 14`. Variants become an `AggregateOffer` (lowPrice/highPrice)
or one `Offer` per variant. The cut-off offset follows BST/GMT (`+01:00` summer, `+00:00` winter); Liquid computes it.

## BreadcrumbList, FAQPage, Article

Generated from the same data the page renders: `breadcrumbs` front matter → visible crumbs + `BreadcrumbList`; `faq`
front matter → visible `<details>` + `FAQPage`; guides → `Article` with `dateModified` changing only on real edits.

## Validation

The gate parses every JSON-LD block, checks required fields per type, checks every string value appears in the
visible text (names, prices, phone, address), and fails on `aggregateRating` without review data, on placeholders in
launch mode, and on a `Florist` block anywhere but home and the area/delivery/contact pages. Before launch, run the
home, one product, one area page and one guide through Google's Rich Results Test and the Schema.org validator by hand.
