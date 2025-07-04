import { sendMessageToBackground } from "./background-bridge.js";

export async function getDomainDetails() {
  return await sendMessageToBackground({
    action: "get_domain_details",
  });
}
