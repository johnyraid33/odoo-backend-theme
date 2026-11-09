import { isMacOS } from "@web/core/browser/feature_detection";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { patch } from "@web/core/utils/patch";
import { NavBar } from "@web/webclient/navbar/navbar";

/**
 * The stock navbar becomes the top bar of the panel: a sidebar toggle (rail
 * on desktop, drawer on phones), a search field that opens the command
 * palette, and the systray. The stock apps menu and sections stay in the DOM
 * for other modules but are hidden from the md breakpoint up (shell.scss).
 */
patch(NavBar.prototype, {
    setup() {
        super.setup(...arguments);
        this.rxShell = useService("rex_shell");
        this.rxCommand = useService("command");
        this.rxLabels = {
            search: _t("Search or jump to…"),
            shortcut: isMacOS() ? "⌘K" : "Ctrl K",
            toggle: _t("Toggle sidebar"),
            menu: _t("Open menu"),
        };
    },

    rxToggleSidebar() {
        if (this.ui.isSmall) {
            this.rxShell.openDrawer();
        } else {
            this.rxShell.toggleRail();
        }
    },

    rxOpenSearch() {
        this.rxCommand.openMainPalette({});
    },
});
