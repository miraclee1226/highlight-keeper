export default function createButton(
  text,
  options = {},
  onClick,
  stopPropagation = true
) {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = getButtonClasses(options.variant);

  if (options.styles) {
    Object.assign(button.style, options.styles);
  }

  button.addEventListener("click", (e) => {
    if (stopPropagation) e.stopPropagation();
    onClick();
  });

  return button;
}

function getButtonClasses(variant) {
  const baseClass = "button";

  switch (variant) {
    case "primary":
      return `${baseClass} button--primary`;
    case "danger":
      return `${baseClass} button--danger`;
    case "secondary":
      return `${baseClass} button--secondary`;
    default:
      return baseClass;
  }
}
