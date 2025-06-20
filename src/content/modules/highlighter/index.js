import { getHighlights } from "../../../api/highlight.js";
import {
  handleHighlighting,
  restoreHighlightData,
} from "./highlight-controller.js";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "scroll_to_highlight") {
    const success = scrollToHighlightElement(request.payload);

    if (success) {
      sendResponse({ status: "scroll_success" });
    } else {
      sendResponse({ status: "scroll_error", error: "Highlight not found" });
    }
  }
});

function restoreHighlights() {
  getHighlights({
    payload: location.href,
    onSuccess: (highlights) => renderAllHighlights(highlights),
    onError: (error) => console.error(error),
  });
}

function safeExecute(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();

    [2000, 5000, 10000].forEach((delay) => {
      setTimeout(callback, delay);
    });
  }
}

function initializeHighlighting() {
  restoreHighlights();

  document.addEventListener("mouseup", (e) => {
    if (e.target.closest(".toolbar") || e.target.closest(".note-editor"))
      return;
    handleHighlighting();
  });
}

safeExecute(initializeHighlighting);

// Detect URL changes (SPA support)
let lastUrl = location.href;
const urlChangeObserver = new MutationObserver(() => {
  const url = location.href;

  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => restoreHighlights(), 1500);
  }
});

urlChangeObserver.observe(document, {
  subtree: true,
  childList: true,
});

function renderAllHighlights(highlights) {
  if (!highlights || highlights.length === 0) return;

  highlights.forEach((highlight, index) => {
    setTimeout(() => {
      renderSingleHighlight(highlight);
    }, index * 100);
  });
}

function renderSingleHighlight(highlight) {
  const restoredhighlight = restoreHighlightData(highlight);
  const note = highlight.note;

  if (restoredhighlight) {
    const allHighlightElements = document.querySelectorAll(
      `[data-id="${highlight.uuid}"]`
    );

    if (note) {
      allHighlightElements.forEach((element) => {
        element.dataset.note = note;
      });
    }
  }
}

function scrollToHighlightElement(uuid) {
  const highlightElement = document.querySelectorAll(`[data-id="${uuid}"]`);

  if (highlightElement.length > 0) {
    const firstElement = highlightElement[0];

    firstElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    highlightElement.forEach((element) => {
      element.classList.add("highlight-flash");

      setTimeout(() => {
        element.classList.remove("highlight-flash");
      }, 2000);
    });
  }

  return true;
}
