import { COLORS } from "../../constant/colors";
import {
  removeHighlight,
  applyHighlightWithColor,
  applyHighlightForNote,
  cancelSelection,
} from "./highlighter";
import { openNoteEditor } from "./note-editor";

export function createInitialToolbar(selection = null) {
  closeAllUI();
  createSelectionToolbar(selection);
}

export function handleHighlightClick(e) {
  e.stopPropagation();

  closeAllUI();

  const highlightElement = e.currentTarget;

  createHighlightToolbar(highlightElement);
}

function createSelectionToolbar(selection) {
  if (!selection || !selection.range) return;

  const toolbar = createToolbar(null, selection);

  addColorButtonsForSelection(toolbar);
  addNoteButtonForSelection(toolbar);
  addAIButton(toolbar);

  document.body.appendChild(toolbar);

  animateToolbarEntry(toolbar);
  setupSelectionToolbarCloseHandler();
}

function createHighlightToolbar(highlightElement) {
  const toolbar = createToolbar(highlightElement);

  addColorButtonsForHighlight(toolbar, highlightElement);
  addNoteButtonForHighlight(toolbar, highlightElement);
  addAIButton(toolbar);
  addDeleteButton(toolbar, highlightElement);

  document.body.appendChild(toolbar);

  animateToolbarEntry(toolbar);
  setupHighlightToolbarCloseHandler(highlightElement);
}

function addColorButtonsForSelection(toolbar) {
  COLORS.forEach((color) => {
    const colorButton = createColorButton(color, () => {
      applyHighlightWithColor(color);
      closeAllUI();
    });
    toolbar.appendChild(colorButton);
  });
}

function addColorButtonsForHighlight(toolbar, highlightElement) {
  const highlightId = highlightElement.dataset.id;
  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  COLORS.forEach((color) => {
    const colorButton = createColorButton(color, () => {
      allElements.forEach((element) => {
        element.style.backgroundColor = color;
      });

      chrome.runtime.sendMessage({
        action: "update_highlight",
        payload: {
          uuid: highlightId,
          data: { color: color, updatedAt: Date.now() },
        },
      });

      closeAllUI();
    });

    toolbar.appendChild(colorButton);
  });
}

function createColorButton(color, clickHandler) {
  const colorButton = document.createElement("div");

  colorButton.className = "color-palette-button";
  colorButton.style.backgroundColor = color;
  colorButton.addEventListener("click", clickHandler);

  return colorButton;
}

function addNoteButtonForSelection(toolbar) {
  const noteButton = createNoteButton("Add note", () => {
    const highlightElement = applyHighlightForNote();

    closeAllUI();

    if (highlightElement) {
      setTimeout(() => {
        openNoteEditor(highlightElement, null, true);
      }, 50);
    }
  });

  toolbar.appendChild(noteButton);
}

function addNoteButtonForHighlight(toolbar, highlightElement) {
  const noteButton = createNoteButton("Edit note", () => {
    closeAllUI();

    setTimeout(() => {
      openNoteEditor(highlightElement, null, true);
    }, 50);
  });

  toolbar.appendChild(noteButton);
}

function createNoteButton(title, clickHandler) {
  const noteButton = document.createElement("button");
  const img = document.createElement("img");

  img.src = chrome.runtime.getURL("/public/icons/note.svg");
  img.alt = "Note Icon";
  noteButton.appendChild(img);

  noteButton.className = "toolbar-note-icon";
  noteButton.title = title;
  noteButton.addEventListener("click", (e) => {
    e.stopPropagation();

    clickHandler();
  });

  return noteButton;
}

function addAIButton(toolbar) {
  const bulbButton = document.createElement("button");
  const img = document.createElement("img");

  img.src = chrome.runtime.getURL("/public/icons/bulb.svg");
  img.alt = "AI Insight Icon";
  bulbButton.appendChild(img);

  bulbButton.className = "bulb-icon";
  bulbButton.title = "AI insight (coming soon)";

  bulbButton.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllUI();
    cancelSelection();
  });

  toolbar.appendChild(bulbButton);
}

function addDeleteButton(toolbar, highlightElement) {
  const deleteButton = document.createElement("button");
  const img = document.createElement("img");

  img.src = chrome.runtime.getURL("/public/icons/delete.svg");
  img.alt = "Delete Icon";
  deleteButton.appendChild(img);

  deleteButton.className = "delete-icon";
  deleteButton.title = "Delete highlight";

  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();

    removeHighlight(highlightElement);
    closeAllUI();
  });

  toolbar.appendChild(deleteButton);
}

function createToolbar(highlightElement, selection = null) {
  const toolbar = document.createElement("div");

  toolbar.className = "toolbar";

  if (highlightElement) {
    positionToolbarAboveHighlight(highlightElement, toolbar);
  } else if (selection && selection.range) {
    positionToolbarAboveSelection(selection.range, toolbar);
  }

  return toolbar;
}

function animateToolbarEntry(toolbar) {
  requestAnimationFrame(() => {
    toolbar.classList.add("toolbar-entering");
  });
}

function setupSelectionToolbarCloseHandler() {
  const closeHandler = (e) => {
    const toolbar = document.querySelector(".toolbar");
    if (!toolbar || !toolbar.contains(e.target)) {
      closeToolbar();
      cancelSelection();
      document.removeEventListener("mousedown", closeHandler);
    }
  };

  document.addEventListener("mousedown", closeHandler);
}

function setupHighlightToolbarCloseHandler(highlightElement) {
  const closeHandler = (e) => {
    const toolbar = document.querySelector(".toolbar");
    if (
      (!toolbar || !toolbar.contains(e.target)) &&
      !highlightElement.contains(e.target)
    ) {
      closeToolbar();

      document.removeEventListener("mousedown", closeHandler);
    }
  };

  document.addEventListener("mousedown", closeHandler);
}

function closeAllUI() {
  closeToolbar();
  closeNoteEditor();
}

export function closeToolbar() {
  const toolbar = document.querySelector(".toolbar");

  if (toolbar) {
    toolbar.classList.add("toolbar-hiding");

    setTimeout(() => {
      if (toolbar.parentNode) {
        toolbar.remove();
      }
    }, 200);
  }
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

function positionToolbarAboveSelection(range, toolbar) {
  const rect = range.getBoundingClientRect();

  toolbar.style.top = window.scrollY + rect.top - 50 + "px";
  toolbar.style.left = window.scrollX + rect.left + "px";

  requestAnimationFrame(() => {
    const toolbarRect = toolbar.getBoundingClientRect();

    if (toolbarRect.right > window.innerWidth) {
      toolbar.style.left =
        window.scrollX + window.innerWidth - toolbarRect.width - 10 + "px";
    }

    if (toolbarRect.top < 0) {
      toolbar.style.top = window.scrollY + rect.bottom + 5 + "px";
    }
  });
}

function positionToolbarAboveHighlight(highlightElement, toolbar) {
  const rect = highlightElement.getBoundingClientRect();

  toolbar.style.top = window.scrollY + rect.top - 50 + "px";
  toolbar.style.left = window.scrollX + rect.left + "px";

  requestAnimationFrame(() => {
    const toolbarRect = toolbar.getBoundingClientRect();

    if (toolbarRect.right > window.innerWidth) {
      toolbar.style.left =
        window.scrollX + window.innerWidth - toolbarRect.width - 10 + "px";
    }

    if (toolbarRect.top < 0) {
      toolbar.style.top = window.scrollY + rect.bottom + 5 + "px";
    }
  });
}
