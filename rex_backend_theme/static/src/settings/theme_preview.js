import { Component } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardWidgetProps } from "@web/views/widgets/standard_widget_props";
import { previewTokens, styleOf } from "./theme_values";

/**
 * A miniature of the backend in the light and dark schemes, drawn from the
 * values being edited in the settings form (accent, palette, radius,
 * density), so the choice can be judged before saving recompiles the styles.
 */
export class ThemePreview extends Component {
    static template = "rex_backend_theme.ThemePreview";
    static props = { ...standardWidgetProps };

    get data() {
        return this.props.record.data;
    }

    get density() {
        return this.data.rx_density || "comfortable";
    }

    schemes() {
        const values = {
            accent: this.data.rx_accent_color,
            neutral: this.data.rx_neutral,
            radius: this.data.rx_radius,
        };
        return [
            { key: "light", label: _t("Light"), style: styleOf(previewTokens({ ...values, dark: false })) },
            { key: "dark", label: _t("Dark"), style: styleOf(previewTokens({ ...values, dark: true })) },
        ];
    }

    get text() {
        return {
            app: _t("Sales"),
            menu: [_t("Quotations"), _t("Orders"), _t("Customers"), _t("Products")],
            title: _t("Quotations"),
            new: _t("New"),
            search: _t("Search…"),
            rows: [
                { ref: "S00042", name: "Gemini Furniture", status: _t("Sent"), amount: "1,740.00" },
                { ref: "S00041", name: "Deco Addict", status: _t("Draft"), amount: "960.50" },
                { ref: "S00040", name: "Azure Interior", status: _t("Sent"), amount: "2,315.00" },
            ],
        };
    }
}

registry.category("view_widgets").add("rx_theme_preview", {
    component: ThemePreview,
    fieldDependencies: [
        { name: "rx_accent_color", type: "char" },
        { name: "rx_neutral", type: "selection" },
        { name: "rx_radius", type: "selection" },
        { name: "rx_density", type: "selection" },
    ],
});
