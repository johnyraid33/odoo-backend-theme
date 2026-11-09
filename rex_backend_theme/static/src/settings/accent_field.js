import { Component, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { ACCENT_PRESETS, DEFAULT_ACCENT, HEX_RE, contrast } from "./theme_values";

/**
 * Accent colour: preset swatches, a custom colour and its hex value, with a
 * warning when the colour is too light to carry white text or to stand out
 * on a white background.
 */
export class AccentField extends Component {
    static template = "rex_backend_theme.AccentField";
    props = useProps({ ...standardFieldProps });

    presets = ACCENT_PRESETS;

    get value() {
        const value = this.props.record.data[this.props.name];
        return HEX_RE.test(value || "") ? value.toLowerCase() : DEFAULT_ACCENT;
    }

    get preset() {
        return this.presets.find((preset) => preset.color === this.value);
    }

    get valueName() {
        return this.preset?.name || _t("Custom");
    }

    get warning() {
        // 3:1 is the WCAG minimum for buttons, focus rings and large text
        if (contrast(this.value, "#ffffff") < 3) {
            return _t("This colour is light: buttons get dark text and links may be hard to read on white.");
        }
        if (contrast(this.value, "#17161c") < 3) {
            return _t("This colour is dark: it may be hard to see in the dark scheme.");
        }
        return "";
    }

    get labels() {
        return {
            group: _t("Accent colour"),
            custom: _t("Custom colour"),
            hex: _t("Hex value"),
        };
    }

    // one tab stop for the group: the checked swatch (the custom one when no preset is)
    tabIndex(preset) {
        return preset === this.preset ? 0 : -1;
    }

    select(color) {
        if (this.props.readonly || !HEX_RE.test(color)) {
            return;
        }
        this.props.record.update({ [this.props.name]: color.toLowerCase() });
    }

    onHexChange(ev) {
        let value = ev.target.value.trim();
        if (/^[0-9a-f]{6}$/i.test(value)) {
            value = "#" + value;
        }
        if (HEX_RE.test(value)) {
            this.select(value);
        } else {
            ev.target.value = this.value;
        }
    }

    /** Arrow keys move through the swatches, as in a radio group. */
    onKeydown(ev) {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
        if (!step) {
            return;
        }
        ev.preventDefault();
        const swatches = [...ev.currentTarget.querySelectorAll("button.rx-swatch, .rx-swatch-custom input")];
        const index = swatches.indexOf(document.activeElement);
        const next = swatches[(index + step + swatches.length) % swatches.length];
        next.focus();
        if (next.dataset.color) {
            this.select(next.dataset.color);
        }
    }
}

registry.category("fields").add("rx_accent", {
    component: AccentField,
    displayName: _t("Accent colour"),
    supportedTypes: ["char"],
    extractProps: (_, dynamicInfo) => ({ readonly: dynamicInfo.readonly }),
});
