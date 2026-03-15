import isURL from "validator/lib/isURL";

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
  /^localhost$/i,
];

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "gclsrc",
  "msclkid",
  "dclid",
  "mc_cid",
  "mc_eid",
  "ref",
  "_ga",
  "_gl",
];

export interface URLValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  error?: string;
}

/**
 * Validate and normalize a URL for scanning.
 * - Must be a valid URL
 * - Must not resolve to a private IP
 * - Force https://
 * - Strip tracking params and trailing slash
 */
export function validateAndNormalizeUrl(rawUrl: string): URLValidationResult {
  let url = rawUrl.trim();

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Force https
  url = url.replace(/^http:\/\//i, "https://");

  if (!isURL(url, { require_protocol: true, protocols: ["https"] })) {
    return { valid: false, error: "Please enter a valid website URL." };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Please enter a valid website URL." };
  }

  // Block private/reserved IPs
  const hostname = parsed.hostname;
  if (isPrivateHost(hostname)) {
    return {
      valid: false,
      error: "Cannot scan private or internal network addresses.",
    };
  }

  // Strip tracking params
  for (const param of TRACKING_PARAMS) {
    parsed.searchParams.delete(param);
  }

  // Strip trailing slash (but keep root /)
  let normalized = parsed.toString();
  if (normalized.endsWith("/") && parsed.pathname !== "/") {
    normalized = normalized.slice(0, -1);
  }

  return { valid: true, normalizedUrl: normalized };
}

/**
 * Check if a hostname is a private/reserved IP or localhost.
 */
function isPrivateHost(hostname: string): boolean {
  return PRIVATE_IP_RANGES.some((pattern) => pattern.test(hostname));
}

/**
 * Verify that a URL is reachable via HEAD request (3s timeout).
 */
export async function checkUrlReachable(url: string): Promise<{
  reachable: boolean;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok && response.status >= 500) {
      return {
        reachable: false,
        error: `Website returned server error (${response.status}).`,
      };
    }

    return { reachable: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        reachable: false,
        error: "Website did not respond within 3 seconds.",
      };
    }
    return {
      reachable: false,
      error: "Could not reach this website. Please check the URL.",
    };
  }
}

/**
 * Check if two URLs are on the same domain (for link harvesting).
 */
export function isSameDomain(url: string, baseUrl: string): boolean {
  try {
    const a = new URL(url);
    const b = new URL(baseUrl);
    return a.hostname === b.hostname;
  } catch {
    return false;
  }
}

/**
 * Normalize a URL for deduplication (lowercase host, strip hash, sort params).
 */
export function normalizeForDedup(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.searchParams.sort();
    // Lowercase hostname
    const normalized = parsed.toString().toLowerCase();
    // Strip trailing slash except root
    if (normalized.endsWith("/") && parsed.pathname !== "/") {
      return normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}
