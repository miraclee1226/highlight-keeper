import { createHighlightElement } from "./side-panel-renderer.js";

const container = document.querySelector(".container");

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

export function addHighlightToList(highlightData) {
  const emptyState = container.querySelector(".no-highlights");
  if (emptyState) {
    container.innerHTML = "";
  }

  const highlightElement = createHighlightElement(highlightData);

  container.appendChild(highlightElement);
}

export function updateHighlightInList(updateData) {
  const highlightElement = container.querySelector(
    `[data-id="${updateData.uuid}"]`
  );
  const noteText = updateData.note;
  const dotColor = updateData.color;

  if (!highlightElement) return;

  if (noteText !== undefined) {
    updateNoteSection(highlightElement, noteText);
  }

  if (dotColor) {
    updateColorDot(highlightElement, dotColor);
  }
}

function updateNoteSection(highlightElement, noteText) {
  const existingMemo = highlightElement.querySelector(".note__memo");
  const hasNote = noteText && noteText.trim();

  if (hasNote) {
    if (existingMemo) {
      const noteTextElement = existingMemo.querySelector(".note__text");
      noteTextElement.textContent = noteText;
    } else {
      const memoHTML = `
        <div class="note__memo">
          <div class="note__marker"></div>
          <p class="note__text">${noteText}</p>
        </div>
      `;

      highlightElement.insertAdjacentHTML("beforeend", memoHTML);
    }
  } else {
    if (existingMemo) {
      existingMemo.remove();
    }
  }
}

function updateColorDot(highlightElement, dotColor) {
  const dot = highlightElement.querySelector(".note__dot");
  if (dot) {
    dot.style.backgroundColor = dotColor;
  }
}

export function removeHighlightFromList(uuid) {
  const highlightElement = container.querySelector(`[data-id="${uuid}"]`);

  setTimeout(() => {
    highlightElement.remove();

    const remainingHighlights = container.querySelectorAll(".note");
    if (remainingHighlights.length === 0) {
      displayEmptyState();
    }
  }, 500);
}
