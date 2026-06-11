"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import {
  MaterialParseError,
  parseMaterialFile,
} from "@/lib/material-file-parser";
import {
  segmentSources,
  type ImportSource,
  type MaterialSegment,
} from "@/lib/material-segmenter";

const MATERIAL_TEXT_LIMIT = 12_000;
const FILE_ACCEPT =
  ".txt,.md,.csv,.json,.html,.pdf,.docx,text/plain,text/markdown,text/csv,application/json,text/html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const PRIMARY_ACTION =
  "inline-flex h-10 items-center justify-center rounded-full bg-[#1F1F1F] px-6 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const OUTLINE_ACTION =
  "inline-flex h-9 items-center justify-center rounded-full border border-[#C4C7C5] px-4 text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const FIELD =
  "w-full rounded-lg border border-[#C4C7C5] bg-white px-4 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15";

const UNSORTED = "__unsorted__";

type OrganizeStep = "idle" | "reading" | "topics" | "sorting";

type FileSource = { id: string; label: string; text: string };

type ReviewTopic = { id: string; name: string; keep: boolean };

type ReviewState = {
  topics: ReviewTopic[];
  segments: MaterialSegment[];
  // segment id -> topic id or null (Unsorted)
  assignment: Record<string, string | null>;
};

const STEP_LABEL: Record<Exclude<OrganizeStep, "idle">, string> = {
  reading: "Reading materials…",
  topics: "Finding topics…",
  sorting: "Sorting material…",
};

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isTopicsResponse(value: unknown): value is { topics: string[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "topics" in value &&
    Array.isArray((value as { topics: unknown }).topics) &&
    (value as { topics: unknown[] }).topics.every((t) => typeof t === "string")
  );
}

type RawAssignment = { segment: number; topic: string | null };

function isAssignmentsResponse(
  value: unknown
): value is { assignments: RawAssignment[] } {
  if (
    typeof value !== "object" ||
    value === null ||
    !("assignments" in value) ||
    !Array.isArray((value as { assignments: unknown }).assignments)
  ) {
    return false;
  }
  return (value as { assignments: unknown[] }).assignments.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "segment" in item &&
      typeof (item as { segment: unknown }).segment === "number" &&
      "topic" in item &&
      ((item as { topic: unknown }).topic === null ||
        typeof (item as { topic: unknown }).topic === "string")
  );
}

