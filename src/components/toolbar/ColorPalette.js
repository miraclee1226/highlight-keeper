import { COLORS } from "../../constant/colors.js";
import { Component } from "../base-component.js";

export class ColorPalette extends Component {
  setup() {
    this.colors = COLORS;

    this.state = {
      currentColor: this.props.currentColor || this.colors[0],
    };
  }

  template() {
    const { currentColor } = this.state;

    const filteredColors = this.colors.filter(
      (color) => color !== currentColor
    );

    return `
      <div class="color-palette-container">
        <div class="color-palette-button main-color" 
             style="background-color: ${currentColor}"></div>
        <div class="hidden-colors">
          ${filteredColors
            .slice(0, 4)
            .map(
              (color, index) => `
            <div class="color-palette-button hidden-color" 
                 style="background-color: ${color}; transition-delay: ${
                index * 0.05
              }s"></div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  setEvent() {
    const container = this.$target.querySelector(".color-palette-container");

    container.addEventListener("mouseenter", () => {
      container.classList.add("expanded");
    });

    container.addEventListener("mouseleave", () => {
      container.classList.remove("expanded");
    });

    this.addEvent("click", ".color-palette-button", (e) => {
      const selectedColor = e.target.style.backgroundColor;
      if (!selectedColor) return;

      if (e.target.classList.contains("hidden-color")) {
        this.setState({ currentColor: selectedColor });
      }

      if (this.props.onColorSelect) {
        this.props.onColorSelect(selectedColor);
      }
    });
  }
}
