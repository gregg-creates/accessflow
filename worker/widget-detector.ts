import type { Page } from "playwright";

export interface WidgetResult {
  widget_type: string;
  src_domain: string;
  element_html: string;
  page_url: string;
}

/**
 * Known accessibility overlay and widget vendors.
 * These are flagged because overlay widgets don't fix actual accessibility issues
 * and some have been fined for deceptive claims (e.g., AccessiBe FTC $1M fine).
 */
const KNOWN_VENDORS: Record<string, string> = {
  "accessibe.com": "AccessiBe Overlay",
  "acsbapp.com": "AccessiBe Overlay",
  "userway.org": "UserWay Overlay",
  "audioeye.com": "AudioEye Overlay",
  "equalweb.com": "EqualWeb Overlay",
  "truely.com": "Truely Overlay",
  "maxaccess.io": "Max Access Overlay",
  "ada.support": "Ada Support Widget",
  "accessibly.app": "Accessibly Overlay",
};

/**
 * Common third-party widget domains (non-overlay).
 */
const COMMON_WIDGETS: Record<string, string> = {
  "youtube.com": "YouTube Video",
  "youtube-nocookie.com": "YouTube Video",
  "vimeo.com": "Vimeo Video",
  "google.com/maps": "Google Maps",
  "maps.google.com": "Google Maps",
  "facebook.com": "Facebook Widget",
  "twitter.com": "Twitter Widget",
  "x.com": "Twitter/X Widget",
  "instagram.com": "Instagram Widget",
  "tiktok.com": "TikTok Widget",
  "calendly.com": "Calendly Widget",
  "typeform.com": "Typeform Widget",
  "hubspot.com": "HubSpot Widget",
  "intercom.io": "Intercom Chat",
  "drift.com": "Drift Chat",
  "zendesk.com": "Zendesk Widget",
  "tawk.to": "Tawk.to Chat",
  "livechat.com": "LiveChat Widget",
  "recaptcha.net": "Google reCAPTCHA",
  "google.com/recaptcha": "Google reCAPTCHA",
  "hcaptcha.com": "hCaptcha",
  "stripe.com": "Stripe Payment",
  "paypal.com": "PayPal Widget",
};

/**
 * Detect third-party iframes/widgets on a page.
 * Flags known overlay vendors and identifies common third-party embeds.
 */
export async function detectWidgets(
  page: Page,
  pageUrl: string
): Promise<WidgetResult[]> {
  const iframes = await page.$$eval("iframe[src]", (els) =>
    els.map((el) => {
      let srcDomain = "";
      try {
        srcDomain = new URL((el as HTMLIFrameElement).src).hostname;
      } catch {
        // Invalid URL
      }
      return {
        src: (el as HTMLIFrameElement).src,
        src_domain: srcDomain,
        element_html: (el as HTMLIFrameElement).outerHTML.substring(0, 200),
      };
    })
  );

  const results: WidgetResult[] = [];
  const seen = new Set<string>();

  for (const iframe of iframes) {
    if (!iframe.src_domain || seen.has(iframe.src_domain)) continue;
    seen.add(iframe.src_domain);

    const widgetType = identifyWidget(iframe.src_domain);
    if (widgetType) {
      results.push({
        widget_type: widgetType,
        src_domain: iframe.src_domain,
        element_html: iframe.element_html,
        page_url: pageUrl,
      });
    }
  }

  // Also check for overlay script tags (some inject via <script>, not <iframe>)
  const scripts = await page.$$eval("script[src]", (els) =>
    els.map((el) => {
      try {
        return new URL((el as HTMLScriptElement).src).hostname;
      } catch {
        return "";
      }
    })
  );

  for (const domain of scripts) {
    if (!domain || seen.has(domain)) continue;

    const vendorName = matchVendor(domain);
    if (vendorName) {
      seen.add(domain);
      results.push({
        widget_type: vendorName,
        src_domain: domain,
        element_html: `<script src="...${domain}...">`,
        page_url: pageUrl,
      });
    }
  }

  return results;
}

function identifyWidget(domain: string): string | null {
  // Check known overlay vendors first
  const vendorName = matchVendor(domain);
  if (vendorName) return vendorName;

  // Check common third-party widgets
  for (const [pattern, name] of Object.entries(COMMON_WIDGETS)) {
    if (domain.includes(pattern)) return name;
  }

  return null;
}

function matchVendor(domain: string): string | null {
  for (const [pattern, name] of Object.entries(KNOWN_VENDORS)) {
    if (domain.includes(pattern)) return name;
  }
  return null;
}

/**
 * Check if a detected widget is a known overlay vendor (conflict of interest flag).
 */
export function isOverlayVendor(srcDomain: string): boolean {
  return Object.keys(KNOWN_VENDORS).some((pattern) =>
    srcDomain.includes(pattern)
  );
}
