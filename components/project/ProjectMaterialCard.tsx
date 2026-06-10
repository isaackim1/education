"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import type { Material } from "@/lib/types";
import type { SaveTopicMaterialInput } from "@/hooks/useProjectMaterials";
import { parseMaterialFile } from "@/lib/material-file-parser";

const FIELD =
  "w-full rounded-lg border border-[#C4C7C5] bg-white px-4 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectMaterialCard({
  topicName,
  topicId,
  material,
  onSave,
}: {
  topicName: string;
  topicId: string;
  material: Material | null;
  onSave: (input: SaveTopicMaterialInput) => void;
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
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(
    null
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  const [parsingFileName, setParsingFileName] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  const isParsing = parsingFileName !== null;

  useEffect(() => {
    setTitle(material?.title ?? defaultTitle);
    setContent(material?.content ?? "");
    setSource(material?.source ?? "paste");
    setFileName(material?.fileName ?? "");
    setFileType(material?.fileType ?? "");
    setUploadedFileSize(null);
    setFileError(null);
    setFileWarning(null);
    setParsingFileName(null);
  }, [
    material?.title,
    material?.content,
    material?.source,
    material?.fileName,
    material?.fileType,
    defaultTitle,
  ]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setFileError(null);
    setFileWarning(null);

    if (!file) return;

    // Capture size up front; parsing failures must not overwrite existing state.
    const fileSize = file.size;
    setParsingFileName(file.name);

    try {
      const parsed = await parseMaterialFile(file);
      setContent(parsed.content);
      setSource("file");
      setFileName(parsed.fileName);
      setFileType(parsed.fileType || "text/plain");
      setUploadedFileSize(fileSize);
      setFileWarning(parsed.truncated || parsed.warning ? parsed.warning ?? null : null);

      const currentTitle = title.trim();
      if (!currentTitle || currentTitle === defaultTitle) {
        setTitle(parsed.fileName);
      }
    } catch (err) {
      // Preserve existing content, fileName, source, and fileType on failure.
      setFileError(
        err instanceof Error
          ? err.message
          : "Could not read this file. Try a different file or paste the text."
      );
    } finally {
      setParsingFileName(null);
    }
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

  const showFileInfo =
    source === "file" && fileName.length > 0 && content.length > 0;

  const hasSavedContent = savedContent.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E1E3E1] bg-white p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-medium text-[#1F1F1F]">{topicName}</h3>
        {hasSavedContent ? (
          <span className="inline-flex items-center rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-xs font-medium text-[#137333]">
            Saved
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-[#F1F3F4] px-2.5 py-0.5 text-xs font-medium text-[#5F6368]">
            Empty
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor={`material-title-${topicId}`}
          className="block text-xs font-medium text-[#5F6368] mb-1.5"
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
        <span className="block text-xs font-medium text-[#5F6368] mb-1.5">
          Upload file
        </span>
        <input
          ref={fileInputRef}
          type="file"
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
          className="inline-flex items-center h-9 px-4 rounded-full border border-[#C4C7C5] text-sm text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
        >
          {isParsing ? "Extracting…" : "Choose file"}
        </button>
        <p className="text-xs text-[#80868B] mt-1.5">
          TXT, MD, CSV, JSON, HTML &mdash; max 500 KB. PDF, DOCX &mdash; max 5 MB,
          selectable text only.
        </p>
        {isParsing ? (
          <p className="mt-2 text-xs text-[#5F6368]" role="status">
            Extracting text from {parsingFileName}…
          </p>
        ) : null}
        {fileError ? (
          <p
            className="mt-2 rounded-lg bg-[#F9DEDC] px-3 py-2 text-xs text-[#410E0B]"
            role="alert"
          >
            {fileError}
          </p>
        ) : null}
        {fileWarning && !isParsing ? (
          <p
            className="mt-2 rounded-lg bg-[#FEEFC3] px-3 py-2 text-xs text-[#B06000]"
            role="status"
          >
            {fileWarning}
          </p>
        ) : null}
        {showFileInfo ? (
          <p className="text-xs text-[#5F6368] mt-2">
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
          className="block text-xs font-medium text-[#5F6368] mb-1.5"
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
          className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
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
