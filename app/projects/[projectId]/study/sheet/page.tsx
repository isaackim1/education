"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { useTrainingLog } from "@/hooks/useTrainingLog";
import {
  buildStudySheetContextMessage,
  buildStudySheetSystemPrompt,
} from "@/lib/project-prompts";

const PRIMARY_ACTION =
  "inline-flex h-10 items-center justify-center rounded-full bg-[#1F1F1F] px-6 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const SECONDARY_LINK =
  "inline-flex h-9 items-center justify-center rounded-full border border-[#C4C7C5] px-4 text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const BACK_LINK =
  "inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const FIELD =
  "w-full rounded-lg border border-[#C4C7C5] bg-white px-4 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15";

const REQUEST_TIMEOUT_MS = 30000;

type Status = "idle" | "loading" | "done" | "error";

type StudySheet = {
  core: string;
  terms: string;
  exam: string;
  mistakes: string;
  checklist: string;
  practice: string;
};

const SHEET_TAGS: { key: keyof StudySheet; label: string }[] = [
  { key: "core", label: "CORE" },
  { key: "terms", label: "TERMS" },
  { key: "exam", label: "EXAM" },
  { key: "mistakes", label: "MISTAKES" },
  { key: "checklist", label: "CHECKLIST" },
  { key: "practice", label: "PRACTICE" },
];

// Parse the structured reply into sections, preserving line breaks so list
// sections keep their items. Returns null if the model ignored the format.
function parseStudySheet(reply: string): StudySheet | null {
  const result: StudySheet = {
    core: "",
    terms: "",
    exam: "",
    mistakes: "",
    checklist: "",
    practice: "",
  };
  let current: keyof StudySheet | null = null;
  let matchedAny = false;

  for (const rawLine of reply.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const tag = SHEET_TAGS.find((entry) =>
      new RegExp(`^${entry.label}\\s*:`, "i").test(line)
    );
    if (tag) {
      current = tag.key;
      matchedAny = true;
      result[tag.key] = line
        .replace(new RegExp(`^${tag.label}\\s*:`, "i"), "")
        .trim();
    } else if (current) {
      result[current] = result[current]
        ? `${result[current]}\n${line}`
        : line;
    }
  }

  return matchedAny ? result : null;
}

