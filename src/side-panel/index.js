import { initializeApp, setupEventListeners } from "./app/app.js";

async function init() {
  await initializeApp();
  setupEventListeners();
}

init();
