import { removeNoteIcon } from "./note-icon";
import { handleHighlightClick } from "./toolbar";

export function applyHighlight(selection) {
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const highlightId = generateHighlightId();

  applyUnifiedHighlight(range, highlightId);
}

function applyUnifiedHighlight(range, highlightId) {
  const textNodes = [];

  let rootNode = range.commonAncestorContainer;
  if (rootNode.nodeType == Node.TEXT_NODE) {
    rootNode = rootNode.parentNode;
  }

  const treeWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.textContent.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      if (range.intersectsNode(node)) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_REJECT;
    },
  });

  let node;
  while ((node = treeWalker.nextNode())) {
    textNodes.push(node);
  }

  textNodes.forEach((textNode) => {
    wrapTextNodeSafely(textNode, range, highlightId);
  });
}

function wrapTextNodeSafely(textNode, range, highlightId) {
  const intersectionInfo = getTextNodeIntersection(textNode, range);

  if (!intersectionInfo) return;

  const { startOffset, endOffset } = intersectionInfo;

  const text = textNode.textContent;
  const beforeText = text.substring(0, startOffset);
  const highlightText = text.substring(startOffset, endOffset);
  const afterText = text.substring(endOffset);

  const fragment = document.createDocumentFragment();

  if (beforeText) {
    fragment.appendChild(document.createTextNode(beforeText));
  }

  const highlightElement = createHighlightElement(highlightText, highlightId);

  highlightElement.addEventListener("click", handleHighlightClick);
  fragment.appendChild(highlightElement);

  if (afterText) {
    fragment.appendChild(document.createTextNode(afterText));
  }

  textNode.parentNode.replaceChild(fragment, textNode);
}

function getTextNodeIntersection(textNode, range) {
  const textLength = textNode.textContent.length;

  let startOffset = 0;
  let endOffset = textLength;

  startOffset = calculateStartOffset(textNode, range);
  endOffset = calculateEndOffset(textNode, range, textLength);

  if (startOffset === null || endOffset === null || startOffset >= endOffset)
    return null;

  return { startOffset, endOffset };
}

function calculateStartOffset(textNode, range) {
  const isStartNode = range.startContainer === textNode;
  const startOffset = range.startOffset;

  if (isStartNode) return startOffset;

  const startPosition =
    textNode.compareDocumentPosition(range.startContainer) &
    Node.DOCUMENT_POSITION_PRECEDING
      ? 0
      : null;

  return startPosition;
}

function calculateEndOffset(textNode, range, textLength) {
  const isEndNode = range.endContainer === textNode;
  const endOffset = range.endOffset;

  if (isEndNode) return endOffset;

  const endPosition =
    textNode.compareDocumentPosition(range.endContainer) &
    Node.DOCUMENT_POSITION_FOLLOWING
      ? textLength
      : null;

  return endPosition;
}

function generateHighlightId() {
  return (
    "highlight-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9)
  );
}

function createHighlightElement(highlightText, highlightId) {
  const span = document.createElement("span");

  span.className = "highlighted-element";
  span.textContent = highlightText;
  span.dataset.id = highlightId;
  span.dataset.timestamp = new Date().toISOString();
  span.dataset.url = window.location.href;

  span.addEventListener("mouseenter", () => {
    const sameIdElements = document.querySelectorAll(
      `[data-id="${highlightId}"]`
    );
    sameIdElements.forEach((element) =>
      element.classList.add("highlighted-element--hover")
    );
  });

  span.addEventListener("mouseleave", () => {
    const sameIdElements = document.querySelectorAll(
      `[data-id="${highlightId}"]`
    );
    sameIdElements.forEach((element) =>
      element.classList.remove("highlighted-element--hover")
    );
  });

  return span;
}

export function removeHighlight(highlightElement) {
  const highlightId = highlightElement.dataset.id;

  if (!highlightId) return;

  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  removeNoteIcon(highlightId);

  allElements.forEach((element) => {
    removeHighlightElement(element);
  });
}

function removeHighlightElement(highlightElement) {
  const fragment = document.createDocumentFragment();
  const parentNode = highlightElement.parentNode;

  while (highlightElement.firstChild) {
    fragment.appendChild(highlightElement.firstChild);
  }

  if (parentNode) {
    parentNode.replaceChild(fragment, highlightElement);
    parentNode.normalize();
  }
}
