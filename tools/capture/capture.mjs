#!/usr/bin/env node
// Capture the live Wix site as the "before" record and the source for the port.
//
//   npm install && npm run capture                      (everything)
//   npm run capture -- --limit 5                        (first five URLs, for a test)
//   npm run capture -- --no-lighthouse                  (skip Lighthouse)
//   npm run capture -- --site https://www.chozenboutique.co.uk
//
// Writes capture/ (see capture/README.md for the layout). Read-only: it only GETs
// pages and images. It never logs in, submits a form or adds to a basket.

import { chromium, devices } from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'capture');
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const SITE = (arg('site', 'https://www.chozenboutique.co.uk')).replace(/\/$/, '');
const LIMIT = Number(arg('limit', '100000'));
const DO_LH = !args.includes('--no-lighthouse');
const HOST = new URL(SITE).host;
const UA_NOTE = 'ChoZen rebuild capture (owner-authorised, read-only)';

const IPHONE14 = { ...devices['iPhone 14'] };
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, userAgent: undefined };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugFor = (u) => {
  const p = new URL(u).pathname.replace(/\/$/, '') || '/home';
  return p.replace(/^\//, '').replace(/[^a-z0-9-_/]/gi, '_').replace(/\//g, '__') || 'home';
};
const norm = (u) => {
  try {
    const x = new URL(u, SITE);
    if (x.host !== HOST) return null;
    x.hash = '';
    // Wix adds tracking and lightbox params; keep only the path for crawl identity.
    return `${x.origin}${x.pathname.replace(/\/$/, '') || '/'}`;
  } catch {
    return null;
  }
};

// Wix image URL -> original upload. static.wixstatic.com/media/<id>~mv2.jpg/v1/fill/w_..../name.jpg
const wixOriginal = (src) => {
  try {
    const u = new URL(src);
    if (!u.host.endsWith('wixstatic.com')) return src;
    const m = u.pathname.match(/^\/media\/([^/]+)/);
    return m ? `https://static.wixstatic.com/media/${m[1]}` : src;
  } catch {
    return src;
  }
};

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'user-agent': UA_NOTE } });
  return { status: r.status, text: await r.text(), headers: Object.fromEntries(r.headers) };
}

async function sitemapUrls() {
  const parser = new XMLParser();
  const seen = new Set();
  const out = [];
  const log = [];
  const queue = [`${SITE}/sitemap.xml`];
  while (queue.length) {
    const sm = queue.shift();
    if (seen.has(sm)) continue;
    seen.add(sm);
    try {
      const { status, text } = await fetchText(sm);
      log.push({ sitemap: sm, status });
      if (status !== 200) continue;
      const x = parser.parse(text);
      const idx = x.sitemapindex?.sitemap;
      if (idx) for (const s of [].concat(idx)) queue.push(s.loc);
      const urls = x.urlset?.url;
      if (urls) for (const u of [].concat(urls)) out.push({ url: u.loc, lastmod: u.lastmod ?? null, sitemap: sm });
    } catch (e) {
      log.push({ sitemap: sm, error: String(e) });
    }
  }
  return { urls: out, log };
}

