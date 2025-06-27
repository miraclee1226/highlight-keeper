export function generateId() {
  const randomId = crypto.randomUUID();
  return "highlight-" + randomId;
}
