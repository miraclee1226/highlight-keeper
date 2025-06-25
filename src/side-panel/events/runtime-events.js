import { listenToRuntimeMessages } from "../api/chrome-api.js";
import {
  addHighlight,
  updateHighlight,
  removeHighlight,
} from "../renderers/highlight-renderer.js";

export function setupRuntimeEvents(container, getCurrentUrl) {
  listenToRuntimeMessages((request, sender, sendResponse) => {
    const currentUrl = getCurrentUrl();

    switch (request.action) {
      case "highlight_created":
        if (currentUrl === request.data.href) {
          addHighlight(container, request.data);
        }
        break;

      case "highlight_updated":
        updateHighlight(container, request.data);
        break;

      case "highlight_deleted":
        removeHighlight(container, request.data.uuid);
        break;
    }
  });
}
