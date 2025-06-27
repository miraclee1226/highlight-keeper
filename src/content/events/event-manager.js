import { initializeHighlightManager } from "../core/highlight/highlight-manager.js";
import { initializeMessageEvents } from "./message-events.js";
import { initializeMouseEvents } from "./mouse-events.js";

export async function initializeEvents() {
  await initializeHighlightManager();

  initializeMouseEvents();
  initializeMessageEvents();
}
