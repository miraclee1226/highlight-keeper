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

        case "remove_all_highlights_from_dom":
          try {
            const allHighlightElements = document.querySelectorAll(
              ".highlighted-element"
            );

            allHighlightElements.forEach((element) => {
              const parent = element.parentNode;
              if (parent) {
                parent.insertBefore(
                  document.createTextNode(element.textContent),
                  element
                );
                parent.removeChild(element);
              }
            });

            document.normalize();

            sendResponse({
              success: true,
              removedCount: allHighlightElements.length,
            });
          } catch (error) {
            console.error("Failed to remove highlights from DOM:", error);
            sendResponse({ success: false, error: error.message });
          }
          break;
      }
      return true;
    }
  );
}
