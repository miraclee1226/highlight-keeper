import { initializeCore } from "../services/services-manager.js";
import { setupRuntimeEvents } from "./runtime-events.js";
import { setupTabEvents } from "./tab-events.js";

export async function initializeEvents() {
  await initializeCore();
  setupRuntimeEvents();
  setupTabEvents();
}
