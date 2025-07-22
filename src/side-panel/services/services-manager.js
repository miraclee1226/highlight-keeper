import { urlState } from "../store/index.js";

export async function initializeCore() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    const url = tabs[0]?.url;

    urlState.set(url);
  });
}
