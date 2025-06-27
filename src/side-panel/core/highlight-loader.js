import { getHighlights } from "../../bridge/highlight-bridge.js";

export async function loadHighlights(url) {
  try {
    const highlights = await getHighlights(url);
    const sortedHighlights = highlights.sort(
      (a, b) => a.createdAt - b.createdAt
    );

    return sortedHighlights;
  } catch (error) {
    throw new Error(`Failed to load highlights: ${error.message}`);
  }
}
