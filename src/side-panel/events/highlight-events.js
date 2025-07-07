import {
  handleHighlightClick,
  handleTabSwitch,
  handleViewAllHighlights,
} from "../core/highlight-service.js";

export function setupHighlightEvents() {
  const sidePanel = document.querySelector(".side-panel");

  sidePanel.addEventListener("click", async (event) => {
    const highlightItem = event.target.closest(".highlight-item");
    if (!highlightItem) return;

    const uuid = highlightItem.dataset.id;
    if (uuid) {
      await handleHighlightClick(uuid);
    }
  });

  document.addEventListener("click", async (event) => {
    const viewAllButton = event.target.closest(".page-group__view-all-btn");
    if (!viewAllButton) return;

    event.preventDefault();
    event.stopPropagation();

    const href = viewAllButton.dataset.href;
    const pageTitle = viewAllButton.dataset.pageTitle;

    if (href && pageTitle) {
      await handleViewAllHighlights({ href, pageTitle });
    } else {
      console.error("Missing href or pageTitle data");
    }
  });
}

export function setupSidePanelTabEvents() {
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("tabs__item")) {
      const tabType = event.target.id;

      handleTabSwitch(tabType);
    }
  });
}
