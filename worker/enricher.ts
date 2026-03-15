import { claude, CLAUDE_MODEL } from "../lib/claude";
import { logger } from "../lib/logger";
import type { AxeScanResult } from "./scanner";
import type { PDFLinkResult } from "./pdf-harvester";
import type { WidgetResult } from "./widget-detector";

// ── System Prompts ──────────────────────────────────────

const STANDARD_SYSTEM_PROMPT = `You are an ADA web accessibility compliance expert with 20 years of experience auditing over 10,000 websites. You help website owners understand their legal risk and fix their accessibility issues.

For each violation, respond with a JSON object:

- plain_english: 2–3 sentences. What the issue is, who it affects (be specific: blind users, keyboard-only users, low-vision users, etc.), and why it matters legally. No WCAG codes. No HTML tags. Write for a business owner, not a developer.

- legal_risk: CRITICAL | HIGH | MEDIUM | LOW
  CRITICAL = found in over 60% of ADA demand letters (alt text, form labels, keyboard traps, user-scalable=no, skip nav missing)
  HIGH = common target (contrast failures, missing captions, broken focus visibility)
  MEDIUM = cited but less frequently (ARIA misuse, heading hierarchy)
  LOW = best practice; rarely basis for suit alone

- fix_instruction: One concrete action in plain English. If a developer is needed, say so. If a CMS user can fix it, explain how. Under 3 sentences.

- fix_code_snippet: A BEFORE/AFTER HTML or CSS code block. Use the actual element_html provided if available. Label sections clearly as "// BEFORE" and "// AFTER". Under 20 lines total. Include minimal JS only if required. Return null if no code change is possible (e.g., PDF issue or vendor widget).

- fix_difficulty: Easy (CMS user) | Medium (developer) | Hard (refactor)

- effort_tier: XS | S | M | L | XL | EXT
  XS = under 1 hour, single attribute or line change
  S  = 1–4 hours, isolated component, standard pattern
  M  = 1–3 days, multiple components or assistive tech testing needed
  L  = 1–2 weeks, requires design approval + significant code changes
  XL = 2–6 weeks, systemic refactor or architecture change
  EXT = vendor-owned widget, requires vendor action not dev action

- effort_hours_est: human-readable string matching tier (e.g., "< 1 hour", "1–4 hours", "1–3 days", "1–2 weeks", "2–6 weeks", "Vendor-dependent")

Return ONLY valid JSON. No preamble. No markdown fences.`;

const DEMAND_LETTER_SYSTEM_PROMPT = `You are an ADA web accessibility compliance expert with 20 years of experience, including expert witness consultation for ADA Title III litigation. The business owner scanning this site has received an ADA demand letter or legal notice. Your output will be used to triage violations, estimate remediation urgency, and help the client's attorney demonstrate good-faith remediation.

For each violation, respond with a JSON object:

- plain_english: 2–3 sentences for a non-technical business owner under legal pressure. What the issue is, who it affects, and whether plaintiff attorneys specifically target this type of violation.

- legal_risk: CRITICAL | HIGH | MEDIUM | LOW (same criteria as standard)

- litigation_likelihood: HIGH | MEDIUM | LOW — how likely this specific violation appears in an active demand letter based on ADA Title III litigation patterns.

- fix_urgency: IMMEDIATE (fix within 7 days) | PRIORITY (fix within 30 days) | STANDARD (fix within 90 days)

- fix_instruction: One concrete action. Specify if developer is needed.

- fix_code_snippet: Before/after code fix. null if not applicable.

- effort_tier: XS | S | M | L | XL | EXT
- effort_hours_est: human-readable estimate

- good_faith_note: One sentence an attorney can use in correspondence to demonstrate active remediation. Example format: "Remediation of [violation type] was initiated on [date] and is expected complete by [date]."

Return ONLY valid JSON. No preamble. No markdown fences.`;

const PDF_WIDGET_ENRICHMENT_PROMPT = `You are an ADA compliance expert. Review these PDFs and third-party widgets found on a scanned website and provide brief accessibility risk notes.

PDFs: {{pdf_inventory_json}}
Widgets: {{widget_inventory_json}}

Return JSON:
{
  "pdf_notes": [{ "pdf_url": "...", "note": "..." }],
  "widget_notes": [{ "src_domain": "...", "widget_type": "...", "note": "...", "action": "contact_vendor|replace|low_risk" }],
  "pdf_summary": "one sentence",
  "widget_summary": "one sentence"
}
Return ONLY valid JSON.`;

