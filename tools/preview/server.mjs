#!/usr/bin/env node
// Local theme preview: npm run preview  → http://127.0.0.1:4380 (add --host 0.0.0.0 to open it from a phone on the same Wi-Fi)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRenderer } from './render.mjs';
import { ROOT } from './store.mjs';

const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || 4380;
const host = args.includes('--host') ? args[args.indexOf('--host') + 1] : '127.0.0.1';
const launch = args.includes('--launch'); // render as launch mode: no placeholder marks
const types = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.xml': 'application/xml' };

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x');
    if (u.pathname.startsWith('/assets/')) {
      const f = path.join(ROOT, 'theme', u.pathname);
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'cache-control': 'public, max-age=31536000' });
      return fs.createReadStream(f).pipe(res);
    }
    if (u.pathname === '/robots.txt' || u.pathname === '/llms.txt') {
      const f = path.join(ROOT, 'theme', 'static', u.pathname.slice(1));
      res.writeHead(fs.existsSync(f) ? 200 : 404, { 'content-type': 'text/plain' });
      return res.end(fs.existsSync(f) ? fs.readFileSync(f) : '');
    }
    const r = createRenderer(launch ? { settings: { show_placeholder_marks: false } } : {}); // fresh each request: edits show on reload
    const out = await r.render(u.pathname + u.search);
    res.writeHead(out.status, { 'content-type': 'text/html; charset=utf-8' });
    res.end(out.html);
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end(String(e.stack || e));
  }
}).listen(port, host, () => console.log(`ChoZen theme preview on http://${host}:${port}`));
