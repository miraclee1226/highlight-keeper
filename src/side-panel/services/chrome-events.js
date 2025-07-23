import { urlState } from "../store/index.js";
import { handleHighlightUpdate } from "./highlight-update.js";

export function initChromeEvents() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const url = tabs[0]?.url;

    urlState.set(url);
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      const url = tab?.url;

      urlState.set(url);
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url) return;

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.id === tabId) {
        urlState.set(changeInfo.url);
      }
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const url = urlState.get();

    handleHighlightUpdate(request, url);
  });
}
