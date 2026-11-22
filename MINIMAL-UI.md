# Koinonia site design refresh

Use the official Koi 26 banner palette across all nine pages: warm paper #FAF8F2, navy ink #102E55, orange #F56A17, muted gold #896B2C. Typography uses the existing bundled Bricolage Grotesque and Instrument Sans fonts. New ink variants of the existing logo keep its shapes intact.

css/minimal.css is the site-specific theme layer, loaded after the shared styles and versioned by the builder. Shared CCFC styles are not modified. It covers navigation, menu, editorial image heroes, cards, details, galleries, registration inputs, feed and account tokens. Existing content, field names, registration submission and backend access are unchanged.

Motion: short control transitions, small scroll reveals and progressive cross-document fades where supported. Reduced-motion settings remove transitions and reveals. The homepage has a centered introduction and an full-background worship video, inspired by the supplied church layout reference. Blue returns in fellowship, statistics and closing sections. The video serves the existing 1080p source or 4K source according to rendered pixel width, with a clean 1920px poster, play/pause control and reduced-motion/data-saving behavior. Scroll-linked hero transforms stay disabled.

Verification: all nine pages at 390px and 1440px in Chromium, no horizontal overflow and consistent page background. Menu open/Escape close at both sizes. Registration form remains present and interactive; no submissions sent. Desktop and phone screenshots reviewed. JavaScript syntax, generated site build and diff whitespace checks pass. Production deployment requires separate approval.

## Blue and video revision

Reference: https://dribbble.com/shots/26631367-Website-Design-For-Church by Jeevitha K. Adapted its centered church introduction, full-background worship video and restrained rounded controls to CCFC's own colors, copy, media and conference. No reference artwork or code is copied.

Registration adds four anchor-based section links, blue focus treatment, selected radio/checkbox indicators and a blue event-information aside. Field names, submission handling and server access remain unchanged. Verification adds native form choice and WhatsApp synchronization checks, video decode/play/pause at phone and desktop sizes and a 3840px decode check at 2x display density. No data submitted. Existing source footage limits visual detail; no upscaling or new third-party video service introduced.

The homepage video fills the entire hero behind its centered text and buttons, with a navy contrast overlay. Autoplay, pause and full-background geometry checked at 390px and 1440px.

## Color modes

A header toggle switches between warm cream light mode and the original navy #0A203D, blue #013E87, orange #FB7624 and gold dark palette. The independent koinonia:theme preference is applied in the document head before styles render, persists across pages, follows system preference until explicitly chosen and synchronizes across tabs. Original light-on-dark logos are restored in dark mode. The hero's contrast overlay stays consistent in both modes.

Verified both modes on all nine pages at 390px and 1440px, dark-mode reload persistence, system dark preference, toggle labels/pressed state, mobile header width and menu interactions. Registration and Koi 26 screenshots reviewed. No production deployment.

## UI refresh and night palette (22 November 2026)

Joshua asked for an upgraded Koinonia UI and a better dark mode. References: Passion Conferences (near-black ground, editorial type, accent-coloured dates over poster-led event cards) and Hillsong Conference (minimal nav, rounded media, bold titles). Every colour stays in the brand kit or is a shade of it.

- **Night palette (dark mode):** ground #080D15 (darkest shade of the brand navy), surfaces #0D1420 / #121B2A, stone text #F1EFE9, gold labels #D9B45A, orange actions #FB7624 with navy text. Brand navy #0A203D is kept for the feature bands only: countdown, pillars, stats, closing call and the registration aside. Form fields use gold focus rings.
- **Home:** edition cards are poster-style (photo or official banner on top; date, title, theme and venue below, nothing written over photos), newest first. Section labels (Editions, The word, Watch) above headings. The hero and pillars headlines no longer colour or script one phrase; the script face stays in the logo lockup. Stats are a full-width band with large numerals.
- **Footer:** logo, purpose line, three link columns (Editions, Take part, Contact) and the legal row.
- **Countdown phases:** before the opening day the clock counts down; during the conference it reads Day One, Day Two, Day Three; from midnight after the last day it says the conference has ended and counts down to the next edition, the weekend before Christmas next year (Friday to Sunday ending on the last Sunday on or before 24 December). Logic in js/site.js countdown() / k26Next(); markup in build.js k26Full / k26Compact.

Source of truth: the "UI refresh" block at the end of css/minimal.css, and build.js.
