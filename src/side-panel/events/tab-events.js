import {
  listenToTabActivation,
  listenToTabUpdate,
  getCurrentTab,
  getTabById,
} from "../api/chrome-api.js";
import { setCurrentUrl } from "../app/app.js";

export function setupTabEvents(loadHighlights) {
  listenToTabActivation(async (activeInfo) => {
    const tab = await getTabById(activeInfo.tabId);
    const tabUrl = tab?.url;

    if (tabUrl) {
      setCurrentUrl(tabUrl);
      await loadHighlights(tabUrl);
    }
  });

  listenToTabUpdate(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      const currentTab = await getCurrentTab();
      if (currentTab && currentTab.id === tabId) {
        setCurrentUrl(changeInfo.url);
        await loadHighlights(changeInfo.url);
      }
    }
  });
}
