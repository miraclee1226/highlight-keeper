import { NoteEditor } from "./../../components/note-editor/index.js";

export function showNoteEditor(highlightElement) {
  const nodeEditor = new NoteEditor(document.body, {
    highlightElement,
  });

  nodeEditor.show(highlightElement);
}
