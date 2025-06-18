import { getHighlights } from "../api/highlight";
import { displayHighlights, displayError } from "./modules/side-panel-view";

async function initializeApp() {
  try {
    const highlights = await getHighlights();
    displayHighlights(highlights);
  } catch (error) {
    displayError(error.message);
  }
}

initializeApp();
