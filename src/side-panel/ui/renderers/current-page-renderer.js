import { createHighlightElement } from "../elements/highlight-element.js";
import { renderEmptyState } from "./state-renderer.js";
import { renderTab } from "./tab-renderer.js";

export function renderCurrentPageTab(highlights) {
  if (!document.querySelector(".tabs")) renderTab();

  const currentPage = document.getElementById("currentPage");

  if (highlights.length === 0) {
    renderEmptyState(currentPage);
    return;
  }

  currentPage.innerHTML = "";

  highlights.forEach((highlight) => {
    const element = createHighlightElement(highlight);
    currentPage.appendChild(element);
  });
}
