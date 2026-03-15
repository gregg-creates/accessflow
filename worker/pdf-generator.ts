import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { createElement } from "react";
import type {
  Violation,
  PDFLink,
  ThirdPartyWidget,
  EffortSummary,
} from "../types";
import { getRiskLevel, getRiskLabel } from "../types";

// ── Styles ──────────────────────────────────────────────

const NAVY = "#1B2A4A";
const BLUE = "#2563EB";
const TEAL = "#0D9488";
const SLATE = "#64748B";
const LIGHT_GRAY = "#F8FAFC";
const WHITE = "#FFFFFF";

const RISK_COLORS = {
  low: "#16A34A",
  moderate: "#D97706",
  high: "#DC2626",
  critical: "#7F1D1D",
};

const SEVERITY_COLORS = {
  critical: "#DC2626",
  serious: "#EA580C",
  moderate: "#D97706",
  minor: "#94A3B8",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: NAVY,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
  },
  logo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  date: {
    fontSize: 9,
    color: SLATE,
  },
  scoreSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  scoreNumber: {
    fontSize: 64,
    fontFamily: "Helvetica-Bold",
  },
  scoreLabel: {
    fontSize: 14,
    color: SLATE,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginTop: 20,
    marginBottom: 8,
  },
  violationCard: {
    marginBottom: 10,
    padding: 10,
    borderLeftWidth: 3,
    backgroundColor: LIGHT_GRAY,
  },
  violationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: WHITE,
  },
  plainEnglish: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  fixInstruction: {
    fontSize: 9,
    color: SLATE,
    lineHeight: 1.3,
  },
  codeBlock: {
    fontSize: 8,
    fontFamily: "Courier",
    backgroundColor: "#1E293B",
    color: "#E2E8F0",
    padding: 8,
    marginTop: 4,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableCell: {
    fontSize: 9,
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    backgroundColor: LIGHT_GRAY,
  },
  disclaimerText: {
    fontSize: 8,
    color: SLATE,
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: SLATE,
  },
  urlText: {
    fontSize: 8,
    fontFamily: "Courier",
    color: SLATE,
    marginTop: 2,
  },
  demandBanner: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#D97706",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  demandBannerText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#92400E",
  },
});

// ── PDF Document ────────────────────────────────────────

interface ReportPDFProps {
  url: string;
  riskScore: number;
  violations: Violation[];
  pdfLinks: PDFLink[];
  widgets: ThirdPartyWidget[];
  effortSummary: EffortSummary;
  demandLetterMode: boolean;
  scanDate: string;
  pdfSummary?: string;
  widgetSummary?: string;
}

