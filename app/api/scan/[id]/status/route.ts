import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const scanId = params.id;

  // TODO: Fetch scan status from Supabase
  // TODO: Calculate progress_pct from pages_scanned / pages_total

  return NextResponse.json({
    scan_id: scanId,
    status: "queued",
    pages_scanned: 0,
    pages_total: 0,
    progress_pct: 0,
  });
}
