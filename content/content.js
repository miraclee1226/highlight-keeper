chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startHighlighting") {
    document.addEventListener("mouseup", handleHighlighting);
    sendResponse({ status: "Highlighting mode started" });
  }
});

function isSelectionOverlappingHighlight(selection) {
  if (!selection.rangeCount) return false;

  const range = selection.getRangeAt(0);
  const highlightedElements = document.querySelectorAll(".highlightedText");

  let overlappingElements = [];

  for (let i = 0; i < highlightedElements.length; i++) {
    const highlightedElement = highlightedElements[i];

    if (range.intersectsNode(highlightedElement)) {
      overlappingElements.push(highlightedElement);
    }
  }

  if (overlappingElements.length === 0) return null;

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

  return { type: "overlapping", element: overlappingElements[0] };
}

function handleHighlighting() {
  const selection = window.getSelection();

  if (selection.toString().trim().length === 0) return;

  const overlapResult = isSelectionOverlappingHighlight(selection);

  if (!overlapResult) {
    applyHighlight(selection);
    selection.removeAllRanges();
    return;
  }

  if (overlapResult.type === "contained") {
    selection.removeAllRanges();
    return;
  }

  if (overlapResult.type === "overlapping") {
    const originalText = overlapResult.element.textContent;
    const textNode = document.createTextNode(originalText);

    overlapResult.element.parentNode.replaceChild(
      textNode,
      overlapResult.element
    );

    applyHighlight(selection);
    selection.removeAllRanges();
  }
}

function applyHighlight(selection) {
  if (!selection.rangeCount) return;

  try {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (selectedText.length === 0) return;

    const span = document.createElement("span");
    span.className = "highlightedText";
    span.style.backgroundColor = "#FFF59D";
    span.style.borderRadius = "2px";
    range.surroundContents(span);
    span.dataset.highlightedText = selectedText;
    span.dataset.timestamp = new Date().toISOString();
    span.dataset.url = window.location.href;
  } catch (e) {
    console.error("Highlighting Error:", e);
    try {
      handleComplexHighlight(selection);
    } catch (innerError) {
      console.error("Complex Highlighting Error:", innerError);
    }
  }
}

function handleComplexHighlight(selection) {
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const contents = range.extractContents();
  const span = document.createElement("span");

  span.className = "highlightedText";
  span.style.backgroundColor = "#FFF59D";
  span.style.borderRadius = "2px";
  span.appendChild(contents);
  range.insertNode(span);
  span.dataset.highlightedText = span.textContent;
  span.dataset.timestamp = new Date().toISOString();
  span.dataset.url = window.location.href;
}
