// ChoZen theme behaviour. No dependencies. Everything works without JS; this only makes it live.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const cfgEl = $('#chozen-delivery');
  let cfg = { cutoffHour: 10, days: ['1', '2', '3', '4', '5', '6'], zones: [], paused: false };
  try { if (cfgEl) cfg = { ...cfg, ...JSON.parse(cfgEl.textContent) }; } catch (e) { /* keep defaults */ }
  const DAYS = (cfg.days || []).map(Number);
  const ZONES = (cfg.zones || []).filter(Boolean);
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // The time in London, whatever the visitor's clock zone.
  const london = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), h: +p.hour, m: +p.minute };
  };

  // The honest state of today's cut-off: open with minutes left, or the next delivery day.
  const state = () => {
    const t = london();
    const minsLeft = cfg.cutoffHour * 60 - (t.h * 60 + t.m);
    if (!cfg.paused && DAYS.includes(t.dow) && minsLeft > 0) return { open: true, minsLeft };
    let d = t.dow;
    for (let i = 1; i <= 7; i += 1) { d = (t.dow + i) % 7; if (DAYS.includes(d)) break; }
    return { open: false, next: d === (t.dow + 1) % 7 ? 'tomorrow' : `on ${DAY[d]}` };
  };
  const left = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`);

  const paintCutoff = () => {
    if (cfg.paused) return;
    const s = state();
    $$('[data-cutoff]').forEach((el) => {
      const style = el.dataset.cutoff;
      if (s.open) {
        el.innerHTML = style === 'bar'
          ? `Same day: ${left(s.minsLeft)} left to order`
          : `<strong>Order in the next ${left(s.minsLeft)}</strong> for delivery today`;
      } else {
        el.innerHTML = style === 'bar' ? `Order now for delivery ${s.next}` : `<strong>Order now</strong> for delivery ${s.next}`;
      }
    });
  };
  paintCutoff();
  setInterval(paintCutoff, 30000);

  // Postcode check against the same prefixes as the delivery zones.
  $$('[data-postcode-check]').forEach((form) => {
    const out = $('.pc__out', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = form.postcode.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!raw) { out.className = 'pc__out'; out.textContent = 'Type your postcode, for example N21 1AA.'; return; }
      const outward = raw.length > 4 ? raw.slice(0, -3) : raw;
      const s = state();
      if (ZONES.includes(outward)) {
        out.className = 'pc__out is-yes';
        out.textContent = cfg.paused
          ? `We deliver to ${outward}. ${cfg.pausedMessage || ''}`
          : s.open ? `Yes, we deliver to ${outward} today. Order in the next ${left(s.minsLeft)}.` : `Yes, we deliver to ${outward}. Order now for delivery ${s.next}.`;
      } else {
        out.className = 'pc__out is-no';
        out.innerHTML = `We can't hand-deliver to ${outward} yet. Our <a href="/collections/gifts-that-last">faux flowers, crystals and jewellery</a> are posted anywhere in the UK.`;
      }
    });
  });

  // Mobile drawer.
  const drawer = $('#drawer');
  const opener = $('[data-drawer-open]');
  const setDrawer = (open) => {
    if (!drawer) return;
    drawer.hidden = !open;
    drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
    opener?.setAttribute('aria-expanded', String(open));
    if (open) $('a, button', $('.drawer__panel', drawer))?.focus(); else opener?.focus();
  };
  opener?.addEventListener('click', () => setDrawer(true));
  $$('[data-drawer-close]').forEach((b) => b.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer && !drawer.hidden) setDrawer(false); });

  // Sticky order bar once the page's main buttons have scrolled away.
  const bar = $('#mbar');
  const ctas = $('[data-hero-ctas]') || $('.pg-head');
  if (bar && ctas && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      const on = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', String(!on));
      const a = $('a', bar); if (a) a.tabIndex = on ? 0 : -1;
    }).observe(ctas);
  }

  // Product gallery thumbnails.
  const main = $('[data-gallery-main]');
  $$('[data-gallery-thumb]').forEach((btn) => btn.addEventListener('click', () => {
    const img = $('img', main);
    if (img) { img.srcset = ''; img.src = btn.dataset.galleryThumb; img.alt = btn.dataset.alt || ''; }
    $$('[data-gallery-thumb]').forEach((b) => b.setAttribute('aria-current', String(b === btn)));
  }));

  // Card message counter.
  $$('[data-counter]').forEach((ta) => {
    const c = document.getElementById(ta.dataset.counter);
    const upd = () => { if (c) c.textContent = `${ta.value.length} / ${ta.maxLength}`; };
    ta.addEventListener('input', upd); upd();
  });

  // Quantity steppers.
  $$('[data-qty]').forEach((b) => b.addEventListener('click', () => {
    const input = b.parentElement.querySelector('input');
    input.value = Math.max(1, (+input.value || 1) + Number(b.dataset.qty));
  }));

  // Variant picker: radio options -> variant id, price, availability.
  const form = $('[data-product-form]');
  const json = $('[data-product-json]');
  if (form && json) {
    const variants = JSON.parse(json.textContent);
    const money = (c) => `£${(c / 100).toFixed(c % 100 ? 2 : 0)}`;
    form.addEventListener('change', (e) => {
      if (!e.target.matches('[data-option]')) return;
      const chosen = $$('[data-option]:checked', form).map((i) => i.value);
      const v = variants.find((x) => x.options.every((o, i) => o === chosen[i]));
      const add = $('[data-add]', form);
      if (!v) { if (add) { add.disabled = true; add.textContent = 'Unavailable'; } return; }
      $('[data-variant-id]', form).value = v.id;
      const price = $('[data-price]'); if (price) price.textContent = money(v.price);
      if (add) { add.disabled = !v.available; add.textContent = v.available ? 'Add to basket' : 'Sold out'; }
      const url = new URL(location.href); url.searchParams.set('variant', v.id); history.replaceState(null, '', url);
    });
  }

  // Sort select submits on change.
  $$('[data-autosubmit]').forEach((s) => s.addEventListener('change', () => s.form.submit()));
})();
