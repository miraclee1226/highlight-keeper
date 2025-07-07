import {
  createPageHighlightsModal,
  renderPageHighlights,
} from "../elements/page-highlights-modal.js";

let currentPageModal = null;
let currentPageOverlay = null;

export async function openPageHighlightsModal(pageData, highlights) {
  try {
    currentPageOverlay = createPageModalOverlay();
    document.body.appendChild(currentPageOverlay);

    currentPageModal = createPageHighlightsModal(pageData, highlights);
    document.body.appendChild(currentPageModal);

    renderPageHighlights(currentPageModal, highlights);
    handleCloseButton(currentPageModal);

    setTimeout(() => {
      if (currentPageOverlay) currentPageOverlay.classList.add("active");
      if (currentPageModal) currentPageModal.classList.add("active");
    }, 10);

    currentPageOverlay.addEventListener("click", closePageHighlightsModal);
  } catch (error) {
    console.error("Failed to load page highlights:", error);
  }
}

function createPageModalOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "page-modal-overlay";

  return overlay;
}

function closePageHighlightsModal() {
  if (currentPageModal) {
    currentPageModal.classList.remove("active");
  }

  if (currentPageOverlay) {
    currentPageOverlay.classList.remove("active");
  }

  setTimeout(() => {
    cleanupPageModal();
  }, 300);
}

function handleCloseButton(modal) {
  const closeBtn = modal.querySelector(".page-highlights-modal__close-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      closePageHighlightsModal();
    });
  }
}

function cleanupPageModal() {
  if (currentPageModal) {
    currentPageModal.remove();
    currentPageModal = null;
  }
  if (currentPageOverlay) {
    currentPageOverlay.remove();
    currentPageOverlay = null;
  }
}
