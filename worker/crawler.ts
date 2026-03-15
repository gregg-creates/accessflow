import { chromium, type Browser, type Page } from "playwright";
import { isSameDomain, normalizeForDedup } from "../lib/url-validator";
import { runAxeScan, type AxeScanResult } from "./scanner";
import { harvestPDFLinks, type PDFLinkResult } from "./pdf-harvester";
import { detectWidgets, type WidgetResult } from "./widget-detector";
import { logger } from "../lib/logger";

export interface CrawlPageResult {
  url: string;
  violations: AxeScanResult[];
  pdfLinks: PDFLinkResult[];
  widgets: WidgetResult[];
  status: "ok" | "timeout" | "error";
  error?: string;
}

export interface CrawlResult {
  pages: CrawlPageResult[];
  totalPages: number;
}

const MAX_TOTAL_MS = 90_000;
const PAGE_TIMEOUT_MS = 15_000;

/**
 * Crawl a website starting from startUrl, scanning up to maxPages.
 * For each page: run axe-core, harvest PDFs, detect widgets, follow same-domain links.
 */
export async function crawlSite(
  startUrl: string,
  maxPages: number,
  onProgress?: (pagesScanned: number, pagesTotal: number) => void
): Promise<CrawlResult> {
  const visited = new Set<string>();
  const queue = [normalizeForDedup(startUrl)];
  const results: CrawlPageResult[] = [];
  const startTime = Date.now();

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });

    while (queue.length > 0 && visited.size < maxPages) {
      // Global timeout
      if (Date.now() - startTime > MAX_TOTAL_MS) {
        logger.warn({ elapsed: Date.now() - startTime }, "Crawl timeout hit");
        break;
      }

      const url = queue.shift()!;
      const normalizedUrl = normalizeForDedup(url);

      if (visited.has(normalizedUrl)) continue;
      visited.add(normalizedUrl);

      let page: Page | null = null;

      try {
        page = await browser.newPage();
        await page.goto(url, {
          waitUntil: "networkidle",
          timeout: PAGE_TIMEOUT_MS,
        });

        // Run axe-core scan
        const violations = await runAxeScan(page);

        // Harvest PDF links
        const pdfLinks = await harvestPDFLinks(page, url);

        // Detect third-party widgets
        const widgets = await detectWidgets(page, url);

        results.push({
          url,
          violations,
          pdfLinks,
          widgets,
          status: "ok",
        });

        // Harvest same-domain links for further crawling
        const links = await page.$$eval("a[href]", (anchors) =>
          anchors
            .map((a) => {
              try {
                return (a as HTMLAnchorElement).href;
              } catch {
                return "";
              }
            })
            .filter(Boolean)
        );

        for (const link of links) {
          const normalized = normalizeForDedup(link);
          if (
            isSameDomain(link, startUrl) &&
            !visited.has(normalized) &&
            !queue.includes(normalized)
          ) {
            queue.push(normalized);
          }
        }

        // Report progress
        const estimatedTotal = Math.min(
          maxPages,
          visited.size + queue.length
        );
        onProgress?.(visited.size, estimatedTotal);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        logger.error({ url, error: message }, "Page crawl failed");

        results.push({
          url,
          violations: [],
          pdfLinks: [],
          widgets: [],
          status: message.includes("Timeout") ? "timeout" : "error",
          error: message,
        });
      } finally {
        if (page) {
          await page.close().catch(() => {});
        }
      }
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }

  return {
    pages: results,
    totalPages: results.length,
  };
}
