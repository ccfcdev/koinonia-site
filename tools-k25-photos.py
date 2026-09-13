#!/usr/bin/env python3
"""Koi 25' photo gallery pipeline.
  stage:   python3 tools-k25-photos.py stage <zip> [<zip> ...]
           every photo -> assets/src/k25/stage/<id>.jpg (2000px, ALL metadata stripped) + metrics in stage.json
  publish: python3 tools-k25-photos.py publish [max]
           groups burst shots (similar frames taken seconds apart), keeps the sharpest of each group, drops blurry
           and very dark frames, and writes the published set:
             assets/k25/photo/<id>.jpg (view + download), assets/k25/thumb/<id>.webp (grid, 520px),
             assets/k25/photos.json, assets/k25/zip/koi25-photos-<n>.zip (download all, up to 90 per zip)"""
import sys, os, io, json, zipfile, subprocess, tempfile, hashlib, shutil
from datetime import datetime
import numpy as np
from PIL import Image, ImageOps, ExifTags, ImageFilter
ROOT = os.path.dirname(os.path.abspath(__file__))
STAGE = os.path.join(ROOT, 'assets', 'src', 'k25', 'stage'); os.makedirs(STAGE, exist_ok=True)
SJSON = os.path.join(ROOT, 'assets', 'src', 'k25', 'stage.json')
PUB = os.path.join(ROOT, 'assets', 'k25')
DT = next(k for k, v in ExifTags.TAGS.items() if v == 'DateTimeOriginal')

def load(name, data):
    if name.lower().endswith(('.heic', '.heif')):
        with tempfile.TemporaryDirectory() as t:
            src, dst = os.path.join(t, 'in.heic'), os.path.join(t, 'out.jpg'); open(src, 'wb').write(data)
            subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '95', src, '--out', dst], check=True, capture_output=True)
            im = Image.open(dst); im.load(); return im
    im = Image.open(io.BytesIO(data)); im.load(); return im

def taken(im):
    try:
        ex = im.getexif(); v = ex.get_ifd(0x8769).get(DT) or ex.get(306)
        return datetime.strptime(v, '%Y:%m:%d %H:%M:%S').isoformat() if v else None
    except Exception: return None

def metrics(im):
    g = im.convert('L'); g.thumbnail((640, 640))
    a = np.asarray(g, dtype=np.float32)
    lap = a[1:-1, 1:-1] * 4 - a[:-2, 1:-1] - a[2:, 1:-1] - a[1:-1, :-2] - a[1:-1, 2:]
    d = np.asarray(g.resize((9, 8), Image.LANCZOS), dtype=np.int16); bits = (d[:, 1:] > d[:, :-1]).flatten()
    return float(lap.var()), int(''.join('1' if b else '0' for b in bits), 2), float(a.mean())

def stage(zips):
    meta = json.load(open(SJSON)) if os.path.exists(SJSON) else {}
    n = 0
    for zp in zips:
        z = zipfile.ZipFile(zp)
        for info in z.infolist():
            name = os.path.basename(info.filename)
            if not name.lower().endswith(('.jpg', '.jpeg', '.heic', '.heif', '.png')) or name.startswith('.') or name in meta: continue
            im = load(name, z.read(info)); when = taken(im)
            im = ImageOps.exif_transpose(im).convert('RGB'); im.thumbnail((2000, 2000), Image.LANCZOS)
            clean = Image.new('RGB', im.size); clean.paste(im)            # brand-new image: no EXIF, GPS or serial numbers
            pid = 'koi25-' + hashlib.sha1(name.encode()).hexdigest()[:8]
            clean.save(os.path.join(STAGE, pid + '.jpg'), 'JPEG', quality=84, optimize=True, progressive=True)
            sharp, dh, bright = metrics(clean)
            meta[name] = {'id': pid, 'src': name, 'w': clean.width, 'h': clean.height, 'taken': when, 'sharp': round(sharp, 1), 'dhash': dh, 'bright': round(bright, 1)}
            n += 1
            if n % 25 == 0: print(n, 'staged', flush=True); json.dump(meta, open(SJSON, 'w'))
    json.dump(meta, open(SJSON, 'w')); print('staged', n, 'new, total', len(meta))

