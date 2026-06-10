"use client";

import Link from "next/link";
import ProjectMaterialCard from "@/components/project/ProjectMaterialCard";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";

export default function ProjectMaterialsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { project, topics, isLoaded: projectLoaded } = useProject(
    params.projectId
  );
  const {
    materials,
    isLoaded: materialsLoaded,
    getMaterialsForTopic,
    saveTopicMaterial,
  } = useProjectMaterials(params.projectId);

  const isLoaded = projectLoaded && materialsLoaded;

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading materials...</p>
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

  if (topics.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <ProjectWorkspaceNav
            projectId={params.projectId}
            active="materials"
          />

          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Materials
            </h1>
            <p className="text-sm text-neutral-600 mt-2">
              Add topics first. Ivvy needs topics before it can attach your
              notes and ask focused questions.
            </p>
          </header>

          <Link
            href={`/projects/${params.projectId}/setup`}
            className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors"
          >
            Add topics
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ProjectWorkspaceNav
          projectId={params.projectId}
          active="materials"
        />

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Materials
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Ivvy uses these notes to ask better exam questions. Add lecture
            notes, summaries, syllabus points, or past questions per topic.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Text files only for now: .txt, .md, .csv, .json, .html. PDF and
            DOCX support comes later.
          </p>
        </header>

        <div className="space-y-6">
          {topics.map((topic) => (
            <ProjectMaterialCard
              key={topic.id}
              topicName={topic.name}
              topicId={topic.id}
              material={getMaterialsForTopic(topic.id)}
              onSave={saveTopicMaterial}
            />
          ))}
        </div>

        {materials.length > 0 ? (
          <p className="text-xs text-neutral-500 mt-6">
            {materials.filter((m) => m.content.trim().length > 0).length} of{" "}
            {topics.length} topics have saved materials.
          </p>
        ) : null}
      </div>
    </main>
  );
}
