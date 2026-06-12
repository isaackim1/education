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
          className="flex-1 h-12 rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#7A766D] transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#E7E3DA] text-sm font-medium text-[#1A1A17] shrink-0 transition-colors hover:bg-[#D8D3C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
        >
          Add topic
        </button>
      </form>

      {topics.length === 0 ? (
        <p className="text-sm text-[#56524B]">
          No topics yet. Add the areas your exam covers.
        </p>
      ) : (
        <ul className="space-y-2">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-[#E7E3DA] bg-[#FAF8F4] px-4 py-3"
            >
              <span className="text-sm text-[#1A1A17]">{topic.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(topic.id)}
                className="inline-flex items-center h-9 px-3 rounded-full text-sm text-[#56524B] shrink-0 transition-colors hover:bg-[#E7E3DA] hover:text-[#B3261E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
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
          className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1A1A17] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2"
        >
          Add materials
        </Link>
      ) : null}
    </div>
  );
}
