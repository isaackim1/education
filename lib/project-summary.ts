"use client";

import { computeCalibration } from "./calibration";
import {
  computeReadiness,
  computeTopicCoverage,
  daysUntil,
  type ReadinessMetrics,
} from "./dashboard-metrics";
import {
  getProjectChat,
  getProjectMaterials,
  getProjectMistakes,
  getProjectTopics,
  getRetrievalAttempts,
  getTrainingLog,
} from "./project-storage";
import { isScheduleDue } from "./scheduling";
import type { StudyProject } from "./types";

/**
 * Per-project summary for the Home table and the needs-attention strip.
 * Pure reads over local storage; cheap at realistic project counts.
 */

export interface ProjectSummary {
  project: StudyProject;
  examDays: number | null;
  readiness: ReadinessMetrics;
  dueCount: number;
  highRiskDue: number;
  weakTopicCount: number;
  materialCount: number;
  topicCount: number;
  /** Days since the last visible activity; null when there has been none. */
  daysSinceActivity: number | null;
  overconfident: boolean;
}

function latestIso(...values: (string | null | undefined)[]): string | null {
  let latest: string | null = null;
  for (const value of values) {
    if (!value) continue;
    if (Number.isNaN(new Date(value).getTime())) continue;
    if (!latest || new Date(value).getTime() > new Date(latest).getTime()) {
      latest = value;
    }
  }
  return latest;
}

export function deriveProjectSummary(project: StudyProject): ProjectSummary {
  const topics = getProjectTopics(project.id);
  const materials = getProjectMaterials(project.id);
  const mistakes = getProjectMistakes(project.id);
  const attempts = getRetrievalAttempts(project.id);
  const chat = getProjectChat(project.id);
  const log = getTrainingLog(project.id);

  const readiness = computeReadiness(topics, materials, mistakes);
  const coverage = computeTopicCoverage(topics, materials, mistakes);
  const calibration = computeCalibration(attempts);

  const dueMistakes = mistakes.filter((m) => isScheduleDue(m.schedule));
  const materialCount = materials.filter((m) => m.content.trim().length > 0)
    .length;

  const lastActivity = latestIso(
    project.lastStudiedAt,
    chat?.lastMessageAt,
    log[0]?.loggedAt,
    ...log.map((session) => session.loggedAt)
  );
  let daysSinceActivity: number | null = null;
  if (lastActivity) {
    const then = new Date(lastActivity);
    const now = new Date();
    then.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    daysSinceActivity = Math.max(
      0,
      Math.round((now.getTime() - then.getTime()) / 86_400_000)
    );
  }

  return {
    project,
    examDays: daysUntil(project.examDate),
    readiness,
    dueCount: dueMistakes.length,
    highRiskDue: 0,
    weakTopicCount: coverage.filter((row) => row.isWeakArea).length,
    materialCount,
    topicCount: topics.length,
    daysSinceActivity,
    overconfident:
      calibration.hasEnoughData && calibration.overconfidenceIndex > 0.15,
  };
}

export interface AttentionItem {
  projectId: string;
  /** Plain sentence, e.g. "Macroeconomics has 14 reviews due". */
  sentence: string;
  actionLabel: string;
  href: string;
}

/**
 * The needs-attention strip: at most three sentence-rows, ranked
 * due reviews > imminent exam > missing materials > overconfidence > idle.
 * One line per project so a single struggling project can't fill the strip.
 */
export function deriveAttentionItems(
  summaries: ProjectSummary[]
): AttentionItem[] {
  const candidates: { rank: number; item: AttentionItem }[] = [];

  for (const summary of summaries) {
    const { project } = summary;
    const base = `/projects/${project.id}`;

    if (summary.dueCount > 0) {
      candidates.push({
        rank: 0,
        item: {
          projectId: project.id,
          sentence: `${project.name} has ${summary.dueCount} review${
            summary.dueCount === 1 ? "" : "s"
          } due`,
          actionLabel: "Start review",
          href: `${base}/coach?mode=review`,
        },
      });
      continue;
    }
    if (summary.examDays !== null && summary.examDays <= 7) {
      candidates.push({
        rank: 1,
        item: {
          projectId: project.id,
          sentence:
            summary.examDays === 0
              ? `${project.name} exam is today`
              : `${project.name} exam is in ${summary.examDays} day${
                  summary.examDays === 1 ? "" : "s"
                }`,
          actionLabel: "Open project",
          href: base,
        },
      });
      continue;
    }
    if (summary.materialCount === 0) {
      candidates.push({
        rank: 2,
        item: {
          projectId: project.id,
          sentence: `${project.name} has no materials yet`,
          actionLabel: "Upload materials",
          href: `${base}/materials`,
        },
      });
      continue;
    }
    if (summary.overconfident) {
      candidates.push({
        rank: 3,
        item: {
          projectId: project.id,
          sentence: `In ${project.name} your confidence is running ahead of your results`,
          actionLabel: "Open project",
          href: base,
        },
      });
      continue;
    }
    if (summary.daysSinceActivity !== null && summary.daysSinceActivity >= 7) {
      candidates.push({
        rank: 4,
        item: {
          projectId: project.id,
          sentence: `You haven't opened ${project.name} in ${summary.daysSinceActivity} days`,
          actionLabel: "Open project",
          href: base,
        },
      });
    }
  }

  return candidates
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .map((candidate) => candidate.item);
}
