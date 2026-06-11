export default function ReviewProgressRing({
  total,
  reviewed,
}: {
  total: number;
  reviewed: number;
}) {
  const percentage =
    total === 0 ? 0 : Math.round((Math.min(total, reviewed) / total) * 100);
  const unreviewed = Math.max(0, total - reviewed);

  return (
    <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#137333 ${percentage}%, #E8EAED 0)`,
          }}
          role="progressbar"
          aria-label="Mistake review progress"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
            <span className="text-xl font-semibold text-[#1F1F1F]">
              {percentage}%
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[#1F1F1F]">
            Mistake review progress
          </h2>
          {total === 0 ? (
            <p className="mt-2 text-sm text-[#5F6368]">
              No saved mistakes yet. Train in chat and Ivvy will build a review
              queue from the errors worth revisiting.
            </p>
          ) : unreviewed === 0 ? (
            <p className="mt-2 text-sm text-[#5F6368]">
              All {total} saved mistake{total === 1 ? " is" : "s are"} reviewed.
              Keep training to surface the next weak area.
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#5F6368]">
              {reviewed} of {total} saved mistakes reviewed. {unreviewed} still
              need active recall.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
