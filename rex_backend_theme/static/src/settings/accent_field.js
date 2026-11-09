import { Component, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { ACCENT_PRESETS, DEFAULT_ACCENT, HEX_RE, accentVariants, channelDistance } from "./theme_values";

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

    /** What the theme changes so the colour meets WCAG AA, if anything. */
    get adjustment() {
        const neutral = this.props.record.data.rx_neutral;
        const variants = accentVariants(this.value, neutral);
        // a shift of a few units is invisible; it is not worth a remark
        if (channelDistance(variants.primary, this.value) >= 8) {
            return {
                color: variants.primary,
                text: _t("Buttons use a slightly deeper shade so white text stays readable."),
            };
        }
        if (variants.primaryForeground !== "#ffffff") {
            return { color: variants.primary, text: _t("Buttons get dark text: white would be hard to read on this colour.") };
        }
        return null;
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
