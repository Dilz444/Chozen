#!/usr/bin/env node
// Pushes content/ into the Shopify store through the Admin GraphQL API: metafield definitions, pages,
// collections (smart, by tag), blogs + articles, policies, menus and URL redirects. Idempotent: updates by handle.
//
//   node tools/import/push.mjs                 dry run (default): prints what it would do, touches nothing
//   node tools/import/push.mjs --apply         writes to the store
//   node tools/import/push.mjs --apply --only pages,redirects
//
// Needs, in the environment only (never in the repo or a file in it):
//   SHOPIFY_STORE=chozen-boutique.myshopify.com
//   SHOPIFY_ADMIN_TOKEN=shpat_…   (Settings → Apps → Develop apps → create "ChoZen import" → Admin API scopes:
//                                  write_content, write_online_store_pages, write_products, write_online_store_navigation,
//                                  write_legal_policies → Install → reveal token once. Delete the app after launch.)
// Not yet run against a live store (none existed when it was written): do the first --apply on the trial store,
// check the result in the admin, then re-run safely as content changes.
import fs from 'node:fs';
import path from 'node:path';
import { buildStore, readMd, ROOT } from '../preview/store.mjs';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API = '2026-07';
if (APPLY && (!STORE || !TOKEN)) { console.error('Set SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN in the environment first.'); process.exit(1); }

