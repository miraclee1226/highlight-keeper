export function calculatePosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: window.scrollY + rect.top - 40,
    left: window.scrollX + rect.left,
  };
}
