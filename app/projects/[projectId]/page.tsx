"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { getProjectMistakes } from "@/lib/project-storage";
import type { Mistake, MistakeCategory } from "@/lib/types";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const SECONDARY_LINK =
  "inline-flex items-center h-9 px-4 rounded-full border border-[#C4C7C5] text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const CATEGORY_LABELS: Record<MistakeCategory, string> = {
  conceptual: "Conceptual",
  calculation: "Calculation",
  recall: "Recall",
  application: "Application",
};

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLastStudied(lastStudiedAt: string | null): string {
  if (!lastStudiedAt) return "Not studied yet";
  const date = new Date(lastStudiedAt);
  if (Number.isNaN(date.getTime())) return "Not studied yet";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hasSavedMaterials(materials: { content: string }[]): boolean {
  return materials.some((m) => m.content.trim().length > 0);
}

function weakAreaLabel(mistake: Mistake): string {
  if (mistake.topicName && mistake.topicName.trim().length > 0) {
    return mistake.topicName.trim();
  }
  return CATEGORY_LABELS[mistake.mistakeCategory] ?? "Other";
}

function topWeakAreas(
  mistakes: Mistake[]
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const mistake of mistakes) {
    const label = weakAreaLabel(mistake);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function StatusRow({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <span
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          done
            ? "bg-[#E6F4EA] text-[#137333]"
            : "bg-[#F1F3F4] text-[#80868B]"
        }`}
        aria-hidden="true"
      >
        {done ? "✓" : "•"}
      </span>
      <span
        className={`text-sm ${done ? "text-[#1F1F1F]" : "text-[#5F6368]"}`}
      >
        {label}
      </span>
    </li>
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
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [mistakesLoaded, setMistakesLoaded] = useState(false);

  const refreshMistakes = useCallback(() => {
    setMistakes(getProjectMistakes(params.projectId));
  }, [params.projectId]);

  useEffect(() => {
    refreshMistakes();
    setMistakesLoaded(true);
  }, [refreshMistakes]);

  const isLoaded = projectLoaded && materialsLoaded && mistakesLoaded;

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
        <p className="text-sm text-[#5F6368]">Loading...</p>
      </main>
    );
  }

  if (!project) {
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

  // ─── Metrics (calculated locally from existing data) ──────────────────────
  const materialsWithContent = materials.filter(
    (m) => m.content.trim().length > 0
  );
  const topicsCount = topics.length;
  const materialsCount = materialsWithContent.length;
  const totalMistakes = mistakes.length;
  const reviewedMistakes = mistakes.filter((m) => m.reviewed).length;
  const unreviewedMistakes = mistakes.filter((m) => !m.reviewed).length;
  const reviewCompletion =
    totalMistakes === 0
      ? 0
      : Math.round((reviewedMistakes / totalMistakes) * 100);

  const hasTopics = topicsCount > 0;
  const hasMaterials = hasSavedMaterials(materials);
  const hasStartedTraining = totalMistakes > 0 || project.lastStudiedAt !== null;
  const allReviewed = totalMistakes > 0 && unreviewedMistakes === 0;

  const unreviewed = mistakes.filter((m) => !m.reviewed);
  const weakAreas = topWeakAreas(unreviewed);

  // ─── Recommended next action ──────────────────────────────────────────────
  type NextAction = {
    body: string;
    label: string;
    href: string;
  };
  let nextAction: NextAction;
  if (!hasTopics) {
    nextAction = {
      body: "Add topics first. They define what Ivvy should train you on.",
      label: "Add topics",
      href: `/projects/${params.projectId}/setup`,
    };
  } else if (!hasMaterials) {
    nextAction = {
      body: "Add materials so Ivvy can train from your notes.",
      label: "Add materials",
      href: `/projects/${params.projectId}/materials`,
    };
  } else if (totalMistakes === 0) {
    nextAction = {
      body: "Start training in chat. Ivvy will ask exam-style questions and save mistakes when you slip.",
      label: "Start training",
      href: `/projects/${params.projectId}/chat`,
    };
  } else if (unreviewedMistakes > 0) {
    nextAction = {
      body: `${unreviewedMistakes} unreviewed mistake${
        unreviewedMistakes === 1 ? "" : "s"
      }. Run active review to answer them again before they're marked reviewed.`,
      label: "Active review",
      href: `/projects/${params.projectId}/review`,
    };
  } else {
    nextAction = {
      body: "Every mistake is reviewed. Keep training to surface new weak areas, or requiz yourself in chat.",
      label: "Continue training",
      href: `/projects/${params.projectId}/chat`,
    };
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="overview" />

        <header className="mb-6">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            {project.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
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

        {/* Top stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="rounded-2xl border border-[#E1E3E1] bg-white p-4">
            <p className="text-xs font-medium text-[#5F6368]">Topics</p>
            <p className="text-2xl font-semibold text-[#1F1F1F] mt-1">
              {topicsCount}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E1E3E1] bg-white p-4">
            <p className="text-xs font-medium text-[#5F6368]">Materials</p>
            <p className="text-2xl font-semibold text-[#1F1F1F] mt-1">
              {materialsCount}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E1E3E1] bg-white p-4">
            <p className="text-xs font-medium text-[#5F6368]">Mistakes</p>
            <p className="text-2xl font-semibold text-[#1F1F1F] mt-1">
              {totalMistakes}
            </p>
            {totalMistakes > 0 ? (
              <p className="text-xs text-[#80868B] mt-1">
                {unreviewedMistakes} unreviewed
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-[#E1E3E1] bg-white p-4">
            <p className="text-xs font-medium text-[#5F6368]">Review progress</p>
            <p className="text-2xl font-semibold text-[#1F1F1F] mt-1">
              {reviewCompletion}%
            </p>
            <div
              className="mt-2 h-1.5 w-full rounded-full bg-[#E8EAED] overflow-hidden"
              role="progressbar"
              aria-label="Review progress"
              aria-valuenow={reviewCompletion}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[#1F1F1F]"
                style={{ width: `${reviewCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommended next action */}
        <section className="rounded-2xl border border-[#DADCE0] bg-[#F1F3F4] p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#5F6368]">
            Recommended next action
          </h2>
          <p className="text-sm text-[#1F1F1F] mt-2">{nextAction.body}</p>
          <Link href={nextAction.href} className={`${PRIMARY_ACTION} mt-4`}>
            {nextAction.label}
          </Link>
        </section>

        {/* Training status */}
        <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 mb-4">
          <h2 className="text-sm font-semibold text-[#1F1F1F]">
            Training status
          </h2>
          <p className="text-sm text-[#5F6368] mt-1">
            Last studied {formatLastStudied(project.lastStudiedAt).toLowerCase()}
            .
          </p>
          <ul className="mt-3 -mb-1 divide-y divide-[#F1F3F4]">
            <StatusRow
              done={hasTopics}
              label={
                hasTopics
                  ? `${topicsCount} topic${topicsCount === 1 ? "" : "s"} added`
                  : "Add topics to define your syllabus"
              }
            />
            <StatusRow
              done={hasMaterials}
              label={
                hasMaterials
                  ? `${materialsCount} material${
                      materialsCount === 1 ? "" : "s"
                    } ready`
                  : "Add materials for Ivvy to train from"
              }
            />
            <StatusRow
              done={hasStartedTraining}
              label={
                hasStartedTraining
                  ? "Training started in chat"
                  : "Start an adaptive chat session"
              }
            />
            <StatusRow
              done={allReviewed}
              label={
                totalMistakes === 0
                  ? "No mistakes saved yet"
                  : allReviewed
                  ? "All mistakes reviewed"
                  : `${unreviewedMistakes} mistake${
                      unreviewedMistakes === 1 ? "" : "s"
                    } left to review`
              }
            />
          </ul>
        </section>

        {/* Weak areas */}
        <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 mb-4">
          <h2 className="text-sm font-semibold text-[#1F1F1F]">Weak areas</h2>

          {weakAreas.length === 0 ? (
            <p className="text-sm text-[#5F6368] mt-2">
              No weak areas yet. Train in chat and Ivvy will surface the topics
              and skills you miss most.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {weakAreas.map((area) => (
                <li
                  key={area.label}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFD] border border-[#E8EAED] px-3 py-2"
                >
                  <span className="text-sm text-[#1F1F1F] truncate">
                    {area.label}
                  </span>
                  <span className="inline-flex items-center h-6 px-2 rounded-full bg-[#FEEFC3] text-xs font-medium text-[#B06000] shrink-0">
                    {area.count} mistake{area.count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Workspace links */}
        <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1F1F1F]">Workspace</h2>
          <div className="flex flex-wrap gap-2 mt-4">
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
    </main>
  );
}
