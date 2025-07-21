export class ModalManager {
  static instance = null;

  constructor() {
    if (ModalManager.instance) {
      throw new Error("MondalManager is singleton. Use getInstance().");
    }

    this.overlay = null;
    this.modalStack = [];

    ModalManager.instance = this;
  }

  static getInstance() {
    if (!ModalManager.instance) {
      new ModalManager();
    }

    return ModalManager.instance;
  }

  openModal(instance) {
    if (this.modalStack.length === 0) {
      this.renderOverlay();
    }

    this.modalStack.push(instance);
    this.mounted(instance);
  }

  closeModal(instance) {
    const index = this.modalStack.indexOf(instance);

    if (index > -1) {
      this.modalStack.splice(index, 1);
      instance.destroy();
    }

    if (this.modalStack.length === 0) {
      this.destroyOverlay();
    }
  }

  createOverlay() {
    return `<div class="modal-overlay"></div>`;
  }

  renderOverlay() {
    const overlayHTML = this.createOverlay();
    document.body.insertAdjacentHTML("beforeend", overlayHTML);

    this.overlay = document.body.lastElementChild;

    this.setEvent();

    setTimeout(() => {
      this.overlay.classList.add("active");
    }, 10);
  }

  mounted(instance) {
    const parent = this.overlay;
    const modalHTML = instance.template();
    const zIndex = 1000 + this.modalStack.length;

    parent.insertAdjacentHTML("beforeend", modalHTML);

    instance.element = parent.lastElementChild;
    instance.element.style.zIndex = zIndex;

    if (instance.modalType === "center") {
      instance.element.style.opacity = "0";
      instance.element.style.transform = "translate(-50%, -50%) scale(0.9)";

      setTimeout(() => {
        instance.element.style.opacity = "1";
        instance.element.style.transform = "translate(-50%, -50%) scale(1)";
        instance.setEvent();
      }, 10);
    } else {
      instance.element.style.transform = "translateY(100%)";

      setTimeout(() => {
        instance.element.style.transform = "translateY(0)";
        instance.setEvent();
      }, 10);
    }
  }

  closeAllModals() {
    const topModal = this.modalStack[this.modalStack.length - 1];

    if (topModal) {
      if (topModal.element) {
        if (topModal.modalType === "center") {
          topModal.element.style.opacity = "0";
          topModal.element.style.transform = "translate(-50%, -50%) scale(0.9)";
        } else {
          topModal.element.style.transform = "translateY(100%)";
        }
      }

      setTimeout(() => {
        this.closeModal(topModal);

        if (this.modalStack.length > 0) {
          this.closeAllModals();
        }
      }, 300);
    }
  }

  setEvent() {
    this.overlay.addEventListener("click", (event) => {
      if (event.target === this.overlay) {
        this.closeAllModals();
      }
    });
  }

  destroyOverlay() {
    if (this.overlay) {
      this.overlay.classList.remove("active");

      setTimeout(() => {
        this.overlay.remove();
        this.overlay = null;
      }, 300);
    }
  }
}
