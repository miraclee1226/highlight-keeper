import { getHighlights } from "../api/highlight.js";
import { displayHighlights, displayError } from "./modules/side-panel-view.js";

function refreshHighlights() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0]) {
      getHighlights({
        payload: tabs[0].url,
        onSuccess: (highlights) => displayHighlights(highlights),
        onError: (error) => displayError(error.message),
      });
    }
  });
}

refreshHighlights();
