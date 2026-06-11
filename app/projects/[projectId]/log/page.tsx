"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { useTrainingLog } from "@/hooks/useTrainingLog";
import type { TrainingSession, TrainingSessionType } from "@/lib/types";

const FIELD =
  "h-12 w-full rounded-lg border border-[#C4C7C5] bg-white px-4 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const TYPE_OPTIONS: { value: TrainingSessionType; label: string }[] = [
  { value: "studied-materials", label: "Studied materials" },
  { value: "trained-chat", label: "Trained with chat" },
  { value: "reviewed-mistakes", label: "Reviewed mistakes" },
  { value: "other", label: "Other" },
];

const TYPE_LABELS: Record<TrainingSessionType, string> = {
  "studied-materials": "Studied materials",
  "trained-chat": "Trained with chat",
  "reviewed-mistakes": "Reviewed mistakes",
  other: "Other",
};

const DURATION_PRESETS = [15, 30, 45, 60];
const CONFIDENCE_LEVELS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

function chipClass(selected: boolean): string {
  return `inline-flex items-center h-9 px-4 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2 ${
    selected
      ? "bg-[#1F1F1F] text-white"
      : "border border-[#C4C7C5] text-[#1F1F1F] hover:bg-[#F1F3F4]"
  }`;
}

function formatLoggedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LogPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded: projectLoaded } = useProject(
    params.projectId
  );
  const {
    sessions,
    isLoaded: logLoaded,
    logSession,
    removeSession,
  } = useTrainingLog(params.projectId);

  const [type, setType] = useState<TrainingSessionType>("studied-materials");
  const [topicId, setTopicId] = useState<string>("");
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [note, setNote] = useState("");
  const [confidenceAfter, setConfidenceAfter] = useState<
    1 | 2 | 3 | 4 | 5 | null
  >(null);

  const topicNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const topic of topics) map.set(topic.id, topic.name);
    return map;
  }, [topics]);

  const orderedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
      ),
    [sessions]
  );

  const isLoaded = projectLoaded && logLoaded;

  function resolvedDuration(): number {
    if (useCustomDuration) {
      const parsed = Number(customDuration);
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
    }
    return duration;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    logSession({
      type,
      topicId: topicId || null,
      durationMinutes: resolvedDuration(),
      note,
      confidenceAfter,
    });
    // Reset the lighter fields; keep type for quick repeat logging.
    setNote("");
    setConfidenceAfter(null);
  }

  function handleDelete(session: TrainingSession) {
    if (window.confirm("Delete this logged session?")) {
      removeSession(session.id);
    }
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFD]">
        <p className="text-sm text-[#5F6368]">Loading...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#F8FAFD]">
        <div className="mx-auto max-w-lg px-4 py-12">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1F1F1F]">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="mt-4 inline-flex h-9 items-center rounded-full px-3 text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F]"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="log" />

        <header className="mb-6">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1F1F1F]">
            Training log
          </h1>
          <p className="mt-2 text-sm text-[#5F6368]">
            Record a session each time you study, train, or review. Your
            activity grid and weekly goals fill in as you go.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6"
        >
          <h2 className="text-base font-semibold text-[#1F1F1F]">
            Log a training session
          </h2>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-[#1F1F1F]">
              What did you do?
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={type === option.value}
                  onClick={() => setType(option.value)}
                  className={chipClass(type === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block space-y-1.5">
            <span className="text-sm font-medium text-[#1F1F1F]">
              Topic (optional)
            </span>
            <select
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
              className={FIELD}
            >
              <option value="">No specific topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-[#1F1F1F]">
              How long?
            </legend>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={!useCustomDuration && duration === preset}
                  onClick={() => {
                    setUseCustomDuration(false);
                    setDuration(preset);
                  }}
                  className={chipClass(!useCustomDuration && duration === preset)}
                >
                  {preset} min
                </button>
              ))}
              <button
                type="button"
                aria-pressed={useCustomDuration}
                onClick={() => setUseCustomDuration(true)}
                className={chipClass(useCustomDuration)}
              >
                Custom
              </button>
              {useCustomDuration ? (
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={customDuration}
                  onChange={(event) => setCustomDuration(event.target.value)}
                  placeholder="Minutes"
                  aria-label="Custom duration in minutes"
                  className="h-9 w-28 rounded-lg border border-[#C4C7C5] bg-white px-3 text-sm text-[#1F1F1F] placeholder:text-[#80868B] focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15"
                />
              ) : null}
            </div>
          </fieldset>

          <label className="mt-5 block space-y-1.5">
            <span className="text-sm font-medium text-[#1F1F1F]">
              Note (optional)
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="Anything worth remembering about this session"
              className="w-full rounded-lg border border-[#C4C7C5] bg-white px-4 py-3 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15"
            />
          </label>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-[#1F1F1F]">
              Confidence after (optional)
            </legend>
            <div className="mt-2 flex gap-2">
              {CONFIDENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={confidenceAfter === level}
                  onClick={() =>
                    setConfidenceAfter((current) =>
                      current === level ? null : level
                    )
                  }
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2 ${
                    confidenceAfter === level
                      ? "bg-[#1F1F1F] text-white"
                      : "border border-[#C4C7C5] text-[#1F1F1F] hover:bg-[#F1F3F4]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-6">
            <button type="submit" className={PRIMARY_ACTION}>
              Save session
            </button>
          </div>
        </form>

        <section className="mt-6">
          <h2 className="text-base font-semibold text-[#1F1F1F]">
            Logged sessions
          </h2>

          {orderedSessions.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-[#E1E3E1] bg-white p-6 text-center">
              <p className="text-sm font-medium text-[#1F1F1F]">
                No sessions logged yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-[#5F6368]">
                Log a session each time you study, train in chat, or review
                mistakes. Your activity grid and weekly goals fill in as you go.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {orderedSessions.map((session) => {
                const topicName = session.topicId
                  ? topicNameById.get(session.topicId) ?? "Removed topic"
                  : null;
                return (
                  <li
                    key={session.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-[#E1E3E1] bg-white p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1F1F1F]">
                        {TYPE_LABELS[session.type]}
                        {session.durationMinutes > 0
                          ? ` · ${session.durationMinutes} min`
                          : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-[#80868B]">
                        {formatLoggedAt(session.loggedAt)}
                        {topicName ? ` · ${topicName}` : ""}
                        {session.confidenceAfter
                          ? ` · confidence ${session.confidenceAfter}/5`
                          : ""}
                      </p>
                      {session.note ? (
                        <p className="mt-2 text-sm text-[#5F6368]">
                          {session.note}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(session)}
                      aria-label="Delete session"
                      className="inline-flex h-9 shrink-0 items-center rounded-full px-3 text-sm font-medium text-[#C5221F] transition-colors hover:bg-[#FCE8E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5221F] focus-visible:ring-offset-2"
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
