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
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading mistakes...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="inline-block text-sm text-neutral-500 hover:text-black transition-colors mt-4"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ProjectWorkspaceNav
          projectId={params.projectId}
          active="mistakes"
        />

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Mistake bank
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Mistakes saved during training. Unreviewed mistakes guide future
            chat questions. Marking reviewed means you have looked at it — not
            that you have mastered it.
          </p>
        </header>

        {sortedMistakes.length === 0 ? (
          <div className="border border-neutral-200 rounded p-6 text-center">
            <p className="text-sm font-medium text-black">
              No mistakes saved yet.
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Train in chat. When you answer incorrectly, Ivvy saves the mistake
              here for review.
            </p>
            <Link
              href={`/projects/${params.projectId}/chat`}
              className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors mt-6"
            >
              Start training
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-600 mb-6">
              {sortedMistakes.length} total ·{" "}
              {sortedMistakes.filter((m) => !m.reviewed).length} unreviewed
            </p>
            <div className="flex justify-end mb-4">
              <Link
                href={`/projects/${params.projectId}/review`}
                className="text-sm text-neutral-500 hover:text-black transition-colors"
              >
                Review queue
              </Link>
            </div>

            <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded">
              {sortedMistakes.map((mistake) => (
                <li key={mistake.id} className="p-4">
                  <ProjectMistakeCard mistake={mistake} />
                  <div className="flex flex-wrap gap-3 mt-4">
                    {!mistake.reviewed ? (
                      <button
                        type="button"
                        onClick={() => handleMarkReviewed(mistake.id)}
                        className="text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black transition-colors"
                      >
                        Mark reviewed
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResetReview(mistake.id)}
                        className="text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black transition-colors"
                      >
                        Mark unresolved
                      </button>
                    )}
                    <Link
                      href={`/projects/${params.projectId}/review?mistakeId=${mistake.id}`}
                      className="text-xs text-neutral-500 hover:text-black transition-colors py-1.5"
                    >
                      Review this mistake
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
