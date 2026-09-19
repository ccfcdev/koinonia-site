/* KOINONIA EXPERIENCE — motion. Dependency-free, degrades to static. */
(() => {
'use strict';
if (/^\/k26(?:\.html)?\/?$/.test(location.pathname) && location.hash === '#register') { location.replace('/register' + location.search); return; }
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
function hero(){ const h = $('.hero'); if (!h) return; const v = $('video', h); if (v && !RM && !IS_CAP){ const conn = navigator.connection || {}; const slow = !!conn.saveData || ['slow-2g','2g','3g'].includes(conn.effectiveType) || innerWidth < 768;   /* phones keep the still poster: faster and kinder to mobile data */ const px = Math.max(screen.width, screen.height) * (devicePixelRatio || 1); const pick = slow ? null : (px >= 2560 && (conn.downlink || 10) >= 10 && v.dataset.src4k) ? v.dataset.src4k : (Math.min(screen.width, screen.height) * (devicePixelRatio || 1) < 1100 || innerWidth < 900) && v.dataset.src720 ? v.dataset.src720 : v.dataset.src; if (pick){ const start = () => { v.src = pick; v.muted = true; const p = v.play(); p && p.catch && p.catch(()=>{}); }; if (document.readyState === 'complete') setTimeout(start, 900); else addEventListener('load', () => setTimeout(start, 900), { once: true }); } }
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
function register(){
  const f = $('.reg'); if (!f) return;
  const status = $('.reg__status', f), btn = $('button[type=submit]', f);
  const same = f.elements.same_whatsapp, whatsapp = f.elements.whatsapp;
  const syncPhone = () => { whatsapp.disabled = same.checked; if (same.checked) whatsapp.value = f.phone.value; };
  same.addEventListener('change', syncPhone); f.phone.addEventListener('input', syncPhone);
  let sending = false, saved = false, submissionId = crypto.randomUUID();
  // Enhance each form select with a keyboard-accessible listbox; retain its value for form helpers.
  $$('select', f).forEach(select => {
    const wrapper = document.createElement('div'); wrapper.className = 'reg-select'; select.before(wrapper); wrapper.append(select);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'reg-select__button';
    button.setAttribute('role', 'combobox'); button.setAttribute('aria-haspopup', 'listbox'); button.setAttribute('aria-expanded', 'false');
    const list = document.createElement('div'); list.className = 'reg-select__list'; list.id = select.id + '-options'; list.setAttribute('role', 'listbox'); list.hidden = true;
    const label = document.querySelector('label[for="' + select.id + '"]'); if (label){ label.id = select.id + '-label'; button.setAttribute('aria-labelledby', label.id); label.addEventListener('click', e => { e.preventDefault(); button.focus(); }); }
    button.setAttribute('aria-controls', list.id); button.setAttribute('aria-required', String(select.required));
    select.hidden = true; select.tabIndex = -1; wrapper.append(button, list);
    let active = 0; const options = Array.from(select.options);
    const update = () => { button.textContent = select.selectedOptions[0]?.textContent || 'Select'; Array.from(list.children).forEach((el,i) => el.setAttribute('aria-selected', String(i === select.selectedIndex))); };
    const close = () => { list.hidden = true; button.setAttribute('aria-expanded','false'); button.removeAttribute('aria-activedescendant'); };
    const focus = i => { active = Math.max(0, Math.min(options.length-1,i)); button.setAttribute('aria-activedescendant', list.children[active].id); Array.from(list.children).forEach((el,j) => el.classList.toggle('is-active',j===active)); list.children[active].scrollIntoView({block:'nearest'}); };
    const open = () => { list.hidden = false; button.setAttribute('aria-expanded','true'); focus(select.selectedIndex); };
    const choose = i => { select.selectedIndex = i; select.dispatchEvent(new Event('input',{bubbles:true})); select.dispatchEvent(new Event('change',{bubbles:true})); update(); close(); button.focus(); };
    options.forEach((o,i) => { const el = document.createElement('div'); el.id = select.id + '-option-' + i; el.setAttribute('role','option'); el.textContent = o.textContent; el.addEventListener('click', () => choose(i)); list.append(el); });
    button.addEventListener('click', () => list.hidden ? open() : close());
    button.addEventListener('keydown', e => {
      if (['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(e.key)){ e.preventDefault(); if (list.hidden){ open(); return; } if (e.key==='Enter'||e.key===' '){ choose(active); return; } focus(e.key==='Home'?0:e.key==='End'?options.length-1:active+(e.key==='ArrowDown'?1:-1)); }
      else if(e.key==='Escape'){ e.preventDefault(); close(); } else if(e.key==='Tab') close();
      else if(e.key.length===1){ const i=options.findIndex(o => o.text.toLowerCase().startsWith(e.key.toLowerCase())); if(i>=0){ if(list.hidden) open(); focus(i); } }
    });
    document.addEventListener('click', e => { if(!wrapper.contains(e.target)) close(); });
    select.addEventListener('change', update); update();
  });
  const mark = (input, bad) => { input.closest('.field')?.classList.toggle('is-invalid', bad); input.setAttribute('aria-invalid', String(bad)); if(input.tagName==='SELECT') input.parentElement.querySelector('button')?.setAttribute('aria-invalid',String(bad)); };
  $$('input,select,textarea', f).forEach(i => i.addEventListener('input', () => mark(i,false)));
  f.addEventListener('submit', async e => {
    e.preventDefault(); if(sending || saved) return;
    const inputs = $$('input,select,textarea', f).filter(i => !i.disabled);
    let first = null;
    inputs.forEach(i => { const bad = !i.checkValidity() || (i.required && !i.value.trim()); mark(i,bad); if(bad) first ||= i; });
    const days = $$('input[name=days]:checked', f).map(i => i.value);
    const daysInput = $('input[name=days]',f); mark(daysInput,!days.length); if(!days.length) first ||= daysInput;
    if(first){ status.textContent='Please complete the highlighted required fields.'; status.className='reg__status is-err'; (first.hidden ? first.parentElement.querySelector('button') : first).focus(); return; }
    const row = { id:submissionId, site:'koinonia', edition:f.dataset.edition,
      first_name:f.first.value.trim(), middle_name:f.middle.value.trim()||null, surname:f.surname.value.trim(),
      gender:f.elements.gender.value, age_range:f.age.value, residence:f.address.value.trim(), country:f.country.value.trim(),
      phone:f.phone.value.trim(), whatsapp_number:(same.checked ? f.phone.value : whatsapp.value).trim()||null,
      email:f.email.value.trim()||null, participation:f.elements.participation.value, participation_detail:f.detail.value.trim()||null,
      days:days.includes('All Three')?'All Three':days.join(', '), dietary:f.dietary.value.trim(), expectation:f.expectation.value.trim() };
    sending=true; btn.disabled=true; status.className='reg__status'; status.textContent='Saving your registration...';
    try {
      if(!window.CCFC?.register) throw new Error('Registration is unavailable');
      const result=await window.CCFC.register(row); if(!result || result.offline || result.error) throw new Error('Registration could not be confirmed');
      saved=true;
      const dialog=document.createElement('dialog'); dialog.className='reg-thanks'; dialog.setAttribute('aria-labelledby','reg-thanks-title');
      // Shape-checked before it goes near innerHTML, even though it comes from our own database.
      const ref = /^[A-Z]{1,4}[0-9]{2,12}$/.test(result.reference || '') ? result.reference : '';
      dialog.innerHTML='<h2 id="reg-thanks-title">Thank you for registering!</h2>'+(ref?'<p class="reg-thanks__ref">Your registration number<b>'+ref+'</b><small>Keep it. Quote it if you contact the church office about your registration.</small></p>':'')+'<p>Your Koinonia registration has been received. We look forward to gathering with you.</p><button type="button" class="btn">Back to Koinonia home</button>';
      document.body.append(dialog); const finish=()=>location.assign('/'); dialog.addEventListener('close',finish); dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();}); $('button',dialog).addEventListener('click',()=>dialog.close()); dialog.showModal();
      status.textContent='Registration received.';
    } catch(err){ status.textContent='We could not confirm your registration. Please try again or contact the church office.'; status.className='reg__status is-err'; }
    finally { sending=false; btn.disabled=saved; }
  });
}

/* ---------- edition photo galleries (k24-photos, k25-photos): day groups, lightbox, download, share, download-all zip.
   The grid says what to show: data-photos (list json), data-dir (assets/<ed>), data-prefix (download names), data-name, data-days {date: heading};
   photos carrying a `group` (story sections, for sets without capture dates) are shown under that heading instead ---------- */
function photos(){ const grid = $('[data-photos]'); if (!grid) return;
  const count = $('.phx__count'), dlWrap = $('[data-zips]'), D = grid.dataset, N = (D.photos.match(/k(\d\d)/) || [])[1] || '';
  const DIR = '/' + (D.dir || 'assets/k' + N).replace(/^\/|\/$/g, ''), PRE = D.prefix || 'Koi' + N, NAME = D.name || `Koi ${N}'`;
  const DAYS = D.days ? JSON.parse(D.days) : {}, FIRST = Object.keys(DAYS).sort()[0] || '', SETUP = 'Behind the scenes: setting up the venue';
  const label = p => p.group || (!p.taken ? 'More moments' : (DAYS[p.taken.slice(0,10)] || (p.taken < FIRST ? SETUP : 'More moments')));
  fetch('/' + grid.dataset.photos.replace(/^\//, '')).then(r => r.json()).then(list => {
    const order = [...new Set(list.map(p => p.group).filter(Boolean)), ...Object.values(DAYS), 'More moments', SETUP];   // story sections (undated sets) first, then days
    const groups = {}; list.forEach((p, i) => { p.i = i; (groups[label(p)] = groups[label(p)] || []).push(p); });
    const mb = Math.round(list.reduce((t, p) => t + p.kb, 0) / 1024);
    count.textContent = `${list.length} photos`;
    dlWrap.innerHTML = `<button class="btn" type="button" data-dlall>Download all ${list.length} photos <small>${mb} MB zip</small></button>`;
    grid.innerHTML = order.filter(g => groups[g]).map(g => `<section class="phx__group"><h2>${g}<span>${groups[g].length}</span></h2><div class="phx__tiles">${groups[g].map(p => `<button class="phx__tile" type="button" data-i="${p.i}" aria-label="Open photo ${p.n} of ${list.length}"><img src="${DIR}/thumb/${p.id}.webp" width="${Math.round(p.w/4)}" height="${Math.round(p.h/4)}" loading="lazy" decoding="async" alt="${NAME} photo ${p.n}, ${g.split(',')[0]}"></button>`).join('')}</div></section>`).join('');
    const lb = document.createElement('div'); lb.className = 'plb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = `<div class="plb__top"><span class="plb__n" aria-live="polite"></span><div class="plb__acts"><a class="btn plb__dl" href="${location.pathname}" download>${ICON_DL} Download</a><button type="button" class="plb__btn plb__share" aria-label="Share this photo">${ICON_SHARE}</button><button type="button" class="plb__btn plb__x" aria-label="Close viewer">&times;</button></div></div>
      <button type="button" class="plb__nav plb__prev" aria-label="Previous photo">&#8249;</button><figure class="plb__fig"><img alt=""><div class="plb__spin" aria-hidden="true"></div></figure><button type="button" class="plb__nav plb__next" aria-label="Next photo">&#8250;</button>`;
    document.body.appendChild(lb);
    const img = $('.plb__fig img', lb), fig = $('.plb__fig', lb); let cur = -1, back = null;
    const url = p => DIR + '/photo/' + p.id + '.jpg', file = p => `${PRE}-${String(p.n).padStart(3, '0')}.jpg`;
    const show = i => { cur = (i + list.length) % list.length; const p = list[cur];
      fig.classList.add('is-loading'); img.onload = () => fig.classList.remove('is-loading'); img.src = url(p); img.alt = `${NAME} photo ${p.n}, ${label(p).split(',')[0]}`;
      $('.plb__n', lb).textContent = `${p.n} / ${list.length}`; const dl = $('.plb__dl', lb); dl.href = url(p); dl.setAttribute('download', file(p));
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
      try { if (navigator.share) await navigator.share({ title: `${NAME} photo`, url: link }); else { await navigator.clipboard.writeText(link); flash('Link copied'); } } catch (_) {} });
    const flash = t => { let f = $('.plb__flash', lb); if (!f){ f = document.createElement('div'); f.className = 'plb__flash'; lb.appendChild(f); } f.textContent = t; f.classList.add('is-on'); setTimeout(() => f.classList.remove('is-on'), 1600); };
    const want = new URLSearchParams(location.search).get('photo'); const wi = list.findIndex(p => p.id === want); if (wi >= 0) open(wi);
    $('[data-dlall]').addEventListener('click', async e => { const b = e.currentTarget; if (b.disabled) return; b.disabled = true; const orig = b.innerHTML;
      try {
        if (!window.JSZip) await new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); });
        const zip = new JSZip();
        for (let k = 0; k < list.length; k++){ b.innerHTML = `Preparing ${k + 1} of ${list.length}`; const blob = await (await fetch(url(list[k]))).blob(); zip.file(file(list[k]), blob); }
        b.innerHTML = 'Zipping...'; const out = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(out); a.download = `${PRE}-photos.zip`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
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
function revealAboveFold(){ const h = innerHeight; $$('[data-rv],[data-rv-stagger],.ml').forEach(e => { const r = e.getBoundingClientRect(); if (r.top < h && r.bottom > 0){ e.style.transition = 'none'; e.classList.add('is-rv'); $$('*', e).forEach(c => { if (c.matches('.ml>span,[data-rv-stagger]>*')) c.style.transition = 'none'; }); requestAnimationFrame(() => requestAnimationFrame(() => { e.style.transition = ''; })); } }); }
function boot(){ register(); photos(); split(); revealAboveFold(); grain(); nav(); reveals(); revealSafety(); hero(); lightbox(); countdown(); capture(); $$('.year').forEach(e => e.textContent = new Date().getFullYear()); }
document.readyState === 'loading' ? addEventListener('DOMContentLoaded', boot) : boot();
})();
