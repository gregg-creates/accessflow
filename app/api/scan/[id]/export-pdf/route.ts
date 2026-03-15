import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const scanId = params.id;
  const supabase = createServerClient();

  const { data: scan, error } = await supabase
    .from("scans")
    .select("id, pdf_url, status")
    .eq("id", scanId)
    .single();

  if (error || !scan) {
    return NextResponse.json(
      { error: "Scan not found" },
      { status: 404 }
    );
  }

  if (scan.status !== "completed") {
    return NextResponse.json(
      { error: "Scan is not yet complete" },
      { status: 400 }
    );
  }

  if (!scan.pdf_url) {
    return NextResponse.json(
      { error: "PDF not yet generated" },
      { status: 404 }
    );
  }

  // Generate a fresh signed URL (1 hour expiry)
  const path = scan.pdf_url;
  const { data: signedUrl, error: signError } = await supabase.storage
    .from("reports")
    .createSignedUrl(path, 3600);

  if (signError || !signedUrl) {
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    scan_id: scan.id,
    pdf_url: signedUrl.signedUrl,
  });
}
