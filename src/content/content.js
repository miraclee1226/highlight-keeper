import { notification } from "../components";
import { applyHighlight } from "./modules/highlighter";
import { isSelectionOverlappingHighlight } from "./modules/overlap-detector";
import { isMutiParagraphSelection } from "./modules/range-validator";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "start_highlight") {
    document.addEventListener("mouseup", handleHighlighting);
    sendResponse({ status: "highlighting_started" });
  }
});

function handleHighlighting() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  if (selection.toString().trim().length === 0) return;

  if (isMutiParagraphSelection(range)) {
    selection.removeAllRanges();
    notification("Multi-paragraph selection is not supported");
    return;
  }

  const overlapResult = isSelectionOverlappingHighlight(selection);

  if (!overlapResult) {
    applyHighlight(selection);
    selection.removeAllRanges();
    return;
  }

  if (overlapResult.type === "contained") {
    selection.removeAllRanges();
    return;
  }

  if (overlapResult.type === "encompassing" && overlapResult.hasNote) {
    selection.removeAllRanges();
    notification("Cannot modify highlight with notes");
    return;
  }

  if (overlapResult.type === "overlapping") {
    if (overlapResult.hasNote) {
      selection.removeAllRanges();
      notification("Cannot modify highlight with notes");
      return;
    } else {
      const originalText = overlapResult.element.textContent;
      const textNode = document.createTextNode(originalText);

      overlapResult.element.parentNode.replaceChild(
        textNode,
        overlapResult.element
      );

      applyHighlight(selection);
      selection.removeAllRanges();
    }
  }

  if (overlapResult.type === "starts_before_highlight") {
    if (overlapResult.hasNote) {
      selection.removeAllRanges();
      notification("Cannot modify highlight with notes");
      return;
    }

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
    if (overlapResult.hasNote) {
      selection.removeAllRanges();
      notification("Cannot modify highlight with notes");
      return;
    }

    const highlightElement = overlapResult.element;
    const highlightText = highlightElement.textContent;
    const expandedRange = selection.getRangeAt(0).cloneRange();
    const textNode = document.createTextNode(highlightText);

    highlightElement.parentNode.replaceChild(textNode, highlightElement);
    expandedRange.setStartBefore(textNode);
    expandedRange.setEnd(
      selection.getRangeAt(0).endContainer,
      selection.getRangeAt(0).endOffset
    );

    selection.removeAllRanges();
    selection.addRange(expandedRange);
    applyHighlight(selection);
    selection.removeAllRanges();
  }
}
