import { Worker, type Job } from "bullmq";
import { logger } from "../lib/logger";
import { crawlSite } from "./crawler";
import { calculateRiskScore } from "./scorer";
import {
  enrichViolations,
  enrichPDFsAndWidgets,
  axeToViolationInputs,
} from "./enricher";
import { createReportPDF } from "./pdf-generator";
import { renderToBuffer } from "@react-pdf/renderer";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import type {
  Violation,
  PDFLink,
  ThirdPartyWidget,
  EffortSummary,
  EffortTier,
  ReportJSON,
} from "../types";
import type { AxeScanResult } from "./scanner";
import type { PDFLinkResult } from "./pdf-harvester";
import type { WidgetResult } from "./widget-detector";

// ── HTML Sanitizer ──────────────────────────────────────

const purify = DOMPurify(new JSDOM("").window);

function sanitizeHtml(raw: string): string {
  return purify.sanitize(raw, { ALLOWED_TAGS: [] });
}

// ── Job Types ───────────────────────────────────────────

interface ScanJobData {
  scanId: string;
  url: string;
  maxPages: number;
  demandLetterMode: boolean;
  email?: string;
}

// ── Stuck-Scan Timeout ──────────────────────────────────

const STUCK_SCAN_TIMEOUT_MS = 120_000;

// ── Report Assembly ─────────────────────────────────────

/**
 * Aggregate effort tiers from enriched violations.
 */
function buildEffortSummary(violations: Violation[]): EffortSummary {
  const counts: Record<EffortTier, number> = {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    EXT: 0,
  };

  for (const v of violations) {
    const tier = v.effort_tier as EffortTier;
    if (tier in counts) {
      counts[tier]++;
    }
  }

  // Estimate total hours (rough midpoint of each tier)
  const hourEstimates: Record<EffortTier, number> = {
    XS: 0.5,
    S: 2.5,
    M: 16, // ~2 days
    L: 60, // ~1.5 weeks
    XL: 160, // ~4 weeks
    EXT: 0, // vendor-dependent, excluded
  };

  const totalHours = Object.entries(counts).reduce((sum, [tier, count]) => {
    return sum + count * (hourEstimates[tier as EffortTier] || 0);
  }, 0);

  let totalEstStr: string;
  if (totalHours <= 8) totalEstStr = `~${Math.ceil(totalHours)} hours`;
  else if (totalHours <= 40) totalEstStr = `~${Math.ceil(totalHours / 8)} days`;
  else totalEstStr = `~${Math.ceil(totalHours / 40)} weeks`;

  if (counts.EXT > 0) {
    totalEstStr += ` + ${counts.EXT} vendor-dependent`;
  }

  return {
    ...counts,
    total_hours_est: totalEstStr,
  };
}

/**
 * Assemble the full report JSON from all scan components.
 */
function assembleReport(
  violations: Violation[],
  pdfLinks: PDFLink[],
  widgets: ThirdPartyWidget[],
  pdfSummary: string | null,
  widgetSummary: string | null
): ReportJSON {
  const effortSummary = buildEffortSummary(violations);

  // Top issues: highest legal risk first, then by impact
  const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };

  const sorted = [...violations].sort((a, b) => {
    const riskDiff =
      (riskOrder[a.legal_risk] ?? 3) - (riskOrder[b.legal_risk] ?? 3);
    if (riskDiff !== 0) return riskDiff;
    return (impactOrder[a.impact] ?? 3) - (impactOrder[b.impact] ?? 3);
  });

  return {
    violations: sorted,
    top_issues: sorted.slice(0, 5),
    pdf_inventory: pdfLinks,
    widget_inventory: widgets,
    effort_summary: effortSummary,
    pdf_summary: pdfSummary,
    widget_summary: widgetSummary,
  };
}

// ── Scan Job Processor ──────────────────────────────────

