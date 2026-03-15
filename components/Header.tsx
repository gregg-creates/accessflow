"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/remediation", label: "Fix It For Me" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-xl font-bold text-navy"
          aria-label="AccessFlow home"
        >
          AccessFlow
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-slate-600 transition-colors hover:text-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/auth/login"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Sign In
            </Link>
          </li>
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden"
        >
          <ul className="space-y-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-navy"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/auth/login"
                className="mt-2 block min-h-[44px] rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
