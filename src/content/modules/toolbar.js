import { Button } from "../../components";
import { COLORS } from "../../constant/colors";
import { removeHighlight } from "./highlighter";
import { openNoteEditor } from "./note-editor";

let currentCloseHandler = null;

export function handleHighlightClick(e) {
  e.stopPropagation();

  closeToolbarAndNoteEditor();

  const highlightElement = e.currentTarget;

  createHighlightToolbar(highlightElement);
}

export function createHighlightToolbar(
  highlightElement,
  showNoteEditor = true
) {
  const toolbar = createToolbar(highlightElement);

  addColorButtons(toolbar, highlightElement);

  if (showNoteEditor) {
    const deleteButton = Button("🗑️ Delete", { variant: "danger" }, () => {
      removeHighlight(highlightElement);
      closeToolbarAndNoteEditor();
    });

    toolbar.appendChild(deleteButton);
  }

  document.body.appendChild(toolbar);

  requestAnimationFrame(() => {
    toolbar.classList.add("toolbar-entering");
  });

  if (showNoteEditor) {
    setTimeout(() => {
      openNoteEditor(highlightElement, toolbar, true);
    }, 150);
  }

  setupCloseHandler(highlightElement);
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
  if (currentCloseHandler) {
    document.removeEventListener("mousedown", currentCloseHandler);
  }

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
