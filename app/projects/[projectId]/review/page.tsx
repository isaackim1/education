"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import ProjectShell from "@/components/project/ProjectShell";
import { PageHeader } from "@/components/ui/primitives";
import { useProject } from "@/hooks/useProject";
import {
  getProjectMistakes,
  markProjectMistakeReviewed,
} from "@/lib/project-storage";
import type { Mistake } from "@/lib/types";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1A1A17] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1A1A17]";

const REQUIZ_ACTION =
  "inline-flex items-center h-9 px-4 rounded-full bg-[#1A1A17] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const OUTLINE_ACTION =
  "inline-flex items-center h-9 px-4 rounded-full border border-[#D8D3C8] text-sm text-[#1A1A17] transition-colors hover:bg-[#EFEBE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent";

const TONAL_ACTION =
  "inline-flex items-center h-9 px-4 rounded-full bg-[#E7E3DA] text-sm font-medium text-[#1A1A17] transition-colors hover:bg-[#D8D3C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E7E3DA]";

const TEXT_LINK =
  "inline-flex items-center h-9 px-3 rounded-full text-sm text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const BACK_LINK =
  "inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const FIELD =
  "w-full rounded-2xl border border-[#E7E3DA] bg-white px-4 py-3 text-sm text-[#1A1A17] placeholder:text-[#7A766D] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

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

const UNICODE_LETTER_OR_NUMBER = new RegExp("[\\p{L}\\p{N}]", "u");

function hasMeaningfulAttempt(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 3 && UNICODE_LETTER_OR_NUMBER.test(trimmed);
}

