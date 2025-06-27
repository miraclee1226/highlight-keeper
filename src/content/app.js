import { initializeEvents } from "./events/event-manager.js";

export async function initializeApp() {
  await initializeEvents();
}

initializeApp();
