# Koinonia site design refresh

Use the official Koi 26 banner palette across all nine pages: warm paper #FAF8F2, navy ink #102E55, orange #F56A17, muted gold #896B2C. Typography uses the existing bundled Bricolage Grotesque and Instrument Sans fonts. New ink variants of the existing logo keep its shapes intact.

css/minimal.css is the site-specific theme layer, loaded after the shared styles and versioned by the builder. Shared CCFC styles are not modified. It covers navigation, menu, editorial image heroes, cards, details, galleries, registration inputs, feed and account tokens. Existing content, field names, registration submission and backend access are unchanged.

Motion: short control transitions, small scroll reveals and progressive cross-document fades where supported. Reduced-motion settings remove transitions and reveals. Static hero photography replaces homepage autoplay video and scroll-linked hero transforms.

Verification: all nine pages at 390px and 1440px in Chromium, no horizontal overflow and consistent page background. Menu open/Escape close at both sizes. Registration form remains present and interactive; no submissions sent. Desktop and phone screenshots reviewed. JavaScript syntax, generated site build and diff whitespace checks pass. Production deployment requires separate approval.
