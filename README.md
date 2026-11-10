# Rex Backend Theme

A calm, modern backend for Odoo Community 20.0 and 19.0, on the shadcn/ui token
model: a left sidebar with the current app's menu and pinned entries, an app
launcher, a page header, the action in one rounded panel, light, dark and
system schemes, and an accent colour, palette, corner radius and density you
choose. Geist font and icons ship with the module; nothing is loaded from
outside servers.

| Branch | Odoo | Module version |
| --- | --- | --- |
| `main` | development (Odoo 20) | `20.0.x` |
| `20.0` | Odoo 20.0 | `20.0.x` |
| `19.0` | Odoo 19.0 (Owl 2) | `19.0.x` |

Licence: LGPL-3 (`LICENSE`). Geist under the SIL Open Font License,
Material Symbols (19.0 branch) under Apache-2.0. User documentation:
[`rex_backend_theme/doc/index.rst`](rex_backend_theme/doc/index.rst).
Support: info@rex.cy or the issue tracker.

## Install

```bash
git clone -b 19.0 https://github.com/johnyraid33/odoo-backend-theme.git
odoo -d DATABASE --addons-path=odoo-backend-theme,ODOO/addons -i rex_backend_theme
```

Then **Settings > General Settings > Backend Theme** for the company look and
**My Preferences > Appearance** for each user.

## Odoo 19 (this branch)

The same theme as the `main` branch (Odoo 20), ported:

- Owl 2: `useState`/`reactive` instead of `proxy`, `useRef` instead of
  `signal.ref`, `static props` instead of `useProps`. Components read the
  shell state through `useState(shell.state)`, and the sidebar renders again
  on `MENUS:APP-CHANGED` like Odoo's NavBar (the menu service is not
  reactive). `t-call` takes its variables from `t-set` in its body.
  Inside a `t-foreach`, `this` is the rendering context: state that depends
  on the component (checked swatch) is computed in JS.
- Icons: Odoo 19 has Font Awesome and its own UI icons, not Material
  Symbols. The module ships the same Material Symbols subset as Odoo 20
  (`static/src/fonts`, Apache 2.0) with the `.rx-icon` class
  (`scss/icons.scss`), so the templates and the icon map stay shared.
- Python: `get_param` instead of `get_str`/`get_bool`,
  `SELF_READABLE_FIELDS`/`SELF_WRITEABLE_FIELDS` instead of
  `user_writeable`, `registry.clear_cache('assets')`.
- Templates: the web client head is `head_web`; the login page gets the
  `o_web_login` body class Odoo 20 has natively.
- Stand: `ODOO_VERSION=19.0 ODOO_PORT=8190 docker compose -p rex-backend-theme-dev19 up -d`
  in `dev/`, databases `theme19` and `theme19base`; `dev/run_tests.sh` and
  the `rex-odoo-test:19.0` image target it.

## Shell

The web client is a two-column grid: the sidebar next to Odoo's own
`.o_navbar` (the top bar) and `.o_action_manager`, which stay direct children
of `body`, so Odoo's layout rules and other modules' selectors keep working.

- **Sidebar**: app switcher with search, pinned menus (any app, saved per
  user), the current app's menu with collapsible groups, keyboard navigation,
  the user. Expanded or icon rail (top bar button or Cmd/Ctrl+B, saved per
  user); always a rail on tablets; an off-canvas drawer on phones.
- **Top bar**: sidebar toggle, "Search or jump to" opening Odoo's command
  palette (recently opened records listed first), the systray. Odoo's apps
  menu and sections stay in the DOM, hidden from md up.
- **Launcher**: full-screen searchable app grid with recent records
  (Alt+H, Ctrl+H on macOS, or "All apps" in the switcher).

## Page header

From lg up Odoo's control panel is re-arranged by a CSS grid into a page
header, without changing its DOM (modules extend it with xpaths, tours click
it): title row (parent breadcrumbs, title, actions menu, save indicator,
primary buttons on the right), then a toolbar row (view tabs with labels when
the header is wide enough, search, pager). Forms show the smart buttons in
the toolbar row. Phones keep Odoo's own control panel.

## Views

