"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const tiers = [
  {
    name: "Accessibility Audit Report",
    price: "$199",
    scope: "Automated + manual review, top 10 pages",
    timeline: "3 business days",
  },
  {
    name: "Starter Remediation",
    price: "$499",
    scope: "Fix Critical + High, up to 5 pages",
    timeline: "5 business days",
  },
  {
    name: "Standard Remediation",
    price: "$1,500",
    scope: "Fix Critical/High/Moderate, up to 15 pages",
    timeline: "10 business days",
  },
  {
    name: "Full Remediation",
    price: "$3,500",
    scope: "Complete WCAG 2.2 AA, unlimited pages + compliance letter",
    timeline: "15-20 business days",
  },
  {
    name: "Ongoing Monitoring",
    price: "$299/mo",
    scope: "Monthly rescan + delta report + 1 remediation hour",
    timeline: "Monthly",
  },
];

const guarantees = [
  "Fixed or we redo it free",
  "Before/after verified with AccessFlow rescan",
  "Response within 1 business day",
];

export default function RemediationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading...</div>}>
      <RemediationContent />
    </Suspense>
  );
}

function RemediationContent() {
  const searchParams = useSearchParams();
  const isDemandLetterMode = searchParams.get("mode") === "demand-letter";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [tier, setTier] = useState("");
  const [context, setContext] = useState(
    isDemandLetterMode ? "demand-letter" : ""
  );

  // Demand letter fields
  const [demandLetterDate, setDemandLetterDate] = useState("");
  const [attorneyFirm, setAttorneyFirm] = useState("");
  const [deadline, setDeadline] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !url.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: POST to intake endpoint or Tally.so webhook
      // TODO: If deadline <= 14 days, flag URGENT in intake notification
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate if deadline is urgent (14 days or less)
  const isUrgent =
    isDemandLetterMode &&
    deadline &&
    (() => {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffDays = Math.ceil(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 14;
    })();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Demand letter mode banner */}
      {isDemandLetterMode && (
        <div
          className="mb-8 rounded-lg border border-orange/30 bg-orange/5 p-4 text-center"
          role="alert"
        >
          <p className="font-semibold text-orange">
            Legal Alert Mode — You indicated you&apos;ve received a demand
            letter or legal notice
          </p>
        </div>
      )}

      <h1 className="text-center text-4xl font-bold text-navy">
        {isDemandLetterMode
          ? "Urgent Remediation — Legal Response Package"
          : "Your Website Fixed. Verified. Documented."}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
        {isDemandLetterMode
          ? "Our team prioritizes and fixes critical accessibility issues, then provides documented proof of remediation for your legal response."
          : "Our team identifies, fixes, and verifies every accessibility barrier — and gives you a compliance report you can show your attorney."}
      </p>

      {/* Guarantees */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {guarantees.map((g, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-6 text-center"
          >
            <span className="text-2xl text-teal" aria-hidden="true">
              &#10003;
            </span>
            <p className="mt-2 font-medium text-navy">{g}</p>
          </div>
        ))}
      </div>

      {/* Service tiers */}
      <section aria-labelledby="tiers-heading" className="mt-16">
        <h2 id="tiers-heading" className="text-2xl font-bold text-navy">
          Service Tiers
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Tier
                </th>
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Price
                </th>
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Scope
                </th>
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Timeline
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tiers.map((t) => (
                <tr key={t.name}>
                  <td className="py-3 font-medium text-navy">{t.name}</td>
                  <td className="py-3 font-semibold text-navy">{t.price}</td>
                  <td className="py-3 text-slate-600">{t.scope}</td>
                  <td className="py-3 text-slate-500">{t.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Intake form */}
      <section aria-labelledby="intake-heading" className="mt-16">
        <h2 id="intake-heading" className="text-2xl font-bold text-navy">
          {isDemandLetterMode ? "Urgent Intake" : "Get Started"}
        </h2>

        {submitted ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-8 text-center">
            <p className="text-lg font-medium text-green-800">
              {isDemandLetterMode
                ? "We've received your urgent request. Our team will respond within 1 business day."
                : "Thank you! Our team will be in touch within 1 business day."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Urgency alert */}
            {isUrgent && (
              <div
                className="rounded-lg border border-red-300 bg-red-50 p-4"
                role="alert"
              >
                <p className="font-semibold text-red-800">
                  URGENT — Your deadline is within 14 days. This request will
                  be flagged for priority response.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="intake-name"
                className="block text-sm font-medium text-navy"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="intake-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy placeholder:text-[#6B7280]"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label
                htmlFor="intake-email"
                className="block text-sm font-medium text-navy"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="intake-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy placeholder:text-[#6B7280]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="intake-url"
                className="block text-sm font-medium text-navy"
              >
                Website URL <span className="text-red-500">*</span>
              </label>
              <input
                id="intake-url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy placeholder:text-[#6B7280]"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label
                htmlFor="intake-tier"
                className="block text-sm font-medium text-navy"
              >
                Preferred tier
              </label>
              <select
                id="intake-tier"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy"
              >
                <option value="">Select a tier...</option>
                {tiers.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} — {t.price}
                  </option>
                ))}
              </select>
            </div>

            {!isDemandLetterMode && (
              <div>
                <label
                  htmlFor="intake-context"
                  className="block text-sm font-medium text-navy"
                >
                  Context
                </label>
                <select
                  id="intake-context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy"
                >
                  <option value="">Select...</option>
                  <option value="demand-letter">
                    I&apos;ve received a demand letter
                  </option>
                  <option value="proactive">Proactive remediation</option>
                  <option value="client-site">Client site (agency)</option>
                </select>
              </div>
            )}

            {/* Demand letter intake fields */}
            {isDemandLetterMode && (
              <>
                <div>
                  <label
                    htmlFor="intake-demand-date"
                    className="block text-sm font-medium text-navy"
                  >
                    Date demand letter received
                  </label>
                  <input
                    id="intake-demand-date"
                    type="date"
                    value={demandLetterDate}
                    onChange={(e) => setDemandLetterDate(e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy"
                  />
                </div>

                <div>
                  <label
                    htmlFor="intake-attorney"
                    className="block text-sm font-medium text-navy"
                  >
                    Attorney / firm name (optional)
                  </label>
                  <input
                    id="intake-attorney"
                    type="text"
                    value={attorneyFirm}
                    onChange={(e) => setAttorneyFirm(e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy placeholder:text-[#6B7280]"
                    placeholder="Smith & Associates"
                  />
                </div>

                <div>
                  <label
                    htmlFor="intake-deadline"
                    className="block text-sm font-medium text-navy"
                  >
                    Response deadline
                  </label>
                  <input
                    id="intake-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy"
                  />
                </div>

                <div>
                  <label
                    htmlFor="intake-upload"
                    className="block text-sm font-medium text-navy"
                  >
                    Upload demand letter (PDF)
                  </label>
                  <input
                    id="intake-upload"
                    type="file"
                    accept=".pdf"
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-300 px-4 py-3 text-navy file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700"
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : isDemandLetterMode
                  ? "Submit Urgent Request"
                  : "Submit Request"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
