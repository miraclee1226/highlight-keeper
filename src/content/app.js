import { initChromeEvents } from "./services/chrome-events.js";
import { HighlightRestorer } from "./services/highlight-restorer.js";
import { HighlightManager } from "./services/highlight-manager.js";

async function init() {
  const manager = new HighlightManager();
  const restorer = new HighlightRestorer();

  initChromeEvents(manager);
  await restorer.restore(location.href);
}

init();
