# Koinonia site design refresh

Use the official Koi 26 banner palette across all nine pages: warm paper #FAF8F2, navy ink #102E55, orange #F56A17, muted gold #896B2C. Typography uses the existing bundled Bricolage Grotesque and Instrument Sans fonts. New ink variants of the existing logo keep its shapes intact.

css/minimal.css is the site-specific theme layer, loaded after the shared styles and versioned by the builder. Shared CCFC styles are not modified. It covers navigation, menu, editorial image heroes, cards, details, galleries, registration inputs, feed and account tokens. Existing content, field names, registration submission and backend access are unchanged.

Motion: short control transitions, small scroll reveals and progressive cross-document fades where supported. Reduced-motion settings remove transitions and reveals. The homepage has a centered introduction and an inset worship video, inspired by the supplied church layout reference. Blue returns in fellowship, statistics and closing sections. The video serves the existing 1080p source or 4K source according to rendered pixel width, with a clean 1920px poster, play/pause control and reduced-motion/data-saving behavior. Scroll-linked hero transforms stay disabled.

Verification: all nine pages at 390px and 1440px in Chromium, no horizontal overflow and consistent page background. Menu open/Escape close at both sizes. Registration form remains present and interactive; no submissions sent. Desktop and phone screenshots reviewed. JavaScript syntax, generated site build and diff whitespace checks pass. Production deployment requires separate approval.

## Blue and video revision

Reference: https://dribbble.com/shots/26631367-Website-Design-For-Church by Jeevitha K. Adapted its centered church introduction, inset worship video and restrained rounded controls to CCFC's own colors, copy, media and conference. No reference artwork or code is copied.

Registration adds four anchor-based section links, blue focus treatment, selected radio/checkbox indicators and a blue event-information aside. Field names, submission handling and server access remain unchanged. Verification adds native form choice and WhatsApp synchronization checks, video decode/play/pause at phone and desktop sizes and a 3840px decode check at 2x display density. No data submitted. Existing source footage limits visual detail; no upscaling or new third-party video service introduced.