function toListItems(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function SheetTextSection({ label, body }: { label: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#1F1F1F]">{label}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[#5F6368]">{body}</p>
    </div>
  );
}

function SheetListSection({ label, body }: { label: string; body: string }) {
  const items = toListItems(body);
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#1F1F1F]">{label}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[#5F6368] marker:text-[#80868B]">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function StudySheetPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;
  const { project, topics, isLoaded: projectLoaded } = useProject(projectId);
  const { materials, isLoaded: materialsLoaded } =
    useProjectMaterials(projectId);
  const { logSession } = useTrainingLog(projectId);

  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState<StudySheet | null>(null);
  const [rawSheet, setRawSheet] = useState("");

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

  const selectedMaterial = useMemo(
    () =>
      selectedTopic
        ? materials.find((material) => material.topicId === selectedTopic.id) ??
          null
        : null,
    [materials, selectedTopic]
  );

  const hasMaterial = (selectedMaterial?.content.trim().length ?? 0) > 0;

  // Reset any prior sheet when the student switches topic.
  useEffect(() => {
    setStatus("idle");
    setError("");
    setSheet(null);
    setRawSheet("");
  }, [selectedTopicId]);

  const canGenerate =
    status !== "loading" && selectedTopic !== null && hasMaterial;

  async function handleGenerate() {
    if (!project || !selectedTopic || !hasMaterial) return;
    if (status === "loading") return;

    setStatus("loading");
    setError("");
    setSheet(null);
    setRawSheet("");

    const systemPrompt = buildStudySheetSystemPrompt();
    const contextMessage = buildStudySheetContextMessage({
      topicName: selectedTopic.name,
      subject: project.subject,
      material: selectedMaterial?.content ?? "",
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
                "Create the study sheet now using the required format.",
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
      setSheet(parseStudySheet(reply));
      setRawSheet(reply);
      setStatus("done");

      // Record the session without changing the storage schema. Generating a
      // sheet is untimed, so duration stays 0; the note keeps the log readable.
      logSession({
        type: "other",
        topicId: selectedTopic.id,
        durationMinutes: 0,
        note: `Study sheet: ${selectedTopic.name}`,
        confidenceAfter: null,
      });
    } catch {
      setStatus("error");
      setError(
        "Ivvy could not build a study sheet. Check your connection and try again."
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFD]">
        <p className="text-sm text-[#5F6368]">Loading study sheet...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#F8FAFD]">
        <div className="mx-auto max-w-lg px-4 py-12">
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

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={projectId} active="study" />

        <header className="mb-6">
          <Link
            href={`/projects/${projectId}/study`}
            className="inline-flex items-center h-8 -ml-3 px-3 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
          >
            &larr; Study modes
          </Link>
          <h1 className="mt-2 text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            One topic in, one exam-ready sheet out.
          </h1>
          <p className="mt-2 text-sm text-[#5F6368]">
            Pick a topic and Ivvy turns its saved material into a structured
            study sheet: the core idea, key terms, exam points, common mistakes,
            a checklist, and a practice question.
          </p>
        </header>

        {topics.length === 0 ? (
          <section className="rounded-2xl border border-[#E1E3E1] bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-[#1F1F1F]">
              Build your training workspace first
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5F6368]">
              Upload your materials once and Ivvy will create topics you can turn
              into study sheets.
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
            <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
              <label
                htmlFor="sheet-topic"
                className="block text-sm font-medium text-[#1F1F1F]"
              >
                Topic
              </label>
              <select
                id="sheet-topic"
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

              {hasMaterial ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className={PRIMARY_ACTION}
                  >
                    {status === "loading"
                      ? "Building..."
                      : "Generate study sheet"}
                  </button>
                  {status === "loading" ? (
                    <span className="text-sm text-[#5F6368]" role="status">
                      Ivvy is building your study sheet...
                    </span>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-[#E1E3E1] bg-[#F8FAFD] px-4 py-4">
                  <p className="text-sm font-medium text-[#1F1F1F]">
                    No material saved for this topic yet
                  </p>
                  <p className="mt-1 text-sm text-[#5F6368]">
                    Ivvy builds the sheet from your saved material. Add material
                    to this topic, then come back.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/projects/${projectId}/materials`}
                      className={SECONDARY_LINK}
                    >
                      Add material
                    </Link>
                    <Link
                      href={`/projects/${projectId}/import`}
                      className={SECONDARY_LINK}
                    >
                      Upload once and organize
                    </Link>
                  </div>
                </div>
              )}

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
                className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6"
                aria-label="Study sheet"
              >
                <h2 className="text-base font-semibold text-[#1F1F1F]">
                  {selectedTopic?.name
                    ? `Study sheet: ${selectedTopic.name}`
                    : "Study sheet"}
                </h2>
                {sheet ? (
                  <div className="mt-4 space-y-4">
                    <SheetTextSection label="Core idea" body={sheet.core} />
                    <SheetListSection label="Key terms" body={sheet.terms} />
                    <SheetListSection label="Exam points" body={sheet.exam} />
                    <SheetListSection
                      label="Common mistakes"
                      body={sheet.mistakes}
                    />
                    <SheetListSection
                      label="Mini checklist"
                      body={sheet.checklist}
                    />
                    <SheetTextSection
                      label="Practice question"
                      body={sheet.practice}
                    />
                  </div>
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-[#5F6368]">
                    {rawSheet}
                  </p>
                )}
                <p className="mt-5 text-xs text-[#80868B]">
                  Generated from your saved material. Regenerate any time after
                  you update this topic&apos;s notes.
                </p>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
