export function saveHighlightToDatabase(originalDOMInfo, highlightId, color) {
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

export function updateHighlightInDatabase(highlightId, updates) {
  chrome.runtime.sendMessage({
    action: "update_highlight",
    payload: {
      uuid: highlightId,
      data: { ...updates, updatedAt: Date.now() },
    },
  });
}

export function deleteHighlightFromDatabase(highlightId) {
  chrome.runtime.sendMessage({
    action: "delete_highlight",
    payload: highlightId,
  });
}
