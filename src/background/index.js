import { initDB } from "./db-connection.js";
import { handleMessage } from "./message-handler.js";

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    console.log("Extension installed - DB will be initialized when first used");
  } else if (details.reason === "update") {
    console.log("Extension updated");
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  initDB()
    .then(() => {
      handleMessage(request, sender, sendResponse);
    })
    .catch((error) => {
      sendResponse({
        action: request.action + "_error",
        error: "Database initialization failed: " + error.message,
      });
    });

  return true;
});
