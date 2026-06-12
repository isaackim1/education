import Link from "next/link";
import type { WeeklyProgressMetrics } from "@/lib/dashboard-metrics";

const PRIMARY_LINK =
  "inline-flex items-center justify-center h-10 px-5 rounded-full bg-[#1A1A17] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const OUTLINE_LINK =
  "inline-flex items-center justify-center h-10 px-5 rounded-full border border-[#D8D3C8] text-sm font-medium text-[#1A1A17] transition-colors hover:bg-[#EFEBE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

function ProgressRow({
  label,
  done,
  goal,
  percent,
  met,
}: {
  label: string;
  done: number;
  goal: number;
  percent: number;
  met: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#56524B]">{label}</span>
        <span className="font-medium text-[#1A1A17]">
          {done} of {goal}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E7E3DA]"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${met ? "bg-[#137333]" : "bg-[#1A1A17]"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function GoalProgressCard({
  projectId,
  weeklyProgress,
  focusTopicNames,
}: {
  projectId: string;
  weeklyProgress: WeeklyProgressMetrics | null;
  focusTopicNames: string[];
}) {
  const base = `/projects/${projectId}`;

  if (!weeklyProgress) {
    return (
      <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-[#1A1A17]">
          Set your study goals
        </h2>
        <p className="mt-1 max-w-xl text-sm text-[#56524B]">
          Tell Ivvy what you&apos;re aiming for this week. It&apos;ll shape your
          daily plan and track your training.
        </p>
        <div className="mt-4">
          <Link href={`${base}/goals`} className={PRIMARY_LINK}>
            Set goals
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A17]">This week</h2>
          <p className="mt-1 text-sm text-[#56524B]">
            Your goal progress for this week.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ProgressRow
          label="Sessions"
          done={weeklyProgress.sessionsDone}
          goal={weeklyProgress.sessionGoal}
          percent={weeklyProgress.sessionPercent}
          met={weeklyProgress.sessionsMet}
        />
        <ProgressRow
          label="Reviews"
          done={weeklyProgress.reviewsDone}
          goal={weeklyProgress.reviewGoal}
          percent={weeklyProgress.reviewPercent}
          met={weeklyProgress.reviewsMet}
        />
      </div>

      {focusTopicNames.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-[#56524B]">Focus topics</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {focusTopicNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center h-7 px-3 rounded-full bg-[#EFEBE2] text-xs font-medium text-[#1A1A17]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`${base}/log`} className={PRIMARY_LINK}>
          Log session
        </Link>
        <Link href={`${base}/goals`} className={OUTLINE_LINK}>
          Edit goals
        </Link>
      </div>
    </section>
  );
}
