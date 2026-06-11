"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ActivityGrid from "@/components/project/dashboard/ActivityGrid";
import ReadinessBand from "@/components/project/dashboard/ReadinessBand";
import ReviewProgressRing from "@/components/project/dashboard/ReviewProgressRing";
import TodaysPlan from "@/components/project/dashboard/TodaysPlan";
import TopicCoverageList from "@/components/project/dashboard/TopicCoverageList";
import GoalProgressCard from "@/components/project/goals/GoalProgressCard";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { useProjectGoals } from "@/hooks/useProjectGoals";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { useTrainingLog } from "@/hooks/useTrainingLog";
import {
  computeActivity,
  computeReadiness,
  computeTodaysPlan,
  computeTopicCoverage,
  computeWeeklyProgress,
  daysUntil,
} from "@/lib/dashboard-metrics";
import { getProjectChat, getProjectMistakes } from "@/lib/project-storage";
import type { Chat, Mistake } from "@/lib/types";

const SECONDARY_LINK =
  "inline-flex items-center h-9 px-4 rounded-full border border-[#C4C7C5] text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysPillLabel(days: number | null): string {
  if (days === null) return "Exam date unavailable";
  if (days === 0) return "Exam date reached";
  return `${days} day${days === 1 ? "" : "s"} until exam`;
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E1E3E1] bg-white p-4">
      <p className="text-xs font-medium text-[#5F6368]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#1F1F1F]">{value}</p>
      {detail ? <p className="mt-1 text-xs text-[#80868B]">{detail}</p> : null}
    </div>
  );
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
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false);

  const refreshDashboardData = useCallback(() => {
    setMistakes(getProjectMistakes(params.projectId));
    setChat(getProjectChat(params.projectId));
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
    () => computeActivity(chat, mistakes, 84, sessions),
    [chat, mistakes, sessions]
  );
  const topicCoverage = useMemo(
    () => computeTopicCoverage(topics, materials, mistakes),
    [topics, materials, mistakes]
  );
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

  const focusTopicNames = useMemo(() => {
    if (!goals) return [];
    const focusTopicIds = Array.isArray(goals.focusTopicIds)
      ? goals.focusTopicIds
      : [];
    return topics
      .filter((topic) => focusTopicIds.includes(topic.id))
      .map((topic) => topic.name);
  }, [goals, topics]);

  const isLoaded =
    projectLoaded &&
    materialsLoaded &&
    dashboardDataLoaded &&
    goalsLoaded &&
    logLoaded;

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
        <p className="text-sm text-[#5F6368]">Loading...</p>
      </main>
    );
  }

  if (!project || !todaysPlan) {
    return (
      <main className="min-h-screen bg-[#F8FAFD]">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  const examDays = daysUntil(project.examDate);
  const meaningfulMaterials = materials.filter(
    (material) => material.content.trim().length > 0
  );
  const reviewedMistakes = mistakes.filter((mistake) => mistake.reviewed).length;
  const unreviewedMistakes = mistakes.length - reviewedMistakes;
  const reviewPercentage =
    mistakes.length === 0
      ? 0
      : Math.round((reviewedMistakes / mistakes.length) * 100);
  const isExamUrgent = examDays !== null && examDays <= 7;

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="overview" />

        <div className="space-y-5">
          <header>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
                  {project.name}
                </h1>
                <p className="mt-2 text-sm text-[#5F6368]">
                  Where you are in exam preparation and what to do next.
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                  isExamUrgent
                    ? "bg-[#FEEFC3] text-[#B06000]"
                    : "bg-[#F1F3F4] text-[#5F6368]"
                }`}
              >
                {daysPillLabel(examDays)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#F1F3F4] text-xs font-medium text-[#5F6368]">
                {project.subject}
              </span>
              <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#F1F3F4] text-xs font-medium text-[#5F6368]">
                Exam {formatDate(project.examDate)}
              </span>
              <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#F1F3F4] text-xs font-medium text-[#5F6368]">
                Target {project.targetGrade}
              </span>
            </div>
          </header>

          <ReadinessBand readiness={readiness} />

          <TodaysPlan plan={todaysPlan} />

          <GoalProgressCard
            projectId={params.projectId}
            weeklyProgress={weeklyProgress}
            focusTopicNames={focusTopicNames}
          />

          <section
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            aria-label="Project statistics"
          >
            <StatCard
              label="Topics"
              value={topics.length}
              detail={
                topics.length === 0
                  ? "Add your exam areas"
                  : `${topicCoverage.filter((row) => row.hasMaterials).length} with materials`
              }
            />
            <StatCard
              label="Materials"
              value={meaningfulMaterials.length}
              detail={
                meaningfulMaterials.length === 0
                  ? "Add notes or past papers"
                  : "Saved across topics"
              }
            />
            <StatCard
              label="Mistakes"
              value={mistakes.length}
              detail={
                mistakes.length === 0
                  ? "Train to find weak areas"
                  : `${unreviewedMistakes} unreviewed`
              }
            />
            <StatCard
              label="Review"
              value={`${reviewPercentage}%`}
              detail={
                mistakes.length === 0
                  ? "No review queue yet"
                  : `${reviewedMistakes} of ${mistakes.length} reviewed`
              }
            />
          </section>

          <ActivityGrid cells={activity} />

          <TopicCoverageList rows={topicCoverage} />

          <ReviewProgressRing
            total={mistakes.length}
            reviewed={reviewedMistakes}
          />

          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1F1F1F]">
              Workspace
            </h2>
            <p className="mt-1 text-sm text-[#5F6368]">
              Move between setup, source material, training, and review.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/projects/${params.projectId}/setup`}
                className={SECONDARY_LINK}
              >
                Topics
              </Link>
              <Link
                href={`/projects/${params.projectId}/materials`}
                className={SECONDARY_LINK}
              >
                Materials
              </Link>
              <Link
                href={`/projects/${params.projectId}/train`}
                className={SECONDARY_LINK}
              >
                Train
              </Link>
              <Link
                href={`/projects/${params.projectId}/chat`}
                className={SECONDARY_LINK}
              >
                Chat
              </Link>
              <Link
                href={`/projects/${params.projectId}/mistakes`}
                className={SECONDARY_LINK}
              >
                Mistake bank
              </Link>
              <Link
                href={`/projects/${params.projectId}/review`}
                className={SECONDARY_LINK}
              >
                Review
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
