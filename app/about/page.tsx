import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-navy">About AccessFlow</h1>

      {/* Founder statement */}
      <section aria-labelledby="founder-heading" className="mt-10">
        <h2 id="founder-heading" className="text-2xl font-bold text-navy">
          Why I Built This
        </h2>
        <blockquote className="mt-4 border-l-4 border-blue-600 pl-6 text-slate-600">
          <p className="leading-relaxed">
            &ldquo;I built AccessFlow because I ran into this problem as a small
            business owner and the right tool didn&apos;t exist. Every option I
            found was either a widget that made things worse, an enterprise
            platform I couldn&apos;t afford, or a free scanner that handed me
            jargon and tried to sell me the same broken product. That experience
            is the origin — but AccessFlow is for anyone who needs a straight
            answer about their website: what&apos;s wrong, how bad is it, and
            exactly how to fix it.&rdquo;
          </p>
          <footer className="mt-4 text-sm font-medium text-navy">
            — Gregg Foster, Founder
          </footer>
        </blockquote>
      </section>

      {/* Mission */}
      <section aria-labelledby="mission-heading" className="mt-12">
        <h2 id="mission-heading" className="text-2xl font-bold text-navy">
          Our Mission
        </h2>
        <blockquote className="mt-4 border-l-4 border-teal pl-6 text-slate-600">
          <p className="leading-relaxed">
            &ldquo;AccessFlow exists to make web accessibility understandable,
            affordable, and actionable for every website owner — not just the
            ones with enterprise budgets. My goal isn&apos;t just to build a
            product. It&apos;s to help people understand their obligations so
            they can protect themselves and help build a more accessible
            internet.&rdquo;
          </p>
        </blockquote>
      </section>

      {/* Founding principles */}
      <section aria-labelledby="principles-heading" className="mt-12">
        <h2 id="principles-heading" className="text-2xl font-bold text-navy">
          Three Founding Principles
        </h2>
        <ol className="mt-6 space-y-6">
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              1
            </span>
            <div>
              <h3 className="font-semibold text-navy">Honest tools only</h3>
              <p className="mt-1 text-slate-600">
                No overlays, no widgets, no conflict of interest.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              2
            </span>
            <div>
              <h3 className="font-semibold text-navy">Plain English always</h3>
              <p className="mt-1 text-slate-600">
                If a business owner can&apos;t act on it, it&apos;s not useful.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              3
            </span>
            <div>
              <h3 className="font-semibold text-navy">Education first</h3>
              <p className="mt-1 text-slate-600">
                A more accessible web benefits everyone.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
