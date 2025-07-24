import {
  getHighlights,
  scrollToHighlight,
} from "../../bridge/highlight-bridge.js";
import { Component } from "../../components/base-component.js";
import { HighlightCard } from "../../components/card/index.js";
import { createMessageHTML } from "../../components/message/index.js";
import { pageState } from "../store/page-store.js";

export class CurrentPage extends Component {
  static currentInstance = null;

  static async create() {
    try {
      if (CurrentPage.currentInstance) {
        CurrentPage.currentInstance.cleanup();
      }

      const $container = document.getElementById("currentPage");

      CurrentPage.currentInstance = new CurrentPage($container);

      return CurrentPage.currentInstance;
    } catch (error) {
      const $container = document.getElementById("currentPage");
      createMessageHTML($container, {
        primaryText: "Unable to load highlights",
        secondaryText: "Please refresh the page or try again later",
        isError: true,
      });
    }
  }

  static getCurrentInstance() {
    return CurrentPage.currentInstance;
  }

  async setup() {
    this.state = {
      highlights: [],
      pageInfo: pageState.get() || { url: null, title: null },
    };

    this.unsubscribePage = pageState.subscribe(
      async (newPageInfo, prevPageInfo) => {
        if (newPageInfo?.url && this.isVisible()) {
          this.setState({ pageInfo: newPageInfo });
          await this.loadHighlights(newPageInfo.url);
        }
      }
    );

    const url = pageState.get().url;

    if (url) {
      await this.loadHighlights(url);
    }
  }

  template() {
    const pageInfo = this.state.pageInfo;

    return `
      <div class="current-page-container">
        <div class="current-page-header">
          <div class="current-page-info">
            <h2 class="current-page-title">${
              pageInfo.title || "Untitled Page"
            }</h2>
            <p class="current-page-url">${pageInfo.url}</p>
          </div>

          <button class="more-menu-btn">
            <img src="${chrome.runtime.getURL(
              "/public/icons/more_horiz.svg"
            )}" alt="More options" />
          </button>
        </div>
        
        <div class="highlights-container"></div>
    </div>`;
  }

  isVisible() {
    return this.$target && this.$target.closest(".tab-content--active");
  }

  async loadHighlights(url) {
    try {
      const highlights = await getHighlights(url);
      this.setState({ highlights: highlights || [] });
    } catch (error) {
      console.error("Fail to load highlights:", error);
      this.setState({ highlights: [] });
    }
  }

  mounted() {
    const highlightsContainer = this.$target.querySelector(
      ".highlights-container"
    );

    if (this.state.highlights.length === 0) {
      createMessageHTML(highlightsContainer, {
        primaryText: "No highlights saved",
        secondaryText: "Drag text to start highlighting!",
      });
    } else {
      this.state.highlights.forEach((highlight) => {
        new HighlightCard(highlightsContainer, {
          highlight,
        });
      });
    }
  }

  addHighlight(newData) {
    const updatedHighlights = [...this.state.highlights, newData];

    this.setState({ highlights: updatedHighlights });
  }

  updateHighlight(newData) {
    const { uuid } = newData;
    const updatedHighlights = this.state.highlights.map((highlight) => {
      return highlight.uuid === uuid ? { ...highlight, ...newData } : highlight;
    });

    this.setState({ highlights: updatedHighlights });
  }

  removeHighlight(uuid) {
    const updatedHighlights = this.state.highlights.filter((highlight) => {
      return highlight.uuid !== uuid;
    });

    this.setState({ highlights: updatedHighlights });
  }

  update() {
    this.willUpdate();
    this.$target.innerHTML = "";
    this.render();
    this.didUpdate();
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
      console.log("more menu clicked");
    });
  }

  cleanup() {
    if (this.unsubscribePage) {
      this.unsubscribePage();
    }

    if (this.$target) {
      this.$target.innerHTML = "";
    }

    CurrentPage.currentInstance = null;
  }
}
