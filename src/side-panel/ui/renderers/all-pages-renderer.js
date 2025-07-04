import { createDomainElement } from "../elements/domain-element.js";
import { renderEmptyState } from "./state-renderer.js";

export function renderAllPagesTab(domainMetadata) {
  const allPages = document.getElementById("allPages");

  if (domainMetadata.length === 0) {
    renderEmptyState(allPages);
    return;
  }

  allPages.innerHTML = "";

  domainMetadata.forEach((domain) => {
    const domainElement = createDomainElement(domain);
    allPages.appendChild(domainElement);
  });
}
