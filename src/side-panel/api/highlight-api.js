import { getHighlights, scrollToHighlight } from "../../api/highlight.js";

export function fetchHighlights(url) {
  return new Promise((resolve, reject) => {
    getHighlights({
      payload: url,
      onSuccess: resolve,
      onError: reject,
    });
  });
}

export function scrollToHighlightById(uuid) {
  return new Promise((resolve, reject) => {
    scrollToHighlight({
      payload: uuid,
      onSuccess: resolve,
      onError: reject,
    });
  });
}
