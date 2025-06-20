export function getHighlights({ payload, onSuccess, onError }) {
  chrome.runtime.sendMessage(
    {
      action: "get_highlights",
      payload,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        onError(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!response) {
        onError(new Error("No response from background script"));
        return;
      }

      if (response.action === "get_success") {
        onSuccess(response.data);
      } else if (response.action === "get_error") {
        onError(new Error(response.error));
      } else {
        onError(new Error("Unexpected response format"));
      }
    }
  );
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

  chrome.runtime.sendMessage(
    {
      action: "save_highlight",
      payload: highlightData,
    },
    (response) => {
      if (response.action === "save_success") {
        chrome.runtime.sendMessage({
          action: "highlight_created",
          data: highlightData,
        });
      }
    }
  );
}

export function updateHighlight(highlightId, updates) {
  const updateData = { ...updates, updatedAt: Date.now() };

  chrome.runtime.sendMessage(
    {
      action: "update_highlight",
      payload: {
        uuid: highlightId,
        data: updateData,
      },
    },
    (response) => {
      if (response.action === "update_success") {
        chrome.runtime.sendMessage({
          action: "highlight_updated",
          data: {
            uuid: highlightId,
            ...updateData,
          },
        });
      }
    }
  );
}

export function deleteHighlight(highlightId) {
  chrome.runtime.sendMessage(
    {
      action: "delete_highlight",
      payload: highlightId,
    },
    (response) => {
      if (response.action === "delete_success") {
        chrome.runtime.sendMessage({
          action: "highlight_deleted",
          data: { uuid: highlightId },
        });
      }
    }
  );
}

export function scrollToHighlight(uuid) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        action: "scroll_to_highlight",
        payload: uuid,
      },
      (response) => {
        if (response.action === "scroll_success") {
          onSuccess();
        } else if (response.action === "scroll_error") {
          onError(new Error(response.error));
        }
      }
    );
  });
}
