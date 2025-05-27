import { Notification } from "../components";
import { applyHighlight } from "./modules/highlighter";
import { isSelectionOverlappingHighlight } from "./modules/overlap-detector";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "start_highlight") {
    document.addEventListener("mouseup", handleHighlighting);
    sendResponse({ status: "highlighting_started" });
  }
});

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
    Notification("Cannot modify highlight with notes");
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
