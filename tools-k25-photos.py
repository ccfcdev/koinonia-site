#!/usr/bin/env python3
"""Edition photo gallery pipeline (Koi 24', Koi 25', ...). The edition key comes first; without one it is k25.
  stage:        python3 tools-k25-photos.py k24 stage <zip|folder> [<zip|folder> ...]
                every photo -> assets/src/<ed>/stage/<id>.jpg (2000px, ALL metadata stripped) + metrics in stage.json.
                Photoroom edits (IMG_8155-Photoroom.jpg) are staged beside their original (IMG_8155.JPG) with
                photoroom: true and pair: <the other file> on both, so curation can pick one.
  sheets:       python3 tools-k25-photos.py k24 sheets [per-sheet 48] [columns 8]
                numbered contact sheets in capture order, look-alikes side by side -> assets/src/<ed>/sheets/sheet-NN.jpg
                label: #n, sharpness, look-alike group g<n>x<size>; index.json maps #n to the file name and staged id
  publish-list: python3 tools-k25-photos.py k24 publish-list names.json   (hand-picked original names or staged ids;
                a {"heading": [names]} object instead of a list publishes story sections, for sets without capture dates)
  publish:      python3 tools-k25-photos.py k24 publish [max]              (automatic curation)
                both write assets/<ed>/photo/<id>.jpg (view + download), mid/<id>.webp (1000px, edition page Moments),
                thumb/<id>.webp (520px, grid) and <ed>-photos.json; build.js and js/site.js read them"""
import sys, os, io, re, json, zipfile, subprocess, tempfile, hashlib, shutil
from datetime import datetime
import numpy as np
from PIL import Image, ImageOps, ExifTags, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.abspath(__file__))
ED = sys.argv.pop(1) if len(sys.argv) > 1 and re.fullmatch(r'k\d\d', sys.argv[1]) else 'k25'
STAGE = os.path.join(ROOT, 'assets', 'src', ED, 'stage'); os.makedirs(STAGE, exist_ok=True)
SJSON = os.path.join(ROOT, 'assets', 'src', ED, 'stage.json')
SHEETS = os.path.join(ROOT, 'assets', 'src', ED, 'sheets')
PUB = os.path.join(ROOT, 'assets', ED)
OUT = os.path.join(ROOT, ED + '-photos.json')
PREFIX = 'koi' + ED[1:] + '-'
PR = re.compile(r'^(.+?)[-_ ]+photoroom(?:[-_ ]*\(?\d+\)?)?$', re.I)   # IMG_8155-Photoroom, IMG_8155-Photoroom (1): an edit of IMG_8155
BATCH = re.compile(r'^Photoroom_(\d+)_(\d{8}_\d{6})(.*)$', re.I)       # Photoroom_<index>_<batch export time>: app batch export, no original name
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

def sources(paths):
    """(path inside the zip or folder, size, loader) for every file in the given zips and extracted folders"""
    for sp in paths:
        if os.path.isdir(sp):
            for dp, dns, fns in os.walk(sp):
                dns[:] = sorted(d for d in dns if d != '__MACOSX' and not d.startswith('.'))
                for f in sorted(fns):
                    fp = os.path.join(dp, f); yield os.path.relpath(fp, sp), os.path.getsize(fp), (lambda fp=fp: open(fp, 'rb').read())
        else:
            z = zipfile.ZipFile(sp)
            for info in z.infolist():
                if not info.filename.startswith('__MACOSX/') and not info.is_dir(): yield info.filename, info.file_size, (lambda z=z, info=info: z.read(info))

def stage(paths):
    meta = json.load(open(SJSON)) if os.path.exists(SJSON) else {}
    n = skipped = 0
    for rel, size, read in sources(paths):
        name = os.path.basename(rel)
        if not name.lower().endswith(('.jpg', '.jpeg', '.heic', '.heif', '.png')) or name.startswith('.'): skipped += not name.startswith('.'); continue
        key, k, parent = name, 1, os.path.basename(os.path.dirname(rel))
        while key in meta and meta[key].get('bytes') not in (None, size):   # same name, different file (two cameras): stage both
            k += 1; key = f'{parent}/{name}' if k == 2 and parent else f'{name}~{k}'
        if key in meta: continue
        try: im = load(name, read()); when = taken(im)
        except Exception as e: print('could not read', rel, e); continue
        alpha = im.mode in ('RGBA', 'LA', 'PA') or 'transparency' in im.info
        im = ImageOps.exif_transpose(im)
        if alpha: im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.getchannel('A')); im = bg
        im = im.convert('RGB'); im.thumbnail((2000, 2000), Image.LANCZOS)
        clean = Image.new('RGB', im.size); clean.paste(im)            # brand-new image: no EXIF, GPS or serial numbers
        pid = PREFIX + hashlib.sha1(key.encode()).hexdigest()[:8]
        clean.save(os.path.join(STAGE, pid + '.jpg'), 'JPEG', quality=84, optimize=True, progressive=True)
        sharp, dh, bright = metrics(clean)
        meta[key] = {'id': pid, 'src': key, 'w': clean.width, 'h': clean.height, 'taken': when, 'sharp': round(sharp, 1), 'dhash': dh, 'bright': round(bright, 1), 'bytes': size, 'from': rel, **({'alpha': True} if alpha else {})}
        n += 1
        if n % 25 == 0: print(n, 'staged', flush=True); json.dump(meta, open(SJSON, 'w'))
    pairs = pair(meta)
    json.dump(meta, open(SJSON, 'w')); print('staged', n, 'new, total', len(meta), f'({pairs} Photoroom pairs, {skipped} non-photo files skipped)')

