import { Component } from "../base-component";
import { Button } from "./components/Button";
import { ColorPalette } from "./components/ColorPalette";
// TODO: import COLORS
// import { COLORS } from "./../../constant/colors";

export class Toolbar extends Component {
  setup() {
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

  render() {
    const toolbarElement = document.querySelector(".toolbar");
    if (toolbarElement) {
      toolbarElement.remove();
    }

    if (this.state.isVisible) {
      this.$target.insertAdjacentHTML("beforeend", this.template());

      requestAnimationFrame(() => {
        const newToolbar = document.querySelector(".toolbar");
        if (newToolbar) {
          newToolbar.classList.add("toolbar--entering");
        }
      });
      this.mounted();
    }
  }

  mounted() {
    if (!this.state.isVisible) return;

    const colorPalette = this.$target.querySelector(
      '[data-component="color-palette"]'
    );
    const noteButton = this.$target.querySelector(
      '[data-component="note-button"]'
    );
    const deleteButton = this.$target.querySelector(
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

  setEvent() {
    this.outsideClickHandler = this.handleOutsideClick.bind(this);
    document.addEventListener("mousedown", this.outsideClickHandler);
  }

  show(type = "selection", position = { top: 0, left: 0 }) {
    this.setState({
      isVisible: true,
      type,
      position: this.adjustPosition(position),
    });
  }

  hide() {
    const toolbar = this.$target.querySelector(".toolbar");
    if (toolbar) {
      toolbar.classList.add("toolbar--hiding");
    }
  }

  adjustPosition(position) {
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

  handleOutsideClick(e) {
    if (!this.state.isVisible) return;

    const toolbar = this.$target.querySelector(".toolbar");
    if (toolbar && !toolbar.contains(e.target)) {
      this.hide();
    }
  }
}
