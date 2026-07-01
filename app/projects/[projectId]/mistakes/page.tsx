"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProjectMistakeCard from "@/components/project/ProjectMistakeCard";
import ProjectShell from "@/components/project/ProjectShell";
import { PageHeader } from "@/components/ui/primitives";
import { useProject } from "@/hooks/useProject";
import {
  getProjectMistakes,
  resetProjectMistakeReview,
} from "@/lib/project-storage";
import { isScheduleDue } from "@/lib/scheduling";
import type { Mistake } from "@/lib/types";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1A1A17] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const OUTLINE_ACTION =
  "inline-flex items-center h-9 px-4 rounded-full border border-[#D8D3C8] text-sm text-[#1A1A17] transition-colors hover:bg-[#EFEBE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const TEXT_LINK =
  "inline-flex items-center h-9 px-3 rounded-full text-sm text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const BACK_LINK =
  "inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

function sortMistakesNewestFirst(mistakes: Mistake[]): Mistake[] {
  return [...mistakes].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function ProjectMistakesPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, isLoaded: projectLoaded } = useProject(params.projectId);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [mistakesLoaded, setMistakesLoaded] = useState(false);

  const refreshMistakes = useCallback(() => {
    setMistakes(getProjectMistakes(params.projectId));
  }, [params.projectId]);

  useEffect(() => {
    refreshMistakes();
    setMistakesLoaded(true);
  }, [refreshMistakes]);

  const sortedMistakes = useMemo(
    () => sortMistakesNewestFirst(mistakes),
    [mistakes]
  );

  const isLoaded = projectLoaded && mistakesLoaded;

  function handleResetReview(mistakeId: string) {
    resetProjectMistakeReview(params.projectId, mistakeId);
    refreshMistakes();
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-sm text-[#56524B]">Loading mistakes...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#FAF8F4]">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1A1A17]">
            Project not found
          </h1>
          <Link href="/projects" className={BACK_LINK}>
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  const dueCount = sortedMistakes.filter((m) =>
    isScheduleDue(m.schedule)
  ).length;

  return (
    <ProjectShell projectId={params.projectId} active="coach">
      <PageHeader
        eyebrow="Memory layer"
        title="Mistake bank"
        description="Mistakes saved during training. Due mistakes guide future questions; scheduled mistakes return when FSRS says they are ready."
        action={
          sortedMistakes.length > 0 ? (
            <Link
              href={`/projects/${params.projectId}/review`}
              className={OUTLINE_ACTION}
            >
              Open review queue
            </Link>
          ) : undefined
        }
      />

      {sortedMistakes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D8D3C8] bg-white px-6 py-16 text-center">
          <h2 className="font-serif text-[22px] tracking-[-0.01em] text-[#1A1A17]">
            No mistakes saved yet
          </h2>
          <p className="text-sm text-[#56524B] mt-2.5 mx-auto max-w-sm">
            Train in chat. When you answer incorrectly, Ivvy saves the mistake
            here for review.
          </p>
          <Link
            href={`/projects/${params.projectId}/chat`}
            className={`${PRIMARY_ACTION} mt-7`}
          >
            Start training
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-[#56524B]">
            {sortedMistakes.length} total · {dueCount} due to review
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {sortedMistakes.map((mistake) => (
              <div
                key={mistake.id}
                className="rounded-2xl border border-[#E7E3DA] bg-white p-5"
              >
                <ProjectMistakeCard mistake={mistake} />
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#EFEBE2]">
                  {isScheduleDue(mistake.schedule) ? (
                    <Link
                      href={`/projects/${params.projectId}/review?mistakeId=${mistake.id}`}
                      className={OUTLINE_ACTION}
                    >
                      Review in queue
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResetReview(mistake.id)}
                      className={OUTLINE_ACTION}
                    >
                      Review now
                    </button>
                  )}
                  {!isScheduleDue(mistake.schedule) ? (
                    <Link
                      href={`/projects/${params.projectId}/review?mistakeId=${mistake.id}`}
                      className={TEXT_LINK}
                    >
                      Open review
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </ProjectShell>
  );
}
