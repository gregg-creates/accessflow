import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const scanId = params.id;
  const supabase = createServerClient();

  const { data: scan, error } = await supabase
    .from("scans")
    .select(
      "id, url, status, risk_score, violation_count, critical_count, serious_count, pdf_link_count, widget_count, demand_letter_mode, report_json, email_captured, pdf_url, created_at, completed_at"
    )
    .eq("id", scanId)
    .single();

  if (error || !scan) {
    return NextResponse.json(
      { error: "Scan not found" },
      { status: 404 }
    );
  }

  if (scan.status !== "completed") {
    return NextResponse.json({
      scan_id: scan.id,
      status: scan.status,
      report: null,
    });
  }

  const report = scan.report_json as Record<string, unknown> | null;

  // Always return top 5 issues
  const topIssues = report?.top_issues ?? [];

  // Only return full violations if email has been captured
  const allViolations = scan.email_captured
    ? report?.violations ?? []
    : null;

  return NextResponse.json({
    scan_id: scan.id,
    url: scan.url,
    status: scan.status,
    risk_score: scan.risk_score,
    violation_count: scan.violation_count,
    critical_count: scan.critical_count,
    serious_count: scan.serious_count,
    pdf_link_count: scan.pdf_link_count,
    widget_count: scan.widget_count,
    demand_letter_mode: scan.demand_letter_mode,
    pdf_url: scan.pdf_url,
    created_at: scan.created_at,
    completed_at: scan.completed_at,
    email_gated: !scan.email_captured,
    top_issues: topIssues,
    all_violations: allViolations,
    pdf_inventory: scan.email_captured ? report?.pdf_inventory ?? [] : null,
    widget_inventory: scan.email_captured
      ? report?.widget_inventory ?? []
      : null,
    effort_summary: scan.email_captured
      ? report?.effort_summary ?? null
      : null,
  });
}
