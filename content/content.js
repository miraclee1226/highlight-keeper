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
    span.dataset.id =
      "highlight-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 9);
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
  span.dataset.id =
    "highlight-" +
    Date.now() +
    "-" +
    Math.random().toString(36).substring(2, 9);
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

  noteButton.addEventListener("click", function (e) {
    e.stopPropagation();
    openNoteEditor(highlightElement);
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

function openNoteEditor(highlightElement, editMode = true) {
  const existingEditor = document.getElementById("highlightNoteEditor");
  if (existingEditor) {
    existingEditor.remove();
  }

  const rect = highlightElement.getBoundingClientRect();
  const editorContainer = document.createElement("div");
  editorContainer.id = "highlightNoteEditor";
  editorContainer.style.position = "absolute";
  editorContainer.style.top = window.scrollY + rect.bottom + 5 + "px";
  editorContainer.style.left = window.scrollX + rect.left + "px";
  editorContainer.style.backgroundColor = "white";
  editorContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  editorContainer.style.borderRadius = "8px";
  editorContainer.style.padding = "10px";
  editorContainer.style.width = "300px";
  editorContainer.style.zIndex = "10";

  const title = document.createElement("h3");
  title.textContent = editMode ? "Edit Note ✏️" : "Note ✏️";
  title.style.margin = "0 0 10px 0";
  title.style.fontSize = "16px";
  editorContainer.appendChild(title);

  const currentNote = highlightElement.dataset.note || "";

  if (editMode) {
    const textarea = document.createElement("textarea");
    textarea.value = currentNote;
    textarea.style.width = "100%";
    textarea.style.height = "100px";
    textarea.style.padding = "8px";
    textarea.style.marginBottom = "10px";
    textarea.style.boxSizing = "border-box";
    textarea.style.border = "1px solid #ddd";
    textarea.style.borderRadius = "4px";
    textarea.style.resize = "none";
    textarea.placeholder = "Add your notes here...";

    textarea.addEventListener("mouseup", function (e) {
      e.stopPropagation();
    });

    textarea.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });

    editorContainer.appendChild(textarea);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.gap = "8px";

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.padding = "6px 12px";
    cancelButton.style.backgroundColor = "#f0f0f0";
    cancelButton.style.border = "1px solid #ddd";
    cancelButton.style.borderRadius = "4px";
    cancelButton.style.cursor = "pointer";

    cancelButton.addEventListener("click", function (e) {
      e.stopPropagation();
      editorContainer.remove();
    });

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.style.padding = "6px 12px";
    saveButton.style.backgroundColor = "#4CAF50";
    saveButton.style.color = "white";
    saveButton.style.border = "none";
    saveButton.style.borderRadius = "4px";
    saveButton.style.cursor = "pointer";

    saveButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const noteText = textarea.value.trim();
      saveNote(highlightElement, noteText);
      editorContainer.remove();
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);
    editorContainer.appendChild(buttonContainer);

    setTimeout(() => textarea.focus(), 0);
  } else {
    const noteTextContainer = document.createElement("div");
    noteTextContainer.style.width = "100%";
    noteTextContainer.style.padding = "8px";
    noteTextContainer.style.marginBottom = "10px";
    noteTextContainer.style.boxSizing = "border-box";
    noteTextContainer.style.border = "1px solid #ddd";
    noteTextContainer.style.borderRadius = "4px";
    noteTextContainer.style.backgroundColor = "#f9f9f9";
    noteTextContainer.style.minHeight = "100px";
    noteTextContainer.style.maxHeight = "200px";
    noteTextContainer.style.overflowY = "auto";
    noteTextContainer.style.whiteSpace = "pre-wrap";
    noteTextContainer.style.wordBreak = "break-word";
    noteTextContainer.textContent = currentNote || "No notes added yet.";

    noteTextContainer.addEventListener("mouseup", function (e) {
      e.stopPropagation();
    });

    noteTextContainer.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });

    editorContainer.appendChild(noteTextContainer);

    noteTextContainer.addEventListener("dblclick", function (e) {
      e.stopPropagation();
      editorContainer.remove();
      openNoteEditor(highlightElement, true);
    });

    const hintText = document.createElement("p");
    hintText.textContent = "Double-click to edit";
    hintText.style.margin = "0";
    hintText.style.fontSize = "12px";
    hintText.style.color = "#888";
    hintText.style.textAlign = "center";
    editorContainer.appendChild(hintText);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.marginTop = "10px";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.padding = "6px 12px";
    closeButton.style.backgroundColor = "#f0f0f0";
    closeButton.style.border = "1px solid #ddd";
    closeButton.style.borderRadius = "4px";
    closeButton.style.cursor = "pointer";

    closeButton.addEventListener("click", function (e) {
      e.stopPropagation();
      editorContainer.remove();
    });

    buttonContainer.appendChild(closeButton);
    editorContainer.appendChild(buttonContainer);
  }

  editorContainer.addEventListener("mouseup", function (e) {
    e.stopPropagation();
  });

  editorContainer.addEventListener("mousedown", function (e) {
    e.stopPropagation();
  });

  document.body.appendChild(editorContainer);

  const editorRect = editorContainer.getBoundingClientRect();
  if (editorRect.right > window.innerWidth) {
    editorContainer.style.left =
      window.scrollX + window.innerWidth - editorRect.width - 10 + "px";
  }

  document.addEventListener("click", function closeEditor(e) {
    if (!editorContainer.contains(e.target) && e.target !== highlightElement) {
      editorContainer.remove();
      document.removeEventListener("click", closeEditor);
    }
  });
}

