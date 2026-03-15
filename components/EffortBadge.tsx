import type { EffortTier } from "@/types";

const tierStyles: Record<EffortTier, { bg: string; label: string }> = {
  XS: { bg: "bg-green-100 text-green-800", label: "Extra Small" },
  S: { bg: "bg-emerald-100 text-emerald-800", label: "Small" },
  M: { bg: "bg-amber-100 text-amber-800", label: "Medium" },
  L: { bg: "bg-orange-100 text-orange-800", label: "Large" },
  XL: { bg: "bg-red-100 text-red-800", label: "Extra Large" },
  EXT: { bg: "bg-slate-100 text-slate-800", label: "External / Vendor" },
};

interface EffortBadgeProps {
  tier: EffortTier;
  hoursEst: string;
}

export function EffortBadge({ tier, hoursEst }: EffortBadgeProps) {
  const style = tierStyles[tier];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg}`}
      title={`${style.label}: ${hoursEst}`}
      aria-label={`Effort: ${style.label}, estimated ${hoursEst}`}
    >
      {tier}
      <span className="text-[10px] opacity-70">({hoursEst})</span>
    </span>
  );
}
