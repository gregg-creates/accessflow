import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-navy">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-slate-600">
        <h2 className="text-xl font-bold text-navy">
          1. Information We Collect
        </h2>
        <p>
          <strong>Scan data:</strong> When you submit a URL, we scan publicly
          accessible pages and store the scan results. We do not access
          password-protected or private pages.
        </p>
        <p>
          <strong>Account data:</strong> If you create an account, we collect
          your email address and name. If you sign in with Google, we receive
          your name and email from Google.
        </p>
        <p>
          <strong>Email capture:</strong> If you provide your email to view a
          full report, we store it to deliver your report and may send
          follow-up communication.
        </p>

        <h2 className="text-xl font-bold text-navy">
          2. How We Use Your Data
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>To perform accessibility scans and deliver reports</li>
          <li>To maintain your account and scan history</li>
          <li>To send transactional emails (report delivery, account updates)</li>
          <li>To improve our scanning accuracy and AI analysis</li>
        </ul>

        <h2 className="text-xl font-bold text-navy">3. Data Retention</h2>
        <p>
          Scan results for anonymous (non-authenticated) users are
          automatically deleted after 30 days. Authenticated users retain scan
          history until they delete their account.
        </p>

        <h2 className="text-xl font-bold text-navy">4. Data Sharing</h2>
        <p>
          We do not sell your data. We share data only with the service
          providers necessary to operate AccessFlow (hosting, email delivery,
          error tracking). All providers are bound by data processing
          agreements.
        </p>

        <h2 className="text-xl font-bold text-navy">5. Analytics</h2>
        <p>
          We use PostHog for privacy-first analytics. We do not use Google
          Analytics or any advertising trackers.
        </p>

        <h2 className="text-xl font-bold text-navy">6. Your Rights</h2>
        <p>
          You may request deletion of your account and all associated data at
          any time by contacting{" "}
          <a
            href="mailto:privacy@accessflow.ai"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            privacy@accessflow.ai
          </a>
          .
        </p>

        <h2 className="text-xl font-bold text-navy">7. Contact</h2>
        <p>
          For privacy questions, contact{" "}
          <a
            href="mailto:privacy@accessflow.ai"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            privacy@accessflow.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}
