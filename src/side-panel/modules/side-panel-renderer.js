import { escapeHtml, formatDate } from "../../utils/formatter.js";
import { scrollToHighlight } from "../../api/highlight.js";

export function createHighlightElement(highlight) {
  const noteDiv = document.createElement("div");
  noteDiv.className = "note";
  noteDiv.dataset.id = highlight.uuid;

  const date = new Date(highlight.createdAt);
  const formattedDate = formatDate(date);

  const highlightColor = highlight.color;
  const highlightText = highlight.selection?.text ?? "No text";
  const noteText = highlight.note ?? "";

  noteDiv.innerHTML = createHighlightHTML({
    formattedDate,
    highlightColor,
    highlightText,
    noteText,
  });

  noteDiv.addEventListener("click", () => {
    scrollToHighlight({
      payload: highlight.uuid,
      onSuccess: () => {},
      onError: () => {},
    });
  });

  return noteDiv;
}

function createHighlightHTML({
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
