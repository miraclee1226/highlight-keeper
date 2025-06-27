import {
  handleScrollToHighlight,
  handleHighlightShortcut,
} from "../core/highlight/highlight-manager.js";

export function initializeMessageEvents() {
  chrome.runtime.onMessage.addListener(handleMessage);
}

async function handleMessage(request, sender, sendResponse) {
  switch (request.action) {
    case "scroll_to_highlight":
      handleScrollToHighlight(request.payload);
      sendResponse({ success: true });
      break;

    case "highlight_shortcut":
      await handleHighlightShortcut();
      sendResponse({ success: true });
      break;
  }

  return true;
}
