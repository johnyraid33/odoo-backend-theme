import { beforeEach, describe, expect, test } from "@odoo/hoot";
import { queryOne } from "@odoo/hoot-dom";
import { animationFrame } from "@odoo/hoot-mock";
import {
    contains,
    defineActions,
    defineMenus,
    defineModels,
    fields,
    models,
    mountWithCleanup,
    onRpc,
} from "@web/../tests/web_test_helpers";
import { WebClient } from "@web/webclient/webclient";

class Partner extends models.Model {
    name = fields.Char();
    _records = [{ id: 1, name: "Azure Interior" }];
    _views = {
        list: `<list><field name="name"/></list>`,
        form: `<form><field name="name"/></form>`,
        search: `<search/>`,
    };
}

defineModels([Partner]);

describe.current.tags("mobile");

beforeEach(() => {
    onRpc("has_group", () => true);
    defineActions([
        { id: 11, name: "Quotations", res_model: "partner", views: [[false, "list"], [false, "form"]] },
        { id: 12, name: "Orders", res_model: "partner", views: [[false, "list"]] },
        { id: 13, name: "Settings", res_model: "partner", views: [[false, "list"]] },
        { id: 21, name: "Contacts", res_model: "partner", views: [[false, "list"]] },
    ]);
    defineMenus([
        {
            id: 1,
            name: "Sales",
            appID: 1,
            actionID: 11,
            xmlid: "sale.sale_menu_root",
            children: [
                {
                    id: 2,
                    name: "Orders",
                    appID: 1,
                    xmlid: "sale.sale_order_menu",
                    children: [
                        { id: 3, name: "Quotations", appID: 1, actionID: 11, xmlid: "sale.menu_sale_quotations" },
                        { id: 4, name: "Orders", appID: 1, actionID: 12, xmlid: "sale.menu_sale_order" },
                    ],
                },
                {
                    id: 5,
                    name: "Configuration",
                    appID: 1,
                    xmlid: "sale.menu_sale_config",
                    children: [{ id: 6, name: "Settings", appID: 1, actionID: 13, xmlid: "sale.menu_sale_general_settings" }],
                },
            ],
        },
        { id: 7, name: "Contacts", appID: 7, actionID: 21, xmlid: "contacts.menu_contacts" },
    ]);
});

test("on a phone the menu is a drawer opened from the top bar", async () => {
    await mountWithCleanup(WebClient);
    expect(".rx-sidebar").toHaveClass("rx-drawer");
    expect(".rx-sidebar").not.toHaveClass("rx-drawer-open");
    expect(".rx-sidebar").toHaveAttribute("aria-hidden", "true");

    await contains(".rx-topbar-toggle").click();
    expect(".rx-sidebar").toHaveClass("rx-drawer-open");
    expect(".rx-drawer-backdrop").toHaveCount(1);

    // the unit tests run without the theme's styles: the backdrop has no size
    queryOne(".rx-drawer-backdrop").click();
    await animationFrame();
    expect(".rx-sidebar").not.toHaveClass("rx-drawer-open");
});

test("choosing a menu in the drawer closes it", async () => {
    await mountWithCleanup(WebClient);
    await contains(".rx-topbar-toggle").click();
    await contains(".rx-app-switcher").click();
    await contains(".rx-apps-menu .o_app:contains(Sales)").click();
    await animationFrame();
    expect(".rx-sidebar").not.toHaveClass("rx-drawer-open");

    await contains(".rx-topbar-toggle").click();
    await contains(".rx-item:contains(Orders)").click();
    await animationFrame();
    expect(".rx-sidebar").not.toHaveClass("rx-drawer-open");
    expect(".o_breadcrumb").toHaveText("Orders");
});
