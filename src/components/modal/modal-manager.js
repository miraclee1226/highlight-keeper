export class ModalManager {
  static instance;

  constructor() {
    if (ModalManager.instance) return ModalManager.instance;

    this.overlay = null;
    this.modalStack = [];

    ModalManager.instance = this;
  }

  static getInstance() {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }

    return ModalManager.instance;
  }

  getModalByType(modalType) {
    return (
      this.modalStack.find((modal) => modal.constructor.name === modalType) ||
      null
    );
  }

  openModal(modal) {
    if (this.modalStack.length === 0) {
      this.createOverlay();
    }

    modal.element = null;

    this.modalStack.push(modal);
    this.mountModal(modal);
  }

  createOverlay() {
    const overlayHTML = '<div class="modal-overlay"></div>';
    document.body.insertAdjacentHTML("beforeend", overlayHTML);

    this.overlay = document.body.lastElementChild;
    this.setOverlayEvents();

    setTimeout(() => {
      this.overlay.classList.add("active");
    }, 10);
  }

  mountModal(modal) {
    const modalHTML = modal.template();
    const zIndex = 1000 + this.modalStack.length;

    this.overlay.insertAdjacentHTML("beforeend", modalHTML);

    modal.element = this.overlay.lastElementChild;
    modal.element.style.zIndex = zIndex;

    this.playOpenAnimation(modal);

    setTimeout(() => {
      this.setEvents(modal);
    }, 10);
  }

  playOpenAnimation(modal) {
    const modalType = modal.modalType || "bottom";

    if (modalType === "center") {
      modal.element.style.opacity = "0";
      modal.element.style.transform = "translate(-50%, -50%) scale(0.9)";

      setTimeout(() => {
        modal.element.style.opacity = "1";
        modal.element.style.transform = "translate(-50%, -50%) scale(1)";
      }, 10);
    } else {
      modal.element.style.transform = "translateY(100%)";

      setTimeout(() => {
        modal.element.style.transform = "translateY(0)";
      }, 10);
    }
  }

  closeModal(modal) {
    this.playCloseAnimation(modal);

    setTimeout(() => {
      this.removeModal(modal);
    }, 300);
  }

  playCloseAnimation(modal) {
    if (!modal.element) return;

    const modalType = modal.modalType || "bottom";

    if (modalType === "center") {
      modal.element.style.opacity = "0";
      modal.element.style.transform = "translate(-50%, -50%) scale(0.9)";
    } else {
      modal.element.style.transform = "translateY(100%)";
    }
  }

  removeModal(modal) {
    const index = this.modalStack.indexOf(modal);

    if (index > -1) {
      this.modalStack.splice(index, 1);

      if (modal.element) {
        modal.element.remove();
        modal.element = null;
      }
    }

    if (this.modalStack.length === 0) {
      this.destroyOverlay();
    }
  }

  setEvents(modal) {
    const closeBtn = modal.element.querySelector(".modal__close-btn");

    if (closeBtn) {
      closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        this.closeModal(modal);
      });
    }

    if (typeof modal.setEvents === "function") {
      modal.setEvents();
    }
  }

  setOverlayEvents() {
    this.overlay.addEventListener("click", (event) => {
      if (event.target === this.overlay) {
        this.closeAllModals();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.modalStack.length > 0) {
        this.closeAllModals();
      }
    });
  }

  closeAllModals() {
    const topModal = this.modalStack[this.modalStack.length - 1];

    if (topModal) {
      this.closeModal(topModal);

      setTimeout(() => {
        if (this.modalStack.length > 0) {
          this.closeAllModals();
        }
      }, 300);
    }
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
