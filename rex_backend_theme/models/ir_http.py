from odoo import models
from odoo.http import request


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
