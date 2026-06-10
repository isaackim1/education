"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { getProjectMistakes } from "@/lib/project-storage";
import type { Mistake } from "@/lib/types";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

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

function hasSavedMaterials(
  materials: { content: string }[]
): boolean {
  return materials.some((m) => m.content.trim().length > 0);
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

  const materialsWithContent = materials.filter(
    (m) => m.content.trim().length > 0
  );
  const hasTopics = topics.length > 0;
  const hasMaterials = hasSavedMaterials(materials);
  const unreviewedCount = mistakes.filter((m) => !m.reviewed).length;

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

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-[#E1E3E1] bg-white p-4">
            <p className="text-xs font-medium text-[#5F6368]">Topics</p>
            <p className="text-2xl font-semibold text-[#1F1F1F] mt-1">
              {topics.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E1E3E1] bg-white p-4">
            <p className="text-xs font-medium text-[#5F6368]">Materials</p>
            <p className="text-2xl font-semibold text-[#1F1F1F] mt-1">
              {materialsWithContent.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E1E3E1] bg-white p-4">
            <p className="text-xs font-medium text-[#5F6368]">Last studied</p>
            <p className="text-sm text-[#1F1F1F] mt-2">
              {formatLastStudied(project.lastStudiedAt)}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-[#DADCE0] bg-[#F1F3F4] p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#5F6368]">
            Next step
          </h2>

          {!hasTopics ? (
            <div className="mt-2">
              <p className="text-sm text-[#1F1F1F]">
                Add topics first. They define what Ivvy should train you on.
              </p>
              <Link
                href={`/projects/${params.projectId}/setup`}
                className={`${PRIMARY_ACTION} mt-4`}
              >
                Add topics
              </Link>
            </div>
          ) : !hasMaterials ? (
            <div className="mt-2">
              <p className="text-sm text-[#1F1F1F]">
                Add materials so Ivvy can train from your notes.
              </p>
              <Link
                href={`/projects/${params.projectId}/materials`}
                className={`${PRIMARY_ACTION} mt-4`}
              >
                Add materials
              </Link>
            </div>
          ) : mistakes.length === 0 ? (
            <div className="mt-2">
              <p className="text-sm text-[#1F1F1F]">
                Start training in chat. Ivvy will ask exam-style questions and
                save mistakes when you slip.
              </p>
              <Link
                href={`/projects/${params.projectId}/chat`}
                className={`${PRIMARY_ACTION} mt-4`}
              >
                Start training
              </Link>
            </div>
          ) : unreviewedCount > 0 ? (
            <div className="mt-2">
              <p className="text-sm text-[#1F1F1F]">
                {unreviewedCount} unreviewed mistake
                {unreviewedCount === 1 ? "" : "s"}. Review weak areas before your
                next session.
              </p>
              <Link
                href={`/projects/${params.projectId}/review`}
                className={`${PRIMARY_ACTION} mt-4`}
              >
                Review weak areas
              </Link>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-[#1F1F1F]">
                Continue training. Your recent mistakes are reviewed.
              </p>
              <Link
                href={`/projects/${params.projectId}/chat`}
                className={`${PRIMARY_ACTION} mt-4`}
              >
                Continue training
              </Link>
            </div>
          )}
        </section>

        {mistakes.length > 0 ? (
          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#1F1F1F]">Mistakes</h2>
            <p className="text-sm text-[#5F6368] mt-1">
              {mistakes.length} saved &middot; {unreviewedCount} unreviewed
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
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
                Review queue
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
