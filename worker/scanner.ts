import type { Page } from "playwright";
import path from "path";

export interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

export interface AxeScanResult {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

const AXE_SCRIPT_PATH = path.resolve(
  process.cwd(),
  "node_modules/axe-core/axe.min.js"
);

const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

/**
 * Inject axe-core into a Playwright page and run a WCAG 2.2 AA scan.
 * Returns the array of violations found.
 */
export async function runAxeScan(page: Page): Promise<AxeScanResult[]> {
  // Inject axe-core script
  await page.addScriptTag({ path: AXE_SCRIPT_PATH });

  // Run axe with WCAG 2.2 AA tags
  const results = await page.evaluate(async (tags: string[]) => {
    // @ts-expect-error — axe is injected via script tag
    const axeResults = await axe.run(document, {
      runOnly: { type: "tag", values: tags },
    });
    return axeResults.violations;
  }, WCAG_TAGS);

  return results.map(
    (v: {
      id: string;
      impact: string;
      description: string;
      help: string;
      helpUrl: string;
      tags: string[];
      nodes: { html: string; target: string[]; failureSummary?: string }[];
    }) => ({
      id: v.id,
      impact: v.impact as AxeScanResult["impact"],
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target,
        failureSummary: n.failureSummary,
      })),
    })
  );
}
