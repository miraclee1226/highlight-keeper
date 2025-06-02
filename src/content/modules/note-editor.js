import { addNoteIcon, removeNoteIcon } from "./note-icon.js";
import { Button } from "../../components/index.js";

export function openNoteEditor(highlightElement, editMode = true) {
  removeExistingEditor();

  const noteEditor = createNoteEditor(highlightElement);
  const currentNote = highlightElement.dataset.note || "";
  const title = createTitle(editMode ? "Edit Note" : "Note");

  noteEditor.appendChild(title);

  if (editMode) {
    setupEditMode(noteEditor, highlightElement, currentNote);
  } else {
    setupViewMode(noteEditor, highlightElement, currentNote);
  }

  document.body.appendChild(noteEditor);
  adjustEditorPosition(noteEditor);

  editorCloseHandler(noteEditor, highlightElement);
}

function removeExistingEditor() {
  const existingEditor = document.querySelector(".note-editor");

  if (existingEditor) {
    existingEditor.remove();
  }
}

function createNoteEditor(highlightElement) {
  const noteEditor = document.createElement("div");

  noteEditor.className = "note-editor";

  positionNoteEditor(highlightElement, noteEditor);
  addEventStoppers(noteEditor);

  return noteEditor;
}

function positionNoteEditor(highlightElement, noteEditor) {
  const rect = highlightElement.getBoundingClientRect();

  noteEditor.style.top = window.scrollY + rect.bottom + 5 + "px";
  noteEditor.style.left = window.scrollX + rect.left + "px";
}

function adjustEditorPosition(noteEditor) {
  const editorRect = noteEditor.getBoundingClientRect();

  if (editorRect.right > window.innerWidth) {
    noteEditor.style.left =
      window.scrollX + window.innerWidth - editorRect.width - 10 + "px";
  }

  if (editorRect.bottom > window.innerHeight) {
    noteEditor.style.top =
      window.scrollY + window.innerHeight - editorRect.height - 10 + "px";
  }
}

function createTitle(text) {
  const title = document.createElement("h3");

  title.className = "note-editor__title";
  title.textContent = text;

  return title;
}

function createButton() {
  const buttonContainer = document.createElement("div");

  buttonContainer.className = "note-editor__button-container";

  return buttonContainer;
}

function setupEditMode(noteEditor, highlightElement, currentNote) {
  const textarea = createTextarea(currentNote);
  const buttonContainer = createButton();

  noteEditor.appendChild(textarea);

  const cancelButton = Button("Cancel", { variant: "secondary" }, () => {
    noteEditor.remove();
  });

  const saveButton = Button("Save", { variant: "primary" }, () => {
    const noteText = textarea.value.trim();

    saveNote(highlightElement, noteText);
    noteEditor.remove();
  });

  buttonContainer.append(cancelButton, saveButton);
  noteEditor.appendChild(buttonContainer);

  textarea.focus();
}

function setupViewMode(noteEditor, highlightElement, currentNote) {
  const noteDisplay = createNoteDisplay(currentNote);
  const hintText = createHintText();
  const buttonContainer = createButton();

  noteEditor.appendChild(noteDisplay);

  noteDisplay.addEventListener("dblclick", (e) => {
    e.stopPropagation();

    noteEditor.remove();
    openNoteEditor(highlightElement, true);
  });

  noteEditor.appendChild(hintText);

  const deleteButton = Button("Delete", { variant: "danger" }, () => {
    const highlightId = highlightElement.dataset.id;

    chrome.runtime.sendMessage({
      action: "update_highlight",
      payload: {
        uuid: highlightId,
        data: {
          note: "",
          updatedAt: Date.now(),
        },
      },
    });

    removeNoteIcon(highlightId);
    noteEditor.remove();
  });

  buttonContainer.appendChild(deleteButton);
  noteEditor.appendChild(buttonContainer);
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

function editorCloseHandler(noteEditor, highlightElement, updatePosition) {
  const closeEditor = (e) => {
    if (
      !noteEditor.contains(e.target) &&
      !highlightElement.contains(e.target)
    ) {
      noteEditor.remove();
      document.removeEventListener("click", closeEditor);
    }
  };

  document.addEventListener("click", closeEditor);
}

export function saveNote(highlightElement, noteText) {
  const highlightId = highlightElement.dataset.id;
  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  if (noteText.length > 0) {
    allElements.forEach((element) => {
      element.dataset.note = noteText;
    });
    addNoteIcon(highlightElement);
  } else {
    allElements.forEach((element) => {
      delete element.dataset.note;
    });
    removeNoteIcon(highlightElement);
  }

  chrome.runtime.sendMessage({
    action: "update_highlight",
    payload: {
      uuid: highlightId,
      data: {
        note: noteText,
        updatedAt: Date.now(),
      },
    },
  });
}
