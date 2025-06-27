import { loadHighlights } from "./highlight-loader.js";
import {
  renderHighlights,
  addHighlight,
  updateHighlight,
  removeHighlight,
  showError,
} from "../ui/highlight-renderer.js";
import { scrollToHighlight } from "../../bridge/highlight-bridge.js";
import { setCurrentUrl } from "../state/url-state.js";

const container = document.querySelector(".container");

export async function initializeCore() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    const currentTab = tabs[0];
    const tabUrl = currentTab?.url;

    if (tabUrl) {
      setCurrentUrl(tabUrl);
      await handleTabChange(tabUrl);
    }
  });
}

export async function handleTabChange(url) {
  try {
    const highlights = await loadHighlights(url);
    renderHighlights(container, highlights);
  } catch (error) {
    showError(container, error.message);
  }
}

export async function handleHighlightClick(uuid) {
  try {
    await scrollToHighlight(uuid);
  } catch (error) {
    console.error("Failed to navigate to highlight:", error);
  }
}

export function handleRuntimeMessage(request, currentUrl) {
  switch (request.action) {
    case "highlight_created":
      if (currentUrl === request.data.href) {
        addHighlight(container, request.data);
      }
      break;

    case "highlight_updated":
      updateHighlight(container, request.data);
      break;

    case "highlight_deleted":
      removeHighlight(container, request.data.uuid);
      break;
  }
}
