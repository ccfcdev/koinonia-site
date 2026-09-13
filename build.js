#!/usr/bin/env node
/* KOINONIA EXPERIENCE site builder. node build.js → index.html, k24.html, k25.html, k26.html */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const hash = f => crypto.createHash('md5').update(fs.readFileSync(path.join(__dirname, f))).digest('hex').slice(0, 8);
const V = { css: hash('css/site.css'), js: hash('js/site.js'), fonts: hash('css/fonts.css'), core: hash('css/core.css'), corejs: hash('js/core.js') };
const WA = '260975065391', MAIN = 'https://ccfczambia.org';   // MAIN: the church's main domain once registered
/* Registration: mirrors the church's Google Form (currently the K24 form). Responses go straight into that form's sheet,
   and into the shared Supabase `registrations` table once js/config.js on the main site is filled in. */
const GFORM = { action: 'https://docs.google.com/forms/d/e/1FAIpQLSetLMZPCEe6hYlxNF67OMruz74pFvftTg5TQqR4NITIvX8O0A/formResponse',
  entry: { first:'entry.2092238618', surname:'entry.325064257', gender:'entry.1277704406', age:'entry.1310610037', residence:'entry.1808511093', phone:'entry.358701520', email:'entry.1556369182', participation:'entry.140544252', detail:'entry.366338568', days:'entry.1753222212', dietary:'entry.428609997', expectation:'entry.1127212752' } };
const AGES = ['0-10 Years Old ', '11-15 Years Old', '16-20 Years Old', '21-30 Years Old ', '31-40 Years Old', '41-50 Years Old', '51-60 Years Old', '61 Years and Older'];
const ICON = {
  back: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  arrow: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
};
const img = (n, alt, sizes='(min-width:900px) 50vw, 100vw', eager=false) => `<img src="assets/img/${n}-1280.webp" srcset="assets/img/${n}-800.webp 800w, assets/img/${n}-1280.webp 1280w" sizes="${sizes}" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
const imgP = (n, alt) => `<img src="assets/img/${n}-800.webp" srcset="assets/img/${n}-480.webp 480w, assets/img/${n}-800.webp 800w" sizes="(min-width:900px) 20vw, 50vw" alt="${alt}" loading="lazy" decoding="async">`;

/* ---------- editions (facts from the church's posters and channel; K24 and K26 details are open) ---------- */
const EDITIONS = {
  k24: { key:'k24', n:'24', title:'Koinonia 24 Experience', when:'21 to 22 December 2024', where:'Ibex Hill, opposite Chainda Legacy Academy, Lusaka', theme:'', status:'past',
    blurb:'Two days in Ibex Hill where the family first gathered under the Koinonia name: worship, the Word, and members sharing preaching, songs, dance, poems and testimonies.',
    videos:[], speakers:[], hero:'worship-6', gallery:[] },
  k25: { key:'k25', n:'25', title:'Koinonia 25 Experience', when:'19 to 21 December 2025', where:'Grace Exploits Event Center, Don Gordon Road (opposite Don Gordon School), Chainama Minestone, Lusaka', theme:'Going Deep and Multiplying', status:'past',
    blurb:'Three days under one roof with the churches of Zambia, Zimbabwe, Malawi and the wider family. Worship Connect led, five leaders taught, and Lusaka sang.',
    cost:'K200 for Zambian delegates, USD 10 for international delegates',
    videos:[
      { id:'Xq1RXcOhWmE', t:'Praise and Worship Medley: Chawama, Hallelujah Hosanna', by:'Worship Connect, K25', img:'worship-2' },
      { id:'wrOzwYRt4yM', t:'Praise Medley: You Are So Good, Bena Ba Suma Kuli Ine', by:'Worship Connect, K25', img:'worship-5' },
    ],
    speakers:[
      ['portrait-katsande','Bishop Farai Katsande','Global Bishop, CCFC International'],
      ['portrait-weston-chewe','Reverend Weston Chewe','Presiding Bishop, CCFC Zambia'],
      ['portrait-francis-chewe','Pastor Francis Chewe','Senior Pastor, CCFC Zambia'],
      ['portrait-nyirenda','Bishop Brain Nyirenda','Presiding Bishop, CCFC Malawi'],
      ['portrait-marodza','Pastor Stephen Marodza','Senior Pastor, CCFC Zimbabwe'],
    ],
    hero:'worship-1', gallery:['crowd-koinonia','worship-2','worship-3','worship-7','worship-8','worship-6','worship-4'] },
  k26: { key:'k26', n:'26', title:'Koinonia 26 Experience', when:'December 2026', where:'Lusaka, Zambia', theme:'', status:'next',
    blurb:'The next gathering of the family. Dates, venue and theme will be announced here first. Tell us you are coming and we will keep you posted.',
    videos:[], speakers:[], hero:'worship-3', gallery:[] },
};

const MENU = [['index.html','Home','The family conference'],['updates.html','Updates','News, videos and photos'],['k26.html','Koinonia 26','December 2026, register now'],['k25.html','Koinonia 25','Going Deep and Multiplying'],['k24.html','Koinonia 24','Where it began, Ibex Hill']];
function layout(p){
  const links = [['index.html','Home'],['k24.html','K24'],['k25.html','K25'],['k26.html','K26'],['updates.html','Updates']].map(([f,l]) => `<li><a href="${f}"${f===p.file?' aria-current="page"':''}>${l}</a></li>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${p.title === 'Home' ? 'Koinonia Experience | Annual Family Conference in Lusaka, Zambia | CCFC' : p.title + ' | Koinonia Experience, Lusaka'}</title>
