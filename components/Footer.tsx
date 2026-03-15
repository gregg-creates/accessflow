import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/remediation", label: "Fix It For Me" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="min-h-[44px] text-sm text-slate-500 transition-colors hover:text-navy"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="mailto:help@accessflow.ai"
                className="min-h-[44px] text-sm text-slate-500 transition-colors hover:text-navy"
              >
                Get Help
              </a>
            </li>
          </ul>
        </nav>
        <p className="mt-6 text-center text-xs text-slate-400">
          AccessFlow is an automated scanning tool, not legal advice.
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} AccessFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
