import { escapeHtml } from "../../utils/formatter.js";

export function createDomainDetailModal(domainData) {
  const modal = document.createElement("div");

  modal.className = "domain-detail-modal";
  modal.innerHTML = createModalHTML(domainData);

  return modal;
}

function createModalHTML(domainData) {
  const { siteName, pages } = domainData;

  return `
    <div class="modal-header">
      <h2>${escapeHtml(siteName)}</h2>
      <button class="close-btn">X</button>
    </div>
    <div class="modal-content">
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
      <div class="page-info">
        <h3 class="page-title">
            ${escapeHtml(pageTitle)}
        </h3>
        <p class="page-url">
            ${escapeHtml(href)}
        </p>
      </div>

      <div class="highlights-container">
      ${displayHighlights
        .map((highlight) => createHighlightPreviewHTML(highlight))
        .join("")}
      ${
        hasMore
          ? `<button class="view-all-btn" data-action="view-all" data-href="${href}">View All Highlights</button>`
          : ""
      }
      </div>
    </div>
  `;
}

function createHighlightPreviewHTML(highlight) {
  const { text, color } = highlight;
  console.log(highlight);

  return `
    <div class="highlight-preview">
      <div class="highlight-dot" style="background-color: ${color};"></div>
      <p class="highlight-text">${escapeHtml(text)}</p>
    </div>
  `;
}