/** Forward advance after removal — matches "Next mistake" wrap semantics. */
function nextIndexAfterReview(
  currentIndex: number,
  queueLength: number
): number {
  const remainingCount = queueLength - 1;
  if (remainingCount <= 0) return 0;
  return currentIndex % remainingCount;
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
  const [tryAgainAnswer, setTryAgainAnswer] = useState("");
  const [approachRevealed, setApproachRevealed] = useState(false);

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

  const unreviewedQueue = useMemo(
    () => reviewQueue.filter((mistake) => !mistake.reviewed),
    [reviewQueue]
  );

  useEffect(() => {
    if (!mistakesLoaded || unreviewedQueue.length === 0 || !requestedMistakeId) {
      return;
    }

    const idx = unreviewedQueue.findIndex((m) => m.id === requestedMistakeId);
    if (idx >= 0) {
      setCurrentIndex(idx);
    }
  }, [mistakesLoaded, unreviewedQueue, requestedMistakeId]);

  const currentMistake = unreviewedQueue[currentIndex] ?? null;
  const isLoaded = projectLoaded && mistakesLoaded;
  const canRevealApproach = hasMeaningfulAttempt(tryAgainAnswer);

  useEffect(() => {
    setTryAgainAnswer("");
    setApproachRevealed(false);
  }, [currentMistake?.id]);

  function handleShowBetterApproach() {
    if (!canRevealApproach) return;
    setApproachRevealed(true);
  }

  function handleMarkReviewed() {
    if (!currentMistake || !approachRevealed) return;

    const nextQueue = unreviewedQueue.filter(
      (mistake) => mistake.id !== currentMistake.id
    );
    const nextIndex = nextIndexAfterReview(
      currentIndex,
      unreviewedQueue.length
    );

    markProjectMistakeReviewed(projectId, currentMistake.id);
    refreshMistakes();
    setTryAgainAnswer("");
    setApproachRevealed(false);

    if (nextQueue.length === 0) {
      setCurrentIndex(0);
      router.replace(`/projects/${projectId}/review`, { scroll: false });
      return;
    }

    setCurrentIndex(nextIndex);
    const nextMistake = nextQueue[nextIndex];
    if (nextMistake) {
      router.replace(
        `/projects/${projectId}/review?mistakeId=${nextMistake.id}`,
        { scroll: false }
      );
    }
  }

  function handleNext() {
    if (unreviewedQueue.length === 0) return;
    const nextIndex = (currentIndex + 1) % unreviewedQueue.length;
    setCurrentIndex(nextIndex);
    const next = unreviewedQueue[nextIndex];
    if (next) {
      router.replace(
        `/projects/${projectId}/review?mistakeId=${next.id}`,
        { scroll: false }
      );
    }
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <p className="text-sm text-[#56524B]">Loading review...</p>
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

  const allReviewed =
    reviewQueue.length > 0 && unreviewedQueue.length === 0;

  return (
    <ProjectShell projectId={projectId} active="review" width="max-w-3xl">
      <PageHeader
        eyebrow="Active recall"
        title="Review"
        description="Active retrieval practice for saved mistakes. Try each one again before checking the better approach, then mark it reviewed."
      />

        {reviewQueue.length === 0 ? (
          <div className="rounded-2xl border border-[#E7E3DA] bg-white px-6 py-14 text-center">
            <h2 className="text-base font-medium text-[#1A1A17]">
              Nothing in the review queue yet
            </h2>
            <p className="text-sm text-[#56524B] mt-2 mx-auto max-w-sm">
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
        ) : allReviewed ? (
          <div className="rounded-2xl border border-[#E7E3DA] bg-white px-6 py-14 text-center">
            <span className="inline-flex items-center rounded-full bg-[#E6F4EA] px-3 py-1 text-xs font-medium text-[#137333]">
              Review complete
            </span>
            <h2 className="text-base font-medium text-[#1A1A17] mt-4">
              You&apos;ve reviewed all saved mistakes
            </h2>
            <p className="text-sm text-[#56524B] mt-2 mx-auto max-w-sm">
              Keep training in chat to save new mistakes, or revisit the mistake
              bank anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <Link
                href={`/projects/${projectId}/chat`}
                className={PRIMARY_ACTION}
              >
                Back to chat
              </Link>
              <Link
                href={`/projects/${projectId}/mistakes`}
                className={OUTLINE_ACTION}
              >
                Mistake bank
              </Link>
            </div>
          </div>
        ) : currentMistake ? (
          <>
            <p className="text-sm text-[#56524B] mb-4">
              Reviewing {currentIndex + 1} of {unreviewedQueue.length} unreviewed
              {reviewQueue.length > unreviewedQueue.length
                ? ` · ${reviewQueue.length} saved total`
                : ""}
            </p>

            <div className="rounded-2xl border border-[#E7E3DA] bg-white p-5 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#EFEBE2] px-2.5 py-0.5 text-xs text-[#56524B]">
                  {currentMistake.topicName}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#EFEBE2] px-2.5 py-0.5 text-xs text-[#56524B]">
                  {currentMistake.mistakeCategory}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#FEEFC3] px-2.5 py-0.5 text-xs font-medium text-[#B06000]">
                  Unreviewed
                </span>
              </div>

              {currentMistake.question.trim() ? (
                <div>
                  <p className="text-xs font-medium text-[#56524B]">
                    Original question
                  </p>
                  <p className="text-sm text-[#1A1A17] mt-1 whitespace-pre-wrap">
                    {currentMistake.question}
                  </p>
                </div>
              ) : null}

              {currentMistake.studentAnswer.trim() ? (
                <div>
                  <p className="text-xs font-medium text-[#56524B]">
                    Your previous answer
                  </p>
                  <p className="text-sm text-[#1A1A17] mt-1 whitespace-pre-wrap">
                    {currentMistake.studentAnswer}
                  </p>
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="try-again"
                  className="block text-xs font-medium text-[#56524B] mb-2"
                >
                  Try again
                </label>
                <textarea
                  id="try-again"
                  rows={4}
                  value={tryAgainAnswer}
                  onChange={(event) => setTryAgainAnswer(event.target.value)}
                  placeholder="Answer this again before checking the better approach…"
                  className={FIELD}
                />
              </div>

              {!approachRevealed ? (
                <button
                  type="button"
                  onClick={handleShowBetterApproach}
                  disabled={!canRevealApproach}
                  className={TONAL_ACTION}
                >
                  Show better approach
                </button>
              ) : (
                <div className="space-y-4 pt-1 border-t border-[#EFEBE2]">
                  <div>
                    <p className="text-xs font-medium text-[#56524B]">
                      Better approach
                    </p>
                    <p className="text-sm text-[#1A1A17] mt-1 whitespace-pre-wrap">
                      {currentMistake.correctApproach.trim()
                        ? currentMistake.correctApproach
                        : "No better approach was saved for this mistake."}
                    </p>
                  </div>

                  {currentMistake.agentNote.trim() ? (
                    <div>
                      <p className="text-xs font-medium text-[#56524B]">
                        Mistake note
                      </p>
                      <p className="text-sm text-[#56524B] mt-1 whitespace-pre-wrap">
                        {currentMistake.agentNote}
                      </p>
                    </div>
                  ) : null}

                  {currentMistake.rememberThis.trim() ? (
                    <div>
                      <p className="text-xs font-medium text-[#56524B]">
                        Remember this
                      </p>
                      <p className="text-sm text-[#1A1A17] mt-1 whitespace-pre-wrap">
                        {currentMistake.rememberThis}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarkReviewed}
                      className={OUTLINE_ACTION}
                    >
                      Mark reviewed
                    </button>
                    <Link
                      href={`/projects/${projectId}/chat?mistakeId=${currentMistake.id}`}
                      className={REQUIZ_ACTION}
                    >
                      Requiz me in chat
                    </Link>
                    {unreviewedQueue.length > 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className={TEXT_LINK}
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
                  </div>
                </div>
              )}

              {!approachRevealed ? (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EFEBE2]">
                  <Link
                    href={`/projects/${projectId}/chat?mistakeId=${currentMistake.id}`}
                    className={REQUIZ_ACTION}
                  >
                    Requiz me in chat
                  </Link>
                  {unreviewedQueue.length > 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className={TEXT_LINK}
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
              ) : null}
            </div>
          </>
        ) : null}
    </ProjectShell>
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
        <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
          <p className="text-sm text-[#56524B]">Loading review...</p>
        </main>
      }
    >
      <ProjectReviewContent projectId={params.projectId} />
    </Suspense>
  );
}
