"use client";

import Link from "next/link";
import ProjectTopicManager from "@/components/project/ProjectTopicManager";
import TopicSuggestionPanel from "@/components/project/TopicSuggestionPanel";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

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
            Topics define what Ivvy should train you on. The fastest way to build
            them is to upload your material once and let Ivvy organize it.
          </p>
        </header>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
            <span className="inline-flex items-center rounded-full bg-[#E6F4EA] px-2.5 py-1 text-xs font-medium text-[#137333]">
              Recommended
            </span>
            <h2 className="mt-3 text-lg font-medium text-[#1F1F1F]">
              Upload once and organize materials
            </h2>
            <p className="mt-1 text-sm text-[#5F6368]">
              Upload your materials once. Ivvy will extract topics and organize
              the material for you, so you can review everything before it&apos;s
              saved.
            </p>
            <Link
              href={`/projects/${params.projectId}/import`}
              className={`${PRIMARY_ACTION} mt-4`}
            >
              Upload once and organize materials
            </Link>
          </section>

          <div className="pt-1">
            <h2 className="text-sm font-medium text-[#5F6368]">
              Or add topics manually
            </h2>
            <p className="mt-1 text-sm text-[#80868B]">
              Prefer to build your topic list by hand? Add topics directly, or
              paste material to suggest a starting set.
            </p>
          </div>

          <section className="rounded-2xl border border-[#E1E3E1] bg-white p-5 sm:p-6">
            <ProjectTopicManager
              projectId={params.projectId}
              topics={topics}
              onAddTopic={addTopic}
              onDeleteTopic={deleteTopic}
            />
          </section>

          <TopicSuggestionPanel
            projectId={params.projectId}
            subject={project.subject}
            existingTopics={topics}
            onAddTopic={addTopic}
          />
        </div>
      </div>
    </main>
  );
}
