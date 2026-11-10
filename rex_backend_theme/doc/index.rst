==================
Rex Backend Theme
==================

A calm, neutral backend for Odoo Community: a sidebar with the current app's
menu, an app launcher, a page header, light and dark schemes and your own
accent colour, palette, corner radius and density.

Installation
============

From the Odoo Apps Store
------------------------

1. Download the module for your Odoo version and unpack it into a folder of
   your addons path, so that the path ends with ``.../rex_backend_theme``.
2. Restart the Odoo server.
3. Log in as an administrator, open **Apps**, click **Update Apps List**,
   remove the *Apps* filter, search for *Rex Backend Theme* and click
   **Activate** (or **Install**).

From the Git repository
-----------------------

::

    git clone -b 20.0 https://github.com/johnyraid33/odoo-backend-theme.git
    # use -b 19.0 for Odoo 19
    odoo -d DATABASE --addons-path=odoo-backend-theme,ODOO/addons -i rex_backend_theme

Requirements: Odoo Community 20.0 or 19.0. The module depends only on
``web``, ``web_tour`` and ``base_setup``, has no Python packages to install
and loads nothing from outside servers: the Geist font and the icons ship
with the module.

The theme applies at once, in the light scheme, for every internal user.
Website, portal and PDF reports keep their own look.

Configuration (administrators)
==============================

**Settings > General Settings > Backend Theme**

Preview
    The backend in the light and dark schemes. It follows your choices
    before you save.

Accent colour
    Primary buttons, focus rings and selected states. Pick one of eleven
    presets, a custom colour or type a hex value such as ``#0d9488``. Light
    colours are deepened only as much as WCAG AA contrast (4.5:1) needs; the
    note under the swatches shows the colour the buttons will use.

Neutral palette
    The gray scale of backgrounds, borders and secondary text: Zinc, Slate,
    Stone or Gray.

Corner radius
    Buttons, inputs, cards and the main panel: Square, Small, Medium or Large.

Density
    The company default spacing of lists, forms and the sidebar: Comfortable
    or Compact. Each user can override it.

Company logo in the sidebar
    Shows the current company's logo at the top of the sidebar. The logo
    itself is set on the company (**Settings > Companies**).

Click **Save**. Accent, palette and radius recompile the backend styles once
for everyone (users see them after a reload); density and the logo apply
without recompiling. Choosing the defaults again removes the customisation.

Personal preferences (every user)
=================================

**User menu > My Preferences > Appearance**

Colour scheme
    Light, Dark or System. *System* follows the device setting, day and night.

Density
    Company default, Comfortable or Compact.

Sidebar
    Expanded (names and groups) or Icons only.

The colour scheme can also be switched with the **Light / Dark / System**
switch in the user menu (top right); it changes in place, without reloading
the page.

Using the shell
===============

Sidebar
    The current app's menu as groups; configuration groups start folded. The
    app switcher at the top lists every app with a search field. Hover an
    entry and click the pin to keep it at the top of the sidebar in every
    app; pins are saved per user.

App launcher
    All apps on one screen with a search field and recently opened records.
    Open it with **All apps** in the switcher or the keyboard shortcut.

Search or jump to
    The search box in the top bar opens Odoo's command palette, with recently
    opened records first.

Tablets and phones
    Below 992 px of window width the sidebar is an icon rail; below 768 px
    (phones) it slides in from the menu button in the top bar.

Keyboard shortcuts
------------------

=================================  ======================  ======================
Action                             Windows / Linux         macOS
=================================  ======================  ======================
App launcher                       Alt + H                 Ctrl + H
Sidebar: expanded / icons only     Ctrl + B                Cmd + B
Command palette                    Ctrl + K                Cmd + K
Move in the sidebar or launcher    Arrow keys, Home, End   Arrow keys, Home, End
Open the focused entry             Enter                   Enter
Close the launcher                 Escape                  Escape
=================================  ======================  ======================

Compatibility
=============

* Odoo's navbar, control panel and their CSS classes stay in the page, so
  modules that extend them and their guided tours keep working. While a tour
  runs, Odoo's own top menu is shown again.
* Checked with the tests and tours of Sales, CRM, Invoicing, Inventory,
  Purchase, Project, Employees, Calendar and Contacts.
* Community edition only. Odoo Enterprise replaces the web client with its
  own (``web_enterprise``); do not install both.
* Other backend themes change the same screens: uninstall them first.

Uninstalling
============

**Apps > Rex Backend Theme > Uninstall** restores Odoo's own look. The
compiled customisation and the theme settings are removed with the module.

Translations
============

English, Ukrainian and Russian are included. Load a language in
**Settings > Languages** and the theme's labels follow it.

Support
=======

Questions and bug reports: info@rex.cy or
https://github.com/johnyraid33/odoo-backend-theme/issues
