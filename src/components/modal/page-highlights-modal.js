import { ModalManager } from "./modal-manager.js";
import { HighlightCard } from "../card/index.js";
import { getHighlights } from "../../bridge/highlight-bridge.js";
import { escapeHtml } from "../../side-panel/utils/formatter.js";

export class PageHighlightsModal {
  static instance;

  constructor({ uuid, href, pageTitle }) {
    if (PageHighlightsModal.instance) {
      ModalManager.getInstance().closeModal(PageHighlightsModal.instance);
    }

    PageHighlightsModal.instance = this;

    this.uuid = uuid;
    this.href = href;
    this.pageTitle = pageTitle;
    this.highlights = [];
    this.modalType = "bottom";
  }

  static async open({ uuid, href, pageTitle }) {
    const modal = new PageHighlightsModal({ uuid, href, pageTitle });

    ModalManager.getInstance().openModal(modal);

    modal.initialize();

    return modal;
  }

  static getInstance() {
    return PageHighlightsModal.instance;
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
        <div class="page-highlights-modal__content" id="pageHighlightsList">
        </div>
      </div>`;
  }

  async initialize() {
    try {
      this.highlights = await getHighlights(this.href);
      this.renderHighlights();

      if (this.uuid) {
        this.scrollToHighlight();
      }
    } catch (error) {
      console.error("Failed to load highlights:", error);
    }
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
        ModalManager.getInstance().closeModal(this);
      }
    } catch (error) {
      console.error("Page Modal update failed:", error);
    }
  }

  renderHighlights() {
    const $highlightContainer = this.element.querySelector(
      "#pageHighlightsList"
    );

    $highlightContainer.innerHTML = "";

    this.highlights.forEach((highlight) => {
      new HighlightCard($highlightContainer, { highlight });
    });
  }

  scrollToHighlight() {
    setTimeout(() => {
      const targetElement = this.element.querySelector(
        `[data-id="${this.uuid}"]`
      );

      if (targetElement) {
        targetElement.classList.add("highlight-target");

        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(() => {
          targetElement.classList.remove("highlight-target");
        }, 3000);
      } else {
        console.log(`Highlight with UUID ${this.uuid} not found.`);
      }
    }, 500);
  }

  destroy() {
    PageHighlightsModal.instance = null;
  }
}
