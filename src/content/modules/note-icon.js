import { openNoteEditor } from "./note-editor";

export function addNoteIcon(highlightElement) {
  const existingIcon = document.querySelector(
    `button.note-icon[data-highlight-id="${highlightElement.dataset.id}"]`
  );

  if (existingIcon) return;

  const noteIcon = createNoteIcon(highlightElement);
  document.body.appendChild(noteIcon);

  noteIcon.addEventListener("click", function (e) {
    e.stopPropagation();
    openNoteEditor(highlightElement, false);
  });

  const updatePosition = () =>
    updateNoteIconPosition(highlightElement, noteIcon);
  window.addEventListener("scroll", updatePosition);
  window.addEventListener("resize", updatePosition);
}

function createNoteIcon(highlightElement) {
  const noteIcon = document.createElement("button");
  const img = document.createElement("img");

  img.src = chrome.runtime.getURL("/public/icons/note.svg");
  img.alt = "Note Icon";
  noteIcon.appendChild(img);

  noteIcon.className = "note-icon";
  noteIcon.dataset.highlightId = highlightElement.dataset.id;

  updateNoteIconPosition(highlightElement, noteIcon);

  return noteIcon;
}

export function removeNoteIcon(highlightElement) {
  if (highlightElement.dataset.id) {
    const noteIcon = document.querySelector(
      `.note-icon[data-highlight-id="${highlightElement.dataset.id}"]`
    );

    if (noteIcon) {
      noteIcon.remove();
      delete highlightElement.dataset.note;
    }
  }
}

export function updateNoteIconPosition(highlightElement, noteIcon) {
  const rect = highlightElement.getBoundingClientRect();
  noteIcon.style.top = window.scrollY + rect.top - 20 + "px";
  noteIcon.style.left = window.scrollX + rect.right - 3 + "px";
}
