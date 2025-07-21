import { handleHighlightUpdate } from "../services/highlight-service.js";
import { getCurrentUrl } from "../state/url-state.js";

export function setupRuntimeEvents() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const currentUrl = getCurrentUrl();
    handleHighlightUpdate(request, currentUrl);
  });
}
