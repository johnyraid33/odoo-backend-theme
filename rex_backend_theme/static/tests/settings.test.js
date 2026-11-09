import { describe, expect, test } from "@odoo/hoot";
import { press } from "@odoo/hoot-dom";
import { animationFrame } from "@odoo/hoot-mock";
import { contains, defineModels, fields, models, mountView } from "@web/../tests/web_test_helpers";
import { accentVariants, contrast, previewTokens } from "@rex_backend_theme/settings/theme_values";

class Config extends models.Model {
    rx_accent_color = fields.Char();
    rx_neutral = fields.Selection({
        selection: [
            ["zinc", "Zinc"],
            ["slate", "Slate"],
            ["stone", "Stone"],
            ["neutral", "Gray"],
        ],
    });
    rx_radius = fields.Selection({
        selection: [
            ["none", "Square"],
            ["sm", "Small"],
            ["md", "Medium"],
            ["lg", "Large"],
        ],
    });
    rx_density = fields.Selection({
        selection: [
            ["comfortable", "Comfortable"],
            ["compact", "Compact"],
        ],
    });
    _records = [{ id: 1, rx_accent_color: "#6366f1", rx_neutral: "zinc", rx_radius: "md", rx_density: "comfortable" }];
    _views = {
        form: `
            <form>
                <widget name="rx_theme_preview"/>
                <field name="rx_accent_color" widget="rx_accent"/>
                <field name="rx_neutral" widget="rx_option_cards" options="{'preview': 'neutral'}"/>
                <field name="rx_radius" widget="rx_option_cards" options="{'preview': 'radius'}"/>
                <field name="rx_density" widget="rx_option_cards" options="{'preview': 'density'}"/>
            </form>`,
    };
}

defineModels([Config]);

describe.current.tags("desktop");

// models/colors.py gives the same values (tests/test_backend_theme.py)
test("accent variants match the server derivation", () => {
    expect(accentVariants("#6366f1", "zinc")).toEqual({
        primary: "#6265ef",
        primaryForeground: "#ffffff",
        primaryText: "#5f62e7",
        primaryTextDark: "#9a9cf6",
    });
    expect(accentVariants("#d97706", "zinc").primary).toBe("#b26205");
    expect(accentVariants("#2563eb", "zinc").primary).toBe("#2563eb");
});

test("every preview token pair meets AA for a light accent", () => {
    for (const dark of [false, true]) {
        const t = previewTokens({ accent: "#ffff00", neutral: "slate", radius: "md", dark });
        expect(contrast(t["--pv-primary"], t["--pv-primary-foreground"])).toBeGreaterThan(4.49);
        expect(contrast(t["--pv-primary-text"], t["--pv-background"])).toBeGreaterThan(4.49);
    }
});

test("a swatch sets the accent and the preview follows", async () => {
    await mountView({ type: "form", resModel: "config", resId: 1 });
    expect(".rx-swatch.rx-checked").toHaveAttribute("data-color", "#6366f1");
    expect(".rx-accent-hex").toHaveValue("#6366f1");

    await contains(".rx-swatch[data-color='#2563eb']").click();
    expect(".rx-swatch.rx-checked").toHaveAttribute("data-color", "#2563eb");
    expect(".rx-accent-hex").toHaveValue("#2563eb");
    expect(".rx-pv-light").toHaveAttribute("style", /--pv-primary: #2563eb/);
    expect(".rx-accent-note").toHaveCount(0);
});

test("the default accent needs no remark", async () => {
    await mountView({ type: "form", resModel: "config", resId: 1 });
    expect(".rx-accent-note").toHaveCount(0);
});

test("a colour that needs a deeper shade says so", async () => {
    await mountView({ type: "form", resModel: "config", resId: 1 });
    await contains(".rx-swatch[data-color='#d97706']").click();
    expect(".rx-accent-note").toHaveCount(1);
    expect(".rx-accent-note .rx-accent-dot").toHaveAttribute("style", /--swatch: #b26205/);
});

test("a typed hex value is accepted, a wrong one is reverted", async () => {
    await mountView({ type: "form", resModel: "config", resId: 1 });
    await contains(".rx-accent-hex").edit("0d9488");
    expect(".rx-accent-hex").toHaveValue("#0d9488");
    expect(".rx-swatch.rx-checked").toHaveAttribute("data-color", "#0d9488");

    await contains(".rx-accent-hex").edit("teal");
    expect(".rx-accent-hex").toHaveValue("#0d9488");
});

test("arrow keys move the accent through the swatches", async () => {
    await mountView({ type: "form", resModel: "config", resId: 1 });
    await contains(".rx-swatch.rx-checked").focus();
    await press("ArrowRight");
    await animationFrame();
    expect(".rx-swatch.rx-checked").toHaveAttribute("data-color", "#7c3aed");
    expect(".rx-swatch.rx-checked").toBeFocused();
});

test("option cards select a value and mark it", async () => {
    await mountView({ type: "form", resModel: "config", resId: 1 });
    expect("[name=rx_density] .rx-option-card[aria-checked=true]").toHaveText("Comfortable");

    await contains("[name=rx_density] .rx-option-card[data-value=compact]").click();
    expect("[name=rx_density] .rx-option-card[aria-checked=true]").toHaveText("Compact");
    expect(".rx-preview").toHaveAttribute("data-density", "compact");

    await contains("[name=rx_neutral] .rx-option-card[aria-checked=true]").focus();
    await press("ArrowRight");
    await animationFrame();
    expect("[name=rx_neutral] .rx-option-card[aria-checked=true]").toHaveText("Slate");
});
