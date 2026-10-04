#!/usr/bin/env node
// ChoZen quality gate. Runs against the SERVED preview (HTTP), never the source files alone.
//   npm run gate                       preview mode: placeholders warn
//   npm run gate -- --launch           launch mode: placeholders, sample products and "to confirm" fail
//   npm run gate -- --base https://…   check another server (e.g. the shopify theme dev URL)
//   --skip-lighthouse  --skip-browser  --sign-off (record the homepage freeze baseline)
// Writes _gate/out/report.json and _gate/out/report.md. Exit code 1 if anything fails.
process.env.TZ = 'Europe/London';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { parseHTML } from 'linkedom';
import { createRenderer } from '../tools/preview/render.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, '_gate/out');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const LAUNCH = has('--launch');
const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, '_gate/copy-lint-rules.json'), 'utf8'));
const findings = [];
const add = (check, level, url, msg) => findings.push({ check, level, url, msg: String(msg).slice(0, 300) });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Serve ----------
let BASE = args.includes('--base') ? args[args.indexOf('--base') + 1].replace(/\/$/, '') : null;
let server;
if (!BASE) {
  const port = 4391;
  server = spawn(process.execPath, [path.join(ROOT, 'tools/preview/server.mjs'), '--port', String(port), ...(LAUNCH ? ['--launch'] : [])], { stdio: 'ignore' });
  BASE = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 50; i += 1) { try { await fetch(BASE + '/assets/base.css'); break; } catch { await sleep(200); } }
}
const renderer = createRenderer();
const URLS = renderer.urls();
const get = async (u) => { const r = await fetch(BASE + u, { redirect: 'manual' }); return { status: r.status, html: await r.text() }; };

// ---------- Helpers ----------
const strip = (s) => s.replace(/\s+/g, ' ').trim();
const visibleText = (doc) => {
  const main = doc.querySelector('main');
  if (!main) return '';
  const clone = main.cloneNode(true);
  for (const sel of [...RULES.scope.excludeSelectors, 'svg']) clone.querySelectorAll(sel).forEach((n) => n.remove());
  // keep block boundaries so sentences don't run together
  clone.querySelectorAll('p,li,h1,h2,h3,h4,td,th,summary,dt,dd,label,button,a.btn,figcaption,blockquote').forEach((n) => n.append('. '));
  return strip(clone.textContent).replace(/(\.\s*){2,}/g, '. ').replace(/\s+\./g, '.');
};
const sentences = (t) => t.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter((s) => s.split(' ').length >= 3);
const exceptStrip = (t) => RULES.exceptions.strip.reduce((acc, s) => acc.split(s).join(' '), t);
const wl = (url) => RULES.exceptions.pathRuleWhitelist[url.replace(/\/$/, '')] || [];
const isArea = (url) => /^\/pages\/(flower|balloon)-delivery-/.test(url);
const SUFFIX_LOCAL = /^\/pages\/(flower|balloon)-delivery|^\/pages\/delivery|^\/collections\/(same-day|balloon|birthday|anniversary|new-baby|thank-you|get-well|sympathy|mothers|valentines)/;

