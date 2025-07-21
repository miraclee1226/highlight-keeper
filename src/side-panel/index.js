import { initializeEvents } from "./events/event-manager.js";

async function init() {
  await initializeEvents();
}

init();
