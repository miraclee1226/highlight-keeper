document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".intro__button")
    .addEventListener("click", function () {
      chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        function (tabs) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "start_highlight" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
                alert("Please reload the page and try again.");
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
