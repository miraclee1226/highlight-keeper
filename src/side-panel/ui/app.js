import { AllPages } from "./all-pages.js";
import { CurrentPage } from "./current-page.js";
import { Component } from "../../components/base-component.js";
import { SearchModal } from "../../components/modal/index.js";

export class App extends Component {
  static instance;

  constructor(
    $container = document.body,
    props = { activeTab: "currentPageTab" }
  ) {
    if (App.instance) return App.instance;

    super($container, props);

    App.instance = this;
  }

  static getInstance() {
    return App.instance;
  }

  setup() {
    this.state = {
      activeTab: this.props.activeTab,
    };

    this.currentPageInstance = null;
    this.allPagesInstance = null;

    this.TAB_CONFIG = {
      currentPageTab: "#currentPageContent",
      allPagesTab: "#allPagesContent",
    };
  }

  template() {
    return `
    <div class="side-panel">

      <div class="app__header">
        <div class="tabs">
          <button class="tabs__item ${
            this.state.activeTab === "currentPageTab"
              ? "tabs__item--active"
              : ""
          }" id="currentPageTab">Current</button>
          <button class="tabs__item ${
            this.state.activeTab === "allPagesTab" ? "tabs__item--active" : ""
          }" id="allPagesTab">Sites</button>
        </div>

        <button class="search-icon">🔍</button>
      </div>

      <div class="tab-content ${
        this.state.activeTab === "currentPageTab" ? "tab-content--active" : ""
      }" id="currentPageContent"></div>
      <div class="tab-content ${
        this.state.activeTab === "allPagesTab" ? "tab-content--active" : ""
      }" id="allPagesContent"></div>
    </div>
    `;
  }

  mounted() {
    const contentSelector = this.TAB_CONFIG[this.state.activeTab];
    const content = this.$target.querySelector(contentSelector);

    if (this.state.activeTab === "currentPageTab") {
      this.currentPageInstance = new CurrentPage(content);
    } else if (this.state.activeTab === "allPagesTab") {
      this.allPagesInstance = new AllPages(content);
    }
  }

  setEvent() {
    this.addEvent("click", ".tabs__item", (event) => {
      const tabId = event.target.id;
      this.handleTabChange(tabId);
    });

    this.addEvent("click", ".search-icon", async (event) => {
      event.stopPropagation();
      SearchModal.open();
    });
  }

  async handleTabChange(tabId) {
    if (this.state.activeTab === tabId) return;

    this.cleanupPreviousTab();
    this.updateTabUI(tabId);
    this.state.activeTab = tabId;
    this.initializeNewTab(tabId);
  }

  cleanupPreviousTab() {
    if (this.currentPageInstance) {
      this.currentPageInstance.cleanup();
      this.currentPageInstance = null;
    }

    if (this.allPagesInstance) {
      this.allPagesInstance.cleanup();
      this.allPagesInstance = null;
    }
  }

  updateTabUI(tabId) {
    this.$target.querySelectorAll(".tabs__item").forEach((tab) => {
      tab.classList.remove("tabs__item--active");
    });

    this.$target.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("tab-content--active");
    });

    const newTab = this.$target.querySelector(`#${tabId}`);
    const newContent = this.$target.querySelector(this.TAB_CONFIG[tabId]);

    if (newTab) newTab.classList.add("tabs__item--active");
    if (newContent) newContent.classList.add("tab-content--active");
  }

  initializeNewTab(tabId) {
    const targetContainer = this.$target.querySelector(this.TAB_CONFIG[tabId]);

    switch (tabId) {
      case "currentPageTab":
        this.currentPageInstance = new CurrentPage(targetContainer);
        break;
      case "allPagesTab":
        this.allPagesInstance = new AllPages(targetContainer);
        break;
    }
  }

  getCurrentPageInstance() {
    return this.currentPageInstance;
  }

  getAllPagesInstance() {
    return this.allPagesInstance;
  }
}
