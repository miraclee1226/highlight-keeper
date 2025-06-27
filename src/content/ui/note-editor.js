import { NoteEditor } from "./../../components/note-editor/index.js";

export function showNoteEditor(highlightElement) {
  hideNoteEditor();

  const nodeEditor = new NoteEditor(document.body, {
    highlightElement,
  });

  nodeEditor.show(highlightElement);
}

export function hideNoteEditor() {
  if (NoteEditor.instance) {
    NoteEditor.instance.hide();
    NoteEditor.instance = null;
  }
}
