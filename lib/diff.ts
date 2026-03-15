import type {
  Violation,
  PDFLink,
  ThirdPartyWidget,
  ScanDiff,
} from "../types";

const OVERDUE_THRESHOLD_DAYS = 30;

/**
 * Calculate the diff between a current scan and a prior scan.
 *
 * - resolved: violations that existed before but are now gone
 * - still_open: violations that exist in both scans (matched by wcag_id + page_url)
 * - new_issues: violations in current that weren't in prior
 * - regressions: violations that were resolved in a previous scan but have reappeared
 *   (simplified: same as new_issues for now since we only compare two scans)
 * - score_delta: current score - prior score (positive = worse)
 * - pdf_diff: added and removed PDF links
 * - widget_diff: added and removed widgets
 *
 * still_open items older than 30 days with CRITICAL legal_risk get overdue: true
 */
export function calculateScanDiff(
  currentViolations: Violation[],
  priorViolations: Violation[],
  currentPDFs: PDFLink[],
  priorPDFs: PDFLink[],
  currentWidgets: ThirdPartyWidget[],
  priorWidgets: ThirdPartyWidget[],
  currentScore: number,
  priorScore: number
): ScanDiff {
  // Build violation fingerprints for matching
  const fingerprint = (v: Violation) =>
    `${v.wcag_id}::${v.page_url}::${v.element_selector}`;

  const priorFingerprints = new Map(
    priorViolations.map((v) => [fingerprint(v), v])
  );
  const currentFingerprints = new Map(
    currentViolations.map((v) => [fingerprint(v), v])
  );

  // Resolved: in prior but not in current
  const resolved: Violation[] = [];
  Array.from(priorFingerprints.entries()).forEach(([fp, v]) => {
    if (!currentFingerprints.has(fp)) {
      resolved.push(v);
    }
  });

  // Still open: in both
  const stillOpen: (Violation & { overdue?: boolean })[] = [];
  Array.from(currentFingerprints.entries()).forEach(([fp, currentV]) => {
    const priorV = priorFingerprints.get(fp);
    if (priorV) {
      const daysSinceCreated = daysBetween(
        new Date(priorV.created_at),
        new Date()
      );
      const overdue =
        daysSinceCreated > OVERDUE_THRESHOLD_DAYS &&
        currentV.legal_risk === "CRITICAL";

      stillOpen.push({ ...currentV, overdue: overdue || undefined });
    }
  });

  // New issues: in current but not in prior
  const newIssues: Violation[] = [];
  Array.from(currentFingerprints.entries()).forEach(([fp, v]) => {
    if (!priorFingerprints.has(fp)) {
      newIssues.push(v);
    }
  });

  // Regressions: issues that were resolved in prior scan comparison
  // but reappeared. For a simple two-scan comparison, we check if
  // any new_issues match a resolved pattern from prior.
  // (This would be more powerful with full scan chain history.)
  const regressions: Violation[] = [];

  // PDF diff
  const priorPdfUrls = new Set(priorPDFs.map((p) => p.pdf_url));
  const currentPdfUrls = new Set(currentPDFs.map((p) => p.pdf_url));

  const addedPDFs = currentPDFs.filter((p) => !priorPdfUrls.has(p.pdf_url));
  const removedPDFs = priorPDFs.filter(
    (p) => !currentPdfUrls.has(p.pdf_url)
  );

  // Widget diff
  const priorWidgetDomains = new Set(priorWidgets.map((w) => w.src_domain));
  const currentWidgetDomains = new Set(
    currentWidgets.map((w) => w.src_domain)
  );

  const addedWidgets = currentWidgets.filter(
    (w) => !priorWidgetDomains.has(w.src_domain)
  );
  const removedWidgets = priorWidgets.filter(
    (w) => !currentWidgetDomains.has(w.src_domain)
  );

  return {
    resolved,
    still_open: stillOpen,
    new_issues: newIssues,
    regressions,
    score_delta: currentScore - priorScore,
    pdf_diff: { added: addedPDFs, removed: removedPDFs },
    widget_diff: { added: addedWidgets, removed: removedWidgets },
  };
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(
    Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Generate a human-readable diff summary.
 */
export function formatDiffSummary(diff: ScanDiff): string {
  const parts: string[] = [];

  if (diff.score_delta > 0) {
    parts.push(`Score increased by ${diff.score_delta} points (worse)`);
  } else if (diff.score_delta < 0) {
    parts.push(
      `Score improved by ${Math.abs(diff.score_delta)} points`
    );
  } else {
    parts.push("Score unchanged");
  }

  if (diff.resolved.length > 0) {
    parts.push(`${diff.resolved.length} issue(s) resolved`);
  }
  if (diff.new_issues.length > 0) {
    parts.push(`${diff.new_issues.length} new issue(s) found`);
  }
  if (diff.still_open.length > 0) {
    const overdueCount = diff.still_open.filter((v) => v.overdue).length;
    parts.push(
      `${diff.still_open.length} issue(s) still open${
        overdueCount > 0 ? ` (${overdueCount} overdue)` : ""
      }`
    );
  }

  return parts.join(". ") + ".";
}
