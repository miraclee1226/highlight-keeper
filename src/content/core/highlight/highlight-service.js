import {
  createHighlight as createHighlightBridge,
  updateHighlight as updateHighlightBridge,
  deleteHighlight as deleteHighlightBridge,
} from "../../../bridge/highlight-bridge.js";
import { getOriginalDOMInfo } from "../../utils/dom-utils.js";
import { generateId } from "../../utils/id-generator.js";
import {
  renderHighlight,
  removeHighlightFromDOM,
} from "./highlight-renderer.js";

export async function createHighlight(selection, color) {
  try {
    const highlightId = generateId();
    const domInfo = getOriginalDOMInfo(selection.range, selection.text);

    if (!domInfo) {
      throw new Error("Failed to get DOM info");
    }

    const highlightData = {
      uuid: highlightId,
      href: window.location.href,
      selection: domInfo,
      color,
      note: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await createHighlightBridge(highlightData);
    const elements = renderHighlight(selection.range, highlightId, color);

    return { elements, highlightData };
  } catch (error) {
    console.error("Failed to create highlight:", error);
    return null;
  }
}

export async function updateHighlight(highlightId, updates) {
  try {
    const elements = document.querySelectorAll(`[data-id="${highlightId}"]`);

    if (updates.color) {
      elements.forEach((el) => {
        el.style.backgroundColor = updates.color;
      });
    }

    if (updates.note !== undefined) {
      elements.forEach((el) => {
        if (updates.note.trim()) {
          el.dataset.note = updates.note;
        } else {
          delete el.dataset.note;
        }
      });
    }

    await updateHighlightBridge(highlightId, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Failed to update highlight:", error);
  }
}

export async function deleteHighlight(highlightId) {
  try {
    removeHighlightFromDOM(highlightId);
    await deleteHighlightBridge(highlightId);
  } catch (error) {
    console.error("Failed to delete highlight:", error);
  }
}

export function scrollToHighlight(highlightId) {
  const elements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  if (elements.length === 0) return false;

  const firstElement = elements[0];
  firstElement.scrollIntoView({ behavior: "smooth", block: "center" });

  elements.forEach((element) => {
    element.classList.add("highlight-flash");
    setTimeout(() => element.classList.remove("highlight-flash"), 2000);
  });
}
