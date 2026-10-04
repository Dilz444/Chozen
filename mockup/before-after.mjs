// Side-by-side before/after: Wix homepage (from capture/) vs the mockup, at iPhone 14 and desktop.
//   node mockup/before-after.mjs
// Uses capture/pages/home/iphone14-first-screen.png and desktop.png when the capture has run.
// Until then the "before" panel says the capture is pending rather than faking a screenshot.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const exists = (p) => fs.access(p).then(() => true, () => false);
const b64 = async (p) => `data:image/png;base64,${(await fs.readFile(p)).toString('base64')}`;

const beforeMobile = path.join(root, 'capture/pages/home/iphone14-first-screen.png');
const beforeDesk = path.join(root, 'capture/pages/home/desktop.png');
const afterMobile = path.join(here, 'shots/iphone-14-first-screen.png');
const afterDesk = path.join(here, 'shots/desktop-first-screen.png');
const haveBefore = await exists(beforeMobile);

const pending = `<div class="pending"><strong>Before: the Wix homepage</strong>
<p>Screenshot pending. The live site at chozenboutique.co.uk is blocked from the environment this was built in.
Run <code>npm run capture</code> and then <code>node mockup/before-after.mjs</code> to fill this panel.</p>
<p>What the brief already says about it: desktop-only (no mobile layout), placeholder products ("Flower 2" £100, "Bouquet 1" £80),
"Claims Payment" in the main menu, stray /blank pages.</p></div>`;

const panel = async (label, mob, desk, isBefore) => `
<section><h2>${label}</h2>
<div class="pair">
  <figure class="m">${isBefore && !haveBefore ? pending : `<img src="${await b64(mob)}">`}<figcaption>iPhone 14</figcaption></figure>
  <figure class="d">${isBefore && !haveBefore ? '' : `<img src="${await b64(desk)}">`}<figcaption>${isBefore && !haveBefore ? '' : 'Desktop 1440'}</figcaption></figure>
</div></section>`;

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Jost;src:url(${pathToFileURL(path.join(here, 'fonts/jost-latin-400-normal.woff2')).href})}
@font-face{font-family:Corm;src:url(${pathToFileURL(path.join(here, 'fonts/cormorant-garamond-latin-500-normal.woff2')).href})}
body{margin:0;background:#EDE6DF;font-family:Jost,sans-serif;color:#2A2225;padding:40px;width:2320px}
h1{font:500 44px Corm,serif;margin:0 0 28px}
.wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px}
h2{font:500 15px Jost;letter-spacing:.14em;text-transform:uppercase;margin:0 0 14px}
.pair{display:flex;gap:20px;align-items:flex-start}
figure{margin:0}
.m img,.pending{width:390px;height:664px;object-fit:cover;object-position:top;display:block;box-shadow:0 10px 30px -12px rgba(0,0,0,.35);border-radius:28px;background:#fff}
.d img{width:700px;display:block;box-shadow:0 10px 30px -12px rgba(0,0,0,.35)}
.pending{box-sizing:border-box;padding:40px 32px;font-size:17px;line-height:1.5;border:2px dashed #94495D;border-radius:28px}
.pending strong{display:block;font:500 28px Corm,serif;margin-bottom:12px}
figcaption{font-size:13px;color:#62565A;margin-top:10px;text-align:center}
code{background:#F4ECE4;padding:1px 4px}
</style><h1>ChoZen Boutique homepage, before and after</h1>
<div class="wrap">${await panel('Before · Wix (live)', beforeMobile, beforeDesk, true)}${await panel('After · new Shopify design (mockup)', afterMobile, afterDesk, false)}</div>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 2400, height: 900 } });
await p.setContent(html, { waitUntil: 'load' });
await p.screenshot({ path: path.join(here, 'before-after.png'), fullPage: true });
await b.close();
console.log(`wrote mockup/before-after.png (${haveBefore ? 'with' : 'WITHOUT'} the Wix capture)`);