<meta name="description" content="${p.desc}">
<link rel="canonical" href="https://koinonia.ccfczambia.org/${p.file === 'index.html' ? '' : p.file.replace(/\.html$/, '')}">
<meta name="robots" content="${p.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">
<meta name="theme-color" content="#150F3A">
<link rel="icon" href="assets/logo/favicon-32.png?v=3" sizes="32x32" type="image/png"><link rel="icon" href="assets/logo/favicon-192.png?v=3" sizes="192x192" type="image/png"><link rel="icon" href="assets/logo/favicon-512.png?v=3" sizes="512x512" type="image/png"><link rel="apple-touch-icon" href="assets/logo/apple-touch-icon.png?v=3">
<meta property="og:type" content="website"><meta property="og:site_name" content="Koinonia Experience"><meta property="og:title" content="${p.title} | Koinonia Experience"><meta property="og:description" content="${p.desc}"><meta property="og:image" content="assets/img/${p.og||'worship-1'}-1280.webp">
<link rel="preload" href="assets/fonts/BricolageGrotesque-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/fonts.css?v=${V.fonts}"><link rel="stylesheet" href="css/site.css?v=${V.css}"><link rel="stylesheet" href="css/core.css?v=${V.core}">
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'EventSeries',name:'Koinonia Experience',organizer:{'@type':'Organization',name:'Christ Connect Family Church'},location:{'@type':'Place',name:'Lusaka, Zambia'}})}</script>
</head>
<body>
<a class="sr" href="#main">Skip to content</a>
<header class="nav"><div class="wrap">
  <a class="nav__brand" href="index.html" aria-label="Koinonia Experience, home"><img src="assets/logo/ccfc-mark-white.png?v=2" alt="Christ Connect Family Church"><b>KOINONIA<i>Experience</i></b></a>
  <ul class="nav__links">${links}</ul>
  <div class="row"><span class="nav__account"></span><a class="btn btn--ghost nav__home" href="${MAIN}" title="Back to the main church website">${ICON.back}Church website</a><a class="btn nav__cta" href="k26.html#register">I am coming to K26 ${ICON.arrow}</a><button class="nav__burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><i></i><span>Menu</span></button></div>
