import { describe, expect, test } from "@odoo/hoot";
import { ICON_NAMES, assignIcons, iconFor } from "@rex_backend_theme/webclient/icons";

describe.current.tags("desktop");

const menu = (id, xmlid, name, childrenTree = []) => ({ id, xmlid, name, childrenTree });

test("entries that would share an icon get distinct ones", () => {
    const menus = [
        menu(1, "sale.menu_product_template_action", "Products"),
        menu(2, "x.menu_product_variant", "Product Variants"),
        menu(3, "x.menu_report_a", "Sales Analysis"),
        menu(4, "x.menu_report_b", "Margin Analysis"),
    ];
    const icons = assignIcons(menus);
    expect(icons.get(1)).toBe("package_2");
    expect(icons.get(3)).toBe("bar_chart");
    expect(new Set(icons.values()).size).toBe(4);
    // the second one keeps a related meaning
    expect(["inventory_2", "deployed_code", "widgets"]).toInclude(icons.get(2));
    expect(["pie_chart", "area_chart", "show_chart"]).toInclude(icons.get(4));
});

test("a large menu still gets one icon per entry", () => {
    const menus = Array.from({ length: 80 }, (_, i) => menu(i + 1, `x.menu_config_${i}`, `Settings ${i}`));
    const icons = assignIcons(menus);
    expect(new Set(icons.values()).size).toBe(80);
});

test("sub-headers can be skipped and a menu shown twice keeps its icon", () => {
    const orders = menu(3, "sale.menu_sale_order", "Orders");
    const tree = [menu(1, "sale.sale_order_menu", "Orders", [menu(2, "x.sub", "Sub", [orders])])];
    const icons = assignIcons([...tree, orders], (m, depth) => depth === 0 || !m.childrenTree.length);
    expect(icons.has(2)).toBe(false);
    expect(icons.get(1)).not.toBe(icons.get(3));
    expect(icons.size).toBe(2);
});

test("specific words win over broad ones", () => {
    expect(iconFor(menu(1, "crm.menu_crm_lead_categ", "Tags"))).toBe("label");
    expect(iconFor(menu(2, "project.menu_project_config_project_stage", "Project Stages"))).toBe("view_kanban");
    expect(iconFor(menu(3, "purchase.menu_product_attribute_action", "Attributes"))).toBe("tune");
    expect(iconFor(menu(4, "stock.menu_stock_general_settings", "Settings"))).toBe("settings");
    expect(ICON_NAMES).toInclude("article");
});
