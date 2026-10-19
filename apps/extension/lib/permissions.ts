import { browser } from "wxt/browser";

/**
 * Asks the user for access to the CA and relay hosts of a network. Must run
 * inside a click handler (browsers require a user gesture).
 */
export async function requestHostAccess(urls: string[]): Promise<void> {
  const origins = Array.from(new Set(urls.filter(Boolean).map((u) => `${new URL(u).origin}/*`)));
  if (origins.length === 0) return;
  // Call request() first, with no await before it: an earlier await can
  // lose the user gesture. Already-granted origins resolve without a prompt.
  const granted = await browser.permissions.request({ origins });
  if (!granted) {
    throw new Error("Weft needs access to your organisation's CA and relay to continue.");
  }
}
