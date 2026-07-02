/**
 * ProductPreview — a miniature, non-interactive render of the Project Overview
 * screen built from the product's real visual language (same tokens, same
 * structure). Not a screenshot and not a fake dashboard: it is the actual UI
 * composition at reduced scale, with sample course data.
 */

const SAMPLE_COVERAGE = [
  { topic: "Elasticities", mastery: 2, mistakes: "4 mistakes, 3 due", signal: "Weak" },
  { topic: "IS-LM model", mastery: 3, mistakes: "2 mistakes, 1 due", signal: "" },
  { topic: "Fiscal policy", mastery: 4, mistakes: "1 mistake, scheduled", signal: "" },
];

function MasteryTicks({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-[3px] w-2.5 rounded-full ${
            i < level ? "bg-[#1E4634]" : "bg-[#E7E3DA]"
          }`}
        />
      ))}
    </span>
  );
}

export default function ProductPreview() {
  return (
    <div
      role="img"
      aria-label="Preview of an Ivvy exam project overview: the next recommended session, readiness, and the review queue"
      className="pointer-events-none select-none overflow-hidden rounded-xl border border-[#E7E3DA] bg-white text-left shadow-[0_24px_80px_rgba(26,26,23,0.08)]"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-[#E7E3DA] bg-[#F7F6F3] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E0DCD2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#E0DCD2]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#E0DCD2]" />
      </div>

      <div className="flex bg-[#FAF8F4]">
        {/* Rail */}
        <div className="hidden w-40 shrink-0 border-r border-[#E7E3DA] bg-[#F4F1EA]/70 px-4 py-5 sm:block">
          <p className="text-[13px] font-medium text-[#1A1A17]">
            Macroeconomics
          </p>
          <div className="mt-4 space-y-1 text-[12px]">
            <p className="rounded-md bg-[#1E4634] px-2.5 py-1.5 font-medium text-white">
              Overview
            </p>
            <p className="flex items-center justify-between px-2.5 py-1.5 text-[#56524B]">
              Coach <span className="tabular-nums">14</span>
            </p>
            <p className="px-2.5 py-1.5 text-[#56524B]">Materials</p>
          </div>
          <div className="mt-10 border-t border-[#E7E3DA] pt-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9B968D]">
              Exam
            </p>
            <p className="mt-0.5 text-[12px] text-[#1A1A17]">
              Oct 14 <span className="text-[#56524B]">· 12 days left</span>
            </p>
          </div>
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1 px-5 py-5 sm:px-6">
          <p className="text-[15px] font-medium text-[#1A1A17]">
            Macroeconomics
          </p>
          <p className="mt-0.5 text-[12px] text-[#56524B]">
            Exam Oct 14 · target 8.0
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {/* Next block */}
            <div className="rounded-lg border border-[#D8D3C8] bg-white p-4 lg:col-span-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7A766D]">
                Next
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-[#1A1A17]">
                Start with your 14 due reviews. Three are answers you felt
                certain about and missed.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex h-7 items-center rounded-md bg-[#1E4634] px-3 text-[11px] font-medium text-white">
                  Start Coach
                </span>
                <span className="text-[11px] text-[#7A766D]">about 25 min</span>
              </div>
              <div className="mt-4 border-t border-[#EFEBE2] pt-3">
                <p className="text-[11px] text-[#56524B]">
                  Readiness: actively training
                </p>
                <div className="mt-1.5 flex gap-1" aria-hidden="true">
                  <span className="h-1 flex-1 rounded-full bg-[#1E4634]" />
                  <span className="h-1 flex-1 rounded-full bg-[#1E4634]" />
                  <span className="h-1 flex-1 rounded-full bg-[#1E4634]/45" />
                  <span className="h-1 flex-1 rounded-full bg-[#E7E3DA]" />
                </div>
              </div>
            </div>

            {/* Right rail */}
            <div className="space-y-3 lg:col-span-2">
              <div className="rounded-lg border border-[#E7E3DA] bg-white p-3.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7A766D]">
                  Review queue
                </p>
                <p className="mt-1 text-[12px] text-[#1A1A17]">
                  <span className="font-medium tabular-nums">14 due</span>
                  <span className="text-[#56524B]"> · next batch Fri</span>
                </p>
              </div>
              <div className="rounded-lg border border-[#E7E3DA] bg-white p-3.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7A766D]">
                  Calibration
                </p>
                <p className="mt-1 text-[12px] leading-snug text-[#56524B]">
                  You felt certain on{" "}
                  <span className="font-medium text-[#9C4126]">
                    6 answers you missed
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Coverage table */}
          <div className="mt-3 hidden rounded-lg border border-[#E7E3DA] bg-white sm:block">
            {SAMPLE_COVERAGE.map((row, i) => (
              <div
                key={row.topic}
                className={`flex items-center gap-4 px-4 py-2 ${
                  i > 0 ? "border-t border-[#EFEBE2]" : ""
                }`}
              >
                <span className="w-28 truncate text-[12px] text-[#1A1A17]">
                  {row.topic}
                </span>
                <MasteryTicks level={row.mastery} />
                <span className="hidden flex-1 text-[11px] text-[#56524B] md:block">
                  {row.mistakes}
                </span>
                {row.signal ? (
                  <span className="text-[11px] font-medium text-[#1A1A17]">
                    {row.signal}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
