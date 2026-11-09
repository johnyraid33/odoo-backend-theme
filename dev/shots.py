"""Screenshot the key backend screens of a running Odoo, for before/after comparison.

Drives Google Chrome through the DevTools protocol (needs `websocket-client`),
logs in as admin/admin and saves PNG files at 1920x1200, device scale 2.

    python3 dev/shots.py http://127.0.0.1:8180 theme20 dev/shots/after [--dark]

Each shot is (file name, Odoo path, JS run before the capture).
"""
import base64
import os
import json
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import websocket

BASE, DB, OUT = sys.argv[1].rstrip('/'), sys.argv[2], Path(sys.argv[3])
DARK = '--dark' in sys.argv
ONLY = [a for a in sys.argv[4:] if not a.startswith('--')]
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PORT = 9341
WIDTH, HEIGHT = int(os.environ.get('W', 1920)), int(os.environ.get('H', 1200))
MOBILE = WIDTH < 768
SUFFIX = os.environ.get('SUFFIX', '')

CLICK = "document.querySelector(%r)?.click();"
SHOTS = [
    ('01_sales_list', '/odoo/action-sale.action_orders', ''),
    ('02_sale_form', '/odoo/action-sale.action_orders/22', ''),
    ('03_crm_kanban', '/odoo/action-crm.crm_lead_action_pipeline', ''),
    ('04_search_open', '/odoo/action-sale.action_orders', CLICK % '.o_searchview_dropdown_toggler'),
    ('05_invoice_form', '/odoo/action-account.action_move_out_invoice_type/10', ''),
    ('06_contacts', '/odoo/contacts', ''),
    ('07_settings', '/odoo/settings', ''),
    ('08_apps_menu', '/odoo/action-sale.action_orders', CLICK % '.rx-app-switcher, .o_navbar_apps_menu button'),
    ('09_lead_form', '/odoo/action-crm.crm_lead_action_pipeline/13', ''),
    ('10_dialog', '/odoo/action-sale.action_orders/22',
     "[...document.querySelectorAll('.o_statusbar_buttons button')]"
     ".find(b => b.textContent.includes('Create Invoice'))?.click();"),
    ('13_rail', '/odoo/action-sale.action_orders', CLICK % '.rx-topbar-toggle'),
    ('14_launcher', '/odoo/action-sale.action_orders',
     # Odoo's "alt" hotkeys are Ctrl on macOS
     "const mac = /Mac/.test(navigator.platform);"
     "document.dispatchEvent(new KeyboardEvent('keydown', {key: 'h', code: 'KeyH', altKey: !mac, ctrlKey: mac, bubbles: true}));"),
    ('15_drawer', '/odoo/action-sale.action_orders', CLICK % '.rx-topbar-toggle'),
    ('20_calendar', '/odoo/action-calendar.action_calendar_event', ''),
    ('21_pivot', '/odoo/action-sale.action_order_report_all?view_type=pivot', ''),
    ('22_graph', '/odoo/action-sale.action_order_report_all?view_type=graph', ''),
    ('23_activity', '/odoo/action-sale.action_orders?view_type=activity', ''),
    ('24_many2one', '/odoo/action-sale.action_orders/new',
     "document.querySelector('.o_field_widget[name=partner_id] input')?.click();"),
    ('25_datepicker', '/odoo/action-sale.action_orders/new',
     "const i = document.querySelector('.o_field_widget[name=validity_date] input'); i?.focus(); i?.click();"),
    ('26_task_form', '/odoo/action-project.action_view_all_task', ''),
    ('27_stock_picking', '/odoo/action-stock.action_picking_tree_all', ''),
    ('30_login', '/web/login?db=' + DB, ''),
    ('11_user_menu', '/odoo/action-sale.action_orders', CLICK % '.o_user_menu'),
    ('12_theme_settings', '/odoo/settings',
     "document.querySelector('#rex_backend_theme')?.scrollIntoView({block: 'start'});"),
]


def login():
    body = json.dumps({'jsonrpc': '2.0', 'params': {'db': DB, 'login': 'admin', 'password': 'admin'}}).encode()
    req = urllib.request.Request(BASE + '/web/session/authenticate', data=body,
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        for header in resp.headers.get_all('Set-Cookie'):
            if header.startswith('session_id='):
                return header.split(';')[0].split('=', 1)[1]
    raise SystemExit('login failed')


class Tab:
    def __init__(self, ws_url):
        self.ws = websocket.create_connection(ws_url, timeout=60)
        self.n = 0

    def call(self, method, **params):
        self.n += 1
        self.ws.send(json.dumps({'id': self.n, 'method': method, 'params': params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get('id') == self.n:
                if 'error' in msg:
                    raise RuntimeError(msg['error'])
                return msg.get('result', {})


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    session = login()
    profile = tempfile.mkdtemp()
    chrome = subprocess.Popen([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                               '--remote-debugging-port=%s' % PORT, '--user-data-dir=%s' % profile,
                               'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                targets = json.load(urllib.request.urlopen('http://127.0.0.1:%s/json' % PORT))
                page = [t for t in targets if t.get('type') == 'page'][0]
                break
            except Exception:  # noqa: BLE001
                time.sleep(0.2)
        tab = Tab(page['webSocketDebuggerUrl'])
        host = BASE.split('//', 1)[1].split(':')[0]
        tab.call('Network.enable')
        if not os.environ.get('NOLOGIN'):
            tab.call('Network.setCookie', name='session_id', value=session, domain=host, path='/')
        tab.call('Network.setCookie', name='color_scheme', value='dark' if DARK else 'light', domain=host, path='/')
        tab.call('Emulation.setDeviceMetricsOverride', width=WIDTH, height=HEIGHT, deviceScaleFactor=3 if MOBILE else 2, mobile=MOBILE)
        # with the "system" preference the web client follows the device scheme
        tab.call('Emulation.setEmulatedMedia', features=[
            {'name': 'prefers-color-scheme', 'value': 'dark' if DARK else 'light'}])
        tab.call('Page.enable')
        # the first load of the web client fetches and compiles its assets
        tab.call('Page.navigate', url=BASE + ('/web/login' if os.environ.get('NOLOGIN') else '/odoo/action-base.action_res_users'))
        time.sleep(12)
        for name, path, script in SHOTS:
            if ONLY and not any(o in name for o in ONLY):
                continue
            # Discuss and dirty forms register beforeunload, which would block the navigation
            tab.call('Runtime.evaluate', expression=(
                "window.onbeforeunload = null;"
                "window.addEventListener('beforeunload', (e) => e.stopImmediatePropagation(), true);"))
            nav = tab.call('Page.navigate', url=BASE + path)
            if nav.get('errorText'):
                print('navigation failed:', path, nav['errorText'])
            time.sleep(4)
            tab.call('Runtime.evaluate', expression=(
                "document.activeElement && document.activeElement.blur();"
                "document.querySelectorAll('.o_notification_manager, .o_tour_pointer').forEach(e => e.remove());"))
            if script:
                tab.call('Runtime.evaluate', expression=script)
                time.sleep(1.5)
            time.sleep(0.5)
            shot = tab.call('Page.captureScreenshot', format='png')
            target = OUT / ('%s%s%s.png' % (name, SUFFIX, '_dark' if DARK else ''))
            target.write_bytes(base64.b64decode(shot['data']))
            href = tab.call('Runtime.evaluate', expression='location.pathname', returnByValue=True)['result'].get('value')
            print('wrote', target, href)
    finally:
        chrome.terminate()


main()
