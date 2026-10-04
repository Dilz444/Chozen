// Cut-off countdown, postcode check and sticky order bar.
// Zones, cut-off and delivery days are PLACEHOLDERS until Beyzan confirms them (open-questions.md B3, B5, B6).
(() => {
  const CUTOFF_HOUR = 10;                       // 10am, Europe/London
  const DELIVERY_DAYS = [1, 2, 3, 4, 5, 6];     // Mon–Sat [to confirm]
  const ZONES = ['EN1', 'EN2', 'EN3', 'N9', 'N13', 'N14', 'N18', 'N21']; // [to confirm]
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const london = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), h: +p.hour, m: +p.minute };
  };

  // Returns the honest state of today's cut-off.
  const state = () => {
    const t = london();
    const today = DELIVERY_DAYS.includes(t.dow);
    const minsLeft = CUTOFF_HOUR * 60 - (t.h * 60 + t.m);
    if (today && minsLeft > 0) return { open: true, minsLeft };
    let d = t.dow;
    for (let i = 1; i <= 7; i += 1) { d = (t.dow + i) % 7; if (DELIVERY_DAYS.includes(d)) break; }
    return { open: false, next: (d === (t.dow + 1) % 7) ? 'tomorrow' : DAY[d] };
  };
  const left = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`);

  const paint = () => {
    const s = state();
    const cut = document.getElementById('cut-line');
    const bar = document.getElementById('mbar-cut');
    if (s.open) {
      if (cut) cut.innerHTML = `<strong>Order in the next ${left(s.minsLeft)}</strong> for delivery today`;
      if (bar) bar.textContent = `Same day: ${left(s.minsLeft)} left to order`;
    } else {
      if (cut) cut.innerHTML = `<strong>Order now</strong> for delivery ${s.next === 'tomorrow' ? 'tomorrow' : `on ${s.next}`}`;
      if (bar) bar.textContent = `Order now for delivery ${s.next === 'tomorrow' ? 'tomorrow' : `on ${s.next}`}`;
    }
  };
  paint();
  setInterval(paint, 30000);

  // Postcode check: outward code only (EN2 6AB -> EN2).
  const form = document.getElementById('pc');
  const out = document.getElementById('pc-out');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = form.postcode.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!raw) { out.className = 'pc__out'; out.textContent = 'Type your postcode, for example N21 1AA.'; return; }
    const outward = raw.length > 4 ? raw.slice(0, -3) : raw;
    const s = state();
    if (ZONES.includes(outward)) {
      out.className = 'pc__out is-yes';
      out.textContent = s.open
        ? `Yes, we deliver to ${outward} today. Order in the next ${left(s.minsLeft)}.`
        : `Yes, we deliver to ${outward}. Order now for ${s.next === 'tomorrow' ? 'tomorrow' : s.next}.`;
    } else {
      out.className = 'pc__out is-no';
      out.innerHTML = `We can't hand-deliver to ${outward} yet. Our <a href="#lasting">faux flowers, crystals and jewellery</a> are posted anywhere in the UK.`;
    }
  });

  // Sticky bar appears once the hero buttons scroll away.
  const bar = document.getElementById('mbar');
  const ctas = document.querySelector('[data-hero-ctas]');
  if (bar && ctas && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      const on = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', String(!on));
      bar.querySelector('a').tabIndex = on ? 0 : -1;
    }).observe(ctas);
  }
})();
