"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProjectMistakeCard from "@/components/project/ProjectMistakeCard";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import {
  getProjectMistakes,
  markProjectMistakeReviewed,
  resetProjectMistakeReview,
} from "@/lib/project-storage";
import type { Mistake } from "@/lib/types";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const OUTLINE_ACTION =
  "inline-flex items-center h-9 px-4 rounded-full border border-[#C4C7C5] text-sm text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const TEXT_LINK =
  "inline-flex items-center h-9 px-3 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const BACK_LINK =
  "inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

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

  function handleMarkReviewed(mistakeId: string) {
    markProjectMistakeReviewed(params.projectId, mistakeId);
    refreshMistakes();
  }

  function handleResetReview(mistakeId: string) {
    resetProjectMistakeReview(params.projectId, mistakeId);
    refreshMistakes();
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
        <p className="text-sm text-[#5F6368]">Loading mistakes...</p>
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
          <Link href="/projects" className={BACK_LINK}>
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  const unreviewedCount = sortedMistakes.filter((m) => !m.reviewed).length;

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="mistakes" />

        <header className="mb-6">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            Mistake bank
          </h1>
          <p className="text-sm text-[#5F6368] mt-2">
            Mistakes saved during training. Unreviewed mistakes guide future
            chat questions. Marking reviewed means you have looked at it — not
            that you have mastered it.
          </p>
        </header>

        {sortedMistakes.length === 0 ? (
          <div className="rounded-2xl border border-[#E1E3E1] bg-white px-6 py-14 text-center">
            <h2 className="text-base font-medium text-[#1F1F1F]">
              No mistakes saved yet
            </h2>
            <p className="text-sm text-[#5F6368] mt-2 mx-auto max-w-sm">
              Train in chat. When you answer incorrectly, Ivvy saves the mistake
              here for review.
            </p>
            <Link
              href={`/projects/${params.projectId}/chat`}
              className={`${PRIMARY_ACTION} mt-6`}
            >
              Start training
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm text-[#5F6368]">
                {sortedMistakes.length} total · {unreviewedCount} unreviewed
              </p>
              <Link
                href={`/projects/${params.projectId}/review`}
                className={TEXT_LINK}
              >
                Review queue
              </Link>
            </div>

            <div className="space-y-4">
              {sortedMistakes.map((mistake) => (
                <div
                  key={mistake.id}
                  className="rounded-2xl border border-[#E1E3E1] bg-white p-5"
                >
                  <ProjectMistakeCard mistake={mistake} />
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#F1F3F4]">
                    {!mistake.reviewed ? (
                      <button
                        type="button"
                        onClick={() => handleMarkReviewed(mistake.id)}
                        className={OUTLINE_ACTION}
                      >
                        Mark reviewed
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResetReview(mistake.id)}
                        className={OUTLINE_ACTION}
                      >
                        Mark unresolved
                      </button>
                    )}
                    <Link
                      href={`/projects/${params.projectId}/review?mistakeId=${mistake.id}`}
                      className={TEXT_LINK}
                    >
                      Review this mistake
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
