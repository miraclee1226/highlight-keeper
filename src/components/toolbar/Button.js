import { Component } from "../base-component.js";

export class Button extends Component {
  template() {
    return `
      <button class="${this.props.className}">
        <img src="${this.props.icon}" alt="${this.props.text} Icon">
        <span>${this.props.text}</span>
      </button>
    `;
  }

  setEvent() {
    this.addEvent("click", "button", (e) => {
      e.stopPropagation();

      if (this.props.onClick) {
        this.props.onClick();
      }
    });
  }
}
