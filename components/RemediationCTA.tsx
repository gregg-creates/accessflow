interface RemediationCTAProps {
  riskScore: number;
  criticalCount: number;
  demandLetterMode: boolean;
}

export function RemediationCTA({
  riskScore,
  criticalCount,
  demandLetterMode,
}: RemediationCTAProps) {
  const urgency = demandLetterMode
    ? "You've received a legal notice. Let us fix your site and give you documented proof of remediation."
    : riskScore >= 61
      ? `Your site has ${criticalCount} critical issue${criticalCount !== 1 ? "s" : ""} commonly cited in ADA lawsuits.`
      : "Your site has accessibility barriers that could expose you to legal risk.";

  return (
    <section
      aria-labelledby="remediation-heading"
      className="my-8 rounded-xl bg-navy p-8 text-white"
    >
      <h2 id="remediation-heading" className="text-2xl font-bold">
        Don&apos;t want to fix it yourself?
      </h2>
      <p className="mt-3 text-lg text-slate-200">{urgency}</p>
      <p className="mt-2 text-slate-300">
        Our team fixes it for you — and gives you a verified before/after report
        as proof.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <a
          href={
            demandLetterMode
              ? "/remediation?mode=demand-letter"
              : "/remediation"
          }
          className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          aria-label="Learn about professional ADA remediation services"
        >
          {demandLetterMode
            ? "Fix It Now — Legal Response Package"
            : "Fix It For Me — Starting at $499"}
        </a>
        <a
          href="#violations"
          className="inline-flex min-h-[44px] items-center rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
        >
          I&apos;ll Fix It Myself
        </a>
      </div>
    </section>
  );
}
