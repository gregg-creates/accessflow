// ── Scan ──────────────────────────────────────────────
export type ScanStatus =
  | "queued"
  | "crawling"
  | "scanning"
  | "enriching"
  | "generating_pdf"
  | "completed"
  | "failed";

export interface Scan {
  id: string;
  user_id: string | null;
  url: string;
  status: ScanStatus;
  error_reason: string | null;
  pages_scanned: number;
  pages_total: number;
  risk_score: number | null;
  violation_count: number;
  critical_count: number;
  serious_count: number;
  pdf_link_count: number;
  widget_count: number;
  demand_letter_mode: boolean;
  prior_scan_id: string | null;
  report_json: ReportJSON | null;
  pdf_url: string | null;
  email_captured: string | null;
  job_started_at: string | null;
  created_at: string;
  completed_at: string | null;
}

// ── Violations ───────────────────────────────────────
export type Impact = "critical" | "serious" | "moderate" | "minor";
export type LegalRisk = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type FixDifficulty = "Easy" | "Medium" | "Hard";
export type EffortTier = "XS" | "S" | "M" | "L" | "XL" | "EXT";
export type FixUrgency = "IMMEDIATE" | "PRIORITY" | "STANDARD";
export type LitigationLikelihood = "HIGH" | "MEDIUM" | "LOW";

export interface Violation {
  id: string;
  scan_id: string;
  wcag_id: string;
  wcag_criterion: string;
  wcag_version: string;
  impact: Impact;
  legal_risk: LegalRisk;
  page_url: string;
  element_html: string;
  element_selector: string;
  plain_english: string;
  fix_instruction: string;
  fix_code_snippet: string | null;
  fix_difficulty: FixDifficulty;
  effort_tier: EffortTier;
  effort_hours_est: string;
  litigation_likelihood: LitigationLikelihood | null;
  fix_urgency: FixUrgency | null;
  good_faith_note: string | null;
  enrichment_status: "pending" | "enriched" | "failed";
  axe_raw: Record<string, unknown>;
  created_at: string;
}

// ── PDF Links ────────────────────────────────────────
export interface PDFLink {
  id: string;
  scan_id: string;
  page_url: string;
  pdf_url: string;
  link_text: string;
  status: string;
  created_at: string;
}

// ── Third-Party Widgets ──────────────────────────────
export type WidgetAction = "contact_vendor" | "replace" | "low_risk";

export interface ThirdPartyWidget {
  id: string;
  scan_id: string;
  page_url: string;
  widget_type: string;
  src_domain: string;
  element_html: string;
  note: string;
  action: WidgetAction;
  created_at: string;
}

// ── Leads ────────────────────────────────────────────
export interface Lead {
  id: string;
  email: string;
  scan_id: string | null;
  source: string;
  converted_to_user: boolean;
  created_at: string;
}

// ── Report JSON (stored in scans.report_json) ────────
export interface EffortSummary {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  EXT: number;
  total_hours_est: string;
}

export interface ReportJSON {
  violations: Violation[];
  top_issues: Violation[];
  pdf_inventory: PDFLink[];
  widget_inventory: ThirdPartyWidget[];
  effort_summary: EffortSummary;
  pdf_summary: string | null;
  widget_summary: string | null;
}

// ── Risk Score ───────────────────────────────────────
export type RiskLevel = "low" | "moderate" | "high" | "critical";

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return "low";
  if (score <= 60) return "moderate";
  if (score <= 85) return "high";
  return "critical";
}

export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: "Low Risk",
    moderate: "Moderate Risk",
    high: "High Risk",
    critical: "Critical Risk",
  };
  return labels[level];
}

// ── API Types ────────────────────────────────────────
export interface ScanStartRequest {
  url: string;
  max_pages?: number;
  email?: string;
  demand_letter_mode?: boolean;
  prior_scan_id?: string | null;
  turnstile_token: string;
}

export interface ScanStartResponse {
  scan_id: string;
  status: "queued";
  estimated_seconds: number;
  poll_url: string;
}

export interface ScanStatusResponse {
  scan_id: string;
  status: ScanStatus;
  pages_scanned: number;
  pages_total: number;
  progress_pct: number;
}

export interface ScanDiff {
  resolved: Violation[];
  still_open: (Violation & { overdue?: boolean })[];
  new_issues: Violation[];
  regressions: Violation[];
  score_delta: number;
  pdf_diff: { added: PDFLink[]; removed: PDFLink[] };
  widget_diff: { added: ThirdPartyWidget[]; removed: ThirdPartyWidget[] };
}
