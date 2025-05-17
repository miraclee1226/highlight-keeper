document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("highlightButton")
    .addEventListener("click", function () {
      chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        function (tabs) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "startHighlighting" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
                return;
              }

              if (response) {
                window.close();
              }
            }
          );
        }
      );
    });
});
