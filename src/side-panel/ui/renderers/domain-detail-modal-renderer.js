import { createDomainDetailModal } from "../elements/domain-detail-modal.js";

let currentModal = null;
let currentOverlay = null;

export function openDomainDetailModal(domainData) {
  currentOverlay = createModalOverlay();
  document.body.appendChild(currentOverlay);

  currentModal = createDomainDetailModal(domainData);
  document.body.appendChild(currentModal);

  handleCloseButton(currentModal);

  setTimeout(() => {
    if (currentOverlay) currentOverlay.classList.add("active");
    if (currentModal) currentModal.classList.add("active");
  }, 10);

  currentOverlay.addEventListener("click", closeDomainDetailModal);
}

function createModalOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  return overlay;
}

function closeDomainDetailModal() {
  if (currentModal) {
    currentModal.classList.remove("active");
  }

  if (currentOverlay) {
    currentOverlay.classList.remove("active");
  }

  setTimeout(() => {
    cleanupModal();
  }, 300);
}

function handleCloseButton(modal) {
  const closeBtn = modal.querySelector(".domain-modal__close-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      closeDomainDetailModal();
    });
  }
}

function cleanupModal() {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
}
