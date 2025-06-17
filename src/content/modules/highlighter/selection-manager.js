let currentSelection = null;

export function getCurrentSelection() {
  return currentSelection;
}

export function setCurrentSelection(selection) {
  currentSelection = selection;
}

export function clearCurrentSelection() {
  currentSelection = null;
}

export function captureSelection() {
  const selection = window.getSelection();

  if (selection.toString().trim().length === 0) {
    return null;
  }

  const selectionData = {
    text: selection.toString(),
    range: selection.getRangeAt(0).cloneRange(),
  };

  setCurrentSelection(selectionData);
  return selectionData;
}

export function hasCurrentSelection() {
  return currentSelection !== null;
}
