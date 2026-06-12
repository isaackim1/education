"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ProjectMaterialCard from "@/components/project/ProjectMaterialCard";
import ProjectShell from "@/components/project/ProjectShell";
import {
  CenteredNotice,
  EmptyState,
  Eyebrow,
  PageHeader,
  PageShell,
  primaryAction,
  StatusPill,
} from "@/components/ui/primitives";
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

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Live state of the mounted editor, so we can guard topic switches against
  // discarding unsaved drafts or interrupting an in-progress file import.
  const editorStateRef = useRef<{ isDirty: boolean; isParsing: boolean }>({
    isDirty: false,
    isParsing: false,
  });
  const [isParsing, setIsParsing] = useState(false);

  const handleEditorStateChange = useCallback(
    (state: { isDirty: boolean; isParsing: boolean }) => {
      editorStateRef.current = state;
      setIsParsing(state.isParsing);
    },
    []
  );

  function selectTopic(topicId: string) {
    if (topicId === selectedTopicId) return;
    const { isDirty, isParsing: parsing } = editorStateRef.current;
    // Never switch away mid-import — the parse would be lost.
    if (parsing) return;
    // Confirm before discarding unsaved edits; no silent loss.
    if (
      isDirty &&
      !window.confirm(
        "You have unsaved changes to this topic's material. Discard them and switch topics?"
      )
    ) {
      return;
    }
    setSelectedTopicId(topicId);
  }

  // Default to the first topic once topics load; keep selection valid if topics change.
  useEffect(() => {
    if (topics.length === 0) {
      setSelectedTopicId(null);
      return;
    }
    setSelectedTopicId((current) =>
      current && topics.some((topic) => topic.id === current)
        ? current
        : topics[0].id
    );
  }, [topics]);

  const isLoaded = projectLoaded && materialsLoaded;

  if (!isLoaded) {
    return <CenteredNotice>Loading materials…</CenteredNotice>;
  }

  if (!project) {
    return (
      <PageShell width="max-w-lg">
        <h1 className="font-serif text-[34px] leading-[1.08] tracking-[-0.01em] text-[#1A1A17]">
          Project not found
        </h1>
        <Link
          href="/projects"
          className="mt-4 inline-flex h-9 -ml-3 items-center rounded-full px-3 text-sm text-[#56524B] transition-colors duration-200 hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
        >
          Back to projects
        </Link>
      </PageShell>
    );
  }

  const savedCount = materials.filter(
    (m) => m.content.trim().length > 0
  ).length;
  const selectedTopic =
    topics.find((topic) => topic.id === selectedTopicId) ?? null;

  return (
    <ProjectShell projectId={params.projectId} active="materials">
      <PageHeader
        eyebrow="Source material"
        title="Materials"
        description="Review and edit the material attached to each topic. The fastest way to add material is the upload-once flow — Ivvy creates topics and attaches material at the same time."
        action={
          <Link
            href={`/projects/${params.projectId}/import`}
            className={primaryAction}
          >
            Upload once
          </Link>
        }
      />

      {topics.length === 0 ? (
        <EmptyState
          title="No topics yet"
          description="Upload your material once and Ivvy will create topics and attach the material for you. You can also add topics manually first."
          action={
            <Link
              href={`/projects/${params.projectId}/import`}
              className={primaryAction}
            >
              Upload once and organize
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Topic list */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <Eyebrow>Topics</Eyebrow>
              <StatusPill tone={savedCount > 0 ? "success" : "neutral"}>
                {savedCount}/{topics.length}
              </StatusPill>
            </div>
            <ul className="space-y-1.5">
              {topics.map((topic) => {
                const hasMaterial =
                  (getMaterialsForTopic(topic.id)?.content.trim().length ?? 0) >
                  0;
                const isActive = topic.id === selectedTopicId;
                // While a file import is running, lock other topics so the
                // in-progress parse can't be discarded by a switch.
                const isLocked = isParsing && !isActive;
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => selectTopic(topic.id)}
                      disabled={isLocked}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-50 ${
                        isActive
                          ? "border-[#1A1A17] bg-white"
                          : "border-[#E7E3DA] bg-white hover:border-[#D8D3C8] hover:bg-[#FBFAF7]"
                      }`}
                    >
                      <span className="truncate text-sm font-medium text-[#1A1A17]">
                        {topic.name}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          hasMaterial ? "bg-[#137333]" : "bg-[#D8D3C8]"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Selected topic detail */}
          <div className="lg:col-span-8 xl:col-span-9">
            {selectedTopic ? (
              <ProjectMaterialCard
                key={selectedTopic.id}
                topicName={selectedTopic.name}
                topicId={selectedTopic.id}
                material={getMaterialsForTopic(selectedTopic.id)}
                onSave={saveTopicMaterial}
                onStateChange={handleEditorStateChange}
              />
            ) : null}
          </div>
        </div>
      )}
    </ProjectShell>
  );
}
