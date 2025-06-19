import { getHighlights } from "../api/highlight.js";
import {
  displayHighlights,
  displayError,
  updateHighlightInList,
  removeHighlightFromList,
  addHighlightToList,
} from "./modules/side-panel-view.js";

(function refreshHighlights() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0]) {
      getHighlights({
        payload: tabs[0].url,
        onSuccess: (highlights) => displayHighlights(highlights),
        onError: (error) => displayError(error.message),
      });
    }
  });
})();

function handleHighlightCreated(highlightData) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url === highlightData.href) {
      addHighlightToList(highlightData);
    }
  });
}

function handleHighlightUpdated(updateData) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0]) {
      updateHighlightInList(updateData);
    }
  });
}

function handleHighlightDeleted(deleteData) {
  removeHighlightFromList(deleteData.uuid);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case "highlight_created":
      handleHighlightCreated(request.data);
      sendResponse({ status: "sync_complete" });
      break;

    case "highlight_updated":
      handleHighlightUpdated(request.data);
      sendResponse({ status: "sync_complete" });
      break;

    case "highlight_deleted":
      handleHighlightDeleted(request.data);
      sendResponse({ status: "sync_complete" });
      break;

    default:
      break;
  }
});
