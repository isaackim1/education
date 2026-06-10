"use client";

import Link from "next/link";
import ProjectTopicManager from "@/components/project/ProjectTopicManager";
import TopicSuggestionPanel from "@/components/project/TopicSuggestionPanel";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";

export default function ProjectSetupPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded, addTopic, deleteTopic } = useProject(
    params.projectId
  );

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
        <p className="text-sm text-[#5F6368]">Loading project topics...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#F8FAFD]">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="setup" />

        <header className="mb-6">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            Topics
          </h1>
          <p className="text-sm text-[#5F6368] mt-2">
            Topics define what Ivvy should train you on. Add what the exam
            actually tests &mdash; smaller topics produce sharper questions.
          </p>
        </header>

        <div className="space-y-5">
          <TopicSuggestionPanel
            projectId={params.projectId}
            subject={project.subject}
            existingTopics={topics}
            onAddTopic={addTopic}
          />

          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
            <ProjectTopicManager
              projectId={params.projectId}
              topics={topics}
              onAddTopic={addTopic}
              onDeleteTopic={deleteTopic}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
