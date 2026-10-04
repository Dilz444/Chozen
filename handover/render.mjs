// Renders guide.html to guide.pdf (A4). node handover/render.mjs
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto(new URL('./guide.html', import.meta.url).href);
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: new URL('./guide.pdf', import.meta.url).pathname, format: 'A4', printBackground: true, preferCSSPageSize: true });
await p.setViewportSize({ width: 794, height: 1123 });
await p.screenshot({ path: new URL('./guide-preview.png', import.meta.url).pathname, fullPage: true });
await b.close();
