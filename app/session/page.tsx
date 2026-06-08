"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ActionButtons from "@/components/session/ActionButtons";
import MessageThread from "@/components/session/MessageThread";
import SessionInput from "@/components/session/SessionInput";
import SessionSummaryModal from "@/components/session/SessionSummaryModal";
import SessionTopBar from "@/components/session/SessionTopBar";
import { useExam } from "@/hooks/useExam";
import { useSessions } from "@/hooks/useSessions";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { useTopics } from "@/hooks/useTopics";
import {
  createOpeningMessage,
  getMockAgentReply,
} from "@/lib/mock-agent";
import type {
  Message,
  SessionMode,
  SessionSummary,
  SessionType,
  StudySession,
  Topic,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

function sessionTypeToMode(sessionType: SessionType): SessionMode {
  switch (sessionType) {
    case "learn":
      return "learn";
    case "quiz":
      return "quiz";
    case "review":
      return "review";
    case "exam-sim":
      return "exam";
  }
}

function parseSessionDay(dayParam: string | null): number | null {
  if (!dayParam || !/^\d+$/.test(dayParam)) return null;
  const day = Number(dayParam);
  return Number.isSafeInteger(day) && day > 0 ? day : null;
}

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dayParam = searchParams.get("day");

  const { exam, isLoaded: examLoaded } = useExam();
  const { studyPlan, saveStudyPlanState, isLoaded: planLoaded } =
    useStudyPlan();
  const { topics, isLoaded: topicsLoaded } = useTopics();
  const {
    findSession,
    saveSessionState,
    isLoaded: sessionsLoaded,
  } = useSessions();

  const [session, setSession] = useState<StudySession | null>(null);
  const sessionRef = useRef<StudySession | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null
  );

  const isLoaded =
    examLoaded && planLoaded && topicsLoaded && sessionsLoaded;

  const dayNumber = useMemo(() => parseSessionDay(dayParam), [dayParam]);

  const dailyPlan = useMemo(() => {
    if (!studyPlan || dayNumber === null) return null;
    return studyPlan.days.find((d) => d.day === dayNumber) ?? null;
  }, [studyPlan, dayNumber]);

  const sessionTopics = useMemo((): Topic[] => {
    if (!dailyPlan) return [];
    return dailyPlan.topicIds
      .map((id) => topics.find((t) => t.id === id))
      .filter((t): t is Topic => Boolean(t));
  }, [dailyPlan, topics]);

  const topicNames = useMemo(
    () => sessionTopics.map((t) => t.name),
    [sessionTopics]
  );

  const persistSession = useCallback(
    (updated: StudySession): boolean => {
      const saved = saveSessionState(updated);
      if (!saved) {
        setSessionError("This session could not be saved. Please try again.");
        return false;
      }
      setSessionError(null);
      sessionRef.current = updated;
      setSession(updated);
      return true;
    },
    [saveSessionState]
  );

  const updatePlanWithSession = useCallback(
    (sessionId: string, completed = false): boolean => {
      if (!studyPlan || !dailyPlan) return false;
      const updatedDays = studyPlan.days.map((d) =>
        d.day === dailyPlan.day
          ? { ...d, sessionId, completed: completed || d.completed }
          : d
      );
      return saveStudyPlanState({ ...studyPlan, days: updatedDays });
    },
    [studyPlan, dailyPlan, saveStudyPlanState]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!exam || !studyPlan || !dailyPlan || sessionTopics.length === 0) return;
    if (
      sessionRef.current?.examId === exam.id &&
      sessionRef.current.day === dailyPlan.day
    ) {
      return;
    }

    const existing = findSession(exam.id, dailyPlan.day);

    if (existing) {
      sessionRef.current = existing;
      setSession(existing);
      setSummaryOpen(false);
      setInputValue("");
      if (existing.summary) {
        setSessionSummary(existing.summary);
      } else {
        setSessionSummary(null);
      }
      const planNeedsUpdate =
        dailyPlan.sessionId !== existing.id ||
        (Boolean(existing.endedAt) && !dailyPlan.completed);
      if (
        planNeedsUpdate &&
        !updatePlanWithSession(existing.id, Boolean(existing.endedAt))
      ) {
        setSessionError(
          "The session was restored, but the study plan could not be updated."
        );
      } else {
        setSessionError(null);
      }
      return;
    }

    const mode = sessionTypeToMode(dailyPlan.sessionType);
    const names = sessionTopics.map((topic) => topic.name);

    const openingMessage = createOpeningMessage({
      mode,
      topicNames: names,
    });

    const newSession: StudySession = {
      id: generateId(),
      examId: exam.id,
      day: dailyPlan.day,
      date: dailyPlan.date,
      topicIds: dailyPlan.topicIds,
      mode,
      messages: [openingMessage],
      startedAt: new Date().toISOString(),
      endedAt: null,
      summary: null,
    };

    const saved = saveSessionState(newSession);
    if (!saved) {
      setSessionError("This session could not be created. Please try again.");
      return;
    }
    sessionRef.current = newSession;
    if (!updatePlanWithSession(newSession.id)) {
      setSessionError("The session was saved, but the study plan could not be updated.");
    } else {
      setSessionError(null);
    }
    setSessionSummary(null);
    setSummaryOpen(false);
    setInputValue("");
    setSession(newSession);
  }, [
    isLoaded,
    exam,
    studyPlan,
    dailyPlan,
    sessionTopics,
    findSession,
    saveSessionState,
    updatePlanWithSession,
  ]);

  const isEnded = Boolean(session?.endedAt);

  function appendMessages(
    studentContent: string,
    actionInstruction: string | null
  ): boolean {
    const currentSession = sessionRef.current;
    if (!currentSession || currentSession.endedAt) return false;

    const studentMessage: Message = {
      id: generateId(),
      role: "student",
      content: studentContent,
      mode: currentSession.mode,
      flaggedMistake: false,
      timestamp: new Date().toISOString(),
    };

    const agentReply = getMockAgentReply({
      mode: currentSession.mode,
      topicNames,
      lastUserMessage: actionInstruction ? null : studentContent,
      actionInstruction,
      messageCount: currentSession.messages.length + 1,
    });

    const updated: StudySession = {
      ...currentSession,
      messages: [...currentSession.messages, studentMessage, agentReply],
    };

    return persistSession(updated);
  }

  function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || !session || isEnded) return;
    if (appendMessages(trimmed, null)) {
      setInputValue("");
    }
  }

  function handleAction(instruction: string) {
    if (!session || isEnded) return;
    const label = instruction.split(".")[0];
    appendMessages(label, instruction);
  }

  function handleEndSession() {
    const currentSession = sessionRef.current;
    if (!currentSession || currentSession.endedAt || !dailyPlan || !studyPlan) {
      return;
    }

    const mistakeCount = currentSession.messages.filter(
      (m) => m.role === "agent" && m.flaggedMistake
    ).length;
    const nextDay = studyPlan.days.find((day) => day.day === dailyPlan.day + 1);

    const summary: SessionSummary = {
      topicsCovered: topicNames,
      masteryChanges: [],
      newMistakeCount: mistakeCount,
      mistakesReviewed: 0,
      tomorrowFocus:
        "Review today's weakest topic before starting new material.",
      tomorrowSessionType: nextDay?.sessionType ?? dailyPlan.sessionType,
    };

    const updated: StudySession = {
      ...currentSession,
      endedAt: new Date().toISOString(),
      summary,
    };

    const saved = persistSession(updated);
    if (!saved) return;
    if (!updatePlanWithSession(currentSession.id, true)) {
      setSessionError("The session ended, but the study plan could not be updated.");
    }
    setSessionSummary(summary);
    setSummaryOpen(true);
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading session...</p>
      </main>
    );
  }

  if (!exam || !studyPlan || topics.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm text-neutral-600 mb-4">
            Setup is incomplete.
          </p>
          <Link
            href="/setup"
            className="inline-block bg-black text-white text-sm px-4 py-2 rounded hover:bg-neutral-800"
          >
            Back to setup
          </Link>
        </div>
      </main>
    );
  }

  if (dayNumber === null || !dailyPlan) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm text-neutral-600 mb-4">
            Session day not found.
          </p>
          <Link
            href="/plan"
            className="inline-block bg-black text-white text-sm px-4 py-2 rounded hover:bg-neutral-800"
          >
            Back to plan
          </Link>
        </div>
      </main>
    );
  }

  if (sessionTopics.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm text-neutral-600 mb-4">
            This session&apos;s topics are missing. Set up your exam again.
          </p>
          <Link
            href="/setup"
            className="inline-block bg-black text-white text-sm px-4 py-2 rounded hover:bg-neutral-800"
          >
            Back to setup
          </Link>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm text-neutral-600 mb-4">
            {sessionError ?? "Preparing session..."}
          </p>
          {sessionError && (
            <Link
              href="/plan"
              className="inline-block bg-black text-white text-sm px-4 py-2 rounded hover:bg-neutral-800"
            >
              Back to plan
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-white">
      <SessionTopBar
        day={dailyPlan.day}
        sessionType={dailyPlan.sessionType}
        topicNames={topicNames}
        startedAt={session.startedAt}
        backHref="/plan"
      />

      <MessageThread messages={session.messages} />

      <div className="border-t border-neutral-200 px-4 py-3 space-y-3 shrink-0">
        {sessionError && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {sessionError}
          </p>
        )}
        {isEnded ? (
          <p className="text-sm text-neutral-500 text-center">
            Session ended.{" "}
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              className="underline hover:text-black"
            >
              View summary
            </button>
          </p>
        ) : (
          <>
            <ActionButtons onAction={handleAction} />
            <SessionInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSend}
            />
            <button
              type="button"
              onClick={handleEndSession}
              className="w-full border border-neutral-300 text-sm py-2 rounded hover:border-black text-neutral-700"
            >
              End Session
            </button>
          </>
        )}
      </div>

      <SessionSummaryModal
        open={summaryOpen}
        summary={sessionSummary}
        onClose={() => setSummaryOpen(false)}
        onBackToPlan={() => router.push("/plan")}
      />
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-neutral-600">Loading...</p>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
