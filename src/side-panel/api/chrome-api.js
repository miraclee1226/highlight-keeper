export function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
}

export function getTabById(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, resolve);
  });
}

export function listenToTabActivation(callback) {
  chrome.tabs.onActivated.addListener(callback);
}

export function listenToTabUpdate(callback) {
  chrome.tabs.onUpdated.addListener(callback);
}

export function listenToRuntimeMessages(callback) {
  chrome.runtime.onMessage.addListener(callback);
}
