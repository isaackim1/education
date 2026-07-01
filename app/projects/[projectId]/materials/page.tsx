"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ProjectMaterialCard from "@/components/project/ProjectMaterialCard";
import ProjectShell from "@/components/project/ProjectShell";
import ProjectTopicManager from "@/components/project/ProjectTopicManager";
import TopicSuggestionPanel from "@/components/project/TopicSuggestionPanel";
import {
  CenteredNotice,
  EmptyState,
  Eyebrow,
  ghostLink,
  PageHeader,
  PageShell,
  PrimaryActionCard,
  primaryAction,
  StatusPill,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";

type MaterialsTab = "upload" | "files" | "topics";

const TABS: { id: MaterialsTab; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "files", label: "Files" },
  { id: "topics", label: "Topics" },
];

export default function ProjectMaterialsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const {
    project,
    topics,
    isLoaded: projectLoaded,
    addTopic,
    deleteTopic,
  } = useProject(params.projectId);
  const {
    materials,
    isLoaded: materialsLoaded,
    getMaterialsForTopic,
    saveTopicMaterial,
  } = useProjectMaterials(params.projectId);

  const [tab, setTab] = useState<MaterialsTab>("files");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Live state of the mounted editor, so we can guard topic switches against
  // discarding unsaved drafts or interrupting an in-progress file import.
  const editorStateRef = useRef<{ isDirty: boolean; isParsing: boolean }>({
    isDirty: false,
    isParsing: false,
  });
  const [isParsing, setIsParsing] = useState(false);
  // Tab is initialized once from the URL (?tab=) or topic count; later topic
  // changes must not yank the user between tabs.
  const didInitTab = useRef(false);

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

  // Switch tabs, but guard leaving Files: it hosts the material editor, and an
  // unguarded switch would silently unmount it and drop an unsaved draft or an
  // in-progress import. Mirrors the selectTopic guard.
  function selectTab(next: MaterialsTab) {
    if (next === tab) return;
    if (tab === "files") {
      const { isDirty, isParsing: parsing } = editorStateRef.current;
      // Never interrupt an in-progress import — the parse would be lost.
      if (parsing) return;
      // Confirm before discarding unsaved edits; no silent loss.
      if (
        isDirty &&
        !window.confirm(
          "You have unsaved changes to this topic's material. Discard them and switch tabs?"
        )
      ) {
        return;
      }
      // Leaving Files unmounts the editor; clear its now-stale state.
      editorStateRef.current = { isDirty: false, isParsing: false };
      setIsParsing(false);
    }
    setTab(next);
    // Reflect the tab in the URL so it survives refresh and is deep-linkable.
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`
    );
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

  // Pick the initial tab exactly once, after data loads: honor an explicit
  // ?tab= deep link (e.g. /setup redirects to ?tab=topics), otherwise start on
  // Upload when there is nothing to show under Files. Runs once, so deleting the
  // last topic later never yanks the user between tabs.
  useEffect(() => {
    if (didInitTab.current) return;
    if (!(materialsLoaded && projectLoaded)) return;
    didInitTab.current = true;
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab === "upload" || urlTab === "files" || urlTab === "topics") {
      setTab(urlTab);
    } else if (topics.length === 0) {
      setTab("upload");
    }
  }, [materialsLoaded, projectLoaded, topics.length]);

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
        <Link href="/projects" className={`${ghostLink} mt-4 -ml-3`}>
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
        eyebrow="Materials"
        title="Your exam material library"
        description="Upload notes, slides, and past papers. Ivvy uses these materials to coach you — extracting topics and attaching material to each one."
        action={
          <Link
            href={`/projects/${params.projectId}/import`}
            className={primaryAction}
          >
            Upload once
          </Link>
        }
      />

      {/* Internal section tabs — Upload / Files / Topics (editorial underline) */}
      <div className="mb-8 flex flex-wrap items-center gap-1 border-b border-[#E7E3DA]">
        {TABS.map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              aria-current={isActive ? "true" : undefined}
              className={`relative inline-flex h-10 items-center rounded-md px-3.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4] ${
                isActive
                  ? "font-medium text-[#1A1A17]"
                  : "text-[#7A766D] hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
              }`}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2 -bottom-px h-[2px] ${
                  isActive ? "bg-[#1A1A17]" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {tab === "upload" ? (
        <Reveal>
          <div className="space-y-6">
            <PrimaryActionCard
              eyebrow="Recommended"
              title="Upload once and organize"
              description="Upload your notes, slides, and past papers once. Ivvy extracts topics and sorts the material into them, so you can review the whole map before anything is saved."
              action={
                <Link
                  href={`/projects/${params.projectId}/import`}
                  className={primaryAction}
                >
                  Upload once
                </Link>
              }
            />
            <p className="text-sm leading-relaxed text-[#56524B]">
              Already have topics? Use the <strong>Topics</strong> tab to add
              them by hand, or <strong>Files</strong> to review and edit the
              material attached to each topic.
            </p>
          </div>
        </Reveal>
      ) : null}

      {tab === "files" ? (
        topics.length === 0 ? (
          <Reveal>
            <EmptyState
              title="No material yet"
              description="Upload your material once and Ivvy will create topics and attach the material for you."
              action={
                <Link
                  href={`/projects/${params.projectId}/import`}
                  className={primaryAction}
                >
                  Upload once and organize
                </Link>
              }
            />
          </Reveal>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            {/* Topic list */}
            <Reveal className="lg:col-span-4 xl:col-span-3">
              <aside>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Eyebrow>Topics</Eyebrow>
                  <StatusPill tone={savedCount > 0 ? "success" : "neutral"}>
                    {savedCount}/{topics.length}
                  </StatusPill>
                </div>
                <ul className="space-y-1.5">
                  {topics.map((topic) => {
                    const hasMaterial =
                      (getMaterialsForTopic(topic.id)?.content.trim().length ??
                        0) > 0;
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
            </Reveal>

            {/* Selected topic detail */}
            <Reveal delay={80} className="lg:col-span-8 xl:col-span-9">
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
            </Reveal>
          </div>
        )
      ) : null}

      {tab === "topics" ? (
        <Reveal>
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-[#56524B]">
              Topics define what Ivvy trains you on. Add them by hand, or paste
              material to suggest a starting set. The fastest way is still to{" "}
              <button
                type="button"
                onClick={() => selectTab("upload")}
                className="font-medium text-[#1A1A17] underline underline-offset-2 hover:text-black"
              >
                upload once
              </button>{" "}
              and let Ivvy organize.
            </p>
            <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
              <div className="rounded-xl border border-[#E7E3DA] bg-white p-5 sm:p-6">
                <ProjectTopicManager
                  projectId={params.projectId}
                  topics={topics}
                  onAddTopic={addTopic}
                  onDeleteTopic={deleteTopic}
                />
              </div>

              <TopicSuggestionPanel
                projectId={params.projectId}
                subject={project.subject}
                existingTopics={topics}
                onAddTopic={addTopic}
              />
            </div>
          </div>
        </Reveal>
      ) : null}
    </ProjectShell>
  );
}
