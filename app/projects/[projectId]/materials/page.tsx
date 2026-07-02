"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ProjectMaterialCard from "@/components/project/ProjectMaterialCard";
import ProjectShell from "@/components/project/ProjectShell";
import ProjectTopicManager from "@/components/project/ProjectTopicManager";
import TopicSuggestionPanel from "@/components/project/TopicSuggestionPanel";
import {
  CenteredNotice,
  ghostLink,
  PageShell,
  primaryAction,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { useProject } from "@/hooks/useProject";
import { useProjectMaterials } from "@/hooks/useProjectMaterials";
import { computeTopicCoverage } from "@/lib/dashboard-metrics";
import { getProjectMistakes } from "@/lib/project-storage";
import type { Mistake } from "@/lib/types";

/**
 * Materials — the exam data center: what Ivvy learns from, and whether it
 * covers the exam. Three tabs (Files / Topics / Coverage); uploading is a
 * single action in the header, not a tab.
 */

type MaterialsTab = "files" | "topics" | "coverage";

const TABS: { id: MaterialsTab; label: string }[] = [
  { id: "files", label: "Files" },
  { id: "topics", label: "Topics" },
  { id: "coverage", label: "Coverage" },
];

const LABEL =
  "text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]";

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
  const [mistakes, setMistakes] = useState<Mistake[]>([]);

  const [tab, setTab] = useState<MaterialsTab>("files");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  useEffect(() => {
    setMistakes(getProjectMistakes(params.projectId));
  }, [params.projectId]);

  // Live state of the mounted editor, so we can guard topic switches against
  // discarding unsaved drafts or interrupting an in-progress file import.
  const editorStateRef = useRef<{ isDirty: boolean; isParsing: boolean }>({
    isDirty: false,
    isParsing: false,
  });
  const [isParsing, setIsParsing] = useState(false);
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
    if (parsing) return;
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

  // Guard leaving Files: it hosts the material editor, and an unguarded switch
  // would silently drop an unsaved draft or an in-progress import.
  function selectTab(next: MaterialsTab) {
    if (next === tab) return;
    if (tab === "files") {
      const { isDirty, isParsing: parsing } = editorStateRef.current;
      if (parsing) return;
      if (
        isDirty &&
        !window.confirm(
          "You have unsaved changes to this topic's material. Discard them and switch tabs?"
        )
      ) {
        return;
      }
      editorStateRef.current = { isDirty: false, isParsing: false };
      setIsParsing(false);
    }
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", next);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }

  // Default to the first topic once topics load; keep selection valid.
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

  // Pick the initial tab exactly once: honor ?tab= deep links (legacy
  // ?tab=upload routes to Files, whose empty state points at Upload).
  useEffect(() => {
    if (didInitTab.current) return;
    if (!(materialsLoaded && projectLoaded)) return;
    didInitTab.current = true;
    const urlTab = new URLSearchParams(window.location.search).get("tab");
    if (urlTab === "files" || urlTab === "topics" || urlTab === "coverage") {
      setTab(urlTab);
    }
  }, [materialsLoaded, projectLoaded]);

  const isLoaded = projectLoaded && materialsLoaded;

  if (!isLoaded) {
    return <CenteredNotice>Loading materials…</CenteredNotice>;
  }

  if (!project) {
    return (
      <PageShell width="max-w-lg">
        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
          Project not found
        </h1>
        <Link href="/projects" className={`${ghostLink} mt-4 -ml-3`}>
          Back to projects
        </Link>
      </PageShell>
    );
  }

  const base = `/projects/${params.projectId}`;
  const savedCount = materials.filter(
    (m) => m.content.trim().length > 0
  ).length;
  const coverage = computeTopicCoverage(topics, materials, mistakes);
  const topicsWithMaterial = coverage.filter((row) => row.hasMaterials).length;
  const selectedTopic =
    topics.find((topic) => topic.id === selectedTopicId) ?? null;

  const statusSentence =
    topics.length === 0
      ? "Nothing uploaded yet. These are the sources Ivvy coaches you from."
      : `${savedCount} material${savedCount === 1 ? "" : "s"} · ${
          topics.length
        } topic${topics.length === 1 ? "" : "s"} · ${topicsWithMaterial} of ${
          topics.length
        } topics have material`;

  return (
    <ProjectShell projectId={params.projectId} active="materials">
      {/* Header — one upload affordance for the whole page */}
      <header className="flex flex-col gap-5 border-b border-[#E7E3DA] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[#1A1A17] sm:text-[32px]">
            Materials
          </h1>
          <p className="mt-2 text-sm text-[#56524B]">{statusSentence}</p>
        </div>
        <Link href={`${base}/materials/upload`} className={primaryAction}>
          Upload materials
        </Link>
      </header>

      {/* Tabs */}
      <div className="mb-8 mt-6 flex flex-wrap items-center gap-1 border-b border-[#E7E3DA]">
        {TABS.map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              aria-current={isActive ? "true" : undefined}
              className={`relative inline-flex h-10 items-center rounded-md px-3.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4] ${
                isActive
                  ? "font-medium text-[#1A1A17]"
                  : "text-[#7A766D] hover:bg-[#EFEBE2] hover:text-[#1A1A17]"
              }`}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2 -bottom-px h-[2px] ${
                  isActive ? "bg-[#1E4634]" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {tab === "files" ? (
        topics.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-md py-10 text-center">
              <h2 className="text-[20px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
                Ivvy hasn&apos;t seen your materials yet.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#56524B]">
                Upload your notes, slides, or a past paper once. Ivvy extracts
                your topics, sorts the material into them, and shows you the
                whole map before anything is saved.
              </p>
              <div className="mt-7 flex justify-center">
                <Link
                  href={`${base}/materials/upload`}
                  className={primaryAction}
                >
                  Upload materials
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            {/* Topic list */}
            <Reveal className="lg:col-span-4 xl:col-span-3">
              <aside>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className={LABEL}>Topics</p>
                  <span className="text-xs tabular-nums text-[#56524B]">
                    {savedCount} of {topics.length} filled
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {topics.map((topic) => {
                    const hasMaterial =
                      (getMaterialsForTopic(topic.id)?.content.trim().length ??
                        0) > 0;
                    const isActive = topic.id === selectedTopicId;
                    const isLocked = isParsing && !isActive;
                    return (
                      <li key={topic.id}>
                        <button
                          type="button"
                          onClick={() => selectTopic(topic.id)}
                          disabled={isLocked}
                          aria-current={isActive ? "true" : undefined}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-50 ${
                            isActive
                              ? "border-[#1E4634] bg-white"
                              : "border-[#E7E3DA] bg-white hover:border-[#D8D3C8] hover:bg-[#FBFAF7]"
                          }`}
                        >
                          <span className="truncate text-sm font-medium text-[#1A1A17]">
                            {topic.name}
                          </span>
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              hasMaterial ? "bg-[#1E4634]" : "bg-[#D8D3C8]"
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

            {/* Selected topic material editor */}
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
            <p className="max-w-2xl text-sm leading-relaxed text-[#56524B]">
              Topics define what Ivvy trains you on. The fastest way to build
              the map is to{" "}
              <Link
                href={`${base}/materials/upload`}
                className="font-medium text-[#1E4634] underline underline-offset-2 hover:text-[#16382A]"
              >
                upload materials
              </Link>{" "}
              and let Ivvy extract them; you can also add or remove topics by
              hand here.
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

      {tab === "coverage" ? (
        <Reveal>
          {coverage.length === 0 ? (
            <div className="mx-auto max-w-md py-10 text-center">
              <h2 className="text-[20px] font-medium leading-tight tracking-[-0.01em] text-[#1A1A17]">
                No topics to cover yet.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#56524B]">
                Upload materials and Ivvy will extract your topic map; coverage
                shows which topics Ivvy can actually coach from.
              </p>
              <div className="mt-7 flex justify-center">
                <Link
                  href={`${base}/materials/upload`}
                  className={primaryAction}
                >
                  Upload materials
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl space-y-6">
              {coverage.some((row) => !row.hasMaterials) ? (
                <p className="text-sm leading-relaxed text-[#56524B]">
                  {(() => {
                    const gap = coverage.find((row) => !row.hasMaterials);
                    return gap
                      ? `${gap.name} has no material. Ivvy can't coach what it can't see. `
                      : "";
                  })()}
                  <Link
                    href={`${base}/materials/upload`}
                    className="font-medium text-[#1E4634] underline-offset-2 hover:underline"
                  >
                    Upload notes for it
                  </Link>
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-[#56524B]">
                  Every topic has material. Ivvy can coach the whole exam.
                </p>
              )}
              <ul className="space-y-4">
                {coverage.map((row) => (
                  <li key={row.topicId}>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-medium text-[#1A1A17]">
                        {row.name}
                      </p>
                      <p className="shrink-0 text-xs text-[#7A766D]">
                        {row.state}
                        {row.dueCount > 0 ? ` · ${row.dueCount} due` : ""}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-[#EFEBE2]">
                      <div
                        className="h-1.5 rounded-full bg-[#1E4634] transition-[width] duration-500"
                        style={{ width: `${row.progressPercent}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      ) : null}
    </ProjectShell>
  );
}
