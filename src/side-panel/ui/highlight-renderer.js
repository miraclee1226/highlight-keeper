import {
  createHighlightElement,
  updateHighlightNote,
  updateHighlightColor,
} from "./highlight-element.js";

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
    element.remove();
  }

  const remaining = container.querySelectorAll(".note");
  if (remaining.length === 0) {
    showEmptyState(container);
  }
}

export function showEmptyState(container) {
  container.innerHTML = `
    <div class="no-highlights">
      <p>No highlights saved for this page yet.</p>
      <p>Drag text to start highlighting!</p>
    </div>
  `;
}

export function showError(container, message) {
  container.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
      <p>Please try refreshing the page.</p>
    </div>
  `;
}
