import { setCurrentUrl } from "./../state/url-state.js";
import { App } from "../ui/app.js";

export async function initializeCore() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    const currentTab = tabs[0];
    const tabUrl = currentTab?.url;

    if (tabUrl) {
      setCurrentUrl(tabUrl);
      await App.create();
    }
  });
}
