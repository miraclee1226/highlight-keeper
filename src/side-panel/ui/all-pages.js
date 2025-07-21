import { getDomainDetails } from "../../bridge/domain-bridge.js";
import { Component } from "../../components/base-component.js";
import { DomainCard } from "../../components/card/index.js";
import { createMessageHTML } from "../../components/message/index.js";
import { DomainModal } from "../../components/modal/index.js";

export class AllPages extends Component {
  static currentInstance = null;

  static async create() {
    try {
      if (AllPages.currentInstance) {
        AllPages.currentInstance.cleanup();
      }

      const $container = document.getElementById("allPages");
      const domainDetails = await getDomainDetails();

      AllPages.currentInstance = new AllPages($container, {
        domainDetails: domainDetails || [],
      });

      return AllPages.currentInstance;
    } catch (error) {
      const $container = document.getElementById("allPages");
      createMessageHTML($container, {
        primaryText: "Unable to load highlights",
        secondaryText: "Please refresh the page or try again later",
        isError: true,
      });
    }
  }

  static getCurrentInstance() {
    return AllPages.currentInstance;
  }

  setup() {
    this.state = {
      domains: this.props.domainDetails || [],
    };
  }

  mounted() {
    if (this.state.domains.length === 0) {
      createMessageHTML(this.$target, {
        primaryText: "No highlights found",
        secondaryText: "Drag text to start highlighting!",
      });
    } else {
      this.state.domains.forEach((domain) => {
        new DomainCard(this.$target, domain);
      });
    }
  }

  updateDomainsData(newDomainDetails) {
    this.setState({ domains: newDomainDetails });
  }

  update() {
    this.willUpdate();
    this.$target.innerHTML = "";

    this.render();
    this.didUpdate();
  }

  setEvent() {
    this.addEvent("click", ".domain-item", (event) => {
      const domainElement = event.target.closest(".domain-item");
      const siteName =
        domainElement.querySelector(".domain-item__name").textContent;
      const clickedDomain = this.state.domains.find(
        (domain) => domain.siteName === siteName
      );

      if (clickedDomain) {
        const domainModal = new DomainModal(clickedDomain);
        domainModal.open();
      }
    });
  }

  cleanup() {
    if (this.$target) {
      this.$target.innerHTML = "";
    }

    AllPages.currentInstance = null;
  }
}
