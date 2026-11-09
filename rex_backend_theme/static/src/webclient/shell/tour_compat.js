import { browser } from "@web/core/browser/browser";
import { registry } from "@web/core/registry";

const TOUR_CLASS = "rx-tour-running";

/**
 * Tours written for the stock web client click the navbar's section menus
 * (".o_main_navbar button:contains(Configuration)"...). The theme hides them
 * from md up; while a tour runs they are shown again and the top bar search
 * makes room for them (shell.scss), so tours of every module keep working.
 * The class stays until the next page load.
 */
export const tourCompatService = {
    dependencies: ["tour_service"],
    start() {
        const mark = () => {
            document.body.classList.add(TOUR_CLASS);
            // the navbar re-measures which sections fit (it listens to resize)
            window.dispatchEvent(new Event("resize"));
        };
        // a tour resumed after a page load
        if (browser.localStorage.getItem("current_tour")) {
            mark();
        }
        const startTour = odoo.startTour;
        if (typeof startTour === "function") {
            odoo.startTour = (...args) => {
                mark();
                return startTour(...args);
            };
        }
    },
};

registry.category("services").add("rex_backend_theme.tour_compat", tourCompatService);
