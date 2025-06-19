import { NoteEditor } from "../../components/note-editor/index.js";

let currentNoteEditor = null;

function cleanupCurrentNoteEditor() {
  if (currentNoteEditor) {
    currentNoteEditor.cleanup();
    currentNoteEditor = null;
  }
}

export function openNoteEditor(highlightElement) {
  cleanupCurrentNoteEditor();

  currentNoteEditor = new NoteEditor(document.body, {
    highlightElement,
  });

  currentNoteEditor.show(highlightElement);
}
