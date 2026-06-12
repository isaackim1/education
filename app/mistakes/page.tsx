"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MistakeRow from "@/components/mistakes/MistakeRow";
import { useMistakes } from "@/hooks/useMistakes";

export default function MistakesPage() {
  const { mistakes, markReviewed, isLoaded } = useMistakes();
  const [topicFilter, setTopicFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unreviewed" | "reviewed"
  >("all");

  const uniqueTopics = useMemo(
    () =>
      Array.from(new Set(mistakes.map((m) => m.topicName))).sort(),
    [mistakes]
  );

  const filteredMistakes = useMemo(() => {
    return mistakes
      .filter((m) => topicFilter === "all" || m.topicName === topicFilter)
      .filter((m) => {
        if (statusFilter === "unreviewed") return !m.reviewed;
        if (statusFilter === "reviewed") return m.reviewed;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [mistakes, topicFilter, statusFilter]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/projects"
          className="text-sm text-neutral-500 underline hover:text-black"
        >
          ← Back to projects
        </Link>

        <header className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Mistake Bank{" "}
            <span className="text-base font-normal text-neutral-500">
              ({mistakes.length})
            </span>
          </h1>
        </header>

        <div className="flex gap-3 items-center mt-4 mb-6">
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="border border-neutral-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All topics</option>
            {uniqueTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | "unreviewed" | "reviewed"
              )
            }
            className="border border-neutral-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        {filteredMistakes.length === 0 && mistakes.length === 0 && (
          <p className="text-sm text-neutral-600">
            No mistakes saved yet. Mistakes are saved during study sessions when
            the coach flags an error and you click Save as mistake.
          </p>
        )}

        {filteredMistakes.length === 0 && mistakes.length > 0 && (
          <p className="text-sm text-neutral-600">
            No mistakes match this filter.
          </p>
        )}

        {filteredMistakes.length > 0 && (
          <div>
            {filteredMistakes.map((mistake) => (
              <MistakeRow
                key={mistake.id}
                mistake={mistake}
                onMarkReviewed={markReviewed}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
