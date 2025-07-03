import { sendMessageToBackground } from "./background-bridge.js";

export async function getDomainMetadata() {
  return await sendMessageToBackground({
    action: "get_domain_metadata",
  });
}
