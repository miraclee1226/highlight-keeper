import { showToolbar } from "./toolbar.js";
import { showNoteEditor as showEditor } from "./note-editor.js";

export function showSelectionToolbar(position, callbacks) {
  showToolbar(position, {
    type: "selection",
    onColorSelect: callbacks.onColorSelect,
    onNoteClick: callbacks.onNoteClick,
  });
}

export function showHighlightToolbar(position, callbacks) {
  showToolbar(position, {
    type: "highlight",
    currentColor: callbacks.currentColor,
    onColorSelect: callbacks.onColorSelect,
    onNoteClick: callbacks.onNoteClick,
    onDeleteClick: callbacks.onDeleteClick,
  });
}

export function showNoteEditor(highlightElement) {
  showEditor(highlightElement);
}