// ---------- Per-page checks ----------
const pages = [];
const linkTargets = new Map();
for (const url of URLS) {
  const { status, html } = await get(url);
  if (url === '/404-check') { if (status !== 404) add('status', 'fail', url, `unknown URL returned ${status}, expected 404`); continue; }
  if (status !== 200) { add('status', 'fail', url, `HTTP ${status}`); continue; }
  const { document: doc } = parseHTML(html);
  const title = strip(doc.querySelector('title')?.textContent || '');
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const text = visibleText(doc);
  const alts = [...doc.querySelectorAll('main img')].map((i) => i.getAttribute('alt') || '').join(' ');
  const scan = exceptStrip(`${title} . ${desc} . ${text} . ${alts}`);
  const isSample = url.startsWith('/products/sample-');
  pages.push({ url, title, desc, text, doc, html });

  // Copy lint families
  for (const [fam, list] of Object.entries(RULES.bannedPhrases)) {
    for (const r of list) {
      const target = r.scope === 'html' ? html : scan;
      const re = new RegExp(r.pattern, r.caseSensitive ? 'g' : `g${r.flags?.includes('i') ? 'i' : ''}`);
      const hits = [...target.matchAll(re)].map((m) => m[0]);
      if (hits.length) add(`copy:${r.id}`, r.level || 'fail', url, `${[...new Set(hits)].slice(0, 4).join(', ')}: ${r.reason}`);
    }
  }
  // Health claims: visible text, title, meta, alts and JSON-LD.
  const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(' ');
  for (const p of RULES.healthClaims.patterns) {
    const re = new RegExp(p, 'gi');
    const hits = [...exceptStrip(`${scan} ${ld}`).matchAll(re)].map((m) => m[0]);
    if (!hits.length) continue;
    const group = /pain|ach|headache|migraine/.test(p) ? 'pain' : /asthma|arthritis|diabetes/.test(p) ? 'conditions' : /medical/.test(p) ? 'medical' : 'any';
    if (wl(url).includes(`health-claims:${group}`)) continue;
    add('health-claims', 'fail', url, `"${[...new Set(hits)].slice(0, 3).join('", "')}" matches ${p}`);
  }
  // Placeholders and samples.
  const ph = [...(text + ' ' + title + ' ' + desc).matchAll(new RegExp(RULES.placeholders.pattern, 'g'))].map((m) => m[0]);
  const tbc = doc.querySelectorAll('main .tbc, footer .tbc').length;
  if (ph.length || tbc) add('placeholders', LAUNCH ? 'fail' : 'warn', url, `${ph.length + tbc} unconfirmed: ${[...new Set(ph)].slice(0, 5).join(' ')}${tbc ? ` +${tbc} marked` : ''}`);
  if (isSample) add('placeholders', LAUNCH ? 'fail' : 'info', url, 'sample product (not for sale) must not exist at launch');

  // Em dashes, repetition, prose rules.
  const dashes = (text.replace(/£—/g, '').match(/—/g) || []).length;
  if (dashes > RULES.emDashMax) add('copy:em-dash', 'warn', url, `${dashes} em dashes (max ${RULES.emDashMax})`);
  const counts = {};
  for (const s of sentences(text)) if (s.split(' ').length >= RULES.repetition.minWords) counts[s] = (counts[s] || 0) + 1;
  for (const [s, n] of Object.entries(counts)) if (n > RULES.repetition.maxPerPage) add('copy:repetition', 'fail', url, `${n}× "${s.slice(0, 80)}"`);
  for (const r of RULES.proseRules) for (const s of sentences(text)) if (new RegExp(r.pattern).test(s)) add(`copy:${r.id}`, r.level, url, `${r.why} "${s.slice(0, 90)}"`);

  // Headings.
  const h1s = [...doc.querySelectorAll('h1')];
  if (h1s.length !== 1) add('headings', 'fail', url, `${h1s.length} H1s`);
  for (const h of doc.querySelectorAll('main h2, main h3')) {
    if (h.closest('.card, .tile, .blog-card')) continue; // product and article names, not page headings
    const t = strip(h.textContent);
    if (!t) { add('headings', 'fail', url, 'empty heading'); continue; }
    for (const r of RULES.headingRules.fail) if (new RegExp(r.pattern, r.flags || '').test(t)) add(`heading:${r.id}`, 'fail', url, `"${t}": ${r.reason}`);
    if (t.split(' ').length > RULES.headingRules.maxWords) add('heading:length', 'warn', url, `"${t}" is ${t.split(' ').length} words`);
    if (h.tagName === 'H2' && !t.endsWith('?') && !RULES.headingRules.approvedLabels.includes(t) && !h.closest('.card, .tile, .blog-card, footer, .ftr')) add('heading:question', 'info', url, `H2 not a question: "${t}"`);
  }
  // Lede.
  if (!RULES.ledeRules.exempt.includes(url)) {
    const lede = strip(doc.querySelector('.pg-head .lede, .hero .lede')?.textContent || '');
    if (!lede && /^\/(pages|collections|blogs)\//.test(url) && !url.startsWith('/blogs/journal') && url !== '/collections/all') add('lede', 'warn', url, 'no opening answer paragraph');
    if (lede) {
      const ws = lede.split(' ').length; const ss = sentences(lede).length;
      if (ws > RULES.ledeRules.maxWords) add('lede', 'fail', url, `${ws} words (max ${RULES.ledeRules.maxWords})`);
      if (ss > RULES.ledeRules.maxSentences) add('lede', 'fail', url, `${ss} sentences (max ${RULES.ledeRules.maxSentences})`);
      if (/^\d/.test(lede)) add('lede', 'fail', url, 'starts with a numeral');
    }
  }
  // Meta.
  if (!title) add('meta', 'fail', url, 'no <title>');
  if (title.length > 70) add('meta', 'warn', url, `title ${title.length} chars`);
  if (!desc && !/\/(cart|search)$/.test(url) && !isSample) add('meta', 'warn', url, 'no meta description');
  if (desc && (desc.length < 70 || desc.length > 165)) add('meta', 'warn', url, `meta description ${desc.length} chars`);
  if (SUFFIX_LOCAL.test(url) && !/Enfield|London|EN\d|N\d{1,2}\b/.test(title)) add('meta', 'fail', url, `local page title has no place: "${title}"`);
  if (!doc.querySelector('link[rel="canonical"]')) add('meta', 'fail', url, 'no canonical');

  // Schema.
  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
    let j;
    try { j = JSON.parse(s.textContent); } catch (e) { add('schema', 'fail', url, `JSON-LD does not parse: ${e.message}`); continue; }
    const nodes = [].concat(j['@graph'] || j);
    for (const n of nodes) {
      const type = n['@type'];
      const req = { Florist: ['name', 'url', 'address', 'telephone'], Organization: ['name', 'url'], WebSite: ['name', 'url'], Product: ['name', 'offers'], BreadcrumbList: ['itemListElement'], FAQPage: ['mainEntity'], Article: ['headline', 'datePublished', 'author'] }[type] || [];
      for (const k of req) if (n[k] == null || (Array.isArray(n[k]) && !n[k].length)) add('schema', 'fail', url, `${type} missing ${k}`);
      if (n.aggregateRating && !(n.aggregateRating.reviewCount > 0)) add('schema', 'fail', url, 'aggregateRating without real reviews');
      if (JSON.stringify(n).match(/\[(to confirm|FEE|PRICE|ADDRESS|LEGAL NAME)/)) add('schema', 'fail', url, `${type} contains a placeholder`);
      if (type === 'Florist' && !(url === '/' || /^\/pages\/(contact|delivery|flower-delivery|balloon-delivery)/.test(url))) add('schema', 'fail', url, 'Florist block on a page that is not home/contact/delivery/area');
      if (type === 'FAQPage') for (const q of n.mainEntity || []) if (!text.includes(q.name)) add('schema', 'fail', url, `FAQ question not visible: "${q.name}"`);
      if (type === 'BreadcrumbList') {
        const crumbs = [...doc.querySelectorAll('.crumbs li')].map((li) => strip(li.textContent));
        const names = (n.itemListElement || []).map((i) => i.name);
        if (crumbs.length && names.join('|') !== crumbs.join('|')) add('schema', 'fail', url, `breadcrumb JSON (${names.join(' > ')}) ≠ visible (${crumbs.join(' > ')})`);
      }
      if (type === 'Florist' && n.telephone && !html.includes(n.telephone.replace('+44', '0').replace(/(\d{5})(\d{6})/, '$1 $2')) && !html.includes(n.telephone)) add('schema', 'warn', url, 'Florist telephone not visible on page');
    }
  }
  // Images.
  for (const img of doc.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) add('images', 'fail', url, `img without alt: ${img.getAttribute('src')}`);
    else if ((img.getAttribute('alt') || '').length > 125) add('images', 'warn', url, `alt over 125 chars`);
  }
  for (const ph of doc.querySelectorAll('main .ph')) if (!ph.getAttribute('data-label')) add('images', 'fail', url, 'placeholder art without a visible label');
  // Links (collected; checked once below).
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const pth = href.split('#')[0].split('?')[0];
    if (!pth) continue;
    if (!linkTargets.has(pth)) linkTargets.set(pth, new Set());
    linkTargets.get(pth).add(url);
  }
}

