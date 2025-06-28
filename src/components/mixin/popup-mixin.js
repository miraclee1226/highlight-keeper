export const PopupMixin = {
  initPopup() {
    this.outsideClickHandler = null;
    this.scrollHandler = null;
    this.popupElement = null;
  },

  setupPopupEventHandlers(excludeElements = []) {
    this.outsideClickHandler = (e) => {
      if (!this.state.isVisible) return;
      if (this.popupElement?.contains(e.target)) return;

      for (const excludeEl of excludeElements) {
        if (excludeEl?.contains(e.target)) return;
      }

      this.hide();
    };

    this.scrollHandler = () => {
      if (!this.state.isVisible) return;
      this.hide();
    };

    document.addEventListener("mousedown", this.outsideClickHandler);
    window.addEventListener("scroll", this.scrollHandler);
  },

  cleanupPopup() {
    if (this.outsideClickHandler) {
      document.removeEventListener("mousedown", this.outsideClickHandler);
      this.outsideClickHandler = null;
    }

    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
  },

  removeExistingPopup(selector, hidingClass) {
    const existingPopup = this.popupElement || document.querySelector(selector);

    if (existingPopup && !existingPopup.classList.contains(hidingClass)) {
      existingPopup.remove();
      this.popupElement = null;
    }
  },

  addEnterAnimation(enterClass) {
    requestAnimationFrame(() => {
      this.popupElement.classList.add(enterClass);
    });
  },

  hideWithAnimation(hidingClass, removeDelay = 200) {
    if (!this.state.isVisible) return;
    if (!this.popupElement) return;

    this.state.isVisible = false;
    this.popupElement.classList.add(hidingClass);

    setTimeout(() => {
      if (this.popupElement?.parentNode) {
        this.popupElement.remove();
        this.popupElement = null;
      }
    }, removeDelay);
  },
};
