import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isbot } from "isbot";
import { createServerClient } from "@/lib/supabase";
import { scanRateLimit } from "@/lib/ratelimit";
import { scanQueue } from "@/lib/queue";
import {
  validateAndNormalizeUrl,
  checkUrlReachable,
} from "@/lib/url-validator";
import { logger } from "@/lib/logger";

const scanRequestSchema = z.object({
  url: z.string().min(1, "URL is required"),
  max_pages: z.number().int().min(1).max(25).default(10),
  email: z.string().email().optional(),
  demand_letter_mode: z.boolean().default(false),
  prior_scan_id: z.string().uuid().nullable().default(null),
  turnstile_token: z.string().min(1, "CAPTCHA verification required"),
});

export async function POST(request: NextRequest) {
  try {
    // ── Bot detection ──
    const ua = request.headers.get("user-agent") || "";
    if (isbot(ua)) {
      return NextResponse.json(
        { error: "Automated submissions are not allowed." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = scanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { url, max_pages, email, demand_letter_mode, prior_scan_id, turnstile_token } =
      parsed.data;

    // ── Turnstile verification ──
    const turnstileRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstile_token,
          remoteip: request.headers.get("x-forwarded-for") || undefined,
        }),
      }
    );
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    // ── Rate limiting ──
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { success: withinLimit } = await scanRateLimit.limit(ip);
    if (!withinLimit) {
      return NextResponse.json(
        {
          error:
            "You've reached the scan limit (3 per 24 hours). Please try again later.",
        },
        { status: 429 }
      );
    }

    // ── URL validation ──
    const validation = validateAndNormalizeUrl(url);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // ── Reachability check ──
    const reachable = await checkUrlReachable(validation.normalizedUrl!);
    if (!reachable.reachable) {
      return NextResponse.json(
        { error: reachable.error },
        { status: 400 }
      );
    }

    // ── Insert scan row ──
    const supabase = createServerClient();
    const { data: scan, error: insertError } = await supabase
      .from("scans")
      .insert({
        url: validation.normalizedUrl,
        status: "queued",
        pages_total: max_pages,
        demand_letter_mode,
        prior_scan_id,
        email_captured: email || null,
      })
      .select("id")
      .single();

    if (insertError || !scan) {
      logger.error({ error: insertError }, "Failed to insert scan");
      return NextResponse.json(
        { error: "Failed to create scan. Please try again." },
        { status: 500 }
      );
    }

    // ── Capture lead if email provided ──
    if (email) {
      await supabase
        .from("leads")
        .upsert(
          { email, scan_id: scan.id, source: "scan_start" },
          { onConflict: "email" }
        );
    }

    // ── Enqueue BullMQ job ──
    await scanQueue.add(
      "scan",
      {
        scanId: scan.id,
        url: validation.normalizedUrl!,
        maxPages: max_pages,
        demandLetterMode: demand_letter_mode,
        email,
      },
      {
        jobId: scan.id,
        removeOnComplete: 100,
        removeOnFail: 100,
      }
    );

    logger.info({ scanId: scan.id, url: validation.normalizedUrl }, "Scan queued");

    return NextResponse.json({
      scan_id: scan.id,
      status: "queued",
      estimated_seconds: 45,
      poll_url: `/api/scan/${scan.id}/status`,
    });
  } catch (err) {
    logger.error({ error: err instanceof Error ? err.message : "Unknown" }, "Scan start error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
