import { Component } from "../base-component.js";
import { Button } from "./Button.js";
import { ColorPalette } from "./ColorPalette.js";

export class Toolbar extends Component {
  setup() {
    this.outsideClickHandler = null;
    this.scrollHandler = null;
    this.toolbarElement = null;

    this.state = {
      isVisible: false,
      position: { top: 0, left: 0 },
      type: "selection",
      currentColor: this.props.currentColor || "rgb(255, 253, 170)",
    };
  }

  template() {
    if (!this.state.isVisible) return "";

    return `
      <div class="toolbar"
           style="top: ${this.state.position.top}px; left: ${
      this.state.position.left
    }px;">
        <div data-component="color-palette"></div>
        <div class="toolbar-divider"></div>
        <div data-component="note-button"></div>
        ${
          this.state.type === "highlight"
            ? '<div class="toolbar-divider"></div><div data-component="delete-button"></div>'
            : ""
        }
      </div>
    `;
  }

  willUpdate() {
    const existingToolbar =
      this.toolbarElement || document.querySelector(".toolbar");

    if (
      existingToolbar &&
      !existingToolbar.classList.contains("toolbar--hiding")
    ) {
      existingToolbar.remove();
      this.toolbarElement = null;
    }
  }

  render() {
    if (!this.state.isVisible) return;

    this.$target.insertAdjacentHTML("beforeend", this.template());
    this.toolbarElement = this.$target.querySelector(".toolbar");

    this.mounted();
  }

  didUpdate() {
    if (this.toolbarElement) {
      requestAnimationFrame(() => {
        this.toolbarElement.classList.add("toolbar--entering");
      });
    }
  }

  mounted() {
    if (!this.state.isVisible || !this.toolbarElement) return;

    this.setupComponents();
    this.setupEventHandlers();
  }

  setupComponents() {
    const colorPalette = this.toolbarElement.querySelector(
      '[data-component="color-palette"]'
    );
    const noteButton = this.toolbarElement.querySelector(
      '[data-component="note-button"]'
    );
    const deleteButton = this.toolbarElement.querySelector(
      '[data-component="delete-button"]'
    );

    new ColorPalette(colorPalette, {
      currentColor: this.state.currentColor,
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
      className: "note-button",
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
        className: "delete-button",
        onClick: () => {
          if (this.props.onDeleteClick) {
            this.props.onDeleteClick();
          }
          this.hide();
        },
      });
    }
  }

  setupEventHandlers() {
    this.outsideClickHandler = (e) => {
      if (!this.state.isVisible) return;
      if (this.toolbarElement?.contains(e.target)) return;

      this.hide();
    };

    this.scrollHandler = () => {
      if (this.state.isVisible) {
        this.hide();
      }
    };

    document.addEventListener("mousedown", this.outsideClickHandler);
    window.addEventListener("scroll", this.scrollHandler);
  }

  show(type = "selection", position = { top: 0, left: 0 }) {
    this.cleanup();

    this.setState({
      isVisible: true,
      type,
      position: this.calculatePosition(position),
    });
  }

  hide() {
    if (!this.state.isVisible) return;

    this.state.isVisible = false;

    if (this.toolbarElement) {
      this.toolbarElement.classList.add("toolbar--hiding");

      setTimeout(() => {
        if (this.toolbarElement?.parentNode) {
          this.toolbarElement.remove();
          this.toolbarElement = null;
        }
      }, 200);
    }
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
    if (this.outsideClickHandler) {
      document.removeEventListener("mousedown", this.outsideClickHandler);
      this.outsideClickHandler = null;
    }

    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
  }
}
