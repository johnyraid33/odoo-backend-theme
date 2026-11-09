import { _t } from "@web/core/l10n/translation";

/**
 * The theme values as the settings widgets need them in the browser: preset
 * accents, the neutral scales and the radius steps. They mirror
 * static/src/scss/tokens.scss; the preview computes the tokens the same way
 * Sass does, so it shows what saving will compile.
 */

export const ACCENT_PRESETS = [
    { name: _t("Indigo"), color: "#6366f1" },
    { name: _t("Violet"), color: "#7c3aed" },
    { name: _t("Blue"), color: "#2563eb" },
    { name: _t("Sky"), color: "#0284c7" },
    { name: _t("Teal"), color: "#0d9488" },
    { name: _t("Emerald"), color: "#059669" },
    { name: _t("Amber"), color: "#d97706" },
    { name: _t("Orange"), color: "#ea580c" },
    { name: _t("Rose"), color: "#e11d48" },
    { name: _t("Pink"), color: "#db2777" },
    { name: _t("Graphite"), color: "#27272a" },
];

export const DEFAULT_ACCENT = "#6366f1";

export const NEUTRALS = {
    zinc: { 50: "#f9f9fb", 100: "#f2f2f4", 200: "#e4e4e9", 300: "#d2d2d9", 400: "#a6a6b0", 500: "#7f7d8b",
            600: "#5d5b68", 700: "#403f49", 800: "#27262e", 900: "#17161c", 950: "#0b0b0f" },
    slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b",
             600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a", 950: "#020617" },
    stone: { 50: "#fafaf9", 100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1", 400: "#a8a29e", 500: "#78716c",
             600: "#57534e", 700: "#44403c", 800: "#292524", 900: "#1c1917", 950: "#0c0a09" },
    neutral: { 50: "#fafafa", 100: "#f5f5f5", 200: "#e5e5e5", 300: "#d4d4d4", 400: "#a3a3a3", 500: "#737373",
               600: "#525252", 700: "#404040", 800: "#262626", 900: "#171717", 950: "#0a0a0a" },
};

// $rx-muted-light in tokens.scss
export const MUTED_LIGHT = { zinc: "#6e6d79", slate: "#617187", stone: "#766f6a", neutral: "#707070" };

// (sm, md, lg, xl) in px, as $rx-radii
export const RADII = {
    none: [0, 0, 0, 0],
    sm: [4, 5, 6, 8],
    md: [6, 8, 10, 14],
    lg: [8, 12, 16, 20],
};

export const HEX_RE = /^#[0-9a-f]{6}$/i;

// ------------------------------------------------------------------ colour maths

function toRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb) {
    return "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

/** Sass mix(): `weight` (0..1) of `a`, the rest of `b`. */
export function mix(a, b, weight) {
    const [ra, rb] = [toRgb(a), toRgb(b)];
    return toHex(ra.map((c, i) => c * weight + rb[i] * (1 - weight)));
}

function luminance(hex) {
    const channel = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const [r, g, b] = toRgb(hex).map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The largest channel difference of two colours, 0..255. */
export function channelDistance(a, b) {
    const [ra, rb] = [toRgb(a), toRgb(b)];
    return Math.max(...ra.map((c, i) => Math.abs(c - rb[i])));
}

/** WCAG contrast ratio of two colours, 1..21. */
export function contrast(a, b) {
    const [la, lb] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (la + 0.05) / (lb + 0.05);
}

const AA = 4.5;
const MAX_FILL_SHADE = 0.25;

/** Mixes `toward` into `color` until it reaches `target` on `against`: [colour, weight]. */
function shadeUntil(color, toward, against, target = AA) {
    let weight = 0;
    let result = color;
    while (contrast(result, against) < target && weight < 1) {
        weight = Math.round((weight + 0.01) * 100) / 100;
        result = mix(toward, color, weight);
    }
    return [result, weight];
}

/**
 * Accent variants meeting WCAG AA, as models/colors.py computes them when
 * the settings are saved: the button fill and its text, link colours.
 */
export function accentVariants(accent, neutral) {
    const n = NEUTRALS[neutral] || NEUTRALS.zinc;
    accent = HEX_RE.test(accent || "") ? accent.toLowerCase() : DEFAULT_ACCENT;
    let fill = accent;
    let onFill = "#ffffff";
    if (contrast("#ffffff", accent) < AA) {
        const [darker, weight] = shadeUntil(accent, "#000000", "#ffffff");
        if (weight <= MAX_FILL_SHADE || contrast(n[950], accent) < AA) {
            fill = darker;
        } else {
            onFill = n[950];
        }
    }
    return {
        primary: fill,
        primaryForeground: onFill,
        primaryText: shadeUntil(accent, "#000000", n[50])[0],
        primaryTextDark: shadeUntil(mix("#ffffff", accent, 0.35), "#ffffff", n[900])[0],
    };
}

/**
 * The tokens of one scheme as CSS custom properties, computed like
 * tokens.scss does.
 */
export function previewTokens({ accent, neutral, radius, dark }) {
    const n = NEUTRALS[neutral] || NEUTRALS.zinc;
    const r = RADII[radius] || RADII.md;
    accent = HEX_RE.test(accent || "") ? accent.toLowerCase() : DEFAULT_ACCENT;
    const v = accentVariants(accent, neutral);
    const background = dark ? n[900] : "#ffffff";
    return {
        "--pv-page": dark ? n[950] : n[100],
        "--pv-surface": dark ? mix(n[900], n[950], 0.45) : n[50],
        "--pv-background": background,
        "--pv-foreground": dark ? n[50] : n[950],
        "--pv-muted": dark ? n[400] : MUTED_LIGHT[neutral] || n[500],
        "--pv-border": dark ? mix(n[700], n[800], 0.3) : n[200],
        "--pv-hover": dark ? mix(n[800], n[900], 0.6) : n[100],
        "--pv-strong": dark ? n[50] : n[950],
        "--pv-strong-foreground": dark ? n[950] : "#ffffff",
        "--pv-primary": v.primary,
        "--pv-primary-foreground": v.primaryForeground,
        "--pv-primary-text": dark ? v.primaryTextDark : v.primaryText,
        "--pv-primary-subtle": mix(accent, background, dark ? 0.22 : 0.1),
        "--pv-ring": dark ? mix(v.primaryTextDark, background, 0.6) : mix("#ffffff", v.primaryText, 0.45),
        "--pv-radius": `${r[1]}px`,
        "--pv-radius-sm": `${r[0]}px`,
        "--pv-radius-panel": `${radius === "none" ? 0 : r[3]}px`,
    };
}

export function styleOf(vars) {
    return Object.entries(vars)
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ");
}
