import { getHighlights } from "../../bridge/highlight-bridge.js";
import { RETRY_DELAYS } from "../../constant/index.js";
import {
  getRangeFromRelativeOffset,
  renderHighlight,
} from "../utils/dom-utils.js";

export class HighlightRestorer {
  async restore(url) {
    try {
      const highlights = await getHighlights(url);

      if (!highlights) return;

      await this.waitForContentReady();

      RETRY_DELAYS.forEach((delay) => {
        setTimeout(() => {
          highlights.forEach((highlight) => {
            this.restoreHighlight(highlight);
          });
        }, delay);
      });
    } catch (error) {
      console.error("Failed to restore highlights:", error);
    }
  }

  async waitForContentReady() {
    const root = document.getElementById("root");

    if (root) {
      if (root.children.length > 0) return;

      return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve();
        });
        const config = { childList: true, subtree: true };

        observer.observe(root, config);

        setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 10000);
      });
    }

    if (document.readyState !== "complete") {
      return new Promise((resolve) =>
        window.addEventListener("load", resolve, { once: true })
      );
    }
  }

  restoreHighlight(highlight) {
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

      return elements.length > 0;
    } catch (error) {
      return false;
    }
  }
}
