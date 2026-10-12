#!/usr/bin/env python3
"""
Move a dark page onto Be2FIRST's warm paper. Run from the repo root:
    python3 tools/paper-convert.py page.html [page2.html …] [--apply]

It reads every colour in the page's own CSS (style blocks and style="" attributes) and
remaps it by the property it sits in, so the page keeps its hierarchy but flips its ground:
  backgrounds  dark neutrals → paper #F3F1EC / card #FAF8F5; light overlays → white cards
  text         light neutrals → ink, mid greys → quiet ink (stronger on dark = stronger here)
  borders      white or grey hairlines → ink hairlines
  shadows      softened for a light ground
  accents      kept; any accent too pale to read as text on paper is deepened
Colours set from JavaScript are not touched.
"""
import re, sys, colorsys, pathlib

APPLY = '--apply' in sys.argv
PAGE, CARD, INK = (243, 241, 236), (250, 248, 245), (20, 17, 14)

def parse(c):
    c = c.strip()
    if c.startswith('#'):
        h = c[1:]
        if len(h) in (3, 4): h = ''.join(x * 2 for x in h)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return r, g, b, a
    n = [float(x) for x in re.findall(r'[\d.]+', c)]
    return int(n[0]), int(n[1]), int(n[2]), (n[3] if len(n) > 3 else 1.0)

def fmt(r, g, b, a=1.0):
    r, g, b = (max(0, min(255, round(x))) for x in (r, g, b))
    if a >= 0.999: return '#%02X%02X%02X' % (r, g, b)
    return f'rgba({r},{g},{b},{round(a, 3)})'

def hls(r, g, b): return colorsys.rgb_to_hls(r / 255, g / 255, b / 255)

def warm(L):                      # a warm grey at lightness L (0..1)
    r, g, b = colorsys.hls_to_rgb(36 / 360, L, 0.08)
    return r * 255, g * 255, b * 255

def remap(col, kind):
    r, g, b, a = parse(col)
    h, l, s = hls(r, g, b)
    neutral = s < 0.2 or l < 0.06 or l > 0.94
    if kind == 'bg':
        if neutral:
            if a >= 0.5:
                if l < 0.08: return fmt(*PAGE)
                if l < 0.45: return fmt(*CARD)
                return col                                  # a light surface stays light
            if l > 0.8: return fmt(255, 255, 255, min(0.92, 0.45 + a * 5))   # glass → white card
            if l < 0.08 and a >= 0.35: return fmt(*INK, a * 0.55)            # scrim stays a scrim
            return fmt(*INK, min(0.06, a * 0.3))                             # grey wash → faint tint
        return col
    if kind == 'text':
        if neutral:
            if l > 0.5:                                    # lighter on dark → stronger on paper
                L = max(0.08, min(0.55, 1 - l))
                return fmt(*warm(L), a)
            return col                                     # dark text (on a light card) is already right
        if l > 0.45:                                       # pale accent: deepen until readable
            rr, gg, bb = colorsys.hls_to_rgb(h, 0.36, min(1, s))
            return fmt(rr * 255, gg * 255, bb * 255, a)
        return col
    if kind == 'line':
        if neutral:
            if l > 0.25: return fmt(*INK, max(0.08, min(0.22, a * 0.45)))
            return fmt(*INK, 0.12)
        return col
    if kind == 'shadow':
        if neutral: return fmt(*INK, min(0.16, a * 0.35))
        return fmt(r, g, b, min(a, 0.25))
    return col

KIND = [
    (r'^(background|background-color|background-image|fill)$', 'bg'),
    (r'^(color|-webkit-text-fill-color|caret-color|-webkit-text-stroke(-color)?|text-decoration-color|accent-color)$', 'text'),
    (r'^(border|border-(top|right|bottom|left)|border(-(top|right|bottom|left))?-color|outline|outline-color|column-rule|stroke)$', 'line'),
    (r'^(box-shadow|text-shadow|filter)$', 'shadow'),
]
COLOR = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)')

def kind_of(prop):
    for rx, k in KIND:
        if re.match(rx, prop): return k
    if prop.startswith('--'): return 'var'
    return None

def var_kind(name, value):
    n = name.lower()
    if re.search(r'bg|ground|surface|paper|card|panel|screen|base|back', n): return 'bg'
    if re.search(r'border|rule|line|hair|divider|stroke', n): return 'line'
    if re.search(r'shadow', n): return 'shadow'
    if re.search(r'text|ink|fg|fore|label|muted|faint|quiet|secondary|primary|tertiary', n): return 'text'
    return None

def fix_decls(css):
    def one(m):
        prop, val = m.group(1).strip().lower(), m.group(2)
        k = kind_of(prop)
        if k == 'var': k = var_kind(prop, val)
        if not k: return m.group(0)
        return m.group(1) + ':' + COLOR.sub(lambda c: remap(c.group(0), k), val)
    return re.sub(r'([\w-]+)\s*:([^;{}]+)', one, css)

def convert(html):
    html = re.sub(r'(<style[^>]*>)([\s\S]*?)(</style>)', lambda m: m.group(1) + fix_decls(m.group(2)) + m.group(3), html)
    html = re.sub(r'(style=")([^"]*)(")', lambda m: m.group(1) + fix_decls(m.group(2)) + m.group(3), html)
    html = re.sub(r'(<meta name="theme-color" content=")[^"]*(")', r'\g<1>#F3F1EC\2', html)
    html = re.sub(r'color-scheme\s*:\s*dark\s*;?', 'color-scheme:light;', html)
    return html

if __name__ == '__main__':
    for p in [a for a in sys.argv[1:] if not a.startswith('--')]:
        s = pathlib.Path(p).read_text(encoding='utf-8', errors='surrogateescape')
        n = convert(s)
        print(('converted  ' if APPLY else 'would convert  ') + p, '' if n != s else '(no change)')
        if APPLY and n != s: pathlib.Path(p).write_text(n, encoding='utf-8', errors='surrogateescape')
