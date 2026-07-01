export default function ReviewProgressRing({
  total,
  due,
}: {
  total: number;
  due: number;
}) {
  const scheduled = Math.max(0, total - due);
  const percentage =
    total === 0 ? 0 : Math.round((Math.min(total, scheduled) / total) * 100);

  return (
    <section className="h-full rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#137333 ${percentage}%, #E7E3DA 0)`,
          }}
          role="progressbar"
          aria-label="Mistake review progress"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
            <span className="font-serif text-[26px] leading-none tracking-[-0.02em] text-[#1A1A17] tabular-nums">
              {percentage}%
            </span>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-[23px] leading-tight tracking-[-0.02em] text-[#1A1A17]">
            Mistake review progress
          </h2>
          {total === 0 ? (
            <p className="mt-2 text-sm text-[#56524B]">
              No saved mistakes yet. Train in chat and Ivvy will build a review
              queue from the errors worth revisiting.
            </p>
          ) : due === 0 ? (
            <p className="mt-2 text-sm text-[#56524B]">
              All {total} saved mistake{total === 1 ? " is" : "s are"} scheduled
              for a future review. Keep training to surface the next weak area.
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#56524B]">
              {due} of {total} saved mistake{total === 1 ? "" : "s"} due now.
              Work through them with active recall.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
