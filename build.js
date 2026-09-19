#!/usr/bin/env node
/* KOINONIA EXPERIENCE site builder. node build.js → index.html, k24.html, k25.html, k26.html, <ed>-photos.html (published galleries) */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const SEO = require('./build-shared.js');
const ORIGIN = 'https://koinonia.ccfczambia.org';
const hash = f => crypto.createHash('md5').update(fs.readFileSync(path.join(__dirname, f))).digest('hex').slice(0, 8);
const V = { chat: hash('js/mazar.js'), mzcss: hash('css/mazar.css'), css: hash('css/site.css'), js: hash('js/site.js'), fonts: hash('css/fonts.css'), core: hash('css/core.css'), corejs: hash('js/core.js') };
const SETTINGS_URL = 'https://dcqydtkjzgilyjnjyisb.supabase.co/rest/v1/site_settings?select=key,value&site=eq.koinonia';
function loadSettings(defaults){ try { const out = require('child_process').execSync(`curl -s --max-time 6 -H "apikey: sb_publishable_gPig-ePcoJIUnQ4fij6viw_ukAhlifp" "${SETTINGS_URL}"`, { encoding:'utf8' }); const rows = JSON.parse(out); const s = Object.assign({}, defaults); for (const r of rows) if (r.value && r.value.trim()) s[r.key] = r.value; console.log('settings: live'); return s; } catch (e){ console.log('settings: defaults (offline)'); return Object.assign({}, defaults); } }
const S = loadSettings({ k26_when:'December 2026', k26_where:'Lusaka, Zambia', k26_theme:'Abide and Bear Fruit', k26_fee:"Announced with the dates. Koi 25' was K200 for Zambian delegates and USD 10 for international delegates.", k26_blurb:'The next gathering of the family. Dates, venue and theme will be announced here first. Tell us you are coming and we will keep you posted.' });
const set = (k, cls='') => `<span data-setting="${k}"${cls ? ' class="' + cls + '"' : ''}>${S[k]}</span>`;
const WA = '260573762913', MAIN = 'https://ccfczambia.org';   // MAIN: the church's main domain once registered
const AGES = ['0-6 Years Old', '7-12 Years Old', '13-15 Years Old', '16-20 Years Old', '21-30 Years Old', '31-40 Years Old', '41-50 Years Old', '51-60 Years Old', '61 Years and Older'];
const ICON = {
  back: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  arrow: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
};
const img = (n, alt, sizes='(min-width:900px) 50vw, 100vw', eager=false) => `<img src="assets/img/${n}-1280.webp" srcset="assets/img/${n}-800.webp 800w, assets/img/${n}-1280.webp 1280w${fs.existsSync(path.join(__dirname, `assets/img/${n}-1920.webp`)) ? `, assets/img/${n}-1920.webp 1920w` : ''}" sizes="${sizes}" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
const imgP = (n, alt) => `<img src="assets/img/${n}-800.webp" srcset="assets/img/${n}-480.webp 480w, assets/img/${n}-800.webp 800w" sizes="(min-width:900px) 20vw, 50vw" alt="${alt}" loading="lazy" decoding="async">`;

/* ---------- editions (facts from the church's posters and channel; K24 and K26 details are open) ----------
   photos: the edition's photo gallery. `python3 tools-k25-photos.py <key> publish-list names.json` writes <key>-photos.json and
   assets/<key>/{photo,mid,thumb}; the <key>-photos.html page, menu entry and Moments tiles appear once that list has photos.
   days: capture date (EXIF) -> group heading; moments: [original file name, alt] hand-picked for the edition page, each opens in the gallery */
const EDITIONS = {
  k24: { key:'k24', n:'24', title:'Koinonia 24 Experience', when:'21 to 22 December 2024', where:'Ibex Hill, opposite Chainda Legacy Academy, Lusaka', theme:'', status:'past',
    blurb:'Two days in Ibex Hill where the family first gathered under the Koinonia name: worship, the Word, and members sharing preaching, songs, dance, poems and testimonies.',
    videos:[], speakers:[], hero:'k24-hero', gallery:[],
    /* the Drive set came through Photoroom with no capture dates, so k24-photos.json carries story sections (group) instead of days */
    photos:{ json:'k24-photos.json', dir:'assets/k24', prefix:'Koi24', hero:'k24-photos-hero', intro:'Moments from the first Koinonia Experience, 21 and 22 December 2024 at Ibex Hill.', days:{},
      moments:[
        ['Photoroom_021_20250109_010910.jpeg', 'The Koi 24\' family gathered for a group photo in the tent'],
        ['IMG_7933-Photoroom.jpg', 'Two women in pink scarves clapping and singing in worship'],
        ['IMG_8169-Photoroom.jpg', 'A bass player grinning on stage'],
        ['IMG_8292-Photoroom.jpg', 'A young delegate speaking into a microphone from her seat'],
        ['Photoroom_014_20250109_011303.jpeg', 'A leader praying with his arm around a woman'],
        ['DQQV6888.JPG', 'Dancing in front of the stage and the KOINONIA 24 letters'],
        ['Photoroom_013_20250108_121247.jpeg', 'Women dancing together in praise'],
        ['XRLC2909.JPG', 'Young delegates taking a selfie in the evening sun'],
      ] } },
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
    hero:'k25-hero', gallery:['crowd-koinonia','worship-2','worship-3','worship-7','worship-8','worship-6','worship-4'],
    photos:{ json:'k25-photos.json', dir:'assets/k25', prefix:'Koi25', hero:'worship-6', intro:'Moments from Going Deep and Multiplying, 19 to 21 December 2025.',
      days:{ '2025-12-19':'Day 1, Friday 19 December', '2025-12-20':'Day 2, Saturday 20 December', '2025-12-21':'Day 3, Sunday 21 December' },
      moments:[
        ['DSC_3008.JPG', 'The choir in bright jackets singing across the stage'],
        ['DSC_2758.JPG', 'A leader praying over a delegate'],
        ['DSC_2465.JPG', 'Singers leading worship, seen past the stage flowers'],
        ['DSC_2616.JPG', 'A Worship Connect keyboardist playing'],
        ['DSC_3120.JPG', 'A singer kneeling in worship on stage'],
        ['DSC_2865.JPG', 'The hall full of delegates'],
        ['DSC_2507.JPG', 'A worship leader with arms raised on stage'],
        ['DSC_2520.JPG', 'The youth group dancing in praise'],
      ] } },
  k26: { key:'k26', n:'26', title:'Koinonia 26 Experience', when:set('k26_when'), where:set('k26_where'), theme:S.k26_theme ? set('k26_theme') : '', status:'next',
    blurb:set('k26_blurb'),
    videos:[], speakers:[], hero:'k26-soon', gallery:[] },
};
for (const e of Object.values(EDITIONS)) if (e.photos){ const f = path.join(__dirname, e.photos.json); e.photos.list = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []; }
const PHOTO_EDS = Object.values(EDITIONS).filter(e => e.photos && e.photos.list.length);   // editions whose gallery is published


const KSEO = {
  'register.html': ["Register for Koi 26 | Koinonia Experience", "Register for Koi 26, the Koinonia family conference in Lusaka. Share your contact details, attendance days and conference needs with the church office."],
  'index.html': ["Koinonia Experience | Family Conference in Lusaka", "Koinonia Experience is the annual December family conference of Christ Connect Family Church in Lusaka. Register for Koi 26' and watch Koi 25' worship."],
  'k24.html': ["Koi 24' | Where Koinonia Began | Koinonia Experience", "Koi 24', the first Koinonia Experience, gathered the CCFC family at Ibex Hill, Lusaka, on 21 and 22 December 2024 for worship, the Word and testimonies."],
  'k25.html': ["Koi 25' | Going Deep and Multiplying | Koinonia", "Koi 25', Going Deep and Multiplying, 19 to 21 December 2025 in Lusaka. Watch the Worship Connect sets, meet the five speakers and see the photos."],
  'k26.html': ["Koi 26' | Register for December 2026 | Koinonia", "Register for Koi 26', the next Koinonia Experience family conference in Lusaka, December 2026. It takes two minutes. Dates and venue announced here first."],
  'k25-photos.html': ["Koi 25' Photos | View and Download | Koinonia", "View and download free photos from Koi 25', Going Deep and Multiplying, the Koinonia Experience family conference in Lusaka, December 2025."],
  'k24-photos.html': ["Koi 24' Photos | View and Download | Koinonia", "View and download free photos from Koi 24', the first Koinonia Experience family conference, held at Ibex Hill in Lusaka in December 2024."],
  'updates.html': ["Koinonia Updates | News, Videos and Photos", "Announcements, speaker news, videos and photos from every Koinonia Experience conference, posted by the Christ Connect Family Church media team."],
  'dashboard.html': ["Koinonia Dashboard | CCFC", "Koinonia Experience team dashboard."],
  '404.html': ["Page not found | Koinonia Experience", "This page could not be found on the Koinonia Experience website."],
};
const CARD = { 'index.html':'home', 'k24.html':'k24', 'k25.html':'k25', 'k26.html':'k26', 'k25-photos.html':'k25-photos', 'k24-photos.html': fs.existsSync(path.join(__dirname, 'assets/og/k24-photos.jpg')) ? 'k24-photos' : 'k24', 'updates.html':'updates' };
const MENU = [['index.html','Home','The family conference'],['updates.html','Updates','News, videos and photos'],['k26.html',"Koi 26'",'December 2026, register now'],['k25.html',"Koi 25'",'Going Deep and Multiplying'],['k24.html',"Koi 24'",'Where it began, Ibex Hill']]
  .flatMap(m => { const e = EDITIONS[m[0].replace('.html', '')]; return e && PHOTO_EDS.includes(e) ? [m, [`${e.key}-photos.html`, `Koi ${e.n}' photos`, 'View and download']] : [m]; });
