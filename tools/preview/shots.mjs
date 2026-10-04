// Screenshot a list of preview URLs at phone and desktop width. node tools/preview/shots.mjs [base] [out] [url...]
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';
const [base = 'http://127.0.0.1:4380', out = '_gate/out/shots', ...urls] = process.argv.slice(2);
const list = urls.length ? urls : ['/', '/collections/same-day-flowers', '/products/sample-seasonal-hand-tied-bouquet', '/products/sample-crystal-cluster', '/pages/flower-delivery-winchmore-hill', '/pages/about', '/pages/contact', '/blogs/guides/rose-quartz-meaning', '/policies/refund-policy', '/cart', '/nope'];
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const d = { ...devices['iPhone 14'] }; delete d.defaultBrowserType;
const ctx = await b.newContext({ ...d, locale: 'en-GB', timezoneId: 'Europe/London' });
const dctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-GB', timezoneId: 'Europe/London' });
for (const u of list) {
  const slug = u === '/' ? 'home' : u.replace(/^\//, '').replace(/\//g, '_');
  for (const [name, c] of [['m', ctx], ['d', dctx]]) {
    const p = await c.newPage();
    await p.goto(base + u, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${out}/${slug}-${name}.png`, fullPage: name === 'm' });
    await p.close();
  }
}
await b.close();
console.log(`shots in ${out}`);
