"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ProjectShell from "@/components/project/ProjectShell";
import { useProject } from "@/hooks/useProject";
import { useProjectGoals } from "@/hooks/useProjectGoals";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { useTrainingLog } from "@/hooks/useTrainingLog";
import {
  buildProjectContextMessage,
  buildTrainingSessionSystemPrompt,
  type ProjectChatContext,
  type TrainingMode,
} from "@/lib/project-prompts";
import {
  createProjectMistakeFromChat,
  getProjectMistakes,
  saveProjectMistake,
} from "@/lib/project-storage";
import type {
  ChatMessage,
  Material,
  Mistake,
  MistakeCategory,
  StudyProject,
  Topic,
} from "@/lib/types";
import { daysUntilExam } from "@/lib/utils";

const DEFAULT_QUESTION_COUNT = 5;
const MAX_QUESTION_COUNT = 8;

const PRIMARY_ACTION =
  "inline-flex h-10 items-center justify-center rounded-full bg-[#1A1A17] px-6 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const OUTLINE_ACTION =
  "inline-flex h-10 items-center justify-center rounded-full border border-[#D8D3C8] px-5 text-sm font-medium text-[#1A1A17] transition-colors hover:bg-[#EFEBE2] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

type ApiMessage = { role: "user" | "assistant"; content: string };

type AgentResponse = {
  reply: string;
  flaggedMistake: boolean;
  mistakeCategory: MistakeCategory;
};

type SessionStatus = "setup" | "active" | "complete";

type CompletedRound = {
  question: string;
  answer: string;
  feedback: string;
  mistakeSaved: boolean;
};

function toApiMessages(messages: ApiMessage[]): ApiMessage[] {
  let recent = messages.slice(-10);
  while (recent.length > 0 && recent[0].role === "assistant") {
    recent = recent.slice(1);
  }
  return recent;
}

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

// A timed-out fetch rejects with an AbortError (DOMException extends Error).
function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

const TIMEOUT_MESSAGE =
  "Ivvy timed out after 30 seconds. Try again, or end the session.";

const TRAINING_MODES: { value: TrainingMode; label: string; hint: string }[] = [
  {
    value: "written",
    label: "Written answer",
    hint: "Short exam-style written responses.",
  },
  {
    value: "multiple-choice",
    label: "Multiple choice",
    hint: "Pick from A–D options.",
  },
  {
    value: "solve",
    label: "Solve / calculate",
    hint: "Work through a calculation or problem.",
  },
];

type ParsedChoice = { letter: string; text: string };
type ParsedMultipleChoice = { stem: string; options: ParsedChoice[] };

// Matches lines like "A) text", "(B) text", "C. text", "D - text".
const OPTION_LINE = /^\s*\(?([A-Da-d])[).:\-]\s+(.*\S)\s*$/;

// Parse an A/B/C/D multiple-choice question only when it is clearly formatted.
// Returns null on any uncertainty so the UI safely falls back to text input.
function parseMultipleChoice(reply: string): ParsedMultipleChoice | null {
  const stemLines: string[] = [];
  const options: ParsedChoice[] = [];
  let inOptions = false;

  for (const line of reply.split("\n")) {
    const match = line.match(OPTION_LINE);
    if (match) {
      inOptions = true;
      options.push({ letter: match[1].toUpperCase(), text: match[2].trim() });
    } else if (!inOptions) {
      stemLines.push(line);
    }
  }

  const letters = options.map((option) => option.letter);
  const isExactABCD =
    options.length === 4 &&
    ["A", "B", "C", "D"].every((letter, index) => letters[index] === letter);
  if (!isExactABCD) return null;
  if (options.some((option) => option.text.length === 0)) return null;

  const stem = stemLines.join("\n").trim();
  if (!stem) return null;

  return { stem, options };
}

function getRecentUnreviewedMistakes(mistakes: Mistake[]) {
  return mistakes
    .filter((mistake) => !mistake.reviewed)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3)
    .map((mistake) => ({
      topicName: mistake.topicName,
      mistakeCategory: mistake.mistakeCategory,
      question: mistake.question,
      studentAnswer: mistake.studentAnswer,
    }));
}