async function gql(query, variables = {}) {
  if (!APPLY) return null;
  const r = await fetch(`https://${STORE}/admin/api/${API}/graphql.json`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-shopify-access-token': TOKEN }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  const payload = Object.values(j.data || {})[0];
  if (payload?.userErrors?.length) throw new Error(JSON.stringify(payload.userErrors));
  return j.data;
}
const log = (verb, what) => console.log(`${APPLY ? '' : '[dry run] '}${verb} ${what}`);
const mf = (ns, key, type, value) => (value == null || value === '' ? null : { namespace: ns, key, type, value: typeof value === 'string' ? value : JSON.stringify(value) });
const seo = (fm) => [mf('global', 'title_tag', 'single_line_text_field', fm.title), mf('global', 'description_tag', 'single_line_text_field', fm.meta)].filter(Boolean);

// 1. Metafield definitions (so the theme editor and filters know them).
const DEFS = [
  ['PAGE', 'lede', 'multi_line_text_field'], ['PAGE', 'faq', 'json'], ['PAGE', 'parent', 'single_line_text_field'], ['PAGE', 'h1', 'single_line_text_field'],
  ['PAGE', 'area_postcodes', 'single_line_text_field'], ['PAGE', 'area_fee', 'single_line_text_field'],
  ['COLLECTION', 'faq', 'json'], ['COLLECTION', 'parent', 'single_line_text_field'], ['COLLECTION', 'footnote', 'multi_line_text_field'],
  ['ARTICLE', 'faq', 'json'], ['ARTICLE', 'disclaimer', 'multi_line_text_field'], ['BLOG', 'lede', 'multi_line_text_field'],
  ['PRODUCT', 'line', 'single_line_text_field'], ['PRODUCT', 'summary', 'multi_line_text_field'], ['PRODUCT', 'whats_in_it', 'multi_line_text_field'],
  ['PRODUCT', 'size', 'single_line_text_field'], ['PRODUCT', 'materials', 'single_line_text_field'], ['PRODUCT', 'treatment', 'single_line_text_field'],
  ['PRODUCT', 'care', 'multi_line_text_field'], ['PRODUCT', 'crystal_meaning', 'multi_line_text_field'], ['PRODUCT', 'colour', 'single_line_text_field'],
  ['PRODUCT', 'formation', 'single_line_text_field'], ['PRODUCT', 'occasions', 'list.single_line_text_field'],
  ['PRODUCT', 'contains_lilies', 'boolean'], ['PRODUCT', 'latex', 'boolean'], ['PRODUCT', 'foil', 'boolean'], ['PRODUCT', 'personalised', 'boolean'], ['PRODUCT', 'card_message', 'boolean'],
];
if (want('definitions')) for (const [ownerType, key, type] of DEFS) {
  log('define', `${ownerType.toLowerCase()}.custom.${key} (${type})`);
  try {
    await gql(`mutation($d: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $d) { createdDefinition { id } userErrors { field message code } } }`,
      { d: { name: key.replace(/_/g, ' '), namespace: 'custom', key, type, ownerType, ...(ownerType === 'PRODUCT' && ['line', 'colour', 'formation', 'occasions', 'treatment'].includes(key) ? { capabilities: { smartCollectionCondition: { enabled: true } } } : {}) } });
  } catch (e) { if (!String(e).includes('TAKEN')) throw e; }
}

const store = buildStore();

// 2. Pages.
if (want('pages')) for (const p of Object.values(store.pages)) {
  log('upsert page', p.url);
  const metafields = [
    ...seo(p.fm), mf('custom', 'lede', 'multi_line_text_field', p.fm.lede), mf('custom', 'faq', 'json', p.fm.faq), mf('custom', 'h1', 'single_line_text_field', p.fm.h1),
    mf('custom', 'parent', 'single_line_text_field', p.metafields.custom.parent.value),
    mf('custom', 'area_postcodes', 'single_line_text_field', p.metafields.custom.area_postcodes.value), mf('custom', 'area_fee', 'single_line_text_field', p.metafields.custom.area_fee.value),
  ].filter(Boolean);
  const found = await gql(`query($q: String!) { pages(first: 1, query: $q) { nodes { id } } }`, { q: `handle:${p.handle}` });
  const id = found?.pages?.nodes?.[0]?.id;
  const input = { title: p.fm.h1 || p.title, handle: p.handle, body: p.content, templateSuffix: p.template_suffix, isPublished: true, metafields };
  if (id) await gql(`mutation($id: ID!, $p: PageUpdateInput!) { pageUpdate(id: $id, page: $p) { page { id } userErrors { field message } } }`, { id, p: input });
  else await gql(`mutation($p: PageCreateInput!) { pageCreate(page: $p) { page { id } userErrors { field message } } }`, { p: input });
}

// 3. Collections: smart collections by product tag, so the product sheet decides membership.
const RULES = {
  'same-day-flowers': ['local-only'], 'balloon-gift-sets': ['line:balloon'], 'gifts-that-last': ['keepsake'], 'faux-flowers': ['line:faux'], crystals: ['line:crystal'],
  'gemstone-jewellery': ['line:jewellery'], gifts: ['line:other'], 'birthday-flowers': ['occasion:birthday'], 'anniversary-flowers': ['occasion:anniversary'],
  'new-baby-gifts': ['occasion:new-baby'], 'thank-you-gifts': ['occasion:thank-you'], 'get-well-soon-gifts': ['occasion:get-well'], 'sympathy-flowers': ['occasion:sympathy'],
  'mothers-day': ['occasion:mothers-day'], 'valentines-day': ['occasion:valentines'],
};
if (want('collections')) for (const c of Object.values(store.collections)) {
  if (c.handle === 'all') continue;
  log('upsert collection', `${c.url} (${RULES[c.handle] ? `tag ${RULES[c.handle].join('+')}` : 'price under £30'})`);
  const ruleSet = c.handle === 'gifts-under-30'
    ? { appliedDisjunctively: false, rules: [{ column: 'VARIANT_PRICE', relation: 'LESS_THAN', condition: '30.00' }] }
    : { appliedDisjunctively: false, rules: RULES[c.handle].map((t) => ({ column: 'TAG', relation: 'EQUALS', condition: t })) };
  const input = { title: c.title, handle: c.handle, descriptionHtml: c.description, templateSuffix: c.template_suffix, ruleSet, metafields: [...seo(c.fm), mf('custom', 'faq', 'json', c.fm.faq), mf('custom', 'parent', 'single_line_text_field', c.metafields.custom.parent.value)].filter(Boolean) };
  const found = await gql(`query($q: String!) { collections(first: 1, query: $q) { nodes { id } } }`, { q: `handle:${c.handle}` });
  const id = found?.collections?.nodes?.[0]?.id;
  if (id) { delete input.ruleSet; await gql(`mutation($c: CollectionInput!) { collectionUpdate(input: $c) { collection { id } userErrors { field message } } }`, { c: { id, ...input } }); }
  else await gql(`mutation($c: CollectionInput!) { collectionCreate(input: $c) { collection { id } userErrors { field message } } }`, { c: input });
}

// 4. Blogs and articles.
if (want('articles')) for (const b of Object.values(store.blogs)) {
  log('upsert blog', b.url);
  let blogId = (await gql(`query($q: String!) { blogs(first: 1, query: $q) { nodes { id } } }`, { q: `handle:${b.handle}` }))?.blogs?.nodes?.[0]?.id;
  if (!blogId && APPLY) blogId = (await gql(`mutation($b: BlogCreateInput!) { blogCreate(blog: $b) { blog { id } userErrors { field message } } }`, { b: { title: b.title, handle: b.handle, templateSuffix: b.handle === 'guides' ? 'guides' : null } })).blogCreate.blog.id;
  for (const a of b.articles) {
    log('upsert article', a.url);
    const input = { title: a.title, handle: a.handle, body: a.content, summary: a.excerpt, templateSuffix: a.template_suffix, isPublished: true, author: { name: 'Beyzan' }, metafields: [...seo(a.fm), mf('custom', 'faq', 'json', a.fm.faq)].filter(Boolean) };
    const id = (await gql(`query($q: String!) { articles(first: 1, query: $q) { nodes { id } } }`, { q: `handle:${a.handle} AND blog_id:${(blogId || '').split('/').pop()}` }))?.articles?.nodes?.[0]?.id;
    if (id) await gql(`mutation($id: ID!, $a: ArticleUpdateInput!) { articleUpdate(id: $id, article: $a) { article { id } userErrors { field message } } }`, { id, a: input });
    else if (APPLY) await gql(`mutation($a: ArticleCreateInput!) { articleCreate(article: $a) { article { id } userErrors { field message } } }`, { a: { ...input, blogId } });
  }
}

// 5. Policies.
const POL = { 'refund-policy': 'REFUND_POLICY', 'privacy-policy': 'PRIVACY_POLICY', 'terms-of-service': 'TERMS_OF_SERVICE', 'shipping-policy': 'SHIPPING_POLICY' };
if (want('policies')) for (const [h, type] of Object.entries(POL)) {
  const p = store.policies[h];
  if (!p) continue;
  log('set policy', type);
  await gql(`mutation($p: ShopPolicyInput!) { shopPolicyUpdate(shopPolicy: $p) { shopPolicy { id } userErrors { field message } } }`, { p: { type, body: p.body } });
}

// 6. Menus.
if (want('menus')) for (const m of Object.values(store.linklists)) {
  log('upsert menu', `${m.handle} (${m.links.length} links)`);
  const items = (links) => links.map((l) => ({ title: l.title, url: l.url, type: 'HTTP', items: items(l.links || []) }));
  const id = (await gql(`query($q: String!) { menus(first: 1, query: $q) { nodes { id } } }`, { q: `handle:${m.handle}` }))?.menus?.nodes?.[0]?.id;
  if (id) await gql(`mutation($id: ID!, $t: String!, $h: String!, $i: [MenuItemUpdateInput!]!) { menuUpdate(id: $id, title: $t, handle: $h, items: $i) { menu { id } userErrors { field message } } }`, { id, t: m.title, h: m.handle, i: items(m.links) });
  else await gql(`mutation($t: String!, $h: String!, $i: [MenuItemCreateInput!]!) { menuCreate(title: $t, handle: $h, items: $i) { menu { id } userErrors { field message } } }`, { t: m.title, h: m.handle, i: items(m.links) });
}

// 7. Redirects (launch day only: they only fire for paths that 404 on Shopify).
if (want('redirects')) {
  const rows = fs.readFileSync(path.join(ROOT, 'redirects/wix-to-shopify.csv'), 'utf8').trim().split('\n').slice(1).map((l) => l.split(','));
  for (const [from, to] of rows) {
    log('redirect', `${from} → ${to}`);
    try { await gql(`mutation($r: UrlRedirectInput!) { urlRedirectCreate(urlRedirect: $r) { urlRedirect { id } userErrors { field message } } }`, { r: { path: from, target: to } }); }
    catch (e) { if (!/taken|already/i.test(String(e))) throw e; }
  }
}
console.log(APPLY ? 'Done.' : '\nDry run only. Add --apply (with SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN set) to write to the store.');
