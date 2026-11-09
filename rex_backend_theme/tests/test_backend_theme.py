from odoo.exceptions import AccessError, ValidationError
from odoo.tests import HttpCase, TransactionCase, new_test_user, tagged

import re

from odoo.tools.misc import file_open

from ..models.backend_theme import (
    BUNDLES, DEFAULTS, NEUTRAL_SCALES, USER_VARIABLES, render_user_variables,
)
from ..models.colors import accent_variants, contrast


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

    def test_runtime_values_do_not_recompile(self):
        self._save(rx_density='compact', rx_sidebar_logo=True)
        params = self.env['ir.config_parameter']
        self.assertEqual(params.get_str('rex_backend_theme.density'), 'compact')
        self.assertTrue(params.get_bool('rex_backend_theme.sidebar_logo'))
        self.assertFalse(self._custom_assets())

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


@tagged('post_install', '-at_install')
class TestUserAppearance(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.alice = new_test_user(cls.env, 'rx_alice', groups='base.group_user')
        cls.bob = new_test_user(cls.env, 'rx_bob', groups='base.group_user')

    def test_defaults(self):
        self.assertEqual(self.alice.rx_color_scheme, 'light')
        self.assertEqual(self.alice.rx_sidebar_mode, 'expanded')
        self.assertEqual(self.alice.rx_density, 'default')

    def test_user_changes_own_appearance(self):
        alice = self.alice.with_user(self.alice)
        alice.write({'rx_color_scheme': 'system', 'rx_density': 'compact', 'rx_sidebar_mode': 'rail'})
        settings = self.alice.res_users_settings_id
        self.assertEqual(settings.rx_color_scheme, 'system')
        self.assertEqual(settings.rx_density, 'compact')
        self.assertEqual(settings.rx_sidebar_mode, 'rail')
        self.assertEqual(self.alice.rx_density, 'compact')

    def test_user_cannot_change_someone_else(self):
        with self.assertRaises(AccessError):
            self.bob.with_user(self.alice).write({'rx_density': 'compact'})
        self.assertEqual(self.bob.res_users_settings_id.rx_density, 'default')

    def test_portal_users_have_no_appearance(self):
        portal = new_test_user(self.env, 'rx_portal', groups='base.group_portal')
        self.assertFalse(portal.rx_color_scheme)


@tagged('post_install', '-at_install')
class TestThemeSession(HttpCase):

    def test_session_info_carries_company_values(self):
        params = self.env['ir.config_parameter']
        params.set_str('rex_backend_theme.density', 'compact')
        params.set_bool('rex_backend_theme.sidebar_logo', True)
        company = self.env.ref('base.user_admin').company_id
        self.authenticate('admin', 'admin')
        info = self.make_jsonrpc_request('/web/session/get_session_info')
        theme = info['rex_backend_theme']
        self.assertEqual(theme['density'], 'compact')
        self.assertTrue(theme['sidebar_logo'])
        self.assertEqual(company.id in theme['logo_company_ids'], bool(company.logo))
        self.assertIn('rx_density', info['user_settings'])

    def test_unknown_density_falls_back(self):
        self.env['ir.config_parameter'].set_str('rex_backend_theme.density', 'huge')
        self.authenticate('admin', 'admin')
        info = self.make_jsonrpc_request('/web/session/get_session_info')
        self.assertEqual(info['rex_backend_theme']['density'], 'comfortable')


@tagged('post_install', '-at_install')
class TestAccentDerivation(TransactionCase):

    def test_static_defaults_match_the_derivation(self):
        with file_open('rex_backend_theme/static/src/scss/user_variables.scss') as f:
            static = ''.join(line for line in f if line.startswith('$'))
        self.assertEqual(static, render_user_variables(DEFAULTS))

    def test_python_palettes_match_the_scss(self):
        with file_open('rex_backend_theme/static/src/scss/tokens.scss') as f:
            text = f.read()
        block = text[text.index('$rx-neutrals: ('):text.index(');', text.index('$rx-neutrals: ('))]
        scss = {
            name: {int(k): v for k, v in re.findall(r'(\d+): (#[0-9a-f]{6})', body)}
            for name, body in re.findall(r'(\w+): \(([^)]*)\)', block) if name != 'neutrals'
        }
        self.assertEqual(scss, NEUTRAL_SCALES)

    def test_variants_meet_aa(self):
        for accent in ('#6366f1', '#d97706', '#0d9488', '#ffff00', '#000000', '#a3e635', '#ffffff'):
            for neutral, scale in NEUTRAL_SCALES.items():
                v = accent_variants(accent, scale)
                self.assertGreaterEqual(contrast(v['primary'], v['primary_foreground']), 4.5, (accent, neutral))
                self.assertGreaterEqual(contrast(v['primary_text'], scale[50]), 4.5, (accent, neutral))
                self.assertGreaterEqual(contrast(v['primary_text_dark'], scale[900]), 4.5, (accent, neutral))

    def test_accessible_accent_is_kept(self):
        v = accent_variants('#2563eb', NEUTRAL_SCALES['zinc'])
        self.assertEqual(v['primary'], '#2563eb')
        self.assertEqual(v['primary_text'], '#2563eb')

    def test_saved_file_carries_the_variants(self):
        self.env['res.config.settings'].create({'rx_accent_color': '#d97706'}).execute()
        asset = self.env['ir.asset'].with_context(active_test=False).search([('target', '=', USER_VARIABLES)], limit=1)
        content = self.env['ir.attachment'].search([('url', '=', asset.path)]).raw.decode()
        variants = accent_variants('#d97706', NEUTRAL_SCALES['zinc'])
        self.assertIn('$rx-user-primary: %s;' % variants['primary'], content)
        self.assertIn('$rx-user-primary-text-dark: %s;' % variants['primary_text_dark'], content)

    def test_refresh_rewrites_an_old_customisation(self):
        self.env['res.config.settings'].create({'rx_accent_color': '#d97706'}).execute()
        asset = self.env['ir.asset'].with_context(active_test=False).search([('target', '=', USER_VARIABLES)], limit=1)
        attachment = self.env['ir.attachment'].search([('url', '=', asset.path)])
        attachment.raw = b'$rx-user-accent: #d97706;\n'
        self.env['rex.backend.theme']._refresh_user_variables()
        self.assertIn('$rx-user-primary:', attachment.raw.decode())
