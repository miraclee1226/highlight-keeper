import { createInitialToolbar, handleHighlightClick } from "./toolbar";

let currentSelection = null;

export function handleHighlighting() {
  const selection = window.getSelection();

  if (selection.toString().trim().length === 0) return;

  currentSelection = {
    text: selection.toString(),
    range: selection.getRangeAt(0).cloneRange(),
  };

  createInitialToolbar(currentSelection);
}

export function applyHighlight(color) {
  if (!currentSelection) return null;

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    selection.removeAllRanges();
  }

  const highlightId = generateHighlightId();
  const originalDOMInfo = getOriginalDOMInfo(
    currentSelection.range,
    currentSelection.text
  );

  if (!originalDOMInfo) return null;

  const highlightElements = applyUnifiedHighlight(
    currentSelection.range,
    highlightId,
    color
  );

  saveHighlightToDatabase(originalDOMInfo, highlightId, color);

  currentSelection = null;

  return highlightElements ? highlightElements[0] : null;
}

function getOriginalDOMInfo(range, text) {
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

  if (!startElement || !endElement) return;

  const startPath = getElementPath(startElement);
  const endPath = getElementPath(endElement);

  const startOffset = getRelativeOffset(
    startElement,
    startContainer,
    range.startOffset
  );
  const endOffset = getRelativeOffset(
    endElement,
    endContainer,
    range.endOffset
  );

  return {
    startContainerPath: startPath,
    endContainerPath: endPath,
    startOffset,
    endOffset,
    text,
  };
}

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
        .filter((c) => c.trim())
        .filter((c) => !c.startsWith("highlighted"));

      if (classes.length > 0) {
        const escapedClasses = classes.map((c) => CSS.escape(c));
        selector += `.${escapedClasses.join(".")}`;
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

  const finalPath = path.join(" > ");
  return finalPath;
}

function getRelativeOffset(parentElement, textContainer, offset) {
  if (textContainer.nodeType !== Node.TEXT_NODE) {
    return offset;
  }

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

function saveHighlightToDatabase(originalDOMInfo, highlightId, color) {
  if (!originalDOMInfo) return;

  const highlightData = {
    uuid: highlightId,
    href: window.location.href,
    selection: {
      startContainerPath: originalDOMInfo.startContainerPath,
      startOffset: originalDOMInfo.startOffset,
      endContainerPath: originalDOMInfo.endContainerPath,
      endOffset: originalDOMInfo.endOffset,
      text: originalDOMInfo.text,
    },
    color: color,
    note: "",
    version: "1.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  chrome.runtime.sendMessage({
    action: "save_highlight",
    payload: highlightData,
  });
}

function getRangeFromRelativeOffset(
  startElement,
  endElement,
  startOffset,
  endOffset
) {
  const startResult = findTextPositionInElement(startElement, startOffset);
  const endResult = findTextPositionInElement(endElement, endOffset);

  if (!startResult || !endResult) {
    return null;
  }

  const range = document.createRange();
  range.setStart(startResult.textNode, startResult.offset);
  range.setEnd(endResult.textNode, endResult.offset);

  return range;
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

export function restoreHighlightData(highlightData) {
  const selection = highlightData.selection;
  const startElement = document.querySelector(selection.startContainerPath);
  const endElement = document.querySelector(selection.endContainerPath);
  const startOffset = selection.startOffset;
  const endOffset = selection.endOffset;

  if (!startElement || !endElement) return false;

  const range = getRangeFromRelativeOffset(
    startElement,
    endElement,
    startOffset,
    endOffset
  );

  if (!range) return false;

  const restoredText = range.toString();

  if (restoredText !== selection.text) return false;

  applyUnifiedHighlight(range, highlightData.uuid, highlightData.color);

  return true;
}

function applyUnifiedHighlight(range, highlightId, color = "#FFFDAA") {
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

  highlightElement.addEventListener("click", handleHighlightClick);
  fragment.appendChild(highlightElement);

  if (afterText) {
    fragment.appendChild(document.createTextNode(afterText));
  }

  textNode.parentNode.replaceChild(fragment, textNode); // parentNode = null

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

function generateHighlightId() {
  const randomId = crypto.randomUUID();
  return "highlight-" + randomId;
}

function createHighlightElement(highlightText, highlightId, color) {
  const span = document.createElement("span");

  span.className = "highlighted-element";
  span.textContent = highlightText;
  span.dataset.id = highlightId;
  span.dataset.timestamp = new Date().toISOString();
  span.dataset.url = window.location.href;
  span.dataset.color = color;
  span.style.backgroundColor = color;

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

  chrome.runtime.sendMessage({
    action: "delete_highlight",
    payload: highlightId,
  });

  const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  allElements.forEach((element) => {
    removeHighlightElement(element);
  });
}

function removeHighlightElement(highlightElement) {
  const fragment = document.createDocumentFragment();
  const parentNode = highlightElement.parentNode;

  if (!parentNode) return;

  while (highlightElement.firstChild) {
    fragment.appendChild(highlightElement.firstChild);
  }

  parentNode.replaceChild(fragment, highlightElement);
  parentNode.normalize();
}

export function cancelSelection() {
  currentSelection = null;
}
