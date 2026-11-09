import { Component, proxy } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";
import { isMacOS } from "@web/core/browser/feature_detection";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { _t } from "@web/core/l10n/translation";
import { SIZES } from "@web/core/ui/ui_utils";
import { user } from "@web/core/user";
import { useBus, useService } from "@web/core/utils/hooks";
import { session } from "@web/session";
import { WebClient } from "@web/webclient/webclient";
import { iconFor } from "../icons";

const COLLAPSED_KEY = "rex_backend_theme.sidebar.collapsed";

function readCollapsed() {
    try {
        return JSON.parse(browser.localStorage.getItem(COLLAPSED_KEY) || "{}");
    } catch {
        return {};
    }
}

/**
 * The application sidebar: app switcher, pinned menus, the current app's menu
 * tree and the user. Three presentations of one component:
 * - expanded (lg and up, default),
 * - rail, icons only with tooltips (user choice, and always on tablets),
 * - drawer, off-canvas on phones, opened from the top bar.
 */
export class RexSidebar extends Component {
    static template = "rex_backend_theme.Sidebar";
    static components = { Dropdown, DropdownItem };

    setup() {
        this.menuService = useService("menu");
        this.actionService = useService("action");
        this.ui = proxy(useService("ui"));
        this.shell = useService("rex_shell");
        this.user = user;
        this.state = proxy({ activeId: null, collapsed: readCollapsed(), appQuery: "" });
        useBus(this.env.bus, "ACTION_MANAGER:UI-UPDATED", () => this.syncActive());
        useBus(this.env.bus, "MENUS:APP-CHANGED", () => this.syncActive());
    }

    // ------------------------------------------------------------ presentation

    get isDrawer() {
        return this.ui.isSmall;
    }

    get isRail() {
        return !this.isDrawer && (this.shell.state.mode === "rail" || this.ui.size < SIZES.LG);
    }

    get rootClass() {
        return {
            "rx-rail": this.isRail,
            "rx-drawer": this.isDrawer,
            "rx-drawer-open": this.isDrawer && this.shell.state.drawerOpen,
        };
    }

    tooltip(label) {
        return this.isRail ? label : false;
    }

    // ------------------------------------------------------------ data

    get apps() {
        return this.menuService.getApps();
    }

    get filteredApps() {
        const query = this.state.appQuery.trim().toLowerCase();
        return query ? this.apps.filter((app) => app.name.toLowerCase().includes(query)) : this.apps;
    }

    get currentApp() {
        return this.menuService.getCurrentApp();
    }

    get sections() {
        const app = this.currentApp;
        return (app && this.menuService.getMenuAsTree(app.id).childrenTree) || [];
    }

    get pinnedMenus() {
        return this.shell.state.pins
            .map((id) => this.menuService.getMenu(id))
            .filter((menu) => menu && (menu.actionID || menu.actionPath));
    }

    /** The current company's logo, when the settings ask for it and it has one. */
    get companyLogo() {
        const theme = session.rex_backend_theme;
        const company = this.user.activeCompany;
        if (!theme?.sidebar_logo || !company || !theme.logo_company_ids.includes(company.id)) {
            return null;
        }
        return { url: `/web/image/res.company/${company.id}/logo`, name: company.name };
    }

    get avatarUrl() {
        return `/web/image/res.users/${this.user.userId}/avatar_128`;
    }

    get labels() {
        return {
            pin: _t("Pin to the top"),
            unpin: _t("Unpin"),
            pinned: _t("Pinned"),
            allApps: _t("All apps"),
            searchApps: _t("Search apps…"),
            close: _t("Close menu"),
            // Odoo's "alt" hotkeys are Ctrl on macOS
            launcherKey: isMacOS() ? "Ctrl H" : "Alt H",
        };
    }

    icon(menu) {
        return iconFor(menu);
    }

    appOf(menu) {
        return this.apps.find((app) => app.id === menu.appID);
    }

    href(menu) {
        return `/odoo/${menu.actionPath || "action-" + menu.actionID}`;
    }

    // ------------------------------------------------------------ active item

    // The menu whose action opened the current breadcrumb root stays active
    // while the user drills into records or follows buttons.
    syncActive() {
        if (!this.currentApp) {
            return;
        }
        const leaves = this.leaves(this.sections);
        const actionId = this.actionService.currentController?.action?.id;
        const match = actionId && leaves.find((menu) => menu.actionID === actionId);
        if (match) {
            this.state.activeId = match.id;
        } else if (!leaves.some((menu) => menu.id === this.state.activeId)) {
            // The app opened on its default action, which can be a server
            // action that no menu points to: its first entry is the landing page.
            this.state.activeId = leaves[0]?.id ?? null;
        }
    }

    leaves(menus) {
        const result = [];
        const stack = [...menus];
        while (stack.length) {
            const menu = stack.shift();
            if (menu.childrenTree?.length) {
                stack.unshift(...menu.childrenTree);
            } else {
                result.push(menu);
            }
        }
        return result;
    }

    containsActive(menu) {
        if (menu.id === this.state.activeId) {
            return true;
        }
        return (menu.childrenTree || []).some((child) => this.containsActive(child));
    }

    // ------------------------------------------------------------ groups

    isCollapsed(menu) {
        if (this.containsActive(menu)) {
            return false;
        }
        if (menu.id in this.state.collapsed) {
            return this.state.collapsed[menu.id];
        }
        return /config|setting/.test(`${menu.xmlid || ""} ${menu.name || ""}`.toLowerCase());
    }

    toggleGroup(menu) {
        this.state.collapsed[menu.id] = !this.isCollapsed(menu);
        try {
            browser.localStorage.setItem(COLLAPSED_KEY, JSON.stringify(this.state.collapsed));
        } catch {
            // private mode: the state simply is not remembered
        }
    }

    // ------------------------------------------------------------ actions

    onItemClick(ev, menu) {
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button === 1) {
            return;
        }
        ev.preventDefault();
        if (menu.appID === this.currentApp?.id) {
            this.state.activeId = menu.id;
        }
        this.shell.closeDrawer();
        this.menuService.selectMenu(menu);
    }

    openApp(app) {
        this.state.appQuery = "";
        this.shell.closeDrawer();
        this.menuService.selectMenu(app);
    }

    onAppSearchKeydown(ev) {
        if (ev.key === "Enter" && this.filteredApps.length) {
            ev.preventDefault();
            this.openApp(this.filteredApps[0]);
        }
    }

    togglePin(ev, menu) {
        ev.preventDefault();
        ev.stopPropagation();
        this.shell.togglePin(menu.id);
    }

    openLauncher() {
        this.state.appQuery = "";
        this.shell.openLauncher();
    }

    /** Arrow keys move through the visible items, Home/End jump to the ends. */
    onNavKeydown(ev) {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(ev.key)) {
            return;
        }
        const items = [...ev.currentTarget.querySelectorAll(".rx-item, .rx-group-label")].filter(
            (el) => el.offsetParent !== null
        );
        if (!items.length) {
            return;
        }
        ev.preventDefault();
        const index = items.indexOf(document.activeElement);
        let next;
        if (ev.key === "Home") {
            next = 0;
        } else if (ev.key === "End") {
            next = items.length - 1;
        } else {
            const step = ev.key === "ArrowDown" ? 1 : -1;
            next = index < 0 ? 0 : (index + step + items.length) % items.length;
        }
        items[next].focus();
    }
}

WebClient.components = { ...WebClient.components, RexSidebar };
