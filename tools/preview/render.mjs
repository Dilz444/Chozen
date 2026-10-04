// Renders the real theme/ Liquid files locally with LiquidJS, Shopify-style tags and filters, and the mock store
// from store.mjs. Not a Shopify emulator: enough to see and test every template before the store exists.
process.env.TZ = 'Europe/London';
import fs from 'node:fs';
import path from 'node:path';
import { Liquid, Tag, Value } from 'liquidjs';
import { buildStore, ROOT } from './store.mjs';

const THEME = path.join(ROOT, 'theme');
const read = (p) => fs.readFileSync(path.join(THEME, p), 'utf8');
const locale = JSON.parse(read('locales/en.default.json'));
const settingsSchema = JSON.parse(read('config/settings_schema.json'));
const settingsData = JSON.parse(read('config/settings_data.json'));

export const ORIGIN = 'https://www.chozenboutique.co.uk';
const kw = (args) => Object.fromEntries(args.filter(Array.isArray));

function themeSettings() {
  const s = {};
  for (const group of settingsSchema) for (const st of group.settings || []) if ('default' in st) s[st.id] = st.default;
  Object.assign(s, settingsData.presets?.Default || {}, typeof settingsData.current === 'object' ? settingsData.current : {});
  for (const group of settingsSchema) for (const st of group.settings || []) if (!(st.id in s) && st.id) s[st.id] = st.type === 'checkbox' ? false : null;
  return s;
}

const schemaOf = (src) => {
  const m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  return m ? JSON.parse(m[1]) : {};
};

