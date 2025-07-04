import {
  createHighlightElement,
  updateHighlightNote,
  updateHighlightColor,
} from "../elements/highlight-element.js";
import { renderEmptyState } from "./state-renderer.js";

export function addHighlight(highlightData) {
  const currentPage = document.getElementById("currentPage");
  const element = createHighlightElement(highlightData);
  const emptyState = currentPage.querySelector(".no-highlights");

  if (emptyState) {
    currentPage.innerHTML = "";
  }

  currentPage.appendChild(element);
}

export function updateHighlight(updateData) {
  const currentPage = document.getElementById("currentPage");
  const element = currentPage.querySelector(`[data-id="${updateData.uuid}"]`);

  if (!element) return;

  if (updateData.note !== undefined) {
    updateHighlightNote(element, updateData.note);
  }

  if (updateData.color) {
    updateHighlightColor(element, updateData.color);
  }
}

export function removeHighlight(uuid) {
  const currentPage = document.getElementById("currentPage");
  const element = currentPage.querySelector(`[data-id="${uuid}"]`);

  if (element) element.remove();

  const remaining = currentPage.querySelectorAll(".highlight-item__wrapper");

  if (remaining.length === 0) renderEmptyState(currentPage);
}
