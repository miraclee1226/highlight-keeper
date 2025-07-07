import {
  addHighlight,
  updateHighlight,
  removeHighlight,
} from "../ui/renderers/highlight-renderer.js";
import { scrollToHighlight } from "../../bridge/highlight-bridge.js";
import { setCurrentUrl } from "../state/url-state.js";
import { getDomainDetails } from "../../bridge/domain-bridge.js";
import { switchTab } from "../ui/renderers/tab-renderer.js";
import { renderCurrentPageTab } from "../ui/renderers/current-page-renderer.js";
import { renderAllPagesTab } from "../ui/renderers/all-pages-renderer.js";
import { renderErrorState } from "../ui/renderers/state-renderer.js";
import { openDomainDetailModal } from "../ui/renderers/domain-detail-modal-renderer.js";
import { openPageHighlightsModal } from "../ui/renderers/page-highlights-modal-renderer.js";
import { loadHighlights } from "./highlight-loader.js";

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
    const currentPage = document.getElementById("currentPage");
    renderErrorState(currentPage, error.message);
  }
}

export function handleTabSwitch(tabType) {
  switchTab(tabType);

  if (tabType === "allPagesTab") {
    handleAllPagesData();
  }
}

async function handleAllPagesData() {
  try {
    const domainDetails = await getDomainDetails();
    renderAllPagesTab(domainDetails, openDomainDetailModal);
  } catch (error) {
    const allPages = document.getElementById("allPages");
    renderErrorState(allPages, error.message);
  }
}

export async function handleViewAllHighlights(pageData) {
  try {
    const highlights = await loadHighlights(pageData.href);
    await openPageHighlightsModal(pageData, highlights);
  } catch (error) {
    console.error("Failed to load page highlights:", error);
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
