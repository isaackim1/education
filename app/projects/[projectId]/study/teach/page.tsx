"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProjectShell from "@/components/project/ProjectShell";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { useTrainingLog } from "@/hooks/useTrainingLog";
import {
  buildTeachBackContextMessage,
  buildTeachBackSystemPrompt,
} from "@/lib/project-prompts";

const PRIMARY_ACTION =
  "inline-flex h-10 items-center justify-center rounded-full bg-[#1A1A17] px-6 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const BACK_LINK =
  "inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2";

const FIELD =
  "w-full rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#7A766D] transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15";

const REQUEST_TIMEOUT_MS = 30000;

type Status = "idle" | "loading" | "done" | "error";

type TeachBackFeedback = {
  right: string;
  missing: string;
  unclear: string;
  next: string;
  followUp: string;
};

const FEEDBACK_TAGS: { key: keyof TeachBackFeedback; label: string }[] = [
  { key: "right", label: "RIGHT" },
  { key: "missing", label: "MISSING" },
  { key: "unclear", label: "UNCLEAR" },
  { key: "next", label: "NEXT" },
  { key: "followUp", label: "FOLLOWUP" },
];

// Parse the structured reply into sections. Returns null if the model ignored
// the format, so the caller can fall back to rendering the raw text.
function parseTeachBackFeedback(reply: string): TeachBackFeedback | null {
  const result: TeachBackFeedback = {
    right: "",
    missing: "",
    unclear: "",
    next: "",
    followUp: "",
  };
  let current: keyof TeachBackFeedback | null = null;
  let matchedAny = false;

  for (const rawLine of reply.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const tag = FEEDBACK_TAGS.find((entry) =>
      new RegExp(`^${entry.label}\\s*:`, "i").test(line)
    );
    if (tag) {
      current = tag.key;
      matchedAny = true;
      result[tag.key] = line
        .replace(new RegExp(`^${tag.label}\\s*:`, "i"), "")
        .trim();
    } else if (current) {
      result[current] = `${result[current]} ${line}`.trim();
    }
  }

  return matchedAny ? result : null;
}

function isEmptyFollowUp(value: string): boolean {
  const normalized = value.trim().toLocaleLowerCase();
  return (
    normalized.length === 0 ||
    normalized === "none" ||
    normalized === "n/a" ||
    normalized === "na"
  );
}

function FeedbackSection({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#1A1A17]">{label}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[#56524B]">{body}</p>
    </div>
  );
}

