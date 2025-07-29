import { createHighlightElement } from "./highlight-element.js";

// ===== DOM Information Extraction & Restoration =====

export function getOriginalDOMInfo(range, text) {
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  const startElement =
    startContainer.nodeType === Node.TEXT_NODE
      ? startContainer.parentNode
      : startContainer;
  const endElement =
    endContainer.nodeType === Node.TEXT_NODE
      ? endContainer.parentNode
      : endContainer;

  if (!startElement || !endElement) return null;

  return {
    startContainerPath: getElementPath(startElement),
    endContainerPath: getElementPath(endElement),
    startOffset: getRelativeOffset(
      startElement,
      startContainer,
      range.startOffset
    ),
    endOffset: getRelativeOffset(endElement, endContainer, range.endOffset),
    text,
  };
}

export function getRangeFromRelativeOffset(
  startElement,
  endElement,
  startOffset,
  endOffset
) {
  const startResult = findTextPositionInElement(startElement, startOffset);
  const endResult = findTextPositionInElement(endElement, endOffset);

  if (!startResult || !endResult) return null;

  const range = document.createRange();
  range.setStart(startResult.textNode, startResult.offset);
  range.setEnd(endResult.textNode, endResult.offset);

  return range;
}

export function getPageTitle() {
  return (
    document.title ||
    document.querySelector("h1")?.textContent?.trim() ||
    document.querySelector("h2")?.textContent?.trim() ||
    "Untitled Page"
  );
}

// ===== Highlight Rendering & Removal =====

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

// ===== Internal Helper Functions =====

function getElementPath(element) {
  const path = [];
  let currentNode = element;

  while (
    currentNode &&
    currentNode !== document.body &&
    currentNode !== document.documentElement
  ) {
    let selector = currentNode.tagName.toLowerCase();

    if (currentNode.id) {
      selector += `#${CSS.escape(currentNode.id)}`;
      path.unshift(selector);
      break;
    }

    if (currentNode.className) {
      const classes = currentNode.className
        .split(" ")
        .filter((c) => c.trim() && !c.startsWith("highlighted"))
        .map((c) => CSS.escape(c));

      if (classes.length > 0) {
        selector += `.${classes.join(".")}`;
      }
    }

    if (currentNode.parentNode) {
      const siblings = Array.from(currentNode.parentNode.children).filter(
        (el) => el.tagName === currentNode.tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(currentNode) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    currentNode = currentNode.parentNode;
  }

  return path.join(" > ");
}

function getRelativeOffset(parentElement, textContainer, offset) {
  if (textContainer.nodeType !== Node.TEXT_NODE) return offset;

  const walker = document.createTreeWalker(
    parentElement,
    NodeFilter.SHOW_TEXT,
    null
  );
  let totalOffset = 0;
  let node;

  while ((node = walker.nextNode())) {
    if (node === textContainer) {
      return totalOffset + offset;
    }
    totalOffset += node.textContent.length;
  }

  return offset;
}

function findTextPositionInElement(element, targetOffset) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  let currentOffset = 0;
  let node;

  while ((node = walker.nextNode())) {
    const nodeLength = node.textContent.length;
    if (currentOffset + nodeLength >= targetOffset) {
      return {
        textNode: node,
        offset: targetOffset - currentOffset,
      };
    }
    currentOffset += nodeLength;
  }

  return null;
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
