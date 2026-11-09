from odoo.exceptions import ValidationError
from odoo.tests import HttpCase, TransactionCase, tagged

from ..models.backend_theme import BUNDLES, USER_VARIABLES


@tagged('post_install', '-at_install')
class TestThemeSettings(TransactionCase):

    def _custom_assets(self):
        return self.env['ir.asset'].with_context(active_test=False).search([('target', '=', USER_VARIABLES)])

    def _save(self, **values):
        self.env['res.config.settings'].create(values).execute()

    def test_custom_values_replace_the_token_file(self):
        self._save(rx_accent_color='#0D9488', rx_neutral='stone', rx_radius='lg')
        assets = self._custom_assets()
        self.assertEqual(sorted(assets.mapped('bundle')), sorted(BUNDLES))
        self.assertTrue(all(asset.directive == 'replace' for asset in assets))
        attachment = self.env['ir.attachment'].search([('url', '=', assets[0].path)])
        content = attachment.raw.decode()
        self.assertIn('$rx-user-accent: #0d9488;', content)
        self.assertIn('$rx-user-neutral: stone;', content)
        self.assertIn('$rx-user-radius: lg;', content)

    def test_defaults_remove_the_customisation(self):
        self._save(rx_accent_color='#e11d48')
        self.assertTrue(self._custom_assets())
        self._save(rx_accent_color='#6366f1', rx_neutral='zinc', rx_radius='md')
        self.assertFalse(self._custom_assets())
        self.assertFalse(self.env['ir.attachment'].search([('url', 'like', USER_VARIABLES)]))

    def test_values_cannot_inject_scss(self):
        before = self.env['ir.attachment'].search([('url', 'like', USER_VARIABLES)]).mapped('checksum')
        for accent in ('red', '#12345', '#123456; } body { display: none', 'url(x)'):
            with self.assertRaises(ValidationError):
                self._save(rx_accent_color=accent)
        after = self.env['ir.attachment'].search([('url', 'like', USER_VARIABLES)]).mapped('checksum')
        self.assertEqual(before, after)

    def test_uninstall_cleanup(self):
        self._save(rx_accent_color='#e11d48')
        self.env['rex.backend.theme']._reset_user_variables()
        self.assertFalse(self._custom_assets())


@tagged('post_install', '-at_install')
class TestColorScheme(HttpCase):

    def _bundle(self, cookie=None):
        if cookie:
            self.opener.cookies.set('color_scheme', cookie, domain='127.0.0.1', path='/')
        html = self.url_open('/odoo').text
        return 'dark' if 'web.assets_web_dark' in html else 'light'

    def _prefer(self, scheme):
        settings = self.env['res.users.settings']._find_or_create_for_user(self.env.ref('base.user_admin'))
        settings.rx_color_scheme = scheme

    def test_explicit_preference_wins_over_cookie(self):
        self.authenticate('admin', 'admin')
        self._prefer('dark')
        self.assertEqual(self._bundle(cookie='light'), 'dark')
        self._prefer('light')
        self.assertEqual(self._bundle(cookie='dark'), 'light')

    def test_system_follows_the_cookie(self):
        self.authenticate('admin', 'admin')
        self._prefer('system')
        self.assertEqual(self._bundle(cookie='dark'), 'dark')
        self.assertEqual(self._bundle(cookie='light'), 'light')

    def test_preference_is_a_user_setting(self):
        self.authenticate('admin', 'admin')
        settings = self.env['res.users.settings']._find_or_create_for_user(self.env.ref('base.user_admin'))
        result = self.make_jsonrpc_request('/web/dataset/call_kw/res.users.settings/set_res_users_settings', {
            'model': 'res.users.settings',
            'method': 'set_res_users_settings',
            'args': [[settings.id]],
            'kwargs': {'new_settings': {'rx_color_scheme': 'dark'}},
        })
        self.assertEqual(result['rx_color_scheme'], 'dark')
