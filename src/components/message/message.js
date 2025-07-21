export function createMessageHTML(
  container,
  { primaryText, secondaryText = "", isError = false }
) {
  container.innerHTML = `
    <div class="message">
      <p class="message__primary ${
        isError ? "message--error" : ""
      }">${primaryText}</p>
      <p class="message__secondary">${secondaryText}</p>
    </div>
  `;
}
