import {
  handleTextSelection,
  handleHighlightClick,
} from "../core/highlight/highlight-manager.js";
import { captureCurrentSelection, clearSelection } from "../state/selection.js";

export function initializeMouseEvents() {
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("click", handleClick);
}

function handleMouseUp(event) {
  if (
    event.target.closest(".toolbar") ||
    event.target.closest(".note-editor")
  ) {
    return;
  }

  const selection = captureCurrentSelection();
  if (!selection) return;

  handleTextSelection(selection, {
    onHighlightCreated: () => {
      clearSelection();
    },
  });
}

function handleClick(event) {
  const highlightElement = event.target.closest(".highlighted-element");
  if (!highlightElement) return;

  event.stopPropagation();

  handleHighlightClick(highlightElement);
}
