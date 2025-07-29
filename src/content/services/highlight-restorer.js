import { getHighlights } from "../../bridge/highlight-bridge.js";
import {
  getRangeFromRelativeOffset,
  renderHighlight,
} from "../utils/dom-utils.js";

export class HighlightRestorer {
  constructor() {
    this.isRestoring = false;
    this.restoredHighlights = new Set();
  }

  async restore(url) {
    if (this.isRestoring) return;

    try {
      this.isRestoring = true;
      const highlights = await getHighlights(url);

      if (!highlights) return;

      await this.waitForDOMReady();
      this.attemptRestore(highlights);
    } catch (error) {
      console.error("Failed to restore highlights:", error);
    } finally {
      this.isRestoring = false;
    }
  }

  async waitForDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", resolve);
      }
    });
  }

  attemptRestore(highlights) {
    const retryDelays = [0, 500, 1000, 2000, 4000, 6000, 8000];

    retryDelays.forEach((delay) => {
      setTimeout(() => {
        highlights.forEach((highlight) => {
          this.restoreHighlight(highlight);
        });
      }, delay);
    });
  }

  restoreHighlight(highlight) {
    if (this.isAlreadyRestored(highlight.uuid)) return true;

    try {
      const { selection } = highlight;
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

      const elements = renderHighlight(range, highlight.uuid, highlight.color);

      if (highlight.note) {
        elements.forEach((element) => {
          element.dataset.note = highlight.note;
        });
      }

      this.restoredHighlights.add(highlight.uuid);

      return elements.length > 0;
    } catch (error) {
      return false;
    }
  }

  isAlreadyRestored(highlightId) {
    return (
      this.restoredHighlights.has(highlightId) ||
      document.querySelector(`[data-id="${highlightId}"]`) !== null
    );
  }
}
