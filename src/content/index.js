(async () => {
  try {
    const src = chrome.runtime.getURL("src/content/app.js");
    await import(src);
  } catch (error) {
    console.error("Import failed:", error);
  }
})();
