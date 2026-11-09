import { Component, t, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { NEUTRALS, RADII } from "./theme_values";

const PREVIEWS = ["neutral", "radius", "density", "scheme", "sidebar"];

/**
 * A selection field shown as a row of cards, each with a small picture of
 * what the option does: the gray scale of a palette, a corner radius, the
 * row spacing of a density, a light or dark window, a sidebar layout.
 *
 *   <field name="rx_neutral" widget="rx_option_cards" options="{'preview': 'neutral'}"/>
 */
export class OptionCardsField extends Component {
    static template = "rex_backend_theme.OptionCardsField";
    props = useProps({
        ...standardFieldProps,
        preview: t.string().optional(""),
        label: t.string().optional(""),
    });

    get items() {
        return this.props.record.fields[this.props.name].selection;
    }

    get value() {
        return this.props.record.data[this.props.name];
    }

    neutralSteps(key) {
        const scale = NEUTRALS[key] || NEUTRALS.zinc;
        return [100, 300, 500, 700, 900].map((step) => scale[step]);
    }

    radiusOf(key) {
        // the lg step, doubled so the difference shows at this size
        return `${(RADII[key] || RADII.md)[2] * 1.5}px`;
    }

    tabIndex(key) {
        const keys = this.items.map(([k]) => k);
        return key === this.value || (!keys.includes(this.value) && key === keys[0]) ? 0 : -1;
    }

    select(key) {
        if (!this.props.readonly && key !== this.value) {
            this.props.record.update({ [this.props.name]: key });
        }
    }

    onKeydown(ev) {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
        if (!step) {
            return;
        }
        ev.preventDefault();
        const cards = [...ev.currentTarget.querySelectorAll(".rx-option-card")];
        const index = cards.indexOf(document.activeElement);
        const next = cards[(index + step + cards.length) % cards.length];
        next.focus();
        this.select(next.dataset.value);
    }
}

registry.category("fields").add("rx_option_cards", {
    component: OptionCardsField,
    displayName: _t("Option cards"),
    supportedTypes: ["selection"],
    supportedOptions: [
        {
            label: _t("Preview"),
            name: "preview",
            type: "selection",
            choices: PREVIEWS.map((value) => ({ label: value, value })),
        },
    ],
    extractProps: ({ options, string }, dynamicInfo) => ({
        preview: PREVIEWS.includes(options.preview) ? options.preview : "",
        label: string,
        readonly: dynamicInfo.readonly,
    }),
});
