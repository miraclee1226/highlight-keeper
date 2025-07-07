import {
  createSearchModal,
  createSearchResultElement,
} from "../elements/search-modal.js";
import { getDomainDetails } from "../../../bridge/domain-bridge.js";

let currentSearchModal = null;
let currentSearchOverlay = null;
let searchTimeout = null;

export async function openSearchModal() {
  currentSearchOverlay = createSearchModalOverlay();
  document.body.appendChild(currentSearchOverlay);

  currentSearchModal = createSearchModal();
  currentSearchOverlay.appendChild(currentSearchModal);

  await renderAllHighlights();

  handleSearchInput();

  setTimeout(() => {
    if (currentSearchOverlay) {
      currentSearchOverlay.classList.add("active");
    }
  }, 10);

  setTimeout(() => {
    const input = currentSearchModal.querySelector("#searchInput");
    if (input) input.focus();
  }, 100);

  handleCloseSearchModal();
}

async function renderAllHighlights() {
  try {
    const allHighlights = await getAllHighlights();
    renderSearchResults(currentSearchModal, allHighlights);
  } catch (error) {
    console.error("Failed to load highlights:", error);
  }
}

async function getAllHighlights() {
  try {
    const domainDetails = await getDomainDetails();
    const allHighlights = [];

    domainDetails.forEach((domain) => {
      domain.pages.forEach((page) => {
        page.highlights.forEach((highlight) => {
          allHighlights.push({
            favicon: domain.favicon,
            text: highlight.text,
            href: page.href,
          });
        });
      });
    });

    return allHighlights;
  } catch (error) {
    console.error("Error loading highlights:", error);
    return [];
  }
}

async function searchInHighlights(query) {
  const allHighlights = await getAllHighlights();

  if (!query || query.trim() === "") {
    return allHighlights;
  }

  const filter = allHighlights.filter(
    (item) =>
      item.text.toLowerCase().includes(query.toLowerCase()) ||
      item.href.toLowerCase().includes(query.toLowerCase())
  );

  return filter;
}

function createSearchModalOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "search-modal-overlay";

  return overlay;
}

function handleSearchInput() {
  const searchInput = currentSearchModal.querySelector("#searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", searchHighlights);
  }
}

async function searchHighlights(event) {
  const query = event.target.value.trim();

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    const results = await searchInHighlights(query);
    renderSearchResults(currentSearchModal, results);
  }, 300);
}

export function renderSearchResults(modal, results) {
  const container = modal.querySelector("#searchResults");

  container.innerHTML = "";

  results.forEach((result) => {
    const element = createSearchResultElement(result);
    container.appendChild(element);
  });
}

function handleCloseSearchModal() {
  currentSearchOverlay.addEventListener("click", (event) => {
    if (event.target === currentSearchOverlay) {
      currentSearchOverlay.classList.remove("active");

      setTimeout(() => {
        cleanupSearchModal();
      }, 300);
    }
  });
}

function cleanupSearchModal() {
  if (currentSearchModal) {
    currentSearchModal = null;
  }
  if (currentSearchOverlay) {
    currentSearchOverlay.remove();
    currentSearchOverlay = null;
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
}
