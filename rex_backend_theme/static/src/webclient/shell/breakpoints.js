import { MEDIAS_BREAKPOINTS, SIZES } from "@web/core/ui/ui_service";

// Odoo switches to its widest layout (chatter beside the form, wider kanban
// columns) at the XXL window size, 1400px. The sidebar takes about 250px of
// the window, so the content only gets that width from 1650px: XXL moves
// there, together with $grid-breakpoints in primary_variables.scss.
const RX_XXL = 1650;
MEDIAS_BREAKPOINTS[SIZES.XL].maxWidth = RX_XXL - 1;
MEDIAS_BREAKPOINTS[SIZES.XXL].minWidth = RX_XXL;
