import { getRiskLevel, getRiskLabel } from "@/types";

const riskColors: Record<string, string> = {
  low: "text-risk-low",
  moderate: "text-risk-moderate",
  high: "text-risk-high",
  critical: "text-risk-critical",
};

interface RiskScoreBadgeProps {
  score: number;
  size?: "lg" | "sm";
}

export function RiskScoreBadge({ score, size = "lg" }: RiskScoreBadgeProps) {
  const level = getRiskLevel(score);
  const label = getRiskLabel(level);

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${riskColors[level]} bg-opacity-10`}
        aria-label={`Risk score: ${score} out of 100. ${label}.`}
      >
        <span className={`h-2 w-2 rounded-full bg-current`} />
        {score} — {label}
      </span>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-2"
      aria-label={`Risk score: ${score} out of 100. ${label}.`}
    >
      <span className={`text-risk-score ${riskColors[level]}`}>{score}</span>
      <span className="text-lg font-medium text-slate-600">{label}</span>
    </div>
  );
}
