import { Component } from "../base-component.js";
import { PopupMixin } from "../mixin/popup-mixin.js";
import { Button } from "./Button.js";
import { ColorPalette } from "./ColorPalette.js";

export class Toolbar extends Component {
  setup() {
    this.initPopup();

    Object.defineProperty(this, "toolbarElement", {
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
      type: "selection",
      currentColor: this.props.currentColor || "rgb(255, 253, 170)",
    };
  }

  template() {
    return `
    <div class="toolbar"
         style="top: ${this.state.position.top}px; left: ${
      this.state.position.left
    }px;">
      <div class="color-palette-container"></div>
      <div class="toolbar-divider"></div>
      <button class="note-button"></button>
      ${
        this.state.type === "highlight"
          ? '<div class="toolbar-divider"></div><button class="delete-button"></button>'
          : ""
      }
    </div>
  `;
  }

  willUpdate() {
    this.removeExistingPopup(".toolbar", "toolbar--hiding");
  }

  render() {
    if (!this.state.isVisible) return;

    this.$target.insertAdjacentHTML("beforeend", this.template());
    this.toolbarElement = this.$target.querySelector(".toolbar");
    this.mounted();
  }

  didUpdate() {
    this.addEnterAnimation("toolbar--entering");
  }

  mounted() {
    if (!this.state.isVisible || !this.toolbarElement) return;

    this.setupComponents();
    this.setupPopupEventHandlers();
  }

  setupComponents() {
    const colorPalette = this.toolbarElement.querySelector(
      ".color-palette-container"
    );
    const noteButton = this.toolbarElement.querySelector(".note-button");
    const deleteButton = this.toolbarElement.querySelector(".delete-button");
    const currentColor =
      this.state.type === "highlight" ? this.state.currentColor : null;

    new ColorPalette(colorPalette, {
      currentColor,
      onColorSelect: (color) => {
        if (this.props.onColorSelect) {
          this.props.onColorSelect(color);
        }
        this.hide();
      },
    });

    new Button(noteButton, {
      icon: chrome.runtime.getURL("/public/icons/note.svg"),
      text: "Note",
      onClick: () => {
        if (this.props.onNoteClick) {
          this.props.onNoteClick();
        }
        this.hide();
      },
    });

    if (this.state.type === "highlight") {
      new Button(deleteButton, {
        icon: chrome.runtime.getURL("/public/icons/delete.svg"),
        text: "Delete",
        onClick: () => {
          if (this.props.onDeleteClick) {
            this.props.onDeleteClick();
          }
          this.hide();
        },
      });
    }
  }

  show(type = "selection", position = { top: 0, left: 0 }) {
    this.cleanupPopup();
    this.setState({
      isVisible: true,
      type,
      position: this.calculatePosition(position),
    });
  }

  hide() {
    this.hideWithAnimation("toolbar--hiding");
  }

  calculatePosition(position) {
    const toolbarWidth = 200;
    const toolbarHeight = 40;
    let { top, left } = position;

    if (left + toolbarWidth > window.innerWidth) {
      left = window.innerWidth - toolbarWidth - 10;
    }

    if (top < 0) {
      top = position.top + toolbarHeight + 10;
    }

    return { top, left };
  }

  cleanup() {
    this.cleanupPopup();
  }
}

Object.assign(Toolbar.prototype, PopupMixin);
