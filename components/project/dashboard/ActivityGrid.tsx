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

  return (
    <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A17]">
            Training activity
          </h2>
          <p className="mt-1 text-sm text-[#56524B]">
            Student messages, saved mistakes, and completed reviews over the
            last 12 weeks.
          </p>
        </div>
        <span className="rounded-full bg-[#EFEBE2] px-3 py-1 text-xs font-medium text-[#56524B]">
          {totalActivity} action{totalActivity === 1 ? "" : "s"}
        </span>
      </div>

      <div
        className="mt-5 grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-1"
        aria-label="Training activity for the last 84 days"
      >
        {cells.map((cell) => {
          const label = `${formatActivityDate(cell.date)}: ${cell.count} training action${
            cell.count === 1 ? "" : "s"
          }`;
          return (
            <span
              key={cell.date}
              className={`h-3.5 w-3.5 rounded-[3px] ${LEVEL_CLASSES[cell.level]}`}
              title={label}
              aria-label={label}
            />
          );
        })}
      </div>

      {totalActivity === 0 ? (
        <p className="mt-4 text-sm text-[#56524B]">
          Train to start filling this in.
        </p>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-xs text-[#7A766D]">
          <span>Less</span>
          {[0, 1, 2, 3].map((level) => (
            <span
              key={level}
              className={`h-3 w-3 rounded-[3px] ${
                LEVEL_CLASSES[level as ActivityCell["level"]]
              }`}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      )}
    </section>
  );
}
