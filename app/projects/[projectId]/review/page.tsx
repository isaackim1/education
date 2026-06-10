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

const PRIMARY_ACTION =
  "inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const REQUIZ_ACTION =
  "inline-flex items-center h-9 px-4 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const OUTLINE_ACTION =
  "inline-flex items-center h-9 px-4 rounded-full border border-[#C4C7C5] text-sm text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const TEXT_LINK =
  "inline-flex items-center h-9 px-3 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const BACK_LINK =
  "inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

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
      <main className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
        <p className="text-sm text-[#5F6368]">Loading review...</p>
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

  const unreviewedRemaining = reviewQueue.filter((m) => !m.reviewed).length;

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={projectId} active="review" />

        <header className="mb-6">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            Review
          </h1>
          <p className="text-sm text-[#5F6368] mt-2">
            Review queue for saved mistakes. Read each one, then use Requiz me to
            test the same weakness again in chat.
          </p>
        </header>

        {reviewQueue.length === 0 ? (
          <div className="rounded-2xl border border-[#E1E3E1] bg-white px-6 py-14 text-center">
            <h2 className="text-base font-medium text-[#1F1F1F]">
              Nothing in the review queue yet
            </h2>
            <p className="text-sm text-[#5F6368] mt-2 mx-auto max-w-sm">
              Mistakes appear here after training. Ivvy saves them when you
              answer incorrectly in chat.
            </p>
            <Link
              href={`/projects/${projectId}/chat`}
              className={`${PRIMARY_ACTION} mt-6`}
            >
              Start training
            </Link>
          </div>
        ) : currentMistake ? (
          <>
            <p className="text-sm text-[#5F6368] mb-4">
              Reviewing {currentIndex + 1} of {reviewQueue.length} mistakes
              {unreviewedRemaining > 0
                ? ` · ${unreviewedRemaining} unreviewed remaining`
                : ""}
            </p>

            <div className="rounded-2xl border border-[#E1E3E1] bg-white p-5">
              <ProjectMistakeCard mistake={currentMistake} />

              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#F1F3F4]">
                <Link
                  href={`/projects/${projectId}/chat?mistakeId=${currentMistake.id}`}
                  className={REQUIZ_ACTION}
                >
                  Requiz me
                </Link>
                {!currentMistake.reviewed ? (
                  <button
                    type="button"
                    onClick={handleMarkReviewed}
                    className={OUTLINE_ACTION}
                  >
                    Mark reviewed
                  </button>
                ) : (
                  <span className="inline-flex items-center h-9 rounded-full bg-[#E6F4EA] px-3 text-xs font-medium text-[#137333]">
                    Reviewed
                  </span>
                )}
                {reviewQueue.length > 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={OUTLINE_ACTION}
                  >
                    Next mistake
                  </button>
                ) : null}
                <Link
                  href={`/projects/${projectId}/mistakes`}
                  className={TEXT_LINK}
                >
                  Mistake bank
                </Link>
                <Link
                  href={`/projects/${projectId}/chat`}
                  className={TEXT_LINK}
                >
                  Back to chat
                </Link>
              </div>
            </div>
          </>
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
        <main className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
          <p className="text-sm text-[#5F6368]">Loading review...</p>
        </main>
      }
    >
      <ProjectReviewContent projectId={params.projectId} />
    </Suspense>
  );
}
