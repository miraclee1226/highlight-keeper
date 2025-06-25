import {
  createHighlightElement,
  updateHighlightNote,
  updateHighlightColor,
} from "../templates/highlight-template.js";
import { emptyStateHTML } from "../templates/empty-state-template.js";
import { errorStateHTML } from "../templates/error-state-template.js";

export function renderHighlights(container, highlights) {
  if (highlights.length === 0) {
    showEmptyState(container);
    return;
  }

  container.innerHTML = "";
  highlights.forEach((highlight) => {
    const element = createHighlightElement(highlight);
    container.appendChild(element);
  });
}

export function addHighlight(container, highlightData) {
  const emptyState = container.querySelector(".no-highlights");
  if (emptyState) {
    container.innerHTML = "";
  }

  const element = createHighlightElement(highlightData);
  container.appendChild(element);
}

export function updateHighlight(container, updateData) {
  const element = container.querySelector(`[data-id="${updateData.uuid}"]`);
  if (!element) return;

  if (updateData.note !== undefined) {
    updateHighlightNote(element, updateData.note);
  }

  if (updateData.color) {
    updateHighlightColor(element, updateData.color);
  }
}

export function removeHighlight(container, uuid) {
  const element = container.querySelector(`[data-id="${uuid}"]`);
  if (element) {
    element.style.opacity = "0";
    element.style.transform = "translateX(-100%)";

    setTimeout(() => {
      element.remove();

      const remaining = container.querySelectorAll(".note");
      if (remaining.length === 0) {
        showEmptyState(container);
      }
    }, 300);
  }
}

export function showEmptyState(container) {
  container.innerHTML = emptyStateHTML();
}

export function showError(container, message) {
  container.innerHTML = errorStateHTML(message);
}
