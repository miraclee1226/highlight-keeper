export function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (isSuccessResponse(response)) {
        resolve(response.data);
      } else if (isErrorResponse(response)) {
        reject(new Error(response.error));
      } else {
        reject(new Error("Unknown response format"));
      }
    });
  });
}

export function sendMessageToTab(message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        if (isSuccessResponse(response)) {
          resolve(response.data);
        } else if (isErrorResponse(response)) {
          reject(new Error(response.error));
        } else {
          reject(new Error("Failed to send tab message"));
        }
      });
    });
  });
}

function isSuccessResponse(response) {
  return (
    response &&
    (response.success !== undefined ||
      (response.action && response.action.endsWith("_success")))
  );
}

function isErrorResponse(response) {
  return response && response.action && response.action.endsWith("_error");
}
