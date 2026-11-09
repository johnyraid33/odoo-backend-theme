# Rex Backend Theme (prototype)

A backend look for Odoo 20 after the CloseCRM dribbble shot, on the shadcn/ui token
model: left sidebar with the current app's menu, the action in one rounded panel,
cool neutral palette with an indigo accent, Geist font (shipped in the module),
cards for lists and kanban columns, segmented status bar, line tabs.

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

Website, portal and PDF reports are not affected. The JS targets Owl 3
(Odoo 20); Odoo 19 runs Owl 2 and needs its own port.

## Stand

```bash
cd dev
docker compose up -d                 # Odoo 20 on http://127.0.0.1:8180, admin/admin
python3 shots.py http://127.0.0.1:8180 theme20 shots/after        # with the theme
python3 shots.py http://127.0.0.1:8180 theme20base shots/before   # same data, no theme
python3 compare.py                    # side-by-side images in shots/compare (needs Pillow)
```

## Theme values and colour schemes

- **Settings > General Settings > Backend Theme**: accent colour, neutral palette
  (zinc, slate, stone, neutral) and corner radius. Saving stores a copy of
  `user_variables.scss` as an attachment and replaces the file in the backend
  bundles through an `ir.asset` "replace" record (the website builder's
  mechanism), so Odoo recompiles once and every derived colour is exact.
  Back to the defaults, the customisation is removed; the uninstall hook
  removes it too, otherwise the bundles would point at a missing module.
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
| `static/src/webclient/shell/` | shell state service, grid layout, palette recents |
| `static/src/webclient/sidebar/` | sidebar component |
| `static/src/webclient/topbar/` | NavBar patch: toggle and search |
| `static/src/webclient/launcher/` | app launcher overlay |
| `static/src/webclient/icons.js` | menu icons: curated by xmlid, then by pattern |
| `static/src/fonts/` | Geist and Geist Mono, SIL OFL 1.1 |
| `models/` | settings, `ir.http.color_scheme`, user preference, bundle customisation |
| `tests/` | settings, injection guard, scheme selection |

## Dev tools

| Script | Use |
| --- | --- |
| `dev/shots.py BASE DB OUT [--dark] [names]` | screenshots at 1920x1200 |
| `dev/compare.py` | side-by-side before/after |
| `dev/probe.py BASE DB PATH JS [preJS]` | evaluate JS in a logged-in page (`SCHEME=dark`, `W=900`) |
| `dev/bundle_css.py BASE DB OUT [--dark]` | download the compiled CSS, to diff builds |
| `dev/check_icons.py FONT [names]` | list or check Material Symbols ligatures in Odoo's subset |
