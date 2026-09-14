# Koinonia Experience — subdomain site

The annual family conference of Christ Connect Family Church. Intended for `koinonia.<church-domain>`.

    node build.js                 # index.html + k24.html + k25.html + k26.html
    python3 -m http.server 8526   # or the registered preview `koinonia-site`

Light "poster paper" theme taken from the Koinonia posters: warm grey ground `#EEEDF0`, orange `#F15A29` headline, navy `#0E0077` script and type; hero, edition cards and closing band stay photographic and dark. Site title: Koinonia Experience.
Type: Bricolage Grotesque (KOINONIA wordmark, 800) + Newsreader italic ("Experience" script, as on the posters) + Instrument Sans.
Assets are copies from `../ccfc-site/assets` (fonts, logo cut-outs, Koinonia 25 stills, hero loop).

## Editions (edit `EDITIONS` in build.js)
- **K24**: 21 to 22 December 2024, Ibex Hill opposite Chainda Legacy Academy (from the church's registration form). 99 curated photos at `/k24-photos` (from the info@ccfczambia.org Drive folder "Koinonia 24' Pictures"); videos still to be supplied.
- **K25**: 19 to 21 December 2025, Grace Exploits Event Center, Chainama; "Going Deep and Multiplying"; 5 speakers; 2 Worship Connect videos; K200 / USD 10.
- **K26**: December 2026, Lusaka; dates, venue and theme to be announced. Registration form mirrors the church's Google Form (same questions, entry IDs in `GFORM`), submits to Google Forms via a hidden iframe and to Supabase `registrations` when the main site's config is filled. Swap `GFORM.action` and `entry` for the K26 form once the church creates it.

`?cap=1&y=<px>` capture mode and `./shot.sh` work as on the main site. `k25.html?lb=<videoId>` opens a video.
Set `MAIN` in build.js to the church's main domain once registered (currently a placeholder).

## Brand kit (2026-09-13)
Colours: Koinonia Orange #FB7624, Fellowship Blue #013E87, Covenant Gold #886C2B (lighter #C9A54A on dark), Deep Navy #0A203D, Warm Stone #EEECE6, Pure White. Type: Bebas Neue (display, all caps), Montserrat (supporting), Great Vibes (accent script), self-hosted in assets/fonts. Logo lockups are vector SVGs rebuilt from the brand kit: `assets/logo/koinonia-stacked.svg` (primary, hero and next edition) and `koinonia-horizontal.svg` (nav and menu), each with a `-light` variant for light grounds. The crescent is geometric, KOINONIA is Bebas Neue outlines, and the Experience script is traced from the brand kit artwork. Emblem favicon rendered from the K mark. Tagline "Deep in Christ. One in Fellowship. Sent to Multiply." on the hero and footer; four pillars and purpose sections on the home page; annual lockup (year + theme) on the next edition page; Koi 26' theme "Abide and Bear Fruit" lives in site_settings k26_theme.

## Photo galleries (k24, k25)
- `tools-k25-photos.py <edition> stage <zip|folder>...`: EXIF/GPS strip, max 2000px, sharpness and look-alike data in `assets/src/<ed>/stage.json`.
- `... <edition> sheets`: numbered contact sheets for picking.
- `... <edition> publish-list names.json`: writes `assets/<ed>/{photo,mid,thumb}` and `<ed>-photos.json`. names.json can be a list, or `{"Section": [names]}` for story sections.
- Without an edition the tool runs k25, as before.
- `build.js` `EDITIONS.<ed>.photos` configures the photos page, the Moments tiles and the download prefix. `js/site.js` `photos()` reads its settings from data attributes.
- Source zips, staging and sheets live in git-ignored `assets/src/`.
