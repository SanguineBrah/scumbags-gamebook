# Redraw the home-screen icons in assets/icons from the rulebook's typewriter face.
# A one-off helper, not part of the build: needs Python 3 and Pillow (pip install pillow).
# Usage: python3 tools/icons.py
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
INK, PAPER, BLOOD = (0x22, 0x19, 0x0f), (0xf3, 0xec, 0xdc), (0x8e, 0x1b, 0x12)   # the page's --ink, --paper, --blood
FONT = str(ROOT / 'assets' / 'gnu-typewriter.ttf')

def glyph(ch, f):
    g = Image.new('L', (1400, 1400), 0)
    ImageDraw.Draw(g).text((200, 100), ch, font=f, fill=255)
    return g.crop(g.getbbox())

def make(size, maskable=False, border=True):
    """'S!' in cream with a blood-red shadow on ink, inside a ruled frame (kept clear of the mask's edge if maskable)."""
    S = 1024
    im = Image.new('RGB', (S, S), INK)
    d = ImageDraw.Draw(im)
    m = int(S * (0.15 if maskable else 0.06))
    if border:
        d.rectangle([m, m, S - m, S - m], outline=PAPER, width=int(S * 0.02))
    f = ImageFont.truetype(FONT, int(S * (0.52 if maskable else 0.66 if border else 0.80)))
    gs, ge = glyph('S', f), glyph('!', f)
    gap = int(S * 0.06)
    w, h = gs.width + gap + ge.width, max(gs.height, ge.height)
    x, y = (S - w) // 2, (S - h) // 2
    off = int(S * 0.016)
    for dx, col in [(off * 2, BLOOD), (0, PAPER)]:
        im.paste(col, (x + dx, y + h - gs.height + dx), gs)
        im.paste(col, (x + gs.width + gap + dx, y + h - ge.height + dx), ge)
    return im.resize((size, size), Image.LANCZOS)

out = ROOT / 'assets' / 'icons'
out.mkdir(parents=True, exist_ok=True)
for n in (512, 192, 180):
    make(n).save(out / f'icon-{n}.png', optimize=True)
make(32, border=False).save(out / 'icon-32.png', optimize=True)
make(512, maskable=True).save(out / 'maskable-512.png', optimize=True)
