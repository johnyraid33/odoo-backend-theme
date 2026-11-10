// Odoo menus carry no icon below the app level. The theme picks one per menu:
// an exact xmlid from the curated list first, then a pattern on the xmlid and
// name. Every name must exist in Odoo's Material Symbols subset (oi
// data-icon); dev/check_icons.py verifies them.

const BY_XMLID = {
    // Discuss
    "mail.main_menu_discuss": "forum",
    "mail.menu_channel": "tag",
    "mail.discuss_call_history_menu": "history",
    // Calendar
    "calendar.calendar_event_menu": "calendar_today",
    "calendar.menu_calendar_calendars": "event_available",
    "calendar.calendar_submenu_reminders": "notifications",
    // Contacts
    "contacts.res_partner_menu_contacts": "contact_page",
    "contacts.res_partner_industry_menu": "factory",
    "contacts.menu_action_res_partner_bank_form": "account_balance",
    "contacts.menu_country_partner": "public",
    "contacts.menu_country_state_partner": "map",
    "contacts.menu_res_city": "location_on",
    "contacts.menu_country_group": "travel",
    // CRM
    "crm.menu_crm_opportunities": "filter_alt",
    "crm.crm_lead_menu_my_activities": "schedule",
    "sale_crm.sale_order_menu_quotations_crm": "description",
    "crm.sales_team_menu_team_pipeline": "handshake",
    "crm.res_partner_menu_customer": "group",
    "crm.crm_menu_leads": "person_add",
    "crm.crm_menu_forecast": "show_chart",
    "crm.crm_opportunity_report_menu": "bar_chart",
    "crm.crm_opportunity_report_menu_lead": "pie_chart",
    "crm.crm_activity_report_menu": "area_chart",
    "crm.crm_team_member_config": "badge",
    "crm.crm_recurring_plan_menu_config": "repeat",
    "crm.menu_crm_lead_stage_act": "view_kanban",
    "crm.menu_crm_lost_reason": "block",
    "crm_iap_mine.crm_iap_lead_mining_request_menu_action": "explore",
    // Sales
    "sale.menu_sale_quotations": "description",
    "sale.menu_sale_order": "shopping_cart",
    "sale.menu_service_material": "build",
    "sale.res_partner_menu": "group",
    "sale.menu_product_template_action": "package_2",
    "sale.menu_product_attribute_action": "tune",
    "sale.menu_product_pricelist_main": "sell",
    "sale.menu_reporting_sales": "bar_chart",
    "sale.menu_reporting_salespeople": "pie_chart",
    "sale.menu_reporting_product": "area_chart",
    "sale.menu_reporting_customer": "show_chart",
    "sale.payment_provider_menu": "credit_card",
    "sale_management.sale_order_template_menu": "article",
    // Dashboards
    "spreadsheet_dashboard.spreadsheet_dashboard_menu_dashboard": "grid_view",
    "spreadsheet_dashboard.spreadsheet_dashboard_group_menu_configuration_sections": "stacks",
    "spreadsheet_dashboard.spreadsheet_dashboard_share_menu_configuration_share_links": "link",
    // Invoicing
    "account.menu_board_journal_1": "grid_view",
    "account.menu_action_move_out_invoice_type": "receipt_long",
    "account.menu_action_move_out_refund_type": "undo",
    "account.menu_action_account_payments_receivable": "payments",
    "account.menu_account_customer": "group",
    "account.menu_action_move_in_invoice_type": "inbox",
    "account.menu_action_move_in_refund_type": "reply",
    "account.menu_action_account_payments_payable": "money_bag",
    "account.menu_account_supplier": "storefront",
    "account.menu_action_move_journal_line_form": "article",
    "account.menu_action_analytic_lines_tree": "table_chart",
    "account.menu_action_secure_entries": "lock",
    "account.menu_action_account_moves_all": "view_list",
    "account.account_audit_trail_menu": "history",
    "account.menu_action_account_invoice_report_all": "bar_chart",
    "account.menu_action_account_cashflow_analysis": "show_chart",
    "account.menu_action_analytic_reporting": "pie_chart",
    "account_payment.payment_provider_menu": "credit_card",
    "account.menu_action_account_form": "account_tree",
    "account.menu_action_tax_form": "percent",
    "account.menu_action_account_journal_form": "stacks",
    "account.menu_action_currency_form": "attach_money",
    "account.menu_action_account_fiscal_position_form": "gavel",
    "account.menu_action_account_journal_group_list": "view_module",
    "account.menu_action_tax_group": "label",
    "account.menu_action_rounding_form_view": "calculate",
    "account.menu_action_payment_term_form": "schedule",
    "account.menu_action_incoterm_open": "local_shipping",
    // Project
    "project.menu_projects": "folder",
    "project.menu_projects_group_stage": "folder_open",
    "project.menu_project_management_my_tasks": "checklist",
    "project.menu_project_management_all_tasks": "task",
    "project.menu_project_report_task_analysis": "bar_chart",
    "project.rating_rating_menu_project": "thumb_up",
    "sale_project.analytic_margins_menu_project": "attach_money",
    "sale_project_margin.analytic_projected_margins_menu_project": "show_chart",
    "project.menu_project_config_project_template": "article",
    "project.project_menu_config_project_roles": "badge",
    "project.menu_project_config_project_stage": "view_kanban",
    "project.menu_project_config_project": "view_column",
    // Purchase
    "purchase.menu_purchase_rfq": "description",
    "purchase.menu_purchase_form_action": "shopping_bag",
    "purchase.menu_procurement_management_supplier_name": "storefront",
    "purchase.menu_procurement_partner_contact_form": "package_2",
    "purchase.purchase_report": "bar_chart",
    "purchase.menu_product_pricelist_action2_purchase": "sell",
    // Inventory
    "stock.stock_picking_type_menu": "grid_view",
    "stock.in_picking": "inbox",
    "stock.out_picking": "local_shipping",
    "stock.int_picking": "swap_horiz",
    "stock.stock_picking_batch_menu": "stacks",
    "stock.menu_action_inventory_tree": "checklist",
    "stock.menu_stock_scrap": "delete",
    "stock.menu_reordering_rules_replenish": "autorenew",
    "stock.menu_stock_references": "link",
    "stock.menu_procurement_compute": "timer",
    "stock.menu_action_production_lot_form": "barcode",
    "stock.menu_package": "inventory_2",
    "stock.menu_product_stock": "storage",
    "stock.menu_valuation": "map",
    "stock.stock_move_line_menu": "history",
    "stock.stock_move_menu": "bar_chart",
    "stock_account.valuation_adjustments_menu": "attach_money",
    "sale_stock.menu_stock_picking_return_report": "undo",
    "stock.menu_action_warehouse_form": "factory",
    "stock.menu_pickingtype": "swap_vert",
    "stock.menu_action_location_form": "location_on",
    "stock.menu_routes_config": "sync_alt",
    "stock.menu_action_rules_form": "account_tree",
    "stock.menu_putaway": "unarchive",
    "stock.menu_wms_barcode_nomenclature_all": "qr_code",
    "stock.menu_packaging_types": "deployed_code",
    // Employees
    "hr.menu_hr_employee_payroll": "badge",
    "hr.menu_hr_employee": "group",
    "hr.menu_hr_department_kanban": "business",
    "hr_skills.hr_certification_menu": "school",
    "hr_skills.menu_learnings_training_attendances": "how_to_vote",
    "hr_skills.hr_employee_skill_inventory_report_menu": "bar_chart",
    "hr.menu_config_plan_plan": "checklist",
    "hr.menu_view_hr_contract_type": "work",
    "hr.menu_hr_work_location_tree": "location_on",
    "hr.menu_hr_departure_reason_tree": "logout",
    "hr_skills.hr_skill_type_menu": "star",
    "hr.menu_resource_calendar_view": "schedule",
    "hr.menu_view_hr_job": "trophy",
    "hr.menu_hr_employee_contract_templates": "description",
    // Link Tracker
    "utm.menu_utm_campaign_act": "campaign",
    "utm.menu_utm_medium": "link",
    "utm.menu_utm_source": "explore",
    // Apps
    "base.menu_module_tree": "apps",
    "base.menu_theme_store": "storefront",
    "base.menu_third_party": "extension",
    "base.menu_view_base_module_update": "autorenew",
    "base.menu_view_base_module_upgrade": "build",
    "base_import_module.menu_view_base_module_import": "upload",
    // Settings
    "base_setup.menu_config": "settings",
    "base.menu_action_res_users": "person",
    "base.menu_action_res_groups": "group",
    "base.menu_action_res_company_form": "business",
    "base.menu_res_lang_act_window": "translate",
    "base.menu_view_base_import_language": "download",
    "base.menu_wizard_lang_export": "upload",
    // Settings > Technical
    "mail.menu_mail_message": "mail",
    "mail.mail_message_schedule_menu": "schedule",
    "mail.menu_message_subtype": "label",
    "mail.mail_notification_menu": "notifications",
    "mail.menu_email_followers": "group",
    "mail.mail_blacklist_menu": "block",
    "rating.rating_rating_menu_technical": "star",
    "mail.res_users_settings_menu": "account_circle",
    "mail.mail_guest_menu": "person_add",
    "mail.discuss_channel_rtc_session_menu": "videocam",
    "mail.ice_servers_menu": "dns",
    "mail.mail_message_reaction_menu": "add_reaction",
    "mail.mail_link_preview_menu": "link",
    "mail.discuss_gif_favorite_menu": "gif_box",
    "mail.menu_mail_activities": "event_upcoming",
    "mail.menu_mail_activity_type": "list_alt",
    "mail.menu_mail_activity_plan": "checklist",
    "mail.menu_mail_mail": "alternate_email",
    "base.menu_mail_servers": "send",
    "mail.menu_action_fetchmail_server_tree": "inbox",
    "mail.menu_email_templates": "article",
    "mail.ir_ui_view_menu_usage_mail_post": "campaign",
    "mail.mail_alias_menu": "contact_mail",
    "mail.mail_alias_domain_menu": "public",
    "mail.discuss_channel_menu_settings": "tag",
    "mail.discuss_channel_member_menu": "badge",
    "mail.mail_gateway_allowed_menu": "verified",
    "digest.digest_menu": "newspaper",
    "digest.digest_tip_menu": "lightbulb",
    "sms.sms_sms_menu": "chat_bubble",
    "sms.sms_template_menu": "sticky_note_2",
    "phone_validation.phone_blacklist_menu": "phone_cancel",
    "base.menu_ir_sequence_actions": "flash_on",
    "base.menu_ir_action_report": "print",
    "base.menu_ir_action_window": "open_in_browser",
    "base.menu_ir_client_actions_report": "desktop_windows",
    "base.menu_server_action": "terminal",
    "base.menu_ir_embedded_action": "dock_to_right",
    "base.menu_ir_actions_todo_form": "wand_stars",
    "base.ir_default_menu": "tune",
    "iap.iap_account_menu": "key",
    "base.menu_grant_menu_access": "menu",
    "onboarding.menu_onboarding": "rocket_launch",
    "onboarding.menu_onboarding_step": "format_list_numbered",
    "base.menu_action_ui_view": "code",
    "base.menu_action_ui_view_custom": "edit_square",
    "base.menu_ir_filters": "filter_alt",
    "web_tour.menu_tour_action": "signpost",
    "base.ir_model_data_menu": "qr_code",
    "base.menu_ir_sequence_form": "tag",
    "base.menu_decimal_precision_form": "calculate",
    "base.menu_action_asset": "deployed_code",
    "base.ir_model_model_menu": "database",
    "base.ir_model_model_fields": "table",
    "base.ir_model_model_fields_selection": "radio_button_checked",
    "base.ir_model_constraint_menu": "gavel",
    "base.ir_model_relation_menu": "account_tree",
    "base.menu_action_attachment": "attach_file",
    "base.ir_logging_all_menu": "receipt_long",
    "base.menu_ir_profile": "speed",
    "base.menu_ir_cron_act": "timer",
    "base.ir_cron_trigger_menu": "hourglass_top",
    "spreadsheet_dashboard.spreadsheet_dashboard_menu_configuration_global_filters": "grid_view",
    "base.paper_format_menuitem": "description",
    "base.reports_menuitem": "picture_as_pdf",
    "base.ir_config_menu": "settings_applications",
    "base.menu_action_user_session": "login",
    "base.menu_action_res_groups_privilege": "security",
    "base.menu_ir_access": "lock",
    "base.menu_action_user_device": "smartphone",
    "privacy_lookup.pricacy_log_menu": "visibility",
    "resource.menu_resource_calendar": "calendar_clock",
    "resource.menu_view_resource_calendar_leaves_search": "event_busy",
    "resource.menu_resource_resource": "build",
    "calendar.menu_calendar_event_type": "bookmark",
    "calendar.menu_calendar_alarm": "alarm_add",

};

