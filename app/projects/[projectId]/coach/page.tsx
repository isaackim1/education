"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import MessageThread from "@/components/session/MessageThread";
import SessionInput from "@/components/session/SessionInput";
import ProjectShell from "@/components/project/ProjectShell";
import { CenteredNotice, ghostLink, PageShell } from "@/components/ui/primitives";
import { useChat } from "@/hooks/useChat";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { useTrainingLog } from "@/hooks/useTrainingLog";
import { getOverconfidentMistakeIds } from "@/lib/calibration";
import {
  buildCoachModeSystemPrompt,
  buildProjectContextMessage,
  coachKickoffMessage,
  type CoachMode,
  type ProjectChatContext,
} from "@/lib/project-prompts";
import {
  STORAGE_ERROR_EVENT,
  getDueProjectMistakes,
  getProjectMistakes,
  getRetrievalAttempts,
  gradeProjectMistake,
  recordRetrievalAttempt,
} from "@/lib/project-storage";
import { isScheduleDue, previewNextDue } from "@/lib/scheduling";
import type {
  ConfidenceLevel,
  Material,
  Mistake,
  ReviewRating,
  StudyProject,
  Topic,
} from "@/lib/types";
import { daysUntilExam, generateId, getTodayIsoDate } from "@/lib/utils";

/**
 * Coach — one continuous session surface. Modes are states of this page, not
 * separate routes: Ask, Learn, and Practice share the persistent training
 * thread; Review works the due queue with the confidence step and FSRS grading.
 * The right rail shows what Ivvy knows right now.
 */

const MODES: { id: CoachMode; label: string }[] = [
  { id: "ask", label: "Ask" },
  { id: "learn", label: "Learn" },
  { id: "practice", label: "Practice" },
  { id: "review", label: "Review" },
];

const LABEL =
  "text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]";

const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string }[] = [
  { value: 1, label: "Guessing" },
  { value: 2, label: "Fairly sure" },
  { value: 3, label: "Certain" },
];

const RATINGS: { rating: ReviewRating; label: string }[] = [
  { rating: "again", label: "Missed" },
  { rating: "hard", label: "Shaky" },
  { rating: "good", label: "Got it" },
  { rating: "easy", label: "Easy" },
];

const CHIP_ON =
  "inline-flex h-8 items-center rounded-md bg-[#1E4634] px-3.5 text-xs font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2";
const CHIP_OFF =
  "inline-flex h-8 items-center rounded-md border border-[#D8D3C8] px-3.5 text-xs text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2";
const PRIMARY =
  "inline-flex h-10 items-center justify-center rounded-md bg-[#1E4634] px-6 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#16382A] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2";
const FIELD =
  "w-full rounded-lg border border-[#D8D3C8] bg-white px-4 py-3 text-sm text-[#1A1A17] placeholder:text-[#9B968D] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634]/20 focus-visible:border-[#1E4634]";

function isCoachMode(value: string | null): value is CoachMode {
  return (
    value === "ask" ||
    value === "learn" ||
    value === "practice" ||
    value === "review"
  );
}

const DAILY_BRIEFING_STALE_MS = 10 * 60 * 60 * 1000;

