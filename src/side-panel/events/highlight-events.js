import {
  handleHighlightClick,
  handleTabSwitch,
} from "../core/highlight-service.js";

export function setupHighlightEvents() {
  const sidePanel = document.querySelector(".side-panel");

  sidePanel.addEventListener("click", async (event) => {
    const highlightItem = event.target.closest(".highlight-item__wrapper");
    if (!highlightItem) return;

    const uuid = highlightItem.dataset.id;
    if (uuid) {
      await handleHighlightClick(uuid);
    }
  });
}

export function setupSidePanelTabEvents() {
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("tab")) {
      const tabType = event.target.id;

      handleTabSwitch(tabType);
    }
  });
}
