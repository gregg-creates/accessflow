"use client";

import { useState } from "react";
import type { Violation } from "@/types";
import { EffortBadge } from "./EffortBadge";

const severityBorder: Record<string, string> = {
  critical: "violation-critical",
  serious: "violation-serious",
  moderate: "violation-moderate",
  minor: "violation-minor",
};

const legalRiskBadge: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800",
  HIGH: "bg-orange-100 text-orange-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-slate-100 text-slate-600",
};

interface ViolationCardProps {
  violation: Violation;
  demandLetterMode?: boolean;
}

export function ViolationCard({
  violation,
  demandLetterMode = false,
}: ViolationCardProps) {
  const [showCode, setShowCode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <article
      className={`rounded-lg bg-white p-6 shadow-sm ${severityBorder[violation.impact]}`}
    >
      <div className="flex flex-wrap items-start gap-2">
        {/* Legal risk or urgency badge */}
        {demandLetterMode && violation.fix_urgency ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              violation.fix_urgency === "IMMEDIATE"
                ? "bg-red-100 text-red-800"
                : violation.fix_urgency === "PRIORITY"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {violation.fix_urgency}
          </span>
        ) : (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${legalRiskBadge[violation.legal_risk]}`}
          >
            {violation.legal_risk} Risk
          </span>
        )}

        {/* Litigation likelihood (demand letter mode only) */}
        {demandLetterMode && violation.litigation_likelihood && (
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            Litigation: {violation.litigation_likelihood}
          </span>
        )}

        <EffortBadge
          tier={violation.effort_tier}
          hoursEst={violation.effort_hours_est}
        />
      </div>

      {/* Plain English explanation */}
      <p className="mt-3 text-base leading-relaxed text-navy">
        {violation.plain_english}
      </p>

      {/* Fix instruction */}
      <p className="mt-2 text-sm text-slate-600">
        <strong className="text-navy">Fix:</strong> {violation.fix_instruction}
      </p>

      {/* Affected page */}
      <p className="mt-2 font-mono text-xs text-slate-400">
        {violation.page_url}
      </p>

      {/* Collapsible: code fix */}
      {violation.fix_code_snippet && (
        <div className="mt-4">
          <button
            onClick={() => setShowCode(!showCode)}
            className="min-h-[44px] text-sm font-medium text-blue-600 hover:text-blue-800"
            aria-expanded={showCode}
          >
            {showCode ? "Hide Code Fix" : "Show Code Fix"}
          </button>
          {showCode && (
            <div className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-4">
              <pre className="font-mono text-sm text-slate-100">
                {violation.fix_code_snippet}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Collapsible: developer details */}
      <div className="mt-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="min-h-[44px] text-sm font-medium text-slate-500 hover:text-slate-700"
          aria-expanded={showDetails}
        >
          {showDetails ? "Hide Developer Details" : "Developer Details"}
        </button>
        {showDetails && (
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-slate-50 p-4 text-sm">
            <dt className="font-medium text-slate-600">WCAG Criterion</dt>
            <dd className="font-mono text-slate-800">
              {violation.wcag_criterion}
            </dd>
            <dt className="font-medium text-slate-600">Axe Rule ID</dt>
            <dd className="font-mono text-slate-800">{violation.wcag_id}</dd>
            <dt className="font-medium text-slate-600">Selector</dt>
            <dd className="font-mono text-xs text-slate-800">
              {violation.element_selector}
            </dd>
            <dt className="font-medium text-slate-600">Element HTML</dt>
            <dd className="overflow-x-auto font-mono text-xs text-slate-800">
              {violation.element_html}
            </dd>
          </dl>
        )}
      </div>

      {/* Good faith note (demand letter mode) */}
      {demandLetterMode && violation.good_faith_note && (
        <p className="mt-3 rounded-lg border border-teal/20 bg-teal/5 p-3 text-sm text-teal">
          <strong>Good Faith Note:</strong> {violation.good_faith_note}
        </p>
      )}
    </article>
  );
}
