import { getAllHighlights } from "./highlights.js";

export async function getDomainMetadata() {
  const highlights = await getAllHighlights();
  const domainGroups = groupByDomain(highlights);
  const domainMetaData = Object.entries(domainGroups).map(
    ([domain, highlights]) => {
      const siteName = extractSiteName(domain);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}`;
      const highlightCount = highlights.length;

      return {
        domain,
        siteName,
        favicon: faviconUrl,
        highlightCount,
      };
    }
  );

  return domainMetaData;
}

function groupByDomain(highlights) {
  const groups = {};

  highlights.forEach((highlight) => {
    const domain = highlight.domain;

    if (!groups[domain]) {
      groups[domain] = [];
    }

    groups[domain].push(highlight);
  });

  return groups;
}

function extractSiteName(domain) {
  const parts = domain.split(".");
  const excludeParts = [
    "com",
    "org",
    "net",
    "edu",
    "gov",
    "mil",
    "co",
    "kr",
    "jp",
    "cn",
    "uk",
    "de",
    "fr",
    "www",
    "blog",
    "shop",
    "store",
  ];

  const siteName = parts.find((part) => !excludeParts.includes(part));
  const capitalizedSiteName = siteName
    ? siteName.charAt(0).toUpperCase() + siteName.slice(1)
    : "Unknown";

  return capitalizedSiteName;
}