// ── Types ───────────────────────────────────────────────

export interface EnrichmentResult {
  plain_english: string;
  legal_risk: string;
  fix_instruction: string;
  fix_code_snippet: string | null;
  fix_difficulty: string;
  effort_tier: string;
  effort_hours_est: string;
  // Demand letter mode fields
  litigation_likelihood?: string;
  fix_urgency?: string;
  good_faith_note?: string;
}

export interface PDFWidgetEnrichmentResult {
  pdf_notes: { pdf_url: string; note: string }[];
  widget_notes: {
    src_domain: string;
    widget_type: string;
    note: string;
    action: string;
  }[];
  pdf_summary: string;
  widget_summary: string;
}

interface ViolationInput {
  wcag_id: string;
  wcag_criterion: string;
  impact: string;
  description: string;
  nodes_count: number;
  example_html: string;
  page_url: string;
}

// ── Violation Enrichment ────────────────────────────────

const MAX_VIOLATIONS_PER_BATCH = 5;
const MAX_RETRIES = 2;

/**
 * Build the per-violation prompt from axe-core results.
 */
function buildViolationPrompt(
  v: ViolationInput,
  demandLetterMode: boolean
): string {
  return `Violation ID: ${v.wcag_id}
WCAG Criterion: ${v.wcag_criterion}
Axe Impact: ${v.impact}
Description: ${v.description}
Affected elements: ${v.nodes_count}
Example element: ${v.example_html}
Page URL: ${v.page_url}
Mode: ${demandLetterMode ? "demand_letter" : "standard"}`;
}

/**
 * Enrich a batch of violations using Claude AI.
 * Sends multiple violations per API call for efficiency.
 */
export async function enrichViolations(
  violations: ViolationInput[],
  demandLetterMode: boolean
): Promise<EnrichmentResult[]> {
  const systemPrompt = demandLetterMode
    ? DEMAND_LETTER_SYSTEM_PROMPT
    : STANDARD_SYSTEM_PROMPT;

  const results: EnrichmentResult[] = [];

  // Process in batches
  for (let i = 0; i < violations.length; i += MAX_VIOLATIONS_PER_BATCH) {
    const batch = violations.slice(i, i + MAX_VIOLATIONS_PER_BATCH);

    const userPrompt = batch
      .map(
        (v, idx) =>
          `--- Violation ${idx + 1} ---\n${buildViolationPrompt(v, demandLetterMode)}`
      )
      .join("\n\n");

    const fullPrompt = `Analyze these ${batch.length} violations. Return a JSON array with one object per violation, in the same order.\n\n${userPrompt}`;

    const batchResults = await callClaudeWithRetry(
      systemPrompt,
      fullPrompt,
      batch.length
    );

    results.push(...batchResults);
  }

  return results;
}

/**
 * Call Claude API with retry logic and JSON parsing fallback.
 */
async function callClaudeWithRetry(
  systemPrompt: string,
  userPrompt: string,
  expectedCount: number
): Promise<EnrichmentResult[]> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await claude.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      const parsed = parseJSONResponse(text, expectedCount);

      if (parsed) return parsed;

      logger.warn(
        { attempt, textLength: text.length },
        "Failed to parse Claude response, retrying"
      );
    } catch (err) {
      logger.error(
        { attempt, error: err instanceof Error ? err.message : "Unknown" },
        "Claude API call failed"
      );

      if (attempt === MAX_RETRIES) break;
    }
  }

  // Return fallback enrichments if all retries fail
  return Array.from({ length: expectedCount }, () => fallbackEnrichment());
}

/**
 * Parse Claude's JSON response, handling both array and single object.
 */