// First match wins: specific words before broad ones ("lead tags" are tags,
// "product attributes" are attributes, "config" only when nothing else fits).
const BY_PATTERN = [
    [/dashboard|overview/, "grid_view"],
    [/report|analysis|analytic|statistic|forecast/, "bar_chart"],
    [/tags?(?![a-z])|label/, "label"],
    [/categ/, "account_tree"],
    [/uom|units?(?![a-z])/, "width"],
    [/attribute/, "tune"],
    [/activit/, "schedule"],
    [/stage/, "view_kanban"],
    [/team/, "handshake"],
    [/template/, "article"],
    [/pipeline|opportunit/, "filter_alt"],
    [/lead/, "person_add"],
    [/quotation|rfq/, "description"],
    [/order/, "shopping_cart"],
    [/invoice|bill|move|journal|accounting|refund/, "receipt_long"],
    [/payment/, "payments"],
    [/product|catalog|variant/, "package_2"],
    [/pricelist|price/, "sell"],
    [/customer|partner|contact|client/, "group"],
    [/vendor|supplier/, "storefront"],
    [/employee|department|hr_/, "badge"],
    [/project/, "folder"],
    [/task|to-do|todo/, "checklist"],
    [/calendar|meeting|event/, "calendar_today"],
    [/plan/, "checklist"],
    [/user/, "person"],
    [/compan/, "business"],
    [/stock|inventory|warehouse|picking|deliver/, "local_shipping"],
    [/message|discuss|channel|mail|chat/, "forum"],
    [/currenc/, "attach_money"],
    [/tax/, "percent"],
    [/bank/, "account_balance"],
    [/countr|state|region/, "public"],
    [/location|address/, "location_on"],
    [/schedul|cron|time|hour/, "schedule"],
    [/sequence|number/, "tag"],
    [/access|rule|security|right|group/, "lock"],
    [/view|menu|action|model|field/, "code"],
    [/server|mail_server|fetchmail/, "dns"],
    [/log|trace|profil/, "terminal"],
    [/attachment|document|file/, "folder"],
    [/language|translat/, "translate"],
    [/sms|phone/, "phone"],
    [/blacklist|block/, "block"],
    [/link|url|share/, "link"],
    [/notif|remind|alarm/, "notifications"],
    [/config|setting/, "settings"],
];

