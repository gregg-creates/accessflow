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
    .select("id, status, pages_scanned, pages_total")
    .eq("id", scanId)
    .single();

  if (error || !scan) {
    return NextResponse.json(
      { error: "Scan not found" },
      { status: 404 }
    );
  }

  const progressPct =
    scan.pages_total > 0
      ? Math.round((scan.pages_scanned / scan.pages_total) * 100)
      : 0;

  return NextResponse.json({
    scan_id: scan.id,
    status: scan.status,
    pages_scanned: scan.pages_scanned,
    pages_total: scan.pages_total,
    progress_pct: progressPct,
  });
}
