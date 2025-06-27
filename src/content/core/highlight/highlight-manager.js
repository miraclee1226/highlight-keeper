import {
  createHighlight,
  updateHighlight,
  deleteHighlight,
  scrollToHighlight,
} from "./highlight-service.js";
import { restorePageHighlights } from "./highlight-restorer.js";
import {
  captureCurrentSelection,
  clearSelection,
} from "../../state/selection.js";
import {
  showSelectionToolbar,
  showHighlightToolbar,
} from "../../ui/ui-manager.js";
import { showNoteEditor } from "../../ui/note-editor.js";
import { calculatePosition } from "../../utils/position.js";
import { COLORS } from "../../../constant/colors.js";

export async function initializeHighlightManager() {
  await restorePageHighlights();
}

export function handleTextSelection(selection, callbacks) {
  const position = calculatePosition(selection.range);

  showSelectionToolbar(position, {
    onColorSelect: async (color) => {
      const result = await createHighlight(selection, color);

      if (result && callbacks.onHighlightCreated) {
        callbacks.onHighlightCreated(result);
      }
    },
    onNoteClick: async () => {
      const result = await createHighlight(selection, COLORS[0]);

      if (result && result.elements[0]) {
        callbacks.onHighlightCreated(result);
        showNoteEditor(result.elements[0]);
      }
    },
  });
}

export function handleHighlightClick(highlightElement) {
  const highlightId = highlightElement.dataset.id;
  const currentColor = highlightElement.style.backgroundColor || COLORS[0];
  const position = calculatePosition(highlightElement);

  showHighlightToolbar(position, {
    currentColor,
    onColorSelect: (color) => {
      updateHighlight(highlightId, { color });
    },
    onNoteClick: async () => {
      showNoteEditor(highlightElement);
    },
    onDeleteClick: () => {
      deleteHighlight(highlightId);
    },
  });
}

export function handleScrollToHighlight(highlightId) {
  return scrollToHighlight(highlightId);
}

export async function handleHighlightShortcut() {
  const selection = captureCurrentSelection();

  if (selection) {
    await createHighlight(selection, COLORS[0]);
    clearSelection();
  }
}
