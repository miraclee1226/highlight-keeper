import {
  getHighlights,
  scrollToHighlight,
} from "../../bridge/highlight-bridge.js";
import { Component } from "../../components/base-component.js";
import { HighlightCard } from "../../components/card/index.js";
import { createMessageHTML } from "../../components/message/index.js";
import { urlState } from "../store/index.js";

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
    };

    this.unsubscribeUrl = urlState.subscribe(async (newUrl, prevUrl) => {
      if (newUrl && this.isVisible()) {
        await this.loadHighlights(newUrl);
      }
    });

    const url = urlState.get();

    if (url) {
      await this.loadHighlights(url);
    }
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
    if (this.state.highlights.length === 0) {
      createMessageHTML(this.$target, {
        primaryText: "No highlights saved",
        secondaryText: "Drag text to start highlighting!",
      });
    } else {
      this.state.highlights.forEach((highlight) => {
        new HighlightCard(this.$target, {
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
  }

  cleanup() {
    if (this.unsubscribeUrl) {
      this.unsubscribeUrl();
    }

    if (this.$target) {
      this.$target.innerHTML = "";
    }

    CurrentPage.currentInstance = null;
  }
}
