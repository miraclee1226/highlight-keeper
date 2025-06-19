import { Toolbar } from "../../components/toolbar/index.js";
import { openNoteEditor } from "./note-editor.js";
import { COLORS } from "./../../constant/colors.js";
import {
  applyHighlight,
  removeHighlight,
} from "./highlighter/highlight-controller.js";

let currentToolbar = null;

function cleanupCurrentToolbar() {
  if (currentToolbar) {
    currentToolbar.cleanup();
    currentToolbar = null;
  }
}

export function createInitialToolbar(selection = null) {
  cleanupCurrentToolbar();

  currentToolbar = new Toolbar(document.body, {
    onColorSelect: (color) => {
      applyHighlight(color);
    },
    onNoteClick: () => {
      const highlightElement = applyHighlight(COLORS[0]);
      if (highlightElement) {
        openNoteEditor(highlightElement);
      }
    },
  });

  if (selection && selection.range) {
    const rect = selection.range.getBoundingClientRect();
    const position = {
      top: window.scrollY + rect.top - 40,
      left: window.scrollX + rect.left,
    };
    currentToolbar.show("selection", position);
  }
}

export function handleHighlightClick(e) {
  e.stopPropagation();

  cleanupCurrentToolbar();

  const highlightElement = e.currentTarget;
  const currentColor =
    highlightElement.style.backgroundColor || "rgb(255, 253, 170)";

  currentToolbar = new Toolbar(document.body, {
    currentColor,
    onColorSelect: (color) => {
      const highlightId = highlightElement.dataset.id;
      const allElements = document.querySelectorAll(
        `[data-id="${highlightId}"]`
      );

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
    },
    onNoteClick: () => {
      openNoteEditor(highlightElement);
    },
    onDeleteClick: () => {
      removeHighlight(highlightElement);
      cleanupCurrentToolbar();
    },
  });

  const rect = highlightElement.getBoundingClientRect();
  const position = {
    top: window.scrollY + rect.top - 40,
    left: window.scrollX + rect.left,
  };

  currentToolbar.show("highlight", position);
}
