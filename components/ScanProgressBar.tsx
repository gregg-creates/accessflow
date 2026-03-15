"use client";

interface ScanProgressBarProps {
  pagesScanned: number;
  pagesTotal: number;
  status: string;
  currentUrl?: string;
}

const steps = [
  { key: "crawling", label: "Finding pages to scan..." },
  { key: "scanning", label: "Checking for ADA violations..." },
  { key: "enriching", label: "AI analyzing your results..." },
  { key: "generating_pdf", label: "Generating your report..." },
  { key: "completed", label: "Report ready!" },
];

export function ScanProgressBar({
  pagesScanned,
  pagesTotal,
  status,
  currentUrl,
}: ScanProgressBarProps) {
  const progressPct =
    pagesTotal > 0 ? Math.round((pagesScanned / pagesTotal) * 100) : 0;

  const currentStepIndex = steps.findIndex((s) => s.key === status);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mx-auto max-w-lg"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label={`Scan progress: ${pagesScanned} of ${pagesTotal} pages complete`}
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {pagesTotal > 0 && (
          <p className="mt-2 text-center text-sm text-slate-500">
            Page {pagesScanned} of {pagesTotal}
          </p>
        )}
      </div>

      {/* Step checklist */}
      <ul className="space-y-3" aria-label="Scan steps">
        {steps.map((step, i) => {
          const isComplete = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;

          return (
            <li key={step.key} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  isComplete
                    ? "bg-teal text-white"
                    : isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-400"
                }`}
                aria-hidden="true"
              >
                {isComplete ? "\u2713" : i + 1}
              </span>
              <span
                className={`text-sm ${
                  isComplete
                    ? "text-teal"
                    : isCurrent
                      ? "font-medium text-navy"
                      : "text-slate-400"
                }`}
              >
                {step.key === "scanning" && isCurrent && currentUrl
                  ? `Scanning: ${currentUrl}`
                  : step.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
