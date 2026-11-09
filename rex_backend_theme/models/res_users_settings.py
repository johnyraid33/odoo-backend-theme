from odoo import fields, models


class ResUsersSettings(models.Model):
    _inherit = 'res.users.settings'

    rx_color_scheme = fields.Selection(
        [('light', 'Light'), ('dark', 'Dark'), ('system', 'System')],
        string='Colour Scheme', default='light', required=True,
        help='System follows the light or dark setting of the device.')
    rx_sidebar_mode = fields.Selection(
        [('expanded', 'Expanded'), ('rail', 'Icons only')],
        string='Sidebar', default='expanded', required=True)
    rx_sidebar_pins = fields.Char(
        string='Pinned Menus', help='Comma-separated ir.ui.menu ids pinned to the top of the sidebar.')
