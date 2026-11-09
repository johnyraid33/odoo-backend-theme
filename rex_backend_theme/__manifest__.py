{
    'name': 'Rex Backend Theme',
    'version': '20.0.0.4.0',
    'category': 'Themes/Backend',
    'summary': 'A calm, neutral backend in the shadcn/ui style: sidebar navigation, '
               'light and dark schemes, configurable accent, palette and radius',
    'author': 'POLISHCHUK & SONS LTD',
    'website': 'https://github.com/johnyraid',
    'license': 'LGPL-3',
    'depends': ['web', 'web_tour', 'base_setup'],
    'data': [
        'views/webclient_templates.xml',
        'views/res_config_settings_views.xml',
        'views/res_users_views.xml',
        'data/rex_backend_theme_data.xml',
    ],
    'assets': {
        # Token files go before Odoo's own variables so every `!default` of web
        # and Bootstrap takes our value. Backend bundles only: website, portal
        # and reports keep their look.
        'web.assets_backend': [
            ('before', 'web/static/src/scss/primary_variables.scss',
             'rex_backend_theme/static/src/scss/user_variables.scss'),
            ('before', 'web/static/src/scss/primary_variables.scss',
             'rex_backend_theme/static/src/scss/tokens.scss'),
            ('before', 'web/static/src/scss/primary_variables.scss',
             'rex_backend_theme/static/src/scss/primary_variables.scss'),
            ('before', 'web/static/src/scss/secondary_variables.scss',
             'rex_backend_theme/static/src/scss/secondary_variables.scss'),
            ('before', 'web/static/src/scss/bootstrap_overridden.scss',
             'rex_backend_theme/static/src/scss/bootstrap_variables.scss'),
            'rex_backend_theme/static/src/scss/fonts.scss',
            'rex_backend_theme/static/src/scss/backend.scss',
            'rex_backend_theme/static/src/scss/layout.scss',
            'rex_backend_theme/static/src/core/**/*',
            'rex_backend_theme/static/src/webclient/**/*',
            'rex_backend_theme/static/src/views/**/*',
            'rex_backend_theme/static/src/settings/**/*',
            # graph JS patches the lazily loaded GraphRenderer
            ('remove', 'rex_backend_theme/static/src/views/graph/**/*'),
        ],
        'web.assets_backend_lazy': [
            ('before', 'web/static/src/scss/primary_variables.scss',
             'rex_backend_theme/static/src/scss/user_variables.scss'),
            ('before', 'web/static/src/scss/primary_variables.scss',
             'rex_backend_theme/static/src/scss/tokens.scss'),
            ('before', 'web/static/src/scss/primary_variables.scss',
             'rex_backend_theme/static/src/scss/primary_variables.scss'),
            ('before', 'web/static/src/scss/secondary_variables.scss',
             'rex_backend_theme/static/src/scss/secondary_variables.scss'),
            ('before', 'web/static/src/scss/bootstrap_overridden.scss',
             'rex_backend_theme/static/src/scss/bootstrap_variables.scss'),
            'rex_backend_theme/static/src/views/graph/**/*',
        ],
        # The database login page: tokens (variables only, no CSS output) and
        # rules scoped to body.o_web_login.
        'web.assets_frontend': [
            'rex_backend_theme/static/src/scss/user_variables.scss',
            'rex_backend_theme/static/src/scss/tokens.scss',
            'rex_backend_theme/static/src/scss/fonts.scss',
            'rex_backend_theme/static/src/login/login.scss',
        ],
        # Unit tests: Odoo's own tests measure the stock layout in pixels
        # (column widths, calendar slots, text case), so they run without the
        # theme's styles; its JavaScript stays and is tested. Tours check the
        # styled backend in a real browser.
        'web.assets_unit_tests_setup': [
            ('remove', 'rex_backend_theme/static/src/**/*.scss'),
        ],
        'web.assets_unit_tests': [
            'rex_backend_theme/static/tests/**/*',
        ],
        # Dark scheme: the same tokens, compiled with $rx-dark: true.
        'web.assets_web_dark': [
            ('before', 'rex_backend_theme/static/src/scss/tokens.scss',
             'rex_backend_theme/static/src/scss/dark.scss'),
        ],
        'web.assets_backend_lazy_dark': [
            ('before', 'rex_backend_theme/static/src/scss/tokens.scss',
             'rex_backend_theme/static/src/scss/dark.scss'),
        ],
    },
    'uninstall_hook': 'uninstall_hook',
    'installable': True,
    'application': False,
}
