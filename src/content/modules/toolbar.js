import { createButton } from "../../components";
import { COLORS } from "../../constant/colors";
import { removeHighlight } from "./highlighter";
import { openNoteEditor } from "./note-editor";

export function handleHighlightClick(e) {
  e.stopPropagation();

  const existingToolbar = document.querySelector(".toolbar");

  if (existingToolbar) {
    existingToolbar.remove();
  }

  const highlightElement = e.currentTarget;
  const highlightId = highlightElement.dataset.id;
  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  createHighlightToolbar(highlightElement, allElements);
}

function createHighlightToolbar(highlightElement, allElements) {
  const toolbar = createToolbar(highlightElement);

  addColorButtons(toolbar, allElements);

  const noteButton = createButton("✏️ Note", { variant: "secondary" }, () => {
    openNoteEditor(highlightElement);
    toolbar.remove();
  });

  const deleteButton = createButton("🗑️ Delete", { variant: "danger" }, () => {
    removeHighlight(highlightElement);
    toolbar.remove();
  });

  toolbar.append(noteButton, deleteButton);
  document.body.appendChild(toolbar);

  const updatePosition = () =>
    setupEditorCloseHandler(highlightElement, toolbar);
  window.addEventListener("scroll", updatePosition);
  window.addEventListener("resize", updatePosition);

  toolbarCloseHandler(toolbar, highlightElement, updatePosition);
}

function createToolbar(highlightElement) {
  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";

  setupEditorCloseHandler(highlightElement, toolbar);

  return toolbar;
}

function addColorButtons(toolbar, allElements) {
  COLORS.forEach((color) => {
    const colorButton = document.createElement("div");
    colorButton.className = "color-palette-button";
    colorButton.style.backgroundColor = color;
    colorButton.addEventListener("click", () => {
      allElements.forEach((element) => {
        element.style.backgroundColor = color;
        element.dataset.color = color;
      });
      toolbar.remove();
    });

    toolbar.appendChild(colorButton);
  });
}

function toolbarCloseHandler(toolbar, highlightElement, updatePosition) {
  const closeToolbar = (e) => {
    if (!toolbar.contains(e.target) && !highlightElement.contains(e.target)) {
      toolbar.remove();
      document.removeEventListener("click", closeToolbar);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    }
  };

  document.addEventListener("click", closeToolbar);
}

function setupEditorCloseHandler(highlightElement, toolbar) {
  const rect = highlightElement.getBoundingClientRect();
  toolbar.style.top = window.scrollY + rect.bottom + 5 + "px";
  toolbar.style.left = window.scrollX + rect.left + "px";
}
