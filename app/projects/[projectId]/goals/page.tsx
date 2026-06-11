"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { DEFAULT_GOAL_VALUES, useProjectGoals } from "@/hooks/useProjectGoals";

const FIELD =
  "h-12 w-full rounded-lg border border-[#C4C7C5] bg-white px-4 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const SECONDARY_ACTION =
  "inline-flex items-center justify-center h-10 px-6 rounded-full border border-[#C4C7C5] text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const CONFIDENCE_LEVELS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-sm font-medium text-[#1F1F1F]">{children}</span>
  );
}

export default function GoalsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const {
    project,
    topics,
    isLoaded: projectLoaded,
    updateProject,
  } = useProject(params.projectId);
  const { goals, isLoaded: goalsLoaded, saveGoals } = useProjectGoals(
    params.projectId
  );

  const [examDate, setExamDate] = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [weeklySessionGoal, setWeeklySessionGoal] = useState(
    DEFAULT_GOAL_VALUES.weeklySessionGoal
  );
  const [weeklyReviewGoal, setWeeklyReviewGoal] = useState(
    DEFAULT_GOAL_VALUES.weeklyReviewGoal
  );
  const [focusTopicIds, setFocusTopicIds] = useState<string[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState<
    1 | 2 | 3 | 4 | 5
  >(DEFAULT_GOAL_VALUES.currentConfidence);
  const [hydrated, setHydrated] = useState(false);

  const isLoaded = projectLoaded && goalsLoaded;

  // Seed the form once from the existing project + goals.
  useEffect(() => {
    if (!isLoaded || hydrated) return;
    if (project) {
      setExamDate(project.examDate);
      setTargetGrade(project.targetGrade);
    }
    if (goals) {
      setWeeklySessionGoal(goals.weeklySessionGoal);
      setWeeklyReviewGoal(goals.weeklyReviewGoal);
      setFocusTopicIds(goals.focusTopicIds);
      setCurrentConfidence(goals.currentConfidence);
    }
    setHydrated(true);
  }, [isLoaded, hydrated, project, goals]);

  const validTopicIds = useMemo(
    () => new Set(topics.map((topic) => topic.id)),
    [topics]
  );

  function toggleFocusTopic(topicId: string) {
    setFocusTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId]
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!project) return;

    // examDate / targetGrade stay on StudyProject — update via the project path.
    updateProject({
      examDate,
      targetGrade: targetGrade.trim() || "Pass",
    });

    saveGoals({
      weeklySessionGoal,
      weeklyReviewGoal,
      focusTopicIds: focusTopicIds.filter((id) => validTopicIds.has(id)),
      currentConfidence,
    });

    router.push(`/projects/${params.projectId}`);
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFD]">
        <p className="text-sm text-[#5F6368]">Loading...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#F8FAFD]">
        <div className="mx-auto max-w-lg px-4 py-12">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1F1F1F]">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="mt-4 inline-flex h-9 items-center rounded-full px-3 text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F]"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="goals" />

        <header className="mb-6">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1F1F1F]">
            Study goals
          </h1>
          <p className="mt-2 text-sm text-[#5F6368]">
            These keep your dashboard and today&apos;s plan focused. You can
            change them anytime.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1F1F1F]">Exam</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <Label>Exam date</Label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(event) => setExamDate(event.target.value)}
                  className={FIELD}
                />
              </label>
              <label className="space-y-1.5">
                <Label>Target grade</Label>
                <input
                  type="text"
                  value={targetGrade}
                  onChange={(event) => setTargetGrade(event.target.value)}
                  placeholder="e.g. A"
                  className={FIELD}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1F1F1F]">
              Weekly goals
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <Label>Sessions per week</Label>
                <span className="block text-xs text-[#80868B]">
                  How many training sessions are you aiming for?
                </span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={weeklySessionGoal}
                  onChange={(event) =>
                    setWeeklySessionGoal(Number(event.target.value))
                  }
                  className={FIELD}
                />
              </label>
              <label className="space-y-1.5">
                <Label>Reviews per week</Label>
                <span className="block text-xs text-[#80868B]">
                  Mistakes you want to review each week.
                </span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={weeklyReviewGoal}
                  onChange={(event) =>
                    setWeeklyReviewGoal(Number(event.target.value))
                  }
                  className={FIELD}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1F1F1F]">
              Focus topics
            </h2>
            <p className="mt-1 text-sm text-[#5F6368]">
              Pick the topics you want to prioritise this exam.
            </p>
            {topics.length === 0 ? (
              <p className="mt-4 rounded-xl bg-[#F8FAFD] border border-[#E8EAED] px-4 py-3 text-sm text-[#5F6368]">
                Add topics first to choose focus areas.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {topics.map((topic) => {
                  const selected = focusTopicIds.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleFocusTopic(topic.id)}
                      className={`inline-flex items-center h-9 px-4 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2 ${
                        selected
                          ? "bg-[#1F1F1F] text-white"
                          : "border border-[#C4C7C5] text-[#1F1F1F] hover:bg-[#F1F3F4]"
                      }`}
                    >
                      {topic.name}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1F1F1F]">
              Confidence right now
            </h2>
            <p className="mt-1 text-sm text-[#5F6368]">
              How prepared do you feel today? 1 = not at all, 5 = very.
            </p>
            <div className="mt-4 flex gap-2">
              {CONFIDENCE_LEVELS.map((level) => {
                const selected = currentConfidence === level;
                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCurrentConfidence(level)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2 ${
                      selected
                        ? "bg-[#1F1F1F] text-white"
                        : "border border-[#C4C7C5] text-[#1F1F1F] hover:bg-[#F1F3F4]"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className={PRIMARY_ACTION}>
              Save goals
            </button>
            <Link
              href={`/projects/${params.projectId}`}
              className={SECONDARY_ACTION}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
