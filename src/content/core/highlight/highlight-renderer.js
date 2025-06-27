import { createHighlightElement } from "./../../ui/highlight-element.js";

export function renderHighlight(range, highlightId, color) {
  const elements = [];
  const textNodes = getTextNodesInRange(range);

  textNodes.forEach((textNode) => {
    const element = wrapTextNode(textNode, range, highlightId, color);
    if (element) elements.push(element);
  });

  return elements;
}

export function removeHighlightFromDOM(highlightId) {
  const elements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  elements.forEach((element) => {
    const parent = element.parentNode;
    parent.insertBefore(document.createTextNode(element.textContent), element);
    parent.removeChild(element);
    parent.normalize();
  });
}

function getTextNodesInRange(range) {
  const textNodes = [];
  const rootNode =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentNode
      : range.commonAncestorContainer;

  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    (node) =>
      range.intersectsNode(node) && node.textContent.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
  );

  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  return textNodes;
}

function wrapTextNode(textNode, range, highlightId, color) {
  const intersection = getTextNodeIntersection(textNode, range);
  if (!intersection) return null;

  const { startOffset, endOffset } = intersection;
  const text = textNode.textContent;

  const fragment = document.createDocumentFragment();

  if (startOffset > 0) {
    fragment.appendChild(
      document.createTextNode(text.substring(0, startOffset))
    );
  }

  const highlightElement = createHighlightElement(
    text.substring(startOffset, endOffset),
    highlightId,
    color
  );
  fragment.appendChild(highlightElement);

  if (endOffset < text.length) {
    fragment.appendChild(document.createTextNode(text.substring(endOffset)));
  }

  textNode.parentNode.replaceChild(fragment, textNode);
  return highlightElement;
}

function getTextNodeIntersection(textNode, range) {
  let startOffset = 0;
  let endOffset = textNode.textContent.length;

  if (range.startContainer === textNode) {
    startOffset = range.startOffset;
  } else if (
    textNode.compareDocumentPosition(range.startContainer) &
    Node.DOCUMENT_POSITION_PRECEDING
  ) {
    startOffset = 0;
  } else {
    return null;
  }

  if (range.endContainer === textNode) {
    endOffset = range.endOffset;
  } else if (
    textNode.compareDocumentPosition(range.endContainer) &
    Node.DOCUMENT_POSITION_FOLLOWING
  ) {
    endOffset = textNode.textContent.length;
  } else {
    return null;
  }

  return startOffset < endOffset ? { startOffset, endOffset } : null;
}
