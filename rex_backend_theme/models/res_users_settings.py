from odoo import fields, models

from .backend_theme import DENSITIES, SCHEMES, SIDEBAR_MODES


class ResUsersSettings(models.Model):
    _inherit = 'res.users.settings'

    rx_color_scheme = fields.Selection(
        SCHEMES, string='Colour Scheme', default='light', required=True,
        help='System follows the light or dark setting of the device.')
    rx_sidebar_mode = fields.Selection(
        SIDEBAR_MODES, string='Sidebar', default='expanded', required=True)
    rx_sidebar_pins = fields.Char(
        string='Pinned Menus', help='Comma-separated ir.ui.menu ids pinned to the top of the sidebar.')
    rx_density = fields.Selection(
        [('default', 'Company default')] + DENSITIES, string='Density', default='default', required=True,
        help='Spacing of lists, forms and the sidebar. Company default follows the general settings.')
