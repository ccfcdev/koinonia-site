# Koinonia Experience — subdomain site

The annual family conference of Christ Connect Family Church. Intended for `koinonia.<church-domain>`.

    node build.js                 # index.html + k24.html + k25.html + k26.html
    python3 -m http.server 8526   # or the registered preview `koinonia-site`

Light "poster paper" theme taken from the Koinonia posters: warm grey ground `#EEEDF0`, orange `#F15A29` headline, navy `#0E0077` script and type; hero, edition cards and closing band stay photographic and dark. Site title: Koinonia Experience.
Type: Bricolage Grotesque (KOINONIA wordmark, 800) + Newsreader italic ("Experience" script, as on the posters) + Instrument Sans.
Assets are copies from `../ccfc-site/assets` (fonts, logo cut-outs, Koinonia 25 stills, hero loop).

## Editions (edit `EDITIONS` in build.js)
- **K24**: 21 to 22 December 2024, Ibex Hill opposite Chainda Legacy Academy (from the church's registration form). Videos and photos still to be supplied.
- **K25**: 19 to 21 December 2025, Grace Exploits Event Center, Chainama; "Going Deep and Multiplying"; 5 speakers; 2 Worship Connect videos; K200 / USD 10.
- **K26**: December 2026, Lusaka; dates, venue and theme to be announced. Registration form mirrors the church's Google Form (same questions, entry IDs in `GFORM`), submits to Google Forms via a hidden iframe and to Supabase `registrations` when the main site's config is filled. Swap `GFORM.action` and `entry` for the K26 form once the church creates it.

`?cap=1&y=<px>` capture mode and `./shot.sh` work as on the main site. `k25.html?lb=<videoId>` opens a video.
Set `MAIN` in build.js to the church's main domain once registered (currently a placeholder).
