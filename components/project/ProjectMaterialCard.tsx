"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import type { Material } from "@/lib/types";
import type { SaveTopicMaterialInput } from "@/hooks/useProjectMaterials";

const MAX_FILE_SIZE = 500 * 1024;

const SUPPORTED_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".html"] as const;

const UNSUPPORTED_FILE_MESSAGE =
  "This version supports text-based files only: .txt, .md, .csv, .json, .html. PDF and DOCX support will come later.";

const FIELD =
  "w-full rounded-lg border border-[#C4C7C5] bg-white px-4 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15";

function getFileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return "";
  return fileName.slice(dot).toLowerCase();
}

function isSupportedFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return SUPPORTED_EXTENSIONS.includes(
    ext as (typeof SUPPORTED_EXTENSIONS)[number]
  );
}

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
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setTitle(material?.title ?? defaultTitle);
    setContent(material?.content ?? "");
    setSource(material?.source ?? "paste");
    setFileName(material?.fileName ?? "");
    setFileType(material?.fileType ?? "");
    setUploadedFileSize(null);
    setFileError(null);
  }, [
    material?.title,
    material?.content,
    material?.source,
    material?.fileName,
    material?.fileType,
    defaultTitle,
  ]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setFileError(null);

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
      );
      return;
    }

    if (!isSupportedFile(file)) {
      setFileError(UNSUPPORTED_FILE_MESSAGE);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setContent(text);
      setSource("file");
      setFileName(file.name);
      setFileType(file.type || "text/plain");
      setUploadedFileSize(file.size);

      const currentTitle = title.trim();
      if (!currentTitle || currentTitle === defaultTitle) {
        setTitle(file.name);
      }
    };
    reader.onerror = () => {
      setFileError("Could not read this file. Try a different file or paste the text.");
    };
    reader.readAsText(file);
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
          accept=".txt,.md,.csv,.json,.html,text/plain,text/markdown,text/csv,application/json,text/html"
          onChange={handleFileChange}
          className="sr-only"
          id={`material-file-${topicId}`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center h-9 px-4 rounded-full border border-[#C4C7C5] text-sm text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
        >
          Choose file
        </button>
        <p className="text-xs text-[#80868B] mt-1.5">
          .txt, .md, .csv, .json, .html &mdash; max {formatFileSize(MAX_FILE_SIZE)}
        </p>
        {fileError ? (
          <p
            className="mt-2 rounded-lg bg-[#F9DEDC] px-3 py-2 text-xs text-[#410E0B]"
            role="alert"
          >
            {fileError}
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
          placeholder="Lecture notes, syllabus points, past questions, summaries, weak areas..."
          className={`${FIELD} py-3 resize-y`}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty && saveState === "idle"}
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
