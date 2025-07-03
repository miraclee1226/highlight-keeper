import {
  createHighlightElement,
  updateHighlightNote,
  updateHighlightColor,
} from "./highlight-element.js";

export function renderCurrentPageTab(highlights) {
  if (!document.querySelector(".tabs")) renderTabHTML();

  if (highlights.length === 0) {
    showEmptyState();
    return;
  }

  currentPage.innerHTML = "";

  highlights.forEach((highlight) => {
    const element = createHighlightElement(highlight);
    const currentPage = document.getElementById("currentPage");

    currentPage.appendChild(element);
  });
}

function renderTabHTML() {
  const sidePanel = document.querySelector(".side-panel");

  // TODO: Implement domain-based highlight grouping
  sidePanel.innerHTML = `
    <div class="tabs">
      <button class="tab active" id="currenPageTab">Current Page</button>
      <button class="tab" id="allPageTab">All Pages</button>
    </div>
    <div class="tab-content current-page active" id="currentPage"></div>
    <div class="tab-content all-pages" id="allPages"></div>
  `;
}

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

  if (remaining.length === 0) showEmptyState();
}

export function showEmptyState() {
  const currentPage = document.getElementById("currentPage");

  currentPage.innerHTML = `
    <div class="no-highlights">
      <p>No highlights saved for this page yet.</p>
      <p>Drag text to start highlighting!</p>
    </div>
  `;
}

export function showError(message) {
  const currentPage = document.getElementById("currentPage");

  currentPage.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
      <p>Please try refreshing the page.</p>
    </div>
  `;
}

export function switchTab(activeTab) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  const selectedTab = document.getElementById(`${activeTab}`);

  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  if (activeTab === "currenPageTab") {
    document.getElementById("currentPage").classList.add("active");
  } else if (activeTab === "allPageTab") {
    document.getElementById("allPages").classList.add("active");
  }
}
