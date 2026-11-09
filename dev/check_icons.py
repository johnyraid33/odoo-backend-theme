"""List or check Material Symbols ligatures available in Odoo's icon subset.

    python3 dev/check_icons.py FONT.woff              # print every ligature name
    python3 dev/check_icons.py FONT.woff name1 name2  # exit 1 if a name is missing

Get the font from the stand:
    docker compose -f dev/docker-compose.yml exec -T odoo cat \
      /usr/lib/python3/dist-packages/odoo/addons/web/static/src/libs/materialsymbols/material_symbols_backend.woff > /tmp/ms.woff

Needs fontTools (the Command Line Tools python has it).
"""
import sys

from fontTools.ttLib import TTFont


def ligatures(path):
    font = TTFont(path)
    cmap = {glyph: chr(code) for code, glyph in font.getBestCmap().items()}
    names = set()
    for lookup in font['GSUB'].table.LookupList.Lookup:
        for sub in lookup.SubTable:
            sub = getattr(sub, 'ExtSubTable', sub)
            for first, ligs in getattr(sub, 'ligatures', {}).items():
                for lig in ligs:
                    word = ''.join(cmap.get(g, '?') for g in [first, *lig.Component])
                    names.add(word)
    return names


def main():
    names = ligatures(sys.argv[1])
    wanted = sys.argv[2:]
    if not wanted:
        print('\n'.join(sorted(names)))
        return
    missing = [name for name in wanted if name not in names]
    for name in missing:
        print('missing:', name)
    sys.exit(1 if missing else 0)


main()
