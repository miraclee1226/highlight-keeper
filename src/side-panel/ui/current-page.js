import {
  getHighlights,
  scrollToHighlight,
} from "../../bridge/highlight-bridge.js";
import { Component } from "../../components/base-component.js";
import { HighlightCard } from "../../components/card/index.js";
import { createMessageHTML } from "../../components/message/index.js";

export class CurrentPage extends Component {
  static currentInstance = null;

  static async create(url) {
    try {
      if (CurrentPage.currentInstance) {
        CurrentPage.currentInstance.cleanup();
      }

      const $container = document.getElementById("currentPage");
      const highlights = await getHighlights(url);

      CurrentPage.currentInstance = new CurrentPage($container, {
        highlights: highlights || [],
      });

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

  setup() {
    this.state = {
      highlights: this.props.highlights || [],
    };
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
    if (this.$target) {
      this.$target.innerHTML = "";
    }

    CurrentPage.currentInstance = null;
  }
}
