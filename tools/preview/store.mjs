// Builds a mock Shopify store from content/*.md so the real theme can be rendered locally before the store exists.
// Products are SAMPLES (tagged "sample"): no names, prices or photos are invented.
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { marked } from 'marked';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const C = (...p) => path.join(ROOT, 'content', ...p);

export function readMd(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  return { fm: yaml.load(m[1]) || {}, body: m[2] };
}
const html = (md) => marked.parse((md || '').replace(/<!--[\s\S]*?-->/g, '').trim(), { mangle: false, headerIds: false });
const handleOf = (url) => url.split('/').filter(Boolean).pop();
const dir = (d) => (fs.existsSync(C(d)) ? fs.readdirSync(C(d)).filter((f) => f.endsWith('.md')).map((f) => C(d, f)) : []);

// Area facts shown in the facts strip on area pages (fees unknown, so placeholders).
const AREA = {
  'flower-delivery-enfield': 'EN1, EN2',
  'flower-delivery-winchmore-hill': 'N21',
  'flower-delivery-palmers-green': 'N13',
  'flower-delivery-southgate': 'N14',
  'flower-delivery-edmonton': 'N9, N18',
  'flower-delivery-enfield-lock': 'EN3',
  'balloon-delivery-enfield': 'EN1, EN2, EN3, N9, N13, N14, N18, N21 [to confirm]',
};

const crumbParent = (fm) => {
  // breadcrumbs: [Home, Delivery areas, Winchmore Hill] -> "Delivery areas|/pages/delivery"
  const b = fm.breadcrumbs || [];
  if (b.length < 3) return null;
  const label = b[b.length - 2];
  const known = {
    'Delivery areas': '/pages/delivery', Delivery: '/pages/delivery', Guides: '/blogs/guides', 'Crystal meanings': '/blogs/guides/crystal-meanings',
    'Gifts that last': '/collections/gifts-that-last', Occasions: '/collections/birthday-flowers', Shop: '/collections/all', Help: '/pages/faqs', About: '/pages/about',
  };
  return `${label}|${known[label] || '/'}`;
};

function md2page(file) {
  const { fm, body } = readMd(file);
  const handle = handleOf(fm.url || path.basename(file, '.md'));
  const tpl = (fm.template || 'page').split('.');
  return {
    handle, url: fm.url || `/pages/${handle}`, title: fm.h1 || fm.title, content: html(body),
    template_suffix: tpl[1] || null, seo_title: fm.title, seo_description: fm.meta, fm,
    metafields: { custom: {
      lede: { value: fm.lede || null }, faq: { value: fm.faq || null }, parent: { value: crumbParent(fm) },
      h1: { value: fm.h1 || null },
      area_postcodes: { value: AREA[handle] || null }, area_fee: { value: AREA[handle] ? '£[FEE] [to confirm]' : null },
    } },
  };
}

// Sample products: one set per line, clearly tagged. Prices are null (shown as "£—").
const SAMPLE_LINES = {
  fresh: ['Sample seasonal hand-tied bouquet', 'Sample roses in a vase', "Sample florist's choice", 'Sample pastel posy'],
  balloon: ['Sample flowers & balloon set', 'Sample birthday balloon set', 'Sample new baby balloon set'],
  faux: ['Sample faux peonies in a vase', 'Sample faux rose arrangement', 'Sample faux stems bundle'],
  crystal: ['Sample crystal cluster', 'Sample tumbled stone gift set', 'Sample crystal point'],
  jewellery: ['Sample gemstone bracelet', 'Sample birthstone pendant'],
  other: ['Sample greeting card', 'Sample gift box'],
};
const COLL_LINES = {
  'same-day-flowers': ['fresh', 'balloon'], 'balloon-gift-sets': ['balloon'], 'gifts-that-last': ['faux', 'crystal', 'jewellery'],
  'faux-flowers': ['faux'], crystals: ['crystal'], 'gemstone-jewellery': ['jewellery'], gifts: ['other', 'crystal'],
  'birthday-flowers': ['fresh', 'balloon'], 'anniversary-flowers': ['fresh', 'faux'], 'new-baby-gifts': ['balloon', 'fresh'],
  'thank-you-gifts': ['fresh', 'faux'], 'get-well-soon-gifts': ['fresh'], 'sympathy-flowers': ['fresh'],
  'mothers-day': ['fresh', 'faux', 'crystal'], 'valentines-day': ['fresh', 'balloon'], 'gifts-under-30': ['crystal', 'other'],
};

