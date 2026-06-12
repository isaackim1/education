"use client";

import Link from "next/link";
import ProjectMaterialCard from "@/components/project/ProjectMaterialCard";
import ProjectWorkspaceNav from "@/components/project/ProjectWorkspaceNav";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";

const PRIMARY_ACTION =
  "inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-[#1F1F1F] text-white text-sm font-medium transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const SECONDARY_ACTION =
  "inline-flex items-center justify-center h-10 px-5 rounded-full border border-[#C4C7C5] text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const INLINE_LINK =
  "inline-flex items-center h-9 -ml-1 mt-3 px-3 rounded-full text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

const BACK_LINK =
  "inline-flex items-center h-9 -ml-3 px-3 mt-4 rounded-full text-sm text-[#5F6368] transition-colors hover:bg-[#F1F3F4] hover:text-[#1F1F1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2";

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
      <main className="min-h-screen bg-[#F8FAFD] flex items-center justify-center">
        <p className="text-sm text-[#5F6368]">Loading materials...</p>
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
          <Link href="/projects" className={BACK_LINK}>
            Back to projects
          </Link>
        </div>
      </main>
    );
  }

  if (topics.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8FAFD]">
        <div className="max-w-2xl mx-auto px-4 py-10 sm:py-12">
          <ProjectWorkspaceNav projectId={params.projectId} active="materials" />

          <header className="mb-6">
            <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
              Materials
            </h1>
            <p className="text-sm text-[#5F6368] mt-2">
              The quickest way to add materials is the upload-once flow — Ivvy
              creates your topics and organizes the material at the same time.
            </p>
          </header>

          <div className="rounded-2xl border border-[#E1E3E1] bg-white px-6 py-14 text-center">
            <h2 className="text-base font-medium text-[#1F1F1F]">
              No topics yet
            </h2>
            <p className="text-sm text-[#5F6368] mt-2 mx-auto max-w-sm">
              Upload your material once and Ivvy will create topics and attach
              the material for you. You can also add topics manually first.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/projects/${params.projectId}/import`}
                className={PRIMARY_ACTION}
              >
                Upload once and organize materials
              </Link>
              <Link
                href={`/projects/${params.projectId}/setup`}
                className={SECONDARY_ACTION}
              >
                Add topics manually
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const savedCount = materials.filter(
    (m) => m.content.trim().length > 0
  ).length;

  return (
    <main className="min-h-screen bg-[#F8FAFD]">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-12">
        <ProjectWorkspaceNav projectId={params.projectId} active="materials" />

        <header className="mb-6">
          <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-[#1F1F1F]">
            Materials
          </h1>
          <p className="text-sm text-[#5F6368] mt-2">
            Review and edit the material attached to each topic. Materials can be
            added automatically from the upload-once import flow, or edited
            manually here.
          </p>
          <Link
            href={`/projects/${params.projectId}/import`}
            className={INLINE_LINK}
          >
            Use upload-once import instead &rarr;
          </Link>
          <p className="mt-3 text-xs text-[#5F6368]">
            Supported formats: TXT, MD, CSV, JSON, HTML, PDF, DOCX. PDF and DOCX
            import selectable text only — scanned or image-only PDFs aren&apos;t
            supported yet.
          </p>
        </header>

        <div className="space-y-4">
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
          <p className="text-xs text-[#80868B] mt-6">
            {savedCount} of {topics.length} topics have saved materials.
          </p>
        ) : null}
      </div>
    </main>
  );
}
