import { createDomainElement } from "../elements/domain-element.js";
import { renderEmptyState } from "./state-renderer.js";

export function renderAllPagesTab(domainDetails, onDomainClick) {
  const allPages = document.getElementById("allPages");

  if (domainDetails.length === 0) {
    renderEmptyState(allPages);
    return;
  }

  allPages.innerHTML = "";

  domainDetails.forEach((domainDetail) => {
    const domainElement = createDomainElement(domainDetail);

    if (onDomainClick) {
      domainElement.addEventListener("click", () => {
        onDomainClick(domainDetail);
      });
    }

    allPages.appendChild(domainElement);
  });
}
