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
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          aria-label="Topic name"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="e.g. Monetary policy"
          className="flex-1 h-12 rounded-lg border border-[#C4C7C5] bg-white px-4 text-sm text-[#1F1F1F] placeholder:text-[#80868B] transition-colors focus-visible:outline-none focus-visible:border-[#1F1F1F] focus-visible:ring-2 focus-visible:ring-[#1F1F1F]/15"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#E8EAED] text-sm font-medium text-[#1F1F1F] shrink-0 transition-colors hover:bg-[#DADCE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
        >
          Add topic
        </button>
      </form>

      {topics.length === 0 ? (
        <p className="text-sm text-[#5F6368]">
          No topics yet. Add the areas your exam covers.
        </p>
      ) : (
        <ul className="space-y-2">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-[#E1E3E1] bg-[#F8FAFD] px-4 py-3"
            >
              <span className="text-sm text-[#1F1F1F]">{topic.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(topic.id)}
                className="inline-flex items-center h-9 px-3 rounded-full text-sm text-[#5F6368] shrink-0 transition-colors hover:bg-[#E8EAED] hover:text-[#B3261E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
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
          className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
        >
          Add materials
        </Link>
      ) : null}
    </div>
  );
}
