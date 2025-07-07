import { escapeHtml } from "../../utils/formatter.js";

export function createDomainDetailModal(domainData) {
  const modal = document.createElement("div");

  modal.className = "domain-modal";
  modal.innerHTML = createModalHTML(domainData);

  return modal;
}

function createModalHTML(domainData) {
  const { favicon, siteName, pages } = domainData;

  return `
    <div class="domain-modal__header">
      <div class="domain-modal__site-info">
        <img src="${favicon}" class="domain-modal__favicon" alt="${siteName}">
        <h2 class="domain-modal__title">${escapeHtml(siteName)}</h2>
      </div>
      <button class="domain-modal__close-btn">×</button>
    </div>
    <div class="domain-modal__content">
      ${pages.map((page) => createPageGroupHTML(page)).join("")}
    </div>
  `;
}

function createPageGroupHTML(page) {
  const { pageTitle, href, highlights, highlightCount } = page;
  const displayHighlights = highlights.slice(0, 3);
  const hasMore = highlightCount > 3;

  return `
    <div class="page-group">
      <div class="page-group__info">
        <h3 class="page-group__title">
            ${escapeHtml(pageTitle)}
        </h3>
        <p class="page-group__url">
            ${escapeHtml(href)}
        </p>
      </div>

      <div class="page-group__highlights">
        ${displayHighlights
          .map((highlight) => createHighlightPreviewHTML(highlight))
          .join("")}
        ${
          hasMore
            ? `<button class="page-group__view-all-btn" data-action="view-all" data-href="${href}">View All Highlights</button>`
            : ""
        }
      </div>
    </div>
  `;
}

function createHighlightPreviewHTML(highlight) {
  const { text, color } = highlight;

  return `
    <div class="highlight-preview">
      <div class="highlight-preview__dot" style="background-color: ${color};"></div>
      <p class="highlight-preview__text">${escapeHtml(text)}</p>
    </div>
  `;
}
