export function createDomainElement(domain) {
  const { favicon, siteName, domain: domainName, pageCount } = domain;
  const element = document.createElement("div");

  element.className = "domain-item";
  element.innerHTML = `
    <img src="${favicon}" class="domain-item__favicon" alt="${siteName}">
    <div class="domain-item__info">
      <div class="domain-item__name">${siteName}</div>
      <div class="domain-item__url">${domainName}</div>
    </div>
    <div class="domain-item__count">${pageCount}</div>
  `;

  return element;
}
