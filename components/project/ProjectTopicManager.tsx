"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { Topic } from "@/lib/types";

export default function ProjectTopicManager({
  projectId,
  topics,
  onAddTopic,
  onDeleteTopic,
}: {
  projectId: string;
  topics: Topic[];
  onAddTopic: (name: string) => void;
  onDeleteTopic: (topicId: string) => void;
}) {
  const [topicName, setTopicName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onAddTopic(topicName);
    setTopicName("");
  }

  function handleDelete(topicId: string) {
    if (window.confirm("Delete this topic and its saved material?")) {
      onDeleteTopic(topicId);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          aria-label="Topic name"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="e.g. Monetary policy"
          className="flex-1 border border-neutral-300 rounded px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
        />
        <button
          type="submit"
          className="border border-neutral-300 text-sm px-4 py-2 rounded hover:border-black transition-colors text-black shrink-0"
        >
          Add topic
        </button>
      </form>

      {topics.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No topics yet. Add the areas your exam covers.
        </p>
      ) : (
        <ul className="space-y-2">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between gap-4 border border-neutral-200 rounded px-3 py-2"
            >
              <span className="text-sm text-black">{topic.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(topic.id)}
                className="text-sm text-neutral-500 hover:text-black transition-colors shrink-0"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {topics.length > 0 ? (
        <Link
          href={`/projects/${projectId}/materials`}
          className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
        >
          Add materials →
        </Link>
      ) : null}
    </div>
  );
}
