import { formatDate, escapeHtml } from "../../utils/formatter.js";

export function createHighlightElement(highlight) {
  const element = document.createElement("div");
  const date = new Date(highlight.createdAt);
  const formattedDate = formatDate(date);
  const highlightColor = highlight.color;
  const highlightText = highlight.selection?.text ?? "No text";
  const noteText = highlight.note ?? "";

  element.className = "highlight-item__wrapper";
  element.dataset.id = highlight.uuid;
  element.innerHTML = createHighlightHTML({
    formattedDate,
    highlightColor,
    highlightText,
    noteText,
  });

  return element;
}

function createHighlightHTML({
  formattedDate,
  highlightColor,
  highlightText,
  noteText,
}) {
  return `
    <div class="highlight-item">
      <span class="highlight-item__date">${formattedDate}</span>
      <div class="highlight-item__content">
        <div class="highlight-item__dot" style="background-color: ${highlightColor};"></div>
        <p class="highlight-item__highlight-text">
          ${escapeHtml(highlightText)}
        </p>
      </div>
    </div>
    ${noteText.trim() ? createNoteHTML(noteText) : ""}
  `;
}

function createNoteHTML(noteText) {
  return `
    <div class="highlight-item__note">
      <div class="highlight-item__note-marker"></div>
      <p class="highlight-item__note-text">
        ${escapeHtml(noteText)}
      </p>
    </div>
  `;
}

export function updateHighlightNote(element, noteText) {
  const existingMemo = element.querySelector(".highlight-item__note");
  const hasNote = noteText && noteText.trim();

  if (hasNote) {
    if (existingMemo) {
      const noteTextElement = existingMemo.querySelector(
        ".highlight-item__note-text"
      );
      noteTextElement.textContent = noteText;
    } else {
      const memoHTML = createNoteHTML(noteText);
      element.insertAdjacentHTML("beforeend", memoHTML);
    }
  } else {
    if (existingMemo) {
      existingMemo.remove();
    }
  }
}

export function updateHighlightColor(element, dotColor) {
  const dot = element.querySelector(".highlight-item__dot");
  if (dot) {
    dot.style.backgroundColor = dotColor;
  }
}
