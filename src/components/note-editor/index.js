import { updateHighlight } from "../../bridge/highlight-bridge.js";
import { Component } from "../base-component.js";

export class NoteEditor extends Component {
  static instance = null;

  constructor($target, props) {
    if (NoteEditor.instance) {
      NoteEditor.instance.cleanup();
      NoteEditor.instance.updateInstance($target, props);
      return NoteEditor.instance;
    }

    super($target, props);
    NoteEditor.instance = this;
  }

  updateInstance($target, props) {
    this.$target = $target;
    this.props = props;
    this.setup();
  }

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
    if (!this.state.isVisible) return "";

    return `
      <div class="note-editor" 
           style="top: ${this.state.position.top}px; left: ${this.state.position.left}px;">
        <h3 class="note-editor__title">Note</h3>
        <textarea class="note-editor__textarea" 
                  placeholder="Add your notes here...">${this.state.noteText}</textarea>
      </div>
    `;
  }

  render() {
    const existingEditor =
      this.editorElement || document.querySelector(".note-editor");

    if (
      existingEditor &&
      !existingEditor.classList.contains("note-editor--hiding")
    ) {
      existingEditor.remove();
      this.editorElement = null;
    }

    if (this.state.isVisible) {
      this.$target.insertAdjacentHTML("beforeend", this.template());
      this.editorElement = this.$target.querySelector(".note-editor");

      requestAnimationFrame(() => {
        if (this.editorElement) {
          this.editorElement.classList.add("note-editor--entering");
          this.adjustPosition();
        }
      });

      this.mounted();
    }
  }

  mounted() {
    if (!this.state.isVisible || !this.editorElement) return;

    this.setupTextarea();
    this.setupEventHandlers();
  }

  setupTextarea() {
    const textarea = this.editorElement.querySelector(".note-editor__textarea");
    if (!textarea) return;

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
      if (this.state.isVisible) {
        this.hide();
      }
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
    if (!highlightElement) return;

    this.cleanup();

    const position = this.calculatePosition(highlightElement);
    const noteText = highlightElement.dataset.note || "";

    this.props.highlightElement = highlightElement;

    this.setState({
      isVisible: true,
      noteText: noteText,
      position: position,
    });
  }

  hide() {
    if (!this.state.isVisible) return;

    this.state.isVisible = false;

    if (this.editorElement) {
      this.editorElement.classList.add("note-editor--hiding");

      setTimeout(() => {
        if (this.editorElement?.parentNode) {
          this.editorElement.remove();
          this.editorElement = null;
        }
      }, 200);
    }
  }

  calculatePosition(highlightElement) {
    const rect = highlightElement.getBoundingClientRect();
    return {
      top: window.scrollY + rect.bottom + 5,
      left: window.scrollX + rect.left,
    };
  }

  adjustPosition() {
    if (!this.state.isVisible || !this.editorElement) return;

    const editorRect = this.editorElement.getBoundingClientRect();
    let newLeft = this.state.position.left;
    let newTop = this.state.position.top;

    if (editorRect.right > window.innerWidth) {
      newLeft = window.scrollX + window.innerWidth - editorRect.width - 10;
    }

    if (editorRect.bottom > window.innerHeight) {
      newTop = window.scrollY + window.innerHeight - editorRect.height - 10;
    }

    if (
      newLeft !== this.state.position.left ||
      newTop !== this.state.position.top
    ) {
      this.editorElement.style.left = newLeft + "px";
      this.editorElement.style.top = newTop + "px";
    }
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
