import { initializeEvents } from "./events/event-manager.js";
import { App } from "./ui/app.js";

async function init() {
  await initializeEvents();
  await App.create();
}

init();
