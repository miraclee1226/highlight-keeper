import { setCurrentUrl } from "../state/url-state.js";
import { CurrentPage } from "../ui/current-page.js";

export function setupTabEvents() {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, async (tab) => {
      const tabUrl = tab?.url;
      if (tabUrl) {
        setCurrentUrl(tabUrl);
        await CurrentPage.create(tabUrl);
      }
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        async (tabs) => {
          const currentTab = tabs[0];
          if (currentTab && currentTab.id === tabId) {
            setCurrentUrl(changeInfo.url);
            await CurrentPage.create(changeInfo.url);
          }
        }
      );
    }
  });
}
