"""Side-by-side before/after images: python3 dev/compare.py (needs Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent / 'shots'
OUT = ROOT / 'compare'
OUT.mkdir(exist_ok=True)
try:
    font = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 30)
except OSError:
    font = ImageFont.load_default()
for before in sorted((ROOT / 'before').glob('*.png')):
    after = ROOT / 'after' / before.name
    if not after.exists():
        continue
    a, b = Image.open(before), Image.open(after)
    w, h = 1920, int(a.height * 1920 / a.width)
    canvas = Image.new('RGB', (w * 2 + 24, h + 64), '#ffffff')
    d = ImageDraw.Draw(canvas)
    d.text((8, 16), 'Odoo 20 (stock)', fill='#71717a', font=font)
    d.text((w + 32, 16), 'Rex Backend Theme', fill='#09090b', font=font)
    canvas.paste(a.resize((w, h), Image.LANCZOS), (0, 64))
    canvas.paste(b.resize((w, h), Image.LANCZOS), (w + 24, 64))
    canvas.save(OUT / before.name, optimize=True)
    print('wrote', OUT / before.name)
