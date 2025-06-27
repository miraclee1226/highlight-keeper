import { handleTabChange } from "../core/highlight-service.js";
import { setCurrentUrl } from "../state/url-state.js";

export function setupTabEvents() {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      const tabUrl = tab?.url;
      if (tabUrl) {
        setCurrentUrl(tabUrl);
        handleTabChange(tabUrl);
      }
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.id === tabId) {
          setCurrentUrl(changeInfo.url);
          handleTabChange(changeInfo.url);
        }
      });
    }
  });
}
