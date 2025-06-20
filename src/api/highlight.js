export function getHighlights({ payload, onSuccess, onError }) {
  chrome.runtime.sendMessage(
    {
      action: "get_highlights_by_href",
      payload,
    },
    (response) => {
      if (response.action === "get_success") {
        onSuccess(response.data);
      } else if (response.action === "get_error") {
        onError(new Error(response.error));
      }
    }
  );
}

export function createHighlight({ payload, onSuccess, onError }) {
  const { originalDOMInfo, highlightId, color } = payload;
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
      action: "create_highlight",
      payload: highlightData,
    },
    (response) => {
      if (response.action === "create_success") {
        notifySidePanel("highlight_created", highlightData);
        onSuccess();
      } else if (response.action === "create_error") {
        onError(new Error(response.error));
      }
    }
  );
}

export function updateHighlight({ payload, onSuccess, onError }) {
  const { highlightId, updates } = payload;
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
        notifySidePanel("highlight_updated", {
          uuid: highlightId,
          ...updateData,
        });
        onSuccess();
      } else if (response.action === "update_error") {
        onError(new Error(response.error));
      }
    }
  );
}

export function deleteHighlight({ payload, onSuccess, onError }) {
  const { highlightId } = payload;
  {
    chrome.runtime.sendMessage(
      {
        action: "delete_highlight",
        payload: highlightId,
      },
      (response) => {
        if (response.action === "delete_success") {
          notifySidePanel("highlight_deleted", { uuid: highlightId });
          onSuccess();
        } else if (response.action === "delete_error") {
          onError(new Error(response.error));
        }
      }
    );
  }
}

export function scrollToHighlight({ payload, onSuccess, onError }) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        action: "scroll_to_highlight",
        payload,
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

function notifySidePanel(action, data) {
  chrome.runtime.sendMessage({
    action,
    data,
  });
}
