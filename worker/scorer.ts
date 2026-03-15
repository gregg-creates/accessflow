import type { AxeScanResult } from "./scanner";

/**
 * Violation-specific weights — common ADA lawsuit targets get higher weight.
 */
const VIOLATION_WEIGHTS: Record<string, number> = {
  "image-alt": 3,
  label: 3,
  "color-contrast": 2,
  "scrollable-region-focusable": 2.5,
  "html-has-lang": 1.5,
  "video-caption": 2,
  "skip-link": 1.5,
  "aria-label": 2,
  "aria-roles": 1.5,
  "keyboard-access": 3,
  "focus-visible": 2,
  "link-name": 2.5,
  "button-name": 2.5,
  "input-image-alt": 3,
  "form-field-multiple-labels": 1,
  tabindex: 1.5,
};

/**
 * Impact multipliers — critical violations contribute more to risk.
 */
const IMPACT_MULTIPLIERS: Record<string, number> = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
};

/**
 * Points per PDF link found (PDFs are often inaccessible).
 */
const PDF_PENALTY_PER_LINK = 5;

/**
 * Points per third-party widget found.
 */
const WIDGET_PENALTY_PER_WIDGET = 3;

/**
 * Max raw score before normalization.
 * Tuned so a moderately bad site (~20 violations) scores ~60.
 */
const NORMALIZATION_DIVISOR = 200;

export interface RiskScoreInput {
  violations: AxeScanResult[];
  pdfLinkCount: number;
  widgetCount: number;
}

export interface RiskScoreResult {
  score: number;
  breakdown: {
    violationRaw: number;
    pdfRaw: number;
    widgetRaw: number;
    totalRaw: number;
  };
}

/**
 * Calculate the 0–100 risk score.
 *
 * Formula:
 *   raw = Σ (weight × impact_mult × nodes_count) for each violation
 *       + (pdf_count × 5)
 *       + (widget_count × 3)
 *   score = min(100, round((raw / 200) × 100))
 */
export function calculateRiskScore(input: RiskScoreInput): RiskScoreResult {
  const violationRaw = input.violations.reduce((sum, v) => {
    const weight = VIOLATION_WEIGHTS[v.id] || 1;
    const impactMult = IMPACT_MULTIPLIERS[v.impact] || 1;
    const nodeCount = v.nodes?.length || 1;
    return sum + weight * impactMult * nodeCount;
  }, 0);

  const pdfRaw = input.pdfLinkCount * PDF_PENALTY_PER_LINK;
  const widgetRaw = input.widgetCount * WIDGET_PENALTY_PER_WIDGET;
  const totalRaw = violationRaw + pdfRaw + widgetRaw;

  const score = Math.min(
    100,
    Math.round((totalRaw / NORMALIZATION_DIVISOR) * 100)
  );

  return {
    score,
    breakdown: {
      violationRaw,
      pdfRaw,
      widgetRaw,
      totalRaw,
    },
  };
}

/**
 * Get the risk level label for a score.
 */
export function getRiskLevel(
  score: number
): "low" | "moderate" | "high" | "critical" {
  if (score <= 30) return "low";
  if (score <= 60) return "moderate";
  if (score <= 85) return "high";
  return "critical";
}
