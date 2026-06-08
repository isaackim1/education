import Link from "next/link";
import type { DailyPlan, Topic } from "@/lib/types";
import { formatDate, getTodayIsoDate } from "@/lib/utils";

interface DayCardProps {
  day: DailyPlan;
  topics: Topic[];
}

const SESSION_LABELS: Record<DailyPlan["sessionType"], string> = {
  learn: "Learn",
  quiz: "Quiz",
  review: "Review",
  "exam-sim": "Exam Sim",
};

export default function DayCard({ day, topics }: DayCardProps) {
  const isToday = day.date === getTodayIsoDate();
  const topicNames = day.topicIds
    .map((id) => topics.find((t) => t.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div
      className={`border rounded-lg p-4 ${
        isToday ? "border-black" : "border-neutral-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold">Day {day.day}</p>
          <p className="text-xs text-neutral-500">{formatDate(day.date)}</p>
        </div>
        <span className="text-xs font-medium border border-neutral-300 rounded px-2 py-0.5">
          {SESSION_LABELS[day.sessionType]}
        </span>
      </div>

      <p className="text-sm text-neutral-700 mb-2">{day.goalDescription}</p>

      {topicNames.length > 0 && (
        <p className="text-xs text-neutral-500 mb-3">
          Topics: {topicNames.join(", ")}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{day.estimatedMinutes} min</span>
        <span>{day.completed ? "Completed" : "Not completed"}</span>
      </div>

      <div className="mt-3">
        {isToday ? (
          <Link
            href={`/session?day=${day.day}`}
            className="inline-block w-full text-center bg-black text-white text-sm py-2 rounded hover:bg-neutral-800"
          >
            Start Today&apos;s Session
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full text-center border border-neutral-200 text-neutral-400 text-sm py-2 rounded cursor-not-allowed"
          >
            {day.date < getTodayIsoDate() ? "Past day" : "Upcoming"}
          </button>
        )}
      </div>
    </div>
  );
}
