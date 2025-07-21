import { ModalManager } from "./modal-manager.js";

export class Modal {
  constructor() {
    this.element = null;
  }

  template() {
    throw new Error("Template method must be implemeted");
  }

  open() {
    const manager = ModalManager.getInstance();
    manager.openModal(this);
  }

  close() {
    if (this.element) {
      if (this.modalType === "center") {
        this.element.style.opacity = "0";
        this.element.style.transform = "translate(-50%, -50%) scale(0.9)";
      } else {
        this.element.style.transform = "translateY(100%)";
      }
    }

    setTimeout(() => {
      const manager = ModalManager.getInstance();
      manager.closeModal(this);
    }, 300);
  }

  setEvent() {
    const $closeBtn = this.element.querySelector(".modal__close-btn");

    if ($closeBtn) {
      $closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        this.close();
      });
    }
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
