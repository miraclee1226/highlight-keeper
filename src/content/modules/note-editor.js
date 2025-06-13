let noteEditorScrollHandler = null;

export function openNoteEditor(highlightElement, editMode = true) {
  const existingEditor = document.querySelector(".note-editor");

  if (existingEditor) {
    existingEditor.remove();
  }

  const noteEditor = createNoteEditor(highlightElement);
  const currentNote = highlightElement.dataset.note || "";
  const title = createTitle();

  noteEditor.appendChild(title);

  if (editMode) {
    setupEditMode(noteEditor, highlightElement, currentNote);
  } else {
    setupViewMode(noteEditor, highlightElement, currentNote);
  }

  document.body.appendChild(noteEditor);

  requestAnimationFrame(() => {
    noteEditor.classList.add("note-editor--entering");
  });

  setupNoteEditorCloseHandler(noteEditor, highlightElement);
  setupNoteEditorScrollHandler();
}

function createNoteEditor(highlightElement = null) {
  const noteEditor = document.createElement("div");

  noteEditor.className = "note-editor";

  if (highlightElement) {
    positionNoteEditorBelowHighlight(highlightElement, noteEditor);
  }

  addEventStoppers(noteEditor);
  return noteEditor;
}

function positionNoteEditorBelowHighlight(highlightElement, noteEditor) {
  const rect = highlightElement.getBoundingClientRect();

  noteEditor.style.top = window.scrollY + rect.bottom + 5 + "px";
  noteEditor.style.left = window.scrollX + rect.left + "px";

  requestAnimationFrame(() => {
    const editorRect = noteEditor.getBoundingClientRect();

    if (editorRect.right > window.innerWidth) {
      noteEditor.style.left =
        window.scrollX + window.innerWidth - editorRect.width - 10 + "px";
    }

    if (editorRect.bottom > window.innerHeight) {
      noteEditor.style.top =
        window.scrollY + window.innerHeight - editorRect.height - 10 + "px";
    }
  });
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

  let isHandled = false;

  const saveAndSwitchToView = () => {
    if (isHandled) return;
    isHandled = true;

    const noteText = textarea.value.trim();

    saveNote(highlightElement, noteText);

    if (noteText) {
      switchToViewMode(noteEditor, highlightElement, noteText);
    } else {
      closeNoteEditor();
    }
  };

  textarea.addEventListener("blur", saveAndSwitchToView);
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
  ["mouseup", "mousedown", "click"].forEach((eventType) => {
    element.addEventListener(eventType, (e) => e.stopPropagation());
  });
}

export function closeNoteEditor() {
  const noteEditor = document.querySelector(".note-editor");

  if (noteEditor) {
    noteEditor.classList.add("note-editor--hiding");

    setTimeout(() => {
      if (noteEditor.parentNode) {
        noteEditor.remove();
      }
    }, 200);
  }
}

function setupNoteEditorScrollHandler() {
  if (noteEditorScrollHandler) {
    window.removeEventListener("scroll", noteEditorScrollHandler);
  }

  noteEditorScrollHandler = () => {
    closeNoteEditor();
  };

  window.addEventListener("scroll", noteEditorScrollHandler);
}

function setupNoteEditorCloseHandler(noteEditor, highlightElement) {
  const closeHandler = (e) => {
    if (
      !noteEditor.contains(e.target) &&
      !highlightElement.contains(e.target)
    ) {
      closeNoteEditor();
      document.removeEventListener("mousedown", closeHandler);
    }
  };

  document.addEventListener("mousedown", closeHandler);
}

export function saveNote(highlightElement, noteText) {
  const highlightId = highlightElement.dataset.id;
  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  if (noteText.length > 0) {
    allElements.forEach((element) => {
      element.dataset.note = noteText;
    });
  } else {
    allElements.forEach((element) => {
      delete element.dataset.note;
    });
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
