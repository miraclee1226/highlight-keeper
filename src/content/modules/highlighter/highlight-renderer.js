import { COLORS } from "../../../constant/colors.js";
import { handleHighlightClick } from "../toolbar.js";

export function generateHighlightId() {
  const randomId = crypto.randomUUID();
  return "highlight-" + randomId;
}

export function createHighlightElement(highlightText, highlightId, color) {
  const span = document.createElement("span");

  span.className = "highlighted-element";
  span.textContent = highlightText;
  span.dataset.id = highlightId;
  span.dataset.timestamp = new Date().toISOString();
  span.dataset.url = window.location.href;
  span.style.backgroundColor = color;

  span.addEventListener("mousedown", handleHighlightClick);

  span.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

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

export function applyUnifiedHighlight(range, highlightId, color = COLORS[0]) {
  const textNodes = [];
  const createdElements = [];

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
    const element = wrapTextNodeSafely(textNode, range, highlightId, color);
    if (element) {
      createdElements.push(element);
    }
  });

  return createdElements;
}

function wrapTextNodeSafely(textNode, range, highlightId, color) {
  const intersectionInfo = getTextNodeIntersection(textNode, range);

  if (!intersectionInfo) return null;

  const { startOffset, endOffset } = intersectionInfo;

  const text = textNode.textContent;
  const beforeText = text.substring(0, startOffset);
  const highlightText = text.substring(startOffset, endOffset);
  const afterText = text.substring(endOffset);

  const fragment = document.createDocumentFragment();

  if (beforeText) {
    fragment.appendChild(document.createTextNode(beforeText));
  }

  const highlightElement = createHighlightElement(
    highlightText,
    highlightId,
    color
  );

  fragment.appendChild(highlightElement);

  if (afterText) {
    fragment.appendChild(document.createTextNode(afterText));
  }

  textNode.parentNode.replaceChild(fragment, textNode);

  return highlightElement;
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

export function removeHighlightElement(highlightElement) {
  const fragment = document.createDocumentFragment();
  const parentNode = highlightElement.parentNode;

  if (!parentNode) return;

  while (highlightElement.firstChild) {
    fragment.appendChild(highlightElement.firstChild);
  }

  parentNode.replaceChild(fragment, highlightElement);
  parentNode.normalize();
}

export function removeAllHighlightElements(highlightId) {
  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  allElements.forEach((element) => {
    removeHighlightElement(element);
  });
}
