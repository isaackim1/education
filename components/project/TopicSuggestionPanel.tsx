"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import type { Topic } from "@/lib/types";
import {
  MaterialParseError,
  parseMaterialFile,
} from "@/lib/material-file-parser";

const MATERIAL_TEXT_LIMIT = 12_000;
const FILE_ACCEPT =
  ".txt,.md,.csv,.json,.html,.pdf,.docx,text/plain,text/markdown,text/csv,application/json,text/html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const FIELD =
  "w-full rounded-lg border border-[#C4C7C5] bg-white px-4 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15";

type SuggestedTopic = {
  name: string;
  checked: boolean;
};

export default function TopicSuggestionPanel({
  projectId,
  subject,
  existingTopics,
  onAddTopic,
}: {
  projectId: string;
  subject: string;
  existingTopics: Topic[];
  onAddTopic: (name: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materialText, setMaterialText] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedTopic[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [generatedEmpty, setGeneratedEmpty] = useState(false);

  const existingNames = useMemo(
    () =>
      new Set(existingTopics.map((topic) => topic.name.toLocaleLowerCase())),
    [existingTopics]
  );
  const checkedNewTopics = suggestions.filter(
    (topic) => topic.checked && !existingNames.has(topic.name.toLocaleLowerCase())
  );
  const allAlreadyExist =
    suggestions.length > 0 &&
    suggestions.every((topic) =>
      existingNames.has(topic.name.toLocaleLowerCase())
    );
  const isBusy = isParsing || isGenerating;

  function setCappedMaterialText(text: string, truncationMessage: string) {
    setMaterialText(text.slice(0, MATERIAL_TEXT_LIMIT));
    if (text.length > MATERIAL_TEXT_LIMIT) {
      setWarning(truncationMessage);
    }
  }

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setError(null);
    setWarning(null);
    setNotice(null);
    setGeneratedEmpty(false);
    setSuggestions([]);
    setCappedMaterialText(
      e.target.value,
      `Material text was truncated to ${MATERIAL_TEXT_LIMIT.toLocaleString()} characters.`
    );
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setError(null);
    setWarning(null);
    setNotice(null);
    setGeneratedEmpty(false);

    if (files.length === 0) return;

    setIsParsing(true);
    const extracted: string[] = [];
    const warnings: string[] = [];
    const failures: string[] = [];

    try {
      for (const file of files) {
        try {
          const parsed = await parseMaterialFile(file);
          extracted.push(parsed.content);
          if (parsed.truncated || parsed.warning) {
            if (parsed.warning) warnings.push(`${file.name}: ${parsed.warning}`);
          }
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

    if (extracted.length > 0) {
      const separator = materialText.length > 0 ? "\n\n" : "";
      const nextText = materialText + separator + extracted.join("\n\n");
      setCappedMaterialText(
        nextText,
        `Imported text was truncated to ${MATERIAL_TEXT_LIMIT.toLocaleString()} characters for topic extraction.`
      );
      setSuggestions([]);
    }

    if (warnings.length > 0) {
      setWarning((current) =>
        [current, ...warnings].filter(Boolean).join("\n")
      );
    }

    if (failures.length > 0) {
      setError(failures.join("\n"));
    }
  }

  async function handleGenerate() {
    const cappedText = materialText.slice(0, MATERIAL_TEXT_LIMIT);
    if (!cappedText.trim()) return;

    setError(null);
    setNotice(null);
    setGeneratedEmpty(false);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/extract-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialText: cappedText,
          subject,
          existingTopics: existingTopics.map((topic) => topic.name),
        }),
      });
      const data: unknown = await response.json();

      if (!response.ok || !isTopicResponse(data)) {
        throw new Error("Could not generate a training map. Try again.");
      }

      setSuggestions(
        data.topics.map((name) => ({
          name,
          checked: !existingNames.has(name.toLocaleLowerCase()),
        }))
      );
      setGeneratedEmpty(data.topics.length === 0);
    } catch {
      setError("Could not generate a training map. Try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleSuggestion(name: string) {
    setSuggestions((current) =>
      current.map((topic) =>
        topic.name === name ? { ...topic, checked: !topic.checked } : topic
      )
    );
  }

  function handleAddTopics() {
    for (const topic of checkedNewTopics) {
      onAddTopic(topic.name);
    }
    setSuggestions([]);
    setGeneratedEmpty(false);
    setNotice(
      `Added ${checkedNewTopics.length} topic${
        checkedNewTopics.length === 1 ? "" : "s"
      }.`
    );
  }

  return (
    <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6 space-y-5">
      <div>
        <h2 className="text-lg font-medium text-[#1F1F1F]">
          Generate training map
        </h2>
        <p className="mt-1 text-sm text-[#5F6368]">
          Paste a syllabus, notes, or past paper to suggest topics before adding
          them.
        </p>
      </div>

      <div>
        <label
          htmlFor={`topic-extraction-material-${projectId}`}
          className="block text-xs font-medium text-[#5F6368] mb-1.5"
        >
          Exam materials
        </label>
        <textarea
          id={`topic-extraction-material-${projectId}`}
          value={materialText}
          onChange={handleTextChange}
          rows={7}
          disabled={isBusy}
          placeholder="Paste syllabus points, notes, or past-paper text..."
          className={`${FIELD} py-3 resize-y disabled:opacity-60`}
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={FILE_ACCEPT}
            onChange={handleFileChange}
            disabled={isBusy}
            className="sr-only"
            id={`topic-extraction-files-${projectId}`}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="inline-flex items-center h-9 px-4 rounded-full border border-[#C4C7C5] text-sm text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
          >
            {isParsing ? "Extracting…" : "Choose files"}
          </button>
          <span className="text-xs text-[#80868B]">
            Up to {MATERIAL_TEXT_LIMIT.toLocaleString()} characters.
          </span>
        </div>
        {isParsing ? (
          <p className="mt-2 text-xs text-[#5F6368]" role="status">
            Extracting text from selected files…
          </p>
        ) : null}
        {error ? (
          <p
            className="mt-2 rounded-lg bg-[#F1F3F4] px-3 py-2 text-xs text-[#5F6368] whitespace-pre-line"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {warning && !isParsing ? (
          <p
            className="mt-2 rounded-lg bg-[#F1F3F4] px-3 py-2 text-xs text-[#5F6368] whitespace-pre-line"
            role="status"
          >
            {warning}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isBusy || materialText.trim().length === 0}
          className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
        >
          {isGenerating ? "Reading your materials…" : "Generate training map"}
        </button>
        {notice ? (
          <span className="text-xs font-medium text-[#5F6368]" role="status">
            {notice}
          </span>
        ) : null}
      </div>

      {materialText.length === 0 && suggestions.length === 0 ? (
        <p className="text-sm text-[#5F6368]">
          Add material above to generate a starting set of study topics.
        </p>
      ) : null}

      {generatedEmpty ? (
        <p className="text-sm text-[#5F6368]">
          No clear topics found &mdash; add them manually below, or paste more
          detailed notes.
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-medium text-[#1F1F1F]">
              Suggested topics
            </h3>
            <p className="text-xs text-[#5F6368] mt-1">Review before adding.</p>
          </div>

          {allAlreadyExist ? (
            <p className="text-sm text-[#5F6368]">
              These topics are already in your project.
            </p>
          ) : null}

          <ul className="space-y-2">
            {suggestions.map((topic) => {
              const alreadyExists = existingNames.has(
                topic.name.toLocaleLowerCase()
              );
              return (
                <li key={topic.name}>
                  <label className="flex items-center gap-3 rounded-xl border border-[#E1E3E1] bg-[#F8FAFD] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={topic.checked}
                      onChange={() => toggleSuggestion(topic.name)}
                      disabled={alreadyExists}
                      className="h-4 w-4 accent-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        alreadyExists ? "text-[#80868B]" : "text-[#1F1F1F]"
                      }`}
                    >
                      {topic.name}
                    </span>
                    {alreadyExists ? (
                      <span className="rounded-full bg-[#E8EAED] px-2.5 py-1 text-xs text-[#5F6368]">
                        Already added
                      </span>
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={handleAddTopics}
            disabled={checkedNewTopics.length === 0}
            className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#E8EAED] text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#DADCE0] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
          >
            Add {checkedNewTopics.length} topic
            {checkedNewTopics.length === 1 ? "" : "s"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function isTopicResponse(value: unknown): value is { topics: string[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "topics" in value &&
    Array.isArray(value.topics) &&
    value.topics.every((topic) => typeof topic === "string")
  );
}
