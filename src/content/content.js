import { Notification } from "../components";
import { applyHighlight, restoreHighlight } from "./modules/highlighter";
import { isSelectionOverlappingHighlight } from "./modules/overlap-detector";
import { addNoteIcon } from "./modules/note-icon";

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
    }, index * 100);
  });
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

  const overlapResult = isSelectionOverlappingHighlight(selection);

  if (!overlapResult) {
    applyHighlight(selection);
    selection.removeAllRanges();
    return;
  }

  const hasNote =
    overlapResult.element.dataset.note &&
    overlapResult.element.dataset.note.trim().length > 0;

  if (
    hasNote &&
    [
      "encompassing",
      "overlapping",
      "starts_before_highlight",
      "ends_after_highlight",
    ].includes(overlapResult.type)
  ) {
    Notification("Cannot modify highlight with notes", { type: "error" });
    return;
  }

  if (overlapResult.type === "contained") {
    selection.removeAllRanges();
    return;
  }

  if (overlapResult.type === "overlapping") {
    const originalText = overlapResult.element.textContent;
    const textNode = document.createTextNode(originalText);

    overlapResult.element.parentNode.replaceChild(
      textNode,
      overlapResult.element
    );

    applyHighlight(selection);

    selection.removeAllRanges();
  }

  if (overlapResult.type === "starts_before_highlight") {
    const highlightElement = overlapResult.element;
    const highlightText = highlightElement.textContent;

    const expandedRange = selection.getRangeAt(0).cloneRange();
    const textNode = document.createTextNode(highlightText);

    highlightElement.parentNode.replaceChild(textNode, highlightElement);

    expandedRange.setStart(
      selection.getRangeAt(0).startContainer,
      selection.getRangeAt(0).startOffset
    );
    expandedRange.setEndAfter(textNode);
    selection.removeAllRanges();

    selection.addRange(expandedRange);
    applyHighlight(selection);

    selection.removeAllRanges();
  }

  if (overlapResult.type === "ends_after_highlight") {
    const highlightElement = overlapResult.element;
    const highlightId = highlightElement.dataset.id;
    const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);
    const firstElement = allElements[0];

    const expandedRange = document.createRange();
    const endContainer = selection.getRangeAt(0).endContainer;
    const endOffset = selection.getRangeAt(0).endOffset;

    expandedRange.setStartBefore(firstElement);
    expandedRange.setEnd(endContainer, endOffset);

    allElements.forEach((element) => {
      const textNode = document.createTextNode(element.textContent);
      const parentNode = element.parentNode;

      element.parentNode.replaceChild(textNode, element);
      parentNode.normalize();
    });

    selection.removeAllRanges();

    selection.addRange(expandedRange);
    applyHighlight(selection);

    selection.removeAllRanges();
  }
}