export default function TeachBackPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;
  const { project, topics, isLoaded: projectLoaded } = useProject(projectId);
  const { getMaterialsForTopic, isLoaded: materialsLoaded } =
    useProjectMaterials(projectId);
  const { logSession } = useTrainingLog(projectId);

  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<TeachBackFeedback | null>(null);
  const [rawFeedback, setRawFeedback] = useState("");

  const isLoaded = projectLoaded && materialsLoaded;

  // Default to the first topic once topics are available.
  useEffect(() => {
    if (!selectedTopicId && topics.length > 0) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) ?? null,
    [topics, selectedTopicId]
  );

  const canSubmit =
    status !== "loading" &&
    selectedTopic !== null &&
    explanation.trim().length > 0;

  async function handleSubmit() {
    if (!project || !selectedTopic || explanation.trim().length === 0) return;
    if (status === "loading") return;

    setStatus("loading");
    setError("");
    setFeedback(null);
    setRawFeedback("");

    const material = getMaterialsForTopic(selectedTopic.id);
    const systemPrompt = buildTeachBackSystemPrompt();
    const contextMessage = buildTeachBackContextMessage({
      topicName: selectedTopic.name,
      subject: project.subject,
      material: material?.content ?? "",
      explanation,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "Provide your Teach Back feedback now using the required format.",
            },
          ],
          systemPrompt,
          contextMessage,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("request failed");
      const data: unknown = await response.json();
      if (
        typeof data !== "object" ||
        data === null ||
        !("reply" in data) ||
        typeof data.reply !== "string" ||
        data.reply.trim().length === 0
      ) {
        throw new Error("invalid response");
      }

      const reply = data.reply.trim();
      setFeedback(parseTeachBackFeedback(reply));
      setRawFeedback(reply);
      setStatus("done");

      // Record the session without changing the storage schema. Teach back has
      // no timer, so duration stays 0; the note keeps the log readable.
      logSession({
        type: "other",
        topicId: selectedTopic.id,
        durationMinutes: 0,
        note: `Teach back: ${selectedTopic.name}`,
        confidenceAfter: null,
      });
    } catch {
      setStatus("error");
      setError(
        "Ivvy could not review your explanation. Check your connection and try again."
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F4]">
        <p className="text-sm text-[#56524B]">Loading teach back...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#FAF8F4]">
        <div className="mx-auto max-w-lg px-4 py-12">
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

  return (
    <ProjectShell projectId={projectId} active="coach" width="max-w-3xl">
        <header className="mb-6">
          <Link
            href={`/projects/${projectId}/coach`}
            className="inline-flex items-center h-8 -ml-3 px-3 rounded-full text-sm text-[#56524B] transition-colors hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
          >
            &larr; Coach
          </Link>
          <h1 className="mt-2 font-serif text-[34px] leading-[1.08] tracking-[-0.01em] text-[#1A1A17] sm:text-[40px]">
            Teach it back. Ivvy checks the gaps.
          </h1>
          <p className="mt-2 text-sm text-[#56524B]">
            Pick a topic and explain it in your own words, as if you were
            teaching it to someone else. Ivvy reviews what you got right, what is
            missing, and what to work on next.
          </p>
        </header>

        {topics.length === 0 ? (
          <section className="rounded-2xl border border-[#E7E3DA] bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-[#1A1A17]">
              Build your training workspace first
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#56524B]">
              Upload your materials once and Ivvy will create topics you can
              teach back.
            </p>
            <Link
              href={`/projects/${projectId}/import`}
              className={`${PRIMARY_ACTION} mt-6`}
            >
              Upload materials
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
              <label
                htmlFor="teach-topic"
                className="block text-sm font-medium text-[#1A1A17]"
              >
                Topic
              </label>
              <select
                id="teach-topic"
                value={selectedTopicId}
                onChange={(event) => setSelectedTopicId(event.target.value)}
                disabled={status === "loading"}
                className={`${FIELD} mt-2 h-11 disabled:opacity-60`}
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>

              <label
                htmlFor="teach-explanation"
                className="mt-5 block text-sm font-medium text-[#1A1A17]"
              >
                Explain this topic as if you were teaching it to someone else.
              </label>
              <textarea
                id="teach-explanation"
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                rows={9}
                disabled={status === "loading"}
                placeholder="Start explaining in your own words..."
                className={`${FIELD} mt-2 resize-y py-3 disabled:opacity-60`}
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={PRIMARY_ACTION}
                >
                  {status === "loading" ? "Checking..." : "Get feedback"}
                </button>
                {status === "loading" ? (
                  <span className="text-sm text-[#56524B]" role="status">
                    Ivvy is reviewing your explanation...
                  </span>
                ) : null}
              </div>

              {status === "error" && error ? (
                <p
                  className="mt-3 rounded-lg bg-[#FCE8E6] px-3 py-2 text-sm text-[#C5221F]"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </section>

            {status === "done" ? (
              <section
                className="rounded-2xl border border-[#E7E3DA] bg-white p-5 sm:p-6"
                aria-label="Ivvy's feedback"
              >
                <h2 className="text-base font-semibold text-[#1A1A17]">
                  Ivvy&apos;s feedback
                </h2>
                {feedback ? (
                  <div className="mt-4 space-y-4">
                    {feedback.right ? (
                      <FeedbackSection
                        label="What you got right"
                        body={feedback.right}
                      />
                    ) : null}
                    {feedback.missing ? (
                      <FeedbackSection
                        label="What is missing"
                        body={feedback.missing}
                      />
                    ) : null}
                    {feedback.unclear ? (
                      <FeedbackSection
                        label="What is unclear"
                        body={feedback.unclear}
                      />
                    ) : null}
                    {feedback.next ? (
                      <FeedbackSection
                        label="Next improvement"
                        body={feedback.next}
                      />
                    ) : null}
                    {!isEmptyFollowUp(feedback.followUp) ? (
                      <FeedbackSection
                        label="Follow-up question"
                        body={feedback.followUp}
                      />
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-[#56524B]">
                    {rawFeedback}
                  </p>
                )}
                <p className="mt-5 text-xs text-[#7A766D]">
                  Want to go again? Refine your explanation above and get fresh
                  feedback.
                </p>
              </section>
            ) : null}
          </div>
        )}
    </ProjectShell>
  );
}