def publish(cap):
    meta = sorted(json.load(open(SJSON)).values(), key=lambda p: (p['taken'] or '9999', p['src']))
    ts = lambda p: datetime.fromisoformat(p['taken']).timestamp() if p['taken'] else None
    # 1) cluster visually similar frames shot within 15 minutes of each other; keep the sharpest of each cluster
    clusters = []
    for p in meta:
        t = ts(p); home = None
        for c in reversed(clusters[-40:]):
            r = c[0]; rt = ts(r)
            if t and rt and abs(t - rt) > 900: continue
            if bin(p['dhash'] ^ r['dhash']).count('1') <= 18: home = c; break
        (home.append(p) if home is not None else clusters.append([p]))
    best = [max(c, key=lambda p: p['sharp']) for c in clusters]
    sharp = sorted(p['sharp'] for p in best); floor = sharp[int(len(sharp) * .12)] if sharp else 0
    best = [p for p in best if p['sharp'] >= floor and 28 <= p['bright'] <= 235]
    # 2) spread coverage across the event: at most 4 photos per quarter hour, sharpest first
    buckets = {}
    for p in best: buckets.setdefault(int(ts(p) // 900) if ts(p) else p['src'], []).append(p)
    keep = [q for b in buckets.values() for q in sorted(b, key=lambda p: -p["sharp"])[:8]]
    keep = sorted(keep, key=lambda p: (p['taken'] or '9999', p['src']))
    if len(keep) > cap: keep = sorted(sorted(keep, key=lambda p: -p['sharp'])[:cap], key=lambda p: (p['taken'] or '9999', p['src']))
    groups = clusters
    for d in ('photo', 'thumb', 'zip'):
        shutil.rmtree(os.path.join(PUB, d), ignore_errors=True); os.makedirs(os.path.join(PUB, d))
    out = []
    for i, p in enumerate(keep, 1):
        src = os.path.join(STAGE, p['id'] + '.jpg'); shutil.copyfile(src, os.path.join(PUB, 'photo', p['id'] + '.jpg'))
        im = Image.open(src); im.thumbnail((520, 520), Image.LANCZOS); im.save(os.path.join(PUB, 'thumb', p['id'] + '.webp'), 'WEBP', quality=72, method=5)
        out.append({'id': p['id'], 'n': i, 'w': p['w'], 'h': p['h'], 'taken': p['taken'], 'kb': round(os.path.getsize(src) / 1024)})
    json.dump(out, open(os.path.join(ROOT, 'k25-photos.json'), 'w'), separators=(',', ':'))
    mb = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(PUB) for f in fs) / 1e6
    print(f'{len(meta)} staged, {len(groups)} moments, {len(keep)} published, {mb:.0f} MB on the site')

def publish_list(names_file):
    """Publish exactly the photos named in a JSON list (hand-picked), ordered by capture time."""
    meta = json.load(open(SJSON)); names = json.load(open(names_file))
    keep = sorted([meta[n] for n in names if n in meta], key=lambda p: (p['taken'] or '9999', p['src']))
    for d in ('photo', 'thumb', 'mid', 'zip'):
        shutil.rmtree(os.path.join(PUB, d), ignore_errors=True); os.makedirs(os.path.join(PUB, d))
    out = []
    for i, p in enumerate(keep, 1):
        src = os.path.join(STAGE, p['id'] + '.jpg'); shutil.copyfile(src, os.path.join(PUB, 'photo', p['id'] + '.jpg'))
        im = Image.open(src)
        mid = im.copy(); mid.thumbnail((1000, 1000), Image.LANCZOS); mid.save(os.path.join(PUB, 'mid', p['id'] + '.webp'), 'WEBP', quality=74, method=5)
        im.thumbnail((520, 520), Image.LANCZOS); im.save(os.path.join(PUB, 'thumb', p['id'] + '.webp'), 'WEBP', quality=72, method=5)
        out.append({'id': p['id'], 'src': p['src'], 'n': i, 'w': p['w'], 'h': p['h'], 'taken': p['taken'], 'kb': round(os.path.getsize(src) / 1024)})
    json.dump(out, open(os.path.join(ROOT, 'k25-photos.json'), 'w'), separators=(',', ':'))
    mb = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(PUB) for f in fs) / 1e6
    print(f'{len(out)} published, {mb:.0f} MB on the site')

if __name__ == '__main__':
    if sys.argv[1] == 'stage': stage(sys.argv[2:])
    elif sys.argv[1] == 'publish-list': publish_list(sys.argv[2])
    else: publish(int(sys.argv[2]) if len(sys.argv) > 2 else 200)
