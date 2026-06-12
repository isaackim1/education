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
  return (
    <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#56524B]">
            Preparation readiness
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="text-4xl font-semibold tracking-tight text-[#1A1A17]">
              {readiness.displayScore}%
            </p>
            <span className="inline-flex items-center rounded-full bg-[#EFEBE2] px-3 py-1 text-xs font-medium text-[#56524B]">
              {readiness.band}
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm text-[#56524B]">
            A preparation estimate based on setup, materials, practice, and
            reviewed mistakes. It is not a predicted grade.
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
          className="h-full rounded-full bg-[#137333]"
          style={{ width: `${readiness.displayScore}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COMPONENT_LABELS.map(({ key, label }) => (
          <div key={key} className="rounded-xl bg-[#FAF8F4] px-3 py-3">
            <p className="text-xs text-[#56524B]">{label}</p>
            <p className="mt-1 text-sm font-semibold text-[#1A1A17]">
              {Math.round(readiness.components[key] * 100)}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
