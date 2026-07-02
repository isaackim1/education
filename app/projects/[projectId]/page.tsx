"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProjectShell from "@/components/project/ProjectShell";
import { Reveal } from "@/components/ui/motion";
import {
  CenteredNotice,
  ghostLink,
  PageShell,
  primaryAction,
} from "@/components/ui/primitives";
import { useProject } from "@/hooks/useProject";
import { useProjectGoals } from "@/hooks/useProjectGoals";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { useTrainingLog } from "@/hooks/useTrainingLog";
import {
  computeCalibration,
  getOverconfidentMistakeIds,
  MIN_CALIBRATION_ATTEMPTS,
} from "@/lib/calibration";
import {
  computeActivity,
  computeReadiness,
  computeTodaysPlan,
  computeTopicCoverage,
  computeWeeklyProgress,
  daysUntil,
} from "@/lib/dashboard-metrics";
import {
  getProjectChat,
  getProjectMistakes,
  getRetrievalAttempts,
} from "@/lib/project-storage";
import { isScheduleDue } from "@/lib/scheduling";
import type { Chat, Mistake, RetrievalAttempt, Topic } from "@/lib/types";

/**
 * Project Overview — the decision page. One elevated Next block with a
 * reasoned recommendation and the page's only primary button; everything else
 * is evidence for it: readiness, the review queue, calibration, high-risk
 * mistakes, topic coverage, and the week's activity.
 */