def pair(meta):
    """link each Photoroom edit to its original (same file stem); the edit inherits the capture time it lost on export"""
    stem = lambda k: os.path.splitext(os.path.basename(k))[0]
    originals = {}
    for k in meta:
        if 'photoroom' not in k.lower(): originals.setdefault(stem(k).lower(), k)
    n = 0
    for k, p in meta.items():
        if 'photoroom' not in k.lower(): continue
        p['photoroom'] = True; m = PR.match(stem(k)); o = m and originals.get(m.group(1).lower())
        if o: p['pair'] = o; meta[o]['pair'] = k; p['taken'] = p['taken'] or meta[o]['taken']; n += 1
    return n

seq = lambda k: (lambda m: f'Photoroom_{m[2]}_{int(m[1]):03d}{m[3]}' if m else k)(BATCH.match(os.path.basename(k)))   # batch exports in export order
order = lambda ps: sorted(ps, key=lambda p: (p['taken'] or '9999', seq(p['src'])))
ts = lambda p: datetime.fromisoformat(p['taken']).timestamp() if p['taken'] else None

def bursts(meta):
    """visually similar frames shot within 15 minutes of each other"""
    clusters = []
    for p in meta:
        t = ts(p); home = None
        for c in reversed(clusters[-40:]):
            r = c[0]; rt = ts(r)
            if t and rt and abs(t - rt) > 900: continue
            if bin(p['dhash'] ^ r['dhash']).count('1') <= 18: home = c; break
        (home.append(p) if home is not None else clusters.append([p]))
    return clusters

def similar(meta, thr=.9):
    """look-alike groups anywhere in the set (bursts, one frame exported twice), even without capture times:
    24x24 grey thumbnails correlated, same orientation. Returns a group number per photo."""
    V = []
    for p in meta:
        im = Image.open(os.path.join(STAGE, p['id'] + '.jpg')); im.draft('L', (200, 200))
        g = np.asarray(im.convert('L').resize((24, 24), Image.BILINEAR), dtype=np.float32).flatten(); g -= g.mean(); V.append(g / (np.linalg.norm(g) + 1e-6))
    V = np.array(V); land = np.array([p['w'] >= p['h'] for p in meta]); S = V @ V.T; S[land[:, None] != land[None, :]] = -1
    par = list(range(len(meta)))
    def root(i):
        while par[i] != i: par[i] = par[par[i]]; i = par[i]
        return i
    for i, j in zip(*np.where(np.triu(S > thr, 1))): a, b = root(i), root(j); par[max(a, b)] = min(a, b)
    return [root(i) + 1 for i in range(len(meta))]

