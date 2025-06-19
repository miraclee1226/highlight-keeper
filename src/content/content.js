(async () => {
  try {
    const src = chrome.runtime.getURL(
      "src/content/modules/highlighter/index.js"
    );
    await import(src);
  } catch (error) {
    console.error("Import failed:", error);
  }
})();
