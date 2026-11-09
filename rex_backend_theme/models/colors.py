"""Colour maths for the theme values (no Odoo imports: dev/contrast.py loads it).

Sass in Odoo (libsass) cannot compute WCAG luminance, so the accent variants
that must meet a contrast ratio are derived here when the settings are saved
and written into user_variables.scss. static/src/settings/theme_values.js
repeats the same steps for the live preview.
"""

WHITE = '#ffffff'
BLACK = '#000000'
AA = 4.5
# the largest darkening a fill accepts before dark text is preferred
MAX_FILL_SHADE = 0.25
STEP = 0.01


def rgb(color):
    return tuple(int(color[i:i + 2], 16) for i in (1, 3, 5))


def to_hex(channels):
    return '#' + ''.join('%02x' % round(c) for c in channels)


def mix(a, b, weight):
    """Sass mix(): `weight` (0..1) of a, the rest of b."""
    return to_hex(x * weight + y * (1 - weight) for x, y in zip(rgb(a), rgb(b)))


def luminance(color):
    def channel(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (channel(c) for c in rgb(color))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def shade_until(color, toward, against, target=AA):
    """Mix `toward` into `color` step by step until it reaches `target` on `against`.

    Returns (colour, weight of `toward`)."""
    weight = 0.0
    result = color
    while contrast(result, against) < target and weight < 1:
        weight = round(weight + STEP, 2)
        result = mix(toward, color, weight)
    return result, weight


def accent_variants(accent, scale):
    """The accent colours the tokens need, each meeting WCAG AA.

    `scale` is the neutral palette (50..950). Returns a dict of hex colours:
    primary / primary_foreground  button fill and its text
    primary_text                  links and accent text on light cards
    primary_text_dark             the same on dark cards
    """
    accent = accent.lower()
    ink = scale[950]
    if contrast(WHITE, accent) >= AA:
        fill, on_fill = accent, WHITE
    else:
        darker, weight = shade_until(accent, BLACK, WHITE)
        if weight <= MAX_FILL_SHADE or contrast(ink, accent) < AA:
            fill, on_fill = darker, WHITE
        else:
            fill, on_fill = accent, ink
    # links sit on white cards and on the slightly darker panel
    text, _w = shade_until(accent, BLACK, scale[50])
    text_dark, _w = shade_until(mix(WHITE, accent, 0.35), WHITE, scale[900])
    return {
        'primary': fill,
        'primary_foreground': on_fill,
        'primary_text': text,
        'primary_text_dark': text_dark,
    }
