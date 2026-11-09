from odoo import fields, models

from .backend_theme import DEFAULT_DENSITY, DEFAULTS, DENSITIES, NEUTRALS, RADII

PARAM = 'rex_backend_theme.%s'


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # compiled into the style bundles
    rx_accent_color = fields.Char(
        string='Accent Colour', config_parameter=PARAM % 'accent', default=DEFAULTS['accent'],
        help='Primary buttons, links in focus, selected states.')
    rx_neutral = fields.Selection(
        NEUTRALS, string='Neutral Palette', config_parameter=PARAM % 'neutral', default=DEFAULTS['neutral'],
        help='The gray scale of backgrounds, borders and secondary text.')
    rx_radius = fields.Selection(
        RADII, string='Corner Radius', config_parameter=PARAM % 'radius', default=DEFAULTS['radius'])
    # applied by the web client
    rx_density = fields.Selection(
        DENSITIES, string='Density', config_parameter=PARAM % 'density', default=DEFAULT_DENSITY,
        help='Default spacing of lists, forms and the sidebar. Users can override it in their preferences.')
    rx_sidebar_logo = fields.Boolean(
        string='Company Logo in the Sidebar', config_parameter=PARAM % 'sidebar_logo')

    def _rx_theme_values(self):
        get = self.env['ir.config_parameter'].sudo().get_str
        return {key: get(PARAM % key) or DEFAULTS[key] for key in DEFAULTS}

    def set_values(self):
        before = self._rx_theme_values()
        # validate before anything is stored
        self.env['rex.backend.theme']._validate({
            'accent': self.rx_accent_color, 'neutral': self.rx_neutral, 'radius': self.rx_radius,
        })
        super().set_values()
        after = self._rx_theme_values()
        if after != before:
            self.env['rex.backend.theme']._save_user_variables(after)