function layout(p){
  const links = [['index.html','Home'],['k24.html',"Koi 24'"],['k25.html',"Koi 25'"],['k26.html',"Koi 26'"],['updates.html','Updates']].map(([f,l]) => `<li><a href="${f}"${f===p.file?' aria-current="page"':''}>${l}</a></li>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${SEO.headTags({ origin: ORIGIN, file: p.file, title: KSEO[p.file][0], desc: KSEO[p.file][1], noindex: p.noindex, ogImage: 'assets/og/' + (CARD[p.file] || 'default') + '.jpg', ogAlt: KSEO[p.file][0], iconV: 'koi26'.split(' | ')[0] + ', Koinonia Experience family conference', siteName: 'Koinonia Experience', themeColor: '#0A203D', preloadImage: p.file === 'index.html' ? '/assets/img/hero-poster-v2.webp' : null })}
<link rel="preload" href="assets/fonts/BricolageGrotesque-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/fonts.css?v=${V.fonts}"><link rel="stylesheet" href="css/site.css?v=${V.css}"><link rel="stylesheet" href="css/core.css?v=${V.core}"><link rel="stylesheet" href="css/mazar.css?v=${V.mzcss}">
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'EventSeries',name:'Koinonia Experience',url:ORIGIN + '/',description:'The annual December family conference of Christ Connect Family Church in Lusaka, Zambia.',organizer:{'@type':'Organization',name:'Christ Connect Family Church Zambia',url:'https://ccfczambia.org/'},location:{'@type':'Place',name:'Lusaka, Zambia',address:{'@type':'PostalAddress',addressLocality:'Lusaka',addressCountry:'ZM'}}})}</script>${p.jsonld ? `<script type="application/ld+json">${JSON.stringify(p.jsonld)}</script>` : ''}
</head>
<body>
<a class="sr" href="#main">Skip to content</a>
<header class="nav"><div class="wrap">
  <a class="nav__brand" href="index.html" aria-label="Koinonia Experience, home">${klogo()}</a>
  <ul class="nav__links">${links}</ul>
  <div class="row">${SEO.mazarNav()}<span class="nav__account"></span><a class="btn btn--ghost nav__home" href="${MAIN}" title="Back to the main church website" aria-label="Church website">${ICON.back}<span class="nav__home-t">Church website</span></a><a class="btn nav__cta" href="register.html"><span class="nav__cta-long">I am coming to Koi 26'</span><span class="nav__cta-short">Register</span> ${ICON.arrow}</a><button class="nav__burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><i></i><span>Menu</span></button></div>
</div></header>
<div class="menu__veil"></div>
<nav class="menu" aria-label="Site menu" id="menu">
  <div class="menu__top"><a class="nav__brand" href="index.html">${klogo()}</a><button class="menu__close" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <div class="menu__scroll">
    <div class="menu__quick"><a class="mq mq--a" href="register.html"><b>I am coming to Koi 26'</b><small>Register in two minutes</small></a><a class="mq mq--b" href="k25.html#videos"><b>Watch Koi 25'</b><small>Both worship sets</small></a></div>${SEO.mazarMenu()}
    <h4 class="menu__h">Pages</h4><ul class="menu__list">${MENU.map(([f,l,t],i) => `<li style="--i:${i}"><a href="${f}"${f===p.file?' aria-current="page"':''}><b>${l}</b><small>${t}</small><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></a></li>`).join('')}</ul>
    <h4 class="menu__h">Our sites</h4><div class="menu__cards"><a class="mcard mcard--church" href="${MAIN}"><b>CCFC Zambia</b><small>Back to the church website</small><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></a><a class="mcard mcard--wc" href="https://worship.ccfczambia.org"><b>WORSHIP<i>Connect</i></b><small>The worship team, all videos</small><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></a></div>
  </div>
  <div class="menu__bottom"><div class="menu__account"></div><a class="menu__wa" href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp the office</a></div>
</nav>
<main id="main">${p.body}</main>
<footer class="foot"><div class="wrap"><span class="foot__tag">Deep in Christ. One in Fellowship. Sent to Multiply.</span><span>Koinonia Experience is the annual family conference of Christ Connect Family Church.</span><span><a href="${MAIN}">CCFC Zambia</a> &nbsp;&middot;&nbsp; <a href="https://wa.me/${WA}" target="_blank" rel="noopener">WhatsApp</a> &nbsp;&middot;&nbsp; <a href="https://www.youtube.com/@christconnectfamilychurchz7833" target="_blank" rel="noopener">YouTube</a></span><nav class="legal" aria-label="Legal"><a href="${MAIN}/privacy">Privacy</a><a href="${MAIN}/terms">Terms</a><a href="${MAIN}/faq">FAQ</a><button type="button" data-consent-open>Cookie settings</button><a href="${MAIN}/sitemap">Site map</a><span>&copy; <span class="year"></span> CCFC</span></nav></div></footer>
<script>window.CCFC_CONFIG={supabaseUrl:'https://dcqydtkjzgilyjnjyisb.supabase.co',supabaseKey:'sb_publishable_gPig-ePcoJIUnQ4fij6viw_ukAhlifp'}</script>
<script src="js/site.js?v=${V.js}" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js" defer></script>
<script>window.CCFC_SITE={key:'koinonia'};window.CCFC_CONFIG=Object.assign(window.CCFC_CONFIG||{supabaseUrl:'https://dcqydtkjzgilyjnjyisb.supabase.co',supabaseKey:'sb_publishable_gPig-ePcoJIUnQ4fij6viw_ukAhlifp'},{chatEndpoint:'https://dcqydtkjzgilyjnjyisb.supabase.co/functions/v1/ministry-chat'})</script>
<script src="js/core.js?v=${V.corejs}" defer></script>
<script>window.MAZAR={mode:'widget'}</script>
<script src="js/mazar.js?v=${V.chat}" defer></script>
</body></html>`;
}

const videos = list => list.length ? `<div class="vgrid" data-rv-stagger>${list.map(v => `<a href="https://www.youtube.com/watch?v=${v.id}" class="vcard" data-lb="${v.id}" data-title="${v.t}" aria-label="Play: ${v.t}"><div class="ph">${img(v.img,'','(min-width:800px) 50vw, 100vw')}</div><span class="vcard__play" aria-hidden="true">${ICON.play}</span><div class="vcard__meta"><b>${v.t}</b><span>${v.by}</span></div></a>`).join('')}</div>`
  : `<div class="vcard vcard--soon" data-rv><div><h3>Videos on the way</h3><p>Recordings from this edition will be added here as the media team uploads them.</p></div></div>`;
const GALT = { 'k25-hero':'Worship Connect singers in bright blazers leading praise at Koinonia 25', 'crowd-koinonia':'Delegates seated together during a Koinonia session', 'worship-1':'Worship Connect singers in white shirts leading praise on stage', 'worship-2':'The worship team singing behind the pulpit under blue lights', 'worship-3':'A worship leader singing with the choir behind him', 'worship-4':'The choir and worship leader in blue stage light, seen from the audience', 'worship-5':'Vocalists and the drummer leading a song on stage', 'worship-6':'The choir dancing on a red-lit stage', 'worship-7':'A keyboard player on a red-lit stage beside the Koinonia screen', 'worship-8':'The choir singing on stage during an evening session' };
const gallery = list => list.length ? `<div class="gal" data-rv-stagger>${list.map(n => `<div class="ph">${img(n, GALT[n] || 'A moment from Koinonia','(min-width:800px) 25vw, 50vw')}</div>`).join('')}</div>`
  : `<div class="gal"><div class="gal__soon">Photographs from this edition are being added.</div></div>`;
const closeBlock = () => `<section class="close"><div class="bg">${img('worship-4','', '100vw')}</div><div class="wrap"><h2 data-split>Come home<br>this December.</h2><p>Koinonia is where the family remembers it is one body. Whether you belong to a CCFC church or you are curious, there is a seat for you at Koi 26'.</p><div class="row"><a class="btn" href="register.html">I am coming to Koi 26' ${ICON.arrow}</a><a class="btn btn--ghost" href="${MAIN}">Visit CCFC Zambia</a></div></div></section>`;


const K26FAQ = [
  ['Who can come to Koinonia?', "Everyone is welcome: members, friends and first-time guests from every CCFC church in Zambia, Zimbabwe, Malawi and the wider family."],
  ["When and where is Koi 26?", "Koi 26 is in December 2026 in Lusaka. The exact dates, venue and theme will be announced on this page first."],
  ['How much does it cost?', "The delegate fee is announced with the dates. For Koi 25 it was K200 for Zambian delegates and USD 10 for international delegates."],
  ['Can I register my children?', "Yes. Koinonia is a family conference. Fill in the form for each child and choose their age range."],
  ['Can I take part by preaching, singing or performing?', "Yes. Choose Yes on the form and tell us what you would like to share. Slots are limited and the organisers will confirm."],
  ['How do I know my registration went through?', "A thank-you message appears on the page as soon as you register. The team will then contact you with the dates and delegate rates."],
  ['Who do I ask if I have a question?', "WhatsApp the church office on +260 573 762 913, call +260 772 890 854, or email info@ccfczambia.org."],
];
const k26Faq = () => `<section class="sec" id="faq" style="padding-top:0"><div class="wrap"><div class="kfaq"><div><span class="pill">Questions</span><h2 class="mt-1" data-split>Before you<br>register.</h2><p class="lede mt-1" data-rv>The things people ask the office most about Koinonia.</p></div><div class="kfaq__list" data-rv>${K26FAQ.map(([q, a]) => `<details class="kfaq__item"><summary>${q.replace(/Koi 2(\d)/g, "Koi 2$1'")}<span aria-hidden="true">${ICON.arrow}</span></summary><p>${a.replace(/Koi 2(\d)/g, "Koi 2$1'")}</p></details>`).join('')}</div></div></div></section>`;

/* brand lockups traced from the 2026 brand kit (assets/logo/koinonia-*.svg): gold crescent + KOINONIA (Bebas Neue) + Experience script */
const klogo = (cls = 'klogo--nav') => `<img class="klogo ${cls}" src="assets/logo/koinonia-horizontal.svg" alt="Koinonia Experience" width="350" height="94" decoding="async">`;
const kstack = (eager) => `<img class="klogo klogo--stack" src="assets/logo/koinonia-stacked.svg" alt="Koinonia Experience" width="352" height="247"${eager ? ' fetchpriority="high"' : ' decoding="async"'}>`;
const TAGLINE = '<span class="tagline"><span>Deep in Christ.</span><i></i><span>One in Fellowship.</span><i></i><span>Sent to Multiply.</span></span>';
const PILLARS = [
  ['Christ-centred encounter', 'Deepening our relationship with Jesus Christ.', '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 14v34M23 25h18"/><path d="M32 4v4M12 12l3 3M52 12l-3 3M6 30h4M54 30h4M14 54l3-3M50 54l-3-3M32 56v4"/><path d="M20 44c3 6 8 9 12 9s9-3 12-9"/></svg>'],
  ['Authentic fellowship', 'Growing together in love, unity and community.', '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="18" r="7"/><circle cx="16" cy="24" r="5"/><circle cx="48" cy="24" r="5"/><path d="M20 48a12 12 0 0 1 24 0v6H20zM6 50a10 10 0 0 1 12-9M58 50a10 10 0 0 0-12-9"/></svg>'],
  ['Biblical formation', 'Being equipped through the Word for life and ministry.', '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 18c-6-5-14-6-24-4v34c10-2 18-1 24 4 6-5 14-6 24-4V14c-10-2-18-1-24 4z"/><path d="M32 18v34"/></svg>'],
  ['Missional multiplication', "Sent out to make disciples and expand God's Kingdom.", '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="24"/><path d="M20 38c2-9 9-14 18-14h6"/><path d="M38 17l8 7-8 7"/></svg>'],
];
const pillarsSection = () => `<section class="pillars"><div class="wrap"><div class="sec__head"><div><span class="eyebrow">What Koinonia is about</span><h2>Deep in Christ. <span class="script">One in Fellowship.</span> Sent to Multiply.</h2></div></div>
  <div class="pillars__grid" data-rv-stagger>${PILLARS.map(([t, d, ic], i) => `<div class="pillar"><span class="pillar__n">0${i + 1}</span><span class="pillar__ico">${ic}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
<section class="purpose"><div class="wrap purpose__grid"><div data-rv><span class="eyebrow">Our purpose</span><h2>To encounter Christ <span class="script">deeply,</span> live in fellowship genuinely, be formed biblically, and multiply faithfully.</h2></div>
  <div class="purpose__side" data-rv><div><h3>Our promise</h3><p>Every participant leaves spiritually renewed, relationally strengthened, biblically equipped and missionally activated to impact the world.</p></div><div><h3>Biblical foundation</h3><ul><li><a href="https://mazar.ccfczambia.org/?mazar=bible&amp;ref=Acts%202%3A42-47">Acts 2:42-47</a></li><li><a href="https://mazar.ccfczambia.org/?mazar=bible&amp;ref=1%20John%201%3A3">1 John 1:3</a></li><li><a href="https://mazar.ccfczambia.org/?mazar=bible&amp;ref=Philippians%202%3A1-2">Philippians 2:1-2</a></li><li><a href="https://mazar.ccfczambia.org/?mazar=bible&amp;ref=2%20Timothy%202%3A2">2 Timothy 2:2</a></li><li><a href="https://mazar.ccfczambia.org/?mazar=bible&amp;ref=John%2015%3A4-5">John 15:4-5</a>, <a href="https://mazar.ccfczambia.org/?mazar=bible&amp;ref=John%2015%3A16">16</a></li></ul></div></div></div></section>`;

const moments = e => { const P = e.photos, tiles = P.moments.map(([src, alt]) => [P.list.find(p => p.src === src), alt]).filter(([p]) => p);
  return tiles.length ? `<div class="gal gal--photos" data-rv-stagger>${tiles.map(([p, alt]) => `<a class="ph" href="${e.key}-photos.html?photo=${p.id}" aria-label="${alt}, open in the photo gallery"><img src="${P.dir}/mid/${p.id}.webp" srcset="${P.dir}/thumb/${p.id}.webp 520w, ${P.dir}/mid/${p.id}.webp 1000w" sizes="(min-width:800px) 25vw, 50vw" alt="${alt}" loading="lazy" decoding="async"></a>`).join('')}</div>` : ''; };
function editionPage(e){
  const metaRows = [['When', e.when], ['Where', e.where], e.theme ? ['Theme', `"${e.theme}"`] : null, e.cost ? ['Delegate fee', e.cost] : null].filter(Boolean);
  const P = PHOTO_EDS.includes(e) ? e.photos : null;
  return { file:`${e.key}.html`, title:e.title, og:e.hero, desc:`${e.title}: ${e.when}, ${e.where}. ${e.blurb}`.replace(/<[^>]+>/g, ''),
    body:`
<section class="hero hero--short"><div class="hero__media">${img(e.hero,'', '100vw', true)}</div><div class="hero__scrim"></div>
  <div class="wrap"><div class="hero__copy">
    <span class="pill ${e.status==='next'?'pill--orange':''}">${e.status==='next' ? 'Next edition' : 'Past edition'}</span>
    ${e.status === 'next' && e.theme
      ? `<h1 class="klock mt-1"><span class="sr-only">Koinonia ${e.n}': ${e.theme}</span>${kstack(true)}<span class="klock__side" aria-hidden="true"><span class="klock__year">20${e.n}</span><span class="klock__theme">${e.theme}</span></span></h1>`
      : `<h1 class="hero__k mt-1">KOINONIA <em>${e.n}'</em><span class="script">Experience</span></h1>${e.theme ? `<div class="hero__theme"><small>Theme</small>${e.theme}</div>` : ''}`}
    <p>${e.blurb}</p>
    <div class="row">${e.status==='next' ? `<a class="btn" href="register.html">I am coming ${ICON.arrow}</a>` : (e.videos.length ? `<a class="btn" href="#videos">Watch the worship ${ICON.arrow}</a>` : P ? `<a class="btn" href="${e.key}-photos.html">See the photos ${ICON.arrow}</a>` : '')}<a class="btn btn--ghost" href="#details">Details</a></div>
  </div>
  <div class="hero__meta" data-rv-stagger>${metaRows.slice(0,3).map(([k,v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}</div></div>
</section>
<section class="sec" id="details"><div class="wrap"><h2 data-split>The details</h2><div class="details mt-2" data-rv-stagger>
  ${metaRows.map(([k,v]) => `<div class="detail"><b>${k}</b><p>${v}</p></div>`).join('')}
  <div class="detail"><b>Who</b><p>Members, friends and first-time guests from every CCFC church<small>Zambia, Zimbabwe, Malawi and the wider family</small></p></div>
</div></div></section>
${e.speakers.length ? `<section class="sec" style="padding-top:0"><div class="wrap"><h2 class="mb-2" data-split>Who taught</h2><div class="speakers" data-rv-stagger>${e.speakers.map(([i,n,r]) => `<div class="spk"><div class="ph">${imgP(i,n)}</div><b>${n}</b><span>${r}</span></div>`).join('')}</div></div></section>` : ''}
<section class="sec" id="videos" style="padding-top:0"><div class="wrap"><h2 class="mb-2" data-split>Watch</h2>${videos(e.videos)}</div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><div class="sec__head"><h2 data-split>Moments</h2>${P ? `<a class="btn btn--ghost" href="${e.key}-photos.html">See and download ${P.list.length} photos ${ICON.arrow}</a>` : ''}</div>${(P && moments(e)) || gallery(e.gallery)}</div></section>
${e.status==='next' ? k26Faq() : ''}
${closeBlock()}`, ...(e.status==='next' ? { jsonld: { '@context':'https://schema.org', '@type':'FAQPage', mainEntity: K26FAQ.map(([q, a]) => ({ '@type':'Question', name:q, acceptedAnswer:{ '@type':'Answer', text:a } })) } } : {}) };
}

const home = { file:'index.html', title:'Home', og:'worship-1', desc:'Koinonia Experience is the annual family conference of Christ Connect Family Church, held in Lusaka, Zambia every December. Editions Koi 24\', Koi 25\' and the upcoming Koi 26\'.',
  body:`
<section class="hero"><div class="hero__media">${img('worship-1','Worship Connect leading praise at Koinonia 25','100vw',true)}<video data-src720="assets/img/hero-720.mp4" data-src="assets/img/hero-1080-v2.mp4" data-src4k="assets/img/hero-4k.mp4" poster="assets/img/hero-poster-v2.webp" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video></div><div class="hero__scrim"></div>
  <div class="wrap"><div class="hero__copy">
    <h1 class="hero__logo">${kstack(true)}</h1>
    <div class="hero__tag">${TAGLINE}</div>
    <p>Once a year the whole Christ Connect family comes home to Lusaka: three days of worship, the Word and fellowship that sends us back out multiplying.</p>
    <div class="row"><a class="btn" href="register.html">I am coming to Koi 26' ${ICON.arrow}</a><a class="btn btn--ghost" href="k25.html#videos">Watch Koi 25'</a></div>
  </div>
  <div class="hero__meta" data-rv-stagger><div><b>Next</b><span>Koi 26', December 2026</span></div><div><b>Where</b><span>Lusaka, Zambia</span></div><div><b>Last theme</b><span>"Going Deep and Multiplying"</span></div></div></div>
</section>
${pillarsSection()}
<section class="sec"><div class="wrap"><h2 class="mb-2" data-split>Every Koinonia Experience</h2><div class="eds" data-rv-stagger>
  ${['k24','k25','k26'].map(k => { const e = EDITIONS[k]; return `<a class="ed ${e.status==='next'?'ed--next':''}" href="${k}.html">${e.status==='next' ? `<div class="ed__soon" aria-label="Coming soon"><img src="assets/logo/ccfc-mark-white.png?v=2" alt=""><b>Coming</b><i>soon</i><small>December 2026</small></div>` : img(e.hero,'','(min-width:900px) 33vw, 100vw')}<span class="pill ${e.status==='next'?'pill--orange':''}">${e.status==='next'?'Next':'Past'}</span><div class="ed__k">Koi <em>${e.n}'</em></div><div class="ed__t">${e.theme ? `"${e.theme}"` : e.when}</div><p>${e.theme ? e.when + ' &middot; ' + e.where.split(',')[0] : e.blurb}</p><span class="link">Open ${k.toUpperCase()} ${ICON.arrow}</span></a>`; }).join('')}
</div></div></section>
<div class="facts" data-rv-stagger><div class="fact"><b>3</b><span>days together every December</span></div><div class="fact"><b>3+</b><span>nations in the room: Zambia, Zimbabwe, Malawi</span></div><div class="fact"><b>5</b><span>leaders taught at Koi 25'</span></div><div class="fact"><b>1</b><span>family under Christ</span></div></div>
<section class="sec"><div class="wrap"><h2 data-split>What Koinonia<br>means</h2><p class="lede mt-1" data-rv>Koinonia is the New Testament word for fellowship: sharing life, not just a room. "They devoted themselves to the apostles' teaching and to fellowship." Acts 2:42. The conference exists so that churches spread across borders remember they are one body, go deep in the Word together, and go home to multiply.</p></div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><h2 class="mb-2" data-split>From Koi 25'</h2>${videos(EDITIONS.k25.videos)}</div></section>
${closeBlock()}` };


const updates = { file:'updates.html', title:'Updates', og:'worship-3', desc:'Koinonia Experience updates: announcements about the next conference, speaker news, videos and photos from past editions, posted by the church media team.',
  body:`
<section class="hero hero--short"><div class="hero__media">${img('worship-3','', '100vw', true)}</div><div class="hero__scrim"></div><div class="wrap"><div class="hero__copy"><span class="pill pill--orange">Live from the team</span><h1 class="hero__k mt-1">Koinonia <span class="script">updates</span></h1><p>Announcements about Koi 26', speaker news, and videos and photos from every edition, as the media team posts them. Sign in to react and comment.</p></div></div></section>
<section class="sec" id="feed" data-site="koinonia" style="padding-top:clamp(40px,6vw,70px)"><div class="wrap"><div class="feed__grid">
  <div><div class="feed__filters mb-2"></div><div class="feed__composer"></div><div class="feed__list mt-2"></div></div>
  <aside class="feed__side">
    <div class="side"><span class="eyebrow">Next edition</span><h3>Koi 26', ${set('k26_when')}</h3><p>Dates, venue and theme will be announced here first.</p><a class="btn" href="register.html">I am coming to Koi 26' ${ICON.arrow}</a></div>
    <div class="side"><h3>Watch Koi 25'</h3><p>Both Worship Connect sets from Koi 25' are up.</p><a class="link" href="k25.html#videos">Watch the sets ${ICON.arrow}</a></div>
    <div class="side" data-guest><h3>Join the conversation</h3><p>One free account works on the church site, Koinonia and Worship Connect.</p><button class="btn btn--ghost" data-auth="up">Create account ${ICON.arrow}</button></div>
  </aside></div></div></section>` };
const dashboard = { file:'dashboard.html', title:'Dashboard', og:'worship-1', desc:'Koinonia Experience team dashboard.', noindex:true, body:`
<section class="sec" id="dashboard" style="padding-top:calc(var(--nav-h) + clamp(40px,6vw,80px))"><div class="wrap">
  <div class="dash__gate"></div>
  <div class="dash__app" hidden><div class="dash__head"></div><div class="dash__stats"></div><div class="dash__tabs"></div><div class="dash__panel"></div></div>
</div></section>` };

/* <ed>-photos.html: js/site.js photos() reads the list, image folder, download names and day headings from the grid's data attributes */
const photosPage = e => { const P = e.photos, file = `${e.key}-photos.html`; return { file, title:`Koi ${e.n}' photos`, og:'worship-1', desc:KSEO[file][1],
  body:`
<section class="hero hero--short phx__hero"><div class="hero__media">${img(P.hero,'', '100vw', true)}</div><div class="hero__scrim"></div>
  <div class="wrap"><div class="hero__copy">
    <a class="phx__back" href="${e.key}.html">${ICON.back} Koi ${e.n}'</a>
    <h1 class="hero__k mt-1">KOI <em>${e.n}'</em><span class="script">photos</span></h1>
    <p>${P.intro} Tap any photo to see it large and download it.</p>
    <div class="row phx__dl" data-zips></div>
  </div></div>
</section>
<section class="sec phx" style="padding-top:clamp(28px,4vw,48px)"><div class="wrap">
  <div class="phx__bar"><p class="phx__count" aria-live="polite">Loading photos</p><p class="phx__fine">Free for personal and church use. Please credit CCFC Zambia. <a href="${MAIN}/terms#photos">Photo terms</a></p></div>
  <div class="phx__grid" data-photos="${P.json}" data-dir="${P.dir}" data-prefix="${P.prefix}" data-name="Koi ${e.n}'" data-days="${SEO.esc(JSON.stringify(P.days))}"></div>
  <noscript><p>Turn on JavaScript to browse the photos, or download them all using the buttons above.</p></noscript>
</div></section>
${closeBlock()}` }; };
const notFound = { file:'404.html', title:'Page not found', og:'worship-1', noindex:true, desc:KSEO['404.html'][1],
  body:`
<section class="sec nf" style="padding-top:calc(var(--nav-h) + clamp(40px,6vw,90px))"><div class="wrap">
  <span class="pill">Error 404</span>
  <h1 class="hero__k mt-1" style="font-size:clamp(3rem,10vw,7rem)">LOST<span class="script">in Lusaka</span></h1>
  <p class="lede mt-1">This page does not exist, or it has moved. Everything about Koinonia is one tap away.</p>
  <div class="row mt-2"><a class="btn" href="index.html">Koinonia home ${ICON.arrow}</a><a class="btn btn--ghost" href="register.html">Register for Koi 26'</a></div>
  <ul class="nf__links mt-3">
    <li><a href="k26.html"><b>Koi 26'</b><span>December 2026, register now</span></a></li>
    <li><a href="k25.html"><b>Koi 25'</b><span>Videos and speakers</span></a></li>
    ${PHOTO_EDS.slice().reverse().map(e => `<li><a href="${e.key}-photos.html"><b>Koi ${e.n}' photos</b><span>View and download</span></a></li>`).join('\n    ')}
    <li><a href="updates.html"><b>Updates</b><span>News from the team</span></a></li>
    <li><a href="${MAIN}"><b>CCFC Zambia</b><span>The church website</span></a></li>
  </ul>
</div></section>` };
const registration = (() => { const e = EDITIONS.k26; return { file:'register.html', title:'Register for Koi 26', desc:'Register for the Koinonia Experience family conference.', body:`<section class="sec" id="register" style="padding-top:calc(var(--nav-h) + 70px)"><div class="wrap">
  <div class="reg__intro" data-rv><span class="pill pill--orange">Registration open</span><h1 data-split>Register for<br>Koi ${e.n}'.</h1>
    <p class="lede mt-1">Join the family this December. Fields marked * are required. Email is optional; add it if you would like a confirmation.</p></div>
  <div class="reg__layout">
    <aside class="reg__aside" data-rv-stagger>
      <div class="reg__fact"><b>Dates</b><span data-setting="k26_when">${S.k26_when}</span></div>
      <div class="reg__fact"><b>Venue</b><span data-setting="k26_where">${S.k26_where}</span></div>
      <div class="reg__fact"><b>Delegate fee</b><span data-setting="k26_fee">${S.k26_fee}</span></div>
      <div class="reg__fact"><b>Questions</b><span><a href="https://wa.me/${WA}?text=${encodeURIComponent("Hello, I need help registering for Koi 26'.")}" target="_blank" rel="noopener">WhatsApp the office</a> or email ccfczambia@gmail.com</span></div>
    </aside>
    <form class="reg" data-edition="${e.key}" novalidate data-rv="fade">
      <fieldset class="reg__step"><legend><i>1</i>About you</legend>
        <div class="reg__row reg__row--3"><div class="field"><label for="r-first">First name <em>*</em></label><input id="r-first" name="first" required autocomplete="given-name"></div><div class="field"><label for="r-middle">Middle name</label><input id="r-middle" name="middle" autocomplete="additional-name"></div><div class="field"><label for="r-sur">Surname <em>*</em></label><input id="r-sur" name="surname" required autocomplete="family-name"></div></div>
        <div class="reg__row"><div class="field"><span class="field__label">Sex <em>*</em></span><div class="reg__choices"><label><input type="radio" name="gender" value="Male" required><span>Male</span></label><label><input type="radio" name="gender" value="Female"><span>Female</span></label></div></div>
          <div class="field"><label for="r-age">Age range <em>*</em></label><select id="r-age" name="age" required><option value="">Select</option>${AGES.map(a => `<option>${a}</option>`).join('')}</select></div></div>
      </fieldset>
      <fieldset class="reg__step"><legend><i>2</i>Where to reach you</legend>
        <div class="reg__row"><div class="field"><label for="r-addr">Physical address <em>*</em></label><input id="r-addr" name="address" required autocomplete="street-address" placeholder="Area and town"></div><div class="field"><label for="r-country">Country of residence <em>*</em></label><input id="r-country" name="country" required autocomplete="country-name" value="Zambia"></div></div>
        <div class="reg__row"><div class="field"><label for="r-phone">Contact number <em>*</em></label><input id="r-phone" name="phone" required minlength="5" maxlength="40" type="tel" autocomplete="tel" placeholder="+260 97 ..."></div><div class="field"><label for="r-email">Email (optional)</label><input id="r-email" name="email" maxlength="254" type="email" autocomplete="email" placeholder="you@example.com"></div></div>
        <div class="field"><label for="r-whatsapp">WhatsApp number (optional)</label><input id="r-whatsapp" name="whatsapp" minlength="5" maxlength="40" type="tel" autocomplete="off" placeholder="+260 97 ..." aria-describedby="r-whatsapp-help"><small id="r-whatsapp-help">If your WhatsApp number is the same as your contact number, tick the box below.</small></div><label class="reg__same"><input type="checkbox" name="same_whatsapp"> My contact number is also my WhatsApp number</label>
      </fieldset>
      <fieldset class="reg__step"><legend><i>3</i>At the conference</legend>
        <div class="field"><span class="field__label">Are you taking part by sharing a talent? <em>*</em></span><small>Preaching, singing, dancing, a poem, a testimony. Limited slots.</small><div class="reg__choices"><label><input type="radio" name="participation" value="Yes" required><span>Yes, I want to take part</span></label><label><input type="radio" name="participation" value="No"><span>No, just attending</span></label></div></div>
        <div class="field"><label for="r-detail">If taking part, what will you do?</label><input id="r-detail" name="detail" placeholder="Optional"></div>
        <div class="field"><span class="field__label">Which days will you attend? <em>*</em></span><div class="reg__choices"><label><input type="checkbox" name="days" value="Day 1"><span>Day 1</span></label><label><input type="checkbox" name="days" value="Day 2"><span>Day 2</span></label><label><input type="checkbox" name="days" value="Day 3"><span>Day 3</span></label><label><input type="checkbox" name="days" value="All Three"><span>All three days</span></label></div></div>
      </fieldset>
      <fieldset class="reg__step"><legend><i>4</i>Anything else</legend>
        <div class="field"><label for="r-diet">Any dietary restrictions? <em>*</em></label><input id="r-diet" name="dietary" required placeholder="None, or the foods you do not eat"></div>
        <div class="field"><label for="r-exp">What is your expectation at Koi ${e.n}' Experience? <em>*</em></label><textarea id="r-exp" name="expectation" rows="3" required></textarea></div>
      </fieldset>
      <div class="reg__submit"><button class="btn" type="submit">Register for Koi ${e.n}' ${ICON.arrow}</button><span class="reg__status" aria-live="polite"></span></div>
      <p class="reg__fine">Your details go to the church office only and are used for conference planning. <em>*</em> Required.</p>
    </form>
  </div>
</div></section>` }; })();
const pages = [home, registration, editionPage(EDITIONS.k24), editionPage(EDITIONS.k25), editionPage(EDITIONS.k26), ...PHOTO_EDS.slice().reverse().map(photosPage), updates, notFound];
/* page editor: text, photos, links and sections the Master Admin changed through Mazar Prime are baked into the HTML */
const PAGE_CONTENT = SEO.loadPageContent('koinonia'), CONTENT_MAP = [];
for (const p of pages){ SEO.lint(p, KSEO[p.file][0], KSEO[p.file][1]); const html = SEO.editable(SEO.clean(layout(p)), { site:'koinonia', file:p.file, origin:ORIGIN, overrides:PAGE_CONTENT, map:CONTENT_MAP }); if (/[—–]/.test(html)) { console.error('dash in', p.file); process.exit(1); } fs.writeFileSync(path.join(__dirname, p.file), html); }
SEO.writeContentMap(__dirname, CONTENT_MAP, PAGE_CONTENT);
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), SEO.sitemapXml(ORIGIN, pages.map(p => Object.assign({ priority: { 'k26.html':'0.9', 'k25.html':'0.8', 'k25-photos.html':'0.7', 'k24-photos.html':'0.6' }[p.file], changefreq: ['index.html','updates.html','k26.html'].includes(p.file) ? 'weekly' : 'monthly' }, p))));
fs.writeFileSync(path.join(__dirname, 'robots.txt'), SEO.robotsTxt(ORIGIN));
fs.writeFileSync(path.join(__dirname, 'site.webmanifest'), SEO.manifestJson({ name: 'Koinonia Experience', short: 'Koinonia', themeColor: '#0A203D', background: '#0A203D' }));
console.log('built', pages.length, 'pages', V);

/* Knowledge base for Mazar, the AI Bible companion: the visible text of every page, rebuilt on each deploy (kb.json). */
function writeKb(pages, site){
  const strip = html => { const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/) || [,''])[1];
    return main.replace(/<(script|style|svg|video|iframe|form)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&middot;|&amp;|&quot;|&#39;/g, m => ({'&nbsp;':' ','&middot;':'.','&amp;':'&','&quot;':'"','&#39;':"'"}[m])).replace(/\s+/g, ' ').trim().slice(0, 6000); };
  const out = { site, built: new Date().toISOString(), pages: pages.filter(p => !p.noindex).map(p => ({ url: site.origin + '/' + p.file.replace(/\.html$/, '').replace(/^index$/, ''), file: p.file, title: p.title, description: p.desc, text: strip(fs.readFileSync(path.join(__dirname, p.file), 'utf8')) })) };
  fs.writeFileSync(path.join(__dirname, 'kb.json'), JSON.stringify(out));
}

writeKb(pages, { key:'koinonia', name:'Koinonia Experience', origin:'https://koinonia.ccfczambia.org' });
