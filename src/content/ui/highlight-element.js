export function createHighlightElement(text, highlightId, color) {
  const span = document.createElement("span");

  span.className = "highlighted-element";
  span.textContent = text;
  span.dataset.id = highlightId;
  span.dataset.timestamp = new Date().toISOString();
  span.dataset.url = window.location.href;
  span.style.backgroundColor = color;

  span.addEventListener("mouseenter", () => {
    document
      .querySelectorAll(`[data-id="${highlightId}"]`)
      .forEach((element) =>
        element.classList.add("highlighted-element--hover")
      );
  });

  span.addEventListener("mouseleave", () => {
    document
      .querySelectorAll(`[data-id="${highlightId}"]`)
      .forEach((element) =>
        element.classList.remove("highlighted-element--hover")
      );
  });

  span.addEventListener("mousedown", (e) => e.stopPropagation());

  return span;
}