// Related icons, in order of preference. When two entries of one sidebar
// would get the same icon, the second takes the next free icon of a group
// its first choice belongs to, so a near meaning is kept.
const FAMILIES = [
    ["bar_chart", "pie_chart", "area_chart", "show_chart", "graph_2", "table_chart", "speed", "trophy", "troubleshoot"],
    ["description", "article", "receipt_long", "list_alt", "assignment", "contract", "sticky_note_2", "newspaper", "book", "drafts", "picture_as_pdf"],
    ["group", "person", "badge", "contact_page", "account_circle", "contact_mail", "handshake", "support", "person_add", "family_history"],
    ["package_2", "inventory_2", "deployed_code", "widgets", "view_module", "diamond", "card_giftcard", "storage"],
    ["settings", "tune", "settings_applications", "build", "extension", "palette", "design_services"],
    ["payments", "attach_money", "money_bag", "credit_card", "account_balance", "euro", "balance", "calculate", "sell", "percent"],
    ["local_shipping", "inbox", "unarchive", "archive", "swap_horiz", "swap_vert", "sync_alt", "flight", "train"],
    ["location_on", "map", "public", "travel", "flag", "signpost", "my_location", "near_me", "home", "business", "factory", "storefront"],
    ["schedule", "history", "timer", "today", "calendar_today", "calendar_clock", "event_available", "event_upcoming", "hourglass_top", "alarm_add"],
    ["undo", "reply", "redo", "autorenew", "cached", "refresh", "recycling", "repeat", "published_with_changes"],
    ["view_kanban", "view_column", "view_list", "view_timeline", "grid_view", "stacks", "table", "view_module"],
    ["checklist", "task", "check_circle", "check_box", "list_alt", "format_list_bulleted", "published_with_changes"],
    ["shopping_cart", "shopping_bag", "shopping_basket", "add_shopping_cart", "shopping_cart_checkout", "storefront", "sell"],
    ["label", "tag", "bookmark", "sell", "flag", "star", "confirmation_number"],
    ["folder", "folder_open", "folder_zip", "inventory_2", "archive", "stacks"],
    ["lock", "security", "key", "verified", "gavel", "block", "no_encryption"],
    ["code", "terminal", "database", "storage", "dns", "memory", "bug_report"],
    ["forum", "chat_bubble", "mail", "campaign", "notifications", "mode_comment", "send", "alternate_email"],
    ["school", "book", "lightbulb", "science", "experiment", "how_to_vote"],
    ["link", "share", "explore", "open_in_new", "rss_feed"],
    ["work", "trophy", "badge", "business", "handshake"],
    ["translate", "download", "upload", "cloud_download", "cloud_upload", "print"],
    ["apps", "extension", "widgets", "grid_view", "rocket_launch"],
    ["barcode", "qr_code", "confirmation_number", "tag"],
    ["account_tree", "folder_open", "view_module", "grain", "table", "stacks"],
];

