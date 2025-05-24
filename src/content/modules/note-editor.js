import { addNoteIcon, removeNoteIcon } from "./note-icon.js";
import createButton from "../../components/button.js";

const TEXTAREA_STYLES = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ddd",
  borderRadius: "4px",
};

export function openNoteEditor(highlightElement, editMode = true) {
  removeExistingEditor();

  const editorContainer = createEditorContainer(highlightElement);
  const currentNote = highlightElement.dataset.note || "";

  const title = createTitle(editMode ? "Edit Note" : "Note");
  editorContainer.appendChild(title);

  if (editMode) {
    setupEditMode(editorContainer, highlightElement, currentNote);
  } else {
    setupViewMode(editorContainer, highlightElement, currentNote);
  }

  document.body.appendChild(editorContainer);
  adjustEditorPosition(editorContainer);
  setupEditorCloseHandler(editorContainer, highlightElement);
}

function removeExistingEditor() {
  const existingEditor = document.querySelector(".note-editor");
  if (existingEditor) {
    existingEditor.remove();
  }
}

function createEditorContainer(highlightElement) {
  const rect = highlightElement.getBoundingClientRect();
  const editorContainer = document.createElement("div");
  editorContainer.className = "note-editor";

  editorContainer.style.top = window.scrollY + rect.bottom + 5 + "px";
  editorContainer.style.left = window.scrollX + rect.left + "px";

  addEventStoppers(editorContainer);

  return editorContainer;
}

function createTitle(text) {
  const title = document.createElement("h3");
  title.className = "note-editor__title";
  title.textContent = text;

  return title;
}

function createButtonContainer() {
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "note-editor__button-container";

  return buttonContainer;
}

function setupEditMode(editorContainer, highlightElement, currentNote) {
  const textarea = createTextarea(currentNote);
  editorContainer.appendChild(textarea);

  const buttonContainer = createButtonContainer();
  const cancelButton = createButton("Cancel", { variant: "secondary" }, () => {
    editorContainer.remove();
  });

  const saveButton = createButton("Save", { variant: "primary" }, () => {
    const noteText = textarea.value.trim();
    saveNote(highlightElement, noteText);
    editorContainer.remove();
  });

  buttonContainer.append(cancelButton, saveButton);
  editorContainer.appendChild(buttonContainer);

  textarea.focus();
}

function setupViewMode(editorContainer, highlightElement, currentNote) {
  const noteDisplay = createNoteDisplay(currentNote);
  editorContainer.appendChild(noteDisplay);

  noteDisplay.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    editorContainer.remove();
    openNoteEditor(highlightElement, true);
  });

  const hintText = createHintText();
  editorContainer.appendChild(hintText);

  const buttonContainer = createButtonContainer();
  const deleteButton = createButton("Delete", { variant: "danger" }, () => {
    removeNoteIcon(highlightElement);
    editorContainer.remove();
  });

  buttonContainer.appendChild(deleteButton);
  editorContainer.appendChild(buttonContainer);
}

function createTextarea(currentNote) {
  const textarea = document.createElement("textarea");
  textarea.className = "note-editor__textarea";
  textarea.value = currentNote;
  textarea.placeholder = "Add your notes here...";

  addEventStoppers(textarea);

  return textarea;
}

function createNoteDisplay(currentNote) {
  const noteDisplay = document.createElement("div");
  noteDisplay.className = "note-editor__display";

  if (!currentNote || currentNote.trim() === "") {
    noteDisplay.classList.add("note-editor__display--empty");
    noteDisplay.textContent = "No notes added yet.";
  } else {
    noteDisplay.textContent = currentNote;
  }

  addEventStoppers(noteDisplay);

  return noteDisplay;
}

function createHintText() {
  const hintText = document.createElement("p");
  hintText.className = "note-editor__hint";
  hintText.textContent = "Double-click to edit";

  return hintText;
}

function addEventStoppers(element) {
  ["mouseup", "mousedown"].forEach((eventType) => {
    element.addEventListener(eventType, (e) => e.stopPropagation());
  });
}

function adjustEditorPosition(editorContainer) {
  const editorRect = editorContainer.getBoundingClientRect();

  if (editorRect.right > window.innerWidth) {
    editorContainer.style.left =
      window.scrollX + window.innerWidth - editorRect.width - 10 + "px";
  }

  if (editorRect.bottom > window.innerHeight) {
    editorContainer.style.top =
      window.scrollY + window.innerHeight - editorRect.height - 10 + "px";
  }
}

function setupEditorCloseHandler(editorContainer, highlightElement) {
  const closeEditor = (e) => {
    if (
      !editorContainer.contains(e.target) &&
      !highlightElement.contains(e.target)
    ) {
      editorContainer.remove();
      document.removeEventListener("click", closeEditor);
    }
  };

  document.addEventListener("click", closeEditor);
}

export function saveNote(highlightElement, noteText) {
  if (noteText.length > 0) {
    highlightElement.dataset.note = noteText;
    addNoteIcon(highlightElement);
  } else {
    removeNoteIcon(highlightElement);
  }
}
