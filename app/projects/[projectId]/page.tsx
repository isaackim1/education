"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ActivityGrid from "@/components/project/dashboard/ActivityGrid";
import ReadinessBand from "@/components/project/dashboard/ReadinessBand";
import ReviewProgressRing from "@/components/project/dashboard/ReviewProgressRing";
import TodaysPlan from "@/components/project/dashboard/TodaysPlan";
import TopicCoverageList from "@/components/project/dashboard/TopicCoverageList";
import GoalProgressCard from "@/components/project/goals/GoalProgressCard";
import ProjectShell from "@/components/project/ProjectShell";
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
import {
  CenteredNotice,
  Eyebrow,
  MetricCard,
  PageHeader,
  PageShell,
  PrimaryActionCard,
  primaryAction,
  StatusPill,
} from "@/components/ui/primitives";
import { getProjectChat, getProjectMistakes } from "@/lib/project-storage";
import type { Chat, Mistake } from "@/lib/types";

const SECONDARY_LINK =
  "inline-flex items-center h-9 px-4 rounded-full border border-[#D8D3C8] text-sm font-medium text-[#1A1A17] transition-colors duration-200 hover:bg-[#EFEBE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]";

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
    return <CenteredNotice>Loading…</CenteredNotice>;
  }

  if (!project || !todaysPlan) {
    return (
      <PageShell width="max-w-lg">
        <h1 className="font-serif text-[34px] leading-[1.08] tracking-[-0.01em] text-[#1A1A17]">
          Project not found
        </h1>
        <Link
          href="/projects"
          className="mt-4 inline-flex h-9 -ml-3 items-center rounded-full px-3 text-sm text-[#56524B] transition-colors duration-200 hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
        >
          Back to projects
        </Link>
      </PageShell>
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
    <ProjectShell projectId={params.projectId} active="overview">
      <PageHeader
        eyebrow="Command center"
        title={project.name}
        description="Where you are in exam preparation, and what to train next."
        action={
          <StatusPill tone={isExamUrgent ? "warning" : "neutral"}>
            {daysPillLabel(examDays)}
          </StatusPill>
        }
      />

      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-7 items-center rounded-full bg-[#F4F1EA] px-3 text-xs font-medium text-[#56524B]">
          {project.subject}
        </span>
        <span className="inline-flex h-7 items-center rounded-full bg-[#F4F1EA] px-3 text-xs font-medium text-[#56524B]">
          Exam {formatDate(project.examDate)}
        </span>
        <span className="inline-flex h-7 items-center rounded-full bg-[#F4F1EA] px-3 text-xs font-medium text-[#56524B]">
          Target {project.targetGrade}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Primary column — readiness, plan, next action, activity */}
        <div className="space-y-5 lg:col-span-8">
          <ReadinessBand readiness={readiness} />

          <TodaysPlan plan={todaysPlan} />

          <PrimaryActionCard
            eyebrow="Study modes"
            title="Choose how to train"
            description="Practice questions, teach a topic back, build a study sheet, or revisit saved mistakes — one coherent learning system."
            action={
              <Link
                href={`/projects/${params.projectId}/study`}
                className={primaryAction}
              >
                Open study modes
              </Link>
            }
          />

          <section aria-label="Project statistics">
            <Eyebrow>At a glance</Eyebrow>
            <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard
                label="Topics"
                value={topics.length}
                detail={
                  topics.length === 0
                    ? "Add your exam areas"
                    : `${topicCoverage.filter((row) => row.hasMaterials).length} with materials`
                }
              />
              <MetricCard
                label="Materials"
                value={meaningfulMaterials.length}
                detail={
                  meaningfulMaterials.length === 0
                    ? "Add notes or past papers"
                    : "Saved across topics"
                }
              />
              <MetricCard
                label="Mistakes"
                value={mistakes.length}
                detail={
                  mistakes.length === 0
                    ? "Train to find weak areas"
                    : `${unreviewedMistakes} unreviewed`
                }
              />
              <MetricCard
                label="Review"
                value={`${reviewPercentage}%`}
                detail={
                  mistakes.length === 0
                    ? "No review queue yet"
                    : `${reviewedMistakes} of ${mistakes.length} reviewed`
                }
              />
            </div>
          </section>

          <ActivityGrid cells={activity} />

          <TopicCoverageList rows={topicCoverage} />
        </div>

        {/* Secondary column — goals + review progress */}
        <div className="space-y-5 lg:col-span-4">
          <GoalProgressCard
            projectId={params.projectId}
            weeklyProgress={weeklyProgress}
            focusTopicNames={focusTopicNames}
          />

          <ReviewProgressRing
            total={mistakes.length}
            reviewed={reviewedMistakes}
          />

          <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
            <Eyebrow>Jump to</Eyebrow>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/projects/${params.projectId}/import`}
                className={SECONDARY_LINK}
              >
                Upload materials
              </Link>
              <Link
                href={`/projects/${params.projectId}/train`}
                className={SECONDARY_LINK}
              >
                Train
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
    </ProjectShell>
  );
}
