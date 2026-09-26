#!/usr/bin/env python3
"""Koinonia's favicon set: a Koinonia-orange tile with a navy K in Bebas Neue, the site's display face. The orange
keeps it apart from the church, Worship Connect and admin icons, which are all navy or black.
usage: python3 tools-favicon.py      (needs Google Chrome, for the site's own Bebas Neue)

Writes favicon.ico (16, 32, 48) and assets/logo/favicon-{32,48,64,192,512}.png, favicon.png (256) and
apple-touch-icon.png (180). Small sizes drop the faint arc, which is only noise at 16 px. The apple-touch icon
is square and opaque, because iOS rounds the corners itself and turns transparency black. After changing the
icon, bump ICONV in build.js so browsers fetch the new files (/assets is cached for a year)."""
import os, subprocess, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
FONT = os.path.join(HERE, 'assets', 'fonts', 'BebasNeue-400.woff2')
LOGO = os.path.join(HERE, 'assets', 'logo')

ORANGE = '<linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8B3D"/><stop offset="1" stop-color="#E4570F"/></linearGradient>'
ARC = '<path d="M392 132 A176 176 0 1 0 392 380" fill="none" stroke="#0A203D" stroke-opacity=".22" stroke-width="22" stroke-linecap="round"/>'
VARIANTS = {
    # tile with the arc from the Koinonia logo's sweep, for 64 px and up
    'full':   f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs>{ORANGE}</defs><rect width="512" height="512" rx="112" fill="url(#o)"/>{ARC}<text x="262" y="392" text-anchor="middle" font-family="KB" font-size="372" fill="#0A203D">K</text></svg>',
    # 16 to 48 px: no arc, a bigger K
    'small':  f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs>{ORANGE}</defs><rect width="512" height="512" rx="104" fill="url(#o)"/><text x="258" y="410" text-anchor="middle" font-family="KB" font-size="420" fill="#0A203D">K</text></svg>',
    # iOS home screen: full bleed, no transparency
    'square': f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs>{ORANGE}</defs><rect width="512" height="512" fill="url(#o)"/>{ARC}<text x="262" y="392" text-anchor="middle" font-family="KB" font-size="372" fill="#0A203D">K</text></svg>',
}


def render(svg, px=1024):
    tmp = tempfile.mkdtemp(); html = os.path.join(tmp, 'i.html'); png = os.path.join(tmp, 'i.png')
    open(html, 'w').write(f"""<!doctype html><meta charset="utf-8"><style>@font-face{{font-family:KB;src:url('file://{FONT}') format('woff2')}}
html,body{{margin:0;background:transparent}}svg{{display:block;width:{px}px;height:{px}px}}</style>{svg}""")
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
print('favicon.ico', [s for s in Image.open(os.path.join(HERE, 'favicon.ico')).info['sizes']])
