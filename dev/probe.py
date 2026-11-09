"""Evaluate JS in a logged-in Odoo page: python3 dev/probe.py BASE DB PATH 'JS expression' [pre-JS]"""
import json, os, subprocess, sys, tempfile, time, urllib.request
import websocket
BASE, DB, PATH, EXPR = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3], sys.argv[4]
PRE = sys.argv[5] if len(sys.argv) > 5 else ''
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PORT = 9343
body = json.dumps({'jsonrpc': '2.0', 'params': {'db': DB, 'login': 'admin', 'password': 'admin'}}).encode()
req = urllib.request.Request(BASE + '/web/session/authenticate', data=body, headers={'Content-Type': 'application/json'})
sid = [h.split(';')[0].split('=', 1)[1] for h in urllib.request.urlopen(req).headers.get_all('Set-Cookie') if h.startswith('session_id=')][0]
chrome = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=%s' % PORT, '--user-data-dir=%s' % tempfile.mkdtemp(), 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try:
            page = [t for t in json.load(urllib.request.urlopen('http://127.0.0.1:%s/json' % PORT)) if t['type'] == 'page'][0]; break
        except Exception: time.sleep(0.2)
    ws = websocket.create_connection(page['webSocketDebuggerUrl'], timeout=60); n = [0]
    def call(m, **p):
        n[0] += 1; ws.send(json.dumps({'id': n[0], 'method': m, 'params': p}))
        while True:
            r = json.loads(ws.recv())
            if r.get('id') == n[0]: return r.get('result', r)
    call('Network.enable'); call('Network.setCookie', name='session_id', value=sid, domain='127.0.0.1', path='/')
    call('Emulation.setDeviceMetricsOverride', width=int(os.environ.get('W', 1600)), height=1000, deviceScaleFactor=1, mobile=False)
    if os.environ.get('SCHEME'):  # emulate the device colour scheme: light | dark
        call('Emulation.setEmulatedMedia', features=[{'name': 'prefers-color-scheme', 'value': os.environ['SCHEME']}])
        call('Network.setCookie', name='color_scheme', value=os.environ['SCHEME'], domain='127.0.0.1', path='/')
    call('Page.navigate', url=BASE + PATH); time.sleep(7)
    if PRE: call('Runtime.evaluate', expression=PRE); time.sleep(1.5)
    print(call('Runtime.evaluate', expression=EXPR, returnByValue=True, awaitPromise=True)['result'].get('value'))
finally:
    chrome.terminate()