// Any icon of the families, then neutral ones: the last resort that keeps
// every entry of a large menu (Settings > Technical) distinct.
const POOL = [
    ...new Set([
        "home", "lightbulb", "rocket_launch", "diamond", "thumb_up", "visibility", "monitor", "laptop",
        "smartphone", "desktop_windows", "cloud", "image", "photo_camera", "brush", "edit_square",
        "wand_stars", "manufacturing", "key", "power", "newspaper",
        ...FAMILIES.flat(),
    ]),
];

export function iconFor(menu) {
    if (menu.xmlid && BY_XMLID[menu.xmlid]) {
        return BY_XMLID[menu.xmlid];
    }
    if (/^(settings|general settings)$/i.test((menu.name || "").trim())) {
        return "settings";
    }
    const key = `${menu.xmlid || ""} ${menu.name || ""}`.toLowerCase();
    const found = BY_PATTERN.find(([re]) => re.test(key));
    return found ? found[1] : "article";
}

function candidates(icon) {
    const related = FAMILIES.filter((family) => family.includes(icon)).flatMap((family) => {
        // the icons after the first choice come first, then the ones before
        const at = family.indexOf(icon);
        return [...family.slice(at + 1), ...family.slice(0, at)];
    });
    return [icon, ...related, ...POOL];
}

/**
 * One distinct icon per menu, for the menus shown together (an app's tree
 * and the pinned entries), in display order: earlier entries keep their
 * first choice. Entries with children that render no icon of their own are
 * walked but not given one when `withIcon(menu)` says so.
 * Returns a Map of menu id to icon name.
 */
export function assignIcons(menus, withIcon = () => true) {
    const icons = new Map();
    const used = new Set();
    const visit = (menu, depth) => {
        if (!icons.has(menu.id) && withIcon(menu, depth)) {
            const icon = candidates(iconFor(menu)).find((name) => !used.has(name)) || iconFor(menu);
            icons.set(menu.id, icon);
            used.add(icon);
        }
        for (const child of menu.childrenTree || []) {
            visit(child, depth + 1);
        }
    };
    for (const menu of menus) {
        visit(menu, 0);
    }
    return icons;
}

/** Every icon name used above, for dev/check_icons.py. */
export const ICON_NAMES = [
    ...new Set([...Object.values(BY_XMLID), ...BY_PATTERN.map(([, icon]) => icon), ...POOL, "article"]),
];
