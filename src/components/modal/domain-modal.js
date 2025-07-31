import { getDomainDetails } from "../../bridge/domain-bridge.js";
import { escapeHtml } from "../../side-panel/utils/formatter.js";
import { PageHighlightsModal } from "./page-highlights-modal.js";
import { ModalManager } from "./modal-manager.js";

export class DomainModal {
  constructor(domainData) {
    this.modalType = "bottom";
    this.domainData = domainData;
  }

  static open(domainData) {
    const modal = new DomainModal(domainData);

    ModalManager.getInstance().openModal(modal);

    return modal;
  }

  template() {
    const { siteName, pages, favicon } = this.domainData;

    return `
      <div class="domain-modal">
        <div class="domain-modal__header">
          <div class="domain-modal__site-info">
            <img src="${favicon}" class="domain-modal__favicon" alt="${siteName}">
            <h2 class="domain-modal__title">${escapeHtml(siteName)}</h2>
          </div>
          <button class="modal__close-btn">×</button>
        </div>
        <div class="domain-modal__content">
          ${pages?.map((page) => this.createPageGroupHTML(page)).join("")}
        </div>
      </div>
    `;
  }

  createPageGroupHTML(page) {
    const { pageTitle, href, highlights, highlightCount } = page;
    const displayHighlights = highlights.slice(0, 3);
    const hasMore = highlightCount > 3;

    return `
      <div class="domain-modal__page-group">
        <div class="domain-modal__page-info">
          <h3 class="domain-modal__page-title">
              ${escapeHtml(pageTitle)}
          </h3>
          <p class="domain-modal__page-url">
              ${escapeHtml(href)}
          </p>
        </div>

        <div class="domain-modal__page-highlights">
          ${displayHighlights
            .map((highlight) => this.createHighlightPreviewHTML(highlight))
            .join("")}
          ${
            hasMore
              ? `<button class="domain-modal__view-all-btn" data-action="view-all" data-href="${href}" data-page-title="${pageTitle}">View All Highlights</button>`
              : ""
          }
        </div>
      </div>
    `;
  }

  createHighlightPreviewHTML(highlight) {
    const { text, color } = highlight;

    return `
      <div class="domain-modal__highlight-preview">
        <div class="domain-modal__highlight-dot" style="background-color: ${color}"></div>
        <p class="domain-modal__highlight-text">${escapeHtml(text)}</p>
      </div>
    `;
  }

  setEvents() {
    this.element.addEventListener("click", (event) => {
      const viewAllBtn = event.target.closest(".domain-modal__view-all-btn");

      if (!viewAllBtn) return;

      const href = viewAllBtn?.dataset.href;
      const pageTitle = viewAllBtn?.dataset.pageTitle;

      PageHighlightsModal.open({ href, pageTitle });
    });
  }

  isHighlightBelongsToThisDomain(highlightData) {
    return highlightData.domain === this.domainData.domain;
  }

  isHighlightInThisDomain(uuid) {
    return this.domainData.pages.some((page) =>
      page.highlights.some((highlight) => highlight.uuid === uuid)
    );
  }

  async refreshDomainModalData() {
    try {
      const doaminDetails = await getDomainDetails();
      const updatedDomain = doaminDetails.find(
        (data) => data.domain === this.domainData.domain
      );

      if (updatedDomain) {
        this.domainData = updatedDomain;
        this.updateModalContent();
      } else {
        ModalManager.getInstance().closeModal(this);
      }
    } catch (error) {
      console.error("Domain modal update failed:", error);
    }
  }

  updateModalContent() {
    const $content = this.element.querySelector(".domain-modal__content");

    $content.innerHTML = this.domainData.pages
      .map((page) => this.createPageGroupHTML(page))
      .join("");

    this.setEvents();
  }
}
