import { renderHighlight } from "./highlight-renderer.js";
import { getHighlights } from "../../../bridge/highlight-bridge.js";
import { getRangeFromRelativeOffset } from "../../utils/dom-utils.js";

let lastUrl = location.href;

export async function restorePageHighlights() {
  try {
    const highlights = await getHighlights(location.href);

    if (!highlights || highlights.length === 0) return;

    let restored = false;
    const attempts = [0, 1000, 2000, 3000];

    attempts.forEach((attempt) => {
      setTimeout(() => {
        if (!restored) {
          highlights.forEach((highlight) => {
            restoreHighlight(highlight);
          });

          restored = true;
        }
      }, attempt);
    });
  } catch (error) {
    console.error("Failed to restore highlights:", error);
  }
}

export function setupUrlChangeDetection() {
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(restorePageHighlights, 500);
    }
  });

  observer.observe(document, { subtree: true, childList: true });
}

function restoreHighlight(highlightData) {
  const { selection } = highlightData;

  const startElement = document.querySelector(selection.startContainerPath);
  const endElement = document.querySelector(selection.endContainerPath);

  if (!startElement || !endElement) return false;

  const range = getRangeFromRelativeOffset(
    startElement,
    endElement,
    selection.startOffset,
    selection.endOffset
  );

  if (!range) return false;

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
}
