import { removeNoteIcon } from "./note-icon";
import { handleHighlightClick } from "./toolbar";

export function applyHighlight(selection) {
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const contents = range.extractContents();

  const span = document.createElement("span");
  span.className = "highlighted-element";
  span.dataset.id =
    "highlight-" +
    Date.now() +
    "-" +
    Math.random().toString(36).substring(2, 9);
  span.appendChild(contents);
  range.insertNode(span);
  span.dataset.highlightedElement = span.textContent;
  span.dataset.timestamp = new Date().toISOString();
  span.dataset.url = window.location.href;

  span.addEventListener("click", handleHighlightClick);
}

export function removeHighlight(highlightElement) {
  const fragment = document.createDocumentFragment();
  const parentNode = highlightElement.parentNode;

  while (highlightElement.firstChild) {
    fragment.appendChild(highlightElement.firstChild);
  }

  if (parentNode) {
    parentNode.replaceChild(fragment, highlightElement);
    parentNode.normalize();
  }

  removeNoteIcon(highlightElement);
}
