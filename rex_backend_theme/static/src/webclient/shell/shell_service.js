import { reactive } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";
import { registry } from "@web/core/registry";
import { user } from "@web/core/user";

const RECENTS_MAX = 8;

function recentsKey() {
    return `rex_backend_theme.recents.${user.userId}`;
}

function readRecents() {
    try {
        return JSON.parse(browser.localStorage.getItem(recentsKey()) || "[]");
    } catch {
        return [];
    }
}

function parsePins(value) {
    return (value || "")
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter(Boolean);
}

/**
 * State of the application shell, shared by the sidebar, the top bar and the
 * app launcher: sidebar mode (saved per user), mobile drawer, launcher,
 * pinned menus (saved per user) and recently opened records (per browser).
 */
export const shellService = {
    dependencies: ["action", "hotkey"],

    start(env, { action, hotkey }) {
        const state = reactive({
            mode: user.settings.rx_sidebar_mode === "rail" ? "rail" : "expanded",
            drawerOpen: false,
            launcherOpen: false,
            pins: parsePins(user.settings.rx_sidebar_pins),
            recents: readRecents(),
        });

        function save(key, value) {
            user.setUserSettings(key, value).catch(() => {
                // offline or a stale session: the choice stays for this page
            });
        }

        const shell = {
            state,
            toggleRail() {
                state.mode = state.mode === "rail" ? "expanded" : "rail";
                save("rx_sidebar_mode", state.mode);
            },
            openDrawer() {
                state.drawerOpen = true;
            },
            closeDrawer() {
                state.drawerOpen = false;
            },
            openLauncher() {
                state.drawerOpen = false;
                state.launcherOpen = true;
            },
            closeLauncher() {
                state.launcherOpen = false;
            },
            isPinned(menuId) {
                return state.pins.includes(menuId);
            },
            togglePin(menuId) {
                state.pins = shell.isPinned(menuId)
                    ? state.pins.filter((id) => id !== menuId)
                    : [...state.pins, menuId];
                save("rx_sidebar_pins", state.pins.join(","));
            },
        };

        // Recently opened records, from the controller shown after each action.
        env.bus.addEventListener("ACTION_MANAGER:UI-UPDATED", () => {
            const controller = action.currentController;
            const props = controller?.props;
            if (controller?.view?.type !== "form" || !props?.resId || !props.resModel) {
                return;
            }
            const entry = {
                key: `${props.resModel},${props.resId}`,
                name: controller.displayName || "",
                model: props.resModel,
                url: browser.location.pathname,
            };
            if (!entry.name) {
                return;
            }
            state.recents = [entry, ...state.recents.filter((r) => r.key !== entry.key)].slice(
                0,
                RECENTS_MAX
            );
            try {
                browser.localStorage.setItem(recentsKey(), JSON.stringify(state.recents));
            } catch {
                // storage full or disabled: recents simply are not remembered
            }
        });

        // control+b is command+b on macOS; ignored while typing in a field
        // (it is bold in HTML fields).
        hotkey.add("control+b", () => shell.toggleRail());
        // The launcher also opens from a field: Odoo focuses the search box
        // of every view it opens, as for the command palette (control+k).
        hotkey.add("alt+h", () => (state.launcherOpen ? shell.closeLauncher() : shell.openLauncher()), {
            global: true,
            bypassEditableProtection: true,
        });

        return shell;
    },
};

registry.category("services").add("rex_shell", shellService);
