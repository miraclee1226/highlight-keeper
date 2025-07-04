export function createDomainElement(domain) {
  const { favicon, siteName, domain: domainName, highlightCount } = domain;
  const element = document.createElement("div");

  element.addEventListener("click", () => {
    handleDomainClick(domain);
  });

  element.className = "domain-item";
  element.innerHTML = `
    <div class="domain-header">
      <img src="${favicon}" class="domain-favicon" alt="${siteName}">
      <div class="domain-info">
        <div class="domain-name">${siteName}</div>
        <div class="domain-url">${domainName}</div>
      </div>
      <div class="highlight-count">${highlightCount}</div>
    </div>
  `;

  return element;
}
