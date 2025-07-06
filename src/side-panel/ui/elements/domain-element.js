export function createDomainElement(domain) {
  const { favicon, siteName, domain: domainName, pageCount } = domain;
  const element = document.createElement("div");

  element.className = "domain-item";
  element.innerHTML = `
    <img src="${favicon}" class="domain-favicon" alt="${siteName}">
    <div class="domain-info">
      <div class="domain-name">${siteName}</div>
      <div class="domain-url">${domainName}</div>
    </div>
    <div class="highlight-count">${pageCount}</div>
  `;

  return element;
}
