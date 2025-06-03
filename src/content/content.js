import { applyHighlight, restoreHighlight } from "./modules/highlighter";
import { addNoteIcon } from "./modules/note-icon";
import { createHighlightToolbar } from "./modules/toolbar";

function restoreHighlights() {
  chrome.runtime.sendMessage(
    {
      action: "get_highlights",
      payload: location.href,
    },
    (response) => {
      if (response.action === "get_success") {
        renderHighlights(response.data);
      } else if (response.action === "get_error") {
        console.error("Failed to get highlights:", response.error);
      }
    }
  );
}

window.addEventListener("load", () => {
  restoreHighlights();
});

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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "start_highlight") {
    document.addEventListener("mouseup", handleHighlighting);
    sendResponse({ status: "highlighting_started" });
  }

  if (request.action === "get_success") {
    renderHighlights(request.data);
    sendResponse({ status: "rendered" });
  }

  if (request.action === "get_error") {
    console.error("Failed to get highlights:", request.error);
    sendResponse({ status: "error" });
  }

  if (request.action === "scroll_to_highlight") {
    scrollToHighlightElement(request.payload);
    sendResponse({ status: "scrolled" });
  }
});

function renderHighlights(highlights) {
  if (!highlights || highlights.length === 0) return;

  highlights.forEach((highlight, index) => {
    setTimeout(() => {
      renderSinglehighlight(highlight);
    }, index * 100);
  });
}

function renderSinglehighlight(highlight) {
  const success = restoreHighlight(highlight);

  if (success && highlight.note) {
    const highlightElements = document.querySelectorAll(
      `[data-id="${highlight.uuid}"]`
    );

    if (highlightElements.length > 0) {
      addNoteIcon(highlightElements[0]);

      highlightElements.forEach((element) => {
        element.dataset.note = highlight.note;
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
}

function handleHighlighting() {
  const selection = window.getSelection();

  if (selection.toString().trim().length === 0) return;

  const highlightElement = applyHighlight(selection);

  if (highlightElement) {
    createHighlightToolbar(highlightElement);
  }

  selection.removeAllRanges();
}
