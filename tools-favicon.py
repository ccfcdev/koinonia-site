#!/usr/bin/env python3
"""Koinonia's favicon set, drawn from the brand guide's "Emblem / Icon" (the mark the guide names for favicons,
profile pictures and badges):
- a Covenant Gold crescent, thick on the left and tapering to points at the upper and lower right;
- a K cut on the line of its upper arm, Koinonia Orange (#FB7624) above and Fellowship Blue (#013E87) below;
- on white, as in the guide. White also keeps the blue half of the K clear in dark tab bars.
The shapes are geometry measured from the guide, so no font is needed.
usage: python3 tools-favicon.py      (Google Chrome turns the SVG into PNGs)

Writes:
- favicon.ico (16, 32, 48);
- assets/logo/favicon-{32,48,64,192,512}.png, favicon.png (256) and apple-touch-icon.png (180);
- assets/logo/koinonia-emblem.svg, the emblem alone on a clear background for anywhere else it is wanted.
Small sizes (16 to 48) use a thicker ring and a slightly bigger emblem, or the ring's thin ends vanish.
The apple-touch icon is square and opaque, because iOS rounds the corners itself and turns transparency black.
After changing the icon, bump ICONV in build.js so browsers fetch the new files (/assets is cached for a year)."""
import math, os, subprocess, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
LOGO = os.path.join(HERE, 'assets', 'logo')

# Measurements come in the guide image's pixels; S and the offsets fit the emblem's bounding box, 110 by 140 units,
# into the middle 400 px of a 512 tile.
S = 2.857
X0, Y0 = 99 - 23.6 * S, 56 - 16.3 * S
T = lambda x, y: (round(X0 + x * S, 1), round(Y0 + y * S, 1))


def crescent(cx, cy, R, thick, tip1, tip2):
    """The outer circle minus an inner circle offset towards the opening: thickest on the far side, pointed at the tips."""
    mid, half = math.radians((tip1 + tip2) / 2), math.radians((tip2 - tip1) / 2)
    D = (R * R - (R - thick) ** 2) / (2 * (R - thick) + 2 * R * math.cos(half))   # the offset that puts the tips at tip1 and tip2
    r = R + D - thick
    p = lambda a: f'{cx + R * math.cos(math.radians(a)):.1f} {cy + R * math.sin(math.radians(a)):.1f}'
    return f'M{p(tip1)} A{R} {R} 0 1 0 {p(tip2)} A{r:.1f} {r:.1f} 0 1 1 {p(tip1)}Z'


def emblem(ring=8.4, scale=1.0):
    """The ring and the K as SVG paths, scaled about the centre of the 512 tile."""
    cx, cy = T(93.6, 86.3)
    arc = crescent(cx, cy, 70 * S, ring * S, -60, 72)
    poly = lambda pts: 'M' + ' L'.join(f'{a} {b}' for a, b in (T(*q) for q in pts)) + 'Z'
    top = lambda x: 47 - 0.927 * (x - 110)   # the upper arm's top edge, carried through the stem: the orange/blue cut
    orange = poly([(65.5, 47), (82.5, 47), (82.5, top(82.5)), (65.5, top(65.5))]) + poly([(110, 47), (133.75, 47), (82.5, 95.5), (82.5, top(82.5))])
    blue = poly([(65.5, top(65.5)), (82.5, top(82.5)), (82.5, 125.5), (65.5, 125.5)]) + poly([(82.5, 95.5), (103.5, 95.5), (133.5, 125.5), (112.5, 125.5)])
    tf = f' transform="translate(256 256) scale({scale}) translate(-256 -256)"' if scale != 1 else ''
    return (f'<defs><linearGradient id="gold" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#EACB7B"/><stop offset=".45" stop-color="#C9A24A"/><stop offset="1" stop-color="#886C2B"/></linearGradient></defs>'
            f'<g{tf}><path d="{arc}" fill="url(#gold)"/><path d="{orange}" fill="#FB7624"/><path d="{blue}" fill="#013E87"/></g>')


svg = lambda body, tile='': f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{tile}{body}</svg>'
VARIANTS = {
    'full':   svg(emblem(scale=.95), '<rect width="512" height="512" rx="112" fill="#FFFFFF"/>'),   # 64 px and up
    'small':  svg(emblem(ring=11, scale=1.06), '<rect width="512" height="512" rx="104" fill="#FFFFFF"/>'),   # 16 to 48 px
    'square': svg(emblem(scale=.95), '<rect width="512" height="512" fill="#FFFFFF"/>'),   # iOS home screen
}


def render(markup, px=1024):
    tmp = tempfile.mkdtemp(); html = os.path.join(tmp, 'i.html'); png = os.path.join(tmp, 'i.png')
    open(html, 'w').write(f'<!doctype html><meta charset="utf-8"><style>html,body{{margin:0;background:transparent}}svg{{display:block;width:{px}px;height:{px}px}}</style>{markup}')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000', '--force-device-scale-factor=1',
                    f'--window-size={px},{px}', '--virtual-time-budget=2000', f'--screenshot={png}', 'file://' + html], capture_output=True, timeout=90)
    return Image.open(png).convert('RGBA').crop((0, 0, px, px))


art = {k: render(v) for k, v in VARIANTS.items()}
at = lambda k, px: art[k].resize((px, px), Image.LANCZOS)
out = {'favicon-32.png': at('small', 32), 'favicon-48.png': at('small', 48), 'favicon-64.png': at('full', 64), 'favicon.png': at('full', 256),
       'favicon-192.png': at('full', 192), 'favicon-512.png': at('full', 512), 'apple-touch-icon.png': at('square', 180).convert('RGB')}
for name, im in out.items():
    im.save(os.path.join(LOGO, name), optimize=True); print(name, im.size)
at('small', 48).save(os.path.join(HERE, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)], append_images=[at('small', 32), at('small', 16)])
print('favicon.ico', sorted(Image.open(os.path.join(HERE, 'favicon.ico')).info['sizes']))
open(os.path.join(LOGO, 'koinonia-emblem.svg'), 'w').write(svg(emblem()) + '\n'); print('koinonia-emblem.svg')
