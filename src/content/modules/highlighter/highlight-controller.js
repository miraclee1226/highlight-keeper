import {
  captureSelection,
  getCurrentSelection,
  clearCurrentSelection,
  hasCurrentSelection,
} from "./selection-manager.js";
import {
  generateHighlightId,
  applyUnifiedHighlight,
  removeAllHighlightElements,
} from "./highlight-renderer.js";
import {
  saveHighlight,
  updateHighlight,
  deleteHighlight,
} from "../../../api/highlight.js";
import { getOriginalDOMInfo, getRangeFromRelativeOffset } from "./dom-utils.js";
import { createInitialToolbar } from "./../toolbar.js";

export function handleHighlighting() {
  const selection = captureSelection();

  if (!selection) return;

  createInitialToolbar(selection);
}

export function applyHighlight(color) {
  if (!hasCurrentSelection()) return null;

  const selection = getCurrentSelection();
  const windowSelection = window.getSelection();

  if (windowSelection.rangeCount > 0) {
    windowSelection.removeAllRanges();
  }

  const originalDOMInfo = getOriginalDOMInfo(selection.range, selection.text);

  if (!originalDOMInfo) return null;

  const highlightId = generateHighlightId();
  const highlightElements = applyUnifiedHighlight(
    selection.range,
    highlightId,
    color
  );

  saveHighlight(originalDOMInfo, highlightId, color);

  clearCurrentSelection();

  return highlightElements ? highlightElements[0] : null;
}

export function removeHighlight(highlightElement) {
  const highlightId = highlightElement.dataset.id;

  if (!highlightId) return;

  deleteHighlight(highlightId);
  removeAllHighlightElements(highlightId);
}

export function updateHighlightColor(highlightId, newColor) {
  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  allElements.forEach((element) => {
    element.style.backgroundColor = newColor;
  });

  updateHighlight(highlightId, { color: newColor });
}

export function restoreHighlightData(highlightData) {
  const selection = highlightData.selection;
  const startElement = document.querySelector(selection.startContainerPath);
  const endElement = document.querySelector(selection.endContainerPath);
  const startOffset = selection.startOffset;
  const endOffset = selection.endOffset;

  if (!startElement || !endElement) return false;

  const range = getRangeFromRelativeOffset(
    startElement,
    endElement,
    startOffset,
    endOffset
  );

  if (!range) return false;

  applyUnifiedHighlight(range, highlightData.uuid, highlightData.color);

  return true;
}
