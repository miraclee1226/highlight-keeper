import {
  getHighlights,
  scrollToHighlight,
} from "../../bridge/highlight-bridge.js";
import { Component } from "../../components/base-component.js";
import { HighlightCard } from "../../components/card/index.js";
import { Dropdown } from "../../components/dropdown/index.js";
import { createMessageHTML } from "../../components/message/index.js";
import { pageState } from "../../store/page-store.js";

export class CurrentPage extends Component {
  setup() {
    this.state = {
      highlights: [],
    };

    this.dropdown = null;

    this.unsubscribePage = pageState.subscribe(
      async (newPageInfo, prevPageInfo) => {
        this.updatePageHeader(newPageInfo);
        await this.loadHighlights(newPageInfo.url);
      }
    );
  }

  updatePageHeader(newPageInfo) {
    const titleElement = this.$target.querySelector(".current-page-title");
    const urlElement = this.$target.querySelector(".current-page-url");

    if (titleElement) {
      titleElement.textContent = newPageInfo.title || "Untitled Page";
    }

    if (urlElement) {
      urlElement.textContent = newPageInfo.url;
    }
  }

  async loadHighlights(url) {
    try {
      const highlights = await getHighlights(url);
      this.state.highlights = highlights || [];
      this.renderContent();
    } catch (error) {
      console.error("Fail to load highlights:", error);
      this.state.highlights = [];
      this.renderContent();
    }
  }

  template() {
    const pageInfo = pageState.get();

    return `
      <div class="current-page-container">
        <div class="current-page-header">
          <div class="current-page-info">
            <h2 class="current-page-title">
              ${pageInfo.title || "Untitled Page"}
            </h2>
            <p class="current-page-url">${pageInfo.url}</p>
          </div>

          <div class="dropdown-container">
            <button class="more-menu-btn">
              <img src="${chrome.runtime.getURL(
                "/public/icons/more_horiz.svg"
              )}" alt="More options" />
            </button>
          </div>
        </div>

        <div class="highlights-container"></div>
      </div>`;
  }

  async mounted() {
    const pageInfo = pageState.get();

    if (pageInfo.url && this.state.highlights.length === 0) {
      await this.loadHighlights(pageInfo.url);
      return;
    }

    this.initDropdown();
    this.renderContent();
  }

  initDropdown() {
    const menuItems = [
      {
        action: "copy-all",
        label: "Copy All Highlights",
        className: "",
      },
      {
        action: "delete-all",
        label: "Delete All Highlights",
        className: "delete-all",
      },
    ];

    this.dropdown = new Dropdown(this.$target, {
      menuItems,
      onItemClick: this.handleMenuItemClick.bind(this),
    });
  }

  handleMenuItemClick({ action }) {
    switch (action) {
      case "copy-all":
        this.copyAllHighlights();
        break;
      case "delete-all":
        this.deleteAllHighlights();
        break;
      default:
        console.warn("Unknown action:", action);
    }
  }

  renderContent() {
    const highlightsContainer = this.$target.querySelector(
      ".highlights-container"
    );

    highlightsContainer.innerHTML = "";

    if (this.state.highlights.length === 0) {
      createMessageHTML(highlightsContainer, {
        primaryText: "No highlights saved",
        secondaryText: "Drag text to start highlighting!",
      });
    } else {
      this.state.highlights.forEach((highlight) => {
        new HighlightCard(highlightsContainer, { highlight });
      });
    }
  }

  addHighlight(newData) {
    this.state.highlights = [...this.state.highlights, newData];
    this.renderContent();
  }

  updateHighlight(newData) {
    const { uuid } = newData;

    this.state.highlights = this.state.highlights.map((highlight) => {
      return highlight.uuid === uuid ? { ...highlight, ...newData } : highlight;
    });
    this.renderContent();
  }

  removeHighlight(uuid) {
    this.state.highlights = this.state.highlights.filter((highlight) => {
      return highlight.uuid !== uuid;
    });
    this.renderContent();
  }

  setEvent() {
    this.addEvent("click", ".highlight-item", async (event) => {
      try {
        const highlightElement = event.target.closest(".highlight-item");
        const uuid = highlightElement.dataset.id;

        await scrollToHighlight(uuid);
      } catch (error) {
        console.log(error);
      }
    });

    this.addEvent("click", ".more-menu-btn", (event) => {
      event.stopPropagation();

      const button = event.target.closest(".more-menu-btn");
      this.dropdown.show(button);
    });
  }

  // TODO
  deleteAllHighlights() {
    console.log("Delete all highlights");
  }

  cleanup() {
    if (this.unsubscribePage) {
      this.unsubscribePage();
    }

    if (this.dropdown) {
      this.dropdown.cleanup();
    }

    if (this.$target) {
      this.$target.innerHTML = "";
    }
  }
}
