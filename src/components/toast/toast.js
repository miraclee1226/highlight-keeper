import { generateId } from "../../utils/index.js";

export class Toast {
  constructor($target, props) {
    this.$target = $target;
    this.props = props;

    this.message = props.message || "";
    this.type = props.type || "success";
    this.toastId = generateId();

    this.render();
    this.setEvent();
  }

  render() {
    const toastElement = document.createElement("div");

    toastElement.className = `toast toast--${this.type}`;
    toastElement.dataset.toastId = this.toastId;
    toastElement.innerHTML = `<span class="toast__message">${this.message}</span>`;

    this.$target.appendChild(toastElement);
    this.toastElement = toastElement;

    this.mounted();
  }

  mounted() {
    setTimeout(() => {
      this.show();
    }, 100);

    setTimeout(() => {
      this.hide();
    }, 3000);
  }

  show() {
    if (this.toastElement) {
      this.toastElement.classList.add("toast--entering");
    }
  }

  hide() {
    if (this.toastElement) {
      this.toastElement.classList.add("toast--hiding");

      setTimeout(() => {
        if (this.toastElement && this.toastElement.parentNode) {
          this.toastElement.parentNode.removeChild(this.toastElement);
        }

        if (this.props.onClose) {
          this.props.onClose(this.toastId);
        }
      }, 300);
    }
  }

  setEvent() {
    this.toastElement.addEventListener("click", () => {
      this.hide();
    });
  }
}
