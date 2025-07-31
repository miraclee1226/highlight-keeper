import { updateHighlight } from "../../bridge/highlight-bridge.js";
import { Component } from "../base-component.js";
import { PopupMixin } from "../mixin/popup-mixin.js";

export class NoteEditor extends Component {
  setup() {
    this.initPopup();

    Object.defineProperty(this, "$editorElement", {
      get() {
        return this.popupElement;
      },
      set(value) {
        this.popupElement = value;
      },
    });

    this.state = {
      isVisible: false,
      noteText: this.props.highlightElement?.dataset.note || "",
      position: { top: 0, left: 0 },
    };
  }

  template() {
    return `
      <div class="note-editor" 
           style="top: ${this.state.position.top}px; left: ${this.state.position.left}px;">
        <h3 class="note-editor__title">Note</h3>
        <textarea class="note-editor__textarea" 
                  placeholder="Add your notes here...">${this.state.noteText}</textarea>
      </div>
    `;
  }

  willUpdate() {
    this.removeExistingPopup(".note-editor", "note-editor--hiding");
  }

  render() {
    if (!this.state.isVisible) return;

    this.$target.insertAdjacentHTML("beforeend", this.template());
    this.$editorElement = this.$target.querySelector(".note-editor");
    this.mounted();
  }

  didUpdate() {
    this.addEnterAnimation("note-editor--entering");
  }

  mounted() {
    if (!this.state.isVisible || !this.$editorElement) return;

    this.setupTextarea();
    this.setupPopupEventHandlers([this.props.highlightElement]);
  }

  setupTextarea() {
    const textarea = this.$editorElement.querySelector(
      ".note-editor__textarea"
    );

    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    let isHandled = false;
    const saveAndClose = () => {
      if (isHandled) return;
      isHandled = true;

      const note = textarea.value.trim();

      this.saveNote(note);
      this.hide();
    };

    textarea.addEventListener("blur", saveAndClose);
    textarea.addEventListener("click", (e) => e.stopPropagation());
  }

  async saveNote(note) {
    try {
      if (!this.props.highlightElement) return;

      const highlightId = this.props.highlightElement.dataset.id;

      if (!highlightId) return;

      const allElements = document.querySelectorAll(
        `[data-id="${highlightId}"]`
      );

      allElements.forEach((element) => {
        if (note.length > 0) {
          element.dataset.note = note;
        } else {
          delete element.dataset.note;
        }
      });

      await updateHighlight(highlightId, { note });
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  }

  show(highlightElement) {
    this.cleanupPopup();

    const noteText = highlightElement.dataset.note || "";
    const position = this.calculatePosition(highlightElement);

    this.setState({
      isVisible: true,
      noteText,
      position,
    });
  }

  hide() {
    this.hideWithAnimation("note-editor--hiding");
    this.setState({
      isVisible: false,
    });
  }

  calculatePosition(highlightElement) {
    const rect = highlightElement.getBoundingClientRect();

    return {
      top: window.scrollY + rect.bottom + 5,
      left: window.scrollX + rect.left,
    };
  }

  cleanup() {
    this.cleanupPopup();
  }
}

Object.assign(NoteEditor.prototype, PopupMixin);
