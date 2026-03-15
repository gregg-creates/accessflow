import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const scanId = params.id;

  // TODO: Fetch scan + violations from Supabase
  // TODO: Return top_issues (top 5) always
  // TODO: Return all_violations only if email_captured is set
  // TODO: Include pdf_inventory, widget_inventory, effort_summary
  // TODO: Include demand_letter_mode flag

  return NextResponse.json({
    scan_id: scanId,
    risk_score: null,
    violation_count: 0,
    critical_count: 0,
    demand_letter_mode: false,
    report: null,
  });
}
