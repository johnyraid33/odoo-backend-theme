import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

/**
 * Opens an internal /odoo URL the way Odoo opens links: the router's global
 * click listener turns the click into a client-side navigation.
 */
export function openInternalUrl(url) {
    const link = Object.assign(document.createElement("a"), { href: url });
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
}

// "Recently opened" comes first in the default palette (ctrl+K); the palette
// builds its groups from this registry, ordered by sequence.
registry.category("command_categories").add("rex_recent", { name: _t("Recently opened") }, { sequence: 1 });

registry.category("command_provider").add(
    "rex_recent",
    {
        provide() {
            const shell = useService("rex_shell");
            return shell.state.recents.slice(0, 5).map((recent) => ({
                category: "rex_recent",
                name: recent.name,
                action: () => openInternalUrl(recent.url),
            }));
        },
    },
    { sequence: 1 }
);
