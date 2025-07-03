import {
  setupHighlightEvents,
  setupSidePanelTabEvents,
} from "./highlight-events.js";
import { setupTabEvents } from "./tab-events.js";
import { setupRuntimeEvents } from "./runtime-events.js";
import { initializeCore } from "../core/highlight-service.js";

export async function initializeEvents() {
  await initializeCore();

  setupHighlightEvents();
  setupTabEvents();
  setupSidePanelTabEvents();
  setupRuntimeEvents();
}