async function processScanJob(job: Job<ScanJobData>) {
  const { scanId, url, maxPages, demandLetterMode } = job.data;
  const startTime = Date.now();

  logger.info({ scanId, url, maxPages, demandLetterMode }, "Scan job started");

  try {
    // ── Step 1: Update status to crawling ──
    await updateScanStatus(scanId, "crawling");

    // ── Step 2: Crawl the site ──
    const crawlResult = await crawlSite(url, maxPages, (scanned, total) => {
      checkTimeout(startTime, scanId);
      updateScanProgress(scanId, scanned, total);
    });

    checkTimeout(startTime, scanId);

    // ── Step 3: Update status to scanning ──
    await updateScanStatus(scanId, "scanning", {
      pages_scanned: crawlResult.totalPages,
      pages_total: crawlResult.totalPages,
    });

    // ── Step 4: Collect all violations, PDFs, widgets ──
    const allViolations: AxeScanResult[] = [];
    const allPDFLinks: PDFLinkResult[] = [];
    const allWidgets: WidgetResult[] = [];

    for (const page of crawlResult.pages) {
      allViolations.push(...page.violations);
      allPDFLinks.push(...page.pdfLinks);
      allWidgets.push(...page.widgets);
    }

    // ── Step 5: Calculate risk score ──
    const riskResult = calculateRiskScore({
      violations: allViolations,
      pdfLinkCount: allPDFLinks.length,
      widgetCount: allWidgets.length,
    });

    checkTimeout(startTime, scanId);

    // ── Step 6: Enrich violations with Claude AI ──
    await updateScanStatus(scanId, "enriching");

    const violationInputs = crawlResult.pages.flatMap((page) =>
      axeToViolationInputs(page.violations, page.url)
    );

    const enrichments = await enrichViolations(
      violationInputs,
      demandLetterMode
    );

    // Merge enrichments with violation data
    const enrichedViolations: Violation[] = violationInputs.map(
      (input, idx) => {
        const enrichment = enrichments[idx];
        const axeViolation = allViolations.find(
          (v) => v.id === input.wcag_id
        );

        return {
          id: crypto.randomUUID(),
          scan_id: scanId,
          wcag_id: input.wcag_id,
          wcag_criterion: input.wcag_criterion,
          wcag_version: "2.2",
          impact: input.impact as Violation["impact"],
          legal_risk: enrichment.legal_risk as Violation["legal_risk"],
          page_url: input.page_url,
          element_html: sanitizeHtml(input.example_html),
          element_selector:
            axeViolation?.nodes[0]?.target?.join(", ") || "",
          plain_english: enrichment.plain_english,
          fix_instruction: enrichment.fix_instruction,
          fix_code_snippet: enrichment.fix_code_snippet,
          fix_difficulty:
            enrichment.fix_difficulty as Violation["fix_difficulty"],
          effort_tier: enrichment.effort_tier as Violation["effort_tier"],
          effort_hours_est: enrichment.effort_hours_est,
          litigation_likelihood:
            (enrichment.litigation_likelihood as Violation["litigation_likelihood"]) ||
            null,
          fix_urgency:
            (enrichment.fix_urgency as Violation["fix_urgency"]) || null,
          good_faith_note: enrichment.good_faith_note || null,
          enrichment_status: "enriched",
          axe_raw: {},
          created_at: new Date().toISOString(),
        };
      }
    );

    checkTimeout(startTime, scanId);

    // ── Step 7: Enrich PDFs and widgets ──
    const pdfWidgetEnrichment = await enrichPDFsAndWidgets(
      allPDFLinks,
      allWidgets
    );

    // Build PDF links
    const pdfLinks: PDFLink[] = allPDFLinks.map((p) => ({
      id: crypto.randomUUID(),
      scan_id: scanId,
      page_url: p.page_url,
      pdf_url: p.pdf_url,
      link_text: p.link_text,
      status: "unverified",
      created_at: new Date().toISOString(),
    }));

    // Build widget records
    const widgets: ThirdPartyWidget[] = allWidgets.map((w) => {
      const note =
        pdfWidgetEnrichment.widget_notes.find(
          (n) => n.src_domain === w.src_domain
        )?.note || "";
      const action =
        (pdfWidgetEnrichment.widget_notes.find(
          (n) => n.src_domain === w.src_domain
        )?.action as ThirdPartyWidget["action"]) || "low_risk";

      return {
        id: crypto.randomUUID(),
        scan_id: scanId,
        page_url: w.page_url,
        widget_type: w.widget_type,
        src_domain: w.src_domain,
        element_html: sanitizeHtml(w.element_html),
        note,
        action,
        created_at: new Date().toISOString(),
      };
    });

    // ── Step 8: Assemble report JSON ──
    const reportJson = assembleReport(
      enrichedViolations,
      pdfLinks,
      widgets,
      pdfWidgetEnrichment.pdf_summary,
      pdfWidgetEnrichment.widget_summary
    );

    checkTimeout(startTime, scanId);

    // ── Step 9: Generate PDF ──
    await updateScanStatus(scanId, "generating_pdf");

    const pdfElement = createReportPDF({
      url,
      riskScore: riskResult.score,
      violations: enrichedViolations,
      pdfLinks,
      widgets,
      effortSummary: reportJson.effort_summary,
      demandLetterMode,
      scanDate: new Date().toISOString().split("T")[0],
      pdfSummary: pdfWidgetEnrichment.pdf_summary,
      widgetSummary: pdfWidgetEnrichment.widget_summary,
    });

    const pdfBuffer = await renderToBuffer(pdfElement);

    // TODO: Upload pdfBuffer to Supabase Storage
    // TODO: Get signed URL for pdf_url
    const pdfUrl: string | null = null;

    // ── Step 10: Save everything to database ──
    // TODO: Insert enrichedViolations into violations table
    // TODO: Insert pdfLinks into pdf_links table
    // TODO: Insert widgets into third_party_widgets table
    // TODO: Update scan row with:
    //   - status: 'completed'
    //   - risk_score, violation_count, critical_count, serious_count
    //   - pdf_link_count, widget_count
    //   - report_json, pdf_url
    //   - completed_at

    const criticalCount = enrichedViolations.filter(
      (v) => v.impact === "critical"
    ).length;
    const seriousCount = enrichedViolations.filter(
      (v) => v.impact === "serious"
    ).length;

    await updateScanCompleted(scanId, {
      risk_score: riskResult.score,
      violation_count: enrichedViolations.length,
      critical_count: criticalCount,
      serious_count: seriousCount,
      pdf_link_count: pdfLinks.length,
      widget_count: widgets.length,
      report_json: reportJson,
      pdf_url: pdfUrl,
    });

    logger.info(
      {
        scanId,
        riskScore: riskResult.score,
        violations: enrichedViolations.length,
        elapsed: Date.now() - startTime,
      },
      "Scan job completed"
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error({ scanId, error: message }, "Scan job failed");

    await updateScanStatus(scanId, "failed", {
      error_reason: message,
    });
  }
}

// ── Timeout Check ───────────────────────────────────────

function checkTimeout(startTime: number, scanId: string): void {
  if (Date.now() - startTime > STUCK_SCAN_TIMEOUT_MS) {
    throw new Error(`Scan ${scanId} exceeded ${STUCK_SCAN_TIMEOUT_MS}ms timeout`);
  }
}

// ── Database Helpers (to be wired to Supabase) ──────────

async function updateScanStatus(
  scanId: string,
  status: string,
  extra?: Record<string, unknown>
) {
  // TODO: Supabase update
  logger.info({ scanId, status, ...extra }, "Scan status updated");
}

async function updateScanProgress(
  scanId: string,
  pagesScanned: number,
  pagesTotal: number
) {
  // TODO: Supabase update
  logger.debug({ scanId, pagesScanned, pagesTotal }, "Scan progress updated");
}

async function updateScanCompleted(
  scanId: string,
  data: {
    risk_score: number;
    violation_count: number;
    critical_count: number;
    serious_count: number;
    pdf_link_count: number;
    widget_count: number;
    report_json: ReportJSON;
    pdf_url: string | null;
  }
) {
  // TODO: Supabase update — set status='completed', completed_at=NOW()
  logger.info({ scanId, ...data }, "Scan completed");
}

// ── Worker Setup ────────────────────────────────────────

const connection = {
  host: process.env.UPSTASH_REDIS_REST_URL,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
};

const worker = new Worker<ScanJobData>("scan", processScanJob, {
  connection,
  concurrency: 2,
  limiter: {
    max: 5,
    duration: 60_000,
  },
});

worker.on("completed", (job) => {
  logger.info({ jobId: job.id, scanId: job.data.scanId }, "Job completed");
});

worker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, scanId: job?.data.scanId, error: err.message },
    "Job failed"
  );
});

worker.on("error", (err) => {
  logger.error({ error: err.message }, "Worker error");
});

logger.info("AccessFlow scan worker started");

export { worker };
