export function notifySidePanel(action, data) {
  chrome.runtime.sendMessage({
    action,
    data,
  });
}
