import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement",
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-navy">Accessibility Statement</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-slate-600">
        <p>
          AccessFlow is committed to ensuring digital accessibility for people
          with disabilities. We are continually improving the user experience
          for everyone and applying the relevant accessibility standards.
        </p>

        <h2 className="text-xl font-bold text-navy">Conformance Status</h2>
        <p>
          AccessFlow aims to conform to the Web Content Accessibility
          Guidelines (WCAG) 2.2 Level AA. These guidelines explain how to make
          web content more accessible for people with disabilities and more
          user-friendly for everyone.
        </p>

        <h2 className="text-xl font-bold text-navy">Measures Taken</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            All pages are regularly scanned using our own AccessFlow scanner
            and axe-core.
          </li>
          <li>
            Keyboard navigation is supported throughout the application.
          </li>
          <li>
            Skip navigation links are provided for screen reader users.
          </li>
          <li>
            All interactive elements meet WCAG 2.2 AA minimum target size
            requirements (44x44px).
          </li>
          <li>
            Color contrast ratios meet or exceed 4.5:1 for normal text and
            3:1 for large text.
          </li>
          <li>
            ARIA labels and roles are used to provide context for assistive
            technologies.
          </li>
          <li>
            Focus indicators are clearly visible on all interactive elements.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-navy">Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of AccessFlow. Please
          let us know if you encounter accessibility barriers:
        </p>
        <ul className="list-inside list-disc space-y-2">
          <li>
            Email:{" "}
            <a
              href="mailto:accessibility@accessflow.ai"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              accessibility@accessflow.ai
            </a>
          </li>
        </ul>
        <p>We aim to respond to accessibility feedback within 2 business days.</p>

        <h2 className="text-xl font-bold text-navy">
          Compatibility with Browsers and Assistive Technology
        </h2>
        <p>
          AccessFlow is designed to be compatible with the following browsers
          and assistive technologies:
        </p>
        <ul className="list-inside list-disc space-y-2">
          <li>Latest versions of Chrome, Firefox, Safari, and Edge</li>
          <li>NVDA with Firefox</li>
          <li>VoiceOver with Safari</li>
          <li>JAWS with Chrome</li>
        </ul>
      </div>
    </div>
  );
}
