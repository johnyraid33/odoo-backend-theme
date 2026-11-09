from odoo import models
from odoo.http import request

from .backend_theme import DEFAULT_DENSITY, DENSITIES


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def color_scheme(self):
        """Serve the dark bundles according to the user's preference.

        Community always answers "light". "system" follows the color_scheme
        cookie, which the web client keeps in line with the device setting
        (views/webclient_templates.xml).
        """
        scheme = super().color_scheme()
        user = self.env.user
        if not request or not user or user._is_public():
            return scheme
        preference = self.env['res.users.settings']._find_or_create_for_user(user).rx_color_scheme
        if preference == 'system':
            return 'dark' if request.cookies.get('color_scheme') == 'dark' else 'light'
        return preference or scheme

    def session_info(self):
        info = super().session_info()
        user = self.env.user
        if user._is_internal():
            info['rex_backend_theme'] = self._rx_theme_session_info()
        return info

    def _rx_theme_session_info(self):
        """Company-wide runtime values (the user's own ones are in user_settings)."""
        params = self.env['ir.config_parameter'].sudo()
        density = params.get_str('rex_backend_theme.density')
        logo = params.get_bool('rex_backend_theme.sidebar_logo')
        companies = self.env.user.company_ids.with_context(bin_size=True) if logo else []
        return {
            'density': density if density in dict(DENSITIES) else DEFAULT_DENSITY,
            'sidebar_logo': logo,
            # only companies that have a logo: Odoo would serve its own otherwise
            'logo_company_ids': [company.id for company in companies if company.logo],
        }
