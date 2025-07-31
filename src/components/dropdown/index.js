import { Component } from "../base-component.js";
import { PopupMixin } from "../mixin/popup-mixin.js";

export class Dropdown extends Component {
  setup() {
    this.initPopup();

    Object.defineProperty(this, "menuElement", {
      get() {
        return this.popupElement;
      },
      set(value) {
        this.popupElement = value;
      },
    });

    this.state = {
      isVisible: false,
      position: { top: 0, left: 0 },
    };

    this.triggerElement = this.props.triggerElement;
    this.menuItems = this.props.menuItems || [];
    this.onItemClick = this.props.onItemClick || (() => {});
  }

  template() {
    return `
      <ul class="dropdown-list" 
          style="top: ${this.state.position.top}px; left: ${
      this.state.position.left
    }px;">
        ${this.menuItems
          .map(
            (item) => `
          <li>
            <button class="dropdown-item ${item.className || ""}" 
                    data-action="${item.action}">
              ${item.label}
              ${
                item.icon
                  ? `<img src="${item.icon}" alt="${item.label}" />`
                  : ""
              }
            </button>
          </li>
        `
          )
          .join("")}
      </ul>
    `;
  }

  willUpdate() {
    this.removeExistingPopup(".dropdown-list", "dropdown-list--hiding");
  }

  render() {
    if (!this.state.isVisible) return;

    this.$target.insertAdjacentHTML("beforeend", this.template());
    this.menuElement = this.$target.querySelector(".dropdown-list");
    this.mounted();
  }

  didUpdate() {
    this.addEnterAnimation("dropdown-list--entering");
  }

  mounted() {
    if (!this.state.isVisible || !this.menuElement) return;

    this.setupMenuEventHandlers();
    this.setupPopupEventHandlers([this.triggerElement]);
  }

  setupMenuEventHandlers() {
    this.menuElement.addEventListener("click", (event) => {
      event.stopPropagation();

      const menuItem = event.target.closest(".dropdown-item");
      if (!menuItem) return;

      const action = menuItem.dataset.action;
      const label = menuItem.textContent.trim();

      this.onItemClick({ action, label, element: menuItem });
      this.hide();
    });
  }

  show(triggerElement) {
    this.cleanupPopup();

    this.triggerElement = triggerElement || this.triggerElement;
    const position = this.calculatePosition(this.triggerElement);

    this.setState({
      isVisible: true,
      position,
    });
  }

  hide() {
    this.hideWithAnimation("dropdown-list--hiding");
    this.setState({
      isVisible: false,
    });
  }

  calculatePosition(triggerElement) {
    const rect = triggerElement.getBoundingClientRect();

    return {
      top: window.scrollY + rect.bottom + 5,
      left: window.scrollX + rect.right - 160,
    };
  }

  cleanup() {
    this.cleanupPopup();
  }
}

Object.assign(Dropdown.prototype, PopupMixin);
