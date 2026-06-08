"use client";

import Link from "next/link";
import { useState } from "react";
import TopicMaterialCard from "@/components/materials/TopicMaterialCard";
import { useTopics } from "@/hooks/useTopics";

export default function MaterialsPage() {
  const { topics, updateTopicState, isLoaded } = useTopics();
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  function handleSave(topicId: string, notes: string, pastQuestions: string) {
    updateTopicState(topicId, { notes, pastQuestions });
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading...</p>
      </main>
    );
  }

  if (topics.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-neutral-200 px-4 py-4">
          <Link
            href="/plan"
            className="text-sm text-neutral-500 underline hover:text-black"
          >
            ← Back to plan
          </Link>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-sm text-neutral-600">
            No topics found. Set up your exam first.
          </p>
        </div>
      </main>
    );
  }

  const activeTopic = topics.find((t) => t.id === activeTopicId) ?? topics[0];

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-neutral-200 px-4 py-4 flex items-center justify-between">
        <Link
          href="/plan"
          className="text-sm text-neutral-500 underline hover:text-black"
        >
          ← Back to plan
        </Link>
        <h1 className="text-sm font-semibold">Materials</h1>
        <div className="w-24" />
      </div>

      <div className="max-w-6xl mx-auto flex min-h-[calc(100vh-57px)]">
        <nav className="w-48 shrink-0 border-r border-neutral-200 py-2 hidden sm:block">
          <p className="px-4 py-2 text-xs font-semibold text-neutral-500">
            Topics
          </p>
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setActiveTopicId(topic.id)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                activeTopic.id === topic.id
                  ? "bg-neutral-100 font-medium text-black"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {topic.name}
            </button>
          ))}
        </nav>

        <div className="flex-1 px-6 py-6">
          <div className="sm:hidden mb-4">
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Topic
            </label>
            <select
              value={activeTopic.id}
              onChange={(e) => setActiveTopicId(e.target.value)}
              className="border border-neutral-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-black"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-lg font-semibold mb-4">{activeTopic.name}</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Add notes and past questions. The AI coach uses this during study sessions.
          </p>
          <TopicMaterialCard
            key={activeTopic.id}
            topic={activeTopic}
            onSave={handleSave}
          />
        </div>
      </div>
    </main>
  );
}
