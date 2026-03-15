import type { Page } from "playwright";

export interface PDFLinkResult {
  pdf_url: string;
  link_text: string;
  page_url: string;
}

/**
 * Extract all PDF links from a page.
 * Matches <a href> ending in .pdf or containing .pdf? (query string).
 */
export async function harvestPDFLinks(
  page: Page,
  pageUrl: string
): Promise<PDFLinkResult[]> {
  const links = await page.$$eval("a[href]", (anchors) =>
    anchors
      .filter((a) => {
        const href = (a as HTMLAnchorElement).href.toLowerCase();
        return href.endsWith(".pdf") || href.includes(".pdf?");
      })
      .map((a) => ({
        pdf_url: (a as HTMLAnchorElement).href,
        link_text: (a as HTMLAnchorElement).textContent?.trim() || "",
      }))
  );

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique: PDFLinkResult[] = [];

  for (const link of links) {
    if (!seen.has(link.pdf_url)) {
      seen.add(link.pdf_url);
      unique.push({ ...link, page_url: pageUrl });
    }
  }

  return unique;
}
