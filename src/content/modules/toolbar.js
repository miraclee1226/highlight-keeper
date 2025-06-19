import { Toolbar } from "../../components/toolbar/index.js";
import { openNoteEditor } from "./note-editor.js";
import {
  applyHighlight,
  removeHighlight,
} from "./highlighter/highlight-controller.js";
import { updateHighlight } from "../../api/highlight.js";
import { COLORS } from "./../../constant/colors.js";

export function createInitialToolbar(selection = null) {
  const toolbar = new Toolbar(document.body, {
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
    toolbar.show("selection", position);
  }
}

export function handleHighlightClick(e) {
  e.stopPropagation();

  const highlightElement = e.currentTarget;
  const currentColor =
    highlightElement.style.backgroundColor || "rgb(255, 253, 170)";

  const toolbar = new Toolbar(document.body, {
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

      updateHighlight(highlightId, { color });
    },
    onNoteClick: () => {
      openNoteEditor(highlightElement);
    },
    onDeleteClick: () => {
      removeHighlight(highlightElement);
    },
  });

  const rect = highlightElement.getBoundingClientRect();
  const position = {
    top: window.scrollY + rect.top - 40,
    left: window.scrollX + rect.left,
  };

  toolbar.show("highlight", position);
}