// ---------- Cross-page ----------
for (const [pth, from] of linkTargets) {
  const { status } = await get(pth);
  if (status !== 200) add('links', 'fail', [...from][0], `broken link to ${pth} (HTTP ${status}) from ${from.size} page(s)`);
}
const dupe = (key) => { const m = {}; for (const p of pages) if (p[key]) (m[p[key]] ||= []).push(p.url); for (const [v, us] of Object.entries(m)) if (us.length > 1 && !us.every((u) => u.startsWith('/products/sample-'))) add('meta', 'fail', us[0], `duplicate ${key} on ${us.join(', ')}: "${v.slice(0, 80)}"`); };
dupe('title'); dupe('desc');
// Area pages: no shared sentences of 6+ words.
const areaSents = {};
for (const p of pages.filter((x) => isArea(x.url))) {
  const main = p.doc.querySelector('.rte');
  const t = main ? strip(main.textContent) : '';
  for (const s of new Set(sentences(t))) if (s.split(' ').length >= RULES.areaSimilarity.minWords) (areaSents[s] ||= []).push(p.url);
}
for (const [s, us] of Object.entries(areaSents)) if (us.length > 1) add('similarity', 'fail', us[0], `same sentence on ${us.length} area pages: "${s.slice(0, 90)}"`);
// Coverage: every target page in target-queries.md exists.
const tq = fs.readFileSync(path.join(ROOT, 'target-queries.md'), 'utf8');
for (const m of new Set([...tq.matchAll(/`(\/(?:pages|collections|blogs)\/[a-z0-9-/]+)`/g)].map((x) => x[1]))) {
  if (m.includes('<')) continue;
  const { status } = await get(m);
  if (status !== 200) add('coverage', 'fail', m, `target page from target-queries.md returns ${status}`);
}
// Paused delivery renders the pause message and no countdown (in-process render with the setting on).
{
  const r = createRenderer({ settings: { same_day_paused: true } });
  const { html } = await r.render('/');
  if (!html.includes(r.settings.paused_message) || /data-cutoff="[a-z]+" data-time/.test(html)) add('cutoff', 'fail', '/', 'pause setting does not replace the countdown');
}