function ImportContent({ projectId }: { projectId: string }) {
  const { project, topics, isLoaded } = useProject(projectId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pastedText, setPastedText] = useState("");
  const [fileSources, setFileSources] = useState<FileSource[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseWarning, setParseWarning] = useState("");
  const [parseError, setParseError] = useState("");

  const [organizeStep, setOrganizeStep] = useState<OrganizeStep>("idle");
  const [organizeError, setOrganizeError] = useState("");
  const [sortDegraded, setSortDegraded] = useState(false);
  const [review, setReview] = useState<ReviewState | null>(null);

  const combinedText = useMemo(() => {
    const parts = [
      pastedText.trim(),
      ...fileSources.map((source) => source.text.trim()),
    ].filter((part) => part.length > 0);
    return parts.join("\n\n").slice(0, MATERIAL_TEXT_LIMIT);
  }, [pastedText, fileSources]);

  const hasMaterial = combinedText.trim().length > 0;
  const isOrganizing = organizeStep !== "idle";

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setParseError("");
    setParseWarning("");
    if (files.length === 0) return;

    setIsParsing(true);
    const added: FileSource[] = [];
    const warnings: string[] = [];
    const failures: string[] = [];

    try {
      for (const file of files) {
        try {
          const parsed = await parseMaterialFile(file);
          added.push({
            id: generateId(),
            label: parsed.fileName || file.name,
            text: parsed.content,
          });
          if (parsed.warning) warnings.push(`${file.name}: ${parsed.warning}`);
        } catch (err) {
          const message =
            err instanceof MaterialParseError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Could not read this file.";
          failures.push(`${file.name}: ${message}`);
        }
      }
    } finally {
      setIsParsing(false);
    }

    if (added.length > 0) setFileSources((current) => [...current, ...added]);
    if (warnings.length > 0) setParseWarning(warnings.join("\n"));
    if (failures.length > 0) setParseError(failures.join("\n"));
  }

  function removeFileSource(id: string) {
    setFileSources((current) => current.filter((source) => source.id !== id));
  }

  function buildSources(): ImportSource[] {
    const sources: ImportSource[] = [];
    if (pastedText.trim().length > 0) {
      sources.push({ label: "Pasted text", text: pastedText.trim() });
    }
    for (const source of fileSources) {
      if (source.text.trim().length > 0) {
        sources.push({ label: source.label, text: source.text });
      }
    }
    return sources;
  }

  async function handleOrganize() {
    if (!hasMaterial || isOrganizing) return;
    setOrganizeError("");
    setSortDegraded(false);
    setReview(null);

    // Step 1 — assemble segments locally.
    setOrganizeStep("reading");
    const segments = segmentSources(buildSources());
    if (segments.length === 0) {
      setOrganizeStep("idle");
      setOrganizeError("No readable material was found. Add notes or files and try again.");
      return;
    }

    // Step 2 — extract topics.
    setOrganizeStep("topics");
    let topicNames: string[];
    try {
      const response = await fetch("/api/extract-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialText: combinedText,
          subject: project?.subject ?? "",
          existingTopics: topics.map((topic) => topic.name),
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok || !isTopicsResponse(data)) {
        throw new Error("extract failed");
      }
      topicNames = data.topics;
    } catch {
      setOrganizeStep("idle");
      setOrganizeError(
        "Ivvy could not find topics in this material. Check your text and try again."
      );
      return;
    }

    if (topicNames.length === 0) {
      setOrganizeStep("idle");
      setOrganizeError(
        "No clear topics were found. Try adding more detailed notes, or add topics manually."
      );
      return;
    }

    const reviewTopics: ReviewTopic[] = topicNames.map((name) => ({
      id: generateId(),
      name,
      keep: true,
    }));
    const topicIdByNormalized = new Map(
      reviewTopics.map((topic) => [topic.name.trim().toLocaleLowerCase(), topic.id])
    );

    // Step 3 — sort material into topics. Failure degrades to all-unsorted.
    setOrganizeStep("sorting");
    const assignment: Record<string, string | null> = {};
    for (const segment of segments) assignment[segment.id] = null;

    try {
      const response = await fetch("/api/sort-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: topicNames,
          segments: segments.map((segment) => segment.text),
          subject: project?.subject ?? "",
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok || !isAssignmentsResponse(data)) {
        throw new Error("sort failed");
      }
      for (const item of data.assignments) {
        const segment = segments[item.segment];
        if (!segment) continue;
        const topicId =
          typeof item.topic === "string"
            ? topicIdByNormalized.get(item.topic.trim().toLocaleLowerCase()) ??
              null
            : null;
        assignment[segment.id] = topicId;
      }
      const anySorted = Object.values(assignment).some((value) => value !== null);
      if (!anySorted) setSortDegraded(true);
    } catch {
      // Graceful: keep all-unsorted and let the student sort manually.
      setSortDegraded(true);
    }

    setReview({ topics: reviewTopics, segments, assignment });
    setOrganizeStep("idle");
  }

  function resetToInput() {
    setReview(null);
    setOrganizeError("");
    setSortDegraded(false);
  }

  // ─── Review mutations (client-side only) ──────────────────────────────────
  function toggleKeep(topicId: string) {
    setReview((current) =>
      current
        ? {
            ...current,
            topics: current.topics.map((topic) =>
              topic.id === topicId ? { ...topic, keep: !topic.keep } : topic
            ),
          }
        : current
    );
  }

  function renameTopic(topicId: string, name: string) {
    setReview((current) =>
      current
        ? {
            ...current,
            topics: current.topics.map((topic) =>
              topic.id === topicId ? { ...topic, name } : topic
            ),
          }
        : current
    );
  }

  function moveSegment(segmentId: string, target: string) {
    setReview((current) =>
      current
        ? {
            ...current,
            assignment: {
              ...current.assignment,
              [segmentId]: target === UNSORTED ? null : target,
            },
          }
        : current
    );
  }

  function removeSegment(segmentId: string) {
    setReview((current) => {
      if (!current) return current;
      const nextAssignment = { ...current.assignment };
      delete nextAssignment[segmentId];
      return {
        ...current,
        segments: current.segments.filter((segment) => segment.id !== segmentId),
        assignment: nextAssignment,
      };
    });
  }

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFD]">
        <p className="text-sm text-[#5F6368]">Loading import…</p>
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
          <Link href="/projects" className={`${OUTLINE_ACTION} mt-5`}>
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={projectId} active="setup" />

        <header className="mb-6">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1F1F1F]">
            Upload once and organize
          </h1>
          <p className="mt-2 text-sm text-[#5F6368]">
            Add your material once. Ivvy suggests topics and sorts your notes
            into them, so you can review before anything is created.
          </p>
        </header>

        {review ? (
          <ReviewPanel
            review={review}
            sortDegraded={sortDegraded}
            onToggleKeep={toggleKeep}
            onRename={renameTopic}
            onMove={moveSegment}
            onRemove={removeSegment}
            onStartOver={resetToInput}
          />
        ) : (
          <section className="space-y-5">
            <div className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
              <label
                htmlFor="import-paste"
                className="block text-sm font-medium text-[#1F1F1F]"
              >
                Paste material
              </label>
              <p className="mt-1 text-sm text-[#5F6368]">
                Syllabus, lecture notes, summaries, or past-paper text.
              </p>
              <textarea
                id="import-paste"
                value={pastedText}
                onChange={(event) => setPastedText(event.target.value)}
                rows={7}
                disabled={isOrganizing}
                placeholder="Paste your notes here…"
                className={`${FIELD} mt-3 resize-y py-3 disabled:opacity-60`}
              />

              <div className="mt-4">
                <span className="block text-sm font-medium text-[#1F1F1F]">
                  Or upload files
                </span>
                <p className="mt-1 text-xs text-[#5F6368]">
                  Supported: TXT, MD, CSV, JSON, HTML, PDF, DOCX. PDF and DOCX
                  import selectable text only — scanned images aren&apos;t
                  supported. Files are read in your browser; only text is sent.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={FILE_ACCEPT}
                  onChange={handleFileChange}
                  disabled={isOrganizing || isParsing}
                  className="sr-only"
                  id="import-files"
                  aria-label="Upload material files"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isOrganizing || isParsing}
                  className={`${OUTLINE_ACTION} mt-2`}
                >
                  {isParsing ? "Extracting…" : "Choose files"}
                </button>
              </div>

              {fileSources.length > 0 ? (
                <ul className="mt-4 space-y-2" aria-label="Uploaded files">
                  {fileSources.map((source) => (
                    <li
                      key={source.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#E1E3E1] bg-[#F8FAFD] px-3 py-2"
                    >
                      <span className="truncate text-sm text-[#1F1F1F]">
                        {source.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFileSource(source.id)}
                        disabled={isOrganizing}
                        aria-label={`Remove ${source.label}`}
                        className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-[#5F6368] transition-colors hover:bg-[#E8EAED] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {isParsing ? (
                <p className="mt-3 text-xs text-[#5F6368]" role="status">
                  Reading your files…
                </p>
              ) : null}
              {parseWarning ? (
                <p
                  className="mt-3 whitespace-pre-line rounded-lg bg-[#FEEFC3] px-3 py-2 text-xs text-[#B06000]"
                  role="status"
                >
                  {parseWarning}
                </p>
              ) : null}
              {parseError ? (
                <p
                  className="mt-3 whitespace-pre-line rounded-lg bg-[#FCE8E6] px-3 py-2 text-xs text-[#C5221F]"
                  role="alert"
                >
                  {parseError}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
              <button
                type="button"
                onClick={handleOrganize}
                disabled={!hasMaterial || isOrganizing || isParsing}
                className={PRIMARY_ACTION}
              >
                {isOrganizing ? "Organizing…" : "Organize materials"}
              </button>

              {isOrganizing ? (
                <p className="mt-3 text-sm text-[#137333]" role="status">
                  {STEP_LABEL[organizeStep as Exclude<OrganizeStep, "idle">]}
                </p>
              ) : null}

              {organizeError ? (
                <p
                  className="mt-3 rounded-lg bg-[#FCE8E6] px-3 py-2 text-sm text-[#C5221F]"
                  role="alert"
                >
                  {organizeError}
                </p>
              ) : null}

              {!hasMaterial && !isOrganizing ? (
                <p className="mt-3 text-sm text-[#5F6368]">
                  Add some material above to organize it into topics.
                </p>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ReviewPanel({
  review,
  sortDegraded,
  onToggleKeep,
  onRename,
  onMove,
  onRemove,
  onStartOver,
}: {
  review: ReviewState;
  sortDegraded: boolean;
  onToggleKeep: (topicId: string) => void;
  onRename: (topicId: string, name: string) => void;
  onMove: (segmentId: string, target: string) => void;
  onRemove: (segmentId: string) => void;
  onStartOver: () => void;
}) {
  const keptTopics = review.topics.filter((topic) => topic.keep);
  const keptIds = new Set(keptTopics.map((topic) => topic.id));

  function segmentsFor(topicId: string): MaterialSegment[] {
    return review.segments.filter(
      (segment) => review.assignment[segment.id] === topicId
    );
  }

  // Unsorted = explicitly null, or assigned to a dropped/unknown topic.
  const unsortedSegments = review.segments.filter((segment) => {
    const assigned = review.assignment[segment.id];
    return assigned === null || assigned === undefined || !keptIds.has(assigned);
  });

  const sortedCount = review.segments.length - unsortedSegments.length;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#1F1F1F]">
              Review your training map
            </h2>
            <p className="mt-1 text-sm text-[#5F6368]">
              {keptTopics.length} topic{keptTopics.length === 1 ? "" : "s"} ·{" "}
              {review.segments.length} segment
              {review.segments.length === 1 ? "" : "s"} · {sortedCount} sorted ·{" "}
              {unsortedSegments.length} unsorted
            </p>
          </div>
          <button type="button" onClick={onStartOver} className={OUTLINE_ACTION}>
            Start over
          </button>
        </div>

        {sortDegraded ? (
          <p
            className="mt-3 rounded-lg bg-[#FEEFC3] px-3 py-2 text-xs text-[#B06000]"
            role="status"
          >
            Automatic sorting wasn&apos;t available, so your material is in
            Unsorted. Move segments into topics below.
          </p>
        ) : null}
      </section>

      {review.topics.map((topic) => {
        const assigned = segmentsFor(topic.id);
        return (
          <section
            key={topic.id}
            className={`rounded-2xl border bg-white p-5 sm:p-6 ${
              topic.keep ? "border-[#E1E3E1]" : "border-[#E1E3E1] opacity-60"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor={`topic-name-${topic.id}`}>
                Topic name
              </label>
              <input
                id={`topic-name-${topic.id}`}
                value={topic.name}
                onChange={(event) => onRename(topic.id, event.target.value)}
                disabled={!topic.keep}
                className={`${FIELD} h-10 flex-1 disabled:opacity-60`}
              />
              <button
                type="button"
                onClick={() => onToggleKeep(topic.id)}
                aria-pressed={!topic.keep}
                className={OUTLINE_ACTION}
              >
                {topic.keep ? "Drop topic" : "Keep topic"}
              </button>
            </div>

            {topic.keep ? (
              assigned.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {assigned.map((segment) => (
                    <SegmentRow
                      key={segment.id}
                      segment={segment}
                      currentTarget={topic.id}
                      keptTopics={keptTopics}
                      onMove={onMove}
                      onRemove={onRemove}
                    />
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-lg bg-[#F8FAFD] px-3 py-2 text-sm text-[#80868B]">
                  No material assigned yet. Move segments here from Unsorted.
                </p>
              )
            ) : (
              <p className="mt-3 text-sm text-[#80868B]">
                Dropped — its material moves to Unsorted.
              </p>
            )}
          </section>
        );
      })}

      <section className="rounded-2xl border border-[#E1E3E1] bg-[#F1F3F4] p-5 sm:p-6">
        <h3 className="text-base font-semibold text-[#1F1F1F]">Unsorted</h3>
        <p className="mt-1 text-sm text-[#5F6368]">
          Material not matched to a kept topic. Move it into a topic, or leave
          it out.
        </p>
        {unsortedSegments.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {unsortedSegments.map((segment) => (
              <SegmentRow
                key={segment.id}
                segment={segment}
                currentTarget={UNSORTED}
                keptTopics={keptTopics}
                onMove={onMove}
                onRemove={onRemove}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[#80868B]">
            Nothing unsorted — everything is in a topic.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Available in the next update"
          className={`${PRIMARY_ACTION}`}
        >
          Coming next: Accept training map
        </button>
        <p className="mt-2 text-xs text-[#80868B]">
          Reviewing only — nothing is saved yet. Accepting will create topics and
          materials in a later update.
        </p>
      </section>
    </div>
  );
}

function SegmentRow({
  segment,
  currentTarget,
  keptTopics,
  onMove,
  onRemove,
}: {
  segment: MaterialSegment;
  currentTarget: string;
  keptTopics: ReviewTopic[];
  onMove: (segmentId: string, target: string) => void;
  onRemove: (segmentId: string) => void;
}) {
  const preview =
    segment.text.length > 240 ? `${segment.text.slice(0, 240)}…` : segment.text;

  return (
    <li className="rounded-lg border border-[#E1E3E1] bg-white p-3">
      <p className="text-xs text-[#80868B]">{segment.source}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[#1F1F1F]">{preview}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`move-${segment.id}`}>
          Move segment to topic
        </label>
        <select
          id={`move-${segment.id}`}
          value={currentTarget}
          onChange={(event) => onMove(segment.id, event.target.value)}
          className="h-9 rounded-lg border border-[#C4C7C5] bg-white px-3 text-sm text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15"
        >
          <option value={UNSORTED}>Unsorted</option>
          {keptTopics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name.trim() || "Untitled topic"}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onRemove(segment.id)}
          aria-label="Remove segment from import"
          className="rounded-full px-3 py-1.5 text-xs font-medium text-[#C5221F] transition-colors hover:bg-[#FCE8E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5221F] focus-visible:ring-offset-2"
        >
          Remove
        </button>
      </div>
    </li>
  );
}

export default function ImportPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <ImportContent projectId={params.projectId} />;
}