</div></header>
<div class="menu__veil"></div>
<nav class="menu" aria-label="Site menu" id="menu">
  <div class="menu__top"><a class="nav__brand" href="index.html"><img src="assets/logo/ccfc-mark-white.png?v=2" alt=""><b>KOINONIA<i>Experience</i></b></a><button class="menu__close" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <div class="menu__scroll">
    <div class="menu__quick"><a class="mq mq--a" href="k26.html#register"><b>I am coming to K26</b><small>Register in two minutes</small></a><a class="mq mq--b" href="k25.html#videos"><b>Watch K25</b><small>Both worship sets</small></a></div>
    <h4 class="menu__h">Pages</h4><ul class="menu__list">${MENU.map(([f,l,t],i) => `<li style="--i:${i}"><a href="${f}"${f===p.file?' aria-current="page"':''}><b>${l}</b><small>${t}</small><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></a></li>`).join('')}</ul>
    <h4 class="menu__h">Our sites</h4><div class="menu__cards"><a class="mcard mcard--church" href="${MAIN}"><b>CCFC Zambia</b><small>Back to the church website</small><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></a><a class="mcard mcard--wc" href="https://worship.ccfczambia.org"><b>WORSHIP<i>Connect</i></b><small>The worship team, all videos</small><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></a></div>
  </div>
  <div class="menu__bottom"><div class="menu__account"></div><a class="menu__wa" href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp the office</a></div>
</nav>
<main id="main">${p.body}</main>
<footer class="foot"><div class="wrap"><span>Koinonia Experience is the annual family conference of Christ Connect Family Church.</span><span><a href="${MAIN}">CCFC Zambia</a> &nbsp;&middot;&nbsp; <a href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp</a> &nbsp;&middot;&nbsp; <a href="https://www.youtube.com/@christconnectfamilychurchz7833" target="_blank" rel="noopener">YouTube</a></span><span><a href="${MAIN}/sitemap">Site map</a> &nbsp;&middot;&nbsp; &copy; <span class="year"></span> CCFC</span></div></footer>
<script>window.KOI_GFORM=${JSON.stringify(GFORM.entry)};window.CCFC_CONFIG={supabaseUrl:'https://dcqydtkjzgilyjnjyisb.supabase.co',supabaseKey:'sb_publishable_gPig-ePcoJIUnQ4fij6viw_ukAhlifp'}</script>
<script src="js/site.js?v=${V.js}" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" defer></script>
<script>window.CCFC_SITE={key:'koinonia'};window.CCFC_CONFIG=window.CCFC_CONFIG||{supabaseUrl:'https://dcqydtkjzgilyjnjyisb.supabase.co',supabaseKey:'sb_publishable_gPig-ePcoJIUnQ4fij6viw_ukAhlifp'}</script>
<script src="js/core.js?v=${V.corejs}" defer></script>
</body></html>`;
}

const videos = list => list.length ? `<div class="vgrid" data-rv-stagger>${list.map(v => `<a href="https://www.youtube.com/watch?v=${v.id}" class="vcard" data-lb="${v.id}" data-title="${v.t}" aria-label="Play: ${v.t}"><div class="ph">${img(v.img,'','(min-width:800px) 50vw, 100vw')}</div><span class="vcard__play" aria-hidden="true">${ICON.play}</span><div class="vcard__meta"><b>${v.t}</b><span>${v.by}</span></div></a>`).join('')}</div>`
  : `<div class="vcard vcard--soon" data-rv><div><h3>Videos on the way</h3><p>Recordings from this edition will be added here as the media team uploads them.</p></div></div>`;
const gallery = list => list.length ? `<div class="gal" data-rv-stagger>${list.map(n => `<div class="ph">${img(n,'Koinonia moment','(min-width:800px) 25vw, 50vw')}</div>`).join('')}</div>`
  : `<div class="gal"><div class="gal__soon">Photographs from this edition are being added.</div></div>`;
const closeBlock = () => `<section class="close"><div class="bg">${img('worship-4','', '100vw')}</div><div class="wrap"><h2 data-split>Come home<br>this December.</h2><p>Koinonia is where the family remembers it is one body. Whether you belong to a CCFC church or you are curious, there is a seat for you at K26.</p><div class="row"><a class="btn" href="k26.html#register">I am coming to K26 ${ICON.arrow}</a><a class="btn btn--ghost" href="${MAIN}">Visit CCFC Zambia</a></div></div></section>`;

function editionPage(e){
  const metaRows = [['When', e.when], ['Where', e.where], e.theme ? ['Theme', `"${e.theme}"`] : null, e.cost ? ['Delegate fee', e.cost] : null].filter(Boolean);
  return { file:`${e.key}.html`, title:e.title, og:e.hero, desc:`${e.title}: ${e.when}, ${e.where}. ${e.blurb}`,
    body:`