function saveNote(highlightElement, noteText) {
  if (noteText.length > 0) {
    highlightElement.dataset.note = noteText;

    addNoteIcon(highlightElement);
  } else {
    delete highlightElement.dataset.note;
    removeNoteIcon(highlightElement);
  }
}

function addNoteIcon(highlightElement) {
  removeNoteIcon(highlightElement);

  const existingIcon = document.querySelector(
    `button.noteIcon[data-highlight-id="${highlightElement.dataset.id}"]`
  );

  if (!existingIcon) {
    if (!highlightElement.dataset.id) {
      highlightElement.dataset.id =
        "highlight-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 9);
    }

    const rect = highlightElement.getBoundingClientRect();
    const noteIcon = document.createElement("button");
    const noteImg = document.createElement("img");
    noteIcon.className = "noteIcon";
    noteImg.width = 20;
    noteImg.height = 20;
    noteImg.src = "https://img.icons8.com/pulsar-color/20/note.png";
    noteImg.alt = "note";
    noteIcon.appendChild(noteImg);
    noteIcon.dataset.highlightId = highlightElement.dataset.id;

    noteIcon.style.position = "absolute";
    noteIcon.style.backgroundColor = "transparent";
    noteIcon.style.border = "none";
    noteIcon.style.top = window.scrollY + rect.top - 20 + "px";
    noteIcon.style.left = window.scrollX + rect.right - 3 + "px";
    noteIcon.style.cursor = "pointer";
    noteIcon.style.zIndex = "10";

    noteIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      openNoteEditor(highlightElement, false);
    });

    document.body.appendChild(noteIcon);

    updateNoteIconPosition(highlightElement, noteIcon);
    window.addEventListener("scroll", function () {
      updateNoteIconPosition(highlightElement, noteIcon);
    });
    window.addEventListener("resize", function () {
      updateNoteIconPosition(highlightElement, noteIcon);
    });
  }
}

function updateNoteIconPosition(highlightElement, noteIcon) {
  const rect = highlightElement.getBoundingClientRect();

  noteIcon.style.top = window.scrollY + rect.top - 20 + "px";
  noteIcon.style.left = window.scrollX + rect.right - 3 + "px";
}

function removeNoteIcon(highlightElement) {
  if (highlightElement.dataset.id) {
    const noteIcon = document.querySelector(
      `.noteIcon[data-highlight-id="${highlightElement.dataset.id}"]`
    );

    if (noteIcon) {
      noteIcon.remove();
    }
  }
}
