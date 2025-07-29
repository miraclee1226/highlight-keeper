import { scrollToHighlight } from "./highlight-api.js";

export function initChromeEvents(highlightManager) {
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      switch (request.action) {
        case "scroll_to_highlight":
          scrollToHighlight(request.payload);
          sendResponse({ success: true });
          break;

        case "highlight_shortcut":
          await highlightManager.handleHighlightShortcut();
          sendResponse({ success: true });
          break;
      }
      return true;
    }
  );
}
