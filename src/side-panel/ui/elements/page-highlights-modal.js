import { escapeHtml } from "../../utils/formatter.js";
import { createHighlightElement } from "./highlight-element.js";

export function createPageHighlightsModal(pageData) {
  const modal = document.createElement("div");

  modal.className = "page-highlights-modal";
  modal.innerHTML = createPageModalHTML(pageData);

  return modal;
}

function createPageModalHTML(pageData) {
  const { pageTitle, href } = pageData;

  return `
    <div class="page-highlights-modal__header">
      <div class="page-highlights-modal__info">
        <h2 class="page-highlights-modal__title">${escapeHtml(pageTitle)}</h2>
        <p class="page-highlights-modal__url">${escapeHtml(href)}</p>
      </div>
      <button class="page-highlights-modal__close-btn">×</button>
    </div>
    <div class="page-highlights-modal__content">
      <div class="page-highlights-modal__highlights" id="pageHighlightsList">
      </div>
    </div>
  `;
}

export function renderPageHighlights(modal, highlights) {
  const container = modal.querySelector("#pageHighlightsList");

  container.innerHTML = "";

  highlights.forEach((highlight) => {
    const element = createHighlightElement(highlight);
    container.appendChild(element);
  });
}
