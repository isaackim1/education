"use client";

import Link from "next/link";
import ProjectTopicManager from "@/components/project/ProjectTopicManager";
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
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading project topics...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-4 py-12">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Project not found
          </h1>
          <Link
            href="/projects"
            className="inline-block text-sm text-neutral-500 hover:text-black transition-colors mt-4"
          >
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="setup" />

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Project topics
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Topics help Ivvy organize your materials, mistakes, and future
            training.
          </p>
        </header>

        <ProjectTopicManager
          projectId={params.projectId}
          topics={topics}
          onAddTopic={addTopic}
          onDeleteTopic={deleteTopic}
        />
      </div>
    </main>
  );
}