function makeProducts() {
  const out = [];
  let id = 1000;
  for (const [line, names] of Object.entries(SAMPLE_LINES)) {
    for (const name of names) {
      id += 1;
      const handle = name.toLowerCase().replace(/^sample /, 'sample-').replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
      const local = line === 'fresh' || line === 'balloon';
      const variant = { id: id * 10, title: 'Default Title', price: 0, available: true, options: ['Default Title'], sku: null, url: `/products/${handle}?variant=${id * 10}` };
      out.push({
        id, handle, title: name, url: `/products/${handle}`, price: 0, price_min: 0, price_max: 0, price_varies: false, available: true,
        tags: ['sample', ...(local ? ['local-only'] : [])], featured_image: null, images: [], variants: [variant],
        selected_or_first_available_variant: variant, has_only_default_variant: true, options_with_values: [],
        description: '', template_suffix: local ? (line === 'balloon' ? 'balloon' : 'fresh') : null, collections: [],
        metafields: { custom: {
          line: { value: line }, summary: { value: 'Sample product: the real name, photo, price and description come from Beyzan’s product sheet.' },
          whats_in_it: { value: '[to confirm]' }, size: { value: '[to confirm]' },
          latex: { value: line === 'balloon' }, foil: { value: line === 'balloon' }, contains_lilies: { value: false },
          materials: { value: line === 'jewellery' ? '[to confirm]' : null },
        }, reviews: {} },
      });
    }
  }
  return out;
}