/** High-risk first, then oldest-first — the evidence loop's queue order. */
function sortForReview(mistakes: Mistake[], dangerous: Set<string>): Mistake[] {
  return [...mistakes].sort((a, b) => {
    const aRank = dangerous.has(a.id) ? 0 : 1;
    const bRank = dangerous.has(b.id) ? 0 : 1;
    if (aRank !== bRank) return aRank - bRank;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

const UNICODE_LETTER_OR_NUMBER = new RegExp("[\\p{L}\\p{N}]", "u");

function hasMeaningfulAttempt(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 3 && UNICODE_LETTER_OR_NUMBER.test(trimmed);
}

/** "tomorrow" / "in 3 days" / "in 2 weeks" — the schedule made legible. */
function dueDeltaLabel(dueIso: string): string {
  const today = new Date(`${getTodayIsoDate()}T00:00:00`);
  const due = new Date(`${dueIso}T00:00:00`);
  if (Number.isNaN(due.getTime())) return dueIso;
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 14) return `in ${days} days`;
  return `in ${Math.round(days / 7)} weeks`;
}

function formatDueDate(dueIso: string): string {
  const due = new Date(`${dueIso}T00:00:00`);
  if (Number.isNaN(due.getTime())) return dueIso;
  return due.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function normalizeTopicName(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findTopicByName(topics: Topic[], name: string | null): Topic | null {
  if (!name) return null;
  const normalized = normalizeTopicName(name);
  if (!normalized) return null;
  return (
    topics.find((topic) => normalizeTopicName(topic.name) === normalized) ??
    topics.find((topic) => topic.id === name) ??
    topics.find((topic) => {
      const topicName = normalizeTopicName(topic.name);
      return topicName.includes(normalized) || normalized.includes(topicName);
    }) ??
    null
  );
}

function isStaleThread(lastMessageAt: string | null): boolean {
  if (!lastMessageAt) return false;
  const timestamp = new Date(lastMessageAt).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp > DAILY_BRIEFING_STALE_MS;
}

function buildContext(
  project: StudyProject,
  topics: Topic[],
  materials: Material[],
  activeTopic: string | null,
  projectId: string
): ProjectChatContext {
  const topicNameById = new Map(topics.map((topic) => [topic.id, topic.name]));
  const dangerous = getOverconfidentMistakeIds(getRetrievalAttempts(projectId));
  const recentDue = getDueProjectMistakes(projectId)
    .sort((a, b) => {
      const aRank = dangerous.has(a.id) ? 0 : 1;
      const bRank = dangerous.has(b.id) ? 0 : 1;
      if (aRank !== bRank) return aRank - bRank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3)
    .map((mistake) => ({
      topicName: mistake.topicName,
      mistakeCategory: mistake.mistakeCategory,
      question: mistake.question,
      studentAnswer: mistake.studentAnswer,
    }));

  return {
    projectName: project.name,
    subject: project.subject,
    examDate: project.examDate,
    daysRemaining: daysUntilExam(project.examDate),
    targetGrade: project.targetGrade,
    topics: topics.map((topic) => ({
      name: topic.name,
      masteryScore: topic.masteryScore,
    })),
    activeTopic,
    materials: materials
      .filter((material) => material.content.trim())
      .map((material) => ({
        topicName: topicNameById.get(material.topicId) ?? "Unknown topic",
        content: material.content.trim(),
        fileName: material.fileName,
      })),
    recentDueMistakes: recentDue,
  };
}

function CoachContent({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { project, topics, isLoaded: projectLoaded } = useProject(projectId);
  const { materials, isLoaded: materialsLoaded } = useProjectMaterials(
    projectId
  );
  const { messages, isLoaded: chatLoaded, isSending, sendMessage } = useChat(
    projectId
  );
  const { logSession } = useTrainingLog(projectId);

  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [dangerousIds, setDangerousIds] = useState<Set<string>>(new Set());
  const [mistakesLoaded, setMistakesLoaded] = useState(false);

  const [mode, setMode] = useState<CoachMode | null>(null);
  const [activeTopicName, setActiveTopicName] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [continuePreviousThread, setContinuePreviousThread] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  // Review-mode state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tryAgainAnswer, setTryAgainAnswer] = useState("");
  const [approachRevealed, setApproachRevealed] = useState(false);
  const [reviewConfidence, setReviewConfidence] =
    useState<ConfidenceLevel | null>(null);
  const [reviewedThisSession, setReviewedThisSession] = useState<Set<string>>(
    new Set()
  );

  const refreshMistakes = useCallback(() => {
    setMistakes(getProjectMistakes(projectId));
    setDangerousIds(
      getOverconfidentMistakeIds(getRetrievalAttempts(projectId))
    );
  }, [projectId]);

  useEffect(() => {
    refreshMistakes();
    setMistakesLoaded(true);
  }, [refreshMistakes]);

  useEffect(() => {
    function handleStorageError(event: Event) {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setStorageWarning(
        detail?.message ??
          "Ivvy could not save to this browser. Export a backup before continuing."
      );
    }

    window.addEventListener(STORAGE_ERROR_EVENT, handleStorageError);
    return () =>
      window.removeEventListener(STORAGE_ERROR_EVENT, handleStorageError);
  }, []);

  const dueQueue = useMemo(
    () =>
      sortForReview(
        mistakes.filter(
          (m) => isScheduleDue(m.schedule) && !reviewedThisSession.has(m.id)
        ),
        dangerousIds
      ),
    [mistakes, dangerousIds, reviewedThisSession]
  );
  const dueCount = dueQueue.length;
  const totalDueCount = useMemo(
    () => mistakes.filter((m) => isScheduleDue(m.schedule)).length,
    [mistakes]
  );
  const highRiskDueCount = dueQueue.filter((m) => dangerousIds.has(m.id))
    .length;

  const recommendedTopicName = useMemo(() => {
    if (activeTopicName) return activeTopicName;

    const dueByTopic = topics
      .map((topic) => ({
        topic,
        count: mistakes.filter(
          (mistake) =>
            mistake.topicId === topic.id && isScheduleDue(mistake.schedule)
        ).length,
      }))
      .sort((a, b) => b.count - a.count)[0];
    if (dueByTopic && dueByTopic.count > 0) return dueByTopic.topic.name;

    const weakTopic = [...topics]
      .filter((topic) => topic.isWeakTopic || topic.mistakeCount > 0)
      .sort((a, b) => b.mistakeCount - a.mistakeCount)[0];
    if (weakTopic) return weakTopic.name;

    const materialTopicIds = new Set(
      materials
        .filter((material) => material.content.trim().length > 0)
        .map((material) => material.topicId)
    );
    const topicWithMaterials = topics.find((topic) =>
      materialTopicIds.has(topic.id)
    );
    return topicWithMaterials?.name ?? topics[0]?.name ?? null;
  }, [activeTopicName, topics, mistakes, materials]);

  const effectiveTopicName = activeTopicName ?? recommendedTopicName;

  // Initialize mode once data is ready: honor ?mode=, else recommend.
  useEffect(() => {
    if (mode !== null || !mistakesLoaded) return;
    const requested = searchParams.get("mode");
    if (isCoachMode(requested)) {
      setMode(requested);
      return;
    }
    setMode(dueCount > 0 ? "review" : "practice");
  }, [mode, mistakesLoaded, searchParams, dueCount]);

  // Honor ?topic= once topics load.
  useEffect(() => {
    const requested = searchParams.get("topic");
    if (!requested) return;
    const match = findTopicByName(topics, requested);
    if (match) {
      setActiveTopicName(match.name);
    }
  }, [searchParams, topics]);

  const selectMode = useCallback(
    (next: CoachMode) => {
      setMode(next);
      const params = new URLSearchParams(window.location.search);
      params.set("mode", next);
      router.replace(`/projects/${projectId}/coach?${params.toString()}`, {
        scroll: false,
      });
    },
    [projectId, router]
  );

  const materialsWithContent = useMemo(
    () => materials.filter((m) => m.content.trim().length > 0),
    [materials]
  );

  const activeTopicMistakes = useMemo(() => {
    if (!activeTopicName) return null;
    const inTopic = mistakes.filter((m) => m.topicName === activeTopicName);
    return {
      total: inTopic.length,
      due: inTopic.filter((m) => isScheduleDue(m.schedule)).length,
      highRisk: inTopic.filter((m) => dangerousIds.has(m.id)).length,
    };
  }, [activeTopicName, mistakes, dangerousIds]);

  const isLoaded =
    projectLoaded && materialsLoaded && chatLoaded && mistakesLoaded;

  // ── Chat modes ──────────────────────────────────────────────────────────────

  const handleSend = useCallback(
    async (content: string) => {
      if (!project || !mode || mode === "review") return;
      const pendingConfidence = confidence;
      const context = buildContext(
        project,
        topics,
        materials,
        effectiveTopicName,
        projectId
      );
      setInput("");
      setConfidence(null);
      const result = await sendMessage(content, {
        systemPrompt: buildCoachModeSystemPrompt(mode),
        contextMessage: buildProjectContextMessage(context),
        mistakeContext: {
          topics,
          activeTopicName,
          fallbackTopicName: effectiveTopicName,
        },
      });

      // Calibration: a rated answer in Practice is a retrieval attempt.
      if (
        result &&
        pendingConfidence !== null &&
        mode === "practice"
      ) {
        const topicId =
          findTopicByName(topics, effectiveTopicName)?.id ?? null;
        recordRetrievalAttempt(projectId, {
          mistakeId: result.mistakeId ?? `chat-${generateId()}`,
          topicId,
          predictedConfidence: pendingConfidence,
          wasCorrect: !result.flaggedMistake,
          timestamp: new Date().toISOString(),
        });
      }
      refreshMistakes();
    },
    [
      project,
      mode,
      confidence,
      topics,
      materials,
      activeTopicName,
      effectiveTopicName,
      projectId,
      sendMessage,
      refreshMistakes,
    ]
  );

  const handleBegin = useCallback(() => {
    if (!mode) return;
    if (mode === "review") return;
    void handleSend(coachKickoffMessage(mode, effectiveTopicName));
  }, [mode, effectiveTopicName, handleSend]);

  // ── Review mode ─────────────────────────────────────────────────────────────

  const currentMistake = dueQueue[currentIndex] ?? null;
  const canReveal = hasMeaningfulAttempt(tryAgainAnswer);

  useEffect(() => {
    setTryAgainAnswer("");
    setApproachRevealed(false);
    setReviewConfidence(null);
  }, [currentMistake?.id]);

  function handleGrade(rating: ReviewRating) {
    if (!currentMistake || !approachRevealed) return;
    const gradedId = currentMistake.id;
    const remaining = dueQueue.length - 1;

    gradeProjectMistake(
      projectId,
      gradedId,
      rating,
      reviewConfidence ?? undefined
    );
    const nextReviewed = new Set(reviewedThisSession).add(gradedId);
    setReviewedThisSession(nextReviewed);
    // Sitting complete: log it so the Overview activity strip sees it.
    if (remaining === 0 && nextReviewed.size > 0) {
      logSession({
        type: "reviewed-mistakes",
        topicId: null,
        durationMinutes: Math.max(2, Math.round(nextReviewed.size * 1.5)),
        note: `${nextReviewed.size} reviewed`,
        confidenceAfter: null,
      });
    }
    refreshMistakes();
    setCurrentIndex((index) => (remaining <= 0 ? 0 : index % remaining));
  }

  function handleSkip() {
    if (dueQueue.length <= 1) return;
    setCurrentIndex((index) => (index + 1) % dueQueue.length);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!isLoaded || mode === null) {
    return <CenteredNotice>Loading Coach…</CenteredNotice>;
  }

  if (!project) {
    return (
      <PageShell width="max-w-lg">
        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
          Project not found
        </h1>
        <Link href="/projects" className={`mt-4 -ml-3 ${ghostLink}`}>
          Back to projects
        </Link>
      </PageShell>
    );
  }

  const base = `/projects/${projectId}`;
  const hasMaterials = materialsWithContent.length > 0;
  const showConfidence = mode === "practice";
  const reviewedCount = reviewedThisSession.size;
  const threadIsStale = isStaleThread(messages.at(-1)?.timestamp ?? null);
  const showBriefing =
    messages.length === 0 || (threadIsStale && !continuePreviousThread);

  return (
    <ProjectShell projectId={projectId} active="coach" width="max-w-6xl">
      {storageWarning ? (
        <div className="mb-4 rounded-lg border border-[#D8D3C8] bg-white px-4 py-3 text-sm text-[#1A1A17]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>{storageWarning}</p>
            <button
              type="button"
              onClick={() => setStorageWarning(null)}
              className="text-xs font-medium text-[#1E4634] underline-offset-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {/* Mode switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E3DA] pb-4">
        <div
          role="tablist"
          aria-label="Coach mode"
          className="flex flex-wrap gap-1"
        >
          {MODES.map((item) => {
            const isActive = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectMode(item.id)}
                className={`inline-flex h-9 items-center rounded-md px-4 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-[#1E4634] font-medium text-white"
                    : "text-[#56524B] hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
                }`}
              >
                {item.label}
                {item.id === "review" && dueCount > 0 ? (
                  <span className="ml-1.5 text-xs tabular-nums opacity-80">
                    {dueCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {mode === "review" && (dueCount > 0 || reviewedCount > 0) ? (
          <p className="text-sm tabular-nums text-[#56524B]">
            {reviewedCount > 0
              ? dueCount > 0
                ? `${reviewedCount} reviewed · ${dueCount} left this sitting`
                : "Caught up this sitting"
              : `${dueCount} due`}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ── Main surface ── */}
        <div className="min-w-0">
          {mode === "review" ? (
            /* ── REVIEW ── */
            mistakes.length === 0 ? (
              <div className="rounded-xl border border-[#E7E3DA] bg-white px-6 py-14 text-center">
                <h2 className="text-[20px] font-medium tracking-[-0.01em] text-[#1A1A17]">
                  No mistakes saved yet
                </h2>
                <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-[#56524B]">
                  Mistakes are how Ivvy learns where you&apos;re weak. Your
                  first practice session will start filling this queue.
                </p>
                <button
                  type="button"
                  onClick={() => selectMode("practice")}
                  className={`${PRIMARY} mt-6`}
                >
                  Start practice
                </button>
              </div>
            ) : dueQueue.length === 0 ? (
              <div className="rounded-xl border border-[#E7E3DA] bg-white px-6 py-14 text-center">
                <h2 className="text-[20px] font-medium tracking-[-0.01em] text-[#1A1A17]">
                  {reviewedCount > 0
                    ? "You're caught up for this sitting."
                    : "Nothing due right now"}
                </h2>
                <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-[#56524B]">
                  {reviewedCount > 0
                    ? `You reviewed ${reviewedCount} mistake${
                        reviewedCount === 1 ? "" : "s"
                      } this sitting. Next review is set. `
                    : ""}
                  Every saved mistake is scheduled to come back before your
                  exam.
                </p>
                <button
                  type="button"
                  onClick={() => selectMode("practice")}
                  className={`${PRIMARY} mt-6`}
                >
                  Practice your weakest topic
                </button>
              </div>
            ) : currentMistake ? (
              <div className="space-y-5 rounded-xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A766D]">
                    Review · {currentMistake.topicName}
                  </span>
                  {dangerousIds.has(currentMistake.id) ? (
                    <span className="inline-flex items-center rounded-full bg-[#F6EAE4] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9C4126]">
                      High risk
                    </span>
                  ) : null}
                  {currentMistake.reviewCount > 0 ? (
                    <span className="text-xs text-[#9B968D]">
                      Seen {currentMistake.reviewCount} time
                      {currentMistake.reviewCount === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>

                {dangerousIds.has(currentMistake.id) ? (
                  <p className="text-sm text-[#9C4126]">
                    You felt certain, but missed this last time.
                  </p>
                ) : null}

                {currentMistake.question.trim() ? (
                  <div>
                    <p className="text-xs font-medium text-[#56524B]">
                      Question
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-[#1A1A17]">
                      {currentMistake.question}
                    </p>
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="try-again"
                    className="mb-2 block text-xs font-medium text-[#56524B]"
                  >
                    Answer it again
                  </label>
                  <textarea
                    id="try-again"
                    rows={4}
                    value={tryAgainAnswer}
                    onChange={(event) => setTryAgainAnswer(event.target.value)}
                    placeholder="Write your answer before checking the approach…"
                    className={FIELD}
                  />
                </div>

                {!approachRevealed ? (
                  <>
                    <div>
                      <p className="mb-2 text-xs font-medium text-[#56524B]">
                        Before you check, how sure are you?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {CONFIDENCE_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={reviewConfidence === value}
                            onClick={() =>
                              setReviewConfidence((prev) =>
                                prev === value ? null : value
                              )
                            }
                            className={
                              reviewConfidence === value ? CHIP_ON : CHIP_OFF
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-[#EFEBE2] pt-4">
                      <button
                        type="button"
                        onClick={() => canReveal && setApproachRevealed(true)}
                        disabled={!canReveal}
                        className={PRIMARY}
                      >
                        Check my answer
                      </button>
                      {dueQueue.length > 1 ? (
                        <button
                          type="button"
                          onClick={handleSkip}
                          className={CHIP_OFF}
                        >
                          Skip for now
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 border-t border-[#EFEBE2] pt-4">
                    {currentMistake.studentAnswer.trim() ? (
                      <div>
                        <p className="text-xs font-medium text-[#56524B]">
                          Your original answer
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#56524B]">
                          {currentMistake.studentAnswer}
                        </p>
                      </div>
                    ) : null}

                    <div>
                      <p className="text-xs font-medium text-[#56524B]">
                        Better approach
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-[#1A1A17]">
                        {currentMistake.correctApproach.trim()
                          ? currentMistake.correctApproach
                          : "No better approach was saved for this mistake."}
                      </p>
                    </div>

                    {currentMistake.rememberThis.trim() ? (
                      <div>
                        <p className="text-xs font-medium text-[#56524B]">
                          Remember this
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#1A1A17]">
                          {currentMistake.rememberThis}
                        </p>
                      </div>
                    ) : null}

                    <div>
                      <p className="mb-2 text-xs font-medium text-[#56524B]">
                        How did that go?
                      </p>
                      <div className="grid gap-2 sm:grid-cols-4">
                        {RATINGS.map(({ rating, label }) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleGrade(rating)}
                            className="rounded-md border border-[#D8D3C8] px-3 py-2.5 text-left transition-colors hover:border-[#1E4634] hover:bg-[#EAF0EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2"
                          >
                            <span className="block text-sm font-medium text-[#1A1A17]">
                              {label}
                            </span>
                            <span className="mt-0.5 block text-xs text-[#7A766D]">
                              back{" "}
                              {dueDeltaLabel(
                                previewNextDue(currentMistake.schedule, rating)
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null
          ) : (
            /* ── ASK / LEARN / PRACTICE — the training thread ── */
            <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-xl border border-[#E7E3DA] bg-white">
              {showBriefing ? (
                /* Session briefing — never an empty chat box */
                <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10">
                  <p className={LABEL}>Today&apos;s session</p>
                  {hasMaterials ? (
                    <>
                      <h2 className="mt-3 max-w-md text-[20px] font-medium leading-snug tracking-[-0.01em] text-[#1A1A17]">
                        {dueCount > 0
                          ? `${dueCount} review${
                              dueCount === 1 ? " is" : "s are"
                            } due${
                              highRiskDueCount > 0
                                ? `, ${highRiskDueCount} of them high-risk`
                                : ""
                            }.`
                          : `Ready to train on ${project.subject}.`}
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#56524B]">
                        {dueCount > 0
                          ? "Reviews come first; they fade if they wait. After that, Ivvy trains your weakest topic."
                          : `Ivvy asks one question at a time${
                              effectiveTopicName
                                ? `, starting with ${effectiveTopicName}`
                                : ""
                            }, saves what you miss, and brings it back when it's due.`}
                      </p>
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        {dueCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => selectMode("review")}
                            className={PRIMARY}
                          >
                            Start today&apos;s session
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleBegin}
                            disabled={isSending}
                            className={PRIMARY}
                          >
                            {isSending ? "Starting…" : "Start today's session"}
                          </button>
                        )}
                        {dueCount > 0 ? (
                          <button
                            type="button"
                            onClick={handleBegin}
                            disabled={isSending}
                            className={CHIP_OFF}
                          >
                            {isSending ? "Starting…" : `Skip to ${mode}`}
                          </button>
                        ) : null}
                        {messages.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setContinuePreviousThread(true)}
                            className={CHIP_OFF}
                          >
                            Continue previous thread
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-3 max-w-md text-[20px] font-medium leading-snug tracking-[-0.01em] text-[#1A1A17]">
                        I don&apos;t have your materials yet.
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#56524B]">
                        I can answer general questions in Ask, but real
                        coaching starts from your notes.
                      </p>
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link href={`${base}/materials`} className={PRIMARY}>
                          Upload materials
                        </Link>
                        {mode === "ask" ? (
                          <button
                            type="button"
                            onClick={handleBegin}
                            disabled={isSending}
                            className={CHIP_OFF}
                          >
                            Ask anyway
                          </button>
                        ) : null}
                        {messages.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setContinuePreviousThread(true)}
                            className={CHIP_OFF}
                          >
                            Continue previous thread
                          </button>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <MessageThread messages={messages} agentLabel="Ivvy" />
              )}

              {/* Composer */}
              <div className="space-y-3 border-t border-[#E7E3DA] p-4">
                {showConfidence ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#7A766D]">
                      How sure are you?
                    </span>
                    {CONFIDENCE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={confidence === value}
                        onClick={() =>
                          setConfidence((prev) =>
                            prev === value ? null : value
                          )
                        }
                        disabled={isSending}
                        className={confidence === value ? CHIP_ON : CHIP_OFF}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {mode === "learn" && messages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void handleSend(
                          "Let me teach it back. Ask me to explain the current concept in my own words, then assess my explanation."
                        )
                      }
                      disabled={isSending}
                      className={CHIP_OFF}
                    >
                      Teach it back
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handleSend("Give me a worked example from my materials.")
                      }
                      disabled={isSending}
                      className={CHIP_OFF}
                    >
                      Worked example
                    </button>
                  </div>
                ) : null}
                {mode === "practice" && messages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSend("Next question.")}
                      disabled={isSending}
                      className={CHIP_OFF}
                    >
                      Next question
                    </button>
                    {mode === "practice" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handleSend(
                            "I'm stuck. Give me a hint, not the full answer."
                          )
                        }
                        disabled={isSending}
                        className={CHIP_OFF}
                      >
                        Hint
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <SessionInput
                  value={input}
                  onChange={setInput}
                  onSubmit={() => void handleSend(input)}
                  disabled={isSending}
                />
                {isSending ? (
                  <p className="text-xs text-[#9B968D]" role="status">
                    Ivvy is thinking…
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* ── Context rail: what Ivvy knows right now ── */}
        <aside className="hidden space-y-4 lg:block">
          <section className="rounded-xl border border-[#E7E3DA] bg-white p-5">
            <p className={LABEL}>Focus</p>
            {topics.length > 0 ? (
              <>
                <label htmlFor="coach-topic" className="sr-only">
                  Topic focus
                </label>
                <select
                  id="coach-topic"
                  value={activeTopicName ?? ""}
                  onChange={(event) =>
                    setActiveTopicName(
                      event.target.value === "" ? null : event.target.value
                    )
                  }
                  className="mt-2.5 h-10 w-full rounded-lg border border-[#D8D3C8] bg-white px-3 text-sm text-[#1A1A17] transition-colors focus-visible:outline-none focus-visible:border-[#1E4634] focus-visible:ring-2 focus-visible:ring-[#1E4634]/15"
                >
                  <option value="">All topics</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                {activeTopicMistakes ? (
                  <p className="mt-2.5 text-xs leading-relaxed text-[#56524B]">
                    {activeTopicMistakes.total === 0
                      ? "No mistakes here yet."
                      : `${activeTopicMistakes.total} mistake${
                          activeTopicMistakes.total === 1 ? "" : "s"
                        } here · ${activeTopicMistakes.due} due${
                          activeTopicMistakes.highRisk > 0
                            ? ` · ${activeTopicMistakes.highRisk} high-risk`
                            : ""
                        }`}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2.5 text-sm leading-relaxed text-[#56524B]">
                No topics yet. Upload materials and Ivvy will map them.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-[#E7E3DA] bg-white p-5">
            <p className={LABEL}>Sources</p>
            {materialsWithContent.length > 0 ? (
              <>
                <ul className="mt-2.5 space-y-1.5">
                  {materialsWithContent.slice(0, 3).map((material) => (
                    <li
                      key={material.id}
                      className="truncate text-sm text-[#1A1A17]"
                    >
                      {material.fileName ?? material.title}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${base}/materials`}
                  className="mt-2.5 inline-block text-xs font-medium text-[#1E4634] underline-offset-2 hover:underline"
                >
                  {materialsWithContent.length > 3
                    ? `All ${materialsWithContent.length} materials`
                    : "Open Materials"}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2.5 text-sm leading-relaxed text-[#56524B]">
                  Nothing uploaded yet. Ivvy coaches from your materials.
                </p>
                <Link
                  href={`${base}/materials`}
                  className="mt-2.5 inline-block text-xs font-medium text-[#1E4634] underline-offset-2 hover:underline"
                >
                  Upload materials
                </Link>
              </>
            )}
          </section>

          <section className="rounded-xl border border-[#E7E3DA] bg-white p-5">
            <p className={LABEL}>Ivvy remembers</p>
            {mistakes.length > 0 ? (
              <p className="mt-2.5 text-sm leading-relaxed text-[#56524B]">
                <span className="font-medium tabular-nums text-[#1A1A17]">
                  {mistakes.length}
                </span>{" "}
                saved mistake{mistakes.length === 1 ? "" : "s"} ·{" "}
                {dueCount > 0 ? (
                  <>
                    <span className="tabular-nums">{dueCount}</span> due
                  </>
                ) : reviewedCount > 0 && totalDueCount > 0 ? (
                  "caught up this sitting"
                ) : (
                  <>
                    <span className="tabular-nums">0</span> due
                  </>
                )}
                {highRiskDueCount > 0 ? (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-medium text-[#9C4126]">
                      {highRiskDueCount} high-risk
                    </span>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="mt-2.5 text-sm leading-relaxed text-[#56524B]">
                No mistakes yet. Miss a question and it lands here, scheduled
                to come back.
              </p>
            )}
            {mode !== "review" && dueCount > 0 ? (
              <button
                type="button"
                onClick={() => selectMode("review")}
                className="mt-2.5 text-xs font-medium text-[#1E4634] underline-offset-2 hover:underline"
              >
                Open review queue
              </button>
            ) : null}
          </section>

          {mode === "review" && currentMistake?.schedule?.due ? (
            <section className="rounded-xl border border-[#E7E3DA] bg-white p-5">
              <p className={LABEL}>This card</p>
              <p className="mt-2.5 text-sm leading-relaxed text-[#56524B]">
                Was due {formatDueDate(currentMistake.schedule.due)}. Grading
                it schedules the next return.
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </ProjectShell>
  );
}

export default function CoachPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <Suspense fallback={<CenteredNotice>Loading Coach…</CenteredNotice>}>
      <CoachContent projectId={params.projectId} />
    </Suspense>
  );
}
