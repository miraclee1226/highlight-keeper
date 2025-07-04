export function renderTab() {
  const sidePanel = document.querySelector(".side-panel");

  sidePanel.innerHTML = `
    <div class="tabs">
      <button class="tab active" id="currenPageTab">Current Page</button>
      <button class="tab" id="allPagesTab">All Pages</button>
    </div>
    <div class="tab-content current-page active" id="currentPage"></div>
    <div class="tab-content all-pages" id="allPages"></div>
  `;
}

export function switchTab(activeTab) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  const selectedTab = document.getElementById(`${activeTab}`);

  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  if (activeTab === "currenPageTab") {
    document.getElementById("currentPage").classList.add("active");
  } else if (activeTab === "allPagesTab") {
    document.getElementById("allPages").classList.add("active");
  }
}
