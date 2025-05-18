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
    range.surroundContents(span);
    span.dataset.highlightedText = selectedText;
    span.dataset.timestamp = new Date().toISOString();
    span.dataset.url = window.location.href;

    span.addEventListener("click", handleHighlightClick);
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
  span.appendChild(contents);
  range.insertNode(span);
  span.dataset.highlightedText = span.textContent;
  span.dataset.timestamp = new Date().toISOString();
  span.dataset.url = window.location.href;

  span.addEventListener("click", handleHighlightClick);
}

function handleHighlightClick(e) {
  e.stopPropagation();

  const existingToolbar = document.getElementById("highlightToolbar");
  if (existingToolbar) {
    existingToolbar.remove();
  }

  const highlightElement = e.currentTarget;
  const rect = highlightElement.getBoundingClientRect();

  createHighlightToolbar(rect, highlightElement);
}

function createHighlightToolbar(rect, highlightElement) {
  const toolbar = document.createElement("div");
  toolbar.id = "highlightToolbar";
  toolbar.style.position = "absolute";
  toolbar.style.top = window.scrollY + rect.bottom + 5 + "px";
  toolbar.style.left = window.scrollX + rect.left + "px";
  toolbar.style.zIndex = "10";
  toolbar.style.backgroundColor = "white";
  toolbar.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  toolbar.style.borderRadius = "4px";
  toolbar.style.padding = "5px";
  toolbar.style.display = "flex";
  toolbar.style.gap = "5px";

  const colors = ["#FFF59D", "#81D4FA", "#A5D6A7", "#FFAB91", "#D1C4E9"];

  colors.forEach((color) => {
    const colorButton = document.createElement("div");
    colorButton.className = "colorOption";
    colorButton.style.width = "24px";
    colorButton.style.height = "24px";
    colorButton.style.backgroundColor = color;
    colorButton.style.borderRadius = "50%";
    colorButton.style.cursor = "pointer";
    colorButton.style.border = "1px solid #ddd";

    colorButton.addEventListener("click", function () {
      highlightElement.style.backgroundColor = color;
      highlightElement.dataset.color = color;
      toolbar.remove();
    });

    toolbar.appendChild(colorButton);
  });

  const noteButton = document.createElement("button");
  noteButton.textContent = "✏️ Note";
  noteButton.style.padding = "2px 8px";
  noteButton.style.backgroundColor = "#f0f0f0";
  noteButton.style.border = "1px solid #ddd";
  noteButton.style.borderRadius = "3px";
  noteButton.style.cursor = "pointer";
  noteButton.style.fontSize = "14px";

  noteButton.addEventListener("click", function () {
    console.log("TODO: Open note editor for highlight");
    toolbar.remove();
  });

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "🗑️ Delete";
  deleteButton.style.padding = "2px 8px";
  deleteButton.style.backgroundColor = "#f0f0f0";
  deleteButton.style.border = "1px solid #ddd";
  deleteButton.style.borderRadius = "3px";
  deleteButton.style.cursor = "pointer";
  deleteButton.style.fontSize = "14px";

  deleteButton.addEventListener("click", function () {
    removeHighlight(highlightElement);
    toolbar.remove();
  });

  toolbar.appendChild(noteButton);
  toolbar.appendChild(deleteButton);

  document.body.appendChild(toolbar);

  document.addEventListener("click", function closeToolbar(e) {
    if (!toolbar.contains(e.target) && e.target !== highlightElement) {
      toolbar.remove();
      document.removeEventListener("click", closeToolbar);
    }
  });
}

function removeHighlight(highlightElement) {
  const textContent = highlightElement.textContent;
  const textNode = document.createTextNode(textContent);
  const parentNode = highlightElement.parentNode;

  if (parentNode) {
    parentNode.replaceChild(textNode, highlightElement);
    parentNode.normalize();
  }
}
