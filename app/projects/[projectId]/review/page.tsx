"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import ProjectMistakeCard from "@/components/project/ProjectMistakeCard";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import {
  getProjectMistakes,
  markProjectMistakeReviewed,
} from "@/lib/project-storage";
import type { Mistake } from "@/lib/types";

function sortForReview(mistakes: Mistake[]): Mistake[] {
  return [...mistakes].sort((a, b) => {
    if (a.reviewed !== b.reviewed) {
      return a.reviewed ? 1 : -1;
    }
    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
}

function ProjectReviewContent({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMistakeId = searchParams.get("mistakeId");

  const { project, isLoaded: projectLoaded } = useProject(projectId);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [mistakesLoaded, setMistakesLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const refreshMistakes = useCallback(() => {
    setMistakes(getProjectMistakes(projectId));
  }, [projectId]);

  useEffect(() => {
    refreshMistakes();
    setMistakesLoaded(true);
  }, [refreshMistakes]);

  const reviewQueue = useMemo(
    () => sortForReview(mistakes),
    [mistakes]
  );

  useEffect(() => {
    if (!mistakesLoaded || reviewQueue.length === 0) return;

    if (requestedMistakeId) {
      const idx = reviewQueue.findIndex((m) => m.id === requestedMistakeId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        return;
      }
    }

    setCurrentIndex(0);
  }, [mistakesLoaded, reviewQueue, requestedMistakeId]);

  const currentMistake = reviewQueue[currentIndex] ?? null;
  const isLoaded = projectLoaded && mistakesLoaded;

  function handleMarkReviewed() {
    if (!currentMistake) return;
    markProjectMistakeReviewed(projectId, currentMistake.id);
    refreshMistakes();
  }

  function handleNext() {
    if (reviewQueue.length === 0) return;
    const nextIndex = (currentIndex + 1) % reviewQueue.length;
    setCurrentIndex(nextIndex);
    const next = reviewQueue[nextIndex];
    if (next) {
      router.replace(
        `/projects/${projectId}/review?mistakeId=${next.id}`,
        { scroll: false }
      );
    }
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading review...</p>
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
        <ProjectWorkspaceNav projectId={projectId} active="review" />

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Review mistakes
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Work through saved mistakes from your training chat.
          </p>
        </header>

        {reviewQueue.length === 0 ? (
          <div className="border border-neutral-200 rounded p-6 text-center">
            <p className="text-sm font-medium text-black">
              No mistakes to review yet.
            </p>
            <Link
              href={`/projects/${projectId}/chat`}
              className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors mt-6"
            >
              Go to chat
            </Link>
          </div>
        ) : currentMistake ? (
          <div className="border border-neutral-200 rounded p-4">
            <p className="text-xs text-neutral-500 mb-4">
              {currentIndex + 1} of {reviewQueue.length}
              {reviewQueue.filter((m) => !m.reviewed).length > 0
                ? ` · ${reviewQueue.filter((m) => !m.reviewed).length} unreviewed`
                : ""}
            </p>

            <ProjectMistakeCard mistake={currentMistake} />

            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-neutral-200">
              {!currentMistake.reviewed ? (
                <button
                  type="button"
                  onClick={handleMarkReviewed}
                  className="text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black transition-colors"
                >
                  Mark as reviewed
                </button>
              ) : (
                <span className="text-xs text-neutral-500 py-1.5">
                  Already reviewed
                </span>
              )}
              {reviewQueue.length > 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black transition-colors"
                >
                  Next mistake
                </button>
              ) : null}
              <Link
                href={`/projects/${projectId}/mistakes`}
                className="text-xs text-neutral-500 hover:text-black transition-colors py-1.5"
              >
                Mistake bank
              </Link>
              <Link
                href={`/projects/${projectId}/chat`}
                className="text-xs text-neutral-500 hover:text-black transition-colors py-1.5"
              >
                Back to chat
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function ProjectReviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-neutral-600">Loading review...</p>
        </main>
      }
    >
      <ProjectReviewContent projectId={params.projectId} />
    </Suspense>
  );
}
