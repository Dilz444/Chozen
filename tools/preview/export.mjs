#!/usr/bin/env node
// Static export of every route to preview-dist/ (for the gate and for sharing). npm run export
import fs from 'node:fs';
import path from 'node:path';
import { createRenderer } from './render.mjs';
import { ROOT } from './store.mjs';
const out = path.join(ROOT, 'preview-dist');
fs.rmSync(out, { recursive: true, force: true });
const r = createRenderer();
let n = 0;
const errors = [];
for (const url of r.urls()) {
  try {
    const { html } = await r.render(url);
    const file = url === '/' ? 'index.html' : `${url.replace(/^\//, '')}/index.html`;
    fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
    fs.writeFileSync(path.join(out, file), html);
    n += 1;
  } catch (e) { errors.push(`${url}: ${e.message}`); }
}
fs.cpSync(path.join(ROOT, 'theme/assets'), path.join(out, 'assets'), { recursive: true });
console.log(`exported ${n} pages to preview-dist/`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