function parseJSONResponse(
  text: string,
  expectedCount: number
): EnrichmentResult[] | null {
  try {
    // Strip markdown fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);

    // Handle array response
    if (Array.isArray(parsed) && parsed.length === expectedCount) {
      return parsed.map(validateEnrichment);
    }

    // Handle single object (when batch size is 1)
    if (!Array.isArray(parsed) && expectedCount === 1) {
      return [validateEnrichment(parsed)];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validate and normalize an enrichment result from Claude.
 */
function validateEnrichment(raw: Record<string, unknown>): EnrichmentResult {
  return {
    plain_english: String(raw.plain_english || "Unable to analyze this violation."),
    legal_risk: validateEnum(
      String(raw.legal_risk),
      ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      "MEDIUM"
    ),
    fix_instruction: String(raw.fix_instruction || "Consult a developer to fix this issue."),
    fix_code_snippet:
      raw.fix_code_snippet != null ? String(raw.fix_code_snippet) : null,
    fix_difficulty: validateEnum(
      String(raw.fix_difficulty),
      ["Easy", "Medium", "Hard"],
      "Medium"
    ),
    effort_tier: validateEnum(
      String(raw.effort_tier),
      ["XS", "S", "M", "L", "XL", "EXT"],
      "M"
    ),
    effort_hours_est: String(raw.effort_hours_est || "1–3 days"),
    // Demand letter fields (optional)
    litigation_likelihood: raw.litigation_likelihood
      ? String(raw.litigation_likelihood)
      : undefined,
    fix_urgency: raw.fix_urgency ? String(raw.fix_urgency) : undefined,
    good_faith_note: raw.good_faith_note
      ? String(raw.good_faith_note)
      : undefined,
  };
}

function validateEnum(
  value: string,
  allowed: string[],
  fallback: string
): string {
  return allowed.includes(value) ? value : fallback;
}

/**
 * Fallback enrichment when Claude API fails completely.
 */
function fallbackEnrichment(): EnrichmentResult {
  return {
    plain_english:
      "This violation was detected by automated scanning but could not be analyzed by AI. A developer should review this issue.",
    legal_risk: "MEDIUM",
    fix_instruction: "Have a developer review this accessibility issue.",
    fix_code_snippet: null,
    fix_difficulty: "Medium",
    effort_tier: "M",
    effort_hours_est: "1–3 days",
  };
}

// ── PDF/Widget Enrichment ───────────────────────────────

/**
 * Enrich PDF and widget inventories with accessibility notes.
 * Run once per scan after violation enrichment.
 */
export async function enrichPDFsAndWidgets(
  pdfLinks: PDFLinkResult[],
  widgets: WidgetResult[]
): Promise<PDFWidgetEnrichmentResult> {
  if (pdfLinks.length === 0 && widgets.length === 0) {
    return {
      pdf_notes: [],
      widget_notes: [],
      pdf_summary: "No PDFs found on this site.",
      widget_summary: "No third-party widgets found on this site.",
    };
  }

  const prompt = PDF_WIDGET_ENRICHMENT_PROMPT.replace(
    "{{pdf_inventory_json}}",
    JSON.stringify(
      pdfLinks.map((p) => ({
        pdf_url: p.pdf_url,
        link_text: p.link_text,
        page_url: p.page_url,
      }))
    )
  ).replace(
    "{{widget_inventory_json}}",
    JSON.stringify(
      widgets.map((w) => ({
        src_domain: w.src_domain,
        widget_type: w.widget_type,
        page_url: w.page_url,
      }))
    )
  );

  try {
    const response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned) as PDFWidgetEnrichmentResult;
    return {
      pdf_notes: parsed.pdf_notes || [],
      widget_notes: parsed.widget_notes || [],
      pdf_summary: parsed.pdf_summary || "PDFs found — review for accessibility.",
      widget_summary:
        parsed.widget_summary ||
        "Third-party widgets found — check vendor accessibility.",
    };
  } catch (err) {
    logger.error(
      { error: err instanceof Error ? err.message : "Unknown" },
      "PDF/Widget enrichment failed"
    );

    return {
      pdf_notes: pdfLinks.map((p) => ({
        pdf_url: p.pdf_url,
        note: "Unable to analyze — review manually for proper tagging and reading order.",
      })),
      widget_notes: widgets.map((w) => ({
        src_domain: w.src_domain,
        widget_type: w.widget_type,
        note: "Unable to analyze — verify accessibility with vendor.",
        action: "contact_vendor",
      })),
      pdf_summary: `${pdfLinks.length} PDF(s) found — manual review recommended.`,
      widget_summary: `${widgets.length} widget(s) found — verify accessibility with vendors.`,
    };
  }
}

/**
 * Convert axe-core results into the format expected by enrichViolations.
 */
export function axeToViolationInputs(
  axeResults: AxeScanResult[],
  pageUrl: string
): ViolationInput[] {
  return axeResults.map((v) => ({
    wcag_id: v.id,
    wcag_criterion: v.help,
    impact: v.impact,
    description: v.description,
    nodes_count: v.nodes.length,
    example_html: v.nodes[0]?.html?.substring(0, 200) || "",
    page_url: pageUrl,
  }));
}
