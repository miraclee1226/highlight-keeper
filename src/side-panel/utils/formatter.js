export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function escapeHtml(text) {
  if (!text) return "";

  const div = document.createElement("div");

  div.textContent = text;

  const escapedText = div.innerHTML;

  return escapedText.replace(/\n/g, "<br>");
}
