import { Component } from "../base-component.js";

export class Button extends Component {
  template() {
    return `
      <img src="${this.props.icon}" alt="${this.props.text} Icon">
      <span>${this.props.text}</span>
    `;
  }

  setEvent() {
    this.$target.addEventListener("click", (e) => {
      e.stopPropagation();

      if (this.props.onClick) {
        this.props.onClick();
      }
    });
  }
}
