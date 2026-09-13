/* KOINONIA EXPERIENCE — motion. Dependency-free, degrades to static. */
(() => {
'use strict';
const Q = new URLSearchParams(location.search), IS_CAP = Q.has('cap');
if (IS_CAP){ const st = document.createElement('style'); st.textContent = `.grain{display:none!important}*{transition:none!important;animation:none!important}[data-rv],[data-rv-stagger]>*{opacity:1!important;transform:none!important}.ml>span{transform:none!important}.hero__media video{display:none}`; document.documentElement.appendChild(st); }
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
const Bus = (() => { const subs = new Set(); let t = false, y = 0; addEventListener('scroll', () => { y = scrollY; if (!t){ t = true; requestAnimationFrame(() => { t = false; subs.forEach(f => f(y)); }); } }, {passive:true}); return { add(f){ subs.add(f); f(scrollY); } }; })();

function grain(){ if (RM || IS_CAP) return; const c = document.createElement('canvas'); c.width = c.height = 180; const x = c.getContext('2d'), d = x.createImageData(180,180), p = d.data;
  for (let i=0;i<p.length;i+=4){ const v = Math.random()*255; p[i]=p[i+1]=p[i+2]=v; p[i+3]=40; } x.putImageData(d,0,0);
  document.documentElement.style.setProperty('--grain-url',`url(${c.toDataURL()})`); const g = document.createElement('div'); g.className='grain'; document.body.appendChild(g); }
function split(){ $$('[data-split]').forEach(el => { el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="ml"><span>${l.trim()}</span></span>`).join(''); if (!el.hasAttribute('data-rv')) el.setAttribute('data-rv',''); }); }
function reveals(){ const els = $$('[data-rv],[data-rv-stagger]'); if (RM || IS_CAP || !('IntersectionObserver' in window)){ els.forEach(e => e.classList.add('is-rv')); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add('is-rv'); io.unobserve(en.target); } }), {rootMargin:'0px 0px -10% 0px', threshold:.06}); els.forEach(e => io.observe(e)); }
function nav(){ const n = $('.nav'); if (!n) return; const hero = $('.hero'); Bus.add(y => n.classList.toggle('is-solid', y > (hero ? hero.offsetHeight - 120 : 40)));
  const menu = $('.menu'), veil = $('.menu__veil'), open = $('.nav__burger'), close = $('.menu__close'); if (!menu) return;
  const t = on => { menu.classList.toggle('is-open', on); veil && veil.classList.toggle('is-open', on); document.body.style.overflow = on ? 'hidden' : ''; open.setAttribute('aria-expanded', on); (on ? close : open).focus(); };
  open.addEventListener('click', () => t(true)); close.addEventListener('click', () => t(false)); veil && veil.addEventListener('click', () => t(false));
  $$('.menu a', menu).forEach(a => a.addEventListener('click', () => { if (a.getAttribute('href').startsWith('#')) t(false); }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) t(false); }); }
function hero(){ const h = $('.hero'); if (!h) return; const v = $('video', h); if (v && !RM && !IS_CAP){ const conn = navigator.connection || {}; const slow = !!conn.saveData || ['slow-2g','2g','3g'].includes(conn.effectiveType); const px = Math.max(screen.width, screen.height) * (devicePixelRatio || 1); const pick = slow ? null : (px >= 2560 && (conn.downlink || 10) >= 10 && v.dataset.src4k) ? v.dataset.src4k : (Math.min(screen.width, screen.height) * (devicePixelRatio || 1) < 1100 || innerWidth < 900) && v.dataset.src720 ? v.dataset.src720 : v.dataset.src; if (pick) v.src = pick; v.muted = true; const p = v.play(); p && p.catch && p.catch(()=>{}); }
  if (RM || IS_CAP) return; const m = $('.hero__media', h), c = $('.hero__copy', h);
  Bus.add(y => { if (y > innerHeight*1.2) return; const t = Math.min(1, y/innerHeight); if (m) m.style.transform = `translate3d(0,${(y*.35).toFixed(1)}px,0) scale(${1+t*.08})`; if (c){ c.style.transform = `translate3d(0,${(y*.18).toFixed(1)}px,0)`; c.style.opacity = 1 - t*1.25; } }); }
function lightbox(){ const tr = $$('[data-lb]'); if (!tr.length) return; const lb = document.createElement('div'); lb.className='lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true');
  lb.innerHTML = `<button class="lb__close" aria-label="Close video"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="lb__frame"><div class="lb__box"></div><p class="lb__title"></p></div>`; document.body.appendChild(lb);
  const box = $('.lb__box', lb), title = $('.lb__title', lb), cb = $('.lb__close', lb); let last = null;
  const open = (id, t) => { last = document.activeElement; box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${t}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; title.textContent = t; lb.classList.add('is-open'); document.body.style.overflow='hidden'; cb.focus(); };
  const close = () => { lb.classList.remove('is-open'); box.innerHTML=''; document.body.style.overflow=''; last && last.focus(); };
  tr.forEach(t => t.addEventListener('click', e => { e.preventDefault(); open(t.dataset.lb, t.dataset.title || 'Video'); })); cb.addEventListener('click', close); lb.addEventListener('click', e => { if (e.target === lb) close(); }); addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-open')) close(); });
  const v = Q.get('lb'); if (v){ const t = tr.find(x => x.dataset.lb === v); if (t) open(v, t.dataset.title); } }
function countdown(){ const el = $('[data-countdown]'); if (!el) return; const to = new Date(el.dataset.countdown); if (isNaN(to)) return;
  const tick = () => { const d = Math.max(0, to - Date.now())/1000; const set = (k,v) => { const e = $(`[data-cd=${k}]`, el); if (e) e.textContent = String(v).padStart(2,'0'); };
    set('d', Math.floor(d/86400)); set('h', Math.floor(d%86400/3600)); set('m', Math.floor(d%3600/60)); set('s', Math.floor(d%60)); }; tick(); if (!IS_CAP) setInterval(tick, 1000); }
function capture(){ if (!IS_CAP) return; const y = +(Q.get('y')||0); const apply = () => { document.body.style.transform = `translateY(-${y}px)`; }; addEventListener('load', () => setTimeout(apply, 300)); setTimeout(apply, 1500); }
function register(){ const f = $('.reg'); if (!f) return; const g = $('.reg__gform'), status = $('.reg__status', f), map = window.KOI_GFORM || {};
  const mark = (fl, bad) => fl.classList.toggle('is-invalid', bad);
  $$('input,select,textarea', f).forEach(i => i.addEventListener('input', () => mark(i.closest('.field'), false)));
  f.addEventListener('submit', async e => { e.preventDefault(); let ok = true, first = null;
    $$('.field', f).forEach(fl => { const inp = $('input:not([type=radio]):not([type=checkbox]), select, textarea', fl); if (inp){ const bad = (inp.required && !inp.value.trim()) || (inp.type === 'email' && inp.value && !/^\S+@\S+\.\S+$/.test(inp.value)); mark(fl, bad); if (bad){ ok = false; first ||= inp; } return; }
      const radios = $$('input[type=radio]', fl); if (radios.length){ const bad = !radios.some(r => r.checked); mark(fl, bad); if (bad){ ok = false; first ||= radios[0]; } }
      const boxes = $$('input[type=checkbox]', fl); if (boxes.length){ const bad = !boxes.some(c => c.checked); mark(fl, bad); if (bad){ ok = false; first ||= boxes[0]; } } });
    if (!ok){ status.textContent = 'Please complete the highlighted fields.'; status.className = 'reg__status is-err'; first && first.closest('.field').scrollIntoView({ block:'center', behavior:'smooth' }); return; }
    const days = $$('input[name=days]:checked', f).map(x => x.value);
    const d = { first: f.first.value.trim(), middle: f.middle.value.trim(), surname: f.surname.value.trim(), gender: f.querySelector('input[name=gender]:checked').value, age: f.age.value, address: f.address.value.trim(), country: f.country.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), participation: f.querySelector('input[name=participation]:checked').value, detail: f.detail.value.trim(), days, dietary: f.dietary.value.trim(), expectation: f.expectation.value.trim() };
    status.className = 'reg__status'; status.textContent = 'Sending...'; const btn = $('.btn', f); btn.disabled = true;
    try {
      if (g){ g.innerHTML = ''; Object.entries(map).forEach(([k, name]) => { const vals = k === 'days' ? d.days : [d[k] ?? '']; vals.forEach(v => { const inp = document.createElement('input'); inp.type = 'hidden'; inp.name = name; inp.value = v; g.appendChild(inp); }); }); g.submit(); }
      const row = { site:'koinonia', edition: f.dataset.edition, first_name:d.first, middle_name:d.middle || null, surname:d.surname, gender:d.gender, age_range:d.age, residence:d.address, country:d.country, phone:d.phone, email:d.email, participation:d.participation, participation_detail:d.detail || null, days:d.days.join(', '), dietary:d.dietary, expectation:d.expectation };
      if (window.CCFC && window.CCFC.register){ const r = await window.CCFC.register(row); if (r && r.error) throw r.error; }
      else { const cfg = window.CCFC_CONFIG || {}; if (cfg.supabaseUrl && cfg.supabaseKey){ const r = await fetch(cfg.supabaseUrl + '/rest/v1/registrations', { method:'POST', headers:{ 'Content-Type':'application/json', apikey: cfg.supabaseKey, Authorization: 'Bearer ' + cfg.supabaseKey, Prefer: 'return=minimal' }, body: JSON.stringify(row) }); if (!r.ok) throw new Error('registration ' + r.status); } }
      f.reset(); $$('.field.is-invalid', f).forEach(x => x.classList.remove('is-invalid')); status.textContent = 'Registered. Thank you, ' + d.first + '. We will be in touch with dates and delegate rates.'; status.className = 'reg__status is-ok'; status.scrollIntoView({ block:'center', behavior:'smooth' });
    } catch (err){ status.textContent = 'Something went wrong. Please try again or WhatsApp the office.'; status.className = 'reg__status is-err'; } finally { btn.disabled = false; } }); }

/* ---------- Koi 25' photo gallery: day groups, lightbox, download, share, download-all zip ---------- */
function photos(){ const grid = $('[data-photos]'); if (!grid) return;
  const count = $('.phx__count'), dlWrap = $('[data-zips]');
  const DAYS = { '2025-12-19':'Day 1, Friday 19 December', '2025-12-20':'Day 2, Saturday 20 December', '2025-12-21':'Day 3, Sunday 21 December' };
  const label = p => !p.taken ? 'More moments' : (DAYS[p.taken.slice(0,10)] || (p.taken < '2025-12-19' ? 'Behind the scenes: setting up the venue' : 'More moments'));
  const order = ['Day 1, Friday 19 December','Day 2, Saturday 20 December','Day 3, Sunday 21 December','More moments','Behind the scenes: setting up the venue'];
  fetch('/' + grid.dataset.photos.replace(/^\//, '')).then(r => r.json()).then(list => {
    const groups = {}; list.forEach((p, i) => { p.i = i; (groups[label(p)] = groups[label(p)] || []).push(p); });
    const mb = Math.round(list.reduce((t, p) => t + p.kb, 0) / 1024);
    count.textContent = `${list.length} photos`;
    dlWrap.innerHTML = `<button class="btn" type="button" data-dlall>Download all ${list.length} photos <small>${mb} MB zip</small></button>`;
    grid.innerHTML = order.filter(g => groups[g]).map(g => `<section class="phx__group"><h2>${g}<span>${groups[g].length}</span></h2><div class="phx__tiles">${groups[g].map(p => `<button class="phx__tile" type="button" data-i="${p.i}" aria-label="Open photo ${p.n} of ${list.length}"><img src="/assets/k25/thumb/${p.id}.webp" width="${Math.round(p.w/4)}" height="${Math.round(p.h/4)}" loading="lazy" decoding="async" alt="Koi 25' photo ${p.n}, ${g.split(',')[0]}"></button>`).join('')}</div></section>`).join('');
    const lb = document.createElement('div'); lb.className = 'plb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = `<div class="plb__top"><span class="plb__n" aria-live="polite"></span><div class="plb__acts"><a class="btn plb__dl" download>${ICON_DL} Download</a><button type="button" class="plb__btn plb__share" aria-label="Share this photo">${ICON_SHARE}</button><button type="button" class="plb__btn plb__x" aria-label="Close viewer">&times;</button></div></div>
      <button type="button" class="plb__nav plb__prev" aria-label="Previous photo">&#8249;</button><figure class="plb__fig"><img alt=""><div class="plb__spin" aria-hidden="true"></div></figure><button type="button" class="plb__nav plb__next" aria-label="Next photo">&#8250;</button>`;
    document.body.appendChild(lb);
    const img = $('.plb__fig img', lb), fig = $('.plb__fig', lb); let cur = -1, back = null;
    const url = p => '/assets/k25/photo/' + p.id + '.jpg';
    const show = i => { cur = (i + list.length) % list.length; const p = list[cur];
      fig.classList.add('is-loading'); img.onload = () => fig.classList.remove('is-loading'); img.src = url(p); img.alt = `Koi 25' photo ${p.n}, ${label(p).split(',')[0]}`;
      $('.plb__n', lb).textContent = `${p.n} / ${list.length}`; const dl = $('.plb__dl', lb); dl.href = url(p); dl.setAttribute('download', `Koi25-${String(p.n).padStart(3, '0')}.jpg`);
      [cur - 1, cur + 1].forEach(k => { const q = list[(k + list.length) % list.length]; if (q) { const pre = new Image(); pre.src = url(q); } });
      history.replaceState(null, '', location.pathname + '?photo=' + p.id); };
    const open = (i, from) => { back = from || document.activeElement; lb.hidden = false; document.documentElement.style.overflow = 'hidden'; requestAnimationFrame(() => lb.classList.add('is-open')); show(i); $('.plb__x', lb).focus(); };
    const close = () => { lb.classList.remove('is-open'); document.documentElement.style.overflow = ''; setTimeout(() => { lb.hidden = true; img.removeAttribute('src'); }, 250); history.replaceState(null, '', location.pathname); if (back) back.focus(); };
    grid.addEventListener('click', e => { const t = e.target.closest('.phx__tile'); if (t) open(+t.dataset.i, t); });
    $('.plb__x', lb).addEventListener('click', close); $('.plb__prev', lb).addEventListener('click', () => show(cur - 1)); $('.plb__next', lb).addEventListener('click', () => show(cur + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target === fig) close(); });
    addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
      else if (e.key === 'Tab'){ const f = $$('a,button', lb); const a = f.indexOf(document.activeElement); if (e.shiftKey && a <= 0){ e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f.length - 1){ e.preventDefault(); f[0].focus(); } } });
    let sx = null; fig.addEventListener('pointerdown', e => { sx = e.clientX; }); fig.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });
    $('.plb__share', lb).addEventListener('click', async () => { const link = location.origin + location.pathname + '?photo=' + list[cur].id;
      try { if (navigator.share) await navigator.share({ title: "Koi 25' photo", url: link }); else { await navigator.clipboard.writeText(link); flash('Link copied'); } } catch (_) {} });
    const flash = t => { let f = $('.plb__flash', lb); if (!f){ f = document.createElement('div'); f.className = 'plb__flash'; lb.appendChild(f); } f.textContent = t; f.classList.add('is-on'); setTimeout(() => f.classList.remove('is-on'), 1600); };
    const want = new URLSearchParams(location.search).get('photo'); const wi = list.findIndex(p => p.id === want); if (wi >= 0) open(wi);
    $('[data-dlall]').addEventListener('click', async e => { const b = e.currentTarget; if (b.disabled) return; b.disabled = true; const orig = b.innerHTML;
      try {
        if (!window.JSZip) await new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); });
        const zip = new JSZip();
        for (let k = 0; k < list.length; k++){ b.innerHTML = `Preparing ${k + 1} of ${list.length}`; const blob = await (await fetch(url(list[k]))).blob(); zip.file(`Koi25-${String(list[k].n).padStart(3, '0')}.jpg`, blob); }
        b.innerHTML = 'Zipping...'; const out = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(out); a.download = 'Koi25-photos.zip'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
        b.innerHTML = 'Downloaded. Thank you for sharing the family moments.';
      } catch (err){ b.innerHTML = 'Could not prepare the zip. Please try again.'; }
      setTimeout(() => { b.innerHTML = orig; b.disabled = false; }, 5000); });
  }).catch(() => { count.textContent = 'The photos could not load. Please refresh the page.'; });
}
const ICON_DL = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
const ICON_SHARE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
function revealSafety(){ const inView = () => $$('[data-rv]:not(.is-rv),[data-rv-stagger]:not(.is-rv)').forEach(e => { const r = e.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) e.classList.add('is-rv'); });
  const target = () => { const id = location.hash.slice(1); const t = id && document.getElementById(id); if (t) $$('[data-rv],[data-rv-stagger]', t).forEach(e => e.classList.add('is-rv')); inView(); };
  addEventListener('hashchange', () => setTimeout(target, 50)); addEventListener('pageshow', () => setTimeout(target, 50)); setTimeout(target, 400); setTimeout(inView, 1800); }
function boot(){ register(); photos(); split(); grain(); nav(); reveals(); revealSafety(); hero(); lightbox(); countdown(); capture(); $$('.year').forEach(e => e.textContent = new Date().getFullYear()); }
document.readyState === 'loading' ? addEventListener('DOMContentLoaded', boot) : boot();
})();
