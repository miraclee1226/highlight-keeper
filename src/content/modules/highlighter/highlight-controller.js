import {
  captureSelection,
  getCurrentSelection,
  clearCurrentSelection,
  hasCurrentSelection,
} from "./selection-manager.js";
import {
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
import { generateId } from "../../../utils/id-generator.js";

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

  const highlightId = generateId();
  const highlightElements = applyUnifiedHighlight(
    selection.range,
    highlightId,
    color
  );

  saveHighlight({
    payload: { originalDOMInfo, highlightId, color },
    onSuccess: () => {},
    onError: (error) => {
      console.error(error);
    },
  });

  clearCurrentSelection();

  return highlightElements ? highlightElements[0] : null;
}

export function removeHighlight(highlightElement) {
  const highlightId = highlightElement.dataset.id;

  if (!highlightId) return;

  deleteHighlight({
    payload: { highlightId },
    onSuccess: () => {
      removeAllHighlightElements(highlightId);
    },
    onError: (error) => {
      console.error(error);
    },
  });
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
