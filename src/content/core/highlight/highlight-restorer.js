import { renderHighlight } from "./highlight-renderer.js";
import { getHighlights } from "../../../bridge/highlight-bridge.js";
import { getRangeFromRelativeOffset } from "../../utils/dom-utils.js";

let isRestoring = false;

export async function restorePageHighlights() {
  if (isRestoring) return;

  try {
    isRestoring = true;

    const highlights = await getHighlights(location.href);

    if (!highlights || highlights.length === 0) return;

    await waitForDOMReady();
    attemptRestore(highlights);
  } catch (error) {
    console.error("Failed to restore highlights:", error);
  } finally {
    isRestoring = false;
  }
}

async function waitForDOMReady() {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve();
    } else {
      window.addEventListener("load", resolve);
    }
  });
}

function attemptRestore(highlights) {
  const attempts = [0, 500, 1000, 2000, 4000, 6000, 8000, 10000];

  attempts.forEach((delay) => {
    setTimeout(() => {
      highlights.forEach((highlight) => {
        restoreHighlight(highlight);
      });
    }, delay);
  });
}

function restoreHighlight(highlightData) {
  if (isAlreadyRestored(highlightData.uuid)) return true;

  try {
    const { selection } = highlightData;

    const startElement = document.querySelector(selection.startContainerPath);
    const endElement = document.querySelector(selection.endContainerPath);

    if (!startElement || !endElement) {
      return false;
    }

    const range = getRangeFromRelativeOffset(
      startElement,
      endElement,
      selection.startOffset,
      selection.endOffset
    );

    if (!range) {
      return false;
    }

    const elements = renderHighlight(
      range,
      highlightData.uuid,
      highlightData.color
    );

    if (highlightData.note) {
      elements.forEach((element) => {
        element.dataset.note = highlightData.note;
      });
    }

    return elements.length > 0;
  } catch (error) {
    return false;
  }
}

function isAlreadyRestored(highlightId) {
  return document.querySelector(`[data-id="${highlightId}"]`) !== null;
}
