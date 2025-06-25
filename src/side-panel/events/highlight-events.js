import { scrollToHighlightById } from "../api/highlight-api.js";

export function setupHighlightEvents(container) {
  container.addEventListener("click", async (event) => {
    const noteElement = event.target.closest(".note");
    if (!noteElement) return;

    const uuid = noteElement.dataset.id;
    if (uuid) {
      try {
        await scrollToHighlightById(uuid);
      } catch (error) {
        console.error("Failed to navigate to highlight:", error);
      }
    }
  });
}
