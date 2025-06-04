import { COLORS } from "../../constant/colors";
import { removeHighlight } from "./highlighter";
import { openNoteEditor } from "./note-editor";

let currentCloseHandler = null;

export function createInitialToolbar(highlightElement) {
  closeToolbarAndNoteEditor();
  createHighlightToolbar(highlightElement, false);
}

export function handleHighlightClick(e) {
  e.stopPropagation();

  closeToolbarAndNoteEditor();

  const highlightElement = e.currentTarget;

  createHighlightToolbar(highlightElement, true);
}

export function createHighlightToolbar(
  highlightElement,
  showNoteEditor = false
) {
  const toolbar = createToolbar(highlightElement);

  addColorButtons(toolbar, highlightElement);

  const noteButton = createNoteButton(highlightElement);
  toolbar.appendChild(noteButton);

  // TODO: AI Chat Function
  const bulbButton = createBulbButton(highlightElement);
  toolbar.appendChild(bulbButton);

  if (showNoteEditor) {
    const deleteButton = createDeleteHighlightButton(highlightElement);

    toolbar.appendChild(deleteButton);
  }

  document.body.appendChild(toolbar);

  requestAnimationFrame(() => {
    toolbar.classList.add("toolbar-entering");
  });

  if (showNoteEditor) {
    setTimeout(() => {
      openNoteEditor(highlightElement, toolbar, true);
    }, 100);
  }

  setupCloseHandler(highlightElement);
}

function createNoteButton(highlightElement) {
  const noteButton = document.createElement("button");
  const img = document.createElement("img");

  img.src = chrome.runtime.getURL("/public/icons/note.svg");
  img.alt = "Note Icon";
  noteButton.appendChild(img);

  noteButton.className = "toolbar-note-icon";
  noteButton.title = "Add note";

  noteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    closeToolbarAndNoteEditor();

    setTimeout(() => {
      openNoteEditor(highlightElement, null, true);
    }, 100);
  });

  return noteButton;
}

function createBulbButton(highlightElement) {
  const bulbButton = document.createElement("button");
  const img = document.createElement("img");

  img.src = chrome.runtime.getURL("/public/icons/bulb.svg");
  img.alt = "AI Insight Icon";
  bulbButton.appendChild(img);

  bulbButton.className = "bulb-icon";
  bulbButton.title = "AI insight (coming soon)";

  bulbButton.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("AI insight feature - coming soon");
    closeToolbarAndNoteEditor();
  });

  return bulbButton;
}

function createDeleteHighlightButton(highlightElement) {
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
    closeToolbarAndNoteEditor();
  });

  return deleteButton;
}

function closeToolbarAndNoteEditor() {
  const toolbar = document.querySelector(".toolbar");
  const noteEditor = document.querySelector(".note-editor");

  if (noteEditor) {
    noteEditor.classList.add("note-editor--hiding");

    setTimeout(() => {
      noteEditor.remove();
    }, 200);
  }

  if (toolbar) {
    toolbar.classList.add("toolbar-hiding");

    setTimeout(() => {
      toolbar.remove();
    }, 200);
  }

  if (currentCloseHandler) {
    document.removeEventListener("mousedown", currentCloseHandler);
    currentCloseHandler = null;
  }
}

function setupCloseHandler(highlightElement) {
  currentCloseHandler = (e) => {
    const toolbar = document.querySelector(".toolbar");
    const noteEditor = document.querySelector(".note-editor");

    if (
      (!toolbar || !toolbar.contains(e.target)) &&
      (!noteEditor || !noteEditor.contains(e.target)) &&
      !highlightElement.contains(e.target)
    ) {
      closeToolbarAndNoteEditor();
    }
  };

  document.addEventListener("mousedown", currentCloseHandler);
}

function createToolbar(highlightElement) {
  const toolbar = document.createElement("div");

  toolbar.className = "toolbar";

  positionToolbarAboveHighlight(highlightElement, toolbar);

  return toolbar;
}

function addColorButtons(toolbar, highlightElement) {
  const highlightId = highlightElement.dataset.id;
  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  COLORS.forEach((color) => {
    const colorButton = document.createElement("div");
    colorButton.className = "color-palette-button";
    colorButton.style.backgroundColor = color;
    colorButton.addEventListener("click", () => {
      allElements.forEach((element) => {
        element.style.backgroundColor = color;
        element.dataset.color = color;
      });

      chrome.runtime.sendMessage({
        action: "update_highlight",
        payload: {
          uuid: highlightId,
          data: {
            color: color,
            updatedAt: Date.now(),
          },
        },
      });

      closeToolbarAndNoteEditor();
    });

    toolbar.appendChild(colorButton);
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
