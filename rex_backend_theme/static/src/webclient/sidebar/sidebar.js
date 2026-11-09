import { Component, proxy } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { user } from "@web/core/user";
import { useBus, useService } from "@web/core/utils/hooks";
import { NavBar } from "@web/webclient/navbar/navbar";

const COLLAPSED_KEY = "rex_backend_theme.sidebar.collapsed";

// Odoo menus carry no icon below the app level: pick one from the xmlid and
// name. Every name must exist in Odoo's Material Symbols subset (oi data-icon).
const ICONS = [
    [/dashboard|overview/, "grid_view"],
    [/report|analysis|analytic|statistic|forecast/, "bar_chart"],
    [/config|setting/, "settings"],
    [/pipeline|lead|opportunit/, "filter_alt"],
    [/quotation/, "description"],
    [/order/, "shopping_cart"],
    [/invoice|bill|move|journal|accounting|refund/, "receipt_long"],
    [/payment/, "payments"],
    [/product|catalog|variant|attribute/, "package_2"],
    [/customer|partner|contact|vendor|client/, "group"],
    [/employee|department|hr_/, "badge"],
    [/project/, "folder"],
    [/task|to-do|todo/, "checklist"],
    [/calendar|meeting|event/, "calendar_today"],
    [/activit/, "schedule"],
    [/team/, "handshake"],
    [/user|compan/, "business"],
    [/stock|inventory|warehouse|picking|deliver/, "local_shipping"],
    [/message|discuss|channel|mail/, "forum"],
    [/tag|stage|categor/, "sell"],
];

function iconFor(menu) {
    const key = `${menu.xmlid || ""} ${menu.name || ""}`.toLowerCase();
    const found = ICONS.find(([re]) => re.test(key));
    return found ? found[1] : "article";
}

function readCollapsed() {
    try {
        return JSON.parse(browser.localStorage.getItem(COLLAPSED_KEY) || "{}");
    } catch {
        return {};
    }
}

export class RexSidebar extends Component {
    static template = "rex_backend_theme.Sidebar";
    static components = { Dropdown, DropdownItem };

    setup() {
        this.menuService = useService("menu");
        this.actionService = useService("action");
        this.user = user;
        this.state = proxy({ activeId: null, collapsed: readCollapsed() });
        useBus(this.env.bus, "ACTION_MANAGER:UI-UPDATED", () => this.syncActive());
        useBus(this.env.bus, "MENUS:APP-CHANGED", () => this.syncActive());
    }

    get apps() {
        return this.menuService.getApps();
    }

    get currentApp() {
        return this.menuService.getCurrentApp();
    }

    get sections() {
        const app = this.currentApp;
        return (app && this.menuService.getMenuAsTree(app.id).childrenTree) || [];
    }

    get avatarUrl() {
        return `/web/image/res.users/${this.user.userId}/avatar_128`;
    }

    icon(menu) {
        return iconFor(menu);
    }

    href(menu) {
        return `/odoo/${menu.actionPath || "action-" + menu.actionID}`;
    }

    // The menu whose action opened the current breadcrumb root stays active
    // while the user drills into records or follows buttons.
    syncActive() {
        if (!this.currentApp) {
            return;
        }
        const leaves = [];
        const stack = [...this.sections];
        while (stack.length) {
            const menu = stack.shift();
            if (menu.childrenTree?.length) {
                stack.unshift(...menu.childrenTree);
            } else {
                leaves.push(menu);
            }
        }
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

    containsActive(menu) {
        if (menu.id === this.state.activeId) {
            return true;
        }
        return (menu.childrenTree || []).some((child) => this.containsActive(child));
    }

    isCollapsed(menu) {
        if (this.containsActive(menu)) {
            return false;
        }
        if (menu.id in this.state.collapsed) {
            return this.state.collapsed[menu.id];
        }
        return /config|setting/.test(`${menu.xmlid || ""} ${menu.name || ""}`.toLowerCase());
    }

    toggle(menu) {
        this.state.collapsed[menu.id] = !this.isCollapsed(menu);
        try {
            browser.localStorage.setItem(COLLAPSED_KEY, JSON.stringify(this.state.collapsed));
        } catch {
            // private mode: the state simply is not remembered
        }
    }

    onItemClick(ev, menu) {
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button === 1) {
            return;
        }
        ev.preventDefault();
        this.state.activeId = menu.id;
        this.menuService.selectMenu(menu);
    }

    openApp(app) {
        this.menuService.selectMenu(app);
    }
}

NavBar.components = { ...NavBar.components, RexSidebar };
