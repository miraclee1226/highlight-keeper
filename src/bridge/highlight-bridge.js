import {
  sendMessageToBackground,
  sendMessageToTab,
} from "./background-bridge.js";

export async function getHighlights(url) {
  return await sendMessageToBackground({
    action: "get_highlights_by_href",
    payload: url,
  });
}

export async function createHighlight(highlightData) {
  const result = await sendMessageToBackground({
    action: "create_highlight",
    payload: highlightData,
  });

  return result;
}

export async function updateHighlight(highlightId, updates) {
  const result = await sendMessageToBackground({
    action: "update_highlight",
    payload: {
      uuid: highlightId,
      data: updates,
    },
  });

  return result;
}

export async function deleteHighlight(highlightId) {
  const result = await sendMessageToBackground({
    action: "delete_highlight",
    payload: highlightId,
  });

  return result;
}

export async function scrollToHighlight(uuid) {
  return await sendMessageToTab({
    action: "scroll_to_highlight",
    payload: uuid,
  });
}