def sheets(per=48, cols=8):
    """contact sheets in capture order with look-alikes side by side; label #n, sharpness, look-alike group (g<n>x<size>)"""
    meta = order(json.load(open(SJSON)).values()); grp = similar(meta); size = {g: grp.count(g) for g in grp}
    meta, grp = zip(*sorted(zip(meta, grp), key=lambda t: grp.index(t[1])))   # stable: each group sits where its first frame falls
    shutil.rmtree(SHEETS, ignore_errors=True); os.makedirs(SHEETS)
    w, h, bar = 240, 164, 24
    try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 18)
    except OSError: font = ImageFont.load_default()
    index = []
    for s in range(0, len(meta), per):
        chunk = meta[s:s + per]; rows = (len(chunk) + cols - 1) // cols; sn = s // per + 1
        sheet = Image.new('RGB', (cols * w, rows * (h + bar)), (18, 18, 18)); d = ImageDraw.Draw(sheet)
        for i, p in enumerate(chunk):
            x, y, n, g = i % cols * w, i // cols * (h + bar), s + i + 1, grp[s + i]
            im = Image.open(os.path.join(STAGE, p['id'] + '.jpg')); im.draft('RGB', (w, h)); im = ImageOps.contain(im, (w - 6, h - 4))
            sheet.paste(im, (x + (w - im.width) // 2, y + 2 + (h - 4 - im.height) // 2))
            d.text((x + 4, y + h + 1), f"#{n} s{p['sharp']:.0f}" + (f" g{g}x{size[g]}" if size[g] > 1 else ''), fill=(255, 214, 0) if size[g] > 1 else (255, 255, 255), font=font)
            index.append({'n': n, 'sheet': sn, 'src': p['src'], 'id': p['id'], 'sharp': p['sharp'], 'bright': p['bright'], 'taken': p['taken'], 'group': g, 'w': p['w'], 'h': p['h'], **{k: p[k] for k in ('photoroom', 'pair', 'from') if k in p}})
        sheet.save(os.path.join(SHEETS, f'sheet-{sn:02d}.jpg'), quality=82)
    json.dump(index, open(os.path.join(SHEETS, 'index.json'), 'w'), indent=1)
    print(len(meta), 'photos,', len(size), 'look-alike groups, on', (len(meta) + per - 1) // per, 'sheets in', os.path.relpath(SHEETS, ROOT), '(index.json maps #n to the file)')

def write(keep):
    """the published set: photo (view + download), mid (edition page), thumb (grid) and <ed>-photos.json"""
    for d in ('photo', 'thumb', 'mid', 'zip'):
        shutil.rmtree(os.path.join(PUB, d), ignore_errors=True); os.makedirs(os.path.join(PUB, d))
    out = []
    for i, p in enumerate(keep, 1):
        src = os.path.join(STAGE, p['id'] + '.jpg'); shutil.copyfile(src, os.path.join(PUB, 'photo', p['id'] + '.jpg'))
        im = Image.open(src)
        mid = im.copy(); mid.thumbnail((1000, 1000), Image.LANCZOS); mid.save(os.path.join(PUB, 'mid', p['id'] + '.webp'), 'WEBP', quality=74, method=5)
        im.thumbnail((520, 520), Image.LANCZOS); im.save(os.path.join(PUB, 'thumb', p['id'] + '.webp'), 'WEBP', quality=72, method=5)
        out.append({'id': p['id'], 'src': p['src'], 'n': i, 'w': p['w'], 'h': p['h'], 'taken': p['taken'], 'kb': round(os.path.getsize(src) / 1024), **({'group': p['group']} if p.get('group') else {})})
    json.dump(out, open(OUT, 'w'), separators=(',', ':'))
    return out, sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(PUB) for f in fs) / 1e6

def publish(cap):
    meta = order(json.load(open(SJSON)).values())
    # 1) cluster visually similar frames shot within 15 minutes of each other; keep the sharpest of each cluster
    clusters = bursts(meta)
    best = [max(c, key=lambda p: p['sharp']) for c in clusters]
    sharp = sorted(p['sharp'] for p in best); floor = sharp[int(len(sharp) * .12)] if sharp else 0
    best = [p for p in best if p['sharp'] >= floor and 28 <= p['bright'] <= 235]
    # 2) spread coverage across the event: at most 8 photos per quarter hour, sharpest first
    buckets = {}
    for p in best: buckets.setdefault(int(ts(p) // 900) if ts(p) else p['src'], []).append(p)
    keep = order(q for b in buckets.values() for q in sorted(b, key=lambda p: -p['sharp'])[:8])
    if len(keep) > cap: keep = order(sorted(keep, key=lambda p: -p['sharp'])[:cap])
    out, mb = write(keep)
    print(f'{len(meta)} staged, {len(clusters)} moments, {len(out)} published, {mb:.0f} MB on the site')

def publish_list(names_file):
    """Publish exactly the photos named in a JSON list (hand-picked names or staged ids), ordered by capture time.
    A JSON object {"heading": [names], ...} publishes story sections instead (for sets without capture dates), in that order."""
    meta = json.load(open(SJSON)); names = json.load(open(names_file)); ids = {p['id']: k for k, p in meta.items()}
    groups = names if isinstance(names, dict) else {'': names}; flat = [n for ns in groups.values() for n in ns]
    missing = [n for n in flat if n not in meta and n not in ids]
    keys = list(dict.fromkeys(ids.get(n, n) for n in flat if n not in missing))
    both = [k for k in keys if meta[k].get('pair') in keys]
    if missing: print('not staged:', ', '.join(missing))
    if len(keys) < len(flat) - len(missing): print(len(flat) - len(missing) - len(keys), 'picked twice')
    if both: print('picked both the original and the Photoroom edit:', ', '.join(f"{k} + {meta[k]['pair']}" for k in both if meta[k].get('photoroom')))
    seen = set(); keep = []
    for g, ns in groups.items():
        ks = [k for k in dict.fromkeys(ids.get(n, n) for n in ns if n not in missing) if k not in seen]; seen.update(ks)
        keep += [dict(p, group=g) if g else p for p in order(meta[k] for k in ks)]
    out, mb = write(keep)
    print(f'{len(out)} published, {mb:.0f} MB on the site')

if __name__ == '__main__':
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == 'stage': stage(args)
    elif cmd == 'sheets': sheets(*map(int, args))
    elif cmd == 'publish-list': publish_list(args[0])
    else: publish(int(args[0]) if args else 200)
