import { COLORS } from "../constant/colors";

function loadCurrentPageHighlights() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.runtime.sendMessage(
        {
          action: "get_highlights",
          payload: tabs[0].url,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            displayError("Runtime error: " + chrome.runtime.lastError.message);
            return;
          }

          if (!response) {
            displayError("No response from background script");
            return;
          }

          if (response.action === "get_success") {
            displayHighlights(response.data);
          } else if (response.action === "get_error") {
            displayError("Failed to get highlights: " + response.error);
          } else {
            displayError("Unexpected response format");
          }
        }
      );
    } else {
      displayError("No active tab found");
    }
  });
}

loadCurrentPageHighlights();

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

  const highlightColor = highlight.color || COLORS[0];
  const highlightText = highlight.selection?.text || "No text";
  const noteText = highlight.note || "";

  noteDiv.innerHTML = `
      <div class="note__header">
        <span class="note__date">${formattedDate} saved</span>
        <div class="note__highlight">
          <div class="note__dot" style="background-color: ${highlightColor};"></div>
          <p class="note__text--highlight" title="${escapeHtml(highlightText)}">
            ${escapeHtml(highlightText)}
          </p>
        </div>
      </div>
      ${
        noteText.trim()
          ? `
      <div class="note__memo">
        <div class="note__marker"></div>
        <p class="note__text" title="${escapeHtml(noteText)}">
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

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function escapeHtml(text) {
  if (!text) return "";

  const div = document.createElement("div");

  div.textContent = text;

  const escapedText = div.innerHTML;

  return escapedText.replace(/\n/g, "<br>");
}

function scrollToHighlight(uuid) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "scroll_to_highlight",
      payload: uuid,
    });
  });

  window.close();
}

function displayError(errorMessage) {
  const highlightsContainer = document.querySelector(".highlights");
  const countElement = document.querySelector(".count");

  if (countElement) {
    countElement.textContent = "Saved Highlights: 0";
  }

  if (highlightsContainer) {
    highlightsContainer.innerHTML = `
      <div class="error-message">
        <p>Failed to load highlights.</p>
        <p style="font-size: 12px; color: #666;">${errorMessage}</p>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}
