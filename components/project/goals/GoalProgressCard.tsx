import Link from "next/link";
import { outlineAction, primaryAction, Tag } from "@/components/ui/primitives";
import type { WeeklyProgressMetrics } from "@/lib/dashboard-metrics";

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
        <span className="font-mono text-[#1A1A17] tabular-nums">
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
      <section className="h-full rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-7">
        <h2 className="font-serif text-[23px] leading-tight tracking-[-0.02em] text-[#1A1A17]">
          Set your study goals
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#56524B]">
          Tell Ivvy what you&apos;re aiming for this week. It&apos;ll shape your
          daily plan and track your training.
        </p>
        <div className="mt-5">
          <Link href={`${base}/goals`} className={primaryAction}>
            Set goals
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-[23px] leading-tight tracking-[-0.02em] text-[#1A1A17]">
            This week
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#56524B]">
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
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A766D]">
            Focus topics
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {focusTopicNames.map((name) => (
              <Tag key={name} tone="neutral">
                {name}
              </Tag>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`${base}/log`} className={primaryAction}>
          Log session
        </Link>
        <Link href={`${base}/goals`} className={outlineAction}>
          Edit goals
        </Link>
      </div>
    </section>
  );
}
