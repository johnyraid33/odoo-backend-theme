import { Component, onPatched, proxy, signal } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const COLUMNS = 6;

/**
 * Full-screen app launcher (alt+H, or "All apps" in the app switcher): a
 * searchable grid of apps and the recently opened records. Community's
 * counterpart of the Enterprise home menu.
 */
export class RexLauncher extends Component {
    static template = "rex_backend_theme.Launcher";

    setup() {
        this.shell = useService("rex_shell");
        this.menuService = useService("menu");
        this.state = proxy({ query: "", index: 0 });
        this.input = signal.ref();
        this.labels = {
            title: _t("Apps"),
            search: _t("Search apps…"),
            recent: _t("Recently opened"),
            close: _t("Close"),
            empty: _t("No app matches your search."),
        };
        let wasOpen = false;
        onPatched(() => {
            const open = this.shell.state.launcherOpen;
            if (open && !wasOpen) {
                this.state.query = "";
                this.state.index = 0;
                this.input()?.focus();
            }
            wasOpen = open;
        });
    }

    get apps() {
        const query = this.state.query.trim().toLowerCase();
        const apps = this.menuService.getApps();
        return query ? apps.filter((app) => app.name.toLowerCase().includes(query)) : apps;
    }

    get recents() {
        return this.state.query ? [] : this.shell.state.recents.slice(0, 6);
    }

    get currentApp() {
        return this.menuService.getCurrentApp();
    }

    href(app) {
        return `/odoo/${app.actionPath || "action-" + app.actionID}`;
    }

    open(app) {
        this.shell.closeLauncher();
        this.menuService.selectMenu(app);
    }

    onAppClick(ev, app) {
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey) {
            return;
        }
        ev.preventDefault();
        this.open(app);
    }

    onInput(ev) {
        this.state.query = ev.target.value;
        this.state.index = 0;
    }

    onKeydown(ev) {
        const count = this.apps.length;
        const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS };
        if (ev.key === "Escape") {
            ev.preventDefault();
            this.shell.closeLauncher();
        } else if (ev.key === "Enter" && count) {
            ev.preventDefault();
            this.open(this.apps[Math.min(this.state.index, count - 1)]);
        } else if (ev.key in moves && count) {
            // left/right stay in the search field while it has text to edit
            if ((ev.key === "ArrowLeft" || ev.key === "ArrowRight") && this.state.query) {
                return;
            }
            ev.preventDefault();
            const next = this.state.index + moves[ev.key];
            this.state.index = Math.max(0, Math.min(count - 1, next));
        }
    }

    onBackdropClick(ev) {
        if (ev.target === ev.currentTarget) {
            this.shell.closeLauncher();
        }
    }
}

registry.category("main_components").add("RexLauncher", { Component: RexLauncher });
