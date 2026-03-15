import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";

const leadSchema = z.object({
  email: z.string().email(),
  scan_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const { email, scan_id } = parsed.data;
    const supabase = createServerClient();

    // Upsert lead
    await supabase
      .from("leads")
      .upsert(
        { email, scan_id, source: "email_gate" },
        { onConflict: "email" }
      );

    // Update scan with captured email
    await supabase
      .from("scans")
      .update({ email_captured: email })
      .eq("id", scan_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
