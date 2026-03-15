"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiskScoreBadge } from "@/components/RiskScoreBadge";
import type { Scan } from "@/types";

export default function DashboardPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function fetchScans() {
      try {
        // TODO: Check Supabase auth session
        // TODO: Fetch scans from Supabase where user_id = current user
        // For now, simulate auth check
        setAuthenticated(false);
        setScans([]);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-navy">Scan History</h1>
        <p className="mt-2 text-slate-500">
          View past scans, compare scores over time, and track your
          remediation progress.
        </p>
        <div className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-slate-500">
            Sign in to view your scan history.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Scan History</h1>
          <p className="mt-2 text-slate-500">
            {scans.length} scan{scans.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          New Scan
        </Link>
      </div>

      {scans.length === 0 ? (
        <div className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-slate-500">
            No scans yet. Run your first scan to get started.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Scan a Website
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Website
                </th>
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Risk Score
                </th>
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Violations
                </th>
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Date
                </th>
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  Status
                </th>
                <th scope="col" className="pb-3 font-medium text-slate-600">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <Link
                      href={`/results/${scan.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {scan.url}
                    </Link>
                    {scan.demand_letter_mode && (
                      <span className="ml-2 rounded-full bg-orange/10 px-2 py-0.5 text-xs font-medium text-orange">
                        Legal Alert
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {scan.risk_score !== null ? (
                      <RiskScoreBadge score={scan.risk_score} size="sm" />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-600">
                    {scan.violation_count > 0 ? (
                      <span>
                        {scan.violation_count} total
                        {scan.critical_count > 0 && (
                          <span className="ml-1 text-red-600">
                            ({scan.critical_count} critical)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        scan.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : scan.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {scan.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/results/${scan.id}/full`}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
                        aria-label={`View full report for ${scan.url}`}
                      >
                        View
                      </Link>
                      {scan.status === "completed" && (
                        <button
                          type="button"
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                          aria-label={`Re-scan ${scan.url}`}
                          onClick={() => {
                            // TODO: POST /api/scan/start with prior_scan_id = scan.id
                          }}
                        >
                          Re-scan
                        </button>
                      )}
                      {scan.prior_scan_id && (
                        <Link
                          href={`/results/${scan.id}/full`}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-sm font-medium text-teal hover:bg-teal/5"
                          aria-label={`View score changes for ${scan.url}`}
                        >
                          Diff
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
