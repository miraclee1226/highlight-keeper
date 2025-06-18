import { getHighlights, scrollToHighlight } from "../api/highlight";
import { escapeHtml, formatDate } from "../utils/formatter";

async function initializeApp() {
  try {
    const highlights = await getHighlights();
    displayHighlights(highlights);
  } catch {
    displayError(error.message);
  }
}

initializeApp();

function displayHighlights(highlights) {
  const highlightsContainer = document.querySelector(".highlights");

  if (highlights.length === 0) {
    highlightsContainer.innerHTML = `
      <div class="no-highlights">
        <p>No highlights saved for this page yet.</p>
        <p>Drag text to start highlighting!</p>
      </div>
    `;
    return;
  }

  const sortedHighlights = highlights.sort((a, b) => a.createdAt - b.createdAt);

  highlightsContainer.innerHTML = "";

  sortedHighlights.forEach((highlight) => {
    const noteElement = createHighlightElement(highlight);
    highlightsContainer.appendChild(noteElement);
  });
}

function createHighlightElement(highlight) {
  const noteDiv = document.createElement("div");
  noteDiv.className = "note";

  const date = new Date(highlight.createdAt);
  const formattedDate = formatDate(date);

  const highlightColor = highlight.color;
  const highlightText = highlight.selection?.text ?? "No text";
  const noteText = highlight.note ?? "";

  noteDiv.innerHTML = `
      <div class="note__header">
        <span class="note__date">${formattedDate}</span>
        <div class="note__highlight">
          <div class="note__dot" style="background-color: ${highlightColor};"></div>
          <p class="note__text--highlight">
            ${escapeHtml(highlightText)}
          </p>
        </div>
      </div>
      ${
        noteText.trim()
          ? `
      <div class="note__memo">
        <div class="note__marker"></div>
        <p class="note__text">
          ${escapeHtml(noteText)}
        </p>
      </div>
      `
          : ""
      }
    `;

  noteDiv.addEventListener("click", () => {
    scrollToHighlight(highlight.uuid);
  });

  return noteDiv;
}

function displayError(errorMessage) {
  const highlightsContainer = document.querySelector(".highlights");

  if (highlightsContainer) {
    highlightsContainer.innerHTML = `
      <div class="error-message">
        <p>${errorMessage}</p>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}
