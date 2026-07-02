import { Eyebrow, Tag } from "@/components/ui/primitives";
import type { ReadinessMetrics } from "@/lib/dashboard-metrics";

const COMPONENT_LABELS: {
  key: keyof ReadinessMetrics["components"];
  label: string;
}[] = [
  { key: "setup", label: "Setup" },
  { key: "materials", label: "Materials" },
  { key: "practice", label: "Practice" },
  { key: "review", label: "Review" },
];

export default function ReadinessBand({
  readiness,
}: {
  readiness: ReadinessMetrics;
}) {
  const bandTone =
    readiness.displayScore >= 67
      ? "green"
      : readiness.displayScore >= 34
        ? "yellow"
        : "neutral";

  return (
    <section className="h-full rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Preparation readiness</Eyebrow>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="font-sans text-[46px] leading-none tracking-[-0.02em] text-[#1A1A17] tabular-nums">
              {readiness.displayScore}%
            </p>
            <Tag tone={bandTone}>{readiness.band}</Tag>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#56524B]">
            A preparation estimate based on setup, materials, practice, and
            whether saved mistakes are currently due. It is not a predicted grade.
          </p>
        </div>
      </div>

      <div
        className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#E7E3DA]"
        role="progressbar"
        aria-label="Preparation readiness"
        aria-valuenow={readiness.displayScore}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#1E4634]"
          style={{ width: `${readiness.displayScore}%` }}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COMPONENT_LABELS.map(({ key, label }) => (
          <div
            key={key}
            className="rounded-xl border border-[#E7E3DA] bg-[#FAF8F4] px-3 py-3"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7A766D]">
              {label}
            </p>
            <p className="mt-1.5 font-mono text-sm text-[#1A1A17] tabular-nums">
              {Math.round(readiness.components[key] * 100)}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
