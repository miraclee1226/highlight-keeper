import {
  createHighlight as createHighlightBridge,
  updateHighlight as updateHighlightBridge,
  deleteHighlight as deleteHighlightBridge,
  deleteAllHighlights as deleteAllHighlightsBridge,
} from "../../bridge/highlight-bridge.js";
import {
  getOriginalDOMInfo,
  getPageTitle,
  renderHighlight,
  removeHighlightFromDOM,
} from "../utils/dom-utils.js";
import { generateId } from "../../utils/index.js";

export async function createHighlight(selection, color) {
  try {
    const highlightId = generateId();
    const domInfo = getOriginalDOMInfo(selection.range, selection.text);

    if (!domInfo) {
      throw new Error("Failed to get DOM info");
    }

    const highlightData = {
      uuid: "highlight-" + highlightId,
      href: location.href,
      domain: location.hostname,
      siteName: extractSiteName(location.hostname),
      favicon: `https://www.google.com/s2/favicons?domain=${location.hostname}`,
      pageTitle: getPageTitle(),
      selection: domInfo,
      color,
      note: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await createHighlightBridge(highlightData);
    const elements = renderHighlight(selection.range, highlightId, color);

    return { elements, highlightData };
  } catch (error) {
    console.error("Failed to create highlight:", error);
    return null;
  }
}

export async function updateHighlight(highlightId, updates) {
  try {
    const elements = document.querySelectorAll(`[data-id="${highlightId}"]`);

    if (updates.color) {
      elements.forEach((el) => {
        el.style.backgroundColor = updates.color;
      });
    }

    if (updates.note !== undefined) {
      elements.forEach((el) => {
        if (updates.note.trim()) {
          el.dataset.note = updates.note;
        } else {
          delete el.dataset.note;
        }
      });
    }

    await updateHighlightBridge(highlightId, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Failed to update highlight:", error);
  }
}

export async function deleteHighlight(highlightId) {
  try {
    removeHighlightFromDOM(highlightId);
    await deleteHighlightBridge(highlightId);
  } catch (error) {
    console.error("Failed to delete highlight:", error);
  }
}

export async function deleteAllHighlights(href) {
  try {
    const allHighlightElements = document.querySelectorAll(
      ".highlighted-element"
    );

    allHighlightElements.forEach((element) => {
      const parent = element.parentNode;
      parent.insertBefore(
        document.createTextNode(element.textContent),
        element
      );
      parent.removeChild(element);
    });

    document.normalize();

    await deleteAllHighlightsBridge(href);

    return allHighlightElements.length;
  } catch (error) {
    console.error("Failed to delete all highlights:", error);
    throw error;
  }
}

export function scrollToHighlight(highlightId) {
  const elements = document.querySelectorAll(`[data-id="${highlightId}"]`);

  if (elements.length === 0) return false;

  const firstElement = elements[0];
  firstElement.scrollIntoView({ behavior: "smooth", block: "center" });
  return true;
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
  return siteName
    ? siteName.charAt(0).toUpperCase() + siteName.slice(1)
    : "Unknown";
}
