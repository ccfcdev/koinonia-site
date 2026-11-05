# Official Koinonia 26 banner and UI

The current banner was supplied by Joshua on 5 November 2026. Its artwork, logo and typography are preserved without creative edits. The original PNG is assets/img/k26-official-cream-v2.png; 800px and 1280px WebP derivatives serve responsive layouts.

Use on the Koi 26 page, the homepage Coming up section, the Koi 26 edition card, and homepage/Koi 26/registration social previews. The homepage retains its general conference hero. Koi 26 uses warm cream, navy ink, orange and gold derived from the supplied banner. The RESET remains live HTML text alongside it. Full artwork stays visible on phones and desktops.

The source of truth is build.js and css/site.css. Run node build.js to regenerate pages, content map, knowledge base and sitemap. Versioned asset paths avoid stale immutable browser caches.

Validation: Chromium at 390px and 1440px on homepage and Koi 26 page; verify banner loads with its original aspect ratio, no horizontal overflow, visible theme and correct registration links. Inspect screenshots at both sizes. Build, JavaScript syntax and whitespace checks. Production approval is required separately.
