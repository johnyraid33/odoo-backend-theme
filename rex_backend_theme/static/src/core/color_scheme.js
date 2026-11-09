import { Component, proxy } from "@odoo/owl";
import { getBundle } from "@web/core/assets";
import { browser } from "@web/core/browser/browser";
import { cookie } from "@web/core/browser/cookie";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { user } from "@web/core/user";

const SCHEMES = ["light", "dark", "system"];
// The light and dark styles are separate compiled bundles (Odoo picks one on
// the server from the color_scheme cookie). Switching swaps the stylesheets.
const STYLE_BUNDLES = [
    ["web.assets_web", "web.assets_web_dark"],
    ["web.assets_backend_lazy", "web.assets_backend_lazy_dark"],
];

function deviceScheme() {
    return browser.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveColorScheme(preference) {
    return preference === "system" ? deviceScheme() : preference;
}

export function getColorScheme() {
    return user.settings.rx_color_scheme || "light";
}

function findStylesheet(bundle) {
    const pattern = new RegExp(`/${bundle.replaceAll(".", "\\.")}(\\.min)?\\.css$`);
    return [...document.querySelectorAll("link[rel='stylesheet']")].find(
        (link) => link.media !== "print" && pattern.test(new URL(link.href).pathname)
    );
}

function loadStylesheet(after, href) {
    return new Promise((resolve, reject) => {
        const link = after.cloneNode();
        link.href = href;
        link.addEventListener("load", () => resolve(link), { once: true });
        link.addEventListener("error", () => reject(new Error(`Cannot load ${href}`)), { once: true });
        after.after(link);
    });
}

/**
 * Applies a resolved scheme ("light" or "dark") to the open page without a
 * reload: the new stylesheet is loaded next to the old one, then the old one
 * is removed, so the page never shows unstyled. Charts read the cookie when
 * their module loads and pick the new palette on the next page load.
 */
export async function applyColorScheme(scheme) {
    cookie.set("color_scheme", scheme);
    for (const [light, dark] of STYLE_BUNDLES) {
        const [from, to] = scheme === "dark" ? [light, dark] : [dark, light];
        const current = findStylesheet(from);
        if (!current) {
            continue;
        }
        const { cssLibs } = await getBundle(to);
        if (!cssLibs.length) {
            continue;
        }
        await loadStylesheet(current, cssLibs[0]);
        current.remove();
    }
    document.documentElement.dataset.rxColorScheme = scheme;
}

/** Saves the preference and applies it. */
export async function setColorScheme(preference) {
    if (!SCHEMES.includes(preference)) {
        throw new Error(`Unknown colour scheme: ${preference}`);
    }
    await user.setUserSettings("rx_color_scheme", preference);
    const scheme = resolveColorScheme(preference);
    if (scheme !== (cookie.get("color_scheme") || "light")) {
        await applyColorScheme(scheme);
    }
}

/** Follows the device setting in "system" mode while the web client is open. */
export const colorSchemeService = {
    start() {
        let leaving = false;
        browser.addEventListener("beforeunload", () => (leaving = true));
        browser.addEventListener("pagehide", () => (leaving = true));
        const query = browser.matchMedia?.("(prefers-color-scheme: dark)");
        query?.addEventListener("change", () => {
            if (leaving || getColorScheme() !== "system") {
                return;
            }
            const scheme = deviceScheme();
            if (scheme !== (cookie.get("color_scheme") || "light")) {
                applyColorScheme(scheme);
            }
        });
        document.documentElement.dataset.rxColorScheme = cookie.get("color_scheme") || "light";
    },
};
registry.category("services").add("rex_backend_theme.color_scheme", colorSchemeService);

/** Light / Dark / System segmented control in the user menu. */
export class ColorSchemeSwitcher extends Component {
    static template = "rex_backend_theme.ColorSchemeSwitcher";

    setup() {
        this.state = proxy({ current: getColorScheme(), busy: false });
        this.options = [
            { value: "light", icon: "light_mode", label: _t("Light") },
            { value: "dark", icon: "dark_mode", label: _t("Dark") },
            { value: "system", icon: "contrast", label: _t("System") },
        ];
    }

    async select(value, ev) {
        // keep the user menu open: the change is visible right away
        ev.stopPropagation();
        if (value === this.state.current || this.state.busy) {
            return;
        }
        this.state.busy = true;
        this.state.current = value;
        try {
            await setColorScheme(value);
        } finally {
            this.state.busy = false;
        }
    }
}

registry.category("user_menuitems").add("rex_color_scheme", () => ({
    type: "component",
    contentComponent: ColorSchemeSwitcher,
    sequence: 45,
}));