async function settle(page) {
  // Wix lazy-loads images and sections on scroll; walk the page so everything renders.
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.evaluate(async () => {
    const step = Math.max(300, window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  // Close the Wix cookie banner / promo lightbox if one covers the page.
  for (const sel of ['button:has-text("Accept")', 'button:has-text("Got it")', '[aria-label="close"]', '[data-hook="close-button"]']) {
    const b = page.locator(sel).first();
    if (await b.isVisible().catch(() => false)) await b.click({ timeout: 2000 }).catch(() => {});
  }
  await sleep(500);
}

async function extract(page) {
  return page.evaluate(() => {
    const txt = (el) => (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
    const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.content ?? document.querySelector(`meta[property="${n}"]`)?.content ?? null;
    const headings = [...document.querySelectorAll('h1,h2,h3')].map((h) => ({ tag: h.tagName.toLowerCase(), text: txt(h) })).filter((h) => h.text);
    const imgs = [...document.querySelectorAll('img')].map((i) => ({
      src: i.currentSrc || i.src,
      alt: i.getAttribute('alt'),
      naturalWidth: i.naturalWidth,
      naturalHeight: i.naturalHeight,
      renderedWidth: Math.round(i.getBoundingClientRect().width),
      renderedHeight: Math.round(i.getBoundingClientRect().height),
      loading: i.getAttribute('loading'),
    }));
    const bgImages = [...document.querySelectorAll('*')]
      .map((el) => getComputedStyle(el).backgroundImage)
      .filter((b) => b && b.startsWith('url('))
      .map((b) => b.slice(4, -1).replace(/["']/g, ''));
    const links = [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.href, text: txt(a).slice(0, 120), rel: a.rel || null }));
    const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try { return JSON.parse(s.textContent); } catch { return { _unparsable: s.textContent.slice(0, 500) }; }
    });
    const nav = [...document.querySelectorAll('nav a, header a')].map((a) => ({ text: txt(a), href: a.href })).filter((a) => a.text);
    return {
      title: document.title,
      description: meta('description'),
      robots: meta('robots'),
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      ogTitle: meta('og:title'),
      ogDescription: meta('og:description'),
      ogImage: meta('og:image'),
      lang: document.documentElement.lang,
      viewport: meta('viewport'),
      headings,
      h1Count: headings.filter((h) => h.tag === 'h1').length,
      images: imgs,
      backgroundImages: [...new Set(bgImages)],
      links,
      nav,
      jsonld,
      copy: txt(document.querySelector('main') || document.body),
      wordCount: txt(document.querySelector('main') || document.body).split(' ').length,
      docWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
}

// Palette, fonts and type scale from computed styles, weighted by painted area.
async function tokens(page) {
  return page.evaluate(() => {
    const colors = {};
    const fonts = {};
    const sizes = {};
    const add = (m, k, w) => { if (k) m[k] = (m[k] || 0) + w; };
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      const area = r.width * r.height;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') add(colors, `bg ${cs.backgroundColor}`, area);
      if (hasText) {
        add(colors, `text ${cs.color}`, el.textContent.trim().length);
        add(fonts, `${cs.fontFamily} | ${cs.fontWeight} | ${cs.fontStyle}`, el.textContent.trim().length);
        add(sizes, `${el.tagName.toLowerCase()} ${cs.fontSize}/${cs.lineHeight} ls ${cs.letterSpacing} ${cs.textTransform}`, 1);
      }
      if (cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none') add(colors, `border ${cs.borderTopColor}`, r.width);
    }
    const fontFaces = [...document.styleSheets].flatMap((s) => {
      try { return [...s.cssRules].filter((r) => r.constructor.name === 'CSSFontFaceRule').map((r) => r.cssText.slice(0, 400)); } catch { return []; }
    });
    const top = (m, n) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
    const logo = [...document.querySelectorAll('header img, img[alt*="logo" i]')].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight }));
    return { colors: top(colors, 40), fonts: top(fonts, 20), typeScale: top(sizes, 40), fontFaces, logo };
  });
}

async function lighthouse(url, formFactor) {
  const { default: lh } = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');
  const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
  try {
    const cfg = formFactor === 'desktop'
      ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } }
      : { extends: 'lighthouse:default' };
    const r = await lh(url, { port: chrome.port, output: 'json', logLevel: 'error' }, cfg);
    const c = r.lhr.categories;
    const a = r.lhr.audits;
    return {
      scores: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)])),
      lcp: a['largest-contentful-paint']?.displayValue,
      cls: a['cumulative-layout-shift']?.displayValue,
      tbt: a['total-blocking-time']?.displayValue,
      weight: a['total-byte-weight']?.displayValue,
      json: r.report,
    };
  } finally {
    await chrome.kill();
  }
}

async function download(url, dest) {
  const r = await fetch(url, { headers: { 'user-agent': UA_NOTE } });
  if (!r.ok) return { url, status: r.status };
  const buf = Buffer.from(await r.arrayBuffer());
  await fs.writeFile(dest, buf);
  return { url, status: r.status, bytes: buf.length, type: r.headers.get('content-type') };
}

