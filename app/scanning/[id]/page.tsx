"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScanProgressBar } from "@/components/ScanProgressBar";
import type { ScanStatusResponse } from "@/types";

export default function ScanningPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [status, setStatus] = useState<ScanStatusResponse>({
    scan_id: scanId,
    status: "queued",
    pages_scanned: 0,
    pages_total: 0,
    progress_pct: 0,
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/${scanId}/status`);
        if (!res.ok) return;
        const data: ScanStatusResponse = await res.json();
        setStatus(data);

        if (data.status === "completed") {
          clearInterval(interval);
          router.push(`/results/${scanId}`);
        }
        if (data.status === "failed") {
          clearInterval(interval);
        }
      } catch {
        // Retry on next interval
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [scanId, router]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-navy">Scanning your website</h1>
      <p className="mt-2 text-slate-500">
        This usually takes about 60 seconds.
      </p>

      <div className="mt-12">
        <ScanProgressBar
          pagesScanned={status.pages_scanned}
          pagesTotal={status.pages_total}
          status={status.status}
        />
      </div>

      {status.status === "failed" && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>
            <strong>Scan failed.</strong> The website may be unreachable or
            blocking automated access. Please check the URL and try again.
          </p>
        </div>
      )}
    </div>
  );
}
