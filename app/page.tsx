"use client";

import { useState } from "react";
import { DisclaimerBanner } from "@/components/Disclaimer";

const trustStats = [
  { value: "5,000+", label: "ADA lawsuits in 2025" },
  { value: "94.8%", label: "of sites fail WCAG" },
  { value: "$1M", label: "FTC fine for overlay widgets" },
];

const howItWorks = [
  {
    step: "1",
    title: "Scan",
    description: "Enter your URL. We crawl up to 10 pages in 60 seconds.",
  },
  {
    step: "2",
    title: "Get your score",
    description:
      "See your 0-100 risk score and plain-English violation summaries.",
  },
  {
    step: "3",
    title: "Fix what matters",
    description:
      "Get exact code fixes, effort estimates, and legal risk ratings.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    features: ["3 scans/month", "Top 5 violations", "Risk score"],
  },
  {
    name: "Starter",
    price: "$49/mo",
    features: [
      "25 scans/month",
      "Full violation report",
      "PDF export",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$99/mo",
    features: [
      "100 scans/month",
      "Scan history & diff",
      "Demand letter mode",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Agency",
    price: "$299/mo",
    features: [
      "Unlimited scans",
      "Multi-site dashboard",
      "White-label PDF",
      "API access",
    ],
  },
];

const faqs = [
  {
    q: "What is WCAG?",
    a: "WCAG (Web Content Accessibility Guidelines) is the international standard for web accessibility. Version 2.2 AA is the level most courts and regulators reference when evaluating ADA compliance for websites.",
  },
  {
    q: "Am I legally required to make my website accessible?",
    a: "Under the ADA and recent DOJ guidance, websites of public accommodations must be accessible. Over 5,000 ADA website lawsuits were filed in 2025 alone. Consult an attorney for advice specific to your situation.",
  },
  {
    q: "What does the scan check?",
    a: "AccessFlow uses axe-core to test against WCAG 2.2 AA criteria — the same standard used in court. We check for missing alt text, form labels, color contrast, keyboard navigation, and dozens of other issues across up to 10 pages.",
  },
  {
    q: "How is this different from AccessiBe or overlay widgets?",
    a: "Overlay widgets attempt to patch accessibility issues with JavaScript — an approach the FTC fined $1M for deceptive claims. AccessFlow identifies the actual code problems and gives you real fixes. We don't sell overlays or widgets.",
  },
  {
    q: "Is my data safe?",
    a: "We only scan publicly accessible pages. Scan results are encrypted at rest, auto-deleted after 30 days for free users, and never shared with third parties. See our Privacy Policy for details.",
  },
];

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [demandLetterMode, setDemandLetterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    // TODO: Cloudflare Turnstile validation
    // TODO: POST /api/scan/start
    // TODO: Redirect to /scanning/[id]
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Is Your Website One Demand Letter Away from a Lawsuit?
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Over 5,000 ADA website lawsuits were filed in 2025 — and 94.8% of
            websites fail basic accessibility standards. Find out where yours
            stands. Free. In 60 seconds.
          </p>

          {/* Scan Form */}
          <form onSubmit={handleSubmit} className="mt-10">
            <div className="flex flex-col gap-4 sm:flex-row">
              <label htmlFor="scan-url" className="sr-only">
                Website URL to scan for ADA compliance
              </label>
              <input
                id="scan-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                aria-label="Website URL to scan for ADA compliance"
                className="min-h-[44px] flex-1 rounded-lg border-0 px-4 py-3 text-navy placeholder:text-[#6B7280]"
              />
              <button
                type="submit"
                className="min-h-[44px] whitespace-nowrap rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Scan My Website — Free
              </button>
            </div>

            <label className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={demandLetterMode}
                onChange={(e) => setDemandLetterMode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-400"
              />
              I&apos;ve received a demand letter or legal notice
            </label>

            {/* Error region */}
            <div aria-live="assertive" className="mt-2">
              {error && <p className="text-sm text-orange">{error}</p>}
            </div>
          </form>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 sm:grid-cols-3">
          {trustStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-navy">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        className="bg-slate-50 px-4 py-16"
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-4xl">
          <h2
            id="how-heading"
            className="text-center text-3xl font-bold text-navy"
          >
            How It Works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-navy">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Callout */}
      <section
        className="bg-white px-4 py-16"
        aria-labelledby="widget-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2 id="widget-heading" className="text-2xl font-bold text-navy">
            Why not just install an accessibility widget?
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            Because it doesn&apos;t work. AccessiBe, UserWay, and AudioEye sell
            overlay widgets that claim to automatically fix your site. In
            January 2025, the FTC fined AccessiBe $1M for deceptive claims —
            and businesses using their widget are still getting sued. Some free
            scanners even recommend these same widgets as the &quot;fix&quot;
            for every violation they find. AccessFlow gives you the real fix:
            the actual code change, in plain English, with no upsell.
          </p>
          <blockquote className="mt-6 rounded-lg border-l-4 border-blue-600 bg-slate-50 py-4 pl-6 pr-4 text-slate-700">
            &ldquo;Some &lsquo;free&rsquo; accessibility checkers recommend an
            overlay widget as the fix for every violation — the same overlay
            fined $1M by the FTC. We give you the actual code fix. No upsells.
            No widgets. No conflict of interest.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Founder Story */}
      <section
        className="bg-slate-50 px-4 py-16"
        aria-labelledby="founder-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2 id="founder-heading" className="text-2xl font-bold text-navy">
            Built from firsthand experience. For anyone with a website.
          </h2>
          <blockquote className="mt-4 border-l-4 border-blue-600 pl-6 text-slate-600">
            <p className="leading-relaxed">
              I&apos;m Gregg Foster. I started building AccessFlow as a small
              business owner who ran into this problem and found nothing useful.
              Every option was a $400/month overlay that made things worse, a
              $10,000/year platform for teams I didn&apos;t have, or a free
              scanner that showed me jargon and tried to sell me the same broken
              product. That experience is the origin. But AccessFlow isn&apos;t
              just for small businesses — it&apos;s for any website owner,
              developer, agency, or team that wants a straight answer:
              what&apos;s wrong, how bad is it, and how do I fix it?
            </p>
            <footer className="mt-4 text-sm font-medium text-navy">
              — Gregg Foster, Founder
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Pricing */}
      <section
        className="bg-white px-4 py-16"
        aria-labelledby="pricing-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="pricing-heading"
            className="text-center text-3xl font-bold text-navy"
          >
            Simple, transparent pricing
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-6 ${
                  tier.featured
                    ? "border-blue-600 ring-2 ring-blue-600"
                    : "border-slate-200"
                }`}
              >
                <h3 className="text-lg font-semibold text-navy">
                  {tier.name}
                </h3>
                <p className="mt-2 text-3xl font-bold text-navy">
                  {tier.price}
                </p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-0.5 text-teal" aria-hidden="true">
                        &#10003;
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="bg-slate-50 px-4 py-16"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="faq-heading"
            className="text-center text-3xl font-bold text-navy"
          >
            Frequently Asked Questions
          </h2>
          <dl className="mt-10 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="text-lg font-semibold text-navy">{faq.q}</dt>
                <dd className="mt-2 leading-relaxed text-slate-600">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
