import { updateHighlight } from "../../bridge/highlight-bridge.js";
import { Component } from "../base-component.js";

export class NoteEditor extends Component {
  setup() {
    this.scrollHandler = null;
    this.outsideClickHandler = null;
    this.editorElement = null;

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
    const existingEditor =
      this.editorElement || document.querySelector(".note-editor");

    if (
      existingEditor &&
      !existingEditor.classList.contains("note-editor--hiding")
    ) {
      existingEditor.remove();
      this.editorElement = null;
    }
  }

  render() {
    if (!this.state.isVisible) return;

    this.$target.insertAdjacentHTML("beforeend", this.template());
    this.editorElement = this.$target.querySelector(".note-editor");

    this.mounted();
  }

  didUpdate() {
    requestAnimationFrame(() => {
      this.editorElement.classList.add("note-editor--entering");
    });
  }

  mounted() {
    if (!this.state.isVisible || !this.editorElement) return;

    this.setupTextarea();
    this.setupEventHandlers();
  }

  setupTextarea() {
    const textarea = this.editorElement.querySelector(".note-editor__textarea");

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

  setupEventHandlers() {
    this.outsideClickHandler = (e) => {
      if (!this.state.isVisible) return;
      if (this.props.highlightElement?.contains(e.target)) return;
      if (this.editorElement?.contains(e.target)) return;

      this.hide();
    };

    this.scrollHandler = () => {
      if (!this.state.isVisible) return;

      this.hide();
    };

    document.addEventListener("click", this.outsideClickHandler);
    window.addEventListener("scroll", this.scrollHandler);
  }

  async saveNote(note) {
    if (!this.props.highlightElement) return;

    const highlightId = this.props.highlightElement.dataset.id;
    if (!highlightId) return;

    const allElements = document.querySelectorAll(`[data-id="${highlightId}"]`);
    allElements.forEach((element) => {
      if (note.length > 0) {
        element.dataset.note = note;
      } else {
        delete element.dataset.note;
      }
    });

    try {
      await updateHighlight(highlightId, { note });
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  }

  show(highlightElement) {
    this.cleanup();

    const noteText = highlightElement.dataset.note || "";
    const position = this.calculatePosition(highlightElement);

    this.setState({
      isVisible: true,
      noteText,
      position,
    });
  }

  hide() {
    if (!this.state.isVisible) return;
    if (!this.editorElement) return;

    this.state.isVisible = false;
    this.editorElement.classList.add("note-editor--hiding");

    setTimeout(() => {
      if (this.editorElement?.parentNode) return;

      this.editorElement.remove();
      this.editorElement = null;
    }, 200);
  }

  calculatePosition(highlightElement) {
    const rect = highlightElement.getBoundingClientRect();

    return {
      top: window.scrollY + rect.bottom + 5,
      left: window.scrollX + rect.left,
    };
  }

  cleanup() {
    if (this.outsideClickHandler) {
      document.removeEventListener("click", this.outsideClickHandler);
      this.outsideClickHandler = null;
    }

    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
  }
}
