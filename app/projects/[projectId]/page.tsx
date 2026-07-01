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
  ghostLink,
  MetricCard,
  outlineAction,
  PageHeader,
  PageShell,
  PrimaryActionCard,
  primaryAction,
  StatusPill,
  Tag,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { getProjectChat, getProjectMistakes } from "@/lib/project-storage";
import type { Chat, Mistake } from "@/lib/types";

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
        <Link href="/projects" className={`mt-4 -ml-3 ${ghostLink}`}>
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
        <Tag tone="neutral">{project.subject}</Tag>
        <Tag tone="neutral">Exam {formatDate(project.examDate)}</Tag>
        <Tag tone="neutral">Target {project.targetGrade}</Tag>
      </div>

      {/* Editorial asymmetric bento — the page owns col-spans + scroll motion;
          each module carries only its own internal styling. */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Feature row — readiness + today's plan */}
        <Reveal delay={0} className="h-full lg:col-span-7">
          <ReadinessBand readiness={readiness} />
        </Reveal>

        <Reveal delay={80} className="h-full lg:col-span-5">
          <TodaysPlan plan={todaysPlan} />
        </Reveal>

        {/* Full-width next action */}
        <Reveal delay={160} className="lg:col-span-12">
          <PrimaryActionCard
            eyebrow="Coach"
            title="Train with your materials"
            description="Practice questions, ask Ivvy, teach a topic back, build a study sheet, or review saved mistakes — one guided learning space."
            action={
              <Link
                href={`/projects/${params.projectId}/coach`}
                className={primaryAction}
              >
                Open Coach
              </Link>
            }
          />
        </Reveal>

        {/* Mixed row — metric cells + review ring */}
        <Reveal delay={240} className="h-full lg:col-span-8">
          <section
            aria-label="Project statistics"
            className="h-full rounded-xl border border-[#E7E3DA] bg-[#F4F1EA] p-6 sm:p-7"
          >
            <Eyebrow>At a glance</Eyebrow>
            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
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
        </Reveal>

        <Reveal delay={320} className="h-full lg:col-span-4">
          <ReviewProgressRing
            total={mistakes.length}
            reviewed={reviewedMistakes}
          />
        </Reveal>

        {/* Wide activity band */}
        <Reveal delay={400} className="lg:col-span-12">
          <ActivityGrid cells={activity} />
        </Reveal>

        {/* Coverage + goals rail */}
        <Reveal delay={480} className="h-full lg:col-span-8">
          <TopicCoverageList rows={topicCoverage} />
        </Reveal>

        <Reveal delay={560} className="h-full lg:col-span-4">
          <GoalProgressCard
            projectId={params.projectId}
            weeklyProgress={weeklyProgress}
            focusTopicNames={focusTopicNames}
          />
        </Reveal>

        {/* Jump-to strip */}
        <Reveal delay={640} className="lg:col-span-12">
          <section className="rounded-xl border border-[#E7E3DA] bg-white p-6 sm:flex sm:items-center sm:justify-between">
            <Eyebrow>Jump to</Eyebrow>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
              <Link
                href={`/projects/${params.projectId}/coach`}
                className={outlineAction}
              >
                Open Coach
              </Link>
              <Link
                href={`/projects/${params.projectId}/materials`}
                className={outlineAction}
              >
                Materials
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </ProjectShell>
  );
}