- **Form**: quieter labels, neutral smart buttons, tabular figures. Odoo's
  XXL breakpoint (chatter beside the form) moves from 1400px to 1650px of
  window, the width the sidebar takes (`webclient/shell/breakpoints.js`).
- **List / kanban**: cards on the panel, tabular figures, row hover and
  selection in the theme colours.
- **Calendar**: grid in a card, compact day headers, today and the now line
  in the accent, events as a light tint of their colour with a solid bar.
- **Pivot / graph**: in cards; a single-series chart uses the accent
  (`views/graph`, loaded with the lazy graph bundle).
- **Activity**: soft tints with a coloured edge instead of solid cells.
- **Login** (`/web/login` without website): scoped to `body.o_web_login`, in
  the frontend bundle with the token variables only.

## Compatibility with tours and other modules

The sidebar's app switcher carries Odoo's `o_navbar_apps_menu` / `o_app`
classes, so tours and modules that open an app through the apps menu work
unchanged. While a tour runs, the stock section menus and brand are shown in
the top bar again and the top bar search makes room for them
(`webclient/shell/tour_compat.js`). Run the tours of the
installed apps with `dev/run_tests.sh` (needs the `dev/Dockerfile.test`
image, which adds a headless Chromium).

Website, portal and PDF reports are not affected. The JS on `main` and
`20.0` targets Owl 3 (Odoo 20); the `19.0` branch is the Owl 2 port.

## Stand

```bash
cd dev
docker compose up -d                 # Odoo 20 on http://127.0.0.1:8180, admin/admin
python3 shots.py http://127.0.0.1:8180 theme20 shots/after        # with the theme
python3 shots.py http://127.0.0.1:8180 theme20base shots/before   # same data, no theme
python3 compare.py                    # side-by-side images in shots/compare (needs Pillow)
```

## Theme values and colour schemes

- **Settings > General Settings > Backend Theme** (administrators): a preview
  of the backend in light and dark that follows the edits before saving;
  accent colour (eleven presets, a custom colour or a hex value, with a
  contrast warning), neutral palette (zinc, slate, stone, gray), corner
  radius, default density and the company logo in the sidebar.
- Compiled values (accent, palette, radius): saving stores a copy of
  `user_variables.scss` as an attachment and replaces the file in the backend
  bundles through an `ir.asset` "replace" record (the website builder's
  mechanism), so Odoo recompiles once and every derived colour is exact.
  Back to the defaults, the customisation is removed; the uninstall hook
  removes it too, otherwise the bundles would point at a missing module.
- Runtime values (density, sidebar logo) are configuration parameters sent
  in `session_info` (`rex_backend_theme`); no recompilation. Density is the
  `data-rx-density` attribute on `<html>`, set by the head script before
  the first paint; compact tightens lists, the page header, forms, kanban
  cards and the sidebar (`static/src/core/density.scss`).
- **My Preferences > Appearance** (every internal user): colour scheme,
  density (company default, comfortable, compact) and sidebar mode. The
  fields on `res.users` are in `SELF_WRITEABLE_FIELDS` and stored in
  `res.users.settings`, so a user changes only their own.
- **User menu > Theme**: light, dark or system, stored in `res.users.settings`.
  The dark styles are Odoo's `web.assets_web_dark` bundle compiled with
  `$rx-dark: true`; switching swaps the stylesheet in place, no reload.
  `ir.http.color_scheme()` serves the right bundle on the next load, and
  "system" follows the device through the `color_scheme` cookie.

## Layout

