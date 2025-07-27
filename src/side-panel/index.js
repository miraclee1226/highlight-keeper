import { initChromeEvents } from "./services/chrome-events.js";
import { App } from "./ui/app.js";

async function init() {
  initChromeEvents();
  new App();
}

init();
