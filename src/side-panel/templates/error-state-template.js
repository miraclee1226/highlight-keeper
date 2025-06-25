export function errorStateHTML(message) {
  return `
    <div class="error-message">
      <p>${message}</p>
      <p>Please try refreshing the page.</p>
    </div>
  `;
}
