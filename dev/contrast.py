"""WCAG contrast report for the theme tokens.

    python3 dev/contrast.py                 # every preset accent, palette and scheme
    python3 dev/contrast.py --accent '#0f766e'
    python3 dev/contrast.py --markdown > dev/contrast.md

Mirrors rex_backend_theme/static/src/scss/tokens.scss (Sass mix() and the
YIQ text choice). Exit status 1 when a required pair is below its minimum.
"""
import importlib.util
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKENS = ROOT / 'rex_backend_theme/static/src/scss/tokens.scss'
PRESETS_JS = ROOT / 'rex_backend_theme/static/src/settings/theme_values.js'

# the module's own derivation, loaded without Odoo
_spec = importlib.util.spec_from_file_location('rx_colors', ROOT / 'rex_backend_theme/models/colors.py')
colors = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(colors)


def read_muted_light():
    text = TOKENS.read_text()
    block = text[text.index('$rx-muted-light: ('):]
    block = block[:block.index(');')]
    return dict(re.findall(r'(\w+): (#[0-9a-f]{6})', block))


def read_neutrals():
    text = TOKENS.read_text()
    block = text[text.index('$rx-neutrals: ('):text.index(');', text.index('$rx-neutrals: ('))]
    scales = {}
    for name, body in re.findall(r'(\w+): \(([^)]*)\)', block):
        if name == "neutrals":
            continue
        scales[name] = {int(k): v for k, v in re.findall(r'(\d+): (#[0-9a-f]{6})', body)}
    return scales


def read_presets():
    return re.findall(r'_t\("([^"]+)"\), color: "(#[0-9a-f]{6})"', PRESETS_JS.read_text())


def rgb(hex_):
    return tuple(int(hex_[i:i + 2], 16) for i in (1, 3, 5))


def hex_(c):
    return '#' + ''.join('%02x' % round(v) for v in c)


def mix(a, b, w):
    """Sass mix(): w (0..1) of a, the rest of b."""
    return hex_(tuple(x * w + y * (1 - w) for x, y in zip(rgb(a), rgb(b))))


def yiq(c):
    r, g, b = rgb(c)
    return (r * 299 + g * 587 + b * 114) / 1000


def luminance(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(v) for v in rgb(c))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def tokens(n, accent, dark, muted_light):
    v = colors.accent_variants(accent, n)
    t = {}
    t['background'] = n[900] if dark else '#ffffff'
    t['foreground'] = n[50] if dark else n[950]
    t['surface'] = mix(n[900], n[950], .45) if dark else n[50]
    t['page'] = n[950] if dark else n[100]
    t['muted-foreground'] = n[400] if dark else muted_light
    t['gray-700'] = n[300] if dark else n[700]
    t['strong'] = n[50] if dark else n[950]
    t['strong-foreground'] = n[950] if dark else '#ffffff'
    t['primary'] = v['primary']
    t['primary-foreground'] = v['primary_foreground']
    t['primary-text'] = v['primary_text_dark'] if dark else v['primary_text']
    t['primary-subtle'] = mix(accent, t['background'], .22 if dark else .10)
    t['ring'] = mix(v['primary_text_dark'], t['background'], .60) if dark else mix('#ffffff', v['primary_text'], .45)
    for name, color in (('success', '#16a34a'), ('info', '#3b82f6'), ('warning', '#f59e0b'), ('danger', '#ef4444')):
        if dark:
            t[f'{name}-soft-bg'], t[f'{name}-soft-text'] = mix(color, t['background'], .20), mix('#ffffff', color, .40)
        else:
            ink = .40 if name == 'warning' else .28
            t[f'{name}-soft-bg'], t[f'{name}-soft-text'] = mix(color, '#ffffff', .12), mix('#000000', color, ink)
    return t


# (label, text token, background token, minimum)
PAIRS = [
    ('body text on cards', 'foreground', 'background', 7),
    ('body text on the panel', 'foreground', 'surface', 7),
    ('secondary text on cards', 'muted-foreground', 'background', 4.5),
    ('secondary text on the panel', 'muted-foreground', 'surface', 4.5),
    ('sidebar items', 'gray-700', 'page', 4.5),
    ('sidebar group titles', 'muted-foreground', 'page', 4.5),
    ('active navigation', 'strong-foreground', 'strong', 4.5),
    ('primary button text', 'primary-foreground', 'primary', 4.5),
    ('accent links on cards', 'primary-text', 'background', 4.5),
    ('selected row text', 'foreground', 'primary-subtle', 4.5),
    ('focus ring on cards', 'ring', 'background', 1.5),
    ('success badge', 'success-soft-text', 'success-soft-bg', 4.5),
    ('info badge', 'info-soft-text', 'info-soft-bg', 4.5),
    ('warning badge', 'warning-soft-text', 'warning-soft-bg', 4.5),
    ('danger badge', 'danger-soft-text', 'danger-soft-bg', 4.5),
]
# pairs that depend only on the palette, checked once per palette
NEUTRAL_ONLY = {p[0] for p in PAIRS if 'primary' not in p[1] + p[2] and p[1] != 'ring'}


def main():
    args = sys.argv[1:]
    markdown = '--markdown' in args
    accents = [('Custom', args[args.index('--accent') + 1].lower())] if '--accent' in args else read_presets()
    neutrals = read_neutrals()
    muted = read_muted_light()
    failures, rows = [], []
    for scheme in ('light', 'dark'):
        for neutral, scale in neutrals.items():
            for index, (accent_name, accent) in enumerate(accents):
                t = tokens(scale, accent, scheme == 'dark', muted[neutral])
                for label, fg, bg, minimum in PAIRS:
                    if label in NEUTRAL_ONLY and index:
                        continue
                    value = ratio(t[fg], t[bg])
                    who = neutral if label in NEUTRAL_ONLY else f'{neutral} / {accent_name} {accent}'
                    ok = value >= minimum
                    rows.append((scheme, who, label, t[fg], t[bg], value, minimum, ok))
                    if not ok:
                        failures.append(rows[-1])
    if markdown:
        print('| Scheme | Palette / accent | Pair | Text | Background | Ratio | Min | |')
        print('| --- | --- | --- | --- | --- | --- | --- | --- |')
        for scheme, who, label, fg, bg, value, minimum, ok in rows:
            print(f'| {scheme} | {who} | {label} | `{fg}` | `{bg}` | {value:.2f} | {minimum} | {"✓" if ok else "✗"} |')
    else:
        print(f'{len(rows)} pairs checked, {len(failures)} below the minimum')
        for scheme, who, label, fg, bg, value, minimum, ok in failures:
            print(f'  {scheme:5} {who:32} {label:28} {fg} on {bg}: {value:.2f} < {minimum}')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
