import {
  createHighlight,
  updateHighlight,
  deleteHighlight,
} from "./highlight-api.js";
import { calculatePosition } from "../utils/position.js";
import { Toolbar } from "../../components/toolbar/index.js";
import { NoteEditor } from "../../components/note-editor/index.js";
import { SelectionManager } from "./selection-manager.js";
import { COLORS } from "../../constant/colors.js";

export class HighlightManager {
  constructor() {
    this.selectionManager = new SelectionManager();
    this.setEvents();
  }

  // ===== Event Handlers =====

  handleMouseUp(event) {
    const isToolbarOrEditor =
      event.target.closest(".toolbar") || event.target.closest(".note-editor");
    if (isToolbarOrEditor) return;

    const selection = this.selectionManager.captureTextSelection();
    if (!selection) return;

    this.handleTextSelection(selection);
  }

  handleClick(event) {
    const highlightElement = event.target.closest(".highlighted-element");
    if (!highlightElement) return;

    this.handleHighlightClick(highlightElement);
  }

  // ===== Core Logic =====

  handleTextSelection(selection) {
    const position = calculatePosition(selection.range);
    const toolbar = new Toolbar(document.body, {
      onColorSelect: async (color) => {
        const result = await createHighlight(selection, color);
        if (result) {
          this.selectionManager.clearSelection();
        }
      },
      onNoteClick: async () => {
        const result = await createHighlight(selection, COLORS[0]);
        if (result.elements[0]) {
          this.showNoteEditor(result.elements[0]);
          this.selectionManager.clearSelection();
        }
      },
    });

    toolbar.show("selection", position);
  }

  handleHighlightClick(highlightElement) {
    const highlightId = highlightElement.dataset.id;
    const currentColor = highlightElement.style.backgroundColor || COLORS[0];
    const position = calculatePosition(highlightElement);

    const toolbar = new Toolbar(document.body, {
      currentColor,
      onColorSelect: (color) => {
        updateHighlight(highlightId, { color });
      },
      onNoteClick: () => {
        this.showNoteEditor(highlightElement);
      },
      onDeleteClick: () => {
        deleteHighlight(highlightId);
      },
    });

    toolbar.show("highlight", position);
  }

  // ===== Helper Methods =====

  showNoteEditor(highlightElement) {
    const noteEditor = new NoteEditor(document.body, {
      highlightElement,
    });

    noteEditor.show(highlightElement);
  }

  // ===== Public Methods =====

  async handleHighlightShortcut() {
    const selection = this.selectionManager.getSelectedText();
    if (!selection) return;

    const result = await createHighlight(selection, COLORS[0]);

    if (result) {
      this.selectionManager.clearSelection();
    }
  }

  setEvents() {
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("click", this.handleClick.bind(this));
  }
}