export function buildStore() {
  const products = makeProducts();
  const byLine = (l) => products.filter((p) => p.metafields.custom.line.value === l);

  const collections = {};
  for (const f of dir('collections')) {
    const { fm, body } = readMd(f);
    const handle = handleOf(fm.url);
    const items = (COLL_LINES[handle] || ['fresh']).flatMap(byLine);
    collections[handle] = {
      handle, url: fm.url, title: fm.h1 || fm.title, description: `<p>${fm.lede || ''}</p>`, seo_title: fm.title, seo_description: fm.meta,
      template_suffix: (fm.template || '').split('.')[1] || null, products: items, products_count: items.length, all_products_count: items.length,
      filters: [], sort_options: [{ value: 'manual', name: 'Featured' }, { value: 'price-ascending', name: 'Price, low to high' }, { value: 'price-descending', name: 'Price, high to low' }, { value: 'created-descending', name: 'Newest' }],
      sort_by: 'manual', default_sort_by: 'manual', fm,
      metafields: { custom: { faq: { value: fm.faq || null }, parent: { value: crumbParent(fm) }, footnote: { value: null } } },
      bodyHtml: html(body),
    };
  }
  const allProducts = products;
  collections.all = { handle: 'all', url: '/collections/all', title: 'All products', description: '', products: allProducts, products_count: allProducts.length, filters: [], sort_options: [], metafields: { custom: {} }, template_suffix: null };
  for (const p of products) p.collections = Object.values(collections).filter((c) => c.handle !== 'all' && c.products.includes(p)).slice(0, 1);

  const pages = {};
  for (const f of dir('pages')) { if (!readMd(f).fm.url) continue; const p = md2page(f); pages[p.handle] = p; }
  for (const f of dir('legal')) {
    if (!readMd(f).fm.url) continue; // internal notes (checklist, footer text) aren't pages
    const p = md2page(f);
    if (p.url.startsWith('/pages/')) pages[p.handle] = p;
  }

  const policies = {};
  for (const f of dir('legal')) {
    const { fm, body } = readMd(f);
    if (fm.url && fm.url.startsWith('/policies/')) policies[handleOf(fm.url)] = { title: fm.h1 || fm.title, url: fm.url, body: html(body), fm };
  }

  const articles = dir('guides').map((f) => {
    const { fm, body } = readMd(f);
    const handle = handleOf(fm.url);
    return {
      handle, url: fm.url, title: fm.h1 || fm.title, content: html(body), excerpt: fm.lede ? `<p>${fm.lede}</p>` : '', excerpt_or_content: fm.lede || '',
      image: null, published_at: '2026-10-04T09:00:00+01:00', updated_at: '2026-10-04T09:00:00+01:00', template_suffix: (fm.template || '').split('.')[1] || null,
      seo_title: fm.title, seo_description: fm.meta, fm,
      metafields: { custom: { faq: { value: fm.faq || null }, disclaimer: { value: null } } },
    };
  });
  const blogs = {
    guides: { handle: 'guides', url: '/blogs/guides', title: 'Guides', articles, articles_count: articles.length, metafields: { custom: { lede: { value: 'Flower care, card messages, crystal meanings and gift ideas, written by the florist.' } } } },
    journal: { handle: 'journal', url: '/blogs/journal', title: 'Journal', articles: [], articles_count: 0, metafields: { custom: { lede: { value: 'News from the workbench. Her Wix posts move here after the capture.' } } } },
  };
  for (const a of articles) a.blog = blogs.guides;

  const home = readMd(C('home.md')).fm;
  return { products, collections, pages, policies, blogs, home, linklists: buildMenus() };
}

// Menus from content/navigation.md: "## Title (`handle`)" then "- Label → `/url`", "1. **Label** → `/url`" or table rows.
function buildMenus() {
  const src = fs.readFileSync(C('navigation.md'), 'utf8');
  const lists = {};
  let cur = null;
  let parent = null;
  for (const line of src.split('\n')) {
    const h = line.match(/^##+\s+(.+?)\s*\(`([a-z0-9-]+)`\)/);
    if (h) { cur = { handle: h[2], title: h[1].replace(/\s*menu$/i, ''), links: [] }; lists[cur.handle] = cur; parent = null; continue; }
    if (/^##\s/.test(line)) { cur = null; continue; }
    if (!cur) continue;
    const top = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s+→\s+`([^`]+)`/);
    const topNoUrl = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s+→\s+see/);
    const sub = line.match(/^\s{2,}-\s+(.+?)\s+→\s+`([^`]+)`/);
    const item = line.match(/^-\s+(.+?)\s+→\s+`([^`]+)`/);
    const row = line.match(/^\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*([^|]*)\|/);
    if (top) { parent = { title: top[1], url: top[2], links: [] }; cur.links.push(parent); }
    else if (topNoUrl) { parent = { title: topNoUrl[1], url: '/collections/birthday-flowers', links: [] }; cur.links.push(parent); }
    else if (sub && parent) parent.links.push({ title: sub[1], url: sub[2], links: [] });
    else if (item) cur.links.push({ title: item[1], url: item[2], links: [] });
    else if (row && row[1] !== 'Label' && !/homepage chip only/.test(row[3]) && !/from (early|mid) January/.test(row[3])) cur.links.push({ title: row[1], url: row[2], links: [] });
  }
  if (lists.occasions && lists['main-menu']) {
    const occ = lists['main-menu'].links.find((l) => l.title === 'Occasions');
    if (occ) occ.links = lists.occasions.links;
  }
  if (lists.occasions) lists.occasions.links.push({ title: 'Just because', url: '/collections/same-day-flowers', links: [] });
  return lists;
}
