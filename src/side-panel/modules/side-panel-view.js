import { createHighlightElement } from "./side-panel-renderer.js";

const container = document.querySelector(".highlights");

export function displayHighlights(highlights) {
  if (highlights.length === 0) {
    displayEmptyState();
    return;
  }

  renderHighlights(highlights);
}

function displayEmptyState() {
  container.innerHTML = `
    <div class="no-highlights">
    <p>No highlights saved for this page yet.</p>
      <p>Drag text to start highlighting!</p>
    </div>
  `;
}

function renderHighlights(highlights) {
  const sortedHighlights = highlights.sort((a, b) => a.createdAt - b.createdAt);

  container.innerHTML = "";

  sortedHighlights.forEach((highlight) => {
    const noteElement = createHighlightElement(highlight);
    container.appendChild(noteElement);
  });
}

export function displayError(errorMessage) {
  container.innerHTML = `
    <div class="error-message">
      <p>${errorMessage}</p>
      <p>Please try refreshing the page.</p>
    </div>
  `;
}
