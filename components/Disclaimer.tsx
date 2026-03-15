export function DisclaimerBanner() {
  return (
    <aside
      role="note"
      aria-label="Legal disclaimer"
      className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
    >
      <p>
        <strong>Important:</strong> This report identifies potential
        accessibility barriers based on automated scanning and AI analysis. It
        is not legal advice and does not guarantee ADA or WCAG compliance.
        Automated tools cannot detect all accessibility issues — manual testing
        is required for full compliance. Consult a qualified attorney for legal
        guidance.{" "}
        <a href="/terms" className="underline hover:text-navy">
          Terms of Service
        </a>
        .
      </p>
    </aside>
  );
}
