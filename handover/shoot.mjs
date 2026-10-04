// Screenshots for the handover guide: what customers see normally and with same-day paused.
// Needs two preview servers: npm run preview  and  node tools/preview/server.mjs --port 4395 --set same_day_paused=true --set "paused_message=…"
import { chromium, devices } from '@playwright/test';
const b = await chromium.launch();
const d = { ...devices['iPhone 14'] }; delete d.defaultBrowserType;
for (const [port, name] of [[4380, 'normal'], [4395, 'paused']]) {
  const c = await b.newContext({ ...d, locale: 'en-GB', timezoneId: 'Europe/London' });
  const p = await c.newPage();
  await p.clock.setFixedTime(new Date('2026-10-06T08:46:00+01:00'));
  await p.goto(`http://127.0.0.1:${port}/products/sample-seasonal-hand-tied-bouquet`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const box = await (await p.$('.deliv')).boundingBox();
  await p.screenshot({ path: `handover/img/product-${name}.png`, fullPage: true, clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
  await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `handover/img/home-${name}.png` });
  await c.close();
}
await b.close();
