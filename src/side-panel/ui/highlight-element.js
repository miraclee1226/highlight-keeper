import { formatDate, escapeHtml } from "../utils/formatter.js";

export function createHighlightElement(highlight) {
  const element = document.createElement("div");
  element.className = "note";
  element.dataset.id = highlight.uuid;

  const date = new Date(highlight.createdAt);
  const formattedDate = formatDate(date);
  const highlightColor = highlight.color;
  const highlightText = highlight.selection?.text ?? "No text";
  const noteText = highlight.note ?? "";

  element.innerHTML = highlightHTML({
    formattedDate,
    highlightColor,
    highlightText,
    noteText,
  });

  return element;
}

function highlightHTML({
  formattedDate,
  highlightColor,
  highlightText,
  noteText,
}) {
  return `
    <div class="note__header">
      <span class="note__date">${formattedDate}</span>
      <div class="note__highlight">
        <div class="note__dot" style="background-color: ${highlightColor};"></div>
        <p class="note__text--highlight">
          ${escapeHtml(highlightText)}
        </p>
      </div>
    </div>
    ${noteText.trim() ? createMemoHTML(noteText) : ""}
  `;
}

function createMemoHTML(noteText) {
  return `
    <div class="note__memo">
      <div class="note__marker"></div>
      <p class="note__text">
        ${escapeHtml(noteText)}
      </p>
    </div>
  `;
}

export function updateHighlightNote(element, noteText) {
  const existingMemo = element.querySelector(".note__memo");
  const hasNote = noteText && noteText.trim();

  if (hasNote) {
    if (existingMemo) {
      const noteTextElement = existingMemo.querySelector(".note__text");
      noteTextElement.textContent = noteText;
    } else {
      const memoHTML = createMemoHTML(noteText);
      element.insertAdjacentHTML("beforeend", memoHTML);
    }
  } else {
    if (existingMemo) {
      existingMemo.remove();
    }
  }
}

export function updateHighlightColor(element, dotColor) {
  const dot = element.querySelector(".note__dot");
  if (dot) {
    dot.style.backgroundColor = dotColor;
  }
}