const LABEL =
  "text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]";

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDateLong(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** Earliest future batch across scheduled (not yet due) mistakes. */
function nextScheduledBatch(
  mistakes: Mistake[]
): { date: string; count: number } | null {
  const scheduled = mistakes.filter(
    (m) => m.schedule && !isScheduleDue(m.schedule)
  );
  if (scheduled.length === 0) return null;
  const dates = scheduled
    .map((m) => m.schedule?.due)
    .filter((due): due is string => Boolean(due))
    .sort();
  const date = dates[0];
  if (!date) return null;
  return { date, count: dates.filter((d) => d === date).length };
}

function MasteryTicks({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-[3px] w-3 rounded-full ${
            i < level ? "bg-[#1E4634]" : "bg-[#E7E3DA]"
          }`}
        />
      ))}
    </span>
  );
}

function ComponentBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="text-xs text-[#56524B]">{label}</span>
      <div className="mt-1 h-1 rounded-full bg-[#EFEBE2]">
        <div
          className="h-1 rounded-full bg-[#1E4634] transition-[width] duration-500"
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

function RailPanel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#E7E3DA] bg-white p-5">
      <p className={LABEL}>{label}</p>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function topicName(topics: Topic[], topicId: string | null): string | null {
  if (!topicId) return null;
  return topics.find((t) => t.id === topicId)?.name ?? null;
}

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded: projectLoaded } = useProject(
    params.projectId
  );
  const { materials, isLoaded: materialsLoaded } = useProjectMaterials(
    params.projectId
  );
  const { goals, isLoaded: goalsLoaded } = useProjectGoals(params.projectId);
  const { sessions, isLoaded: logLoaded } = useTrainingLog(params.projectId);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [attempts, setAttempts] = useState<RetrievalAttempt[]>([]);
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false);

  const refreshDashboardData = useCallback(() => {
    setMistakes(getProjectMistakes(params.projectId));
    setChat(getProjectChat(params.projectId));
    setAttempts(getRetrievalAttempts(params.projectId));
  }, [params.projectId]);

  useEffect(() => {
    refreshDashboardData();
    setDashboardDataLoaded(true);
  }, [refreshDashboardData]);

  const readiness = useMemo(
    () => computeReadiness(topics, materials, mistakes),
    [topics, materials, mistakes]
  );
  const activity = useMemo(
    () => computeActivity(chat, mistakes, 14, sessions),
    [chat, mistakes, sessions]
  );
  const coverage = useMemo(
    () => computeTopicCoverage(topics, materials, mistakes),
    [topics, materials, mistakes]
  );
  const calibration = useMemo(() => computeCalibration(attempts), [attempts]);
  const weeklyProgress = useMemo(
    () => computeWeeklyProgress(goals, sessions, mistakes),
    [goals, sessions, mistakes]
  );
  const todaysPlan = useMemo(
    () =>
      project
        ? computeTodaysPlan(
            project,
            topics,
            materials,
            mistakes,
            goals,
            weeklyProgress
          )
        : null,
    [project, topics, materials, mistakes, goals, weeklyProgress]
  );
  const dangerousIds = useMemo(
    () => getOverconfidentMistakeIds(attempts),
    [attempts]
  );

  const isLoaded =
    projectLoaded &&
    materialsLoaded &&
    dashboardDataLoaded &&
    goalsLoaded &&
    logLoaded;

  if (!isLoaded) {
    return <CenteredNotice>Loading…</CenteredNotice>;
  }

  if (!project || !todaysPlan) {
    return (
      <PageShell width="max-w-lg">
        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
          Project not found
        </h1>
        <Link href="/projects" className={`mt-4 -ml-3 ${ghostLink}`}>
          Back to projects
        </Link>
      </PageShell>
    );
  }

  const base = `/projects/${params.projectId}`;
  const examDays = daysUntil(project.examDate);
  const meaningfulMaterials = materials.filter(
    (m) => m.content.trim().length > 0
  );
  const dueMistakes = mistakes.filter((m) => isScheduleDue(m.schedule));
  const highRiskDue = dueMistakes.filter((m) => dangerousIds.has(m.id));
  const highRisk = mistakes.filter((m) => dangerousIds.has(m.id)).slice(0, 3);
  const nextBatch = nextScheduledBatch(mistakes);
  const topicsWithMaterial = coverage.filter((row) => row.hasMaterials).length;
  const recentSessions = sessions.slice(0, 3);
  const hasMaterials = meaningfulMaterials.length > 0;

  // The Next block's reasoned sentence: plan primary + the calibration hook.
  const nextReason =
    dueMistakes.length > 0 && highRiskDue.length > 0
      ? `Start with your ${dueMistakes.length} due review${
          dueMistakes.length === 1 ? "" : "s"
        }. ${highRiskDue.length} ${
          highRiskDue.length === 1 ? "is an answer" : "are answers"
        } you felt certain about and missed.`
      : todaysPlan.primary.description;

  const reviewMinutes = Math.max(5, Math.round(dueMistakes.length * 1.5));

  return (
    <ProjectShell projectId={params.projectId} active="overview">
      {/* Exam strip */}
      <header className="border-b border-[#E7E3DA] pb-6">
        <h1 className="text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[#1A1A17] sm:text-[32px]">
          {project.name}
        </h1>
        <p className="mt-2 text-sm text-[#56524B]">
          {project.subject} · Exam {formatDate(project.examDate)}
          {examDays !== null ? (
            <>
              {" "}
              ·{" "}
              <span className="tabular-nums">
                {examDays === 0
                  ? "today"
                  : `${examDays} day${examDays === 1 ? "" : "s"} left`}
              </span>
            </>
          ) : null}
          {project.targetGrade ? <> · Target {project.targetGrade}</> : null}
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* NEXT — the page's single elevated block and only primary button */}
          <Reveal>
            <section className="rounded-xl border border-[#D8D3C8] bg-white p-6 sm:p-7">
              <p className={LABEL}>Next</p>
              {hasMaterials || topics.length > 0 ? (
                <>
                  <h2 className="mt-3 max-w-xl text-[19px] font-medium leading-snug tracking-[-0.01em] text-[#1A1A17]">
                    {todaysPlan.primary.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[#56524B]">
                    {nextReason}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <Link
                      href={todaysPlan.primary.href}
                      className={primaryAction}
                    >
                      {todaysPlan.primary.kind === "review" ||
                      todaysPlan.primary.kind === "training"
                        ? "Start Coach"
                        : todaysPlan.primary.kind === "materials"
                          ? "Open Materials"
                          : "Set up topics"}
                    </Link>
                    {todaysPlan.primary.kind === "review" &&
                    dueMistakes.length > 0 ? (
                      <span className="text-sm text-[#7A766D]">
                        about {reviewMinutes} min
                      </span>
                    ) : null}
                  </div>
                  {todaysPlan.secondary.length > 0 ? (
                    <p className="mt-4 text-sm text-[#7A766D]">
                      Then:{" "}
                      {todaysPlan.secondary
                        .map((action) => action.title)
                        .join(" · ")}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <h2 className="mt-3 text-[19px] font-medium leading-snug tracking-[-0.01em] text-[#1A1A17]">
                    Ivvy hasn&apos;t seen your materials yet.
                  </h2>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[#56524B]">
                    Upload your notes, slides, or a past paper and Ivvy will map
                    your topics and build your first session.
                  </p>
                  <div className="mt-5">
                    <Link href={`${base}/materials`} className={primaryAction}>
                      Upload materials
                    </Link>
                  </div>
                </>
              )}
            </section>
          </Reveal>

          {/* Readiness — narrated, with the formula's ingredients visible */}
          <Reveal delay={80}>
            <section className="rounded-xl border border-[#E7E3DA] bg-white p-6 sm:p-7">
              <p className={LABEL}>Readiness</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[#1A1A17]">
                <span className="font-medium">{readiness.band}</span>
                <span className="text-[#56524B]">
                  {" "}
                  ·{" "}
                  <span className="tabular-nums">
                    {readiness.displayScore}
                  </span>{" "}
                  of 100. Readiness tracks your training process, not a grade
                  prediction.
                </span>
              </p>
              <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                <ComponentBar
                  label="Setup"
                  value={readiness.components.setup}
                />
                <ComponentBar
                  label="Materials"
                  value={readiness.components.materials}
                />
                <ComponentBar
                  label="Practice"
                  value={readiness.components.practice}
                />
                <ComponentBar
                  label="Review"
                  value={readiness.components.review}
                />
              </div>
              {goals && weeklyProgress && weeklyProgress.sessionGoal > 0 ? (
                <p className="mt-5 border-t border-[#EFEBE2] pt-4 text-sm text-[#56524B]">
                  This week: {weeklyProgress.sessionsDone} of{" "}
                  {weeklyProgress.sessionGoal} sessions
                  {weeklyProgress.reviewGoal > 0
                    ? `, ${weeklyProgress.reviewsDone} of ${weeklyProgress.reviewGoal} reviews`
                    : ""}
                  .
                </p>
              ) : null}
            </section>
          </Reveal>
        </div>

        {/* Right rail — evidence */}
        <div className="space-y-4">
          <Reveal delay={120}>
            <RailPanel label="Review queue">
              {mistakes.length === 0 ? (
                <>
                  <p className="text-sm leading-relaxed text-[#56524B]">
                    No mistakes saved yet. Your first practice session will
                    change that; mistakes are how Ivvy learns where you&apos;re
                    weak.
                  </p>
                  <Link
                    href={`${base}/coach?mode=practice`}
                    className="mt-3 inline-block text-sm font-medium text-[#1E4634] underline-offset-2 hover:underline"
                  >
                    Start practice
                  </Link>
                </>
              ) : dueMistakes.length > 0 ? (
                <>
                  <p className="text-[15px] text-[#1A1A17]">
                    <span className="font-medium tabular-nums">
                      {dueMistakes.length} due
                    </span>
                    {highRiskDue.length > 0 ? (
                      <span className="text-[#9C4126]">
                        {" "}
                        · {highRiskDue.length} high-risk
                      </span>
                    ) : null}
                  </p>
                  {nextBatch ? (
                    <p className="mt-1 text-sm text-[#56524B]">
                      Next batch {formatDate(nextBatch.date)} ({nextBatch.count}{" "}
                      scheduled)
                    </p>
                  ) : null}
                  <Link
                    href={`${base}/coach?mode=review`}
                    className="mt-3 inline-block text-sm font-medium text-[#1E4634] underline-offset-2 hover:underline"
                  >
                    Review now
                  </Link>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-[#56524B]">
                  Nothing due.
                  {nextBatch ? (
                    <>
                      {" "}
                      Next reviews land{" "}
                      <span className="text-[#1A1A17]">
                        {formatDateLong(nextBatch.date)}
                      </span>{" "}
                      ({nextBatch.count} scheduled).
                    </>
                  ) : (
                    " Every saved mistake is scheduled."
                  )}
                </p>
              )}
            </RailPanel>
          </Reveal>

          <Reveal delay={160}>
            <RailPanel label="Calibration">
              {calibration.hasEnoughData ? (
                <>
                  <p className="text-sm leading-relaxed text-[#1A1A17]">
                    {calibration.feltSureButWrongCount > 0 ? (
                      <>
                        You felt certain on{" "}
                        <span className="font-medium text-[#9C4126]">
                          {calibration.feltSureButWrongCount} answer
                          {calibration.feltSureButWrongCount === 1 ? "" : "s"}{" "}
                          you missed
                        </span>
                        .
                      </>
                    ) : (
                      "Your confidence is tracking your results well."
                    )}
                    {topicName(topics, calibration.mostOverconfidentTopicId) ? (
                      <>
                        {" "}
                        Most overconfident:{" "}
                        {topicName(
                          topics,
                          calibration.mostOverconfidentTopicId
                        )}
                        .
                      </>
                    ) : null}
                  </p>
                  <p className="mt-2 text-xs text-[#7A766D]">
                    Calibration score{" "}
                    <span className="tabular-nums">
                      {calibration.calibrationScore}
                    </span>{" "}
                    of 100
                  </p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-[#56524B]">
                  Rate your confidence before each answer and Ivvy will learn
                  where you&apos;re overconfident.{" "}
                  <span className="text-[#1A1A17] tabular-nums">
                    {calibration.attemptCount} of {MIN_CALIBRATION_ATTEMPTS}
                  </span>{" "}
                  rated answers so far.
                </p>
              )}
            </RailPanel>
          </Reveal>

          {highRisk.length > 0 ? (
            <Reveal delay={200}>
              <RailPanel label="High-risk mistakes">
                <p className="text-xs text-[#9C4126]">
                  You felt certain, but missed these.
                </p>
                <ul className="mt-3 space-y-3">
                  {highRisk.map((mistake) => (
                    <li
                      key={mistake.id}
                      className="border-t border-[#EFEBE2] pt-3 first:border-t-0 first:pt-0"
                    >
                      <p className="line-clamp-2 text-sm leading-snug text-[#1A1A17]">
                        {mistake.question || mistake.rememberThis}
                      </p>
                      <p className="mt-1 text-xs text-[#7A766D]">
                        {mistake.topicName}
                      </p>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${base}/coach?mode=review`}
                  className="mt-3 inline-block text-sm font-medium text-[#1E4634] underline-offset-2 hover:underline"
                >
                  Review these first
                </Link>
              </RailPanel>
            </Reveal>
          ) : null}
        </div>
      </div>

      {/* Topic coverage — full-width table */}
      {coverage.length > 0 ? (
        <Reveal delay={240} className="mt-10">
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className={LABEL}>Topic coverage</p>
              <p className="text-sm text-[#56524B]">
                {topicsWithMaterial} of {coverage.length} topics have material
              </p>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-[#E7E3DA] bg-white">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-[#E7E3DA]">
                    {[
                      "Topic",
                      "Materials",
                      "Mastery",
                      "Mistakes",
                      "Signal",
                    ].map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#7A766D] first:pl-5 last:pr-5"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE2]">
                  {coverage.map((row) => {
                    const topic = topics.find((t) => t.id === row.topicId);
                    const isOverconfident =
                      calibration.mostOverconfidentTopicId === row.topicId;
                    return (
                      <tr
                        key={row.topicId}
                        className="transition-colors hover:bg-[#FBFAF7]"
                      >
                        <td className="px-4 py-3.5 first:pl-5">
                          <Link
                            href={`${base}/coach?mode=practice&topic=${encodeURIComponent(row.name)}`}
                            className="text-sm font-medium text-[#1A1A17] hover:text-[#1E4634]"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-[#56524B]">
                          {row.hasMaterials ? "Added" : "None yet"}
                        </td>
                        <td className="px-4 py-3.5">
                          <MasteryTicks level={topic?.masteryScore ?? 0} />
                        </td>
                        <td className="px-4 py-3.5 text-sm tabular-nums text-[#56524B]">
                          {row.mistakeCount === 0
                            ? "None"
                            : `${row.mistakeCount}${
                                row.dueCount > 0
                                  ? ` · ${row.dueCount} due`
                                  : ""
                              }`}
                        </td>
                        <td className="px-4 py-3.5 pr-5 text-sm">
                          {isOverconfident ? (
                            <span className="font-medium text-[#9C4126]">
                              Overconfident
                            </span>
                          ) : row.isWeakArea ? (
                            <span className="font-medium text-[#1A1A17]">
                              Weak
                            </span>
                          ) : (
                            <span className="text-[#9B968D]">On track</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </Reveal>
      ) : null}

      {/* This week — activity strip + recent sessions */}
      <Reveal delay={280} className="mt-10">
        <section>
          <p className={LABEL}>This week</p>
          <div className="mt-3 flex items-center gap-1.5">
            {activity.map((cell) => (
              <span
                key={cell.date}
                title={`${cell.date}: ${cell.count} action${
                  cell.count === 1 ? "" : "s"
                }`}
                className={`h-6 flex-1 rounded-sm sm:h-7 ${
                  cell.level === 0
                    ? "bg-[#EFEBE2]"
                    : cell.level === 1
                      ? "bg-[#1E4634]/30"
                      : cell.level === 2
                        ? "bg-[#1E4634]/60"
                        : "bg-[#1E4634]"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-[#9B968D]">Last 14 days</p>
          {recentSessions.length > 0 ? (
            <ul className="mt-4 divide-y divide-[#EFEBE2] border-t border-[#E7E3DA]">
              {recentSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-baseline justify-between gap-4 py-3"
                >
                  <p className="text-sm text-[#1A1A17]">
                    {session.type === "reviewed-mistakes"
                      ? "Review session"
                      : session.type === "trained-chat"
                        ? "Training session"
                        : session.type === "studied-materials"
                          ? "Study session"
                          : "Session"}
                    {session.note ? (
                      <span className="text-[#56524B]"> · {session.note}</span>
                    ) : null}
                  </p>
                  <p className="shrink-0 text-xs tabular-nums text-[#7A766D]">
                    {session.durationMinutes > 0
                      ? `${session.durationMinutes} min`
                      : formatDate(session.loggedAt.slice(0, 10))}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </Reveal>
    </ProjectShell>
  );
}
