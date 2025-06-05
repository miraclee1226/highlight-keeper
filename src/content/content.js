import {
  handleHighlighting,
  restoreHighlightData,
} from "./modules/highlighter";

function restoreHighlights() {
  chrome.runtime.sendMessage(
    {
      action: "get_highlights",
      payload: location.href,
    },
    (response) => {
      if (response.action === "get_success") {
        renderAllHighlights(response.data);
      } else if (response.action === "get_error") {
        console.error("Failed to get highlights:", response.error);
      }
    }
  );
}

function safeExecute(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

safeExecute(restoreHighlights);

window.addEventListener("load", () => {
  setTimeout(() => restoreHighlights(), 1000);
});

safeExecute(() => {
  document.addEventListener("mouseup", (e) => {
    if (e.target.closest(".toolbar") || e.target.closest(".note-editor"))
      return;

    handleHighlighting();
  });
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
  if (request.action === "get_success") {
    renderAllHighlights(request.data);
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
}