<section class="hero hero--short"><div class="hero__media">${img(e.hero,'', '100vw', true)}</div><div class="hero__scrim"></div>
  <div class="wrap"><div class="hero__copy">
    <span class="pill ${e.status==='next'?'pill--orange':''}">${e.status==='next' ? 'Next edition' : 'Past edition'}</span>
    <h1 class="hero__k mt-1">KOINONIA <em>${e.n}'</em><span class="script">Experience</span></h1>
    ${e.theme ? `<div class="hero__theme">"${e.theme}"</div>` : ''}
    <p>${e.blurb}</p>
    <div class="row">${e.status==='next' ? `<a class="btn" href="#register">I am coming ${ICON.arrow}</a>` : (e.videos.length ? `<a class="btn" href="#videos">Watch the worship ${ICON.arrow}</a>` : '')}<a class="btn btn--ghost" href="#details">Details</a></div>
  </div>
  <div class="hero__meta" data-rv-stagger>${metaRows.slice(0,3).map(([k,v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}</div></div>
</section>
<section class="sec" id="details"><div class="wrap"><h2 data-split>The details</h2><div class="details mt-2" data-rv-stagger>
  ${metaRows.map(([k,v]) => `<div class="detail"><b>${k}</b><p>${v}</p></div>`).join('')}
  <div class="detail"><b>Who</b><p>Members, friends and first-time guests from every CCFC church<small>Zambia, Zimbabwe, Malawi and the wider family</small></p></div>
</div></div></section>
${e.speakers.length ? `<section class="sec" style="padding-top:0"><div class="wrap"><h2 class="mb-2" data-split>Who taught</h2><div class="speakers" data-rv-stagger>${e.speakers.map(([i,n,r]) => `<div class="spk"><div class="ph">${imgP(i,n)}</div><b>${n}</b><span>${r}</span></div>`).join('')}</div></div></section>` : ''}
<section class="sec" id="videos" style="padding-top:0"><div class="wrap"><h2 class="mb-2" data-split>Watch</h2>${videos(e.videos)}</div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><h2 class="mb-2" data-split>Moments</h2>${gallery(e.gallery)}</div></section>
${e.status==='next' ? `<section class="sec" id="register" style="padding-top:0"><div class="wrap"><div class="reg__grid">
  <div><h2 data-split>Register for<br>Koinonia ${e.n}.</h2><p class="lede mt-1" data-rv>Dates and venue are being finalised. Register now and you will be first to hear, with early delegate rates. Same questions as our conference form.</p>
    <div class="reg__side mt-2" data-rv><b>Need help?</b><p>Message the office on WhatsApp or email ccfczambia@gmail.com.</p><a class="btn btn--ghost" href="https://wa.me/${WA}?text=${encodeURIComponent('Hello, I need help registering for Koinonia 26.')}" target="_blank" rel="noopener">WhatsApp the office</a></div></div>
  <form class="reg" data-edition="${e.key}" novalidate data-rv="fade">
    <div class="reg__row"><div class="field"><label for="r-first">First name</label><input id="r-first" name="first" required autocomplete="given-name"></div><div class="field"><label for="r-sur">Surname</label><input id="r-sur" name="surname" required autocomplete="family-name"></div></div>
    <div class="reg__row"><div class="field"><label for="r-gender">Gender</label><select id="r-gender" name="gender" required><option value="">Select</option><option>Male</option><option>Female</option></select></div><div class="field"><label for="r-age">Age range</label><select id="r-age" name="age" required><option value="">Select</option>${AGES.map(a => `<option value="${a}">${a.trim()}</option>`).join('')}</select></div></div>
    <div class="field"><label for="r-res">Place of residence (where are you coming from?)</label><input id="r-res" name="residence" required placeholder="Town or area"></div>
    <div class="reg__row"><div class="field"><label for="r-phone">Contact number</label><input id="r-phone" name="phone" required type="tel" autocomplete="tel" placeholder="+260 97 ..."></div><div class="field"><label for="r-email">Email</label><input id="r-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"></div></div>
    <div class="field"><label>Your role at the conference</label><small>Are you sharing a talent, for example preaching, singing, dancing, a poem or a testimony? Limited slots.</small><div class="reg__choices"><label><input type="radio" name="participation" value="Participant " required> Participant</label><label><input type="radio" name="participation" value="Just Attending"> Just attending</label></div></div>
    <div class="field"><label for="r-detail">If participating, what are you doing?</label><input id="r-detail" name="detail" placeholder="Optional"></div>
    <div class="field"><label>Which days will you attend?</label><div class="reg__choices"><label><input type="checkbox" name="days" value="Day 1"> Day 1</label><label><input type="checkbox" name="days" value="Day 2"> Day 2</label><label><input type="checkbox" name="days" value="Both"> All days</label></div></div>
    <div class="field"><label for="r-diet">Any dietary restrictions? What foods do you not eat?</label><input id="r-diet" name="dietary" required placeholder="None, or list them"></div>
    <div class="field"><label for="r-exp">What is your expectation at Koinonia ${e.n} Experience?</label><textarea id="r-exp" name="expectation" rows="3" required></textarea></div>
    <div class="row"><button class="btn" type="submit">Register ${ICON.arrow}</button><span class="reg__status" aria-live="polite"></span></div>
    <p class="reg__fine">Your details go to the church office only and are used for conference planning.</p>
  </form></div>
  <iframe name="gform-sink" hidden aria-hidden="true"></iframe>
  <form hidden method="POST" action="${GFORM.action}" target="gform-sink" class="reg__gform">${Object.values(GFORM.entry).map(k => `<input type="hidden" name="${k}">`).join('')}</form>
</div></section>` : ''}
${closeBlock()}` };
}

const home = { file:'index.html', title:'Home', og:'worship-1', desc:'Koinonia Experience is the annual family conference of Christ Connect Family Church, held in Lusaka, Zambia every December. Editions K24, K25 and the upcoming K26.',
  body:`
<section class="hero"><div class="hero__media">${img('worship-1','Worship Connect leading praise at Koinonia 25','100vw',true)}<video data-src="assets/img/hero-1080.mp4" data-src4k="assets/img/hero-4k.mp4" poster="assets/img/hero-poster.jpg" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video></div><div class="hero__scrim"></div>
  <div class="wrap"><div class="hero__copy">
    <h1 class="hero__k">KOINONIA<span class="script">Experience</span></h1>
    <p>Once a year the whole Christ Connect family comes home to Lusaka: three days of worship, the Word and fellowship that sends us back out multiplying.</p>
    <div class="row"><a class="btn" href="k26.html#register">I am coming to K26 ${ICON.arrow}</a><a class="btn btn--ghost" href="k25.html#videos">Watch K25</a></div>
  </div>
  <div class="hero__meta" data-rv-stagger><div><b>Next</b><span>Koinonia 26, December 2026</span></div><div><b>Where</b><span>Lusaka, Zambia</span></div><div><b>Last theme</b><span>"Going Deep and Multiplying"</span></div></div></div>
</section>
<section class="sec"><div class="wrap"><h2 class="mb-2" data-split>Every Koinonia Experience</h2><div class="eds" data-rv-stagger>
  ${['k24','k25','k26'].map(k => { const e = EDITIONS[k]; return `<a class="ed ${e.status==='next'?'ed--next':''}" href="${k}.html">${img(e.hero,'','(min-width:900px) 33vw, 100vw')}<span class="pill ${e.status==='next'?'pill--orange':''}">${e.status==='next'?'Next':'Past'}</span><div class="ed__k">K<em>${e.n}</em></div><div class="ed__t">${e.theme ? `"${e.theme}"` : e.when}</div><p>${e.theme ? e.when + ' &middot; ' + e.where.split(',')[0] : e.blurb}</p><span class="link">Open ${k.toUpperCase()} ${ICON.arrow}</span></a>`; }).join('')}
</div></div></section>
<div class="facts" data-rv-stagger><div class="fact"><b>3</b><span>days together every December</span></div><div class="fact"><b>3+</b><span>nations in the room: Zambia, Zimbabwe, Malawi</span></div><div class="fact"><b>5</b><span>leaders taught at K25</span></div><div class="fact"><b>1</b><span>family under Christ</span></div></div>
<section class="sec"><div class="wrap"><h2 data-split>What Koinonia<br>means</h2><p class="lede mt-1" data-rv>Koinonia is the New Testament word for fellowship: sharing life, not just a room. "They devoted themselves to the apostles' teaching and to fellowship." Acts 2:42. The conference exists so that churches spread across borders remember they are one body, go deep in the Word together, and go home to multiply.</p></div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><h2 class="mb-2" data-split>From K25</h2>${videos(EDITIONS.k25.videos)}</div></section>
${closeBlock()}` };


const updates = { file:'updates.html', title:'Updates', og:'worship-3', desc:'Koinonia Experience updates: announcements about the next conference, speaker news, videos and photos from past editions, posted by the church media team.',
  body:`
<section class="hero hero--short"><div class="hero__media">${img('worship-3','', '100vw', true)}</div><div class="hero__scrim"></div><div class="wrap"><div class="hero__copy"><span class="pill pill--orange">Live from the team</span><h1 class="hero__k mt-1">Koinonia <span class="script">updates</span></h1><p>Announcements about K26, speaker news, and videos and photos from every edition, as the media team posts them. Sign in to react and comment.</p></div></div></section>
<section class="sec" id="feed" data-site="koinonia" style="padding-top:clamp(40px,6vw,70px)"><div class="wrap"><div class="feed__grid">
  <div><div class="feed__filters mb-2"></div><div class="feed__composer"></div><div class="feed__list mt-2"></div></div>
  <aside class="feed__side">
    <div class="side"><span class="eyebrow">Next edition</span><h3>Koinonia 26, December 2026</h3><p>Dates, venue and theme will be announced here first.</p><a class="btn" href="k26.html#register">I am coming to K26 ${ICON.arrow}</a></div>
    <div class="side"><h3>Watch K25</h3><p>Both Worship Connect sets from Koinonia 25 are up.</p><a class="link" href="k25.html#videos">Watch the sets ${ICON.arrow}</a></div>
    <div class="side"><h3>Join the conversation</h3><p>One free account works on the church site, Koinonia and Worship Connect.</p><button class="btn btn--ghost" data-auth="up">Create account ${ICON.arrow}</button></div>
  </aside></div></div></section>` };
const dashboard = { file:'dashboard.html', title:'Dashboard', og:'worship-1', desc:'Koinonia Experience team dashboard.', noindex:true, body:`
<section class="sec" id="dashboard" style="padding-top:calc(var(--nav-h) + clamp(40px,6vw,80px))"><div class="wrap">
  <div class="dash__gate"></div>
  <div class="dash__app" hidden><div class="dash__head"></div><div class="dash__stats"></div><div class="dash__tabs"></div><div class="dash__panel"></div></div>
</div></section>` };
const pages = [home, editionPage(EDITIONS.k24), editionPage(EDITIONS.k25), editionPage(EDITIONS.k26), updates, dashboard];
for (const p of pages){ const html = layout(p); if (/[—–]/.test(html)) { console.error('dash in', p.file); process.exit(1); } fs.writeFileSync(path.join(__dirname, p.file), html); }
console.log('built', pages.length, 'pages', V);
