import { Toast } from "./toast.js";

export class ToastManager {
  static instance;

  constructor() {
    if (ToastManager.instance) return ToastManager.instance;

    this.container = null;
    this.toasts = [];

    ToastManager.instance = this;
  }

  static getInstance() {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }

    return ToastManager.instance;
  }

  show(message, options = {}) {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";

      document.body.appendChild(this.container);
    }

    const toastOptions = {
      message,
      type: options.type || "success",
      onClose: (toastId) => this.removeToast(toastId),
    };

    if (this.toasts.length >= 2) {
      const oldestToast = this.toasts.shift();
      if (oldestToast && oldestToast.parentNode) {
        oldestToast.parentNode.removeChild(oldestToast);
      }
    }

    const toast = new Toast(this.container, toastOptions);
    this.toasts.push(toast.toastElement);

    return toast.toastId;
  }

  removeToast(toastId) {
    const toastElement = this.container.querySelector(
      `[data-toast-id="${toastId}"]`
    );

    if (toastElement) {
      this.toasts = this.toasts.filter((toast) => toast !== toastElement);
    }

    if (this.toasts.length === 0 && this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  success(message, options = {}) {
    return this.show(message, { ...options, type: "success" });
  }

  error(message, options = {}) {
    return this.show(message, { ...options, type: "error" });
  }

  info(message, options = {}) {
    return this.show(message, { ...options, type: "info" });
  }

  warning(message, options = {}) {
    return this.show(message, { ...options, type: "warning" });
  }

  clear() {
    this.toasts.forEach((toast) => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });

    this.toasts = [];

    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
