import { pageState } from "../store/page-store.js";
import { handleHighlightUpdate } from "./highlight-update.js";

export function initChromeEvents() {
  // Get current active tab info when extension starts
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (tab) {
      pageState.set({ url: tab.url, title: tab.title });
    }
  });

  // Register tab switching event listener
  // Executes whenever user switches to a different tab
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab) {
        pageState.set({ url: tab.url, title: tab.title });
      }
    });
  });

  // Register tab content change event listener
  // Detects all tab updates: navigation, refresh, title changes, etc.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url && !changeInfo.title) return;

    // Check current active tab (ignore background tab changes)
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.id === tabId) {
        pageState.set({
          url: currentTab.url,
          title: currentTab.title,
        });
      }
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const url = pageState.get().url;
    handleHighlightUpdate(request, url);
  });
}