export function createReportPDF(props: ReportPDFProps) {
  const {
    url,
    riskScore,
    violations,
    pdfLinks,
    widgets,
    effortSummary,
    demandLetterMode,
    scanDate,
    pdfSummary,
    widgetSummary,
  } = props;

  const riskLevel = getRiskLevel(riskScore);
  const riskLabel = getRiskLabel(riskLevel);
  const riskColor = RISK_COLORS[riskLevel];

  return createElement(
    Document,
    null,
    createElement(
      Page,
      { size: "A4", style: styles.page },

      // Header
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: styles.logo }, "AccessFlow"),
        createElement(
          View,
          null,
          createElement(Text, { style: styles.date }, `Scan Date: ${scanDate}`),
          createElement(
            Text,
            { style: { ...styles.date, fontFamily: "Courier", marginTop: 2 } },
            url
          )
        )
      ),

      // Demand letter banner
      demandLetterMode &&
        createElement(
          View,
          { style: styles.demandBanner },
          createElement(
            Text,
            { style: styles.demandBannerText },
            "Legal Alert Mode — Demand letter prioritization enabled"
          )
        ),

      // Risk Score
      createElement(
        View,
        { style: styles.scoreSection },
        createElement(
          Text,
          { style: { ...styles.scoreNumber, color: riskColor } },
          String(riskScore)
        ),
        createElement(Text, { style: styles.scoreLabel }, riskLabel)
      ),

      // Summary stats
      createElement(
        View,
        {
          style: {
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 16,
          },
        },
        createElement(
          View,
          { style: { alignItems: "center" } },
          createElement(
            Text,
            { style: { fontSize: 18, fontFamily: "Helvetica-Bold" } },
            String(violations.length)
          ),
          createElement(
            Text,
            { style: { fontSize: 9, color: SLATE } },
            "Total Issues"
          )
        ),
        createElement(
          View,
          { style: { alignItems: "center" } },
          createElement(
            Text,
            {
              style: {
                fontSize: 18,
                fontFamily: "Helvetica-Bold",
                color: "#DC2626",
              },
            },
            String(
              violations.filter(
                (v) => v.impact === "critical" || v.impact === "serious"
              ).length
            )
          ),
          createElement(
            Text,
            { style: { fontSize: 9, color: SLATE } },
            "Critical/Serious"
          )
        ),
        createElement(
          View,
          { style: { alignItems: "center" } },
          createElement(
            Text,
            { style: { fontSize: 18, fontFamily: "Helvetica-Bold" } },
            String(pdfLinks.length)
          ),
          createElement(
            Text,
            { style: { fontSize: 9, color: SLATE } },
            "PDFs Found"
          )
        )
      ),

      // Effort Summary
      createElement(
        Text,
        { style: styles.sectionTitle },
        "Effort Summary"
      ),
      createElement(
        View,
        { style: styles.tableHeader },
        createElement(
          Text,
          { style: { ...styles.tableCell, width: "30%", fontFamily: "Helvetica-Bold" } },
          "Tier"
        ),
        createElement(
          Text,
          { style: { ...styles.tableCell, width: "20%", fontFamily: "Helvetica-Bold" } },
          "Count"
        ),
        createElement(
          Text,
          { style: { ...styles.tableCell, width: "50%", fontFamily: "Helvetica-Bold" } },
          "Est. Time"
        )
      ),
      ...["XS", "S", "M", "L", "XL", "EXT"].map((tier) =>
        createElement(
          View,
          { key: tier, style: styles.tableRow },
          createElement(
            Text,
            { style: { ...styles.tableCell, width: "30%" } },
            tier
          ),
          createElement(
            Text,
            { style: { ...styles.tableCell, width: "20%" } },
            String(
              effortSummary[tier as keyof Omit<EffortSummary, "total_hours_est">] || 0
            )
          ),
          createElement(
            Text,
            { style: { ...styles.tableCell, width: "50%", color: SLATE } },
            {
              XS: "< 1 hour each",
              S: "1–4 hours each",
              M: "1–3 days each",
              L: "1–2 weeks each",
              XL: "2–6 weeks each",
              EXT: "Vendor-dependent",
            }[tier] || ""
          )
        )
      ),
      createElement(
        View,
        {
          style: {
            ...styles.tableRow,
            borderTopWidth: 1,
            borderTopColor: NAVY,
            marginTop: 4,
          },
        },
        createElement(
          Text,
          {
            style: {
              ...styles.tableCell,
              width: "50%",
              fontFamily: "Helvetica-Bold",
            },
          },
          "Estimated Total"
        ),
        createElement(
          Text,
          {
            style: {
              ...styles.tableCell,
              width: "50%",
              fontFamily: "Helvetica-Bold",
            },
          },
          effortSummary.total_hours_est
        )
      )
    ),

    // Violations pages
    ...createViolationPages(violations, demandLetterMode),

    // PDF Inventory page (if any)
    ...(pdfLinks.length > 0
      ? [
          createElement(
            Page,
            { key: "pdfs", size: "A4", style: styles.page },
            createElement(
              Text,
              { style: styles.sectionTitle },
              `PDF Documents Found (${pdfLinks.length})`
            ),
            pdfSummary &&
              createElement(
                Text,
                { style: { fontSize: 9, color: SLATE, marginBottom: 8 } },
                pdfSummary
              ),
            ...pdfLinks.map((pdf, i) =>
              createElement(
                View,
                { key: i, style: styles.tableRow },
                createElement(
                  Text,
                  { style: { ...styles.tableCell, width: "40%" } },
                  pdf.link_text || "(no link text)"
                ),
                createElement(
                  Text,
                  {
                    style: {
                      ...styles.tableCell,
                      width: "60%",
                      fontFamily: "Courier",
                      fontSize: 7,
                    },
                  },
                  pdf.pdf_url
                )
              )
            ),
            createElement(
              View,
              { style: styles.footer },
              createElement(
                Text,
                null,
                "AccessFlow — accessflow.ai — This report is not legal advice."
              )
            )
          ),
        ]
      : []),

    // Widget Inventory page (if any)
    ...(widgets.length > 0
      ? [
          createElement(
            Page,
            { key: "widgets", size: "A4", style: styles.page },
            createElement(
              Text,
              { style: styles.sectionTitle },
              `Third-Party Widgets (${widgets.length})`
            ),
            widgetSummary &&
              createElement(
                Text,
                { style: { fontSize: 9, color: SLATE, marginBottom: 8 } },
                widgetSummary
              ),
            ...widgets.map((w, i) =>
              createElement(
                View,
                { key: i, style: styles.tableRow },
                createElement(
                  Text,
                  { style: { ...styles.tableCell, width: "30%" } },
                  w.widget_type
                ),
                createElement(
                  Text,
                  {
                    style: {
                      ...styles.tableCell,
                      width: "30%",
                      fontFamily: "Courier",
                      fontSize: 7,
                    },
                  },
                  w.src_domain
                ),
                createElement(
                  Text,
                  { style: { ...styles.tableCell, width: "40%", color: SLATE } },
                  w.note || ""
                )
              )
            ),
            createElement(
              View,
              { style: styles.footer },
              createElement(
                Text,
                null,
                "AccessFlow — accessflow.ai — This report is not legal advice."
              )
            )
          ),
        ]
      : []),

    // Disclaimer page
    createElement(
      Page,
      { key: "disclaimer", size: "A4", style: styles.page },
      createElement(
        Text,
        { style: styles.sectionTitle },
        "Important Disclaimer"
      ),
      createElement(
        View,
        { style: styles.disclaimer },
        createElement(
          Text,
          { style: styles.disclaimerText },
          "This report identifies potential accessibility barriers based on automated scanning and AI analysis. It is not legal advice and does not guarantee ADA or WCAG compliance. Automated tools cannot detect all accessibility issues — manual testing is required for full compliance. Consult a qualified attorney for legal guidance."
        )
      ),
      createElement(
        Text,
        { style: { ...styles.disclaimerText, marginTop: 12 } },
        `Report generated by AccessFlow on ${scanDate}. For questions or remediation services, visit accessflow.ai or email help@accessflow.ai.`
      ),
      createElement(
        View,
        { style: styles.footer },
        createElement(
          Text,
          null,
          "AccessFlow — accessflow.ai — This report is not legal advice."
        )
      )
    )
  );
}

