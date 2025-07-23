import { COLORS } from "../../constant/colors.js";
import { Component } from "../base-component.js";

export class ColorPalette extends Component {
  setup() {
    this.currentColor = this.props.currentColor || null;
  }

  template() {
    return COLORS.map(
      (color) => `
      <div class="color-palette-button ${
        color === this.currentColor ? "current-color" : ""
      }" 
           style="background-color: ${color};" 
           data-color="${color}"></div>
    `
    ).join("");
  }

  setEvent() {
    this.addEvent("click", ".color-palette-button", (e) => {
      const selectedColor = e.target.dataset.color;

      this.updateSelectedColor(selectedColor);

      if (this.props.onColorSelect) {
        this.props.onColorSelect(selectedColor);
      }
    });
  }

  updateSelectedColor(selectedColor) {
    this.currentColor = selectedColor;
    this.$target.querySelectorAll(".color-palette-button").forEach((btn) => {
      btn.classList.remove("current-color");
    });

    const selectedButton = this.$target.querySelector(
      `[data-color="${selectedColor}"]`
    );

    if (selectedButton) {
      selectedButton.classList.add("current-color");
    }
  }
}
