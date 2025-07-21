import { getCurrentUrl } from "../state/url-state.js";
import { AllPages } from "./all-pages.js";
import { CurrentPage } from "./current-page.js";
import { Component } from "../../components/base-component.js";
import { SearchModal } from "../../components/modal/index.js";

export class App extends Component {
  static currentInstance = null;

  static async create() {
    if (App.currentInstance) {
      return App.currentInstance;
    }

    const $container = document.querySelector(".side-panel");
    App.currentInstance = new App($container, {
      activeTab: "currentPageTab",
    });

    return App.currentInstance;
  }

  static getCurrentInstance() {
    return App.currentInstance;
  }

  setup() {
    this.state = {
      activeTab: this.props.activeTab,
    };
  }

  template() {
    return `
      <div class="app__header">
        <button class="search-icon" id="searchIcon">🔍</button>

        <div class="tabs">
          <button class="tabs__item ${
            this.state.activeTab === "currentPageTab"
              ? "tabs__item--active"
              : ""
          }" id="currentPageTab">Current</button>
          <button class="tabs__item ${
            this.state.activeTab === "allPagesTab" ? "tabs__item--active" : ""
          }" id="allPagesTab">All Pages</button>
        </div>
      </div>

      <div class="tab-content ${
        this.state.activeTab === "currentPageTab" ? "tab-content--active" : ""
      }" id="currentPage"></div>
      <div class="tab-content ${
        this.state.activeTab === "allPagesTab" ? "tab-content--active" : ""
      }" id="allPages"></div>
    `;
  }

  async mounted() {
    if (this.state.activeTab === "currentPageTab") {
      const currentUrl = getCurrentUrl();
      await CurrentPage.create(currentUrl);
    } else if (this.state.activeTab === "allPagesTab") {
      await AllPages.create();
    }
  }

  setEvent() {
    this.addEvent("click", ".tabs__item", (event) => {
      const tabId = event.target.id;
      this.handleTabChange(tabId);
    });

    this.addEvent("click", "#searchIcon", async (event) => {
      event.stopPropagation();

      const searchModal = new SearchModal();
      await searchModal.open();
    });
  }

  async handleTabChange(tabId) {
    if (this.state.activeTab === tabId) return;

    const prevTab = this.$target.querySelector(".tabs__item--active");
    const prevContent = this.$target.querySelector(".tab-content--active");

    if (prevTab) prevTab.classList.remove("tabs__item--active");
    if (prevContent) prevContent.classList.remove("tab-content--active");

    const newTab = document.getElementById(tabId);
    const newContent = document.getElementById(tabId.replace("Tab", ""));

    if (newTab) newTab.classList.add("tabs__item--active");
    if (newContent) newContent.classList.add("tab-content--active");

    this.state.activeTab = tabId;

    switch (tabId) {
      case "currentPageTab":
        const currentUrl = getCurrentUrl();
        if (currentUrl) {
          await CurrentPage.create(currentUrl);
        }
        break;
      case "allPagesTab":
        await AllPages.create();
        break;
    }
  }
}