/**
 * Create paginated violation pages (roughly 4–5 violations per page).
 */
function createViolationPages(
  violations: Violation[],
  demandLetterMode: boolean
) {
  const VIOLATIONS_PER_PAGE = 4;
  const pages = [];

  for (let i = 0; i < violations.length; i += VIOLATIONS_PER_PAGE) {
    const chunk = violations.slice(i, i + VIOLATIONS_PER_PAGE);
    const pageNum = Math.floor(i / VIOLATIONS_PER_PAGE) + 1;

    pages.push(
      createElement(
        Page,
        { key: `violations-${pageNum}`, size: "A4", style: styles.page },
        i === 0 &&
          createElement(
            Text,
            { style: styles.sectionTitle },
            `All Violations (${violations.length})`
          ),
        ...chunk.map((v, idx) =>
          createElement(
            View,
            {
              key: idx,
              style: {
                ...styles.violationCard,
                borderLeftColor:
                  SEVERITY_COLORS[
                    v.impact as keyof typeof SEVERITY_COLORS
                  ] || SEVERITY_COLORS.minor,
              },
            },
            createElement(
              View,
              { style: styles.violationHeader },
              createElement(
                Text,
                {
                  style: {
                    ...styles.badge,
                    backgroundColor:
                      SEVERITY_COLORS[
                        v.impact as keyof typeof SEVERITY_COLORS
                      ] || SEVERITY_COLORS.minor,
                  },
                },
                `${v.legal_risk} Risk`
              ),
              createElement(
                Text,
                {
                  style: {
                    ...styles.badge,
                    backgroundColor: TEAL,
                  },
                },
                `${v.effort_tier} (${v.effort_hours_est})`
              )
            ),
            createElement(
              Text,
              { style: styles.plainEnglish },
              v.plain_english
            ),
            createElement(
              Text,
              { style: styles.fixInstruction },
              `Fix: ${v.fix_instruction}`
            ),
            v.fix_code_snippet &&
              createElement(
                Text,
                { style: styles.codeBlock },
                v.fix_code_snippet
              ),
            createElement(Text, { style: styles.urlText }, v.page_url),
            // Demand letter fields
            demandLetterMode &&
              v.good_faith_note &&
              createElement(
                Text,
                {
                  style: {
                    fontSize: 8,
                    color: TEAL,
                    marginTop: 4,
                    fontStyle: "italic",
                  },
                },
                `Good Faith: ${v.good_faith_note}`
              )
          )
        ),
        createElement(
          View,
          { style: styles.footer },
          createElement(
            Text,
            null,
            "AccessFlow — accessflow.ai — This report is not legal advice."
          )
        )
      )
    );
  }

  return pages;
}
