#!/usr/bin/env node
// Builds redirects/wix-to-shopify.csv (Shopify URL-redirect import format) from the Wix capture.
//   node tools/redirects/build.mjs
// Inputs: capture/sitemaps.json (every sitemap URL), capture/indexed.md (URLs seen in Google/Bing, one per line,
// any line containing chozenboutique.co.uk), redirects/rules.json. Writes the CSV and redirects/unmapped.txt.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rules = JSON.parse(await fs.readFile(path.join(root, 'redirects/rules.json'), 'utf8'));
const read = (p) => fs.readFile(path.join(root, p), 'utf8').catch(() => null);

const urls = new Set(Object.keys(rules.exact));
const sm = await read('capture/sitemaps.json');
if (sm) for (const u of JSON.parse(sm).urls) urls.add(new URL(u.url).pathname.replace(/\/$/, '') || '/');
const idx = await read('capture/indexed.md');
if (idx) for (const m of idx.matchAll(/https?:\/\/(?:www\.)?chozenboutique\.co\.uk(\/[^\s)|>"]*)?/g)) urls.add((m[1] || '/').replace(/\/$/, '') || '/');

// Known new URLs, from content/ front matter.
const known = new Set(['/', '/collections/all', '/policies/refund-policy', '/policies/privacy-policy', '/policies/terms-of-service', '/policies/shipping-policy', '/blogs/journal', '/blogs/guides']);
for (const dir of ['content', 'content/pages', 'content/collections', 'content/guides', 'content/journal', 'content/legal']) {
  for (const f of await fs.readdir(path.join(root, dir)).catch(() => [])) {
    if (!f.endsWith('.md')) continue;
    const m = (await read(path.join(dir, f)))?.match(/^url:\s*(\S+)/m);
    if (m) known.add(m[1]);
  }
}

const rows = [];
const unmapped = [];
for (const from of [...urls].sort()) {
  let to = rules.exact[from];
  if (to === null || from === '/') continue;
  if (to === undefined) {
    // Most specific pattern wins: patterns are listed general-first, so take the last match.
    for (const p of rules.patterns) { const re = new RegExp(p.match, 'i'); if (re.test(from)) to = from.replace(re, p.to); }
  }
  if (!to) { unmapped.push(from); continue; }
  if (to.startsWith('/collections/') && !known.has(to) && to !== '/collections/all') to = '/collections/all';
  if (to.startsWith('/blogs/journal/') && !to.includes('/tagged/') && !known.has(to) && !idx && !sm) continue;
  if (to === from) continue;
  rows.push([from, to]);
}
await fs.writeFile(path.join(root, 'redirects/wix-to-shopify.csv'), ['Redirect from,Redirect to', ...rows.map((r) => r.join(','))].join('\n') + '\n');
await fs.writeFile(path.join(root, 'redirects/unmapped.txt'), unmapped.join('\n') + (unmapped.length ? '\n' : ''));
const missing = rows.filter(([, t]) => !known.has(t.split('?')[0]) && !t.includes('/tagged/'));
console.log(`${rows.length} redirects, ${unmapped.length} unmapped, ${missing.length} targets not yet in content/ (${sm ? 'with' : 'WITHOUT'} capture)`);
for (const [f, t] of missing) console.log(`  target missing: ${f} -> ${t}`);
