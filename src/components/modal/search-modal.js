import { Modal } from "./base-modal.js";
import { getDomainDetails } from "../../bridge/domain-bridge.js";
import { DomainCard } from "../card/domain-card.js";
import { debounce } from "../../side-panel/utils/debounce.js";
import { createMessageHTML } from "../message/index.js";
import { PageHighlightsModal } from "./page-highlights-modal.js";

export class SearchModal extends Modal {
  constructor() {
    super();
    this.modalType = "center";
    this.searchTimeout = null;
    this.allHighlights = [];
  }

  template() {
    return `
      <div class="search-modal">
        <div class="search-modal__header">
          <div class="search-modal__search-box">
            <span class="search-modal__search-icon">🔍</span>
            <input type="text" class="search-modal__input" placeholder="Search highlights..." id="searchInput">
          </div>
        </div>
        
        <div class="search-modal__content" id="searchResults">
        </div>
      </div>
    `;
  }

  async open() {
    super.open();

    await this.loadAllHighlights();

    this.renderSearchResults(this.allHighlights);

    const $input = this.element.querySelector("#searchInput");
    if ($input) $input.focus();
  }

  async loadAllHighlights() {
    try {
      const domainDetails = await getDomainDetails();
      this.allHighlights = [];

      domainDetails.forEach((domain) => {
        domain.pages.forEach((page) => {
          page.highlights.forEach((highlight) => {
            this.allHighlights.push({
              favicon: domain.favicon,
              siteName: domain.siteName,
              text: highlight.text,
              href: page.href,
              color: highlight.color,
              pageTitle: page.pageTitle,
            });
          });
        });
      });
    } catch (error) {
      console.error("Error loading highlights:", error);
      this.allHighlights = [];
    }
  }

  handleSearchInput(event) {
    const text = event.target.value.trim();
    const results = this.searchInHighlights(text);

    this.renderSearchResults(results);
  }

  searchInHighlights(text) {
    if (!text || text.trim() === "") {
      return this.allHighlights;
    }

    const lowerText = text.toLowerCase();
    const filteredText = this.allHighlights.filter(
      (item) =>
        item.text.toLowerCase().includes(lowerText) ||
        item.href.toLowerCase().includes(lowerText) ||
        item.pageTitle.toLowerCase().includes(lowerText)
    );

    return filteredText;
  }

  renderSearchResults(results) {
    const $container = this.element.querySelector("#searchResults");
    if (!$container) return;

    $container.innerHTML = "";

    if (results.length === 0) {
      createMessageHTML($container, {
        primaryText: "No highlights found",
        secondaryText: "Please try again later",
      });
    } else {
      results.forEach((result) => {
        new DomainCard($container, result);
      });
    }
  }

  setEvent() {
    super.setEvent();

    const $searchInput = this.element.querySelector("#searchInput");
    const $searchResults = this.element.querySelector("#searchResults");

    if (!$searchInput || !$searchResults) return;

    $searchInput.addEventListener(
      "input",
      debounce((event) => {
        this.handleSearchInput(event);
      }, 500)
    );

    $searchResults.addEventListener("click", (event) => {
      const domainItem = event.target.closest(".domain-item");

      if (domainItem) {
        this.handleDomainCardClick(domainItem);
      }
    });
  }

  handleDomainCardClick(domainItem) {
    const infoElement = domainItem?.querySelector(".domain-item__info");
    const titleElement = infoElement.querySelector(".domain-item__title");
    const urlElement = infoElement.querySelector(".domain-item__url");

    if (!titleElement || !urlElement) return;

    const highlightText = titleElement.textContent;
    const href = urlElement.textContent;

    const matchingHighlight = this.allHighlights.find(
      (highlight) => highlight.href === href && highlight.text === highlightText
    );

    if (matchingHighlight) {
      const pageHighlightsModal = new PageHighlightsModal({
        href: matchingHighlight.href,
        pageTitle: matchingHighlight.pageTitle,
      });

      pageHighlightsModal.open();
    } else {
      console.log("No matching highlight found");
    }
  }
}
