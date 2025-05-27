export function isSelectionOverlappingHighlight(selection) {
  const range = selection.getRangeAt(0);
  const highlightedElements = document.querySelectorAll(".highlighted-element");

  return checkOverlapWithHighlights(range, Array.from(highlightedElements));
}

function checkOverlapWithHighlights(range, highlights) {
  const overlappingElements = findOverlappingElements(range, highlights);

  if (overlappingElements.length === 0) return null;

  const overlapType = determineOverlapType(range, overlappingElements);

  return {
    type: overlapType.type,
    element: overlapType.element,
    overlappingElements: overlappingElements,
  };
}

function findOverlappingElements(range, highlights) {
  const overlappingElements = [];

  for (let i = 0; i < highlights.length; i++) {
    const highlightedElement = highlights[i];

    if (range.intersectsNode(highlightedElement)) {
      overlappingElements.push(highlightedElement);
    }
  }

  return overlappingElements;
}

function determineOverlapType(range, overlappingElements) {
  const selectionStartNode = range.startContainer;
  const selectionEndNode = range.endContainer;

  // 1. contained
  const containedElement = overlappingElements.find(
    (element) =>
      element.contains(selectionStartNode) && element.contains(selectionEndNode)
  );

  if (containedElement) {
    return { type: "contained", element: containedElement };
  }

  // 2. encompassing
  const encompassingElement = overlappingElements.find((element) =>
    isEncompassingRelation(range, element)
  );

  if (encompassingElement) {
    return { type: "encompassing", element: encompassingElement };
  }

  // 3. starts_before_highlight
  const startsBeforeElement = overlappingElements.find(
    (element) =>
      !element.contains(selectionStartNode) &&
      element.contains(selectionEndNode)
  );

  if (startsBeforeElement) {
    return { type: "starts_before_highlight", element: startsBeforeElement };
  }

  // 4. ends_after_highlight
  const endsAfterElement = overlappingElements.find(
    (element) =>
      element.contains(selectionStartNode) &&
      !element.contains(selectionEndNode)
  );

  if (endsAfterElement) {
    return { type: "ends_after_highlight", element: endsAfterElement };
  }

  // 5. overlapping
  return { type: "overlapping", element: overlappingElements[0] };
}

function isEncompassingRelation(range, element) {
  const elementRange = document.createRange();

  elementRange.selectNode(element);

  return (
    range.compareBoundaryPoints(Range.START_TO_START, elementRange) <= 0 &&
    range.compareBoundaryPoints(Range.END_TO_END, elementRange) >= 0
  );
}