| File | Role |
| --- | --- |
| `static/src/scss/user_variables.scss` | values from the settings (replaced per database) |
| `static/src/scss/dark.scss` | `$rx-dark: true`, dark bundles only |
| `static/src/scss/tokens.scss` | palettes, gray scale (inverted in dark), semantic tokens, radius |
| `static/src/scss/primary_variables.scss` | Odoo variables mapped to the tokens (backend bundles only) |
| `static/src/scss/secondary_variables.scss` | variables Odoo derives from the primary ones |
| `static/src/scss/bootstrap_variables.scss` | Bootstrap variables (focus ring, dropdowns, modals, badges) |
| `static/src/scss/backend.scss` | component layer on top of the stock classes |
| `static/src/scss/layout.scss` | list and kanban columns as cards |
| `static/src/core/color_scheme.*` | scheme service, live stylesheet swap, user menu switcher |
| `static/src/core/density.scss` | compact density |
| `static/src/settings/` | accent field, option cards, live preview (settings and preferences) |
| `static/src/webclient/shell/` | shell state service, grid layout, palette recents |
| `static/src/webclient/sidebar/` | sidebar component |
| `static/src/webclient/topbar/` | NavBar patch: toggle and search |
| `static/src/webclient/launcher/` | app launcher overlay |
| `static/src/webclient/icons.js` | menu icons: curated by xmlid, then by pattern; `assignIcons` keeps them distinct within the sidebar (related icon first, then a neutral pool) |
| `static/src/views/control_panel/` | page header layout, labelled view tabs |
| `static/src/views/{form,list,calendar,pivot,activity}/` | per-view styles |
| `static/src/views/graph/` | single-series charts in the accent (lazy bundle) |
| `static/src/login/` | database login page |
| `static/src/fonts/` | Geist and Geist Mono, SIL OFL 1.1 |
| `models/` | settings, `ir.http.color_scheme`, user preference, bundle customisation |
| `tests/` | settings, injection guard, scheme selection |

## Accessibility

- Buttons and links meet WCAG AA (4.5:1) for any accent. `models/colors.py`
  derives, when the settings are saved, a button fill and its text colour
  (white when the picked colour is dark enough, or a shade at most 25%
  deeper, otherwise dark text) and link colours for light and dark cards.
  libsass has no luminance function, so these are written into
  `user_variables.scss`; the settings preview runs the same steps in JS.
- `python3 dev/contrast.py` checks body, secondary, sidebar, navigation,
  button, link, selected-row, focus-ring and badge colours for every palette,
  preset accent and scheme (440 pairs, all passing); `--accent '#hex'` checks
  a custom colour, `--markdown` prints the table.
- The shell is keyboard-driven: arrow keys in the sidebar, the app switcher,
  the launcher, the accent swatches and the option cards; visible focus
  rings; `aria-current`, `aria-expanded`, `aria-pressed` and radio-group roles.

## Tests

- Python (`tests/`): settings to bundles, injection guard, uninstall,
  colour scheme per user and cookie, user self-service of the appearance
  fields, session values, accent derivation and its sync with the SCSS.
- Hoot (`static/tests/`, run by `--test-tags /rex_backend_theme`): sidebar
  groups, active item, folding, pins, rail, launcher, phone drawer, the
  settings widgets and the JS derivation against the Python one.
- Odoo's own unit tests measure the stock layout in pixels (list column
  widths, calendar slots, text case), so the theme's SCSS is removed from
  `web.assets_unit_tests_setup`; its JavaScript stays in and is tested.
  The styled backend is covered by the tours.
- `dev/run_tests.sh theme20 /rex_backend_theme,/web,...` runs them in the
  Chromium image. Do not pass `-u` with other modules' tags: Odoo then runs
  only the updated module's tests.

## Translations

`i18n/rex_backend_theme.pot` with Russian and Ukrainian. Regenerate the
template with `odoo i18n export -d DB -o rex_backend_theme.pot rex_backend_theme`.
Geist includes Cyrillic.

## Dev tools

| Script | Use |
| --- | --- |
| `dev/shots.py BASE DB OUT [--dark] [names]` | screenshots at 1920x1200 |
| `dev/compare.py` | side-by-side before/after |
| `dev/probe.py BASE DB PATH JS [preJS]` | evaluate JS in a logged-in page (`SCHEME=dark`, `W=900`) |
| `dev/bundle_css.py BASE DB OUT [--dark]` | download the compiled CSS, to diff builds |
| `dev/check_icons.py FONT [names]` | list or check Material Symbols ligatures in Odoo's subset |
| `dev/run_tests.sh DB TAGS` | Odoo tests and tours in the Chromium image (`dev/Dockerfile.test`) |
| `dev/contrast.py [--accent HEX] [--markdown]` | WCAG contrast report of the tokens |
