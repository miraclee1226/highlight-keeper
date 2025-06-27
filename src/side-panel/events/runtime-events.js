import { handleRuntimeMessage } from "../core/highlight-service.js";
import { getCurrentUrl } from "../state/url-state.js";

export function setupRuntimeEvents() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const currentUrl = getCurrentUrl();
    handleRuntimeMessage(request, currentUrl);
  });
}
