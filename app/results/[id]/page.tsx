"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RiskScoreBadge } from "@/components/RiskScoreBadge";
import { DisclaimerBanner } from "@/components/Disclaimer";
import type { Violation } from "@/types";

export default function ResultsPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [topIssues, setTopIssues] = useState<Violation[]>([]);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [demandLetterMode, setDemandLetterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [violationCount, setViolationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/scan/${scanId}/report`);
        if (!res.ok) return;
        const data = await res.json();
        setTopIssues(data.top_issues || []);
        setRiskScore(data.risk_score);
        setDemandLetterMode(data.demand_letter_mode);
        setViolationCount(data.violation_count);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [scanId]);

  // Focus the email input when modal opens
  useEffect(() => {
    if (showEmailModal) {
      emailInputRef.current?.focus();
    }
  }, [showEmailModal]);

  const closeModal = useCallback(() => {
    setShowEmailModal(false);
    setEmailError(null);
    // Return focus to trigger button
    triggerRef.current?.focus();
  }, []);

  // Keyboard handling: Escape to close + focus trap
  useEffect(() => {
    if (!showEmailModal) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showEmailModal, closeModal]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), scan_id: scanId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setEmailError(data.error || "Something went wrong. Please try again.");
        return;
      }

      router.push(`/results/${scanId}/full`);
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Loading results...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
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

      {/* Risk Score */}
      {riskScore !== null && (
        <div className="py-8 text-center">
          <RiskScoreBadge score={riskScore} />
          <p className="mt-4 text-lg text-slate-600">
            Your site has {violationCount} issue
            {violationCount !== 1 ? "s" : ""} commonly cited in ADA lawsuits
          </p>
        </div>
      )}

      {/* Top 5 violations preview */}
      {topIssues.length > 0 && (
        <section aria-labelledby="top-issues-heading" className="mt-8">
          <h2
            id="top-issues-heading"
            className="text-xl font-bold text-navy"
          >
            Top Issues Found
          </h2>
          <ul className="mt-4 space-y-4">
            {topIssues.map((issue, i) => (
              <li
                key={issue.id || i}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <p className="text-navy">{issue.plain_english}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Email gate CTA */}
      <div className="mt-10 text-center">
        <button
          ref={triggerRef}
          onClick={() => setShowEmailModal(true)}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          See Full Report — Enter Your Email
        </button>
      </div>

      {/* Email modal with focus trap */}
      {showEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-modal-heading"
        >
          {/* Backdrop — button for click-to-close accessibility */}
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
            aria-label="Close dialog"
            tabIndex={-1}
          />
          <div
            ref={modalRef}
            className="relative w-full max-w-md rounded-xl bg-white p-8"
          >
            <h2
              id="email-modal-heading"
              className="text-xl font-bold text-navy"
            >
              See your full report
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email to see exactly which issues put you at risk —
              and how to fix them.
            </p>
            <form onSubmit={handleEmailSubmit} className="mt-6">
              <label htmlFor="email-capture" className="sr-only">
                Email address
              </label>
              <input
                ref={emailInputRef}
                id="email-capture"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-describedby={emailError ? "email-error" : undefined}
                aria-invalid={emailError ? "true" : undefined}
                className={`w-full min-h-[44px] rounded-lg border px-4 py-3 text-navy placeholder:text-[#6B7280] ${
                  emailError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300"
                }`}
              />
              {emailError && (
                <p
                  id="email-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {emailError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full min-h-[44px] rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Loading..." : "View Full Report"}
              </button>
            </form>
            <button
              onClick={closeModal}
              className="mt-4 min-h-[44px] w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
