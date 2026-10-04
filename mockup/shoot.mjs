// Screenshots of the mockup: iPhone SE / 14 / Pro Max (WebKit + Chromium) and desktop.
import { chromium, webkit, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || pathToFileURL(path.join(here, 'index.html')).href;
const outDir = path.join(here, 'shots');
const targets = [
  ['iphone-se', devices['iPhone SE']], ['iphone-14', devices['iPhone 14']], ['iphone-14-pro-max', devices['iPhone 14 Pro Max']],
];
const fs = await import('node:fs/promises'); await fs.mkdir(outDir, { recursive: true });
const report = [];
const engines = [['webkit', webkit], ['chromium', chromium]];
for (const [engName, eng] of engines) {
  let b;
  try { b = await eng.launch(); } catch { console.log(`${engName}: not installed here, skipped (run on a machine with it)`); continue; }
  for (const [name, dev] of targets) {
    const d = { ...dev }; if (engName === 'chromium') delete d.defaultBrowserType;
    const ctx = await b.newContext({ ...d, locale: 'en-GB', timezoneId: 'Europe/London' });
    const p = await ctx.newPage(); await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: innerWidth, h: document.documentElement.scrollHeight,
      small: [...document.querySelectorAll('a,button,input,summary')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width && r.height && cs.visibility !== 'hidden' && (r.height < 40 || r.width < 40) && !e.closest('p') && !e.classList.contains('skip'); }).map(e => `${e.tagName}.${e.className} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)} "${(e.textContent||'').trim().slice(0,30)}"`),
      inputs: [...document.querySelectorAll('input')].map(i => getComputedStyle(i).fontSize) }));
    report.push({ engine: engName, device: name, ...m, hscroll: m.sw > m.vw });
    if (engName === 'webkit' || !report.some(r => r.engine === 'webkit')) {
      await p.screenshot({ path: path.join(outDir, `${name}-first-screen.png`) });
      if (name === 'iphone-14') await p.screenshot({ path: path.join(outDir, `${name}-full.png`), fullPage: true });
    }
    await ctx.close();
  }
  if (engName === 'chromium') {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-GB', timezoneId: 'Europe/London' });
    const p = await ctx.newPage(); await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(outDir, 'desktop-first-screen.png') });
    await p.screenshot({ path: path.join(outDir, 'desktop-full.png'), fullPage: true });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    report.push({ engine: 'chromium', device: 'desktop-1440', sw, hscroll: sw > 1440 });
  }
  await b.close();
}
await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
for (const r of report) console.log(r.engine, r.device, 'hscroll:', r.hscroll, 'small targets:', (r.small || []).length, (r.small||[]).slice(0,6).join(' | '), 'inputs:', (r.inputs||[]).join(','));
