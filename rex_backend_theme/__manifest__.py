{
    'name': 'Rex Backend Theme',
    'version': '20.0.0.2.0',
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
