import { handleHighlightClick } from "../core/highlight-service.js";

export function setupHighlightEvents() {
  const container = document.querySelector(".container");

  container.addEventListener("click", async (event) => {
    const noteElement = event.target.closest(".note");
    if (!noteElement) return;

    const uuid = noteElement.dataset.id;
    if (uuid) {
      await handleHighlightClick(uuid);
    }
  });
}
