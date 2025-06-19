import { NoteEditor } from "../../components/note-editor/index.js";

export function openNoteEditor(highlightElement) {
  const noteEditor = new NoteEditor(document.body, {
    highlightElement,
  });

  noteEditor.show(highlightElement);
}
