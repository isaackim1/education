"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SessionType } from "@/lib/types";

const SESSION_LABELS: Record<SessionType, string> = {
  learn: "Learn",
  quiz: "Quiz",
  review: "Review",
  "exam-sim": "Exam Sim",
};

interface SessionTopBarProps {
  day: number;
  sessionType: SessionType;
  topicNames: string[];
  startedAt: string;
  backHref: string;
}

function formatElapsed(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const minutes = Math.floor((now - start) / 60000);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

export default function SessionTopBar({
  day,
  sessionType,
  topicNames,
  startedAt,
  backHref,
}: SessionTopBarProps) {
  const [elapsed, setElapsed] = useState(formatElapsed(startedAt));

  useEffect(() => {
    setElapsed(formatElapsed(startedAt));
    const interval = setInterval(() => {
      setElapsed(formatElapsed(startedAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <header className="border-b border-neutral-200 px-4 py-3 shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">StudyCoach</p>
          <p className="text-xs text-neutral-600 mt-0.5">
            Day {day} · {SESSION_LABELS[sessionType]}
          </p>
          {topicNames.length > 0 && (
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              {topicNames.join(", ")}
            </p>
          )}
          <p className="text-xs text-neutral-400 mt-1">{elapsed} elapsed</p>
        </div>
        <Link
          href={backHref}
          className="shrink-0 text-xs text-neutral-600 underline hover:text-black"
        >
          Back to Plan
        </Link>
      </div>
    </header>
  );
}
