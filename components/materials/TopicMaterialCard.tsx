"use client";

import { useEffect, useState } from "react";
import type { Topic } from "@/lib/types";

interface TopicMaterialCardProps {
  topic: Topic;
  onSave: (topicId: string, notes: string, pastQuestions: string) => void;
}

export default function TopicMaterialCard({
  topic,
  onSave,
}: TopicMaterialCardProps) {
  const [notes, setNotes] = useState(topic.notes);
  const [pastQuestions, setPastQuestions] = useState(topic.pastQuestions);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setNotes(topic.notes);
    setPastQuestions(topic.pastQuestions);
  }, [topic.notes, topic.pastQuestions]);

  function handleSave() {
    onSave(topic.id, notes, pastQuestions);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  const isDirty =
    notes !== topic.notes || pastQuestions !== topic.pastQuestions;

  return (
    <div className="border border-neutral-200 rounded p-4 space-y-4">
      <h3 className="text-sm font-medium">{topic.name}</h3>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Key definitions, formulas, relationships..."
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-black"
        />
        <p className="text-xs text-neutral-400 mt-1">
          Aim for 200–500 characters. The AI receives this during study
          sessions.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">
          Past exam questions for this topic
        </label>
        <textarea
          value={pastQuestions}
          onChange={(e) => setPastQuestions(e.target.value)}
          rows={3}
          placeholder="Paste topic-specific past questions here..."
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty && saveState === "idle"}
        className="text-xs border border-neutral-300 rounded px-3 py-1.5 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saveState === "saved" ? "Saved" : "Save"}
      </button>
    </div>
  );
}
