export default function notification(message, options = {}) {
  if (!message) {
    console.warn("Notification: Invalid message provided");
    return;
  }

  removeExistingNotifications();

  const notificationElement = createNotificationElement(message, options);
  document.body.appendChild(notificationElement);

  const timerId = setTimeout(() => {
    fadeOutAndRemove(notificationElement);
  }, options.duration || 3000);

  notificationElement.timerId = timerId;
}

function createNotificationElement(message, options = {}) {
  const notificationElement = document.createElement("div");
  notificationElement.className = getNotificationClasses(options.type);
  notificationElement.textContent = message;

  return notificationElement;
}

function getNotificationClasses(type) {
  const baseClass = "notification";

  if (!type || type === "error") {
    return `${baseClass}`;
  }

  const validTypes = ["success", "warning", "info"];
  if (validTypes.includes(type)) {
    return `${baseClass} notification--${type}`;
  }

  return `${baseClass}`;
}

function removeExistingNotifications() {
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => {
    if (notification.timerId) {
      clearTimeout(notification.timerId);
    }
    fadeOutAndRemove(notification);
  });
}

function fadeOutAndRemove(notificationElement) {
  if (
    !notificationElement.parentNode ||
    notificationElement.classList.contains("notification--fade-out")
  ) {
    return;
  }

  notificationElement.classList.add("notification--fade-out");

  setTimeout(() => {
    if (notificationElement.parentNode) {
      notificationElement.remove();
    }
  }, 500);
}
