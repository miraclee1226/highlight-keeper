export function renderEmptyState(page) {
  page.innerHTML = `
    <div class="no-highlights">
      <p>No highlights saved</p>
      <p>Drag text to start highlighting!</p>
    </div>
  `;
}

export function renderErrorState(pages) {
  pages.innerHTML = `
    <div class="error-message">
       <p>Unable to load highlights</p>
     <p>Please refresh the page or try again later</p>
    </div>
  `;
}
