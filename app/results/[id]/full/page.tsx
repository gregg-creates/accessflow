"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { RiskScoreBadge } from "@/components/RiskScoreBadge";
import { RemediationCTA } from "@/components/RemediationCTA";
import { ViolationCard } from "@/components/ViolationCard";
import { PDFInventory } from "@/components/PDFInventory";
import { WidgetInventory } from "@/components/WidgetInventory";
import { DisclaimerBanner } from "@/components/Disclaimer";
import type { EffortTier, ReportJSON, Violation } from "@/types";

const effortLabels: Record<EffortTier, { label: string; time: string }> = {
  XS: { label: "Extra Small", time: "< 1 hour" },
  S: { label: "Small", time: "1-4 hours" },
  M: { label: "Medium", time: "1-3 days" },
  L: { label: "Large", time: "1-2 weeks" },
  XL: { label: "Extra Large", time: "2-6 weeks" },
  EXT: { label: "External", time: "Vendor-dependent" },
};

type ViewMode = "by-page" | "by-type";

function groupByPage(
  violations: Violation[]
): Map<string, Violation[]> {
  const groups = new Map<string, Violation[]>();
  for (const v of violations) {
    const key = v.page_url || "Unknown page";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(v);
  }
  return groups;
}

function groupByType(
  violations: Violation[]
): Map<string, Violation[]> {
  const groups = new Map<string, Violation[]>();
  for (const v of violations) {
    const key = v.wcag_criterion || v.wcag_id || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(v);
  }
  return groups;
}

export default function FullReportPage() {
  const params = useParams();
  const scanId = params.id as string;

  const [report, setReport] = useState<ReportJSON | null>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [demandLetterMode, setDemandLetterMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("by-type");

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/scan/${scanId}/report`);
        if (!res.ok) return;
        const data = await res.json();
        setReport(data.report);
        setRiskScore(data.risk_score ?? 0);
        setCriticalCount(data.critical_count ?? 0);
        setDemandLetterMode(data.demand_letter_mode ?? false);
      } catch {
        // Handle error
      }
    }
    fetchReport();
  }, [scanId]);

  const groupedViolations = useMemo(() => {
    if (!report) return new Map();
    return viewMode === "by-page"
      ? groupByPage(report.violations)
      : groupByType(report.violations);
  }, [report, viewMode]);

  if (!report) {
    return (
      <div className="py-20 text-center text-slate-500">
        Loading report...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Risk score header */}
      <div className="py-8 text-center">
        <RiskScoreBadge score={riskScore} />
      </div>

      {/* Demand letter banner */}
      {demandLetterMode && (
        <div
          className="mb-8 rounded-lg border border-orange/30 bg-orange/5 p-4 text-center"
          role="alert"
        >
          <p className="font-semibold text-orange">
            Legal Alert Mode Active — Demand letter prioritization enabled
          </p>
        </div>
      )}

      {/* Remediation CTA (top) */}
      <RemediationCTA
        riskScore={riskScore}
        criticalCount={criticalCount}
        demandLetterMode={demandLetterMode}
      />

      {/* Effort Summary */}
      {report.effort_summary && (
        <section aria-labelledby="effort-heading" className="mt-8">
          <h2 id="effort-heading" className="text-xl font-bold text-navy">
            Effort Summary
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="pb-2 font-medium text-slate-600">
                    Tier
                  </th>
                  <th scope="col" className="pb-2 font-medium text-slate-600">
                    Count
                  </th>
                  <th scope="col" className="pb-2 font-medium text-slate-600">
                    Estimated Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(
                  Object.entries(report.effort_summary) as [string, number][]
                )
                  .filter(([key]) => key !== "total_hours_est")
                  .map(([tier, count]) => (
                    <tr key={tier}>
                      <td className="py-2 font-medium text-navy">
                        {effortLabels[tier as EffortTier]?.label ?? tier}
                      </td>
                      <td className="py-2 text-slate-600">{count}</td>
                      <td className="py-2 text-slate-500">
                        {effortLabels[tier as EffortTier]?.time}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-300">
                  <td className="pt-2 font-semibold text-navy" colSpan={2}>
                    Estimated Total
                  </td>
                  <td className="pt-2 font-semibold text-navy">
                    {report.effort_summary.total_hours_est}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* View toggle */}
      <div className="mt-10" role="tablist" aria-label="View violations by">
        <button
          role="tab"
          aria-selected={viewMode === "by-type"}
          onClick={() => setViewMode("by-type")}
          className={`min-h-[44px] rounded-l-lg border px-4 py-2 text-sm font-medium ${
            viewMode === "by-type"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-600"
          }`}
        >
          By Issue Type
        </button>
        <button
          role="tab"
          aria-selected={viewMode === "by-page"}
          onClick={() => setViewMode("by-page")}
          className={`min-h-[44px] rounded-r-lg border border-l-0 px-4 py-2 text-sm font-medium ${
            viewMode === "by-page"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-600"
          }`}
        >
          By Page
        </button>
      </div>

      {/* Violations list — grouped */}
      <section
        id="violations"
        aria-labelledby="violations-heading"
        className="mt-6"
        role="tabpanel"
      >
        <h2 id="violations-heading" className="sr-only">
          All Violations
        </h2>

        {report.violations.length === 0 ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
            <p className="text-lg font-medium text-green-800">
              No violations found. Great work!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(groupedViolations.entries()).map(
              ([groupLabel, violations]: [string, Violation[]]) => (
                <div key={groupLabel}>
                  <h3 className="sticky top-[73px] z-10 -mx-1 bg-white/95 px-1 py-2 text-sm font-semibold text-slate-500 backdrop-blur-sm">
                    {viewMode === "by-page" ? (
                      <span className="font-mono text-xs">{groupLabel}</span>
                    ) : (
                      groupLabel
                    )}
                    <span className="ml-2 text-slate-400">
                      ({violations.length} issue
                      {violations.length !== 1 ? "s" : ""})
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {violations.map((v) => (
                      <ViolationCard
                        key={v.id}
                        violation={v}
                        demandLetterMode={demandLetterMode}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* PDF Inventory */}
      <PDFInventory pdfs={report.pdf_inventory} />

      {/* Widget Inventory */}
      <WidgetInventory widgets={report.widget_inventory} />

      {/* Remediation CTA (bottom) */}
      <RemediationCTA
        riskScore={riskScore}
        criticalCount={criticalCount}
        demandLetterMode={demandLetterMode}
      />

      {/* PDF Export */}
      <div className="mt-8 text-center">
        <a
          href={`/api/scan/${scanId}/export-pdf`}
          className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
        >
          Download PDF Report
        </a>
      </div>

      {/* Disclaimer */}
      <div className="mt-8">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
