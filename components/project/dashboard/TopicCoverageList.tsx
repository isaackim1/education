import type { TopicCoverageRow } from "@/lib/dashboard-metrics";

const STATE_STYLES: Record<TopicCoverageRow["state"], string> = {
  "No materials": "bg-[#F1F3F4] text-[#5F6368]",
  "Has materials": "bg-[#E8EAED] text-[#1F1F1F]",
  Practiced: "bg-[#E8EAED] text-[#1F1F1F]",
  Reviewed: "bg-[#E6F4EA] text-[#137333]",
};

export default function TopicCoverageList({
  rows,
}: {
  rows: TopicCoverageRow[];
}) {
  return (
    <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-[#1F1F1F]">
          Topic coverage
        </h2>
        <p className="mt-1 text-sm text-[#5F6368]">
          Coverage combines materials, practice, and mistake review. Active weak
          areas appear first.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-xl bg-[#F8FAFD] px-4 py-4 text-sm text-[#5F6368]">
          No topics yet. Add topics to build your training map.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((row) => (
            <li
              key={row.topicId}
              className="rounded-xl border border-[#E1E3E1] bg-[#F8FAFD] px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-[#1F1F1F]">
                      {row.name}
                    </h3>
                    {row.isWeakArea ? (
                      <span className="rounded-full bg-[#F1F3F4] px-2.5 py-0.5 text-xs font-medium text-[#5F6368]">
                        {row.unreviewedCount} to review
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[#5F6368]">
                    {row.mistakeCount === 0
                      ? row.hasMaterials
                        ? "Ready for first practice"
                        : "Add material to ground training"
                      : `${row.reviewedCount} reviewed · ${row.unreviewedCount} unreviewed`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLES[row.state]}`}
                >
                  {row.state}
                </span>
              </div>

              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E8EAED]"
                role="progressbar"
                aria-label={`${row.name} coverage`}
                aria-valuenow={row.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full ${
                    row.progressPercent === 100
                      ? "bg-[#137333]"
                      : "bg-[#5F6368]"
                  }`}
                  style={{ width: `${row.progressPercent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
