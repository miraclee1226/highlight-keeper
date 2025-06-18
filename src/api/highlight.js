export function getHighlights() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (!tabs[0]) {
        reject(new Error("No active tab found"));
        return;
      }

      chrome.runtime.sendMessage(
        {
          action: "get_highlights",
          payload: tabs[0].url,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(
              new Error("Runtime error: " + chrome.runtime.lastError.message)
            );
            return;
          }

          if (!response) {
            reject(new Error("No response from background script"));
            return;
          }

          if (response.action === "get_success") {
            resolve(response.data);
          } else if (response.action === "get_error") {
            reject(new Error(response.error));
          } else {
            reject(new Error("Unexpected response format"));
          }
        }
      );
    });
  });
}

export function saveHighlight(originalDOMInfo, highlightId, color) {
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

export function updateHighlight(highlightId, updates) {
  chrome.runtime.sendMessage({
    action: "update_highlight",
    payload: {
      uuid: highlightId,
      data: { ...updates, updatedAt: Date.now() },
    },
  });
}

export function deleteHighlight(highlightId) {
  chrome.runtime.sendMessage({
    action: "delete_highlight",
    payload: highlightId,
  });
}

export function scrollToHighlight(uuid) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "scroll_to_highlight",
      payload: uuid,
    });
  });
}
