from odoo import api, fields, models

from .backend_theme import DENSITIES, SCHEMES, SIDEBAR_MODES

# same names on res.users.settings, with the value used when a user has none yet
APPEARANCE_DEFAULTS = {'rx_color_scheme': 'light', 'rx_sidebar_mode': 'expanded', 'rx_density': 'default'}


class ResUsers(models.Model):
    """Appearance preferences, editable by each user in My Preferences.

    The values live in res.users.settings, which the web client already
    receives in the session; these fields only expose them on the form.
    """

    _inherit = 'res.users'

    rx_color_scheme = fields.Selection(
        SCHEMES, string='Colour Scheme', compute='_compute_rx_appearance',
        inverse='_inverse_rx_appearance', user_writeable=True,
        help='System follows the light or dark setting of the device.')
    rx_sidebar_mode = fields.Selection(
        SIDEBAR_MODES, string='Sidebar', compute='_compute_rx_appearance',
        inverse='_inverse_rx_appearance', user_writeable=True)
    rx_density = fields.Selection(
        [('default', 'Company default')] + DENSITIES, string='Density',
        compute='_compute_rx_appearance', inverse='_inverse_rx_appearance', user_writeable=True,
        help='Spacing of lists, forms and the sidebar.')

    @api.depends('res_users_settings_ids')
    def _compute_rx_appearance(self):
        for user in self:
            settings = user.sudo().res_users_settings_id
            for name, default in APPEARANCE_DEFAULTS.items():
                user[name] = (settings[name] if settings else default) if user._is_internal() else False

    def _inverse_rx_appearance(self):
        # access to the user record is checked by the ORM (own record or
        # user manager); the settings record follows it
        for user in self.filtered(lambda u: u._is_internal()):
            values = {name: user[name] for name in APPEARANCE_DEFAULTS if user[name]}
            settings = self.env['res.users.settings'].sudo()._find_or_create_for_user(user)
            changed = {name: value for name, value in values.items() if settings[name] != value}
            if changed:
                settings.write(changed)
