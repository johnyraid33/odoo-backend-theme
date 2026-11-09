import { patch } from "@web/core/utils/patch";
import { GraphRenderer } from "@web/views/graph/graph_renderer";

// Loaded with the lazy graph bundle (web.assets_backend_lazy).

function accent() {
    return getComputedStyle(document.documentElement).getPropertyValue("--rx-primary").trim();
}

function withAlpha(hex, alpha) {
    const value = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * A chart with a single series uses the theme accent; with several series
 * Odoo's categorical palette stays, the colours have to tell them apart.
 */
patch(GraphRenderer.prototype, {
    getBarChartData() {
        const data = super.getBarChartData(...arguments);
        const color = accent();
        if (color && this.model.data.datasets.length === 1) {
            const dataset = this.model.data.datasets[0];
            dataset.backgroundColor = color;
            dataset.hoverBackgroundColor = withAlpha(color, 0.85);
        }
        return data;
    },

    getLineChartData() {
        const data = super.getLineChartData(...arguments);
        const color = accent();
        if (color && this.model.data.datasets.length === 1) {
            const dataset = this.model.data.datasets[0];
            dataset.borderColor = color;
            dataset.pointBackgroundColor = color;
            dataset.hoverBackgroundColor = color;
            dataset.backgroundColor = withAlpha(color, 0.14);
        }
        return data;
    },
});