export function createRenderer(opts = {}) {
  const store = buildStore();
  const settings = { ...themeSettings(), ...(opts.settings || {}) };
  const engine = new Liquid({ root: [THEME], partials: [path.join(THEME, 'snippets')], extname: '.liquid', cache: false, timezoneOffset: 'Europe/London' });

  const resolveSetting = (type, value) => {
    if (value == null || value === '') return null;
    if (type === 'collection') return store.collections[value] || null;
    if (type === 'page') return store.pages[value] || null;
    if (type === 'product') return store.products.find((p) => p.handle === value) || null;
    if (type === 'blog') return store.blogs[value] || null;
    return value;
  };
  const withDefaults = (defs = [], given = {}) => {
    const out = {};
    for (const d of defs) if (d.id) out[d.id] = resolveSetting(d.type, d.id in given ? given[d.id] : d.default ?? null);
    for (const [k, v] of Object.entries(given)) if (!(k in out)) out[k] = v;
    return out;
  };

  // ---- Tags ----
  class SchemaTag extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      while (remain.length) { const t = remain.shift(); if (t.name === 'endschema') return; }
    }
    * render() {}
  }
  const blockTag = (name, open, close, scope) => class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      this.args = token.args;
      this.templates = [];
      const stream = this.liquid.parser.parseStream(remain);
      stream.on(`tag:end${name}`, () => stream.stop()).on('template', (t) => this.templates.push(t)).on('end', () => { throw new Error(`${name} not closed`); });
      stream.start();
    }
    * render(ctx, emitter) {
      const extra = scope ? yield scope(this.args, ctx, this.liquid) : {};
      emitter.write(open(this.args, extra));
      ctx.push(extra);
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      ctx.pop();
      emitter.write(close);
    }
  };
  engine.registerTag('schema', SchemaTag);
  engine.registerTag('form', blockTag('form', (args) => {
    const type = (args.match(/'([^']+)'/) || [])[1];
    const cls = (args.match(/class:\s*'([^']+)'/) || [])[1];
    const action = { product: '/cart/add', contact: '/contact', customer: '/contact#newsletter', storefront_password: '/password' }[type] || '/';
    const data = [...args.matchAll(/(data-[a-z-]+):\s*''/g)].map((m) => ` ${m[1]}`).join('');
    return `<form method="post" action="${action}" accept-charset="UTF-8"${cls ? ` class="${cls}"` : ''}${data}><input type="hidden" name="form_type" value="${type}"><input type="hidden" name="utf8" value="✓">`;
  }, '</form>', () => ({ form: { errors: null, posted_successfully: false } })));
  engine.registerTag('paginate', blockTag('paginate', () => '', '', function* (args, ctx, liquid) {
    const [, expr, byExpr] = args.match(/^\s*(\S+)\s+by\s+(\S+)/) || [];
    const items = yield new Value(expr, liquid).value(ctx, false);
    const by = Number(yield new Value(byExpr, liquid).value(ctx, false)) || 24;
    const n = (items || []).length;
    return { paginate: { current_page: 1, pages: Math.max(1, Math.ceil(n / by)), items: n, page_size: by, parts: [] } };
  }));
  for (const t of ['style', 'stylesheet', 'javascript']) engine.registerTag(t, blockTag(t, () => '', '', null));
  engine.registerTag('section', class extends Tag {
    constructor(token, remain, liquid) { super(token, remain, liquid); this.name = token.args.replace(/['"\s]/g, ''); }
    * render(ctx, emitter) { emitter.write(yield renderSection(this.name, this.name, {}, ctx.getAll())); }
  });
  engine.registerTag('sections', class extends Tag {
    constructor(token, remain, liquid) { super(token, remain, liquid); this.name = token.args.replace(/['"\s]/g, ''); }
    * render(ctx, emitter) {
      const group = JSON.parse(read(`sections/${this.name}.json`));
      for (const id of group.order) emitter.write(yield renderSection(group.sections[id].type, id, group.sections[id], ctx.getAll()));
    }
  });

  // ---- Filters ----
  const t = (key, ...args) => {
    let v = key.split('.').reduce((o, k) => (o ? o[k] : undefined), locale);
    const vars = kw(args);
    if (v && typeof v === 'object') v = vars.count === 1 ? v.one : v.other;
    if (typeof v !== 'string') return `[missing translation ${key}]`;
    return v.replace(/{{\s*(\w+)\s*}}/g, (_, k) => (vars[k] ?? ''));
  };
  const money = (c, trim) => {
    const n = (Number(c) || 0) / 100;
    return `£${trim && Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
  };
  const filters = {
    t,
    asset_url: (f) => `/assets/${f}`,
    stylesheet_tag: (u) => `<link href="${u}" rel="stylesheet" type="text/css" media="all" />`,
    preload_tag: (u, ...a) => { const o = kw(a); return `<link href="${u}" rel="preload" as="${o.as}"${o.type ? ` type="${o.type}"` : ''}${o.crossorigin ? ' crossorigin="anonymous"' : ''}>`; },
    script_tag: (u) => `<script src="${u}" type="text/javascript"></script>`,
    image_url: (img, ...a) => (img ? `${img.src || img}?width=${kw(a).width || ''}` : ''),
    image_tag: (u, ...a) => { const o = kw(a); return `<img src="${u}" alt="${o.alt ?? ''}" loading="${o.loading || 'lazy'}"${o.style ? ` style="${o.style}"` : ''}>`; },
    money: (c) => money(c, false), money_without_trailing_zeros: (c) => money(c, true), money_with_currency: (c) => `${money(c)} GBP`,
    money_without_currency: (c) => ((Number(c) || 0) / 100).toFixed(2),
    default_errors: (e) => (e ? `<ul><li>${[].concat(e).join('</li><li>')}</li></ul>` : ''),
    payment_button: () => '<div class="app-slot">Shop Pay / Apple Pay buttons (Shopify renders these)</div>',
    metafield_tag: (m) => (m && m.value != null ? `<p>${m.value}</p>` : ''),
    format_code: (c) => c, handleize: (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    within: (u) => u, link_to: (text, url) => `<a href="${url}">${text}</a>`,
    parse_json: (s) => JSON.parse(s),
  };
  for (const [k, f] of Object.entries(filters)) engine.registerFilter(k, f);

  // ---- Sections ----
  async function renderSection(type, id, cfg, scope) {
    const src = read(`sections/${type}.liquid`);
    const schema = schemaOf(src);
    const blocks = (cfg.block_order || Object.keys(cfg.blocks || {})).map((bid) => {
      const b = cfg.blocks[bid];
      const def = (schema.blocks || []).find((x) => x.type === b.type) || {};
      return { id: bid, type: b.type, settings: withDefaults(def.settings, b.settings || {}), shopify_attributes: '' };
    });
    const section = { id: `${scope.template?.name || 'x'}__${id}`, settings: withDefaults(schema.settings, cfg.settings || {}), blocks };
    const html = await engine.parseAndRender(src, { ...scope, section }, { globals: scope });
    return `<div id="shopify-section-${section.id}" class="shopify-section">${html}</div>`;
  }

  // ---- Routing ----
  function route(url) {
    const u = new URL(url, ORIGIN);
    const p = decodeURIComponent(u.pathname).replace(/\/$/, '') || '/';
    const seg = p.split('/').filter(Boolean);
    const S = store;
    if (p === '/') return { tpl: 'index', page_type: 'index', title: S.home.title, desc: S.home.meta };
    if (seg[0] === 'collections' && seg.length === 1) return { tpl: 'list-collections', page_type: 'list-collections', title: 'Shop all collections', desc: 'Same-day flowers and balloon gift sets in North London, and faux flowers, crystals and gemstone jewellery sent anywhere in the UK.' };
    if (seg[0] === 'collections' && S.collections[seg[1]] && seg.length === 2) { const c = S.collections[seg[1]]; return { tpl: 'collection', suffix: c.template_suffix, page_type: 'collection', vars: { collection: c }, title: c.seo_title || c.title, desc: c.seo_description }; }
    if (seg[0] === 'products') { const pr = S.products.find((x) => x.handle === seg[1]); if (pr) return { tpl: 'product', suffix: pr.template_suffix, page_type: 'product', vars: { product: pr, collection: pr.collections[0] }, title: pr.title, desc: pr.metafields.custom.summary.value }; }
    if (seg[0] === 'pages' && S.pages[seg[1]]) { const pg = S.pages[seg[1]]; return { tpl: 'page', suffix: pg.template_suffix, page_type: 'page', vars: { page: pg }, title: pg.seo_title || pg.title, desc: pg.seo_description }; }
    if (seg[0] === 'policies' && S.policies[seg[1]]) { const po = S.policies[seg[1]]; const pg = { title: po.title, content: po.body, handle: seg[1], metafields: { custom: { lede: { value: po.fm.lede } } } }; return { tpl: 'page', page_type: 'policy', vars: { page: pg }, title: po.fm.title || po.title, desc: po.fm.meta }; }
    if (seg[0] === 'blogs' && S.blogs[seg[1]] && seg.length === 2) { const b = S.blogs[seg[1]]; return { tpl: 'blog', suffix: b.handle === 'guides' ? 'guides' : null, page_type: 'blog', vars: { blog: b }, title: `${b.title} | ChoZen Boutique`, desc: b.metafields.custom.lede.value }; }
    if (seg[0] === 'blogs' && S.blogs[seg[1]] && seg[2]) { const b = S.blogs[seg[1]]; const a = b.articles.find((x) => x.handle === seg[2]); if (a) return { tpl: 'article', suffix: a.template_suffix, page_type: 'article', vars: { blog: b, article: a }, title: a.seo_title || a.title, desc: a.seo_description }; }
    if (p === '/cart') return { tpl: 'cart', page_type: 'cart', title: 'Your basket', desc: null };
    if (p === '/search') return { tpl: 'search', page_type: 'search', vars: { search: { performed: !!u.searchParams.get('q'), terms: u.searchParams.get('q') || '', results: [], results_count: 0 } }, title: 'Search', desc: null };
    return { tpl: '404', page_type: '404', status: 404, title: 'Page not found', desc: null };
  }

  async function render(url) {
    const r = route(url);
    let tplFile = `templates/${r.tpl}${r.suffix ? `.${r.suffix}` : ''}.json`;
    if (!fs.existsSync(path.join(THEME, tplFile))) tplFile = `templates/${r.tpl}.json`;
    const tpl = JSON.parse(read(tplFile));
    const u = new URL(url, ORIGIN);
    const scope = {
      settings, shop: { name: 'ChoZen Boutique', description: 'Florist and gift boutique in Enfield, London.', url: ORIGIN, refund_policy: { url: '/policies/refund-policy' }, privacy_policy: { url: '/policies/privacy-policy' }, terms_of_service: { url: '/policies/terms-of-service' }, password_message: '' },
      routes: { root_url: '/', search_url: '/search', cart_url: '/cart', collections_url: '/collections', all_products_collection_url: '/collections/all' },
      cart: { item_count: 0, items: [], total_price: 0, currency: { iso_code: 'GBP' } },
      request: { origin: ORIGIN, page_type: r.page_type, path: u.pathname, locale: { iso_code: 'en-GB' } },
      linklists: store.linklists, collections: store.collections, pages: store.pages, blogs: store.blogs,
      canonical_url: ORIGIN + (u.pathname === '/' ? '/' : u.pathname.replace(/\/$/, '')), page_title: r.title, page_description: r.desc,
      template: { name: r.tpl, suffix: r.suffix || null }, content_for_header: '', current_page: 1, current_tags: null, page_image: null,
      ...(r.vars || {}),
    };
    let body = '';
    for (const id of tpl.order) body += await renderSection(tpl.sections[id].type, id, tpl.sections[id], scope);
    const layout = tpl.layout || 'theme';
    const html = await engine.parseAndRender(read(`layout/${layout}.liquid`), { ...scope, content_for_layout: body }, { globals: scope });
    return { status: r.status || 200, html, route: r };
  }

  // Every URL the store knows about, for export and the gate.
  function urls() {
    const S = store;
    return [
      '/', '/collections', ...Object.values(S.collections).map((c) => c.url), ...S.products.map((p) => p.url),
      ...Object.values(S.pages).map((p) => p.url), ...Object.keys(S.policies).map((h) => `/policies/${h}`),
      ...Object.values(S.blogs).map((b) => b.url), ...S.blogs.guides.articles.map((a) => a.url), '/cart', '/search', '/404-check',
    ];
  }
  return { render, urls, store, settings };
}
