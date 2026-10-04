# capture/ — the "before" record of the Wix site

**Status (4 Oct 2026): NOT YET CAPTURED.** The cloud environment this project was built in blocks
`www.chozenboutique.co.uk`, `static.wixstatic.com`, Google, archive.org, Instagram, TikTok and Facebook
at the network level (HTTP 403 from the egress proxy on every attempt, WebFetch blocked too). Nothing in
this repo was copied from the live site. Every document that depends on the capture says so with the
tag **[pending capture]**.

## Run it (10 minutes of your time, 20–40 minutes of machine time)

On any laptop with Node 20+:

```bash
git clone https://github.com/Dilz444/Chozen && cd Chozen
npm install
npx playwright install chromium        # skip if you already have it
npm run capture -- --limit 3           # quick test
npm run capture                        # the whole site: sitemap index + every linked page
git add capture && git commit -m "Capture Wix site (before record)" && git push
```

Or in a Claude Code cloud session whose environment allows these hosts (environment menu → Edit →
Network access → Custom): `chozenboutique.co.uk`, `*.chozenboutique.co.uk`, `*.wixstatic.com`,
`*.parastorage.com`, `*.wix.com`. Skip Lighthouse with `--no-lighthouse`.

The script is read-only: it only GETs pages and images. It never logs in, submits a form or touches the basket.

## What it writes

| Path | What |
|---|---|
| `sitemaps.json` | every sitemap in the index (store products, categories, blog posts, blog categories, pages), status, URLs, lastmod |
| `robots.txt` | the live robots file |
| `pages.csv` / `pages.json` | one row per URL: status, X-Robots-Tag, title, meta description, canonical, robots, H1, H1 count, words, images, images without alt, JSON-LD types, horizontal scroll at iPhone 14, indexable, Lighthouse mobile and desktop (perf/a11y/best-practice/SEO), LCP, CLS, page weight |
| `pages/<slug>/desktop.png` | full page at 1440 wide |
| `pages/<slug>/iphone14.png` | full page at iPhone 14 (390×844 @3x, Safari UA) |
| `pages/<slug>/iphone14-first-screen.png` | what a phone sees before scrolling |
| `pages/<slug>/raw.html`, `rendered.html` | server HTML and the DOM after JavaScript |
| `pages/<slug>/copy.md` | headings, visible copy, every image with its alt and size: the source for the port |
| `pages/<slug>/meta.json` | everything extracted: H1–H3, images (natural vs rendered size), links, nav, JSON-LD, OG tags |
| `pages/<slug>/lighthouse-{mobile,desktop}.json` | full Lighthouse reports |
| `pages/home/tokens-*.json` | palette (weighted by painted area), fonts, type scale, @font-face rules, logo: the input to `design-tokens.md` |
| `images/` + `images.json` | every image as the **original upload** (Wix `/v1/fill/...` resize stripped), bytes, which pages use it, its alt texts |

`/blank`, `/blank-3` and `/instagram-bio` are crawled even if nothing links to them.

Tested on 4 Oct 2026 against a local fixture site (sitemap index → child sitemap → pages, lazy image,
JSON-LD): all outputs written, Lighthouse mobile and desktop ran.

## What it cannot do: the Google index check

Google blocks automated `site:` queries. Do these by hand on capture day and paste the results into
`capture/indexed.md`:

1. Google: `site:chozenboutique.co.uk`, then `site:chozenboutique.co.uk/product-page`, `/post`, `/category`, `/blank`.
   Note the result count and every URL on the first five pages of results.
2. Bing: the same queries.
3. Wix dashboard → Marketing & SEO → SEO → Site inspection. Wix connects Google Search Console for
   you; this list of indexed pages is the authoritative one. Export it.
4. If Search Console was connected under your Google account: Indexing → Pages → Export.

What we know without it: on 4 Oct 2026 the web-search tool available here (Bing/Brave-backed) returned
**no pages at all** for `site:chozenboutique.co.uk`, and "ChoZen Boutique" brand searches return a
clothing boutique in Cincinnati. So the Wix site has little or nothing indexed on Bing, which matches
"not launched, no promotion". Google may differ: check.

The 301 map (`redirects/wix-to-shopify.csv`) covers every sitemap URL plus every indexed URL from this list.

## After the capture

Re-run the parts of Phase 1 marked **[pending capture]**: `design-tokens.md` (swap the provisional
palette for the measured one), `baseline-scores.md` (evidence lines), `content/` (her own copy as the source
for the rewrites), the before/after image (`mockup/before-after.png`) and the 301 map.
