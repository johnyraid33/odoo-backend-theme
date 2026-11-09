from odoo.tests import HttpCase, tagged


def _hoot_id(descriptor):
    """The id Hoot gives a suite or a test (web/tests/test_js.py, HOOTCommon)."""
    value = 0
    for char in descriptor:
        value = ((value << 5) - value + ord(char)) & 0xFFFFFFFF
    return f'{value:08x}'


def _error_checker(message):
    return '[HOOT]' not in message


# Odoo 19 runs a module's Hoot tests only through web's suites with a
# parameter (--test-tags '/web:WebSuite.test_unit_desktop[@rex_backend_theme]');
# these cases run them with the module's own tests.
@tagged('post_install', '-at_install')
class TestThemeUnitDesktop(HttpCase):

    def test_unit_desktop(self):
        self.browser_js(
            '/web/tests?headless&loglevel=2&preset=desktop&timeout=15000&id=%s' % _hoot_id('@rex_backend_theme'),
            '', '', login='admin', timeout=600,
            success_signal='[HOOT] Test suite succeeded', error_checker=_error_checker)


@tagged('post_install', '-at_install')
class TestThemeUnitMobile(HttpCase):
    browser_size = '375x667'
    touch_enabled = True

    def test_unit_mobile(self):
        self.browser_js(
            '/web/tests?headless&loglevel=2&preset=mobile&tag=-headless&timeout=15000&id=%s' % _hoot_id('@rex_backend_theme'),
            '', '', login='admin', timeout=600,
            success_signal='[HOOT] Test suite succeeded', error_checker=_error_checker)
