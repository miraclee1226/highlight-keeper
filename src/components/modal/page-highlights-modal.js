import { Modal } from "./base-modal.js";
import { HighlightCard } from "../card/index.js";
import { getHighlights } from "../../bridge/highlight-bridge.js";
import { escapeHtml } from "../../side-panel/utils/formatter.js";

export class PageHighlightsModal extends Modal {
  static currentInstance = null;

  constructor({ href, pageTitle }) {
    super();

    if (PageHighlightsModal.currentInstance) {
      PageHighlightsModal.currentInstance.close();
    }

    PageHighlightsModal.currentInstance = this;

    this.modalType = "bottom";
    this.href = href;
    this.pageTitle = pageTitle;
    this.highlights = [];
  }

  static getCurrentInstance() {
    return PageHighlightsModal.currentInstance;
  }

  template() {
    return `
      <div class="page-highlights-modal">
        <div class="page-highlights-modal__header">
          <div class="page-highlights-modal__info">
            <h2 class="page-highlights-modal__title">
              ${escapeHtml(this.pageTitle)}
            </h2>
            <p class="page-highlights-modal__url">${escapeHtml(this.href)}</p>
          </div>
          <button class="modal__close-btn">×</button>
        </div>
        <div class="page-highlights-modal__content" id="pageHighlightsList"></div>
      </div>`;
  }

  async open() {
    super.open();

    this.highlights = await getHighlights(this.href);

    this.renderHighlights();
  }

  isChangeRelevantToThisPage(request) {
    switch (request.action) {
      case "highlight_created":
        return request.data.href === this.href;

      case "highlight_updated":
        return this.isHighlightInCurrentPage(request.data.uuid);

      case "highlight_deleted":
        return this.isHighlightInCurrentPage(request.data.uuid);

      default:
        return false;
    }
  }

  isHighlightInCurrentPage(uuid) {
    return this.highlights.some((highlight) => highlight.uuid === uuid);
  }

  async refreshPageModalData() {
    try {
      const highlights = await getHighlights(this.href);

      if (highlights && highlights.length > 0) {
        this.highlights = highlights;
        this.renderHighlights();
      } else {
        this.close();
      }
    } catch (error) {
      console.error("Page Modal update failed:", error);
    }
  }

  renderHighlights() {
    const $highlightContainer = this.element.querySelector(
      "#pageHighlightsList"
    );

    if (!$highlightContainer) return;

    $highlightContainer.innerHTML = "";

    this.highlights.forEach((highlight) => {
      new HighlightCard($highlightContainer, { highlight });
    });
  }

  destroy() {
    super.destroy();
    PageHighlightsModal.currentInstance = null;
  }
}
