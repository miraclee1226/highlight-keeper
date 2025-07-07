import { escapeHtml } from "../../utils/formatter.js";

export function createSearchModal() {
  const modal = document.createElement("div");

  modal.className = "search-modal";
  modal.innerHTML = createSearchModalHTML();

  return modal;
}

function createSearchModalHTML() {
  return `
    <div class="search-modal__header">
      <div class="search-modal__search-box">
        <span class="search-modal__search-icon">🔍</span>
        <input type="text" class="search-modal__input" placeholder="Search highlights..." id="searchInput">
      </div>
    </div>
    
    <div class="search-modal__content" id="searchResults">
    </div>
  `;
}

export function createSearchResultElement(result) {
  const { text, href, favicon, siteName } = result;
  const element = document.createElement("div");

  element.className = "search-result-item";
  element.innerHTML = `
    <img src="${favicon}" class="search-result__favicon" alt="${siteName}">
    <div class="search-result__content">
      <div class="search-result__text">${escapeHtml(text)}</div>
      <div class="search-result__url">${escapeHtml(href)}</div>
    </div>
  `;

  return element;
}
