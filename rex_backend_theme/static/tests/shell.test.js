import { beforeEach, describe, expect, test } from "@odoo/hoot";
import { press, queryAll, queryAllTexts } from "@odoo/hoot-dom";
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

describe.current.tags("desktop");

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

function onSettingsSaved() {
    onRpc("set_res_users_settings", ({ kwargs }) => {
        expect.step(kwargs.new_settings);
        return kwargs.new_settings;
    });
}

test("the sidebar shows the current app's menu as groups", async () => {
    await mountWithCleanup(WebClient);
    await contains(".rx-app-switcher").click();
    await contains(".rx-apps-menu .o_app:contains(Sales)").click();
    await animationFrame();

    expect(".rx-sidebar").toHaveCount(1);
    expect(".rx-app-switcher .rx-app-name").toHaveText("Sales");
    expect(queryAllTexts(".rx-group-label > span.rx-label")).toEqual(["Orders", "Configuration"]);
    // configuration groups start folded
    expect(".rx-group.rx-collapsed .rx-group-label:contains(Configuration)").toHaveCount(1);
    // the app opened on its first entry, which is marked as the current page
    expect(".rx-item[aria-current=page]").toHaveText("Quotations");
    // the "Orders" group and its "Orders" entry would both be a cart: each gets its own
    const icons = queryAll(".rx-nav .rx-group-icon, .rx-nav .rx-item-icon").map((el) => el.dataset.icon);
    expect(icons.length).toBeGreaterThan(3);
    expect(new Set(icons).size).toBe(icons.length);
});

test("clicking an item opens its action and becomes the active item", async () => {
    await mountWithCleanup(WebClient);
    await contains(".rx-app-switcher").click();
    await contains(".rx-apps-menu .o_app:contains(Sales)").click();
    await contains(".rx-item:contains(Orders)").click();
    await animationFrame();

    expect(".o_breadcrumb").toHaveText("Orders");
    expect(".rx-item.active").toHaveText("Orders");
});

test("a group folds and unfolds", async () => {
    await mountWithCleanup(WebClient);
    await contains(".rx-app-switcher").click();
    await contains(".rx-apps-menu .o_app:contains(Sales)").click();

    await contains(".rx-group-label:contains(Configuration)").click();
    await animationFrame();
    expect(".rx-item:contains(Settings)").toHaveCount(1);
    await contains(".rx-group-label:contains(Configuration)").click();
    await animationFrame();
    expect(".rx-item:contains(Settings)").toHaveCount(0);
});

test("pinning a menu lists it on top and saves it per user", async () => {
    onSettingsSaved();
    await mountWithCleanup(WebClient);
    await contains(".rx-app-switcher").click();
    await contains(".rx-apps-menu .o_app:contains(Sales)").click();

    expect(".rx-pinned").toHaveCount(0);
    const orders = queryAll(".rx-row").find((row) => row.textContent.includes("Orders"));
    await contains(orders.querySelector(".rx-pin")).click();
    await animationFrame();
    expect(".rx-pinned .rx-item").toHaveText("Orders");
    expect.verifySteps([{ rx_sidebar_pins: "4" }]);
});

test("control+b switches the sidebar to icons only and back", async () => {
    onSettingsSaved();
    await mountWithCleanup(WebClient);
    expect(".rx-sidebar").not.toHaveClass("rx-rail");

    await press(["control", "b"]);
    await animationFrame();
    expect(".rx-sidebar").toHaveClass("rx-rail");

    await press(["control", "b"]);
    await animationFrame();
    expect(".rx-sidebar").not.toHaveClass("rx-rail");
    expect.verifySteps([{ rx_sidebar_mode: "rail" }, { rx_sidebar_mode: "expanded" }]);
});

test("the launcher filters apps, opens one with Enter and closes with Escape", async () => {
    await mountWithCleanup(WebClient);

    await press(["alt", "h"]);
    await animationFrame();
    expect(".rx-launcher").toHaveCount(1);
    expect(queryAllTexts(".rx-launcher-app")).toEqual(["Sales", "Contacts"]);

    await contains(".rx-launcher-search input").edit("cont", { confirm: false });
    expect(queryAllTexts(".rx-launcher-app")).toEqual(["Contacts"]);

    await contains(".rx-launcher-search input").press("Enter");
    await animationFrame();
    expect(".rx-launcher").toHaveCount(0);
    expect(".rx-app-switcher .rx-app-name").toHaveText("Contacts");

    await press(["alt", "h"]);
    await animationFrame();
    await contains(".rx-launcher-search input").press("Escape");
    await animationFrame();
    expect(".rx-launcher").toHaveCount(0);
});

test("the launcher opens while the search field has the focus", async () => {
    await mountWithCleanup(WebClient);
    await contains(".rx-app-switcher").click();
    await contains(".rx-apps-menu .o_app:contains(Sales)").click();
    await contains(".o_searchview_input").click();
    expect(".o_searchview_input").toBeFocused();

    await press(["alt", "h"]);
    await animationFrame();
    expect(".rx-launcher").toHaveCount(1);
});

test("the stock navbar anchors stay in the DOM for tours and modules", async () => {
    await mountWithCleanup(WebClient);
    expect(".o_main_navbar").toHaveCount(1);
    expect(".o_menu_systray").toHaveCount(1);
    expect(".rx-sidebar .o_navbar_apps_menu .o_app, .rx-sidebar .o_navbar_apps_menu button").not.toHaveCount(0);
    // group labels must not answer to the selector tours use for menu sections
    expect(".rx-group-label[data-menu-xmlid]").toHaveCount(0);
});
