export function renderTab() {
  const sidePanel = document.querySelector(".side-panel");

  sidePanel.innerHTML = `
    <div class="tabs">
      <div class="tabs__left">
        <button class="tabs__item tabs__item--active" id="currenPageTab">Current Page</button>
        <button class="tabs__item" id="allPagesTab">All Pages</button>
      </div>
      <button class="tabs__search-icon" id="searchIcon">🔍</button>
    </div>
    <div class="tab-content tab-content--current-page tab-content--active" id="currentPage"></div>
    <div class="tab-content tab-content--all-pages" id="allPages"></div>
  `;
}

export function switchTab(activeTab) {
  document.querySelectorAll(".tabs__item").forEach((tab) => {
    tab.classList.remove("tabs__item--active");
  });

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("tab-content--active");
  });

  const selectedTab = document.getElementById(`${activeTab}`);

  if (selectedTab) {
    selectedTab.classList.add("tabs__item--active");
  }

  if (activeTab === "currenPageTab") {
    document.getElementById("currentPage").classList.add("tab-content--active");
  } else if (activeTab === "allPagesTab") {
    document.getElementById("allPages").classList.add("tab-content--active");
  }
}
