import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { calculateScanDiff } from "@/lib/diff";
import type { ReportJSON } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const scanId = params.id;
  const supabase = createServerClient();

  // Fetch current scan
  const { data: scan, error } = await supabase
    .from("scans")
    .select(
      "id, status, risk_score, prior_scan_id, report_json, user_id"
    )
    .eq("id", scanId)
    .single();

  if (error || !scan) {
    return NextResponse.json(
      { error: "Scan not found" },
      { status: 404 }
    );
  }

  if (!scan.prior_scan_id) {
    return NextResponse.json(
      { error: "This scan has no prior scan to compare against" },
      { status: 400 }
    );
  }

  if (scan.status !== "completed") {
    return NextResponse.json(
      { error: "Scan is not yet complete" },
      { status: 400 }
    );
  }

  // Fetch prior scan
  const { data: priorScan, error: priorError } = await supabase
    .from("scans")
    .select("id, risk_score, report_json")
    .eq("id", scan.prior_scan_id)
    .single();

  if (priorError || !priorScan) {
    return NextResponse.json(
      { error: "Prior scan not found" },
      { status: 404 }
    );
  }

  const currentReport = scan.report_json as ReportJSON | null;
  const priorReport = priorScan.report_json as ReportJSON | null;

  if (!currentReport || !priorReport) {
    return NextResponse.json(
      { error: "Report data is missing" },
      { status: 400 }
    );
  }

  const diff = calculateScanDiff(
    currentReport.violations,
    priorReport.violations,
    currentReport.pdf_inventory,
    priorReport.pdf_inventory,
    currentReport.widget_inventory,
    priorReport.widget_inventory,
    scan.risk_score ?? 0,
    priorScan.risk_score ?? 0
  );

  return NextResponse.json({
    scan_id: scan.id,
    prior_scan_id: priorScan.id,
    score_current: scan.risk_score,
    score_prior: priorScan.risk_score,
    ...diff,
  });
}
