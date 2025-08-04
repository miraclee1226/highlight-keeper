import { getDomainDetails } from "../../bridge/domain-bridge.js";
import { Component } from "../../components/base-component.js";
import { DomainCard } from "../../components/card/index.js";
import { createMessageHTML } from "../../components/message/index.js";
import { DomainModal } from "../../components/modal/index.js";

export class AllPages extends Component {
  setup() {
    this.state = {
      domains: [],
    };
    this.hasError = false;
    this.clickHandler = null;
  }

  async loadDomainDetails() {
    try {
      const domainDetails = await getDomainDetails();
      this.state.domains = domainDetails || [];
      this.hasError = false;
    } catch (error) {
      console.error("Failed to load domain details:", error);
      this.state.domains = [];
      this.hasError = true;
    }
  }

  async mounted() {
    await this.loadDomainDetails();
    this.renderContent();
  }

  renderContent() {
    this.$target.innerHTML = "";

    if (this.hasError) {
      createMessageHTML(this.$target, {
        primaryText: "Unable to load highlights",
        secondaryText: "Please refresh the page or try again later",
        isError: true,
      });
      return;
    }

    if (this.state.domains.length === 0) {
      createMessageHTML(this.$target, {
        primaryText: "No highlights found",
        secondaryText: "Drag text to start highlighting!",
      });
      return;
    }

    this.state.domains.forEach((domain) => {
      new DomainCard(this.$target, domain);
    });
  }

  async updateDomainsData(newDomainDetails) {
    this.state.domains = newDomainDetails;
    this.hasError = false;
    this.renderContent();
  }

  setEvent() {
    this.removeEvents();

    this.clickHandler = (event) => {
      const domainElement = event.target.closest(".domain-item");
      if (!domainElement) return;

      const siteName = domainElement.querySelector(
        ".domain-item__title"
      )?.textContent;
      if (!siteName) return;

      const clickedDomain = this.state.domains.find(
        (domain) => domain.siteName === siteName
      );

      if (clickedDomain) {
        DomainModal.open(clickedDomain);
      }
    };

    this.$target.addEventListener("click", this.clickHandler);
  }

  removeEvents() {
    if (this.clickHandler && this.$target) {
      this.$target.removeEventListener("click", this.clickHandler);
      this.clickHandler = null;
    }
  }

  cleanup() {
    this.removeEvents();

    if (this.$target) {
      this.$target.innerHTML = "";
    }
  }
}
