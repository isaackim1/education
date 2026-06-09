"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import type { Material } from "@/lib/types";
import type { SaveTopicMaterialInput } from "@/hooks/useProjectMaterials";

const MAX_FILE_SIZE = 500 * 1024;

const SUPPORTED_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".html"] as const;

const UNSUPPORTED_FILE_MESSAGE =
  "This version supports text-based files only: .txt, .md, .csv, .json, .html. PDF and DOCX support will come later.";

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

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-200 rounded p-4 space-y-4"
    >
      <h3 className="text-sm font-medium text-black">{topicName}</h3>

      <div>
        <label
          htmlFor={`material-title-${topicId}`}
          className="block text-xs font-medium text-neutral-500 mb-1"
        >
          Title
        </label>
        <input
          id={`material-title-${topicId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <span className="block text-xs font-medium text-neutral-500 mb-1">
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
          className="text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black transition-colors"
        >
          Choose file
        </button>
        <p className="text-xs text-neutral-400 mt-1">
          .txt, .md, .csv, .json, .html — max {formatFileSize(MAX_FILE_SIZE)}
        </p>
        {fileError ? (
          <p className="text-xs text-red-600 mt-2" role="alert">
            {fileError}
          </p>
        ) : null}
        {showFileInfo ? (
          <p className="text-xs text-neutral-500 mt-2">
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
          className="block text-xs font-medium text-neutral-500 mb-1"
        >
          Content
        </label>
        <textarea
          id={`material-content-${topicId}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Paste or upload syllabus, lecture notes, past questions, marking criteria, textbook summaries, and personal weak points..."
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-black"
        />
        <p className="text-xs text-neutral-400 mt-1">
          Include syllabus, lecture notes, past questions, marking criteria,
          textbook summaries, and weak points.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty && saveState === "idle"}
          className="text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saveState === "saved" ? "Saved" : "Save"}
        </button>
        {saveState === "saved" ? (
          <span className="text-xs text-neutral-500" role="status">
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
