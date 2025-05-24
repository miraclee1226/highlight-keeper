export function isSelectionOverlappingHighlight(selection) {
  if (!selection.rangeCount) return false;

  const range = selection.getRangeAt(0);
  const highlightedElements = document.querySelectorAll(".highlighted-element");

  const highlightsWithNotes = Array.from(highlightedElements).filter(
    (el) => el.dataset.note && el.dataset.note.trim().length > 0
  );
  const highlightsWithoutNotes = Array.from(highlightedElements).filter(
    (el) => !el.dataset.note || el.dataset.note.trim().length === 0
  );

  const noteResult = checkOverlapWithHighlights(
    range,
    highlightsWithNotes,
    true
  );

  if (noteResult) return noteResult;

  return checkOverlapWithHighlights(range, highlightsWithoutNotes, false);
}

function checkOverlapWithHighlights(range, highlights, hasNote) {
  const overlappingElements = findOverlappingElements(range, highlights);

  if (overlappingElements.length === 0) return null;

  const overlapType = determineOverlapType(range, overlappingElements, hasNote);

  return {
    type: overlapType.type,
    element: overlapType.element,
    hasNote: hasNote,
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

function determineOverlapType(range, overlappingElements, hasNote) {
  const selectionStartNode = range.startContainer;
  const selectionEndNode = range.endContainer;

  for (const element of overlappingElements) {
    if (
      element.contains(selectionStartNode) &&
      element.contains(selectionEndNode)
    ) {
      return { type: "contained", element };
    }
  }

  if (hasNote) {
    for (const element of overlappingElements) {
      if (isEncompassingRelation(range, element)) {
        return { type: "encompassing", element };
      }
    }

    return { type: "overlapping", element: overlappingElements[0] };
  }

  for (const element of overlappingElements) {
    if (
      !element.contains(selectionStartNode) &&
      element.contains(selectionEndNode)
    ) {
      return { type: "starts_before_highlight", element };
    }

    if (
      element.contains(selectionStartNode) &&
      !element.contains(selectionEndNode)
    ) {
      return { type: "ends_after_highlight", element };
    }
  }

  return { type: "overlapping", element: overlappingElements[0] };
}

function isEncompassingRelation(range, element) {
  return (
    (range.startContainer.parentNode &&
      range.startContainer.parentNode.compareDocumentPosition(element) &
        Node.DOCUMENT_POSITION_CONTAINED_BY) ||
    (range.endContainer.parentNode &&
      range.endContainer.parentNode.compareDocumentPosition(element) &
        Node.DOCUMENT_POSITION_CONTAINED_BY)
  );
}