// ---------- Theme source checks ----------
const themeFiles = (d) => fs.readdirSync(path.join(ROOT, 'theme', d)).map((f) => path.join('theme', d, f));
for (const f of [...themeFiles('assets').filter((f) => f.endsWith('.css') || f.endsWith('.js')), ...themeFiles('sections'), ...themeFiles('snippets')]) {
  if (f.endsWith('tokens.css')) continue;
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const hex = src.match(/#[0-9a-fA-F]{3,8}\b(?![\w-])/g)?.filter((h) => !/^#(i|s)-/.test(h)) || [];
  const real = hex.filter((h) => /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(h));
  if (real.length) add('tokens', 'fail', f, `raw colours outside tokens.css: ${[...new Set(real)].join(' ')}`);
  if (/rgba?\(\s*\d/.test(src)) add('tokens', 'fail', f, 'raw rgb() colour outside tokens.css');
}
const css = fs.readFileSync(path.join(ROOT, 'theme/assets/base.css'), 'utf8');
if (!css.includes('prefers-reduced-motion')) add('motion', 'fail', 'theme/assets/base.css', 'no prefers-reduced-motion rule');
if (!css.includes('safe-area-inset')) add('mobile', 'fail', 'theme/assets/base.css', 'no safe-area insets');
try {
  const raw = execFileSync(path.join(ROOT, 'node_modules/.bin/shopify'), ['theme', 'check', '--path', path.join(ROOT, 'theme'), '--output', 'json'], { env: { ...process.env, SHOPIFY_CLI_NO_ANALYTICS: '1' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const res = JSON.parse(raw.slice(raw.indexOf('[')));
  for (const f of res) for (const o of f.offenses) add('theme-check', o.severity === 0 || o.severity === 'error' ? 'fail' : 'warn', path.relative(ROOT, f.path), `${o.check}: ${o.message}`);
} catch (e) {
  const out = String(e.stdout || '');
  if (out.includes('[')) { try { const res = JSON.parse(out.slice(out.indexOf('['))); for (const f of res) for (const o of f.offenses) add('theme-check', 'fail', path.relative(ROOT, f.path), `${o.check}: ${o.message}`); } catch { add('theme-check', 'warn', 'theme', 'could not parse theme check output'); } }
  else add('theme-check', 'warn', 'theme', `theme check did not run: ${String(e.message).slice(0, 120)}`);
}

// ---------- Browser checks ----------
if (!has('--skip-browser')) {
  const { chromium, webkit, devices } = await import('@playwright/test');
  const BROWSER_URLS = ['/', '/collections/same-day-flowers', '/collections/sympathy-flowers', '/products/sample-seasonal-hand-tied-bouquet', '/products/sample-crystal-cluster', '/pages/flower-delivery-winchmore-hill', '/pages/delivery', '/pages/contact', '/pages/floral-hire', '/blogs/guides/what-to-write-in-a-card', '/blogs/guides', '/policies/refund-policy', '/cart', '/search', '/no-such-page'];
  const DEVICES = [['iPhone SE', 'iphone-se'], ['iPhone 14', 'iphone-14'], ['iPhone 14 Pro Max', 'iphone-14-pro-max']];
  const engines = [];
  for (const [name, e] of [['chromium', chromium], ['webkit', webkit]]) { try { engines.push([name, await e.launch()]); } catch { add('mobile', 'warn', '-', `${name} not installed here: run the gate on a machine with it (npx playwright install ${name})`); } }
  for (const [ename, browser] of engines) {
    for (const [dname, slug] of DEVICES) {
      const d = { ...devices[dname] }; if (ename === 'chromium') delete d.defaultBrowserType;
      const ctx = await browser.newContext({ ...d, locale: 'en-GB', timezoneId: 'Europe/London' });
      for (const u of BROWSER_URLS) {
        const p = await ctx.newPage();
        await p.goto(BASE + u, { waitUntil: 'networkidle' });
        const m = await p.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const sw = document.documentElement.scrollWidth;
          const smallInputs = [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea')].filter((i) => i.offsetParent && parseFloat(getComputedStyle(i).fontSize) < 16).map((i) => i.id || i.name);
          const targets = [...document.querySelectorAll('a[href], button, summary, input[type=checkbox], select')].filter((el) => {
            if (!el.offsetParent || el.closest('.rte, .lede, .crumbs li:last-child, .pc__out, .note, .warn, .card__t, p') || el.classList.contains('skip')) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.height < 24 || r.width < 24);
          }).map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`);
          return { vw, sw, smallInputs, targets };
        });
        if (m.sw > m.vw) add('mobile', 'fail', u, `${ename} ${slug}: horizontal scroll (${m.sw} > ${m.vw})`);
        if (m.smallInputs.length) add('mobile', 'fail', u, `${ename} ${slug}: inputs under 16px: ${m.smallInputs.join(', ')}`);
        if (m.targets.length) add('mobile', 'fail', u, `${ename} ${slug}: tap targets under 24px: ${m.targets.slice(0, 4).join('; ')}`);
        await p.close();
      }
      await ctx.close();
    }
  }
  const browser = engines.find(([n]) => n === 'chromium')?.[1] || engines[0]?.[1];
  if (browser) {
    const d = { ...devices['iPhone 14'] }; delete d.defaultBrowserType;
    // Accessibility (axe).
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    const actx = await browser.newContext({ ...d, locale: 'en-GB' });
    for (const u of BROWSER_URLS) {
      const p = await actx.newPage();
      await p.goto(BASE + u, { waitUntil: 'networkidle' });
      const r = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      for (const v of r.violations) add('a11y', ['serious', 'critical'].includes(v.impact) ? 'fail' : 'warn', u, `${v.id} (${v.impact}): ${v.nodes.length} node(s), ${v.nodes[0]?.target?.join(' ')}`);
      await p.close();
    }
    // Reduced motion.
    const rm = await browser.newContext({ ...d, reducedMotion: 'reduce' });
    { const p = await rm.newPage(); await p.goto(BASE + '/'); const td = await p.evaluate(() => getComputedStyle(document.querySelector('.btn')).transitionDuration); if (td !== '0s') add('motion', 'fail', '/', `transitions still run under reduced motion (${td})`); }
    await rm.close();
    // Cut-off: fake the London clock and read what the page claims.
    const cases = [
      ['2026-10-06T09:30:00+01:00', /Order in the next 30 min/, 'Tue 09:30'],
      ['2026-10-06T08:15:00+01:00', /Order in the next 1h 45m/, 'Tue 08:15'],
      ['2026-10-06T10:01:00+01:00', /Order now.*tomorrow/, 'Tue 10:01'],
      ['2026-10-10T11:00:00+01:00', /Order now.*on Monday/, 'Sat 11:00'],
      ['2026-10-10T09:00:00+01:00', /Order in the next 1h 0m/, 'Sat 09:00'],
      ['2026-10-11T09:00:00+01:00', /Order now.*tomorrow/, 'Sun 09:00 (no Sunday delivery)'],
      ['2026-12-01T09:59:00+00:00', /Order in the next 1 min/, 'Tue 09:59 GMT (winter)'],
    ];
    for (const [iso, re, label] of cases) {
      const c = await browser.newContext({ ...d, timezoneId: 'America/New_York' }); // visitor's clock zone must not matter
      const p = await c.newPage();
      await p.clock.setFixedTime(new Date(iso));
      await p.goto(BASE + '/');
      const strip2 = await p.textContent('[data-cutoff="strip"]');
      if (!re.test(strip2 || '')) add('cutoff', 'fail', '/', `${label}: shows "${strip2}", expected ${re}`);
      if (label.startsWith('Tue 10:01') && /next/.test(await p.textContent('#mbar'))) add('cutoff', 'fail', '/', 'countdown still shown after the cut-off');
      await c.close();
    }
    // Postcode checker.
    const pc = await browser.newContext({ ...d });
    {
      const p = await pc.newPage(); await p.clock.setFixedTime(new Date('2026-10-06T09:00:00+01:00')); await p.goto(BASE + '/');
      for (const [code, re] of [['EN2 6AB', /Yes, we deliver to EN2 today/], ['n21 1aa', /Yes, we deliver to N21/], ['SW1A 1AA', /can't hand-deliver to SW1A/], ['', /Type your postcode/]]) {
        await p.fill('#pc-hero', code); await p.click('#pc-hero ~ button, .pc__row button');
        const t = await p.textContent('.pc__out');
        if (!re.test(t || '')) add('postcode', 'fail', '/', `"${code}" → "${t}", expected ${re}`);
      }
    }
    await pc.close();
    // Freeze: the signed-off homepage must not change.
    const fz = path.join(ROOT, '_gate/freeze');
    fs.mkdirSync(fz, { recursive: true });
    const { PNG } = await import('pngjs');
    const { default: pixelmatch } = await import('pixelmatch');
    for (const [name, opts] of [['home-iphone-14', { ...d }], ['home-desktop', { viewport: { width: 1440, height: 900 } }]]) {
      const c = await browser.newContext({ ...opts, locale: 'en-GB', timezoneId: 'Europe/London', reducedMotion: 'reduce' });
      const p = await c.newPage(); await p.clock.setFixedTime(new Date('2026-10-06T08:00:00+01:00'));
      await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
      const shot = await p.screenshot({ fullPage: true });
      const file = path.join(fz, `${name}.png`);
      fs.writeFileSync(path.join(OUT, `${name}.png`), shot);
      if (has('--sign-off')) { fs.writeFileSync(file, shot); add('freeze', 'info', '/', `${name}: baseline recorded (signed off ${new Date().toISOString().slice(0, 10)})`); }
      else if (!fs.existsSync(file)) add('freeze', 'warn', '/', `${name}: no signed-off baseline yet (run with --sign-off once Dilz approves the homepage)`);
      else {
        const a = PNG.sync.read(fs.readFileSync(file)); const b = PNG.sync.read(shot);
        if (a.width !== b.width || a.height !== b.height) add('freeze', 'fail', '/', `${name}: size changed ${a.width}×${a.height} → ${b.width}×${b.height}`);
        else { const diff = new PNG({ width: a.width, height: a.height }); const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 }); if (n > 50) { fs.writeFileSync(path.join(OUT, `${name}-diff.png`), PNG.sync.write(diff)); add('freeze', 'fail', '/', `${name}: ${n} pixels differ from the signed-off homepage (see _gate/out/${name}-diff.png)`); } }
      }
      await c.close();
    }
  }
  for (const [, b] of engines) await b.close();
}

// ---------- Lighthouse ----------
if (!has('--skip-lighthouse')) {
  const { default: lighthouse } = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');
  const { chromium } = await import('@playwright/test');
  const LH = ['/', '/collections/same-day-flowers', '/products/sample-seasonal-hand-tied-bouquet', '/pages/flower-delivery-winchmore-hill', '/blogs/guides/how-to-make-flowers-last'];
  const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
  const lh = {};
  for (const u of LH) {
    // Median of three runs (Shopify's guidance; single runs vary a lot on a cold server).
    const runs = [];
    for (let i = 0; i < 3; i += 1) runs.push(await lighthouse(BASE + u, { port: chrome.port, output: 'json', logLevel: 'error' }));
    runs.sort((x, y) => x.lhr.categories.performance.score - y.lhr.categories.performance.score);
    const r = runs[1];
    const c = r.lhr.categories;
    const s = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]));
    lh[u] = { ...s, lcp: r.lhr.audits['largest-contentful-paint'].displayValue, cls: r.lhr.audits['cumulative-layout-shift'].displayValue, tbt: r.lhr.audits['total-blocking-time'].displayValue };
    if (s.performance < 90) add('lighthouse', 'fail', u, `performance ${s.performance} < 90`);
    if (s.accessibility < 100) add('lighthouse', 'fail', u, `accessibility ${s.accessibility} < 100: ${Object.values(r.lhr.audits).filter((a) => a.score === 0 && r.lhr.categories.accessibility.auditRefs.some((x) => x.id === a.id)).map((a) => a.id).join(', ')}`);
    if (s['best-practices'] < 100) add('lighthouse', 'fail', u, `best practices ${s['best-practices']} < 100: ${Object.values(r.lhr.audits).filter((a) => a.score === 0 && r.lhr.categories['best-practices'].auditRefs.some((x) => x.id === a.id)).map((a) => a.id).join(', ')}`);
    if (s.seo < 100) add('lighthouse', 'fail', u, `SEO ${s.seo} < 100: ${Object.values(r.lhr.audits).filter((a) => a.score === 0 && r.lhr.categories.seo.auditRefs.some((x) => x.id === a.id)).map((a) => a.id).join(', ')}`);
  }
  await chrome.kill();
  fs.writeFileSync(path.join(OUT, 'lighthouse.json'), JSON.stringify(lh, null, 2));
  add('lighthouse', 'info', '-', Object.entries(lh).map(([u, s]) => `${u} ${s.performance}/${s.accessibility}/${s['best-practices']}/${s.seo} LCP ${s.lcp}`).join(' · '));
}

// ---------- Report ----------
server?.kill();
const by = (lvl) => findings.filter((f) => f.level === lvl);
const summary = { date: new Date().toISOString(), mode: LAUNCH ? 'launch' : 'preview', base: BASE, pages: pages.length, fail: by('fail').length, warn: by('warn').length, info: by('info').length };
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ summary, findings }, null, 2));
const group = (lvl) => { const m = {}; for (const f of by(lvl)) (m[f.check] ||= []).push(f); return m; };
let md = `# Gate report (${summary.mode} mode)\n\n${summary.date} · ${summary.pages} pages served from ${BASE}\n\n**${summary.fail} fail · ${summary.warn} warn · ${summary.info} info**\n`;
for (const lvl of ['fail', 'warn', 'info']) {
  const g = group(lvl);
  if (!Object.keys(g).length) continue;
  md += `\n## ${lvl.toUpperCase()}\n`;
  for (const [check, fs2] of Object.entries(g)) { md += `\n### ${check} (${fs2.length})\n`; for (const f of fs2.slice(0, 40)) md += `- \`${f.url}\` ${f.msg}\n`; if (fs2.length > 40) md += `- …and ${fs2.length - 40} more\n`; }
}
fs.writeFileSync(path.join(OUT, 'report.md'), md);
console.log(`gate (${summary.mode}): ${summary.fail} fail, ${summary.warn} warn, ${summary.info} info → _gate/out/report.md`);
process.exit(summary.fail ? 1 : 0);
