import { Toolbar } from "../../components/toolbar/index.js";

export function showToolbar(position, callbacks) {
  const toolbar = new Toolbar(document.body, {
    currentColor: callbacks.currentColor,
    onColorSelect: callbacks.onColorSelect,
    onNoteClick: callbacks.onNoteClick,
    onDeleteClick: callbacks.onDeleteClick,
  });

  const type = callbacks.onDeleteClick ? "highlight" : "selection";
  toolbar.show(type, position);
}
