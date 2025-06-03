import { addNoteIcon, removeNoteIcon } from "./note-icon.js";

export function openNoteEditor(
  highlightElement,
  toolbar = null,
  editMode = true
) {
  const existingEditor = document.querySelector(".note-editor");

  if (existingEditor) {
    existingEditor.remove();
  }

  const noteEditor = createNoteEditor(highlightElement, toolbar);
  const currentNote = highlightElement.dataset.note || "";
  const title = createTitle();

  noteEditor.appendChild(title);

  if (editMode) {
    setupEditMode(noteEditor, highlightElement, currentNote);
  } else {
    setupViewMode(noteEditor, highlightElement, currentNote);
  }

  document.body.appendChild(noteEditor);
  adjustEditorPosition(noteEditor);

  if (toolbar) {
    requestAnimationFrame(() => {
      noteEditor.classList.add("note-editor--entering");
    });
  } else {
    noteEditor.classList.add("note-editor--direct");
  }
}

function createNoteEditor(highlightElement = null, toolbar) {
  const noteEditor = document.createElement("div");

  noteEditor.className = "note-editor";

  const positionElement = toolbar || highlightElement;

  if (positionElement) {
    positionNoteEditor(positionElement, noteEditor);
  }

  addEventStoppers(noteEditor);
  return noteEditor;
}

function positionNoteEditor(positionElement, noteEditor) {
  const rect = positionElement.getBoundingClientRect();

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

function createTitle() {
  const title = document.createElement("h3");

  title.className = "note-editor__title";
  title.textContent = "Note";
  return title;
}

function setupEditMode(noteEditor, highlightElement, currentNote) {
  const textarea = createTextarea(currentNote);

  noteEditor.appendChild(textarea);
  textarea.focus();

  const saveAndSwitchToView = () => {
    const noteText = textarea.value.trim();

    saveNote(highlightElement, noteText);
    switchToViewMode(noteEditor, highlightElement, noteText);
  };

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveAndSwitchToView();
    }
  });

  textarea.addEventListener("blur", () => saveAndSwitchToView);
}

function switchToViewMode(noteEditor, highlightElement, noteText) {
  const textarea = noteEditor.querySelector(".note-editor__textarea");

  if (textarea) {
    textarea.remove();
  }

  setupViewMode(noteEditor, highlightElement, noteText);
}

function setupViewMode(noteEditor, highlightElement, currentNote) {
  const noteDisplay = createNoteDisplay(currentNote);

  noteEditor.appendChild(noteDisplay);

  noteDisplay.addEventListener("click", (e) => {
    e.stopPropagation();

    const display = noteEditor.querySelector(".note-editor__display");

    if (display) {
      display.remove();
    }

    setupEditMode(noteEditor, highlightElement, currentNote);
  });
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
    noteDisplay.textContent = "Click to add a note...";
  } else {
    noteDisplay.textContent = currentNote;
  }

  addEventStoppers(noteDisplay);

  return noteDisplay;
}

function addEventStoppers(element) {
  ["mouseup", "mousedown"].forEach((eventType) => {
    element.addEventListener(eventType, (e) => e.stopPropagation());
  });
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
