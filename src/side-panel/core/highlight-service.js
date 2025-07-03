import { loadHighlights } from "./highlight-loader.js";
import {
  addHighlight,
  updateHighlight,
  removeHighlight,
  showError,
  switchTab,
  renderCurrentPageTab,
} from "../ui/highlight-renderer.js";
import { scrollToHighlight } from "../../bridge/highlight-bridge.js";
import { setCurrentUrl } from "../state/url-state.js";

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
    renderCurrentPageTab(highlights);
  } catch (error) {
    showError(error.message);
  }
}

export function handleTabSwitch(tabType) {
  switchTab(tabType);

  // TODO: Implement domain-based highlight grouping
  if (tabType === "all") {
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
        addHighlight(request.data);
      }
      break;

    case "highlight_updated":
      updateHighlight(request.data);
      break;

    case "highlight_deleted":
      removeHighlight(request.data.uuid);
      break;
  }
}
