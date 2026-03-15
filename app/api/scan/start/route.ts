import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const scanRequestSchema = z.object({
  url: z.string().url(),
  max_pages: z.number().int().min(1).max(25).default(10),
  email: z.string().email().optional(),
  demand_letter_mode: z.boolean().default(false),
  prior_scan_id: z.string().uuid().nullable().default(null),
  turnstile_token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = scanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // TODO: Validate URL — block private IPs (192.168.x, 10.x, 172.16-31.x, 127.x)
    // TODO: Verify Cloudflare Turnstile token
    // TODO: Check isbot — reject automated submissions
    // TODO: Check Upstash rate limit (3 scans per IP per 24h)
    // TODO: Normalize URL (force https://, strip tracking params, strip trailing slash)
    // TODO: HEAD request to verify URL reachable (3s timeout)
    // TODO: INSERT scan row into Supabase
    // TODO: Enqueue BullMQ job

    const scanId = crypto.randomUUID();

    return NextResponse.json({
      scan_id: scanId,
      status: "queued",
      estimated_seconds: 45,
      poll_url: `/api/scan/${scanId}/status`,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
