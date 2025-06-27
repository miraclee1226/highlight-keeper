let currentSelection = null;

export function captureCurrentSelection() {
  const selection = window.getSelection();

  if (selection.toString().trim().length === 0) {
    currentSelection = null;
    return null;
  }

  currentSelection = {
    text: selection.toString(),
    range: selection.getRangeAt(0).cloneRange(),
  };

  return currentSelection;
}

export function getCurrentSelection() {
  return currentSelection;
}

export function clearSelection() {
  currentSelection = null;
}
