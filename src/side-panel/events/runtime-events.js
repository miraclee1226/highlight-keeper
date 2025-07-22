import { handleHighlightUpdate } from "../services/highlight-service.js";
import { urlState } from "../store/index.js";

export function setupRuntimeEvents() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const url = urlState.get();

    handleHighlightUpdate(request, url);
  });
}
