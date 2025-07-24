import { pageState } from "../store/page-store.js";
import { handleHighlightUpdate } from "./highlight-update.js";

export function initChromeEvents() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (tab) {
      pageState.set({ url: tab.url, title: tab.title });
    }
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab) {
        pageState.set({ url: tab.url, title: tab.title });
      }
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url && !changeInfo.title) return;

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
