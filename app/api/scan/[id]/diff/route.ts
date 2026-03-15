import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const scanId = params.id;

  // TODO: Require authenticated user
  // TODO: Require prior_scan_id on the scan record
  // TODO: Calculate diff: resolved, still_open, new_issues, regressions
  // TODO: still_open items older than 30 days with CRITICAL legal_risk get overdue: true
  // TODO: Return score_delta, pdf_diff, widget_diff

  return NextResponse.json({
    scan_id: scanId,
    error: "Diff requires authentication and a prior scan",
  });
}
