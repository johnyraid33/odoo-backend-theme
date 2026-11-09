"""Download the compiled backend CSS of a running Odoo: python3 dev/bundle_css.py BASE DB OUT_DIR [--dark]

Saves web.assets_web(_dark).css and the lazy bundle, so two builds can be diffed.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

BASE, DB, OUT = sys.argv[1].rstrip('/'), sys.argv[2], Path(sys.argv[3])
DARK = '--dark' in sys.argv


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    body = json.dumps({'jsonrpc': '2.0', 'params': {'db': DB, 'login': 'admin', 'password': 'admin'}}).encode()
    req = urllib.request.Request(BASE + '/web/session/authenticate', data=body,
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        sid = [h.split(';')[0] for h in resp.headers.get_all('Set-Cookie') if h.startswith('session_id=')][0]
    cookie = sid + ('; color_scheme=dark' if DARK else '')
    html = urllib.request.urlopen(urllib.request.Request(BASE + '/odoo', headers={'Cookie': cookie})).read().decode()
    hrefs = re.findall(r'href="(/web/assets/[^"]+\.css)"', html)
    bundle = 'web.assets_web_dark' if DARK else 'web.assets_web'
    for href in hrefs:
        if '/%s.' % bundle in href or href.endswith('/%s.min.css' % bundle):
            css = urllib.request.urlopen(urllib.request.Request(BASE + href, headers={'Cookie': cookie})).read()
            (OUT / ('%s.css' % bundle)).write_bytes(css)
            print('wrote', OUT / ('%s.css' % bundle), len(css), href)
    lazy = 'web.assets_backend_lazy_dark' if DARK else 'web.assets_backend_lazy'
    url = BASE + '/web/bundle/%s' % lazy
    try:
        info = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'Cookie': cookie})))
        for item in info:
            if item.get('type') == 'link':
                css = urllib.request.urlopen(urllib.request.Request(BASE + item['src'], headers={'Cookie': cookie})).read()
                (OUT / ('%s.css' % lazy)).write_bytes(css)
                print('wrote', OUT / ('%s.css' % lazy), len(css))
    except Exception as exc:  # noqa: BLE001
        print('lazy bundle not fetched:', exc)


main()
