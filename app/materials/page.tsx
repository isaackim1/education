"use client";

import Link from "next/link";
import TopicMaterialCard from "@/components/materials/TopicMaterialCard";
import { useTopics } from "@/hooks/useTopics";

export default function MaterialsPage() {
  const { topics, updateTopicState, isLoaded } = useTopics();

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
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href="/plan"
            className="text-sm text-neutral-500 underline hover:text-black"
          >
            ← Back to plan
          </Link>
          <p className="text-sm text-neutral-600 mt-8">
            No topics found. Set up your exam first.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/plan"
          className="text-sm text-neutral-500 underline hover:text-black"
        >
          ← Back to plan
        </Link>

        <header className="mt-4 mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Materials</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Add notes and past questions per topic. The AI coach uses this
            during study sessions.
          </p>
        </header>

        <div className="space-y-6">
          {topics.map((topic) => (
            <TopicMaterialCard
              key={topic.id}
              topic={topic}
              onSave={handleSave}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
