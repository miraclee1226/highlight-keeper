import { getHighlights } from "../../../api/highlight.js";
import { Toolbar } from "../../../components/toolbar/index.js";
import { COLORS } from "../../../constant/colors.js";
import {
  applyHighlight,
  handleHighlighting,
  restoreHighlightData,
} from "./highlight-controller.js";
import { captureSelection } from "./selection-manager.js";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "scroll_to_highlight") {
    const success = scrollToHighlightElement(request.payload);

    if (success) {
      sendResponse({ action: "scroll_success" });
    } else {
      sendResponse({ action: "scroll_error", error: "Highlight not found" });
    }
  }

  if (request.action === "highlight_shortucut") {
    if (Toolbar.instance) {
      Toolbar.instance.hide();
    }

    const selection = captureSelection();

    if (selection) {
      applyHighlight(COLORS[0]);
    }
  }
});

function scrollToHighlightElement(uuid) {
  const highlightElements = document.querySelectorAll(`[data-id="${uuid}"]`);

  if (highlightElements.length === 0) {
    return false;
  }

  const firstElement = highlightElements[0];

  firstElement.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  highlightElements.forEach((element) => {
    element.classList.add("highlight-flash");
    setTimeout(() => {
      element.classList.remove("highlight-flash");
    }, 2000);
  });

  return true;
}

let lastUrl = location.href;

function restoreHighlights() {
  getHighlights({
    payload: location.href,
    onSuccess: (highlights) => renderAllHighlights(highlights),
    onError: (error) => console.error(error),
  });
}

function renderAllHighlights(highlights) {
  if (!highlights || highlights.length === 0) return;

  highlights.forEach((highlight, index) => {
    setTimeout(() => {
      renderSingleHighlight(highlight);
    }, index * 50);
  });
}

function renderSingleHighlight(highlight) {
  const restoredhighlight = restoreHighlightData(highlight);
  const restoredNote = highlight.note;

  if (restoredhighlight && restoredNote) {
    const allElements = document.querySelectorAll(
      `[data-id="${highlight.uuid}"]`
    );
    allElements.forEach((element) => {
      element.dataset.note = restoredNote;
    });
  }
}

function urlChangeDetection() {
  const urlChangeObserver = new MutationObserver(() => {
    const currentUrl = location.href;

    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      renderAllHighlights();
    }
  });

  urlChangeObserver.observe(document, {
    subtree: true,
    childList: true,
  });
}

function highlightCreation() {
  document.addEventListener("mouseup", (e) => {
    if (e.target.closest(".toolbar") || e.target.closest(".note-editor"))
      return;

    handleHighlighting();
  });
}

function retryRestoreHighlights() {
  [0, 1000, 2000, 3000].forEach((delay) => {
    setTimeout(restoreHighlights, delay);
  });
}

retryRestoreHighlights();
urlChangeDetection();
highlightCreation();
