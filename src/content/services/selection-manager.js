export class SelectionManager {
  constructor() {
    this.currentSelection = null;
  }

  captureTextSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length === 0) {
      this.currentSelection = null;
      return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    const selectionData = { text, range };

    this.currentSelection = selectionData;
    return selectionData;
  }

  getSelectedText() {
    return this.currentSelection;
  }

  clearSelection() {
    this.currentSelection = null;
  }
}
