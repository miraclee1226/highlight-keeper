import {
  createHighlightElement,
  updateHighlightNote,
  updateHighlightColor,
} from "./highlight-element.js";
import { createDomainElement } from "./domain-element.js";

export function renderCurrentPageTab(highlights) {
  if (!document.querySelector(".tabs")) renderTabHTML();

  const currentPage = document.getElementById("currentPage");

  if (highlights.length === 0) {
    showEmptyState(currentPage);
    return;
  }

  currentPage.innerHTML = "";

  highlights.forEach((highlight) => {
    const element = createHighlightElement(highlight);
    currentPage.appendChild(element);
  });
}

export function renderTabHTML() {
  const sidePanel = document.querySelector(".side-panel");

  sidePanel.innerHTML = `
    <div class="tabs">
      <button class="tab active" id="currenPageTab">Current Page</button>
      <button class="tab" id="allPagesTab">All Pages</button>
    </div>
    <div class="tab-content current-page active" id="currentPage"></div>
    <div class="tab-content all-pages" id="allPages"></div>
  `;
}

export function renderAllPagesTab(domainMetadata) {
  const allPages = document.getElementById("allPages");

  if (domainMetadata.length === 0) {
    showEmptyState(allPages);
    return;
  }

  allPages.innerHTML = "";

  domainMetadata.forEach((domain) => {
    const domainElement = createDomainElement(domain);
    allPages.appendChild(domainElement);
  });
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

  if (remaining.length === 0) showEmptyState(currentPage);
}

export function showEmptyState(page) {
  page.innerHTML = `
    <div class="no-highlights">
      <p>No highlights saved</p>
      <p>Drag text to start highlighting!</p>
    </div>
  `;
}

export function showError(pages) {
  pages.innerHTML = `
    <div class="error-message">
       <p>Unable to load highlights</p>
     <p>Please refresh the page or try again later</p>
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
  } else if (activeTab === "allPagesTab") {
    document.getElementById("allPages").classList.add("active");
  }
}
