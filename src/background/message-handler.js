import {
  getAllHighlights,
  getHighlightsByHref,
  createHighlight,
  updateHighlight,
  deleteHighlight,
} from "./highlights.js";

export function handleMessage(request, sender, sendResponse) {
  switch (request.action) {
    case "create_highlight":
      createHighlight(request.payload)
        .then((res) => {
          sendResponse({
            action: "create_success",
            data: res,
          });
        })
        .catch((error) => {
          console.error("Save operation failed:", error);
          sendResponse({
            action: "create_error",
            error: error.message || "Unknown error during save operation",
          });
        });
      break;

    case "get_highlights_by_href":
      getHighlightsByHref(request.payload)
        .then((res) => {
          sendResponse({
            action: "get_success",
            data: res,
          });
        })
        .catch((error) => {
          sendResponse({
            action: "get_error",
            error: error.message || "Unknown error during get operation",
          });
        });
      break;

    case "update_highlight":
      updateHighlight(request.payload.uuid, request.payload.data)
        .then((res) => {
          sendResponse({
            action: "update_success",
            data: res,
          });
        })
        .catch((error) => {
          console.error("Update operation failed:", error);
          sendResponse({
            action: "update_error",
            error: error.message || "Unknown error during update operation",
          });
        });
      break;

    case "delete_highlight":
      deleteHighlight(request.payload)
        .then((res) => {
          sendResponse({
            action: "delete_success",
            data: res,
          });
        })
        .catch((error) => {
          console.error("Delete operation failed:", error);
          sendResponse({
            action: "delete_error",
            error: error.message || "Unknown error during delete operation",
          });
        });
      break;

    case "get_all_highlights":
      getAllHighlights()
        .then((res) => {
          sendResponse({
            action: "get_all_success",
            data: res,
          });
        })
        .catch((error) => {
          console.error("Get all operation failed:", error);
          sendResponse({
            action: "get_all_error",
            error: error.message || "Unknown error during get all operation",
          });
        });
      break;

    default:
      sendResponse({
        action: "unknown_action",
        error: "Unknown action: " + request.action,
      });
      break;
  }
}
