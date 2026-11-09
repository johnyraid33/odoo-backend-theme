from odoo import fields, models


class ResUsersSettings(models.Model):
    _inherit = 'res.users.settings'

    rx_color_scheme = fields.Selection(
        [('light', 'Light'), ('dark', 'Dark'), ('system', 'System')],
        string='Colour Scheme', default='light', required=True,
        help='System follows the light or dark setting of the device.')
