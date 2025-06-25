import { fetchHighlights } from "../api/highlight-api.js";
import { getCurrentTab } from "../api/chrome-api.js";
import {
  renderHighlights,
  showError,
} from "../renderers/highlight-renderer.js";
import { setupHighlightEvents } from "../events/highlight-events.js";
import { setupTabEvents } from "../events/tab-events.js";
import { setupRuntimeEvents } from "../events/runtime-events.js";

const container = document.querySelector(".container");
let currentUrl = null;

export async function initializeApp() {
  try {
    const currentTab = await getCurrentTab();
    const tabUrl = currentTab?.url;

    if (tabUrl) {
      currentUrl = tabUrl;
      await loadHighlights(tabUrl);
    }
  } catch (error) {
    showError(container, "Failed to load current tab");
  }
}

export function setupEventListeners() {
  setupHighlightEvents(container);
  setupTabEvents(loadHighlights);
  setupRuntimeEvents(container, getCurrentUrl);
}

async function loadHighlights(url) {
  try {
    const highlights = await fetchHighlights(url);
    const sortedHighlights = highlights.sort(
      (a, b) => a.createdAt - b.createdAt
    );

    renderHighlights(container, sortedHighlights);
  } catch (error) {
    showError(container, error.message);
  }
}

export function setCurrentUrl(url) {
  currentUrl = url;
}

export function getCurrentUrl() {
  return currentUrl;
}
