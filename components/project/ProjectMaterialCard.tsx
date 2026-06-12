"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import type { Material } from "@/lib/types";
import type { SaveTopicMaterialInput } from "@/hooks/useProjectMaterials";
import { parseMaterialFile } from "@/lib/material-file-parser";

const FIELD =
  "w-full rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#7A766D] transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15";

const BATCH_FILE_LIMIT = 20;
const BATCH_TEXT_LIMIT = 300_000;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Multi-file composition helper ──────────────────────────────────────────

type ParsedResult = {
  name: string;
  content: string;
  fileType: string;
  fileSize: number;
  warning?: string;
};

type ComposedImport = {
  nextContent: string;
  includedFiles: ParsedResult[];
  omittedFiles: string[];
  warnings: string[];
  includedSize: number;
};

function composeImport(
  existingContent: string,
  results: ParsedResult[]
): ComposedImport {
  const SEPARATOR_EXISTING = "\n\n-- Imported files --\n\n";
  const SEPARATOR_BETWEEN = "\n\n";
  const sourceHeader = (name: string) => `-- Source: ${name} --\n\n`;

  // Existing content is never trimmed or truncated.
  // Budget = chars available for imported text only.
  const budget =
    existingContent.length > 0
      ? BATCH_TEXT_LIMIT - existingContent.length - SEPARATOR_EXISTING.length
      : BATCH_TEXT_LIMIT;

  if (budget <= 0) {
    return {
      nextContent: existingContent,
      includedFiles: [],
      omittedFiles: results.map((r) => r.name),
      warnings: [
        `Existing content fills the ${BATCH_TEXT_LIMIT.toLocaleString()}-character limit. No files were imported.`,
      ],
      includedSize: 0,
    };
  }

  const includedFiles: ParsedResult[] = [];
  const omittedFiles: string[] = [];
  const blockParts: string[] = [];
  const warnings: string[] = [];
  let usedBudget = 0;

  for (const r of results) {
    const block = sourceHeader(r.name) + r.content;
    // No separator before the first included block; "\n\n" between subsequent ones.
    const sep = blockParts.length === 0 ? "" : SEPARATOR_BETWEEN;
    const chunk = sep + block;

    if (usedBudget + chunk.length <= budget) {
      blockParts.push(chunk);
      usedBudget += chunk.length;
      includedFiles.push(r);
    } else {
      omittedFiles.push(r.name);
    }
  }

  if (includedFiles.length === 0) {
    return {
      nextContent: existingContent,
      includedFiles: [],
      omittedFiles: results.map((r) => r.name),
      warnings: [
        `Imported text exceeds the available space (${BATCH_TEXT_LIMIT.toLocaleString()}-character limit). No files were imported.`,
      ],
      includedSize: 0,
    };
  }

  const importedText = blockParts.join("");
  const nextContent =
    existingContent.length > 0
      ? existingContent + SEPARATOR_EXISTING + importedText
      : importedText;

  for (const r of includedFiles) {
    if (r.warning) warnings.push(`${r.name}: ${r.warning}`);
  }

  if (omittedFiles.length > 0) {
    warnings.push(
      `${omittedFiles.length} file${omittedFiles.length > 1 ? "s" : ""} omitted — combined text limit reached: ${omittedFiles.join(", ")}.`
    );
  }

  const includedSize = includedFiles.reduce((sum, r) => sum + r.fileSize, 0);

  return { nextContent, includedFiles, omittedFiles, warnings, includedSize };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectMaterialCard({
  topicName,
  topicId,
  material,
  onSave,
  onStateChange,
}: {
  topicName: string;
  topicId: string;
  material: Material | null;
  onSave: (input: SaveTopicMaterialInput) => void;
  // Reports unsaved-edit / in-progress-import state to a parent so it can guard
  // against discarding drafts (e.g. when switching topics in a master-detail view).
  onStateChange?: (state: { isDirty: boolean; isParsing: boolean }) => void;
}) {
  const defaultTitle = `${topicName} materials`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(material?.title ?? defaultTitle);
  const [content, setContent] = useState(material?.content ?? "");
  const [source, setSource] = useState<"paste" | "file">(
    material?.source ?? "paste"
  );
  const [fileName, setFileName] = useState(material?.fileName ?? "");
  const [fileType, setFileType] = useState(material?.fileType ?? "");
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  const [parsingFiles, setParsingFiles] = useState<{
    count: number;
    firstName: string;
  } | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  const isParsing = parsingFiles !== null;

  useEffect(() => {
    setTitle(material?.title ?? defaultTitle);
    setContent(material?.content ?? "");
    setSource(material?.source ?? "paste");
    setFileName(material?.fileName ?? "");
    setFileType(material?.fileType ?? "");
    setUploadedFileSize(null);
    setFileError(null);
    setFileWarning(null);
    setParsingFiles(null);
  }, [
    material?.title,
    material?.content,
    material?.source,
    material?.fileName,
    material?.fileType,
    defaultTitle,
  ]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setFileError(null);
    setFileWarning(null);

    if (files.length === 0) return;

    if (files.length > BATCH_FILE_LIMIT) {
      setFileError(
        `Too many files selected. Choose up to ${BATCH_FILE_LIMIT} files at a time.`
      );
      return;
    }

    if (files.length === 1) {
      // Single-file path — existing behavior preserved exactly.
      const file = files[0];
      const fileSize = file.size;
      setParsingFiles({ count: 1, firstName: file.name });
      try {
        const parsed = await parseMaterialFile(file);
        setContent(parsed.content);
        setSource("file");
        setFileName(parsed.fileName);
        setFileType(parsed.fileType || "text/plain");
        setUploadedFileSize(fileSize);
        setFileWarning(
          parsed.truncated || parsed.warning ? (parsed.warning ?? null) : null
        );
        const currentTitle = title.trim();
        if (!currentTitle || currentTitle === defaultTitle) {
          setTitle(parsed.fileName);
        }
      } catch (err) {
        setFileError(
          err instanceof Error
            ? err.message
            : "Could not read this file. Try a different file or paste the text."
        );
      } finally {
        setParsingFiles(null);
      }
      return;
    }

    // Multi-file path
    setParsingFiles({ count: files.length, firstName: files[0].name });

    type FileFailure = { name: string; error: string };
    const results: ParsedResult[] = [];
    const failed: FileFailure[] = [];

    try {
      for (const file of files) {
        try {
          const parsed = await parseMaterialFile(file);
          results.push({
            name: file.name,
            content: parsed.content,
            fileType: parsed.fileType,
            fileSize: file.size,
            warning: parsed.warning,
          });
        } catch (err) {
          failed.push({
            name: file.name,
            error:
              err instanceof Error
                ? err.message
                : "Could not read this file.",
          });
        }
      }
    } finally {
      setParsingFiles(null);
    }

    if (results.length === 0) {
      // All failed — preserve existing content, fileName, source, and fileType.
      const lines = [
        `All ${files.length} files failed to import. No changes were made.`,
        "",
        ...failed.map((f) => `${f.name} — ${f.error}`),
      ];
      setFileError(lines.join("\n"));
      return;
    }

    // Build imported text incrementally; existing content is never modified.
    const composed = composeImport(content, results);

    if (composed.includedFiles.length === 0) {
      // Nothing could fit — preserve all existing state.
      const lines: string[] = [...composed.warnings];
      if (failed.length > 0) {
        lines.push(
          `Also failed to parse: ${failed.map((f) => f.name).join(", ")}.`
        );
      }
      setFileError(lines.join("\n"));
      return;
    }

    setContent(composed.nextContent);
    setSource("file");
    setUploadedFileSize(composed.includedSize);

    if (composed.includedFiles.length === 1) {
      setFileName(composed.includedFiles[0].name);
      setFileType(composed.includedFiles[0].fileType || "text/plain");
    } else {
      setFileName("Multiple files");
      setFileType("multiple");
    }

    const warnings = [...composed.warnings];
    if (failed.length > 0) {
      warnings.push(
        `${failed.length} file${failed.length > 1 ? "s" : ""} failed to import: ${failed.map((f) => f.name).join(", ")}.`
      );
    }
    setFileWarning(warnings.length > 0 ? warnings.join("\n") : null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input: SaveTopicMaterialInput = {
      topicId,
      title: title.trim() || defaultTitle,
      content,
      source,
    };

    if (source === "file") {
      input.fileName = fileName;
      input.fileType = fileType;
    }

    onSave(input);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  const savedTitle = material?.title ?? defaultTitle;
  const savedContent = material?.content ?? "";
  const savedSource = material?.source ?? "paste";
  const savedFileName = material?.fileName ?? "";
  const savedFileType = material?.fileType ?? "";

  const isDirty =
    title !== savedTitle ||
    content !== savedContent ||
    source !== savedSource ||
    (source === "file" &&
      (fileName !== savedFileName || fileType !== savedFileType));

  // Surface dirty/parsing state to an optional parent guard. Reset on unmount so
  // a remounted editor (new topic) doesn't inherit the previous card's state.
  useEffect(() => {
    onStateChange?.({ isDirty, isParsing });
    return () => onStateChange?.({ isDirty: false, isParsing: false });
  }, [isDirty, isParsing, onStateChange]);

  const showFileInfo =
    source === "file" && fileName.length > 0 && content.length > 0;

  const hasSavedContent = savedContent.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E7E3DA] bg-white p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-medium text-[#1A1A17]">{topicName}</h3>
        {hasSavedContent ? (
          <span className="inline-flex items-center rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-xs font-medium text-[#137333]">
            Saved
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-[#EFEBE2] px-2.5 py-0.5 text-xs font-medium text-[#56524B]">
            Empty
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor={`material-title-${topicId}`}
          className="block text-xs font-medium text-[#56524B] mb-1.5"
        >
          Title
        </label>
        <input
          id={`material-title-${topicId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${FIELD} h-11`}
        />
      </div>

      <div>
        <span className="block text-xs font-medium text-[#56524B] mb-1.5">
          Import files
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.csv,.json,.html,.pdf,.docx,text/plain,text/markdown,text/csv,application/json,text/html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={isParsing}
          className="sr-only"
          id={`material-file-${topicId}`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isParsing}
          className="inline-flex items-center h-9 px-4 rounded-full border border-[#D8D3C8] text-sm text-[#1A1A17] transition-colors hover:bg-[#EFEBE2] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
        >
          {isParsing ? "Extracting…" : "Choose files"}
        </button>
        <p className="text-xs text-[#7A766D] mt-1.5">
          TXT, MD, CSV, JSON, HTML &mdash; max 500 KB each. PDF, DOCX &mdash;
          max 5 MB each, selectable text only. Up to {BATCH_FILE_LIMIT} files at
          once.
        </p>
        {isParsing ? (
          <p className="mt-2 text-xs text-[#56524B]" role="status">
            {parsingFiles!.count === 1
              ? `Extracting text from ${parsingFiles!.firstName}…`
              : `Extracting text from ${parsingFiles!.count} files…`}
          </p>
        ) : null}
        {fileError ? (
          <p
            className="mt-2 rounded-lg bg-[#F9DEDC] px-3 py-2 text-xs text-[#410E0B] whitespace-pre-line"
            role="alert"
          >
            {fileError}
          </p>
        ) : null}
        {fileWarning && !isParsing ? (
          <p
            className="mt-2 rounded-lg bg-[#FEEFC3] px-3 py-2 text-xs text-[#B06000] whitespace-pre-line"
            role="status"
          >
            {fileWarning}
          </p>
        ) : null}
        {showFileInfo ? (
          <p className="text-xs text-[#56524B] mt-2">
            {fileName}
            {uploadedFileSize !== null
              ? ` · ${formatFileSize(uploadedFileSize)}`
              : null}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={`material-content-${topicId}`}
          className="block text-xs font-medium text-[#56524B] mb-1.5"
        >
          Content
        </label>
        <textarea
          id={`material-content-${topicId}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          disabled={isParsing}
          placeholder="Lecture notes, syllabus points, past questions, summaries, weak areas..."
          className={`${FIELD} py-3 resize-y disabled:opacity-60`}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isParsing || (!isDirty && saveState === "idle")}
          className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1A1A17] text-white text-sm font-medium transition-colors hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
        >
          {saveState === "saved" ? "Saved" : "Save"}
        </button>
        {saveState === "saved" ? (
          <span className="text-xs font-medium text-[#137333]" role="status">
            Material saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
