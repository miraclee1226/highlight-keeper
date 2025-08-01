import { notifySidePanel } from "../bridge/sidepanel-bridge.js";
import {
  getAllHighlights,
  getHighlightsByHref,
  getDomainDetails,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  deleteAllHighlights,
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

          notifySidePanel("highlight_created", res);
        })
        .catch((error) => {
          console.error("Save operation failed:", error);
          sendResponse({
            action: "create_error",
            error: error.message || "Unknown error during save operation",
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

          notifySidePanel("highlight_updated", res);
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

          notifySidePanel("highlight_deleted", { uuid: request.payload });
        })
        .catch((error) => {
          console.error("Delete operation failed:", error);
          sendResponse({
            action: "delete_error",
            error: error.message || "Unknown error during delete operation",
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

    case "get_domain_details":
      getDomainDetails()
        .then((res) =>
          sendResponse({ action: "get_domain_details_success", data: res })
        )
        .catch((error) => {
          console.error("Get domain details failed:", error);
          sendResponse({
            action: "get_domain_details_error",
            error: error.message,
          });
        });
      break;

    case "delete_all_highlights":
      deleteAllHighlights(request.payload)
        .then((deletedCount) => {
          sendResponse({
            action: "delete_all_success",
            data: deletedCount,
          });
        })
        .catch((error) => {
          console.error("Delete all operation failed:", error);
          sendResponse({
            action: "delete_all_error",
            error: error.message || "Unknown error during delete all operation",
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
