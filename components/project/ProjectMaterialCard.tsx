"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Material } from "@/lib/types";
import type { SaveTopicMaterialInput } from "@/hooks/useProjectMaterials";

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
  const [title, setTitle] = useState(material?.title ?? defaultTitle);
  const [content, setContent] = useState(material?.content ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setTitle(material?.title ?? defaultTitle);
    setContent(material?.content ?? "");
  }, [material?.title, material?.content, defaultTitle]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      topicId,
      title: title.trim() || defaultTitle,
      content,
    });
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  const savedTitle = material?.title ?? defaultTitle;
  const savedContent = material?.content ?? "";
  const isDirty = title !== savedTitle || content !== savedContent;

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
          placeholder="Paste syllabus, lecture notes, past questions, marking criteria, textbook summaries, and personal weak points..."
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
