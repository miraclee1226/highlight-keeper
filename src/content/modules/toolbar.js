import { COLORS } from "../../constant/colors";
import {
  removeHighlight,
  applyHighlight,
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

  addColorPaletteForSelection(toolbar);
  addNoteButtonForSelection(toolbar);
  addAIButton(toolbar);

  document.body.appendChild(toolbar);

  animateToolbarEntry(toolbar);
  setupSelectionToolbarCloseHandler();
}

function createHighlightToolbar(highlightElement) {
  const toolbar = createToolbar(highlightElement);

  addColorPaletteForHighlight(toolbar, highlightElement);
  addNoteButtonForHighlight(toolbar, highlightElement);
  addAIButton(toolbar);
  addDeleteButton(toolbar, highlightElement);

  document.body.appendChild(toolbar);

  animateToolbarEntry(toolbar);
  setupHighlightToolbarCloseHandler(highlightElement);
}

function addColorPaletteForSelection(toolbar) {
  const colorPalette = createColorPalette(() => {
    return (color) => {
      applyHighlight(color);
      closeAllUI();
    };
  });

  toolbar.appendChild(colorPalette);
}

function addColorPaletteForHighlight(toolbar, highlightElement) {
  const highlightId = highlightElement.dataset.id;
  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  const currentColor = highlightElement.dataset.color || COLORS[0];

  const colorPalette = createColorPalette(() => {
    return (color) => {
      allElements.forEach((element) => {
        element.style.backgroundColor = color;
        element.dataset.color = color;
      });

      chrome.runtime.sendMessage({
        action: "update_highlight",
        payload: {
          uuid: highlightId,
          data: { color: color, updatedAt: Date.now() },
        },
      });

      updateMainColor(colorPalette, color);
      closeAllUI();
    };
  }, currentColor);

  toolbar.appendChild(colorPalette);
}

function createColorPalette(getClickHandler, initialColor = null) {
  const paletteContainer = document.createElement("div");
  paletteContainer.className = "color-palette-container";

  const mainColor = initialColor || COLORS[0];

  const mainColorButton = createColorButton(mainColor, () => {
    getClickHandler()(mainColor);
    updateMainColor(paletteContainer, mainColor);
  });

  mainColorButton.className = "color-palette-button main-color";

  paletteContainer.appendChild(mainColorButton);

  const hiddenColors = document.createElement("div");
  hiddenColors.className = "hidden-colors";

  const filteredColors = COLORS.filter((color) => color !== mainColor);

  filteredColors.slice(0, 4).forEach((color, index) => {
    const colorButton = createColorButton(color, () => {
      getClickHandler()(color);
      updateMainColor(paletteContainer, color);
    });
    colorButton.className = "color-palette-button hidden-color";
    colorButton.style.transitionDelay = `${index * 0.05}s`;
    hiddenColors.appendChild(colorButton);
  });

  paletteContainer.appendChild(hiddenColors);

  paletteContainer.addEventListener("mouseenter", () => {
    paletteContainer.classList.add("expanded");
  });

  paletteContainer.addEventListener("mouseleave", () => {
    paletteContainer.classList.remove("expanded");
  });

  return paletteContainer;
}

function updateMainColor(paletteContainer, newColor) {
  const mainColorButton = paletteContainer.querySelector(".main-color");

  if (mainColorButton) {
    mainColorButton.style.backgroundColor = newColor;
  }
}

function createColorButton(color, clickHandler) {
  const colorButton = document.createElement("div");

  colorButton.style.backgroundColor = color;
  colorButton.addEventListener("click", clickHandler);

  return colorButton;
}

function addNoteButtonForSelection(toolbar) {
  const noteButton = createNoteButton("Add note", () => {
    const highlightElement = applyHighlight(COLORS[0]);

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

  toolbar.style.top = window.scrollY + rect.top - 40 + "px";
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

  toolbar.style.top = window.scrollY + rect.top - 40 + "px";
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
