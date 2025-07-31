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

export async function deleteAllHighlights(href) {
  const result = await sendMessageToBackground({
    action: "delete_all_highlights",
    payload: href,
  });

  return result;
}

export async function scrollToHighlight(uuid) {
  return await sendMessageToTab({
    action: "scroll_to_highlight",
    payload: uuid,
  });
}

export async function removeAllHighlightsFromDOM() {
  return await sendMessageToTab({
    action: "remove_all_highlights_from_dom",
  });
}
