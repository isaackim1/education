import type { ActivityCell } from "@/lib/dashboard-metrics";

const LEVEL_CLASSES: Record<ActivityCell["level"], string> = {
  0: "bg-[#EFEBE2]",
  1: "bg-[#E6F4EA]",
  2: "bg-[#137333]/50",
  3: "bg-[#137333]",
};

function formatActivityDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ActivityGrid({ cells }: { cells: ActivityCell[] }) {
  const totalActivity = cells.reduce((sum, cell) => sum + cell.count, 0);
  const activeDays = cells.filter((cell) => cell.count > 0).length;

  return (
    <section className="h-full rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-[23px] leading-tight tracking-[-0.02em] text-[#1A1A17]">
            Training activity
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#56524B]">
            Messages, mistakes, and reviews · last 12 weeks
          </p>
        </div>
        <div className="text-right leading-none">
          <span className="font-serif text-[28px] tracking-[-0.01em] text-[#1A1A17] tabular-nums">
            {totalActivity}
          </span>
          <span className="ml-1 text-xs font-medium text-[#56524B]">
            action{totalActivity === 1 ? "" : "s"}
          </span>
          <p className="mt-1 text-xs text-[#7A766D]">
            {activeDays} active day{activeDays === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div
        className="mt-4 grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto"
        aria-label="Training activity for the last 84 days"
      >
        {cells.map((cell) => {
          const label = `${formatActivityDate(cell.date)}: ${cell.count} training action${
            cell.count === 1 ? "" : "s"
          }`;
          return (
            <span
              key={cell.date}
              className={`h-3 w-3 rounded-[2px] ${LEVEL_CLASSES[cell.level]}`}
              title={label}
              aria-label={label}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        {totalActivity === 0 ? (
          <p className="text-xs text-[#7A766D]">Train to start filling this in.</p>
        ) : (
          <span className="text-xs text-[#7A766D]">12 weeks</span>
        )}
        <div className="flex items-center gap-1.5 text-xs text-[#7A766D]">
          <span>Less</span>
          {[0, 1, 2, 3].map((level) => (
            <span
              key={level}
              className={`h-3 w-3 rounded-[2px] ${
                LEVEL_CLASSES[level as ActivityCell["level"]]
              }`}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </section>
  );
}