function buildTrainingContext(
  project: StudyProject,
  topics: Topic[],
  materials: Material[],
  mistakes: Mistake[],
  activeTopicName: string | null
): ProjectChatContext {
  const topicNameById = new Map(topics.map((topic) => [topic.id, topic.name]));

  return {
    projectName: project.name,
    subject: project.subject,
    examDate: project.examDate,
    daysRemaining: daysUntilExam(project.examDate),
    targetGrade: project.targetGrade,
    topics: topics.map((topic) => ({ name: topic.name })),
    activeTopic: activeTopicName,
    materials: materials
      .filter((material) => material.content.trim().length > 0)
      .map((material) => ({
        topicName: topicNameById.get(material.topicId) ?? "Unknown topic",
        content: material.content.trim(),
        fileName: material.fileName,
      })),
    recentUnreviewedMistakes: getRecentUnreviewedMistakes(mistakes),
  };
}

function syntheticMessage(
  role: ChatMessage["role"],
  content: string
): ChatMessage {
  return {
    id: generateId(),
    role,
    content,
    flaggedMistake: false,
    timestamp: new Date().toISOString(),
  };
}

function ActiveTrainingContent({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams();
  const requestedTopic = searchParams.get("topic");
  const { project, topics, isLoaded: projectLoaded } = useProject(projectId);
  const { materials, isLoaded: materialsLoaded } = useProjectMaterials(projectId);
  const { goals, isLoaded: goalsLoaded } = useProjectGoals(projectId);
  const { logSession, isLoaded: logLoaded } = useTrainingLog(projectId);

  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [mistakesLoaded, setMistakesLoaded] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [selectionInitialized, setSelectionInitialized] = useState(false);
  const [questionTarget, setQuestionTarget] = useState(DEFAULT_QUESTION_COUNT);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("written");
  const [status, setStatus] = useState<SessionStatus>("setup");
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rounds, setRounds] = useState<CompletedRound[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState("");
  const [summaryDuration, setSummaryDuration] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const loggedRef = useRef(false);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    setMistakes(getProjectMistakes(projectId));
    setMistakesLoaded(true);
  }, [projectId]);

  const recommendedTopicId = useMemo(() => {
    const requested = topics.find(
      (topic) => topic.id === requestedTopic || topic.name === requestedTopic
    );
    if (requested) return requested.id;

    const focusTopicIds = goals?.focusTopicIds ?? [];
    const focusTopic = topics.find((topic) => focusTopicIds.includes(topic.id));
    if (focusTopic) return focusTopic.id;

    const weakest = topics
      .map((topic) => ({
        topicId: topic.id,
        count: mistakes.filter(
          (mistake) => mistake.topicId === topic.id && !mistake.reviewed
        ).length,
      }))
      .sort((a, b) => b.count - a.count)[0];
    if (weakest && weakest.count > 0) return weakest.topicId;

    const materialTopicIds = new Set(
      materials
        .filter((material) => material.content.trim().length > 0)
        .map((material) => material.topicId)
    );
    return (
      topics.find((topic) => materialTopicIds.has(topic.id))?.id ??
      topics[0]?.id ??
      ""
    );
  }, [goals, materials, mistakes, requestedTopic, topics]);

  useEffect(() => {
    if (
      selectionInitialized ||
      !projectLoaded ||
      !materialsLoaded ||
      !goalsLoaded ||
      !mistakesLoaded
    ) {
      return;
    }
    setSelectedTopicId(recommendedTopicId);
    setSelectionInitialized(true);
  }, [
    goalsLoaded,
    materialsLoaded,
    mistakesLoaded,
    projectLoaded,
    recommendedTopicId,
    selectionInitialized,
  ]);

  const selectedTopic =
    topics.find((topic) => topic.id === selectedTopicId) ?? null;
  const isLoaded =
    projectLoaded && materialsLoaded && goalsLoaded && logLoaded && mistakesLoaded;

  // Only attempt to parse choices in multiple-choice mode; null = text fallback.
  const parsedChoices = useMemo(
    () =>
      trainingMode === "multiple-choice"
        ? parseMultipleChoice(currentQuestion)
        : null,
    [trainingMode, currentQuestion]
  );

  const requestAgent = useCallback(
    async (nextMessages: ApiMessage[]): Promise<AgentResponse> => {
      if (!project) throw new Error("Project not found");
      const context = buildTrainingContext(
        project,
        topics,
        materials,
        mistakes,
        selectedTopic?.name ?? null
      );
      // Abort the request if it hangs so the user can never be trapped waiting.
      // Matches the 30s pattern used in app/session/page.tsx and app/review/page.tsx.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: toApiMessages(nextMessages),
            systemPrompt: buildTrainingSessionSystemPrompt(trainingMode),
            contextMessage: buildProjectContextMessage(context),
          }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Ivvy could not respond");
        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("reply" in data) ||
          typeof data.reply !== "string" ||
          !("flaggedMistake" in data) ||
          typeof data.flaggedMistake !== "boolean" ||
          !("mistakeCategory" in data) ||
          (data.mistakeCategory !== "conceptual" &&
            data.mistakeCategory !== "calculation" &&
            data.mistakeCategory !== "recall" &&
            data.mistakeCategory !== "application")
        ) {
          throw new Error("Ivvy returned an invalid response");
        }

        return {
          reply: data.reply,
          flaggedMistake: data.flaggedMistake,
          mistakeCategory: data.mistakeCategory,
        };
      } finally {
        // Cleared on success, validation failure, and abort alike.
        clearTimeout(timeoutId);
      }
    },
    [materials, mistakes, project, selectedTopic?.name, topics, trainingMode]
  );

  const finishSession = useCallback(
    (answeredCount: number) => {
      if (loggedRef.current || startedAtRef.current === null) return;
      loggedRef.current = true;
      const elapsedMinutes = Math.max(
        1,
        Math.ceil((Date.now() - startedAtRef.current) / 60_000)
      );
      setSummaryDuration(elapsedMinutes);
      logSession({
        type: "trained-chat",
        topicId: selectedTopic?.id ?? null,
        durationMinutes: elapsedMinutes,
        note: `Active training session: ${answeredCount} question${
          answeredCount === 1 ? "" : "s"
        }`,
        confidenceAfter: null,
      });
      setStatus("complete");
      setError("");
    },
    [logSession, selectedTopic?.id]
  );

  const askQuestion = useCallback(
    async (instruction: string, baseMessages: ApiMessage[]) => {
      if (requestInFlightRef.current) return;
      requestInFlightRef.current = true;
      setIsRequesting(true);
      setError("");
      try {
        const nextMessages = [
          ...baseMessages,
          { role: "user" as const, content: instruction },
        ];
        const result = await requestAgent(nextMessages);
        setMessages([
          ...nextMessages,
          { role: "assistant", content: result.reply },
        ]);
        setCurrentQuestion(result.reply);
        setFeedback("");
        setAnswer("");
      } catch (err) {
        setError(
          isAbortError(err)
            ? TIMEOUT_MESSAGE
            : "Ivvy could not load the next question. Try again."
        );
      } finally {
        requestInFlightRef.current = false;
        setIsRequesting(false);
      }
    },
    [requestAgent]
  );

  function handleStart() {
    if (requestInFlightRef.current) return;
    startedAtRef.current = Date.now();
    loggedRef.current = false;
    setStatus("active");
    setMessages([]);
    setRounds([]);
    void askQuestion(
      `Begin a guided session of ${questionTarget} questions. Ask question 1 now.`,
      []
    );
  }

  async function submitAnswer(rawAnswer: string) {
    const trimmed = rawAnswer.trim();
    if (!trimmed || !currentQuestion || requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    setIsRequesting(true);
    setError("");
    try {
      const nextMessages: ApiMessage[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      const result = await requestAgent(nextMessages);
      const withFeedback: ApiMessage[] = [
        ...nextMessages,
        { role: "assistant", content: result.reply },
      ];

      let mistakeSaved = false;
      if (result.flaggedMistake) {
        const questionMessage = syntheticMessage("agent", currentQuestion);
        const answerMessage = syntheticMessage("student", trimmed);
        mistakeSaved = saveProjectMistake(
          projectId,
          createProjectMistakeFromChat({
            projectId,
            studentAnswer: trimmed,
            agentReply: result.reply,
            mistakeCategory: result.mistakeCategory,
            topics,
            activeTopicName: selectedTopic?.name ?? null,
            messagesBeforeAgent: [questionMessage, answerMessage],
          })
        );
        if (mistakeSaved) setMistakes(getProjectMistakes(projectId));
      }

      const nextRounds = [
        ...rounds,
        {
          question: currentQuestion,
          answer: trimmed,
          feedback: result.reply,
          mistakeSaved,
        },
      ];
      setMessages(withFeedback);
      setRounds(nextRounds);
      setFeedback(result.reply);
      setAnswer("");

      if (nextRounds.length >= questionTarget) {
        finishSession(nextRounds.length);
      }
    } catch (err) {
      setError(
        isAbortError(err)
          ? TIMEOUT_MESSAGE
          : "Ivvy could not evaluate that answer. Try again."
      );
    } finally {
      requestInFlightRef.current = false;
      setIsRequesting(false);
    }
  }

  function handleAnswer(event: FormEvent) {
    event.preventDefault();
    void submitAnswer(answer);
  }

  function handleSelectChoice(choice: ParsedChoice) {
    // Send the chosen option plus its text so feedback is grounded.
    void submitAnswer(`${choice.letter}) ${choice.text}`);
  }

  function handleNextQuestion() {
    void askQuestion(
      `Ask question ${rounds.length + 1} of ${questionTarget} now. Ask exactly one question.`,
      messages
    );
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F4]">
        <p className="text-sm text-[#56524B]">Loading active training...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#FAF8F4]">
        <div className="mx-auto max-w-lg px-4 py-12">
          <h1 className="text-[28px] font-semibold text-[#1A1A17]">
            Project not found
          </h1>
          <Link href="/projects" className={`${OUTLINE_ACTION} mt-5`}>
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  const savedMistakes = rounds.filter((round) => round.mistakeSaved).length;

  return (
    <ProjectShell projectId={projectId} active="coach" width="max-w-3xl">
        <header className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]">
            Train
          </p>
          <h1 className="mt-2.5 font-serif text-[34px] leading-[1.08] tracking-[-0.01em] text-[#1A1A17] sm:text-[40px]">
            Active training
          </h1>
          <p className="mt-3.5 text-[15px] leading-relaxed text-[#56524B]">
            Work through a short guided session, one exam-style question at a
            time.
          </p>
        </header>

        {status === "setup" ? (
          <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#1A1A17]">
              Set your focus
            </h2>
            <p className="mt-1 text-sm text-[#56524B]">
              Ivvy recommends a focus using your goals, materials, and
              unreviewed mistakes.
            </p>

            <label className="mt-5 block space-y-1.5">
              <span className="text-sm font-medium text-[#1A1A17]">
                Focus topic
              </span>
              <select
                value={selectedTopicId}
                onChange={(event) => setSelectedTopicId(event.target.value)}
                className="h-12 w-full rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15"
              >
                <option value="">General exam training</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block space-y-1.5">
              <span className="text-sm font-medium text-[#1A1A17]">
                Session length
              </span>
              <select
                value={questionTarget}
                onChange={(event) => {
                  const requestedCount = Number(event.target.value);
                  setQuestionTarget(
                    Number.isFinite(requestedCount)
                      ? Math.min(
                          MAX_QUESTION_COUNT,
                          Math.max(1, Math.floor(requestedCount))
                        )
                      : DEFAULT_QUESTION_COUNT
                  );
                }}
                className="h-12 w-full rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15"
              >
                <option value={3}>3 questions</option>
                <option value={DEFAULT_QUESTION_COUNT}>5 questions</option>
                <option value={MAX_QUESTION_COUNT}>8 questions</option>
              </select>
            </label>

            <fieldset className="mt-5">
              <legend className="text-sm font-medium text-[#1A1A17]">
                Training mode
              </legend>
              <p className="mt-1 text-sm text-[#56524B]">
                Choose how Ivvy should format its questions.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {TRAINING_MODES.map((mode) => {
                  const isSelected = trainingMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setTrainingMode(mode.value)}
                      className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 ${
                        isSelected
                          ? "border-[#1A1A17] bg-[#EFEBE2]"
                          : "border-[#D8D3C8] bg-white hover:bg-[#FAF8F4]"
                      }`}
                    >
                      <span className="block text-sm font-medium text-[#1A1A17]">
                        {mode.label}
                      </span>
                      <span className="mt-1 block text-xs text-[#56524B]">
                        {mode.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button type="button" onClick={handleStart} className={`${PRIMARY_ACTION} mt-6`}>
              Start active training
            </button>
          </section>
        ) : status === "complete" ? (
          <section className="rounded-2xl border border-[#E7E3DA] bg-white p-6 text-center sm:p-8">
            <span className="inline-flex rounded-full bg-[#EFEBE2] px-3 py-1 text-xs font-medium text-[#56524B]">
              Session summary
            </span>
            <h2 className="mt-4 text-xl font-semibold text-[#1A1A17]">
              Training complete
            </h2>
            <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#EFEBE2] p-3">
                <p className="text-xl font-semibold text-[#1A1A17]">
                  {rounds.length}
                </p>
                <p className="text-xs text-[#56524B]">Answered</p>
              </div>
              <div className="rounded-xl bg-[#EFEBE2] p-3">
                <p className="text-xl font-semibold text-[#1A1A17]">
                  {savedMistakes}
                </p>
                <p className="text-xs text-[#56524B]">Mistakes saved</p>
              </div>
              <div className="rounded-xl bg-[#EFEBE2] p-3">
                <p className="text-xl font-semibold text-[#1A1A17]">
                  {summaryDuration}
                </p>
                <p className="text-xs text-[#56524B]">Minutes</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href={`/projects/${projectId}/review`} className={PRIMARY_ACTION}>
                Review saved mistakes
              </Link>
              <Link href={`/projects/${projectId}`} className={OUTLINE_ACTION}>
                Back to dashboard
              </Link>
            </div>
          </section>
        ) : (
          <div className="space-y-4">
            <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#56524B]">
                    Question {Math.min(rounds.length + 1, questionTarget)} of{" "}
                    {questionTarget}
                  </p>
                  <p className="mt-1 text-sm text-[#7A766D]">
                    Focus: {selectedTopic?.name ?? "General exam training"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => finishSession(rounds.length)}
                  disabled={isRequesting}
                  className={OUTLINE_ACTION}
                >
                  End session
                </button>
              </div>

              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-[#E7E3DA]"
                role="progressbar"
                aria-label="Training session progress"
                aria-valuenow={rounds.length}
                aria-valuemin={0}
                aria-valuemax={questionTarget}
              >
                <div
                  className="h-full rounded-full bg-[#137333]"
                  style={{
                    width: `${Math.round((rounds.length / questionTarget) * 100)}%`,
                  }}
                />
              </div>

              {error ? (
                <p
                  role="alert"
                  aria-live="assertive"
                  className="mt-4 rounded-xl bg-[#FCE8E6] px-4 py-3 text-sm text-[#C5221F]"
                >
                  {error}
                </p>
              ) : null}

              {isRequesting && !currentQuestion ? (
                <p className="mt-6 text-sm text-[#56524B]">
                  Ivvy is preparing your question...
                </p>
              ) : currentQuestion ? (
                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#56524B]">
                    Ivvy&apos;s question
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-base text-[#1A1A17]">
                    {parsedChoices ? parsedChoices.stem : currentQuestion}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void askQuestion("Ask the first question now.", messages)
                  }
                  disabled={isRequesting}
                  className={`${PRIMARY_ACTION} mt-5`}
                >
                  Try loading question again
                </button>
              )}

              {currentQuestion && !feedback ? (
                parsedChoices ? (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-[#1A1A17]">
                      Choose an answer
                    </p>
                    <div className="mt-3 grid gap-2">
                      {parsedChoices.options.map((choice) => (
                        <button
                          key={choice.letter}
                          type="button"
                          onClick={() => handleSelectChoice(choice)}
                          disabled={isRequesting}
                          className="flex items-start gap-3 rounded-lg border border-[#D8D3C8] bg-white px-4 py-3 text-left text-sm text-[#1A1A17] transition-colors hover:bg-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
                        >
                          <span className="font-semibold text-[#1A1A17]">
                            {choice.letter}
                          </span>
                          <span className="flex-1">{choice.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAnswer} className="mt-6">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-[#1A1A17]">
                        {trainingMode === "solve"
                          ? "Your working and final answer"
                          : "Your answer"}
                      </span>
                      <textarea
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        rows={5}
                        disabled={isRequesting}
                        placeholder={
                          trainingMode === "solve"
                            ? "Show your working, then state your final answer."
                            : undefined
                        }
                        className="w-full rounded-lg border border-[#D8D3C8] bg-white px-4 py-3 text-sm text-[#1A1A17] placeholder:text-[#7A766D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isRequesting || !answer.trim()}
                      className={`${PRIMARY_ACTION} mt-4`}
                    >
                      Submit answer
                    </button>
                  </form>
                )
              ) : null}

              {feedback ? (
                <div className="mt-6 rounded-xl bg-[#EFEBE2] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#56524B]">
                    Feedback
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[#1A1A17]">
                    {feedback}
                  </p>
                  {rounds.at(-1)?.mistakeSaved ? (
                    <p className="mt-3 text-xs font-medium text-[#B06000]">
                      Saved to your mistake bank for review.
                    </p>
                  ) : null}
                  {rounds.length < questionTarget ? (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={isRequesting}
                      className={`${PRIMARY_ACTION} mt-4`}
                    >
                      Next question
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        )}
    </ProjectShell>
  );
}

export default function ActiveTrainingPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FAF8F4]">
          <p className="text-sm text-[#56524B]">Loading active training...</p>
        </main>
      }
    >
      <ActiveTrainingContent projectId={params.projectId} />
    </Suspense>
  );
}
