import { COLORS } from "../../constant/colors.js";
import { Component } from "../base-component.js";

export class ColorPalette extends Component {
  setup() {
    this.state = {
      currentColor: this.props.currentColor || COLORS[0],
    };
  }

  template() {
    const { currentColor } = this.state;
    const filteredColors = COLORS.filter((color) => color !== currentColor);

    return `
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
    `;
  }

  setEvent() {
    const container = this.$target;

    container.addEventListener("mouseenter", () => {
      container.classList.add("expanded");
    });

    container.addEventListener("mouseleave", () => {
      container.classList.remove("expanded");
    });

    this.addEvent("click", ".color-palette-button", (e) => {
      const selectedColor = e.target.style.backgroundColor;

      if (e.target.classList.contains("hidden-color")) {
        this.setState({ currentColor: selectedColor });
      }

      if (this.props.onColorSelect) {
        this.props.onColorSelect(selectedColor);
      }
    });
  }
}
