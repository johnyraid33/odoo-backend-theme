# Rex Backend Theme (prototype)

A backend look for Odoo 20 after the CloseCRM dribbble shot, on the shadcn/ui token
model: left sidebar with the current app's menu, the action in one rounded panel,
cool neutral palette with an indigo accent, Geist font (shipped in the module),
cards for lists and kanban columns, segmented status bar, line tabs.

From the lg breakpoint (992px) the sidebar replaces the horizontal menu; below it
the stock navbar is used. Website, portal and PDF reports are not affected.

The sidebar (`static/src/webclient/sidebar`) is the only JS: an Owl 3 component
added to the stock NavBar template. Odoo 19 runs Owl 2 and needs its own port.

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
| `static/src/scss/layout.scss` | sidebar, panel, list and kanban cards (lg and up) |
| `static/src/core/color_scheme.*` | scheme service, live stylesheet swap, user menu switcher |
| `static/src/webclient/sidebar/` | sidebar component: app switcher, menu tree, user |
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
