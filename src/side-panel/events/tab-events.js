import { urlState } from "../store/index.js";

export function setupTabEvents() {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, async (tab) => {
      const url = tab?.url;

      urlState.set(url);
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url) return;

    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      async (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.id === tabId) {
          urlState.set(changeInfo.url);
        }
      }
    );
  });
}
