import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-navy">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-slate-600">
        <h2 className="text-xl font-bold text-navy">1. Service Description</h2>
        <p>
          AccessFlow provides automated web accessibility scanning and
          AI-powered analysis. Our service identifies potential WCAG 2.2 AA
          violations and provides suggested remediation steps.
        </p>

        <h2 className="text-xl font-bold text-navy">2. Not Legal Advice</h2>
        <p>
          AccessFlow is an automated scanning tool, not a legal service. Our
          reports identify potential accessibility barriers but do not
          constitute legal advice and do not guarantee ADA or WCAG compliance.
          Automated tools cannot detect all accessibility issues — manual
          testing is required for full compliance. Consult a qualified attorney
          for legal guidance.
        </p>

        <h2 className="text-xl font-bold text-navy">3. Acceptable Use</h2>
        <p>
          You may only scan websites you own or have authorization to scan.
          You agree not to use AccessFlow to scan websites for the purpose of
          filing frivolous litigation.
        </p>

        <h2 className="text-xl font-bold text-navy">4. Data Handling</h2>
        <p>
          We only scan publicly accessible pages. Scan results for free users
          are automatically deleted after 30 days. See our{" "}
          <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-800">
            Privacy Policy
          </a>{" "}
          for details on how we handle your data.
        </p>

        <h2 className="text-xl font-bold text-navy">5. Limitation of Liability</h2>
        <p>
          AccessFlow is provided &ldquo;as is&rdquo; without warranties of any
          kind. We are not liable for any damages arising from your use of the
          service or reliance on scan results.
        </p>

        <h2 className="text-xl font-bold text-navy">6. Contact</h2>
        <p>
          Questions about these terms? Contact us at{" "}
          <a
            href="mailto:legal@accessflow.ai"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            legal@accessflow.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}
