export function isMutiParagraphSelection(range) {
  const startParagraph = findCloseBlockElement(range.startContainer);
  const endParagraph = findCloseBlockElement(range.endContainer);

  return startParagraph !== endParagraph;
}

function findCloseBlockElement(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }

  const blockElements = [
    "P",
    "DIV",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "LI",
    "BLOCKQUOTE",
    "SECTION",
    "ARTICLE",
  ];

  while (node && node.nodeType === Node.ELEMENT_NODE) {
    if (blockElements.includes(node.tagName)) {
      return node;
    }
    node = node.parentNode;
  }

  return null;
}