async function main() {
  await fs.mkdir(path.join(OUT, 'pages'), { recursive: true });
  await fs.mkdir(path.join(OUT, 'images'), { recursive: true });
  const started = new Date().toISOString();

  const sm = await sitemapUrls();
  await fs.writeFile(path.join(OUT, 'sitemaps.json'), JSON.stringify(sm, null, 2));
  for (const extra of ['/robots.txt']) {
    const r = await fetchText(SITE + extra).catch((e) => ({ status: 0, text: String(e) }));
    await fs.writeFile(path.join(OUT, 'robots.txt'), r.text);
  }

  const queue = [SITE + '/', ...sm.urls.map((u) => u.url), `${SITE}/blank`, `${SITE}/blank-3`, `${SITE}/instagram-bio`];
  const seen = new Set();
  const inSitemap = new Set(sm.urls.map((u) => norm(u.url)));
  const rows = [];
  const imageSet = new Map();

  const browser = await chromium.launch();
  const mobileCtx = await browser.newContext({ ...IPHONE14, locale: 'en-GB', timezoneId: 'Europe/London' });
  const deskCtx = await browser.newContext({ ...DESKTOP, locale: 'en-GB', timezoneId: 'Europe/London' });

  while (queue.length && rows.length < LIMIT) {
    const url = norm(queue.shift());
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const slug = slugFor(url);
    const dir = path.join(OUT, 'pages', slug);
    await fs.mkdir(dir, { recursive: true });
    process.stdout.write(`[${rows.length + 1}] ${url}\n`);

    const row = { url, slug, inSitemap: inSitemap.has(url) };
    try {
      const raw = await fetchText(url);
      row.status = raw.status;
      row.xRobotsTag = raw.headers['x-robots-tag'] ?? null;
      await fs.writeFile(path.join(dir, 'raw.html'), raw.text);

      const dp = await deskCtx.newPage();
      const resp = await dp.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      row.finalUrl = dp.url();
      row.renderedStatus = resp?.status();
      await settle(dp);
      const data = await extract(dp);
      await fs.writeFile(path.join(dir, 'rendered.html'), await dp.content());
      await dp.screenshot({ path: path.join(dir, 'desktop.png'), fullPage: true });
      if (rows.length < 3 || url === SITE + '/') await fs.writeFile(path.join(dir, 'tokens-desktop.json'), JSON.stringify(await tokens(dp), null, 2));
      await dp.close();

      const mp = await mobileCtx.newPage();
      await mp.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await settle(mp);
      const mdata = await extract(mp);
      await mp.screenshot({ path: path.join(dir, 'iphone14.png'), fullPage: true });
      await mp.screenshot({ path: path.join(dir, 'iphone14-first-screen.png') });
      if (rows.length < 3 || url === SITE + '/') await fs.writeFile(path.join(dir, 'tokens-mobile.json'), JSON.stringify(await tokens(mp), null, 2));
      await mp.close();

      row.title = data.title;
      row.description = data.description;
      row.canonical = data.canonical;
      row.robots = data.robots;
      row.h1 = data.headings.filter((h) => h.tag === 'h1').map((h) => h.text).join(' | ');
      row.h1Count = data.h1Count;
      row.words = data.wordCount;
      row.images = data.images.length;
      row.imagesNoAlt = data.images.filter((i) => !i.alt || !i.alt.trim()).length;
      row.jsonldTypes = data.jsonld.flatMap((j) => [].concat(j['@graph'] ?? j).map((g) => g['@type'])).join(' ');
      row.mobileHorizontalScroll = mdata.docWidth > mdata.viewportWidth;
      row.indexable = row.status === 200 && !/noindex/i.test(`${data.robots} ${row.xRobotsTag}`) && (!data.canonical || norm(data.canonical) === url);

      await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify({ ...row, desktop: data, mobile: { docWidth: mdata.docWidth, viewportWidth: mdata.viewportWidth, headings: mdata.headings } }, null, 2));
      await fs.writeFile(path.join(dir, 'copy.md'), `# ${data.title}\n\nURL: ${url}\n\nMeta description: ${data.description ?? '(none)'}\n\n## Headings\n\n${data.headings.map((h) => `- ${h.tag}: ${h.text}`).join('\n')}\n\n## Visible copy\n\n${data.copy}\n\n## Images\n\n${data.images.map((i) => `- ${wixOriginal(i.src)}  alt="${i.alt ?? ''}"  ${i.naturalWidth}x${i.naturalHeight}`).join('\n')}\n`);

      for (const i of [...data.images.map((x) => x.src), ...data.backgroundImages]) {
        if (!i || i.startsWith('data:')) continue;
        const o = wixOriginal(i);
        if (!imageSet.has(o)) imageSet.set(o, { original: o, pages: new Set(), alts: new Set() });
        imageSet.get(o).pages.add(url);
      }
      for (const im of data.images) if (im.alt) imageSet.get(wixOriginal(im.src))?.alts.add(im.alt);
      for (const l of data.links) {
        const n = norm(l.href);
        if (n && !seen.has(n)) queue.push(n);
      }

      if (DO_LH) {
        for (const ff of ['mobile', 'desktop']) {
          try {
            const r = await lighthouse(url, ff);
            row[`lh_${ff}`] = `${r.scores.performance}/${r.scores.accessibility}/${r.scores['best-practices']}/${r.scores.seo}`;
            row[`lh_${ff}_lcp`] = r.lcp;
            row[`lh_${ff}_cls`] = r.cls;
            row[`lh_${ff}_weight`] = r.weight;
            await fs.writeFile(path.join(dir, `lighthouse-${ff}.json`), r.json);
          } catch (e) {
            row[`lh_${ff}`] = `error: ${String(e).slice(0, 80)}`;
          }
        }
      }
    } catch (e) {
      row.error = String(e).slice(0, 300);
    }
    rows.push(row);
  }
  await browser.close();

  // Images: originals, with sizes.
  const imgRows = [];
  let n = 0;
  for (const [orig, info] of imageSet) {
    n += 1;
    const base = orig.split('/').pop().split('?')[0].replace(/[^a-z0-9._~-]/gi, '_') || `image-${n}`;
    const r = await download(orig, path.join(OUT, 'images', base)).catch((e) => ({ url: orig, error: String(e) }));
    imgRows.push({ file: base, ...r, pages: [...info.pages], alts: [...info.alts] });
  }
  await fs.writeFile(path.join(OUT, 'images.json'), JSON.stringify(imgRows, null, 2));

  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? '')).join(','))].join('\n');
  await fs.writeFile(path.join(OUT, 'pages.csv'), csv);
  await fs.writeFile(path.join(OUT, 'pages.json'), JSON.stringify(rows, null, 2));
  await fs.writeFile(path.join(OUT, 'run.json'), JSON.stringify({ site: SITE, started, finished: new Date().toISOString(), pages: rows.length, images: imgRows.length, sitemapUrls: sm.urls.length }, null, 2));
  console.log(`\nDone: ${rows.length} pages, ${imgRows.length} images -> capture/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
