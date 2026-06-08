"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import MasteryStrip from "@/components/plan/MasteryStrip";
import PlanGrid from "@/components/plan/PlanGrid";
import { useExam } from "@/hooks/useExam";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { useTopics } from "@/hooks/useTopics";
import { clearAllStudyCoachData } from "@/lib/storage";
import { daysUntilExam, formatDate } from "@/lib/utils";

export default function PlanPage() {
  const router = useRouter();
  const { exam, isLoaded: examLoaded } = useExam();
  const { studyPlan, isLoaded: planLoaded } = useStudyPlan();
  const { topics, isLoaded: topicsLoaded } = useTopics();

  const isLoaded = examLoaded && planLoaded && topicsLoaded;

  function handleReset() {
    clearAllStudyCoachData();
    router.push("/setup");
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading StudyCoach...</p>
      </main>
    );
  }

  if (!exam || !studyPlan || topics.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-4">
            No study plan found. Set up your exam first.
          </p>
          <Link
            href="/setup"
            className="inline-block bg-black text-white text-sm px-4 py-2 rounded hover:bg-neutral-800"
          >
            Go to setup
          </Link>
        </div>
      </main>
    );
  }

  const daysLeft = daysUntilExam(exam.examDate);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">StudyCoach</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {exam.subject}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Exam: {formatDate(exam.examDate)} · {daysLeft} day
              {daysLeft === 1 ? "" : "s"} remaining
            </p>
          </div>
          <div className="flex items-center gap-4 self-start">
            <Link
              href="/materials"
              className="text-xs text-neutral-500 underline hover:text-black"
            >
              Materials
            </Link>
            <Link
              href="/mistakes"
              className="text-xs text-neutral-500 underline hover:text-black"
            >
              Mistake Bank
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-neutral-500 underline hover:text-black"
            >
              Reset setup
            </button>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-4">14-day study plan</h2>
          <PlanGrid plan={studyPlan} topics={topics} />
        </section>

        <MasteryStrip topics={topics} />
      </div>
    </main>
  );
}
